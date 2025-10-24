import {
  type User,
  type InsertUser,
  type Employee,
  type InsertEmployee,
  type Attendance,
  type InsertAttendance,
  type Payroll,
  type InsertPayroll,
  type Leave,
  type InsertLeave,
  type Indemnity,
  type InsertIndemnity,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getEmployees(): Promise<Employee[]>;
  getEmployee(empId: string): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(empId: string, employee: Partial<InsertEmployee>): Promise<Employee | undefined>;
  deleteEmployee(empId: string): Promise<boolean>;
  
  getAttendance(month?: string): Promise<Attendance[]>;
  getAttendanceByEmployee(empId: string, month?: string): Promise<Attendance[]>;
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  bulkCreateAttendance(attendances: InsertAttendance[]): Promise<Attendance[]>;
  
  getPayroll(month?: string): Promise<Payroll[]>;
  getPayrollByEmployee(empId: string, month?: string): Promise<Payroll[]>;
  createPayroll(payroll: InsertPayroll): Promise<Payroll>;
  bulkCreatePayroll(payrolls: InsertPayroll[]): Promise<Payroll[]>;
  
  getLeaves(status?: string): Promise<Leave[]>;
  getLeavesByEmployee(empId: string): Promise<Leave[]>;
  getLeave(id: number): Promise<Leave | undefined>;
  createLeave(leave: InsertLeave): Promise<Leave>;
  updateLeave(id: number, leave: Partial<Leave>): Promise<Leave | undefined>;
  
  getIndemnity(): Promise<Indemnity[]>;
  getIndemnityByEmployee(empId: string): Promise<Indemnity | undefined>;
  createIndemnity(indemnity: InsertIndemnity): Promise<Indemnity>;
  updateIndemnity(empId: string, indemnity: Partial<InsertIndemnity>): Promise<Indemnity | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private employees: Map<string, Employee>;
  private attendance: Map<number, Attendance>;
  private payrolls: Map<number, Payroll>;
  private leaves: Map<number, Leave>;
  private indemnities: Map<string, Indemnity>;
  
  private employeeIdCounter: number;
  private attendanceIdCounter: number;
  private payrollIdCounter: number;
  private leaveIdCounter: number;
  private indemnityIdCounter: number;

  constructor() {
    this.users = new Map();
    this.employees = new Map();
    this.attendance = new Map();
    this.payrolls = new Map();
    this.leaves = new Map();
    this.indemnities = new Map();
    
    this.employeeIdCounter = 1;
    this.attendanceIdCounter = 1;
    this.payrollIdCounter = 1;
    this.leaveIdCounter = 1;
    this.indemnityIdCounter = 1;
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async getEmployees(): Promise<Employee[]> {
    return Array.from(this.employees.values());
  }
  
  async getEmployee(empId: string): Promise<Employee | undefined> {
    return this.employees.get(empId);
  }
  
  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const newEmployee: Employee = {
      id: this.employeeIdCounter++,
      status: "active",
      ot_rate_normal: "0",
      ot_rate_friday: "0",
      ot_rate_holiday: "0",
      food_allowance_type: "none",
      food_allowance_amount: "0",
      ...employee,
    };
    this.employees.set(employee.emp_id, newEmployee);
    return newEmployee;
  }
  
  async updateEmployee(empId: string, updates: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const employee = this.employees.get(empId);
    if (!employee) return undefined;
    
    const updated = { ...employee, ...updates };
    this.employees.set(empId, updated);
    return updated;
  }
  
  async deleteEmployee(empId: string): Promise<boolean> {
    return this.employees.delete(empId);
  }
  
  async getAttendance(month?: string): Promise<Attendance[]> {
    const all = Array.from(this.attendance.values());
    if (!month) return all;
    return all.filter(a => a.month === month);
  }
  
  async getAttendanceByEmployee(empId: string, month?: string): Promise<Attendance[]> {
    const all = Array.from(this.attendance.values()).filter(a => a.emp_id === empId);
    if (!month) return all;
    return all.filter(a => a.month === month);
  }
  
  async createAttendance(attendance: InsertAttendance): Promise<Attendance> {
    const newAttendance: Attendance = {
      id: this.attendanceIdCounter++,
      ot_hours_normal: "0",
      ot_hours_friday: "0",
      ot_hours_holiday: "0",
      ...attendance,
      uploaded_at: new Date(),
    };
    this.attendance.set(newAttendance.id, newAttendance);
    return newAttendance;
  }
  
  async bulkCreateAttendance(attendances: InsertAttendance[]): Promise<Attendance[]> {
    const created: Attendance[] = [];
    for (const att of attendances) {
      const newAttendance = await this.createAttendance(att);
      created.push(newAttendance);
    }
    return created;
  }
  
  async getPayroll(month?: string): Promise<Payroll[]> {
    const all = Array.from(this.payrolls.values());
    if (!month) return all;
    return all.filter(p => p.month === month);
  }
  
  async getPayrollByEmployee(empId: string, month?: string): Promise<Payroll[]> {
    const all = Array.from(this.payrolls.values()).filter(p => p.emp_id === empId);
    if (!month) return all;
    return all.filter(p => p.month === month);
  }
  
  async createPayroll(payroll: InsertPayroll): Promise<Payroll> {
    const newPayroll: Payroll = {
      id: this.payrollIdCounter++,
      ot_amount: "0",
      food_allowance: "0",
      deductions: "0",
      ...payroll,
      generated_at: new Date(),
    };
    this.payrolls.set(newPayroll.id, newPayroll);
    return newPayroll;
  }
  
  async bulkCreatePayroll(payrolls: InsertPayroll[]): Promise<Payroll[]> {
    const created: Payroll[] = [];
    for (const pay of payrolls) {
      const newPayroll = await this.createPayroll(pay);
      created.push(newPayroll);
    }
    return created;
  }
  
  async getLeaves(status?: string): Promise<Leave[]> {
    const all = Array.from(this.leaves.values());
    if (!status) return all;
    return all.filter(l => l.status === status);
  }
  
  async getLeavesByEmployee(empId: string): Promise<Leave[]> {
    return Array.from(this.leaves.values()).filter(l => l.emp_id === empId);
  }
  
  async getLeave(id: number): Promise<Leave | undefined> {
    return this.leaves.get(id);
  }
  
  async createLeave(leave: InsertLeave): Promise<Leave> {
    const newLeave: Leave = {
      id: this.leaveIdCounter++,
      status: "Pending",
      ...leave,
      submitted_at: new Date(),
      reviewed_at: null,
      reviewed_by: null,
    };
    this.leaves.set(newLeave.id, newLeave);
    return newLeave;
  }
  
  async updateLeave(id: number, updates: Partial<Leave>): Promise<Leave | undefined> {
    const leave = this.leaves.get(id);
    if (!leave) return undefined;
    
    const updated = { ...leave, ...updates };
    this.leaves.set(id, updated);
    return updated;
  }
  
  async getIndemnity(): Promise<Indemnity[]> {
    return Array.from(this.indemnities.values());
  }
  
  async getIndemnityByEmployee(empId: string): Promise<Indemnity | undefined> {
    return this.indemnities.get(empId);
  }
  
  async createIndemnity(indemnity: InsertIndemnity): Promise<Indemnity> {
    const newIndemnity: Indemnity = {
      id: this.indemnityIdCounter++,
      status: "Active",
      ...indemnity,
      updated_at: new Date(),
      paid_at: null,
    };
    this.indemnities.set(indemnity.emp_id, newIndemnity);
    return newIndemnity;
  }
  
  async updateIndemnity(empId: string, updates: Partial<InsertIndemnity>): Promise<Indemnity | undefined> {
    const indemnity = this.indemnities.get(empId);
    if (!indemnity) return undefined;
    
    const updated = { ...indemnity, ...updates, updated_at: new Date() };
    this.indemnities.set(empId, updated);
    return updated;
  }
}

export const storage = new MemStorage();
