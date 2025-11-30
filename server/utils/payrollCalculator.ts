/**
 * Payroll Calculation Utility for Kuwait Labor Law
 * 
 * This module provides helper functions to calculate employee payroll
 * based on Kuwait labor law standards and company policies.
 */

import type { Employee, Attendance, Leave } from "@shared/schema";

/**
 * Standard payroll calculation constants based on Kuwait labor law
 */
export const HOURS_PER_MONTH = 260; // 26 working days × 10 hours/day
export const KUWAIT_WORKING_DAYS_PER_MONTH = 26;
export const KUWAIT_WORKING_HOURS_PER_DAY = 10;

/**
 * Standard OT multipliers for Kuwait
 */
export const OT_MULTIPLIERS = {
  normal: 1.25,    // Normal weekday OT
  friday: 1.50,    // Friday OT
  holiday: 2.00,   // Public holiday OT
};

/**
 * Calculate Hourly Basic Salary (HBS)
 * Formula: HBS = Basic Salary ÷ Hours Per Month (208)
 */
export function calculateHourlyBasicSalary(basicSalary: number): number {
  return basicSalary / HOURS_PER_MONTH;
}

/**
 * Calculate daily rate from monthly salary (for reference/reporting)
 */
export function calculateDailyRate(monthlySalary: number): number {
  return monthlySalary / KUWAIT_WORKING_DAYS_PER_MONTH;
}

/**
 * Calculate OT rates and amounts for an employee
 * Returns rates (KWD/hour) and pay (KWD) for each OT type
 */
export function calculateOvertimeAmount(
  employee: Employee,
  attendance: Attendance
): {
  rates: {
    normal: number;
    friday: number;
    holiday: number;
  };
  pay: {
    normal: number;
    friday: number;
    holiday: number;
    total: number;
  };
} {
  const basicSalary = parseFloat(employee.basic_salary);
  const hourlyBasicSalary = calculateHourlyBasicSalary(basicSalary);
  
  // Get employee's custom OT rates if available (these are per-hour rates)
  const customOtRateNormal = parseFloat(employee.ot_rate_normal || "0");
  const customOtRateFriday = parseFloat(employee.ot_rate_friday || "0");
  const customOtRateHoliday = parseFloat(employee.ot_rate_holiday || "0");
  
  // Get OT hours from attendance
  const otHoursNormal = parseFloat(attendance.ot_hours_normal || "0");
  const otHoursFriday = parseFloat(attendance.ot_hours_friday || "0");
  const otHoursHoliday = parseFloat(attendance.ot_hours_holiday || "0");
  
  // Calculate OT Rates: HBS × Multiplier (or use custom rate)
  const normalOtRate = customOtRateNormal > 0 
    ? customOtRateNormal 
    : hourlyBasicSalary * OT_MULTIPLIERS.normal;
    
  const fridayOtRate = customOtRateFriday > 0 
    ? customOtRateFriday 
    : hourlyBasicSalary * OT_MULTIPLIERS.friday;
    
  const holidayOtRate = customOtRateHoliday > 0 
    ? customOtRateHoliday 
    : hourlyBasicSalary * OT_MULTIPLIERS.holiday;
  
  // Calculate OT Pay: Hours × Rate
  const normalPay = otHoursNormal * normalOtRate;
  const fridayPay = otHoursFriday * fridayOtRate;
  const holidayPay = otHoursHoliday * holidayOtRate;
  
  return {
    rates: {
      normal: normalOtRate,
      friday: fridayOtRate,
      holiday: holidayOtRate,
    },
    pay: {
      normal: normalPay,
      friday: fridayPay,
      holiday: holidayPay,
      total: normalPay + fridayPay + holidayPay,
    },
  };
}

/**
 * Calculate food allowance for an employee
 */
export function calculateFoodAllowance(
  employee: Employee,
  attendance: Attendance,
  monthlyLeaves: Leave[]
): number {
  // Check if employee has food allowance
  if (employee.food_allowance_type === "none") {
    return 0;
  }
  
  // Check if employee has approved leave (no food allowance if on leave)
  const hasApprovedLeave = monthlyLeaves.some(
    leave => leave.emp_id === employee.emp_id && leave.status === "Approved"
  );
  
  if (hasApprovedLeave) {
    return 0;
  }
  
  const allowanceAmount = parseFloat(employee.food_allowance_amount || "0");
  
  // Calculate based on type
  if (employee.food_allowance_type === "fixed") {
    return allowanceAmount;
  } else if (employee.food_allowance_type === "per_day") {
    const presentDays = parseInt(attendance.present_days.toString()) || 0;
    return presentDays * allowanceAmount;
  }
  
  return 0;
}

/**
 * Get basic salary (full monthly salary, not prorated)
 * Based on the specification: Basic Salary is treated as the base and not prorated
 */
export function getBasicSalary(employee: Employee): number {
  return parseFloat(employee.basic_salary);
}

/**
 * Calculate complete payroll for an employee
 * Based on specification: Gross Salary = Basic Salary + Total OT Pay + Food Allowance
 *                        Net Salary = Gross Salary - Deductions
 */
export function calculateEmployeePayroll(
  employee: Employee,
  attendance: Attendance,
  monthlyLeaves: Leave[]
): {
  basicSalary: number;
  hourlyBasicSalary: number;
  otAmount: number;
  foodAllowance: number;
  grossSalary: number;
  deductions: number;
  netSalary: number;
  breakdown: {
    otRates: {
      normal: number;
      friday: number;
      holiday: number;
    };
    otPay: {
      normal: number;
      friday: number;
      holiday: number;
    };
    workingDays: number;
    presentDays: number;
    absentDays: number;
  };
} {
  const workingDays = parseInt(attendance.working_days.toString()) || KUWAIT_WORKING_DAYS_PER_MONTH;
  const presentDays = parseInt(attendance.present_days.toString()) || 0;
  const absentDays = parseInt(attendance.absent_days.toString()) || 0;
  
  // Get full basic salary (not prorated)
  const basicSalary = getBasicSalary(employee);
  const hourlyBasicSalary = calculateHourlyBasicSalary(basicSalary);
  
  // Calculate OT
  const ot = calculateOvertimeAmount(employee, attendance);
  
  // Calculate food allowance
  const foodAllowance = calculateFoodAllowance(employee, attendance, monthlyLeaves);
  
  // Calculate Gross Salary: Basic Salary + Total OT Pay + Food Allowance
  const grossSalary = basicSalary + ot.pay.total + foodAllowance;
  
  // Deductions (can be extended in future)
  const totalDeductions = 0;
  
  // Calculate Net Salary: Gross Salary - Deductions
  const netSalary = grossSalary - totalDeductions;
  
  return {
    basicSalary,
    hourlyBasicSalary,
    otAmount: ot.pay.total,
    foodAllowance,
    grossSalary,
    deductions: totalDeductions,
    netSalary,
    breakdown: {
      otRates: ot.rates,
      otPay: {
        normal: ot.pay.normal,
        friday: ot.pay.friday,
        holiday: ot.pay.holiday,
      },
      workingDays,
      presentDays,
      absentDays,
    },
  };
}

/**
 * Format currency for Kuwait (KWD)
 */
export function formatKWD(amount: number): string {
  return `${amount.toFixed(3)} KWD`;
}
