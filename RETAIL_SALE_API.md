# Retail Sale Module - API Documentation

## Overview
The Retail Sale module provides a Point of Sale (POS) system for direct inventory sales without requiring quotations, orders, or challans. It integrates seamlessly with the inventory, report, statistics, and investor modules.

## Base URL
```
/retail-sales
```

## Authentication
All endpoints require JWT authentication using the `AccessTokenGuard`.

---

## Endpoints

### 1. Create Retail Sale
**POST** `/retail-sales`

Creates a new retail sale and automatically decrements inventory.

**Request Payload:**
```json
{
  "items": [
    {
      "inventoryId": "clx1a2b3c4d5e6f7g8h9i0j1",
      "quantity": 3,
      "unitPrice": 250.00
    },
    {
      "inventoryId": "clx9z8y7x6w5v4u3t2s1r0q9",
      "quantity": 1,
      "unitPrice": 1500.00
    }
  ],
  "paymentMethod": "CASH",
  "discount": 50.00,
  "tax": 87.50,
  "customerName": "Ahmed Hassan",
  "customerPhone": "+8801712345678",
  "reference": null,
  "notes": "Walk-in customer, regular buyer"
}
```

**Field Descriptions:**
- `items` (required, array): List of items to sell
  - `inventoryId` (required, string): ID of the inventory item
  - `quantity` (required, number, min: 1): Quantity to sell
  - `unitPrice` (required, number, min: 0): Price per unit
- `paymentMethod` (required, enum): Payment method - "CASH", "BANK_TRANSFER", "CHEQUE", or "CARD"
- `discount` (optional, number, min: 0): Discount amount (default: 0)
- `tax` (optional, number, min: 0): Tax amount (default: 0)
- `customerName` (optional, string): Customer's name
- `customerPhone` (optional, string): Customer's phone number
- `reference` (optional, string): Payment reference number (for BANK_TRANSFER, CHEQUE, CARD)
- `notes` (optional, string): Additional notes

**Response JSON:**
```json
{
  "id": "clx5k6l7m8n9o0p1q2r3s4t5",
  "saleNumber": "RS-202601-0023",
  "saleDate": "2026-01-16T14:30:25.123Z",
  "customerName": "Ahmed Hassan",
  "customerPhone": "+8801712345678",
  "subtotal": 2250.00,
  "discount": 50.00,
  "tax": 87.50,
  "totalAmount": 2287.50,
  "paymentMethod": "CASH",
  "reference": null,
  "notes": "Walk-in customer, regular buyer",
  "createdAt": "2026-01-16T14:30:25.123Z",
  "updatedAt": "2026-01-16T14:30:25.123Z",
  "items": [
    {
      "id": "clx5k6l7m8n9o0p1q2r3s4t6",
      "quantity": 3,
      "unitPrice": 250.00,
      "totalPrice": 750.00,
      "inventory": {
        "id": "clx1a2b3c4d5e6f7g8h9i0j1",
        "productCode": "PROD-2024-001",
        "productName": "Samsung Galaxy A54 5G",
        "description": "128GB, Black Color"
      }
    },
    {
      "id": "clx5k6l7m8n9o0p1q2r3s4t7",
      "quantity": 1,
      "unitPrice": 1500.00,
      "totalPrice": 1500.00,
      "inventory": {
        "id": "clx9z8y7x6w5v4u3t2s1r0q9",
        "productCode": "PROD-2024-045",
        "productName": "Apple iPhone 13",
        "description": "256GB, Midnight"
      }
    }
  ]
}
```

