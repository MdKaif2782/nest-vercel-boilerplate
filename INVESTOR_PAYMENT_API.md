# Investor Payment API — Frontend Integration Guide

## Overview

This document covers the two endpoints needed to **view an investor's due summary** and **pay an investor their due profit**. The flow is:

1. Fetch the investor's due summary → display financial breakdown.
2. User enters a payment amount → submit payment.

---

## Base URL

```
{{API_BASE}}/investors
```

---

## 1. Get Investor Due Summary

Returns a comprehensive financial breakdown of the investor including total investment, revenue generated, profit earned, amounts already paid, total outstanding due, and the amount **payable right now** (based on collected sales only).

### Request

```
GET /investors/:id/due-summary
```

| Param | Type   | Location | Description          |
| ----- | ------ | -------- | -------------------- |
| `id`  | string | path     | The investor's CUID  |

### Example

```http
GET /investors/clxyz1234abcde/due-summary
```

### Response `200 OK`

```jsonc
{
  // ── Investor Info ──
  "investor": {
    "id": "clxyz1234abcde",
    "name": "Kaif Ibn Zaman",
    "email": "kaif@example.com",
    "phone": "+8801700000000",
    "taxId": "TAX-12345",
    "bankAccount": "1234567890",
    "bankName": "DBBL",
    "joinDate": "2025-06-01T00:00:00.000Z",
    "status": "Active"
  },

  // ── Summary (use this for the payment UI) ──
  "summary": {
    "totalInvestment": 500000,        // Total capital invested across all POs
    "totalRevenue": 720000,           // Total revenue generated from all sales
    "totalCollected": 600000,         // Revenue actually collected (cash received)
    "totalProfitEarned": 108000,      // Investor's share of total revenue (based on profit %)
    "totalPaid": 50000,               // Amount already paid to the investor
    "totalDue": 58000,                // totalProfitEarned - totalPaid
    "payableNow": 40000,              // Max amount you can pay RIGHT NOW (from collected cash only)
    "overallROI": 11.6,               // Return on Investment percentage
    "collectionEfficiency": 83.33,    // % of revenue that has been collected
    "activeInvestments": 2            // Number of POs still in progress
  },

  // ── Per-PO Investment Breakdown ──
  "investmentBreakdown": [
    {
      "investmentId": "inv_001",
      "poId": "po_001",
      "poNumber": "PO-2025-001",
      "vendorName": "Vendor A",
      "investmentAmount": 300000,
      "profitPercentage": 15,           // Investor gets 15% of revenue from this PO
      "poStatus": "RECEIVED",           // ORDERED | SHIPPED | RECEIVED | CANCELLED
      "orderDate": "2025-07-01T00:00:00.000Z",
      "receivedDate": "2025-07-15T00:00:00.000Z",
      "poCost": 300000,
      "poRevenue": 420000,
      "poCollected": 350000,
      "poProfit": 63000,                // poRevenue × profitPercentage
      "poPayableNow": 52500,            // poCollected × profitPercentage
      "roi": 40.0,
      "profitEarned": 63000,
      "payableNow": 52500,
      "products": [
        {
          "productName": "Widget A",
          "quantity": 100,
          "unitPrice": 3000,
          "totalPrice": 300000
        }
      ]
    }
  ],

  // ── Product-Level Sales Breakdown ──
  "productSales": [
    {
      "poId": "po_001",
      "poNumber": "PO-2025-001",
      "productName": "Widget A",
      "productCode": "WA-100",
      "purchasePrice": 3000,
      "expectedSalePrice": 4200,
      "totalSold": 80,
      "totalRevenue": 336000,
      "customers": ["ABC Corp", "Retail Customer"]
    }
  ],

  // ── Payment History ──
  "paymentHistory": [
    {
      "id": "pay_001",
      "amount": 50000,
      "paymentDate": "2025-08-10T00:00:00.000Z",
      "description": "Payment for profits from sales",
      "paymentMethod": "BANK_TRANSFER",    // CASH | BANK_TRANSFER | CHEQUE | CARD | null
      "reference": "TRX-9876"
    }
  ],

  // ── Recent Activity (latest 10) ──
  "recentActivity": [
    {
      "type": "PAYMENT_RECEIVED",          // or "PO_RECEIVED"
      "date": "2025-08-10T00:00:00.000Z",
      "description": "Payment received - Payment for profits from sales",
      "amount": 50000,
      "method": "BANK_TRANSFER"
    }
  ]
}
```

