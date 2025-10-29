import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEmployeeSchema, insertAttendanceSchema, insertPayrollSchema, insertLeaveSchema, insertIndemnitySchema } from "@shared/schema";
import { z } from "zod";


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
        try {
          if (error instanceof Error) {
            body.details = error.message;
            body.stack = error.stack;
            // Attach pg error codes if present
            const anyErr: any = error as any;
            if (anyErr.code) body.code = anyErr.code;
            if (anyErr.detail) body.detail = anyErr.detail;
            if (anyErr.hint) body.hint = anyErr.hint;
            if (anyErr.table) body.table = anyErr.table;
            if (anyErr.schema) body.schema = anyErr.schema;
            if (anyErr.constraint) body.constraint = anyErr.constraint;
          } else {
            body.details = JSON.stringify(error);
          }
        } catch {
          body.details = String(error);
        }
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
      
      const payrolls = [];
      
      for (const employee of employees) {
        const empAttendance = attendances.find(a => a.emp_id === employee.emp_id);
        
        if (!empAttendance) {
          continue;
        }
        
        const basicSalary = parseFloat(employee.basic_salary);
        const otRateNormal = parseFloat(employee.ot_rate_normal);
        const otRateFriday = parseFloat(employee.ot_rate_friday);
        const otRateHoliday = parseFloat(employee.ot_rate_holiday);
        
        const otHoursNormal = parseFloat(empAttendance.ot_hours_normal);
        const otHoursFriday = parseFloat(empAttendance.ot_hours_friday);
        const otHoursHoliday = parseFloat(empAttendance.ot_hours_holiday);
        
        const otAmount = 
          (otHoursNormal * otRateNormal) +
          (otHoursFriday * otRateFriday) +
          (otHoursHoliday * otRateHoliday);
        
        let foodAllowance = 0;
        if (employee.food_allowance_type === "per_day") {
          foodAllowance = parseFloat(employee.food_allowance_amount) * empAttendance.present_days;
        } else if (employee.food_allowance_type === "fixed") {
          foodAllowance = parseFloat(employee.food_allowance_amount);
        }
        
        const grossSalary = basicSalary + otAmount + foodAllowance;
        const deductions = 0;
        const netSalary = grossSalary - deductions;
        
        payrolls.push({
          emp_id: employee.emp_id,
          month,
          basic_salary: basicSalary.toFixed(2),
          ot_amount: otAmount.toFixed(2),
          food_allowance: foodAllowance.toFixed(2),
          gross_salary: grossSalary.toFixed(2),
          deductions: deductions.toFixed(2),
          net_salary: netSalary.toFixed(2),
        });
      }
      
      const created = await storage.bulkCreatePayroll(payrolls);
      res.json(created);
    } catch (error) {
      console.error("Payroll generation error:", error);
      res.status(500).json({ error: "Failed to generate payroll" });
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
          indemnityAmount = (basicSalary * 21 / 30) * yearsOfService;
        } else {
          const firstFiveYears = (basicSalary * 21 / 30) * 5;
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
