import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// Badge removed: category no longer displayed.

interface EmployeeRow {
  emp_id: string;
  name: string;
  designation: string;
  department: string;
  basic_salary: number;
  doj: string;
}

interface EmployeeTableProps {
  employees: EmployeeRow[];
  onEdit?: (employee: EmployeeRow) => void;
  onDelete?: (empId: string) => void;
}

export default function EmployeeTable({ employees, onEdit, onDelete }: EmployeeTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.emp_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10"
            data-testid="input-search-employees"
          />
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="sticky top-0 bg-muted/50">
            <TableRow>
              <TableHead className="font-semibold">Emp ID</TableHead>
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Designation</TableHead>
              <TableHead className="font-semibold">Department</TableHead>
              <TableHead className="font-semibold text-right">Salary</TableHead>
              <TableHead className="font-semibold">DOJ</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.map((employee, index) => (
              <TableRow
                key={employee.emp_id}
                className="hover-elevate"
                data-testid={`row-employee-${employee.emp_id}`}
              >
                <TableCell className="font-mono text-sm">{employee.emp_id}</TableCell>
                <TableCell className="font-medium">{employee.name}</TableCell>
                <TableCell className="text-sm">{employee.designation}</TableCell>
                <TableCell className="text-sm">{employee.department}</TableCell>
                <TableCell className="text-right font-mono text-sm">
                  ${employee.basic_salary.toLocaleString()}
                </TableCell>
                <TableCell className="text-sm">{employee.doj}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onEdit?.(employee)}
                      data-testid={`button-edit-${employee.emp_id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onDelete?.(employee.emp_id)}
                      data-testid={`button-delete-${employee.emp_id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredEmployees.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No employees found
        </div>
      )}
    </div>
  );
}
