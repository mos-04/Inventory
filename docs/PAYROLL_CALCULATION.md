# Payroll Calculation System

## Overview

This document explains the payroll calculation logic implemented in the HR Management System, based on the **Salary_Report_10-2025.xlsx** specification. The system uses Kuwait labor law standards with a constant of 208 working hours per month.

---

## 1. Salary Calculation Constants

| Parameter | Formula/Value | Description |
|-----------|---------------|-------------|
| **Hours per Month (HPM)** | 208 | Total working hours used as divisor for monthly Basic Salary to find Hourly Basic Salary. Calculated as 26 working days × 8 hours/day |
| **Normal OT Multiplier (M_N)** | 1.25 | Factor applied to Hourly Basic Salary for Normal Overtime |
| **Friday OT Multiplier (M_F)** | 1.50 | Factor applied to Hourly Basic Salary for Friday Overtime |
| **Holiday OT Multiplier (M_H)** | 2.00 | Factor applied to Hourly Basic Salary for Holiday Overtime |

---

## 2. Hourly Basic Salary (HBS)

The Hourly Basic Salary is the foundation for calculating overtime rates and pay.

### Formula:
```
HBS = Basic Salary ÷ HPM = Basic Salary ÷ 208
```

### Example:
```
Basic Salary: 500 KWD
HBS = 500 ÷ 208 = 2.404 KWD/hour
```

---

## 3. Overtime Rates and Pay

Overtime pay is calculated by multiplying the Hourly Basic Salary (HBS) by the corresponding multiplier and the number of overtime hours.

### Component Table:

| Component | Rate Formula | Pay Formula |
|-----------|--------------|-------------|
| **Normal OT Rate (R_N)** | HBS × M_N (1.25) | Normal OT Hours × R_N |
| **Friday OT Rate (R_F)** | HBS × M_F (1.50) | Friday OT Hours × R_F |
| **Holiday OT Rate (R_H)** | HBS × M_H (2.00) | Holiday OT Hours × R_H |
| **Total OT Pay** | - | Normal OT Pay + Friday OT Pay + Holiday OT Pay |

### Formulas:

```
Normal OT Rate = HBS × 1.25
Friday OT Rate = HBS × 1.50
Holiday OT Rate = HBS × 2.00

Normal OT Pay = Normal OT Hours × Normal OT Rate
Friday OT Pay = Friday OT Hours × Friday OT Rate
Holiday OT Pay = Holiday OT Hours × Holiday OT Rate

Total OT Pay = Normal OT Pay + Friday OT Pay + Holiday OT Pay
```

### Example:
```
HBS = 2.404 KWD/hour
Normal OT Hours = 10

Normal OT Rate = 2.404 × 1.25 = 3.005 KWD/hour
Normal OT Pay = 10 × 3.005 = 30.05 KWD
```

### Custom OT Rates:
If an employee has custom OT rates set in their profile (`ot_rate_normal`, `ot_rate_friday`, `ot_rate_holiday`), those rates are used instead of the calculated rates.

---

## 4. Food Allowance

The system supports multiple food allowance types:

### Types:

1. **Fixed Monthly Allowance**
   - Type: `food_allowance_type = "fixed"`
   - Amount: `food_allowance_amount`
   - Applied as a flat amount regardless of attendance

2. **Per-Day Allowance**
   - Type: `food_allowance_type = "per_day"`
   - Formula: `Present Days × food_allowance_amount`
   - Proportional to days actually worked

3. **No Allowance**
   - Type: `food_allowance_type = "none"`
   - Amount: 0 KWD

### Rules:
- **No food allowance if employee has approved leave** in the selected month
- Food allowance is only applied to active employees

### Example:
```
Type: per_day
Daily Amount: 2 KWD
Present Days: 24
Food Allowance = 24 × 2 = 48 KWD
```

---

## 5. Gross Salary

**Formula:**
```
Gross Salary = Basic Salary + Total OT Pay + Food Allowance
```

### Important Note:
### 1. Basic Salary
- **Source**: `employee.basic_salary`
- **Formula**: Full monthly basic salary (NOT prorated by days worked)
- **Description**: The employee's complete monthly base salary
- **Type**: Fixed monthly amount in KWD
- **Note**: Based on specification - "Basic Salary is treated as the base and is not prorated based on Worked Days"
- **Important**: Employees must have at least 1 present day to receive salary. Zero working days or zero present days = no payroll generated

### Example:
```
Basic Salary: 500.00 KWD
Total OT Pay: 44.47 KWD
Food Allowance: 48.00 KWD

Gross Salary = 500.00 + 44.47 + 48.00 = 592.47 KWD
```

---

## 6. Net Salary

**Formula:**
```
Net Salary = Gross Salary - Deductions
```

### Deductions:
Currently, the system has deductions set to 0. This can be extended in the future to include:
- PACI (Kuwait social security) contributions
- Loan repayments
- Insurance premiums
- Other statutory or voluntary deductions

### Example:
```
Gross Salary: 592.47 KWD
Deductions: 0.00 KWD

Net Salary = 592.47 - 0.00 = 592.47 KWD
```

---

## Complete Calculation Example

### Employee Details:
- **Basic Salary**: 500 KWD
- **OT Rates**: Default (no custom rates)
- **Food Allowance**: 2 KWD per day

### Attendance Data:
- **Working Days**: 26
- **Present Days**: 24
- **Absent Days**: 2
- **Normal OT**: 10 hours
- **Friday OT**: 4 hours
- **Holiday OT**: 0 hours

