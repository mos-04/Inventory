import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEmployeeSchema, insertAttendanceSchema, insertPayrollSchema, insertLeaveSchema, insertIndemnitySchema } from "@shared/schema";
import { z } from "zod";
import { error } from "console";


export async function registerRoutes(app: Express): Promise<Server> {

//   app.get("/api/health/db", async (req, res) => {
//   try {
//     const url = process.env.DATABASE_URL;
//     if (!url) {
//       return res.json({
//         connected: false,
//         reason: "DATABASE_URL not set",
//         mode: "memory",
//         timestamp: new Date().toISOString(),
//       });
//     }

//     let host: string;
//     let port: number;
//     try {
//       const u = new URL(url);
//       host = u.hostname;
//       port = Number(u.port) || 5432;
//     } catch {
//       return res.json({
//         connected: false,
//         reason: "Invalid DATABASE_URL",
//         mode: "db-configured",
//         timestamp: new Date().toISOString(),
//       });
//     }
//     let dnsOk = false;
//     try {
//       await dns.lookup(host);
//       dnsOk = true;
//     } catch { /* ignore */ }

//     const tcpOk = await new Promise<boolean>((resolve) => {
//       const s = net.createConnection({ host, port, timeout: 2500 });
//       s.once("connect", () => { s.end(); resolve(true); });
//       s.once("timeout", () => { s.destroy(); resolve(false); });
//       s.once("error", () => resolve(false));
//     });
//        let sqlOk = false;
//     try {
//       const pg = await import("pg").catch(() => null as any);
//       if (pg?.Client) {
//         const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
//         await client.connect();
//         await client.query("select 1");
//         await client.end();
//         sqlOk = true;
//       }
//     } catch { /* ignore */ }

//     const connected = sqlOk || (dnsOk && tcpOk);
//     res.json({
//       connected,
//       details: { dnsOk, tcpOk, sqlOk, host, port },
//       mode: "db-configured",
//       timestamp: new Date().toISOString(),
//     });
//   } catch (err: any) {
//     res.status(500).json({ connected: false, error: err?.message || "Unknown error" });
//   }
// });

  
  app.get("/api/employees", async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      res.json(employees);
    } catch (error) {
      console.error("/api/employees error:", error);
      res.status(500).json({ error: "Failed to fetch employees" });
    }
  });
  
  app.get("/api/employees/:empId", async (req, res) => {
    try {
      const employee = await storage.getEmployee(req.params.empId);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch employee" });
    }
  });
  
  app.post("/api/employees", async (req, res) => {
    try {
      const data = insertEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee(data);
      res.json(employee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create employee" });
    }
  });
  
  app.patch("/api/employees/:empId", async (req, res) => {
    try {
      const employee = await storage.updateEmployee(req.params.empId, req.body);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      res.status(500).json({ error: "Failed to update employee" });
    }
  });
  
  app.delete("/api/employees/:empId", async (req, res) => {
    try {
      const deleted = await storage.deleteEmployee(req.params.empId);
      if (!deleted) {
        return res.status(404).json({ error: "Employee not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete employee" });
    }
  });
  
  app.get("/api/attendance", async (req, res) => {
    try {
      const month = req.query.month as string | undefined;
      const attendance = await storage.getAttendance(month);
      res.json(attendance);
    } catch (error) {
      console.error("/api/attendance error:", error);
      res.status(500).json({ error: "Failed to fetch attendance" });
    }
  });
  
  app.get("/api/attendance/:empId", async (req, res) => {
    try {
      const month = req.query.month as string | undefined;
      const attendance = await storage.getAttendanceByEmployee(req.params.empId, month);
      res.json(attendance);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch attendance" });
    }
  });
  
  app.post("/api/attendance", async (req, res) => {
    try {
      const data = insertAttendanceSchema.parse(req.body);
      const attendance = await storage.createAttendance(data);
      res.json(attendance);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create attendance" });
    }
  });
  
  app.post("/api/attendance/bulk", async (req, res) => {
    try {
      const attendances = z.array(insertAttendanceSchema).parse(req.body);

      const employees = await storage.getEmployees();
      const validEmpIds = new Set(employees.map(e => e.emp_id));
      
      const InvalidEmpIds = attendances.filter(a => !validEmpIds.has(a.emp_id));

      if(InvalidEmpIds.length >0){

        const invalidIds = InvalidEmpIds.map(r => r.emp_id).join(", ");
        return res.status(400).json({
          error:"invalid employee IDs in attendance upload",
          invalidIds,
          message: `The following employee IDs are invalid: ${invalidIds}`
        });

      }

      const created = await storage.bulkCreateAttendance(attendances);
      res.json(created);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      // Log the error server-side for debugging
      // Include error details in the response when in development to help trace the issue
      // but avoid leaking internals in production.
      // eslint-disable-next-line no-console
      console.error("Attendance bulk upload error:", error);
      const status = 500;
      const body: any = { error: "Failed to upload attendance" };
      if (app.get("env") === "development") {
        body.details = (error instanceof Error && error.message) ? error.message : String(error);
      }
      res.status(status).json(body);
    }
  });
  
  app.get("/api/payroll", async (req, res) => {
    try {
      const month = req.query.month as string | undefined;
      const payroll = await storage.getPayroll(month);
      res.json(payroll);
    } catch (error) {
      console.error("/api/payroll error:", error);
      res.status(500).json({ error: "Failed to fetch payroll" });
    }
  });
  
  app.get("/api/payroll/:empId", async (req, res) => {
    try {
      const month = req.query.month as string | undefined;
      const payroll = await storage.getPayrollByEmployee(req.params.empId, month);
      res.json(payroll);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payroll" });
    }
  });
app.post("/api/payroll/generate", async (req, res) => {
  try {
    const { month } = req.body;
    
    if (!month) {
      return res.status(400).json({ error: "Month is required" });
    }
    
    const employees = await storage.getEmployees();
    const attendances = await storage.getAttendance(month);
    const leaves = await storage.getLeaves("Approved");
    
    console.log(`Generating payroll for ${month}:`);
    console.log(`- Found ${employees.length} employees`);
    console.log(`- Found ${attendances.length} attendance records`);
    
    const payrolls = [];
    
    for (const employee of employees) {
      const empAttendance = attendances.find(a => a.emp_id === employee.emp_id);
      
      if (!empAttendance) {
        console.log(`Skipping ${employee.emp_id} - no attendance record`);
        continue;
      }
      
      const basicSalary = parseFloat(employee.basic_salary);
      
      // KUWAIT CALCULATION: Hourly rate = Monthly Salary ÷ 26 ÷ 8
      const hourlyRate = basicSalary / 26 / 8;
      
      // Get OT hours from attendance (use correct field names)
      const otHoursNormal = parseFloat(empAttendance.ot_hours_normal || "0");
      const otHoursFriday = parseFloat(empAttendance.ot_hours_friday || "0");
      const otHoursHoliday = parseFloat(empAttendance.ot_hours_holiday || "0");
      
      // KUWAIT RATES: 1.25x, 1.5x, 2.0x
      const otAmountNormal = otHoursNormal * hourlyRate * 1.25;
      const otAmountFriday = otHoursFriday * hourlyRate * 1.5;
      const otAmountHoliday = otHoursHoliday * hourlyRate * 2.0;
      const totalOtAmount = otAmountNormal + otAmountFriday + otAmountHoliday;
      
      // Food allowance: 25 KWD fixed, removed if approved leave
      let foodAllowance = 25;
      
      const empLeaves = leaves.filter(l => 
        l.emp_id === employee.emp_id && 
        l.status === "Approved"
      );
      
      if (empLeaves.length > 0) {
        foodAllowance = 0; // Remove food allowance if leave exists
      }
      
      const grossSalary = basicSalary + totalOtAmount + foodAllowance;
      const deductions = 0;
      const netSalary = grossSalary - deductions;
      
      console.log(`${employee.emp_id}: Basic=${basicSalary}, OT=${totalOtAmount.toFixed(2)}, Food=${foodAllowance}, Net=${netSalary.toFixed(2)}`);
      
      payrolls.push({
        emp_id: employee.emp_id,
        month,
        basic_salary: basicSalary.toFixed(2),
        ot_amount: totalOtAmount.toFixed(2),
        food_allowance: foodAllowance.toFixed(2),
        gross_salary: grossSalary.toFixed(2),
        deductions: deductions.toFixed(2),
        net_salary: netSalary.toFixed(2),
      });
    }
    
    console.log(`Generated ${payrolls.length} payroll records`);
    
    if (payrolls.length === 0) {
      return res.json({ message: "No payroll generated - no employees with attendance found", created: [] });
    }
    
    const created = await storage.bulkCreatePayroll(payrolls);
    console.log(`Successfully saved ${created.length} payroll records`);
    
    res.json(created);
  } catch (error) {
    console.error("Payroll generation error:", error);
    res.status(500).json({ error: "Failed to generate payroll", details: error instanceof Error ? error.message : String(error) });
  }
});
  // Mark indemnity as paid (simple status update)
  app.patch("/api/indemnity/:empId/pay", async (req, res) => {
    try {
      const record = await storage.updateIndemnity(req.params.empId, {
        status: "Paid",
        indemnity_amount: req.body?.indemnity_amount, // optional override
      });
      if (!record) return res.status(404).json({ error: "Indemnity record not found" });
      res.json(record);
    } catch (err) {
      res.status(500).json({ error: "Failed to mark indemnity paid" });
    }
  });
  
  app.get("/api/leaves", async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const leaves = await storage.getLeaves(status);
      res.json(leaves);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leaves" });
    }
  });
  
  app.get("/api/leaves/employee/:empId", async (req, res) => {
    try {
      const leaves = await storage.getLeavesByEmployee(req.params.empId);
      res.json(leaves);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leaves" });
    }
  });
  
  app.get("/api/leaves/:id", async (req, res) => {
    try {
      const leave = await storage.getLeave(parseInt(req.params.id));
      if (!leave) {
        return res.status(404).json({ error: "Leave request not found" });
      }
      res.json(leave);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leave" });
    }
  });
  
  app.post("/api/leaves", async (req, res) => {
    try {
      const data = insertLeaveSchema.parse(req.body);
      const leave = await storage.createLeave(data);
      res.json(leave);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create leave request" });
    }
  });
  
  app.patch("/api/leaves/:id/approve", async (req, res) => {
    try {
      const leave = await storage.updateLeave(parseInt(req.params.id), {
        status: "Approved",
        reviewed_at: new Date(),
        reviewed_by: "admin",
      });
      if (!leave) {
        return res.status(404).json({ error: "Leave request not found" });
      }
      res.json(leave);
    } catch (error) {
      res.status(500).json({ error: "Failed to approve leave" });
    }
  });
  
  app.patch("/api/leaves/:id/reject", async (req, res) => {
    try {
      const leave = await storage.updateLeave(parseInt(req.params.id), {
        status: "Rejected",
        reviewed_at: new Date(),
        reviewed_by: "admin",
      });
      if (!leave) {
        return res.status(404).json({ error: "Leave request not found" });
      }
      res.json(leave);
    } catch (error) {
      res.status(500).json({ error: "Failed to reject leave" });
    }
  });
  
  app.get("/api/indemnity", async (req, res) => {
    try {
      const indemnity = await storage.getIndemnity();
      res.json(indemnity);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch indemnity" });
    }
  });
  
  app.get("/api/reports", async (req, res) => {
    try {
      const month = (req.query.month as string | undefined) || "";
      if (!month) return res.status(400).json({ error: "month query param (MM-YYYY) is required" });

      const [emps, monthAttendance, monthPayroll] = await Promise.all([
        storage.getEmployees(),
        storage.getAttendance(month),
        storage.getPayroll(month),
      ]);

      const attMap = new Map<string, any>();
      for (const a of monthAttendance) attMap.set(a.emp_id, a);

      const payMap = new Map<string, any>();
      for (const p of monthPayroll) payMap.set(p.emp_id, p);

      const rows = emps.map((e) => {
        const a = attMap.get(e.emp_id);
        const p = payMap.get(e.emp_id);

        // Attendance-driven numbers
        const worked_days = a?.present_days ?? 0;
        const working_days = a?.working_days ?? 0;
        const normal_ot = Number(a?.ot_hours_normal ?? 0);
        const friday_ot = Number(a?.ot_hours_friday ?? 0);
        const holiday_ot = Number(a?.ot_hours_holiday ?? 0);

        // Base and rates from employee record
        const basic_salary = Number(e.basic_salary ?? 0);
        const rate_normal = Number(e.ot_rate_normal ?? 0);
        const rate_friday = Number(e.ot_rate_friday ?? 0);
        const rate_holiday = Number(e.ot_rate_holiday ?? 0);

        // Compute amounts from attendance if payroll row absent
        const ot_amount_calc = normal_ot * rate_normal + friday_ot * rate_friday + holiday_ot * rate_holiday;

        // Food allowance based on policy
        let food_allow_calc = 0;
        if (e.food_allowance_type === "per_day") {
          food_allow_calc = Number(e.food_allowance_amount ?? 0) * worked_days;
        } else if (e.food_allowance_type === "fixed") {
          food_allow_calc = Number(e.food_allowance_amount ?? 0);
        }

        // Prefer persisted payroll amounts if available, otherwise use calculated
        const food_allow = p ? Number(p.food_allowance ?? 0) : food_allow_calc;
        const ot_amount = p ? Number(p.ot_amount ?? 0) : ot_amount_calc;
        const deductions = p ? Number(p.deductions ?? 0) : 0;
        const gross_salary = p ? Number(p.gross_salary ?? 0) : (basic_salary + ot_amount + food_allow);
        const net_salary = p ? Number(p.net_salary ?? 0) : (gross_salary - deductions);

        return {
          emp_id: e.emp_id,
          name: e.name,
          designation: e.designation,
          department: e.department,
          salary: basic_salary,
          worked_days,
          working_days,
          normal_ot,
          friday_ot,
          holiday_ot,
          food_allow,
          deductions,
          gross_salary,
          total_earnings: net_salary,
          month,
        };
      });

      res.json(rows);
    } catch (error) {
      console.error("/api/reports error:", error);
      res.status(500).json({ error: "Failed to build report" });
    }
  });

  app.get("/api/indemnity/:empId", async (req, res) => {
    try {
      const indemnity = await storage.getIndemnityByEmployee(req.params.empId);
      if (!indemnity) {
        return res.status(404).json({ error: "Indemnity record not found" });
      }
      res.json(indemnity);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch indemnity" });
    }
  });
  
  app.post("/api/indemnity/calculate", async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      const indemnityRecords = [];
      
      for (const employee of employees) {
        const doj = new Date(employee.doj);
        const now = new Date();
        const yearsOfService = (now.getTime() - doj.getTime()) / (1000 * 60 * 60 * 24 * 365);
        
        const basicSalary = parseFloat(employee.basic_salary);
        let indemnityAmount = 0;
        
        if (yearsOfService <= 5) {
          indemnityAmount = (basicSalary * 15 / 30) * yearsOfService;
        } else {
          const firstFiveYears = (basicSalary * 15 / 30) * 5;
          const remainingYears = yearsOfService - 5;
          const afterFiveYears = (basicSalary * 30 / 30) * remainingYears;
          indemnityAmount = firstFiveYears + afterFiveYears;
        }
        
        const existing = await storage.getIndemnityByEmployee(employee.emp_id);
        
        if (existing) {
          await storage.updateIndemnity(employee.emp_id, {
            years_of_service: yearsOfService.toFixed(2),
            indemnity_amount: indemnityAmount.toFixed(2),
          });
        } else {
          indemnityRecords.push({
            emp_id: employee.emp_id,
            years_of_service: yearsOfService.toFixed(2),
            indemnity_amount: indemnityAmount.toFixed(2),
            status: "Active",
          });
        }
      }
      
      const created = await Promise.all(
        indemnityRecords.map(record => storage.createIndemnity(record))
      );
      
      res.json({ message: "Indemnity calculated successfully", created });
    } catch (error) {
      console.error("Indemnity calculation error:", error);
      res.status(500).json({ error: "Failed to calculate indemnity" });
    }
  });
  
  app.patch("/api/indemnity/:empId/pay", async (req, res) => {
    try {
      const indemnity = await storage.updateIndemnity(req.params.empId, {
        status: "Paid",
      });
      if (!indemnity) {
        return res.status(404).json({ error: "Indemnity record not found" });
      }
      res.json(indemnity);
    } catch (error) {
      res.status(500).json({ error: "Failed to process payment" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