**Response Field Descriptions:**
- `id`: Unique identifier for the sale
- `saleNumber`: Auto-generated sale number (format: RS-YYYYMM-####)
- `saleDate`: Date and time of sale
- `subtotal`: Sum of all item prices before discount and tax (2250.00)
- `discount`: Discount amount applied (50.00)
- `tax`: Tax amount applied (87.50)
- `totalAmount`: Final amount = subtotal - discount + tax (2287.50)
- `items`: Array of sold items with inventory details

---

### 2. Get All Retail Sales
**GET** `/retail-sales`

Retrieves paginated list of retail sales with optional filters.

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10) - Items per page
- `search` (string, optional) - Search by sale number or customer name
- `startDate` (ISO date string, optional) - Filter sales from this date (format: YYYY-MM-DD)
- `endDate` (ISO date string, optional) - Filter sales until this date (format: YYYY-MM-DD)
- `paymentMethod` (enum, optional) - Filter by payment method (CASH, BANK_TRANSFER, CHEQUE, CARD)

**Example Request:**
```
GET /retail-sales?page=1&limit=10&startDate=2026-01-01&endDate=2026-01-16&paymentMethod=CASH
```

**Response JSON:**
```json
{
  "sales": [
    {
      "id": "clx5k6l7m8n9o0p1q2r3s4t5",
      "saleNumber": "RS-202601-0023",
      "saleDate": "2026-01-16T14:30:25.123Z",
      "customerName": "Ahmed Hassan",
      "customerPhone": "+8801712345678",
      "subtotal": 2250.00,
      "discount": 50.00,
      "tax": 87.50,
      "totalAmount": 2287.50,
      "paymentMethod": "CASH",
      "reference": null,
      "notes": "Walk-in customer, regular buyer",
      "createdAt": "2026-01-16T14:30:25.123Z",
      "updatedAt": "2026-01-16T14:30:25.123Z",
      "items": [
        {
          "id": "clx5k6l7m8n9o0p1q2r3s4t6",
          "quantity": 3,
          "unitPrice": 250.00,
          "totalPrice": 750.00,
          "inventory": {
            "id": "clx1a2b3c4d5e6f7g8h9i0j1",
            "productCode": "PROD-2024-001",
            "productName": "Samsung Galaxy A54 5G",
            "description": "128GB, Black Color"
          }
        },
        {
          "id": "clx5k6l7m8n9o0p1q2r3s4t7",
          "quantity": 1,
          "unitPrice": 1500.00,
          "totalPrice": 1500.00,
          "inventory": {
            "id": "clx9z8y7x6w5v4u3t2s1r0q9",
            "productCode": "PROD-2024-045",
            "productName": "Apple iPhone 13",
            "description": "256GB, Midnight"
          }
        }
      ]
    },
    {
      "id": "clx5h6i7j8k9l0m1n2o3p4q5",
      "saleNumber": "RS-202601-0022",
      "saleDate": "2026-01-16T11:15:40.789Z",
      "customerName": "Fatima Rahman",
      "customerPhone": "+8801987654321",
      "subtotal": 850.00,
      "discount": 0.00,
      "tax": 42.50,
      "totalAmount": 892.50,
      "paymentMethod": "CARD",
      "reference": "CARD-TXN-456789",
      "notes": null,
      "createdAt": "2026-01-16T11:15:40.789Z",
      "updatedAt": "2026-01-16T11:15:40.789Z",
      "items": [
        {
          "id": "clx5h6i7j8k9l0m1n2o3p4q6",
          "quantity": 2,
          "unitPrice": 425.00,
          "totalPrice": 850.00,
          "inventory": {
            "id": "clx3b4c5d6e7f8g9h0i1j2k3",
            "productCode": "PROD-2024-089",
            "productName": "Sony WH-1000XM5 Headphones",
            "description": "Wireless, Noise Cancelling"
          }
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "pages": 5
  }
}
```

**Response Field Descriptions:**
- `sales`: Array of retail sale objects (same structure as Create Retail Sale response)
- `pagination`: Pagination metadata
  - `page`: Current page number
  - `limit`: Items per page
  - `total`: Total number of sales matching the filter
  - `pages`: Total number of pages

---

### 3. Get Retail Sale by ID
**GET** `/retail-sales/:id`

Retrieves a specific retail sale by its ID.

