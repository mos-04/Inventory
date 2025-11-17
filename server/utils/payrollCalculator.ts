/**
 * Payroll Calculation Utility for Kuwait Labor Law
 * 
 * This module provides helper functions to calculate employee payroll
 * based on Kuwait labor law standards and company policies.
 */

import type { Employee, Attendance, Leave } from "@shared/schema";

/**
 * Kuwait standard working days per month
 */
export const KUWAIT_WORKING_DAYS_PER_MONTH = 26;

/**
 * Kuwait standard working hours per day
 */
export const KUWAIT_WORKING_HOURS_PER_DAY = 8;

/**
 * Standard OT multipliers for Kuwait
 */
export const OT_MULTIPLIERS = {
  normal: 1.25,    // Normal weekday OT
  friday: 1.5,     // Friday OT
  holiday: 2.0,    // Public holiday OT
};

/**
 * Calculate daily rate from monthly salary
 */
export function calculateDailyRate(monthlySalary: number): number {
  return monthlySalary / KUWAIT_WORKING_DAYS_PER_MONTH;
}

/**
 * Calculate hourly rate from monthly salary
 */
export function calculateHourlyRate(monthlySalary: number): number {
  return monthlySalary / KUWAIT_WORKING_DAYS_PER_MONTH / KUWAIT_WORKING_HOURS_PER_DAY;
}

/**
 * Calculate OT amount for an employee
 */
export function calculateOvertimeAmount(
  employee: Employee,
  attendance: Attendance
): {
  normal: number;
  friday: number;
  holiday: number;
  total: number;
} {
  const basicSalary = parseFloat(employee.basic_salary);
  const standardHourlyRate = calculateHourlyRate(basicSalary);
  
  // Get employee's custom OT rates if available
  const customOtRateNormal = parseFloat(employee.ot_rate_normal || "0");
  const customOtRateFriday = parseFloat(employee.ot_rate_friday || "0");
  const customOtRateHoliday = parseFloat(employee.ot_rate_holiday || "0");
  
  // Get OT hours from attendance
  const otHoursNormal = parseFloat(attendance.ot_hours_normal || "0");
  const otHoursFriday = parseFloat(attendance.ot_hours_friday || "0");
  const otHoursHoliday = parseFloat(attendance.ot_hours_holiday || "0");
  
  // Calculate OT amounts (use custom rate if set, otherwise use standard calculation)
  const normalAmount = otHoursNormal * (customOtRateNormal > 0 
    ? customOtRateNormal 
    : standardHourlyRate * OT_MULTIPLIERS.normal);
    
  const fridayAmount = otHoursFriday * (customOtRateFriday > 0 
    ? customOtRateFriday 
    : standardHourlyRate * OT_MULTIPLIERS.friday);
    
  const holidayAmount = otHoursHoliday * (customOtRateHoliday > 0 
    ? customOtRateHoliday 
    : standardHourlyRate * OT_MULTIPLIERS.holiday);
  
  return {
    normal: normalAmount,
    friday: fridayAmount,
    holiday: holidayAmount,
    total: normalAmount + fridayAmount + holidayAmount,
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
 * Calculate basic salary based on present days (proportional calculation)
 */
export function calculateProportionalBasicSalary(
  employee: Employee,
  attendance: Attendance
): number {
  const monthlyBasicSalary = parseFloat(employee.basic_salary);
  const workingDays = parseInt(attendance.working_days.toString()) || KUWAIT_WORKING_DAYS_PER_MONTH;
  const presentDays = parseInt(attendance.present_days.toString()) || 0;
  
  const dailyRate = monthlyBasicSalary / workingDays;
  return presentDays * dailyRate;
}

/**
 * Calculate complete payroll for an employee
 */
export function calculateEmployeePayroll(
  employee: Employee,
  attendance: Attendance,
  monthlyLeaves: Leave[]
): {
  basicSalary: number;
  otAmount: number;
  foodAllowance: number;
  grossSalary: number;
  deductions: number;
  netSalary: number;
  breakdown: {
    otNormal: number;
    otFriday: number;
    otHoliday: number;
    workingDays: number;
    presentDays: number;
    absentDays: number;
    dailyRate: number;
  };
} {
  const monthlyBasicSalary = parseFloat(employee.basic_salary);
  const workingDays = parseInt(attendance.working_days.toString()) || KUWAIT_WORKING_DAYS_PER_MONTH;
  const presentDays = parseInt(attendance.present_days.toString()) || 0;
  const absentDays = parseInt(attendance.absent_days.toString()) || 0;
  
  // Calculate proportional basic salary (based on days actually worked)
  const basicSalary = calculateProportionalBasicSalary(employee, attendance);
  const dailyRate = monthlyBasicSalary / workingDays;
  
  // Calculate OT
  const ot = calculateOvertimeAmount(employee, attendance);
  
  // Calculate food allowance
  const foodAllowance = calculateFoodAllowance(employee, attendance, monthlyLeaves);
  
  // Calculate totals (no deductions - salary already proportional)
  const grossSalary = basicSalary + ot.total + foodAllowance;
  const totalDeductions = 0;
  const netSalary = grossSalary - totalDeductions;
  
  return {
    basicSalary,
    otAmount: ot.total,
    foodAllowance,
    grossSalary,
    deductions: totalDeductions,
    netSalary,
    breakdown: {
      otNormal: ot.normal,
      otFriday: ot.friday,
      otHoliday: ot.holiday,
      workingDays,
      presentDays,
      absentDays,
      dailyRate,
    },
  };
}

/**
 * Format currency for Kuwait (KWD)
 */
export function formatKWD(amount: number): string {
  return `${amount.toFixed(3)} KWD`;
}
