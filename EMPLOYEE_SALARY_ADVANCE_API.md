# Employee Salary & Advance Balance API — Frontend Integration Guide

## Overview

A professional salary management system with **advance balance tracking**. The core concept:

1. **Give Advance** → employee's `advanceBalance` goes up.
2. **Pay Salary** → system auto-deducts advance from salary, `advanceBalance` goes down.
3. Frontend always sees the current `advanceBalance` on every employee and can control how much to deduct.

```
 Give ৳10,000 advance to Aftab
        │
        ▼
 advanceBalance: 0 → 10,000
        │
        │  ... next month ...
        ▼
 Salary grossSalary = ৳25,000
 advanceDeduction   = ৳10,000  (auto or manual)
 netPaid            = ৳15,000
 advanceBalance: 10,000 → 0
```

---

## Base URL

```
{{API_BASE}}/employees
```

---

## Table of Contents

1. [Give Advance](#1-give-advance)
2. [Get Advance History](#2-get-advance-history)
3. [Advance Overview (All Employees)](#3-advance-overview-all-employees)
4. [Adjust Advance (Manual Correction)](#4-adjust-advance)
5. [Salary Preview (Before Paying)](#5-salary-preview)
6. [Pay Salary (With Advance Deduction)](#6-pay-salary)
7. [TypeScript Interfaces](#7-typescript-interfaces)
8. [Frontend Integration Flow](#8-frontend-integration-flow)

---

## 1. Give Advance

Give advance money to an employee. Increases their `advanceBalance`.

### Request

```
POST /employees/:id/advance
Content-Type: application/json
```

### Request Body

```jsonc
{
  "amount": 10000,                      // Required — must be > 0
  "description": "Emergency advance",   // Optional
  "paymentMethod": "CASH",              // Optional — CASH | BANK_TRANSFER | CHEQUE | CARD
  "reference": "ADV-2026-001"           // Optional — receipt/transaction number
}
```

### Response `201 Created`

```jsonc
{
  "statusCode": 201,
  "message": "Advance given successfully",
  "data": {
    "success": true,
    "advance": {
      "id": "clxyz_adv_001",
      "employeeId": "clxyz_emp_001",
      "amount": 10000,
      "type": "GIVEN",
      "description": "Emergency advance",
      "paymentMethod": "CASH",
      "reference": "ADV-2026-001",
      "balanceAfter": 10000,
      "createdAt": "2026-02-07T10:00:00.000Z"
    },
    "employee": {
      "id": "clxyz_emp_001",
      "name": "Aftab Ahmed",
      "previousBalance": 0,
      "newBalance": 10000
    }
  }
}
```

### Errors

| Status | Message | When |
|--------|---------|------|
| `400` | `Advance amount must be greater than 0` | `amount` ≤ 0 |
| `404` | `Employee not found` | Invalid ID |

---

## 2. Get Advance History

Paginated transaction history for a single employee.

### Request

```
GET /employees/:id/advances?page=1&limit=20
```

### Response `200 OK`

```jsonc
{
  "statusCode": 200,
  "data": {
    "employee": {
      "id": "clxyz_emp_001",
      "name": "Aftab Ahmed",
      "advanceBalance": 5000         // Current live balance
    },
    "advances": [
      {
        "id": "clxyz_adv_002",
        "amount": 5000,
        "type": "RECOVERED",          // GIVEN | RECOVERED | ADJUSTMENT
        "description": "Recovered from January 2026 salary",
        "paymentMethod": null,
        "reference": null,
        "balanceAfter": 5000,
        "createdAt": "2026-01-31T00:00:00.000Z",
        "salary": { "month": 1, "year": 2026 }    // null if type != RECOVERED
      },
      {
        "id": "clxyz_adv_001",
        "amount": 10000,
        "type": "GIVEN",
        "description": "Emergency advance",
        "paymentMethod": "CASH",
        "reference": "ADV-2026-001",
        "balanceAfter": 10000,
        "createdAt": "2026-01-15T00:00:00.000Z",
        "salary": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 2,
      "pages": 1
    }
  }
}
```

---

## 3. Advance Overview (All Employees)

Dashboard view — shows every employee's advance balance at a glance.

### Request

```
GET /employees/advances/overview
```

### Response `200 OK`

```jsonc
{
  "statusCode": 200,
  "data": {
    "summary": {
      "totalOutstandingAdvance": 25000,   // Total advance owed by all employees
      "employeesWithAdvance": 3,          // How many employees currently have advance
      "totalActiveEmployees": 12
    },
    "employees": [
      {
        "id": "clxyz_emp_001",
        "employeeId": "EMP-00001",
        "name": "Aftab Ahmed",
        "designation": "Sales Executive",
        "advanceBalance": 10000,
        "lastAdvanceTransaction": {
          "amount": 10000,
          "type": "GIVEN",
          "createdAt": "2026-01-15T00:00:00.000Z"
        }
      },
      {
        "id": "clxyz_emp_002",
        "employeeId": "EMP-00002",
        "name": "Rafiq Islam",
        "designation": "Warehouse Manager",
        "advanceBalance": 15000,
        "lastAdvanceTransaction": {
          "amount": 15000,
          "type": "GIVEN",
          "createdAt": "2026-01-20T00:00:00.000Z"
        }
      }
    ]
  }
}
```

---

## 4. Adjust Advance

Manual correction of advance balance (e.g., write-off, data fix). Positive = increase, negative = decrease.

### Request

```
POST /employees/:id/advance/adjust
Content-Type: application/json
```

```jsonc
{
  "amount": -3000,                               // Negative = reduce balance
  "description": "Write-off approved by manager"  // Required
}
```

### Response `200 OK`

Same shape as [Give Advance response](#response-201-created), with `type: "ADJUSTMENT"`.

### Errors

| Status | Message | When |
|--------|---------|------|
| `400` | `Adjustment would result in negative balance. Current balance: 5000` | Would go below 0 |

---

## 5. Salary Preview

**Call this before paying**. Shows the salary breakdown + advance deduction projection.

### Request

```
GET /employees/:id/salary-preview?month=2&year=2026
```

### Response `200 OK`

```jsonc
{
  "statusCode": 200,
  "data": {
    "salary": {
      "id": "clxyz_sal_001",
      "month": 2,
      "year": 2026,
      "monthName": "February",
      "status": "PENDING",
      "baseSalary": 20000,
      "allowances": 5000,
      "overtimeHours": 0,
      "overtimeAmount": 0,
      "bonus": 0,
      "deductions": 0,
      "grossSalary": 25000,
      // These are null until status = PAID
      "advanceDeduction": null,
      "netSalary": null,
      "paidDate": null,
      "paymentMethod": null,
      "reference": null,
      "notes": null
    },
    "employee": {
      "id": "clxyz_emp_001",
      "employeeId": "EMP-00001",
      "name": "Aftab Ahmed",
      "designation": "Sales Executive",
      "advanceBalance": 10000,
      "baseSalary": 20000,
      "homeRentAllowance": 2000,
      "healthAllowance": 1000,
      "travelAllowance": 1000,
      "mobileAllowance": 500,
      "otherAllowances": 500
    },
    "advance": {
      "currentBalance": 10000,           // Live advance balance
      "suggestedDeduction": 10000,       // System recommendation (min of balance & gross)
      "netAfterDeduction": 15000,        // grossSalary - suggestedDeduction
      "maxDeduction": 10000              // Maximum allowed deduction
    }
  }
}
```

### Key Fields for the Pay Salary Form

| Field | Use |
|-------|-----|
| `salary.grossSalary` | Display as "Gross Salary" |
| `advance.currentBalance` | Show "Outstanding Advance: ৳10,000" |
| `advance.suggestedDeduction` | Pre-fill the advance deduction input |
| `advance.maxDeduction` | Set as `max` attribute on the deduction input |
| `advance.netAfterDeduction` | Live-calculate: `grossSalary - userDeduction` |

---

## 6. Pay Salary

Pay salary with advance deduction. The system handles the advance balance update in a single atomic transaction.

### Request

```
POST /employees/salaries/pay
Content-Type: application/json
```

### Request Body

```jsonc
{
  "employeeId": "clxyz_emp_001",         // Required
  "month": 2,                            // Required
  "year": 2026,                          // Required
  "paidDate": "2026-02-07",              // Required — ISO date
  "advanceDeduction": 10000,             // Optional — omit to auto-deduct full balance
  "paymentMethod": "BANK_TRANSFER",      // Optional — CASH | BANK_TRANSFER | CHEQUE | CARD
  "reference": "SAL-FEB-2026-001",       // Optional
  "notes": "February salary with full advance recovery"  // Optional
}
```

#### `advanceDeduction` Behavior

| Value | Behavior |
|-------|----------|
| **Omitted** | Auto-deducts `min(advanceBalance, grossSalary)` — recovers as much as possible |
| `0` | No advance deduction — pay full gross salary |
| `5000` | Deduct exactly ৳5,000 from advance (partial recovery) |
| `10000` | Deduct exactly ৳10,000 (full recovery if balance = 10,000) |

### Response `200 OK`

```jsonc
{
  "statusCode": 200,
  "message": "Salary paid successfully",
  "data": {
    "success": true,
    
    "salary": {
      "id": "clxyz_sal_001",
      "month": 2,
      "year": 2026,
      "baseSalary": 20000,
      "allowances": 5000,
      "overtimeAmount": 0,
      "bonus": 0,
      "deductions": 0,
      "grossSalary": 25000,
      "advanceDeduction": 10000,
      "netSalary": 15000,
      "status": "PAID",
      "paidDate": "2026-02-07T00:00:00.000Z",
      "paymentMethod": "BANK_TRANSFER",
      "reference": "SAL-FEB-2026-001",
      "notes": "February salary with full advance recovery"
    },

    "advanceDeduction": {
      "deducted": 10000,
      "previousBalance": 10000,
      "newBalance": 0,
      "recoveryRecord": {
        "id": "clxyz_adv_003",
        "amount": 10000,
        "type": "RECOVERED",
        "description": "Recovered from February 2026 salary",
        "balanceAfter": 0,
        "salaryId": "clxyz_sal_001"
      }
    },

    "payment": {
      "grossSalary": 25000,
      "advanceDeducted": 10000,
      "netPaid": 15000,
      "paymentMethod": "BANK_TRANSFER",
      "reference": "SAL-FEB-2026-001"
    },

    "employee": {
      "id": "clxyz_emp_001",
      "name": "Aftab Ahmed",
      "designation": "Sales Executive"
    }
  }
}
```

### Errors

| Status | Message | When |
|--------|---------|------|
| `400` | `Advance deduction cannot be negative` | Negative value |
| `400` | `Advance deduction (15000) exceeds current advance balance (10000)` | Deduction > balance |
| `400` | `Advance deduction (30000) cannot exceed gross salary (25000)` | Deduction > salary |
| `404` | `Salary record not found` | No record for this month/year |
| `409` | `Salary already paid` | Already marked PAID |

---

## 7. TypeScript Interfaces

```typescript
// ──────────────── Enums ────────────────

type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'CHEQUE' | 'CARD';
type AdvanceType = 'GIVEN' | 'RECOVERED' | 'ADJUSTMENT';
type SalaryStatus = 'PENDING' | 'PAID' | 'CANCELLED';

// ──────────────── Give Advance ────────────────

interface GiveAdvanceRequest {
  amount: number;                       // > 0
  description?: string;
  paymentMethod?: PaymentMethod;
  reference?: string;
}

interface GiveAdvanceResponse {
  success: boolean;
  advance: AdvanceRecord;
  employee: {
    id: string;
    name: string;
    previousBalance: number;
    newBalance: number;
  };
}

// ──────────────── Adjust Advance ────────────────

interface AdjustAdvanceRequest {
  amount: number;                       // positive = increase, negative = decrease
  description: string;                  // required
}

// ──────────────── Advance Record ────────────────

interface AdvanceRecord {
  id: string;
  employeeId: string;
  amount: number;
  type: AdvanceType;
  description: string | null;
  paymentMethod: PaymentMethod | null;
  reference: string | null;
  balanceAfter: number;
  createdAt: string;                    // ISO 8601
  salary?: { month: number; year: number } | null;
}

// ──────────────── Advance Overview ────────────────

interface AdvanceOverviewResponse {
  summary: {
    totalOutstandingAdvance: number;
    employeesWithAdvance: number;
    totalActiveEmployees: number;
  };
  employees: {
    id: string;
    employeeId: string;
    name: string;
    designation: string;
    advanceBalance: number;
    lastAdvanceTransaction: {
      amount: number;
      type: AdvanceType;
      createdAt: string;
    } | null;
  }[];
}

// ──────────────── Salary Preview ────────────────

interface SalaryPreviewResponse {
  salary: {
    id: string;
    month: number;
    year: number;
    monthName: string;
    status: SalaryStatus;
    baseSalary: number;
    allowances: number;
    overtimeHours: number | null;
    overtimeAmount: number | null;
    bonus: number | null;
    deductions: number | null;
    grossSalary: number;
    advanceDeduction: number | null;     // null if PENDING
    netSalary: number | null;            // null if PENDING
    paidDate: string | null;
    paymentMethod: PaymentMethod | null;
    reference: string | null;
    notes: string | null;
  };
  employee: {
    id: string;
    employeeId: string;
    name: string;
    designation: string;
    advanceBalance: number;
    baseSalary: number;
    homeRentAllowance: number;
    healthAllowance: number;
    travelAllowance: number;
    mobileAllowance: number;
    otherAllowances: number;
  };
  advance: {
    currentBalance: number;
    suggestedDeduction: number;
    netAfterDeduction: number;
    maxDeduction: number;
  };
}

// ──────────────── Pay Salary ────────────────

interface PaySalaryRequest {
  employeeId: string;
  month: number;
  year: number;
  paidDate: string;                      // ISO date
  advanceDeduction?: number;             // omit = auto-deduct
  paymentMethod?: PaymentMethod;
  reference?: string;
  notes?: string;
}

interface PaySalaryResponse {
  success: boolean;
  salary: {
    id: string;
    month: number;
    year: number;
    baseSalary: number;
    allowances: number;
    overtimeAmount: number;
    bonus: number;
    deductions: number;
    grossSalary: number;
    advanceDeduction: number;
    netSalary: number;
    status: 'PAID';
    paidDate: string;
    paymentMethod: PaymentMethod | null;
    reference: string | null;
    notes: string | null;
  };
  advanceDeduction: {
    deducted: number;
    previousBalance: number;
    newBalance: number;
    recoveryRecord: AdvanceRecord | null;
  };
  payment: {
    grossSalary: number;
    advanceDeducted: number;
    netPaid: number;
    paymentMethod: PaymentMethod | null;
    reference: string | null;
  };
  employee: {
    id: string;
    name: string;
    designation: string;
  };
}
```

---

## 8. Frontend Integration Flow

### Pay Salary with Advance Deduction

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  Step 1: GET /employees/payables/salaries?month=2&year=2026    │
│          └─ List all unpaid salaries with advance info         │
│                                                                │
│  Step 2: User clicks "Pay" on Aftab's salary                  │
│          GET /employees/:id/salary-preview?month=2&year=2026   │
│          └─ Show full salary breakdown + advance projection    │
│                                                                │
│  Step 3: Show Payment Form                                     │
│          ┌────────────────────────────────────────┐            │
│          │ Gross Salary:        ৳25,000           │            │
│          │ Advance Balance:     ৳10,000           │            │
│          │                                        │            │
│          │ Advance Deduction: [ 10,000 ▼ ]        │ ← editable │
│          │   (max: ৳10,000)                       │            │
│          │                                        │            │
│          │ Net Pay:             ৳15,000            │ ← live calc│
│          │                                        │            │
│          │ Payment Method: [ Bank Transfer ▼ ]    │            │
│          │ Reference:      [ SAL-FEB-001     ]    │            │
│          │ Notes:          [ ________________ ]   │            │
│          │ Paid Date:      [ 2026-02-07      ]    │            │
│          │                                        │            │
│          │         [ Pay Salary ]                  │            │
│          └────────────────────────────────────────┘            │
│                                                                │
│  Step 4: POST /employees/salaries/pay                          │
│          └─ Show success toast + updated balance               │
│                                                                │
│  Step 5: Refresh payables list                                 │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Give Advance Flow

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  Step 1: GET /employees/advances/overview                      │
│          └─ Dashboard: all employees with their balances       │
│                                                                │
│  Step 2: User clicks "Give Advance" on an employee             │
│          ┌────────────────────────────────────────┐            │
│          │ Employee: Aftab Ahmed                  │            │
│          │ Current Advance: ৳0                    │            │
│          │                                        │            │
│          │ Amount:       [ 10,000     ]            │            │
│          │ Method:       [ Cash ▼     ]            │            │
│          │ Description:  [ Emergency   ]           │            │
│          │ Reference:    [ ADV-001     ]           │            │
│          │                                        │            │
│          │         [ Give Advance ]                │            │
│          └────────────────────────────────────────┘            │
│                                                                │
│  Step 3: POST /employees/:id/advance                           │
│          └─ Show new balance in toast                          │
│                                                                │
│  Step 4: Refresh overview                                      │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Sample React Code

```tsx
// ── Give Advance ──
const giveAdvance = async (employeeId: string) => {
  const { data } = await axios.post(`/employees/${employeeId}/advance`, {
    amount: 10000,
    description: 'Emergency advance',
    paymentMethod: 'CASH',
    reference: 'ADV-2026-001',
  });

  toast.success(
    `৳${data.data.advance.amount} advance given to ${data.data.employee.name}. ` +
    `New balance: ৳${data.data.employee.newBalance}`
  );
};

// ── Salary Preview (before paying) ──
const preview = await axios.get(
  `/employees/${employeeId}/salary-preview?month=2&year=2026`
);
const { grossSalary } = preview.data.data.salary;
const { currentBalance, suggestedDeduction, maxDeduction } = preview.data.data.advance;

// ── Pay Salary ──
const paySalary = async (form: PaySalaryRequest) => {
  const { data } = await axios.post('/employees/salaries/pay', form);
  const { payment, advanceDeduction } = data.data;

  toast.success(
    `Paid ৳${payment.netPaid} to ${data.data.employee.name}. ` +
    `Advance deducted: ৳${payment.advanceDeducted}. ` +
    `Remaining advance: ৳${advanceDeduction.newBalance}`
  );
};
```

---

## API Endpoint Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/employees/:id/advance` | Give advance to employee |
| `POST` | `/employees/:id/advance/adjust` | Manual balance adjustment |
| `GET` | `/employees/:id/advances?page=&limit=` | Advance history (paginated) |
| `GET` | `/employees/advances/overview` | All employees advance balances |
| `GET` | `/employees/:id/salary-preview?month=&year=` | Salary + advance breakdown |
| `POST` | `/employees/salaries/pay` | Pay salary with advance deduction |
| `POST` | `/employees/salaries/generate-monthly?month=&year=` | Bulk generate salary records |
| `GET` | `/employees/payables/salaries?month=&year=` | Unpaid/paid salary list with advance info |
| `GET` | `/employees/statistics/salaries?month=&year=` | Salary + advance statistics |
| `GET` | `/employees/trends/salaries?year=` | Monthly trends with advance deductions |

---

## Database Schema (New / Changed)

### Employee (updated)
```
+ advanceBalance  Float  @default(0)   ← running total of outstanding advance
```

### Salary (updated)
```
+ advanceDeduction  Float  @default(0)   ← how much advance was deducted this paycheck
+ grossSalary       Float  @default(0)   ← salary before advance deduction
+ paymentMethod     PaymentMethod?       ← how salary was paid
+ reference         String?              ← transaction reference
+ notes             String?              ← payment notes
```

### EmployeeAdvance (new)
```
id             String         @id @default(cuid())
employeeId     String         → Employee
amount         Float          ← transaction amount
type           AdvanceType    ← GIVEN | RECOVERED | ADJUSTMENT
description    String?
paymentMethod  PaymentMethod?
reference      String?
balanceAfter   Float          ← balance after this transaction
salaryId       String?        → Salary (if type = RECOVERED)
createdAt      DateTime
```