**Example Request:**
```
GET /retail-sales/clx5k6l7m8n9o0p1q2r3s4t5
```

**Response JSON:**
```json
{
  "id": "clx5k6l7m8n9o0p1q2r3s4t5",
  "saleNumber": "RS-202601-0023",
  "saleDate": "2026-01-16T14:30:25.123Z",
  "customerName": "Ahmed Hassan",
  "customerPhone": "+8801712345678",
  "subtotal": 2250.00,
  "discount": 50.00,
  "tax": 87.50,
  "totalAmount": 2287.50,
  "paymentMethod": "CASH",
  "reference": null,
  "notes": "Walk-in customer, regular buyer",
  "createdAt": "2026-01-16T14:30:25.123Z",
  "updatedAt": "2026-01-16T14:30:25.123Z",
  "items": [
    {
      "id": "clx5k6l7m8n9o0p1q2r3s4t6",
      "quantity": 3,
      "unitPrice": 250.00,
      "totalPrice": 750.00,
      "inventory": {
        "id": "clx1a2b3c4d5e6f7g8h9i0j1",
        "productCode": "PROD-2024-001",
        "productName": "Samsung Galaxy A54 5G",
        "description": "128GB, Black Color"
      }
    },
    {
      "id": "clx5k6l7m8n9o0p1q2r3s4t7",
      "quantity": 1,
      "unitPrice": 1500.00,
      "totalPrice": 1500.00,
      "inventory": {
        "id": "clx9z8y7x6w5v4u3t2s1r0q9",
        "productCode": "PROD-2024-045",
        "productName": "Apple iPhone 13",
        "description": "256GB, Midnight"
      }
    }
  ]
}
```