### Key Fields for the Payment Form

| Field                      | Meaning                                                                  |
| -------------------------- | ------------------------------------------------------------------------ |
| `summary.totalDue`         | Total outstanding amount the investor is owed                            |
| `summary.payableNow`       | **Maximum** amount you can pay right now (limited to collected cash)      |
| `summary.totalPaid`        | Amount already paid historically                                         |
| `summary.totalProfitEarned`| Investor's total earned profit (from all their PO investments)           |

> **Important:** `payableNow` ≤ `totalDue`. You can only pay from cash that has actually been collected from customers. The API will reject amounts exceeding `payableNow`.

### Error Responses

| Status | Body                                                  | When                    |
| ------ | ----------------------------------------------------- | ----------------------- |
| `404`  | `{ "message": "Investor not found" }`                 | Invalid investor ID     |

---

## 2. Pay Investor

Records a profit payment to the investor. The amount is validated against `payableNow`.

### Request

```
POST /investors/:id/pay
Content-Type: application/json
```

| Param | Type   | Location | Description         |
| ----- | ------ | -------- | ------------------- |
| `id`  | string | path     | The investor's CUID |

### Request Body

```jsonc
{
  "amount": 40000,                      // Required — must be > 0 and ≤ payableNow
  "description": "July profit payout",  // Optional — defaults to "Payment for profits from sales"
  "paymentMethod": "BANK_TRANSFER",     // Optional — enum: see below
  "reference": "TRX-2025-123"           // Optional — transaction/cheque reference number
}
```

#### `paymentMethod` Enum Values

| Value            | Description       |
| ---------------- | ----------------- |
| `CASH`           | Cash payment      |
| `BANK_TRANSFER`  | Bank transfer     |
| `CHEQUE`         | Cheque payment    |
| `CARD`           | Card payment      |
| *(omit / null)*  | Not specified     |

### Example

```http
POST /investors/clxyz1234abcde/pay
Content-Type: application/json

{
  "amount": 40000,
  "description": "July 2025 profit distribution",
  "paymentMethod": "BANK_TRANSFER",
  "reference": "TRX-2025-123"
}
```

### Response `201 Created`

```jsonc
{
  "success": true,

  "payment": {
    "id": "pay_002",
    "investorId": "clxyz1234abcde",
    "amount": 40000,
    "paymentDate": "2025-08-15T12:00:00.000Z",
    "description": "July 2025 profit distribution",
    "paymentMethod": "BANK_TRANSFER",
    "reference": "TRX-2025-123"
  },

  "newBalance": {
    "previousDue": 58000,               // totalDue before this payment
    "newDue": 18000,                     // totalDue after this payment
    "remainingPayable": 0               // payableNow after this payment
  },

  "investor": {
    "id": "clxyz1234abcde",
    "name": "Kaif Ibn Zaman",
    "email": "kaif@example.com",
    "phone": "+8801700000000",
    "taxId": "TAX-12345",
    "bankAccount": "1234567890",
    "bankName": "DBBL",
    "joinDate": "2025-06-01T00:00:00.000Z",
    "status": "Active"
  }
}
```

### Error Responses

| Status | Body                                                                                     | When                                |
| ------ | ---------------------------------------------------------------------------------------- | ----------------------------------- |
| `400`  | `{ "message": "Invalid amount" }`                                                        | `amount` ≤ 0                        |
| `400`  | `{ "message": "You can only pay up to 40000 BDT right now. Available from collected sales." }` | `amount` > `payableNow`        |
| `404`  | `{ "message": "Investor not found" }`                                                    | Invalid investor ID                 |

---

## Frontend Integration Flow

### Recommended UI Steps

