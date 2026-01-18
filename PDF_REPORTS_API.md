# PDF Reports API Documentation

This document provides detailed information about the PDF report generation endpoints for the Middleman Backend API.

## Company Information

All PDF reports include the following letterhead:

```
Genuine Stationers & Gift Corner
169/C Kalabagan (Old), 94/1 Green Road (New) Staff Colony
Kalabagan 2nd Lane, Dhanmondi, Dhaka- 1205
+88-02-9114774 | +88 01711-560963, +88 01971-560963
gsgcreza@gmail.com, gmsreza87@yahoo.com
```

## Report Module Endpoints

Base URL: `/reports/pdf`

### Query Parameters (Common for all reports)

All report endpoints support optional query parameters for filtering by time period:

| Parameter | Type   | Required | Default | Description |
|-----------|--------|----------|---------|-------------|
| `year`    | number | No       | Current year | The year for the report |
| `month`   | number | No       | Current month | The month for the report (1-12) |

**Note:** If no parameters are provided, reports default to the current month.

---

## 1. Financial Report

**Endpoint:** `GET /reports/pdf/financial`

**Description:** Generates a comprehensive financial report including sales summary, expenses, financial metrics, and accounts receivable.

**Query Parameters:**
```
?year=2026&month=1
```

**Response:**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename=financial-report-{year}-{month}.pdf`

**Report Contents:**
- Sales Summary (total sales, bills, payments, outstanding)
- Expense Summary by category
- Net Income calculation
- Cash Flow
- Profit Margin
- Accounts Receivable

**Example Request:**
```bash
curl -X GET "http://localhost:3000/reports/pdf/financial?year=2026&month=1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output financial-report.pdf
```

---

## 2. Inventory Report

**Endpoint:** `GET /reports/pdf/inventory`

**Description:** Generates an inventory report with stock levels, company-wise distribution, and low stock alerts.

**Query Parameters:**
```
?year=2026&month=1
```

**Response:**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename=inventory-report-{year}-{month}.pdf`

**Report Contents:**
- Total items and inventory value
- Expected sale value
- Low stock items count
- Company-wise stock distribution
- Low stock alert list (items below minimum level)

**Example Request:**
```bash
curl -X GET "http://localhost:3000/reports/pdf/inventory" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output inventory-report.pdf
```

---

## 3. Investor Report

**Endpoint:** `GET /reports/pdf/investor`

**Description:** Generates a report showing all investor information, investments, profits, and balances.

**Query Parameters:**
```
?year=2026&month=1
```

**Response:**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename=investor-report-{year}-{month}.pdf`

**Report Contents:**
- Total investment across all investors
- Total profits generated
- Total paid out to investors
- Number of investors
- Individual investor details (invested, profits, paid, balance)

**Example Request:**
```bash
curl -X GET "http://localhost:3000/reports/pdf/investor?year=2025&month=12" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output investor-report.pdf
```

---

## 4. Sales Report

**Endpoint:** `GET /reports/pdf/sales`

**Description:** Generates a detailed sales report with sales overview, payment status, and billing statistics.

**Query Parameters:**
```
?year=2026&month=1
```

**Response:**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename=sales-report-{year}-{month}.pdf`

**Report Contents:**
- Total sales amount and number of bills
- Average, highest, and lowest bill amounts
- Total payments received
- Outstanding amounts
- Collection rate percentage
- Overall billing statistics (fully paid, partially paid, unpaid)

**Example Request:**
```bash
curl -X GET "http://localhost:3000/reports/pdf/sales?month=12" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output sales-report.pdf
```

---

## 5. Employee Report

**Endpoint:** `GET /reports/pdf/employee`

**Description:** Generates an employee report with salary information and allowances/deductions breakdown.

**Query Parameters:**
```
?year=2026&month=1
```

**Response:**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename=employee-report-{year}-{month}.pdf`

**Report Contents:**
- Total employees
- Total salaries paid
- Average salary
- Total allowances and deductions
- Individual employee salary breakdown (basic, allowances, deductions, net)

**Example Request:**
```bash
curl -X GET "http://localhost:3000/reports/pdf/employee?year=2026&month=1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output employee-report.pdf
```

---

## 6. Expense Report

**Endpoint:** `GET /reports/pdf/expense`

**Description:** Generates a report showing expenses categorized by type with detailed breakdown.

**Query Parameters:**
```
?year=2026&month=1
```

**Response:**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename=expense-report-{year}-{month}.pdf`

**Report Contents:**
- Total expenses for the period
- Total number of transactions
- Average expense per transaction
- Category-wise breakdown (count, amount, percentage, average)

**Example Request:**
```bash
curl -X GET "http://localhost:3000/reports/pdf/expense?year=2025" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output expense-report.pdf
```

---

## 7. All Reports Summary

**Endpoint:** `GET /reports/pdf/summary`

**Description:** Generates an executive summary combining key metrics from all reports.

**Query Parameters:**
```
?year=2026&month=1
```