**Error Response (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Retail sale with ID clx5k6l7m8n9o0p1q2r3s4t5 not found",
  "error": "Not Found"
}
```

---

### 4. Get Retail Analytics
**GET** `/retail-sales/analytics`

Provides analytics and statistics for retail sales.

**Query Parameters:**
- `startDate` (ISO date string, optional) - Analytics from this date (format: YYYY-MM-DD)
- `endDate` (ISO date string, optional) - Analytics until this date (format: YYYY-MM-DD)

**Example Request:**
```
GET /retail-sales/analytics?startDate=2026-01-01&endDate=2026-01-16
```

**Response JSON:**
```json
{
  "summary": {
    "totalSales": 156,
    "totalRevenue": 487650.00,
    "totalTransactions": 156,
    "averageTransactionValue": 3125.32,
    "totalItemsSold": 423,
    "cashSales": 285000.00,
    "cardSales": 142500.00,
    "bankTransferSales": 57150.00,
    "chequeSales": 3000.00
  },
  "topProducts": [
    {
      "productCode": "PROD-2024-045",
      "productName": "Apple iPhone 13",
      "quantitySold": 45,
      "revenue": 67500.00
    },
    {
      "productCode": "PROD-2024-001",
      "productName": "Samsung Galaxy A54 5G",
      "quantitySold": 87,
      "revenue": 65250.00
    },
    {
      "productCode": "PROD-2024-089",
      "productName": "Sony WH-1000XM5 Headphones",
      "quantitySold": 52,
      "revenue": 44200.00
    },
    {
      "productCode": "PROD-2024-125",
      "productName": "Dell XPS 15 Laptop",
      "quantitySold": 12,
      "revenue": 36000.00
    },
    {
      "productCode": "PROD-2024-078",
      "productName": "Apple AirPods Pro 2",
      "quantitySold": 64,
      "revenue": 28800.00
    }
  ],
  "dailySales": [
    {
      "date": "2026-01-16",
      "transactions": 18,
      "revenue": 45250.00
    },
    {
      "date": "2026-01-15",
      "transactions": 22,
      "revenue": 52100.00
    },
    {
      "date": "2026-01-14",
      "transactions": 15,
      "revenue": 38750.00
    },
    {
      "date": "2026-01-13",
      "transactions": 20,
      "revenue": 47500.00
    },
    {
      "date": "2026-01-12",
      "transactions": 12,
      "revenue": 31200.00
    },
    {
      "date": "2026-01-11",
      "transactions": 19,
      "revenue": 43850.00
    },
    {
      "date": "2026-01-10",
      "transactions": 17,
      "revenue": 41000.00
    }
  ],
  "paymentMethodBreakdown": [
    {
      "paymentMethod": "CASH",
      "count": 89,
      "total": 285000.00,
      "percentage": 58.45
    },
    {
      "paymentMethod": "CARD",
      "count": 45,
      "total": 142500.00,
      "percentage": 29.22
    },
    {
      "paymentMethod": "BANK_TRANSFER",
      "count": 20,
      "total": 57150.00,
      "percentage": 11.72
    },
    {
      "paymentMethod": "CHEQUE",
      "count": 2,
      "total": 3000.00,
      "percentage": 0.61
    }
  ]
}
```

**Response Field Descriptions:**
- `summary`: Overall statistics
  - `totalSales`: Number of sales (same as totalTransactions)
  - `totalRevenue`: Sum of all sale amounts
  - `totalTransactions`: Total number of sales
  - `averageTransactionValue`: Average sale amount
  - `totalItemsSold`: Total quantity of items sold
  - `cashSales` / `cardSales` / `bankTransferSales` / `chequeSales`: Revenue by payment method
- `topProducts`: Top 5 best-selling products by revenue
- `dailySales`: Sales grouped by date (last 7 days or filtered range)
- `paymentMethodBreakdown`: Sales statistics by payment method

---

### 5. Delete Retail Sale
**DELETE** `/retail-sales/:id`

Deletes a retail sale and restores inventory quantities.

**Example Request:**
```
DELETE /retail-sales/clx5k6l7m8n9o0p1q2r3s4t5
```

**Response JSON:**
```json
{
  "message": "Retail sale deleted and inventory restored successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Retail sale with ID clx5k6l7m8n9o0p1q2r3s4t5 not found",
  "error": "Not Found"
}
```

---

## Integration with Other Modules

### 1. Report Module
The retail sales are automatically included in:
- `getSalesSummary()` - Calculates total sales from both Bills and Retail Sales
- Corporate vs Retail sales breakdown
- COGS (Cost of Goods Sold) calculations
- Profit calculations

### 2. Statistics Module
Retail sales affect:
- Dashboard statistics
- Financial summaries
- Sales analytics
- Revenue calculations

### 3. Investor Module
Retail sales are included in:
- Profit calculations for investors
- Revenue tracking per purchase order
- ROI calculations
- Product sales breakdown

### 4. Inventory Module
Every retail sale:
- Automatically decrements inventory quantities
- Creates transaction records
- Validates stock availability before sale
- Restores inventory when sale is deleted

---

## Sale Number Format
Auto-generated in format: `RS-YYYYMM-####`
- `RS` = Retail Sale prefix
- `YYYYMM` = Year and Month (e.g., 202401 for January 2024)
- `####` = Sequential number padded to 4 digits

**Examples:**
- `RS-202401-0001`
- `RS-202401-0042`
- `RS-202412-0125`

---

## Payment Methods
- `CASH` - Cash payment
- `BANK_TRANSFER` - Bank transfer/online payment
- `CHEQUE` - Cheque payment
- `CARD` - Credit/Debit card payment

---

## Database Schema

### RetailSale Model
```prisma
model RetailSale {
  id            String   @id @default(cuid())
  saleNumber    String   @unique
  saleDate      DateTime @default(now())
  customerName  String?
  customerPhone String?
  subtotal      Float
  discount      Float    @default(0)
  tax           Float    @default(0)
  totalAmount   Float
  paymentMethod PaymentMethod
  reference     String?
  notes         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  items RetailSaleItem[]
  
  @@map("retail_sales")
}

model RetailSaleItem {
  id        String  @id @default(cuid())
  quantity  Int
  unitPrice Float
  totalPrice Float
  
  retailSaleId String
  inventoryId  String
  retailSale   RetailSale @relation(fields: [retailSaleId], references: [id])
  inventory    Inventory  @relation(fields: [inventoryId], references: [id])
  
  @@map("retail_sale_items")
}
```

