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

interface EmployeeRow {
  emp_id: string;
  name: string;
  designation: string;
  department: string;
  basic_salary: number;
  doj: string;
}

export default function Employees() {
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);

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
        basic_salary: Number(e.basic_salary || 0),
        doj: e.doj,
      }));
      setEmployees(mapped);
    } catch (err) {
      console.error("Failed to load employees", err);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleEdit = (employee: any) => {
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
      doj: data.doj,
      basic_salary: data.basic_salary,
      food_allowance_type: data.food_allowance_type,
      food_allowance_amount: data.food_allowance_type === "none" ? "0" : data.food_allowance_value || "0",
      ot_rate_normal: "0",
      ot_rate_friday: "0",
      ot_rate_holiday: "0",
      status: "active",
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
              basic_salary: String(editingEmployee.basic_salary),
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