**Response:**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename=all-reports-summary-{year}-{month}.pdf`

**Report Contents:**
- Business Health Overview (cash flow, profit margin, inventory turnover, debt-to-equity)
- Sales Summary (total sales, bills, payments, outstanding)
- Inventory Summary (items, value, low stock)
- Investor Summary (investment, profits, number of investors)
- Expense Summary (total, categories, top category)
- Employee Summary (total employees, salaries, average)
- Financial Summary (revenue, operating expenses, net income)

**Example Request:**
```bash
curl -X GET "http://localhost:3000/reports/pdf/summary?year=2026&month=1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output all-reports-summary.pdf
```

---

## Retail Sale Module Endpoint

Base URL: `/retail-sales`

### Sales Invoice

**Endpoint:** `GET /retail-sales/:id/invoice`

**Description:** Generates a sales invoice PDF for a specific retail sale transaction.

**Path Parameters:**
| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| `id`      | string | Yes      | The retail sale ID |

**Response:**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename=sales-invoice-{saleNumber}.pdf`

**Invoice Contents:**
- Company letterhead
- Invoice number and date
- Customer details (if available)
- Itemized list of products with quantities and prices
- Subtotal, discount, tax calculations
- Grand total
- Payment method and reference
- Notes (if any)

**Example Request:**
```bash
curl -X GET "http://localhost:3000/retail-sales/clx1234567890/invoice" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output invoice.pdf
```

---

## Frontend Integration Guide

### React/TypeScript Example

```typescript
// API service for downloading reports
export const downloadReport = async (
  reportType: 'financial' | 'inventory' | 'investor' | 'sales' | 'employee' | 'expense' | 'summary',
  year?: number,
  month?: number
) => {
  const params = new URLSearchParams();
  if (year) params.append('year', year.toString());
  if (month) params.append('month', month.toString());
  
  const response = await fetch(
    `${API_BASE_URL}/reports/pdf/${reportType}?${params}`,
    {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    }
  );
  
  if (!response.ok) {
    throw new Error('Failed to generate report');
  }
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${reportType}-report-${year}-${month}.pdf`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

// Download sales invoice
export const downloadSalesInvoice = async (retailSaleId: string) => {
  const response = await fetch(
    `${API_BASE_URL}/retail-sales/${retailSaleId}/invoice`,
    {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    }
  );
  
  if (!response.ok) {
    throw new Error('Failed to generate invoice');
  }
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `invoice-${retailSaleId}.pdf`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

// Usage in a React component
const ReportsPage = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(false);

  const handleDownload = async (reportType: string) => {
    setLoading(true);
    try {
      await downloadReport(reportType as any, year, month);
      toast.success('Report downloaded successfully');
    } catch (error) {
      toast.error('Failed to download report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Download Reports</h1>
      
      <div>
        <label>Year:</label>
        <input 
          type="number" 
          value={year} 
          onChange={(e) => setYear(parseInt(e.target.value))} 
        />
        
        <label>Month:</label>
        <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <div>
        <button onClick={() => handleDownload('financial')} disabled={loading}>
          Download Financial Report
        </button>
        <button onClick={() => handleDownload('inventory')} disabled={loading}>
          Download Inventory Report
        </button>
        <button onClick={() => handleDownload('investor')} disabled={loading}>
          Download Investor Report
        </button>
        <button onClick={() => handleDownload('sales')} disabled={loading}>
          Download Sales Report
        </button>
        <button onClick={() => handleDownload('employee')} disabled={loading}>
          Download Employee Report
        </button>
        <button onClick={() => handleDownload('expense')} disabled={loading}>
          Download Expense Report
        </button>
        <button onClick={() => handleDownload('summary')} disabled={loading}>
          Download All Reports Summary
        </button>
      </div>
    </div>
  );
};
```

### Axios Example

```typescript
import axios from 'axios';

// Download report using axios
export const downloadReportAxios = async (
  reportType: string,
  year?: number,
  month?: number
) => {
  const response = await axios.get(
    `/reports/pdf/${reportType}`,
    {
      params: { year, month },
      responseType: 'blob',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    }
  );
  
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${reportType}-report.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
```

---

## Error Handling

All endpoints may return the following errors:

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 404 Not Found (for invoice)
```json
{
  "statusCode": 404,
  "message": "Retail sale not found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

---

## Notes

1. **Authentication Required:** All endpoints require a valid JWT token in the Authorization header.

2. **Default Period:** If year and month are not specified, reports generate for the current month.

3. **File Size:** PDF files are typically between 50KB - 500KB depending on the data volume.

4. **Rate Limiting:** Consider implementing rate limiting on the client side to prevent excessive report generation.

5. **Date Format:** All dates in PDFs are formatted as DD/MM/YYYY (British format).

6. **Currency:** All amounts are displayed in Bangladeshi Taka (৳) with 2 decimal places.

7. **Performance:** Report generation is synchronous and may take 1-5 seconds depending on data volume.

---

## Support

For issues or questions regarding the PDF reports API, please contact the development team or refer to the main API documentation.