---

## Error Handling

### Common Errors

**1. 404 Not Found - Inventory Not Found**
```json
{
  "statusCode": 404,
  "message": "Inventory item clx1a2b3c4d5e6f7g8h9i0j1 not found",
  "error": "Not Found"
}
```

**2. 400 Bad Request - Insufficient Stock**
```json
{
  "statusCode": 400,
  "message": "Insufficient stock for Samsung Galaxy A54 5G. Available: 5, Requested: 10",
  "error": "Bad Request"
}
```

**3. 400 Bad Request - Validation Error**
```json
{
  "statusCode": 400,
  "message": [
    "items should not be empty",
    "paymentMethod must be one of the following values: CASH, BANK_TRANSFER, CHEQUE, CARD",
    "quantity must not be less than 1"
  ],
  "error": "Bad Request"
}
```

**4. 401 Unauthorized - Missing Token**
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

**5. 404 Not Found - Sale Not Found**
```json
{
  "statusCode": 404,
  "message": "Retail sale with ID clx5k6l7m8n9o0p1q2r3s4t5 not found",
  "error": "Not Found"
}
```

---

## Example Usage

### Example 1: Creating a Simple Cash Sale
**Request:**
```bash
curl -X POST http://localhost:3000/retail-sales \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "inventoryId": "clx1a2b3c4d5e6f7g8h9i0j1",
        "quantity": 2,
        "unitPrice": 250.00
      }
    ],
    "paymentMethod": "CASH"
  }'
```

**Response:**
```json
{
  "id": "clx5k6l7m8n9o0p1q2r3s4t5",
  "saleNumber": "RS-202601-0024",
  "saleDate": "2026-01-16T15:45:30.456Z",
  "customerName": null,
  "customerPhone": null,
  "subtotal": 500.00,
  "discount": 0.00,
  "tax": 0.00,
  "totalAmount": 500.00,
  "paymentMethod": "CASH",
  "reference": null,
  "notes": null,
  "createdAt": "2026-01-16T15:45:30.456Z",
  "updatedAt": "2026-01-16T15:45:30.456Z",
  "items": [
    {
      "id": "clx5k6l7m8n9o0p1q2r3s4t6",
      "quantity": 2,
      "unitPrice": 250.00,
      "totalPrice": 500.00,
      "inventory": {
        "id": "clx1a2b3c4d5e6f7g8h9i0j1",
        "productCode": "PROD-2024-001",
        "productName": "Samsung Galaxy A54 5G",
        "description": "128GB, Black Color"
      }
    }
  ]
}
```

---

### Example 2: Creating a Sale with Discount and Customer Info
**Request:**
```bash
curl -X POST http://localhost:3000/retail-sales \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "inventoryId": "clx1a2b3c4d5e6f7g8h9i0j1",
        "quantity": 5,
        "unitPrice": 250.00
      },
      {
        "inventoryId": "clx9z8y7x6w5v4u3t2s1r0q9",
        "quantity": 2,
        "unitPrice": 1500.00
      }
    ],
    "paymentMethod": "CARD",
    "discount": 150.00,
    "tax": 192.50,
    "customerName": "Ahmed Hassan",
    "customerPhone": "+8801712345678",
    "reference": "CARD-TXN-789456",
    "notes": "Customer loyalty discount - 5% off"
  }'
```

