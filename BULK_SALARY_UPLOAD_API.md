# Bulk Salary Upload API — Integration Guide

> **Version**: 1.0  
> **Last Updated**: 2026-02-20  
> **Backend Contact**: Backend Team  

---

## Table of Contents

1. [Overview](#overview)
2. [Endpoint](#endpoint)
3. [Authentication](#authentication)
4. [Request Schema](#request-schema)
5. [Excel-to-JSON Column Mapping](#excel-to-json-column-mapping)
6. [Processing Logic](#processing-logic)
7. [Response Schema](#response-schema)
8. [Sample Request & Response](#sample-request--response)
9. [Error Handling](#error-handling)
10. [Constraints & Notes](#constraints--notes)

---

## Overview

This endpoint allows uploading a full month's salary sheet (typically exported from Excel) as a JSON payload. The backend will:

- **Find or auto-create** employees based on `employeeId` or `employeeName`
- **Calculate** salary components (gross, net, pro-rata if daily present is specified)
- **Handle advance** operations — both new advances given and recoveries (deductions)
- **Create salary records** for each employee for the specified month/year
- **Auto-generate expense records** for paid salaries
- **Update employee advance balances**
- **Return a comprehensive processing summary**

---

## Endpoint

| Property     | Value                              |
| ------------ | ---------------------------------- |
| **URL**      | `POST /employees/salaries/bulk-upload` |
| **Method**   | `POST`                             |
| **Content**  | `application/json`                 |

---

## Authentication

| Requirement  | Details                                                |
| ------------ | ------------------------------------------------------ |
| **Guard**    | `AccessTokenGuard` (JWT Bearer Token)                  |
| **Header**   | `Authorization: Bearer <access_token>`                 |
| **Roles**    | ADMIN or MANAGER (the `recordedBy` field on expenses is set to the authenticated user's ID) |

To obtain a token, use `POST /auth/login` with valid credentials.

---

## Request Schema

### Top-Level Body

```typescript
{
  month: number;       // 1–12
  year: number;        // e.g. 2025
  entries: SalaryEntry[];
}
```

### SalaryEntry Object

| Field            | Type     | Required | Description                                                                                 |
| ---------------- | -------- | -------- | ------------------------------------------------------------------------------------------- |
| `employeeId`     | `string` | No       | Employee ID from your system (e.g. `"EMP-00001"` or `"1"`). Numeric values are auto-mapped to `EMP-XXXXX` format. |
| `employeeName`   | `string` | **Yes**  | Full name of the employee. Used as fallback lookup and for auto-creation.                   |
| `basic`          | `number` | **Yes**  | Base salary amount.                                                                          |
| `joiningDate`    | `string` | No       | ISO 8601 date string (e.g. `"2025-01-12"`). Used only when auto-creating a new employee.    |
| `designation`    | `string` | No       | Job title. Used only when auto-creating. Defaults to `"Staff"`.                              |
| `monthlySalary`  | `number` | **Yes**  | The main monthly salary column value (e.g. the "Jun Salary" column from Excel).              |
| `medicalMobile`  | `number` | No       | Medical + mobile allowance. Mapped to `mobileAllowance`. Default: `0`.                       |
| `bonusBoksis`    | `number` | No       | Bonus for the month. Default: `0`.                                                           |
| `perDay`         | `number` | No       | Per-day rate from the sheet. **Server recalculates** as `basic / daysInMonth`.               |
| `dailyPresent`   | `number` | No       | Number of days present. If `> 0`, salary is pro-rated: `perDay × dailyPresent + allowances`. If `0` or omitted, full month is assumed. |
| `totalPayable`   | `number` | No       | Total payable from the sheet. If provided, used as gross salary; otherwise server-calculated. |
| `advance`        | `number` | No       | New advance given this month. `> 0` means new advance issued. Default: `0`.                  |
| `modeOfPayment`  | `string` | No       | Payment mode code. `"0"` = CASH, `"1"` = BANK_TRANSFER, `"2"` = CHEQUE, `"3"` = CARD. Default: `"0"`. |
| `balance`        | `number` | No       | Balance column from Excel. **Negative value** = advance recovery/deduction from salary. Default: `0`. |
| `signature`      | `any`    | No       | **Ignored** by the backend. Present for Excel compatibility.                                  |

---

## Excel-to-JSON Column Mapping

| Excel Column       | JSON Field       | Notes                                              |
| ------------------- | ---------------- | -------------------------------------------------- |
| SL/Employee No.     | `employeeId`     | Numeric → auto-padded to `EMP-XXXXX`               |
| Employee Name       | `employeeName`   | Required                                           |
| Basic               | `basic`          | Base salary                                        |
| Joining Date        | `joiningDate`    | ISO format: `YYYY-MM-DD`                           |
| Designation         | `designation`    | Job title                                          |
| Jun Salary (etc.)   | `monthlySalary`  | The month's salary column                          |
| Medical/Mobile      | `medicalMobile`  | Allowances column                                  |
| Bonus/Boksis        | `bonusBoksis`    | Monthly bonus                                      |
| Per Day             | `perDay`         | Informational; recalculated server-side             |
| Daily Present       | `dailyPresent`   | `0` = full month; `> 0` = pro-rated                |
| Total Payable       | `totalPayable`   | Override gross salary; otherwise auto-calculated    |
| Advance             | `advance`        | New advance given (positive number)                 |
| Mode of Payment     | `modeOfPayment`  | `"0"`, `"1"`, `"2"`, `"3"` — see mapping above     |
| Balance             | `balance`        | Negative = recovery from salary                     |
| Signature           | `signature`      | **Ignored**                                         |

---

## Processing Logic

For **each entry** in the `entries` array, the server performs these steps inside a database transaction:

### 1. Employee Resolution
```
IF employeeId provided → look up by employeeId (numeric auto-mapped to EMP-XXXXX)
IF not found → look up by employeeName (case-insensitive)
IF still not found → auto-create employee with provided basic, joiningDate, designation
```

### 2. Duplicate Check
- If a salary record already exists for `(employeeId, month, year)`, the row is **rejected** with a conflict error.

### 3. Salary Calculation
```
daysInMonth = calendar days of the month
perDay = basic / daysInMonth

IF dailyPresent > 0:
    calculatedPayable = perDay × dailyPresent + medicalMobile + bonusBoksis
ELSE:
    calculatedPayable = monthlySalary + medicalMobile + bonusBoksis

grossSalary = totalPayable (if provided) OR calculatedPayable
```

### 4. Advance Handling
```
currentBalance = employee.advanceBalance

IF advance > 0:
    → Create EmployeeAdvance record (type: GIVEN)
    → newBalance += advance

IF balance < 0:
    advanceDeduction = |balance|
    → Create EmployeeAdvance record (type: RECOVERED, linked to salary)
    → newBalance -= advanceDeduction

netSalary = grossSalary - advanceDeduction
employee.advanceBalance = max(newBalance, 0)
```

### 5. Salary Record Creation
```
Salary {
    baseSalary:       basic
    allowances:       medicalMobile
    bonus:            bonusBoksis (if > 0)
    advanceDeduction: recovery amount (if any)
    grossSalary:      totalPayable / calculated
    netSalary:        grossSalary - advanceDeduction
    status:           PAID
    paymentMethod:    mapped from modeOfPayment
    paidDate:         current timestamp
}
```

### 6. Expense Auto-Generation
For each paid salary, an `Expense` record is created:
```
Expense {
    title:           "Salary for {name} - {Month} {Year}"
    amount:          netSalary
    category:        SALARY
    status:          APPROVED
    isAutoGenerated: true
    salaryId:        linked salary ID
    recordedBy:      authenticated user ID
}
```

---

## Response Schema

### Success Response — `200 OK`

```typescript
{
  statusCode: 200,
  message: "Bulk salary upload processed successfully",
  data: {
    success: true,
    month: number,
    year: number,
    monthName: string,               // e.g. "June"
    processedRows: number,           // Successfully processed count
    createdSalaries: string[],       // Array of salary record IDs
    createdExpenses: string[],       // Array of expense record IDs
    createdEmployees: string[],      // Array of auto-created employee IDs (e.g. "EMP-00006")
    errors: [                        // Rows that failed
      {
        row: number,                 // 1-based row index
        employeeName: string,
        reason: string
      }
    ],
    updatedAdvanceBalances: {        // employeeId → new balance
      "EMP-00001": 5000,
      "EMP-00003": 0
    },
    summary: {
      totalRows: number,
      processed: number,
      failed: number,
      salariesCreated: number,
      expensesCreated: number,
      employeesCreated: number
    }
  }
}
```

### Partial Success

The endpoint processes rows **individually**. If some rows fail (e.g. duplicate salary), others still succeed. Check the `errors` array and `summary.failed` count.

---

## Sample Request & Response

### Request

```http
POST /employees/salaries/bulk-upload HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "month": 6,
  "year": 2025,
  "entries": [
    {
      "employeeId": "1",
      "employeeName": "MR.ANTOR",
      "basic": 20500,
      "joiningDate": "2025-01-12",
      "designation": "PRINT MASTER",
      "monthlySalary": 20000,
      "medicalMobile": 500,
      "bonusBoksis": 0,
      "perDay": 683.33,
      "dailyPresent": 0,
      "totalPayable": 20500,
      "advance": 0,
      "modeOfPayment": "0",
      "balance": 0,
      "signature": 10000
    },
    {
      "employeeId": "2",
      "employeeName": "MR.PARVEZ",
      "basic": 18000,
      "joiningDate": "2024-06-01",
      "designation": "OPERATOR",
      "monthlySalary": 18000,
      "medicalMobile": 500,
      "bonusBoksis": 0,
      "perDay": 600,
      "dailyPresent": 0,
      "totalPayable": 18500,
      "advance": 2000,
      "modeOfPayment": "1",
      "balance": -750,
      "signature": 8000
    },
    {
      "employeeId": "3",
      "employeeName": "MS.FATIMA",
      "basic": 25000,
      "joiningDate": "2024-03-15",
      "designation": "DESIGNER",
      "monthlySalary": 25000,
      "medicalMobile": 1000,
      "bonusBoksis": 5000,
      "perDay": 833.33,
      "dailyPresent": 20,
      "totalPayable": 22666.6,
      "advance": 0,
      "modeOfPayment": "0",
      "balance": 0,
      "signature": 15000
    }
  ]
}
```

### Response

```json
{
  "statusCode": 200,
  "message": "Bulk salary upload processed successfully",
  "data": {
    "success": true,
    "month": 6,
    "year": 2025,
    "monthName": "June",
    "processedRows": 3,
    "createdSalaries": [
      "cm1abc123def456",
      "cm2ghi789jkl012",
      "cm3mno345pqr678"
    ],
    "createdExpenses": [
      "cm4stu901uvw234",
      "cm5xyz567abc890",
      "cm6def123ghi456"
    ],
    "createdEmployees": [],
    "errors": [],
    "updatedAdvanceBalances": {
      "EMP-00001": 0,
      "EMP-00002": 1250,
      "EMP-00003": 0
    },
    "summary": {
      "totalRows": 3,
      "processed": 3,
      "failed": 0,
      "salariesCreated": 3,
      "expensesCreated": 3,
      "employeesCreated": 0
    }
  }
}
```

---

## Error Handling

### HTTP Status Codes

| Status | When                                                                 |
| ------ | -------------------------------------------------------------------- |
| `200`  | All or some rows processed successfully (check `errors` array)       |
| `400`  | Invalid request body (validation failure, missing required fields)    |
| `401`  | Missing or invalid JWT token                                         |
| `500`  | Unexpected server error                                              |

### Row-Level Errors

Individual row failures do **not** cause the entire request to fail. Each failed row is reported in the `errors` array:

```json
{
  "errors": [
    {
      "row": 4,
      "employeeName": "MR.HASAN",
      "reason": "Salary already exists for MR.HASAN for June 2025 (ID: cm7abc...)"
    }
  ]
}
```

### Common Error Reasons

| Reason                                    | Cause                                                    |
| ----------------------------------------- | -------------------------------------------------------- |
| `Salary already exists for ... for ...`   | Duplicate salary for same employee + month + year        |
| `Employee not found and auto-create failed` | Missing required fields for employee creation            |
| Validation errors                         | Invalid data types, missing `employeeName` or `basic`    |

---

## Constraints & Notes

### Data Types & Precision
- All monetary values are `Float` (double precision). Frontend should round display to 2 decimal places.
- `month` must be `1–12`. `year` must be a 4-digit year.
- `perDay` is recalculated server-side as `basic / daysInMonth` regardless of what's sent.

### Date Formats
- `joiningDate` must be an ISO 8601 date string: `"YYYY-MM-DD"` (e.g., `"2025-01-12"`).

### Employee Auto-Creation
- If an employee is not found by `employeeId` or `employeeName`, a new employee record is created automatically.
- Auto-created employees get a generated `employeeId` (e.g., `EMP-00006`), an auto-generated email, and the `designation`/`basic`/`joiningDate` from the entry.
- Check `createdEmployees` in the response to see which employees were auto-created.

### Advance Logic
- `advance > 0`: New advance money given to the employee this month. Increases `advanceBalance`.
- `balance < 0` (negative): Amount recovered/deducted from this salary. Decreases `advanceBalance`.
- Both can happen in the same row (give advance AND recover from salary).
- `advanceBalance` is floored at `0` — it never goes negative.

### Idempotency
- The endpoint is **NOT idempotent**. Uploading the same sheet twice will fail for already-processed employees (duplicate salary conflict).
- The `reference` field on each salary is set to `BULK-{month}-{year}-R{rowIndex}` for traceability.

### Payment Mode Mapping

| Excel Value | Backend Enum     |
| ----------- | ---------------- |
| `"0"`       | `CASH`           |
| `"1"`       | `BANK_TRANSFER`  |
| `"2"`       | `CHEQUE`         |
| `"3"`       | `CARD`           |
| (default)   | `CASH`           |

### Transaction Safety
- Each row is processed in its own database transaction. If a row fails mid-processing, all changes for **that row** are rolled back. Other rows are unaffected.

### Frontend Workflow Recommendation
1. Parse the Excel file client-side (using a library like `xlsx` / `SheetJS`).
2. Map columns to the JSON schema above.
3. Set `month` and `year` from the sheet title or a date picker.
4. POST to `/employees/salaries/bulk-upload`.
5. Display `summary` to the user. Show `errors` array if any rows failed.
6. Optionally allow re-upload of only failed rows after fixing issues.