```
┌─────────────────────────────────────────────────┐
│  1. GET /investors/:id/due-summary              │
│     └─ Display investor info + summary card     │
│                                                 │
│  2. Show Payment Form                           │
│     ├─ Amount input (max = summary.payableNow)  │
│     ├─ Payment Method dropdown                  │
│     ├─ Description text field                   │
│     └─ Reference text field                     │
│                                                 │
│  3. POST /investors/:id/pay                     │
│     └─ Show success + newBalance                │
│                                                 │
│  4. Re-fetch due-summary to refresh the UI      │
└─────────────────────────────────────────────────┘
```

### TypeScript Interfaces

```typescript
// ── Request ──
interface PayInvestorRequest {
  amount: number;
  description?: string;
  paymentMethod?: 'CASH' | 'BANK_TRANSFER' | 'CHEQUE' | 'CARD';
  reference?: string;
}

// ── Response ──
interface PayInvestorResponse {
  success: boolean;
  payment: {
    id: string;
    investorId: string;
    amount: number;
    paymentDate: string;          // ISO 8601
    description: string | null;
    paymentMethod: string | null;
    reference: string | null;
  };
  newBalance: {
    previousDue: number;
    newDue: number;
    remainingPayable: number;
  };
  investor: InvestorInfo;
}

interface InvestorInfo {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  taxId: string | null;
  bankAccount: string | null;
  bankName: string | null;
  joinDate: string;              // ISO 8601
  status: 'Active' | 'Inactive';
}

// ── Due Summary ──
interface DueSummary {
  investor: InvestorInfo;
  summary: {
    totalInvestment: number;
    totalRevenue: number;
    totalCollected: number;
    totalProfitEarned: number;
    totalPaid: number;
    totalDue: number;
    payableNow: number;
    overallROI: number;
    collectionEfficiency: number;
    activeInvestments: number;
  };
  investmentBreakdown: InvestmentBreakdownItem[];
  productSales: ProductSaleItem[];
  paymentHistory: PaymentHistoryItem[];
  recentActivity: ActivityItem[];
}

interface InvestmentBreakdownItem {
  investmentId: string;
  poId: string;
  poNumber: string;
  vendorName: string;
  investmentAmount: number;
  profitPercentage: number;
  poStatus: 'ORDERED' | 'SHIPPED' | 'RECEIVED' | 'CANCELLED';
  orderDate: string;
  receivedDate: string | null;
  poCost: number;
  poRevenue: number;
  poCollected: number;
  poProfit: number;
  poPayableNow: number;
  roi: number;
  profitEarned: number;
  payableNow: number;
  products: {
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
}

interface ProductSaleItem {
  poId: string;
  poNumber: string;
  productName: string;
  productCode: string;
  purchasePrice: number;
  expectedSalePrice: number;
  totalSold: number;
  totalRevenue: number;
  customers: string[];
}

interface PaymentHistoryItem {
  id: string;
  amount: number;
  paymentDate: string;
  description: string | null;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CHEQUE' | 'CARD' | null;
  reference: string | null;
}

interface ActivityItem {
  type: 'PAYMENT_RECEIVED' | 'PO_RECEIVED';
  date: string;
  description: string;
  amount: number;
  method?: string;
}
```

### Sample Frontend Code (React + Axios)

```tsx
// Fetch due summary
const { data: dueSummary } = await axios.get<DueSummary>(
  `/investors/${investorId}/due-summary`
);

// Display key values
const { payableNow, totalDue, totalPaid } = dueSummary.summary;

// Submit payment
const payInvestor = async (form: PayInvestorRequest) => {
  const { data } = await axios.post<PayInvestorResponse>(
    `/investors/${investorId}/pay`,
    form
  );

  if (data.success) {
    toast.success(`Paid ৳${data.payment.amount}. New due: ৳${data.newBalance.newDue}`);
    // Re-fetch summary to update the UI
    refetchDueSummary();
  }
};
```

### Validation Rules (Client-Side)

| Field           | Rule                                                  |
| --------------- | ----------------------------------------------------- |
| `amount`        | Required, number, `> 0`, `≤ summary.payableNow`       |
| `paymentMethod` | Optional, one of `CASH`, `BANK_TRANSFER`, `CHEQUE`, `CARD` |
| `description`   | Optional, string                                      |
| `reference`     | Optional, string (useful for bank transaction IDs)    |