**Response:**
```json
{
  "id": "clx5n7o8p9q0r1s2t3u4v5w6",
  "saleNumber": "RS-202601-0025",
  "saleDate": "2026-01-16T16:20:15.789Z",
  "customerName": "Ahmed Hassan",
  "customerPhone": "+8801712345678",
  "subtotal": 4250.00,
  "discount": 150.00,
  "tax": 192.50,
  "totalAmount": 4292.50,
  "paymentMethod": "CARD",
  "reference": "CARD-TXN-789456",
  "notes": "Customer loyalty discount - 5% off",
  "createdAt": "2026-01-16T16:20:15.789Z",
  "updatedAt": "2026-01-16T16:20:15.789Z",
  "items": [
    {
      "id": "clx5n7o8p9q0r1s2t3u4v5w7",
      "quantity": 5,
      "unitPrice": 250.00,
      "totalPrice": 1250.00,
      "inventory": {
        "id": "clx1a2b3c4d5e6f7g8h9i0j1",
        "productCode": "PROD-2024-001",
        "productName": "Samsung Galaxy A54 5G",
        "description": "128GB, Black Color"
      }
    },
    {
      "id": "clx5n7o8p9q0r1s2t3u4v5w8",
      "quantity": 2,
      "unitPrice": 1500.00,
      "totalPrice": 3000.00,
      "inventory": {
        "id": "clx9z8y7x6w5v4u3t2s1r0q9",
        "productCode": "PROD-2024-045",
        "productName": "Apple iPhone 13",
        "description": "256GB, Midnight"
      }
    }
  ]
}
```

---

### Example 3: Getting Analytics for the Current Month
**Request:**
```bash
curl -X GET "http://localhost:3000/retail-sales/analytics?startDate=2026-01-01&endDate=2026-01-31" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "summary": {
    "totalSales": 156,
    "totalRevenue": 487650.00,
    "totalTransactions": 156,
    "averageTransactionValue": 3125.32,
    "totalItemsSold": 423,
    "cashSales": 285000.00,
    "cardSales": 142500.00,
    "bankTransferSales": 57150.00,
    "chequeSales": 3000.00
  },
  "topProducts": [
    {
      "productCode": "PROD-2024-045",
      "productName": "Apple iPhone 13",
      "quantitySold": 45,
      "revenue": 67500.00
    },
    {
      "productCode": "PROD-2024-001",
      "productName": "Samsung Galaxy A54 5G",
      "quantitySold": 87,
      "revenue": 65250.00
    }
  ],
  "dailySales": [
    {
      "date": "2026-01-16",
      "transactions": 18,
      "revenue": 45250.00
    }
  ],
  "paymentMethodBreakdown": [
    {
      "paymentMethod": "CASH",
      "count": 89,
      "total": 285000.00,
      "percentage": 58.45
    }
  ]
}
```

---

### Example 4: Listing Sales with Filters
**Request:**
```bash
curl -X GET "http://localhost:3000/retail-sales?page=1&limit=5&paymentMethod=CASH&startDate=2026-01-10&endDate=2026-01-16" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "sales": [
    {
      "id": "clx5k6l7m8n9o0p1q2r3s4t5",
      "saleNumber": "RS-202601-0023",
      "saleDate": "2026-01-16T14:30:25.123Z",
      "customerName": "Ahmed Hassan",
      "customerPhone": "+8801712345678",
      "subtotal": 2250.00,
      "discount": 50.00,
      "tax": 87.50,
      "totalAmount": 2287.50,
      "paymentMethod": "CASH",
      "reference": null,
      "notes": "Walk-in customer, regular buyer",
      "createdAt": "2026-01-16T14:30:25.123Z",
      "updatedAt": "2026-01-16T14:30:25.123Z",
      "items": [...]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 89,
    "pages": 18
  }
}
```

---

### Example 5: Deleting a Sale
**Request:**
```bash
curl -X DELETE http://localhost:3000/retail-sales/clx5k6l7m8n9o0p1q2r3s4t5 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "message": "Retail sale deleted and inventory restored successfully"
}
```

---

## Notes
- All monetary values are in the system's base currency
- Dates are in ISO 8601 format
- All operations are wrapped in database transactions for data integrity
- Inventory is automatically managed - no manual adjustments needed
- Deleted sales restore inventory quantities