### Step-by-Step Calculation:

```
1. Hourly Basic Salary (HBS):
   HBS = 500 ÷ 208 = 2.404 KWD/hour

2. Overtime Rates:
   Normal OT Rate = 2.404 × 1.25 = 3.005 KWD/hour
   Friday OT Rate = 2.404 × 1.50 = 3.606 KWD/hour
   Holiday OT Rate = 2.404 × 2.00 = 4.808 KWD/hour

3. Overtime Pay:
   Normal OT Pay = 10 × 3.005 = 30.05 KWD
   Friday OT Pay = 4 × 3.606 = 14.42 KWD
   Holiday OT Pay = 0 × 4.808 = 0.00 KWD
   Total OT Pay = 30.05 + 14.42 + 0.00 = 44.47 KWD

4. Food Allowance:
   Food Allowance = 24 days × 2 KWD = 48.00 KWD

5. Gross Salary:
   Gross = 500.00 + 44.47 + 48.00 = 592.47 KWD

6. Deductions:
   Deductions = 0.00 KWD

7. Net Salary:
   Net = 592.47 - 0.00 = 592.47 KWD
```

---

## Summary of Formulas

### Core Formulas:
```
HBS = Basic Salary ÷ 208

Normal OT Rate = HBS × 1.25 (or custom rate)
Friday OT Rate = HBS × 1.50 (or custom rate)
Holiday OT Rate = HBS × 2.00 (or custom rate)

Normal OT Pay = Normal OT Hours × Normal OT Rate
Friday OT Pay = Friday OT Hours × Friday OT Rate
Holiday OT Pay = Holiday OT Hours × Holiday OT Rate
Total OT Pay = Normal OT Pay + Friday OT Pay + Holiday OT Pay

Gross Salary = Basic Salary + Total OT Pay + Food Allowance
Net Salary = Gross Salary - Deductions
```

---

## API Usage

### Generate Payroll

**Endpoint:**
```
POST /api/payroll/generate
```

**Request Body:**
```json
{
  "month": "MM-YYYY"
}
```

**Response:**
```json
{
  "created": [...],
  "count": 10,
  "message": "Payroll generated for 10 employee(s)",
  "warnings": [
    {
      "emp_id": "EMP001",
      "name": "John Doe",
      "error": "No attendance data"
    }
  ]
}
```

### Get Payroll

**Endpoint:**
```
GET /api/payroll?month=MM-YYYY
```

**Response:**
```json
[
  {
    "id": 1,
    "emp_id": "EMP001",
    "month": "10-2025",
    "basic_salary": "500.00",
    "ot_amount": "44.47",
    "food_allowance": "48.00",
    "gross_salary": "592.47",
    "deductions": "0.00",
    "net_salary": "592.47",
    "generated_at": "2025-11-17T..."
  }
]
```

---

## Database Schema

### Employee Table
```typescript
{
  emp_id: string (unique)
  basic_salary: decimal
  ot_rate_normal: decimal (default: 0)    // Custom rate per hour
  ot_rate_friday: decimal (default: 0)    // Custom rate per hour
  ot_rate_holiday: decimal (default: 0)   // Custom rate per hour
  food_allowance_type: "none" | "fixed" | "per_day"
  food_allowance_amount: decimal (default: 0)
  status: "active" | "inactive" | "terminated"
}
```

### Attendance Table
```typescript
{
  emp_id: string
  month: string (MM-YYYY format)
  working_days: integer
  present_days: integer
  absent_days: integer
  ot_hours_normal: decimal
  ot_hours_friday: decimal
  ot_hours_holiday: decimal
}
```

### Payroll Table
```typescript
{
  emp_id: string
  month: string (MM-YYYY format)
  basic_salary: decimal
  ot_amount: decimal
  food_allowance: decimal
  gross_salary: decimal
  deductions: decimal
  net_salary: decimal
  generated_at: timestamp
}
```

---

## Business Rules

### Employee Eligibility
- Only **active** employees are included in payroll generation
- Employees must have attendance records for the selected month
- Inactive or terminated employees are automatically skipped

### Attendance Validation
- Each employee must have exactly one attendance record per month
- Missing attendance records result in a warning and the employee is skipped
- Attendance data must include working days, present days, and OT hours
- **Employees with zero working days are skipped** (no payroll generated)
- **Employees with zero present days are skipped** (no work performed, no pay)

### Leave Impact
- Approved leaves remove food allowance eligibility
- Leave days should be recorded as absent days in attendance
- The basic salary remains unchanged regardless of leave days

### Month Format
- Format: `MM-YYYY` (e.g., "10-2025" for October 2025)
- Used consistently across attendance and payroll tables

---

## Implementation Notes

1. **Precision**: All calculations use 3 decimal places internally for accuracy
2. **Rounding**: Final payroll amounts are rounded to 2 decimal places for display
3. **Logging**: Detailed calculation logs are generated during payroll processing
4. **Validation**: Employee IDs in attendance must exist in employees table
5. **Idempotency**: Generating payroll multiple times for the same month creates new records

---

## Future Enhancements

Potential improvements to consider:
- PACI (Kuwait social security) deductions calculation
- Tax calculations if applicable
- Bonus and incentive management
- Loan deduction tracking
- Insurance premium deductions
- Export to accounting systems (CSV, Excel, PDF)
- Payslip generation and email distribution
- Multi-currency support
- Approval workflow with multiple levels
- Audit trail for payroll changes
