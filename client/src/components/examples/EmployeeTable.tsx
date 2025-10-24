import EmployeeTable from '../EmployeeTable';

const mockEmployees = [
  { emp_id: "101", name: "John Smith", designation: "Site Engineer", category: "Direct" as const, project: "Tower A", basic_salary: 4500, doj: "2023-01-15" },
  { emp_id: "102", name: "Sarah Johnson", designation: "HR Manager", category: "Indirect" as const, project: "Admin", basic_salary: 5200, doj: "2022-06-20" },
  { emp_id: "103", name: "Ahmed Ali", designation: "Foreman", category: "Direct" as const, project: "Tower B", basic_salary: 3800, doj: "2023-03-10" },
];

export default function EmployeeTableExample() {
  return (
    <div className="p-6 bg-background">
      <EmployeeTable
        employees={mockEmployees}
        onEdit={(emp) => console.log('Edit:', emp)}
        onDelete={(id) => console.log('Delete:', id)}
      />
    </div>
  );
}
