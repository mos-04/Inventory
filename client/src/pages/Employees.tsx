import { useState } from "react";
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

const mockEmployees = [
  { emp_id: "101", name: "John Smith", designation: "Site Engineer", category: "Direct" as const, project: "Tower A", basic_salary: 4500, doj: "2023-01-15" },
  { emp_id: "102", name: "Sarah Johnson", designation: "HR Manager", category: "Indirect" as const, project: "Admin", basic_salary: 5200, doj: "2022-06-20" },
  { emp_id: "103", name: "Ahmed Ali", designation: "Foreman", category: "Direct" as const, project: "Tower B", basic_salary: 3800, doj: "2023-03-10" },
  { emp_id: "104", name: "Maria Garcia", designation: "Accountant", category: "Indirect" as const, project: "Admin", basic_salary: 4800, doj: "2022-11-05" },
  { emp_id: "105", name: "David Chen", designation: "Site Supervisor", category: "Direct" as const, project: "Tower A", basic_salary: 4200, doj: "2023-02-28" },
];

export default function Employees() {
  const [employees, setEmployees] = useState(mockEmployees);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);

  const handleEdit = (employee: any) => {
    console.log("Edit employee:", employee);
    setEditingEmployee(employee);
    setIsDialogOpen(true);
  };

  const handleDelete = (empId: string) => {
    console.log("Delete employee:", empId);
    setEmployees(prev => prev.filter(emp => emp.emp_id !== empId));
  };

  const handleSubmit = (data: any) => {
    console.log("Form submitted:", data);
    if (editingEmployee) {
      setEmployees(prev => prev.map(emp => 
        emp.emp_id === editingEmployee.emp_id 
          ? { ...emp, ...data, basic_salary: Number(data.basic_salary) }
          : emp
      ));
    } else {
      setEmployees(prev => [...prev, { 
        ...data, 
        basic_salary: Number(data.basic_salary),
        category: data.category as "Direct" | "Indirect"
      }]);
    }
    setIsDialogOpen(false);
    setEditingEmployee(null);
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

      <EmployeeTable
        employees={employees}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEmployee ? "Edit Employee" : "Add New Employee"}
            </DialogTitle>
          </DialogHeader>
          <EmployeeForm
            initialData={editingEmployee}
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
