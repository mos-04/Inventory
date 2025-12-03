import { useState, useEffect } from "react";
import EmployeeTable from "@/components/EmployeeTable";
import EmployeeForm from "@/components/EmployeeForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Removed mockEmployees; data now loaded from /api/employees

type AllowanceType = "per_day" | "fixed" | "none";

interface EmployeeRow {
  emp_id: string;
  name: string;
  designation: string;
  department: string;
  category: string;
  civil_id?: string | null;
  date_of_birth?: string | null;
  doj: string;
  internal_department_doj?: string | null;
  five_year_calc_date?: string | null;
  basic_salary: number;
  other_allowance: number;
  food_allowance_type: AllowanceType;
  food_allowance_amount: number;
  working_hours: number;
  indemnity_rate: number;
  status: string;
}

export default function Employees() {
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeRow | null>(null);

  async function loadEmployees() {
    try {
      const res = await fetch("/api/employees", { credentials: "include" });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      // Map DB employees to UI shape.
      const mapped: EmployeeRow[] = (data || []).map((e: any) => ({
        emp_id: e.emp_id,
        name: e.name,
        designation: e.designation,
        department: e.department || "-",
        category: e.category || "Direct",
        civil_id: e.civil_id || "",
        date_of_birth: e.date_of_birth || "",
        doj: e.doj,
        internal_department_doj: e.internal_department_doj || "",
        five_year_calc_date: e.five_year_calc_date || "",
        basic_salary: Number(e.basic_salary || 0),
        other_allowance: Number(e.other_allowance || 0),
        food_allowance_type: (e.food_allowance_type as AllowanceType) || "none",
        food_allowance_amount: Number(e.food_allowance_amount || 0),
        working_hours: Number(e.working_hours ?? 0) || 0,
        indemnity_rate: Number(e.indemnity_rate || 0),
        status: e.status || "active",
      }));
      setEmployees(mapped);
    } catch (err) {
      console.error("Failed to load employees", err);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleEdit = (employee: EmployeeRow) => {
    console.log("Edit employee:", employee);
    setEditingEmployee(employee);
    setIsDialogOpen(true);
  };

  const handleDelete = async (empId: string) => {
    try {
      const res = await fetch(`/api/employees/${encodeURIComponent(empId)}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      await loadEmployees();
    } catch (err) {
      console.error("Failed to delete employee", err);
      alert("Delete failed");
    }
  };

  const handleSubmit = async (data: any) => {
    // Map form data to InsertEmployee payload.
    const payload = {
      emp_id: data.emp_id,
      name: data.name,
      designation: data.designation,
      department: data.project || "General",
      category: data.category,
      civil_id: data.civil_id?.trim() || null,
      date_of_birth: data.date_of_birth || null,
      doj: data.doj,
      internal_department_doj: data.internal_department_doj || null,
      five_year_calc_date: data.five_year_calc_date || null,
      basic_salary: data.basic_salary,
      other_allowance: data.other_allowance || "0",
      food_allowance_type: data.food_allowance_type,
      food_allowance_amount: data.food_allowance_type === "none" ? "0" : data.food_allowance_value || "0",
      working_hours: data.working_hours ? Number(data.working_hours) : 8,
      indemnity_rate: data.indemnity_rate || "0",
      ot_rate_normal: "0",
      ot_rate_friday: "0",
      ot_rate_holiday: "0",
      status: editingEmployee?.status || "active",
    };

    try {
      if (editingEmployee) {
        const res = await fetch(`/api/employees/${encodeURIComponent(editingEmployee.emp_id)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await res.text());
      } else {
        const res = await fetch(`/api/employees`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await res.text());
      }
      await loadEmployees();
      setIsDialogOpen(false);
      setEditingEmployee(null);
    } catch (err) {
      console.error("Failed to save employee", err);
      alert("Save failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Employee Management</h1>
          <p className="text-muted-foreground">
            Manage your employee records and information
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingEmployee(null);
            setIsDialogOpen(true);
          }}
          data-testid="button-add-employee"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

      <EmployeeTable employees={employees} onEdit={handleEdit} onDelete={handleDelete} />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEmployee ? "Edit Employee" : "Add New Employee"}
            </DialogTitle>
          </DialogHeader>
          <EmployeeForm
            initialData={editingEmployee && {
              ...editingEmployee,
              project: editingEmployee.department,
              category: editingEmployee.category,
              civil_id: editingEmployee.civil_id || "",
              date_of_birth: editingEmployee.date_of_birth || "",
              doj: editingEmployee.doj,
              internal_department_doj: editingEmployee.internal_department_doj || "",
              five_year_calc_date: editingEmployee.five_year_calc_date || "",
              basic_salary: String(editingEmployee.basic_salary),
              other_allowance: editingEmployee.other_allowance !== undefined ? String(editingEmployee.other_allowance) : "",
              food_allowance_type: editingEmployee.food_allowance_type,
              food_allowance_value: editingEmployee.food_allowance_type === "none" ? "" : String(editingEmployee.food_allowance_amount ?? ""),
              working_hours: editingEmployee.working_hours !== undefined && editingEmployee.working_hours !== null ? String(editingEmployee.working_hours) : "",
              indemnity_rate: editingEmployee.indemnity_rate !== undefined ? String(editingEmployee.indemnity_rate) : "",
            }}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsDialogOpen(false);
              setEditingEmployee(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
