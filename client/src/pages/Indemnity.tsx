import { useState } from "react";
import IndemnityTable from "@/components/IndemnityTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Users } from "lucide-react";

const mockIndemnityRecords = [
  {
    emp_id: "101",
    emp_name: "John Smith",
    designation: "Site Engineer",
    doj: "2023-01-15",
    years_of_service: 2,
    basic_salary: 4500,
    indemnity_amount: 9000,
    status: "Active" as const
  },
  {
    emp_id: "102",
    emp_name: "Sarah Johnson",
    designation: "HR Manager",
    doj: "2022-06-20",
    years_of_service: 2.5,
    basic_salary: 5200,
    indemnity_amount: 13000,
    status: "Active" as const
  },
  {
    emp_id: "103",
    emp_name: "Ahmed Ali",
    designation: "Foreman",
    doj: "2023-03-10",
    years_of_service: 1.8,
    basic_salary: 3800,
    indemnity_amount: 6840,
    status: "Active" as const
  },
  {
    emp_id: "104",
    emp_name: "Maria Garcia",
    designation: "Accountant",
    doj: "2022-11-05",
    years_of_service: 2.2,
    basic_salary: 4800,
    indemnity_amount: 10560,
    status: "Active" as const
  },
  {
    emp_id: "105",
    emp_name: "David Chen",
    designation: "Site Supervisor",
    doj: "2021-02-28",
    years_of_service: 4,
    basic_salary: 4200,
    indemnity_amount: 16800,
    status: "Paid" as const
  },
];

export default function Indemnity() {
  const [records, setRecords] = useState(mockIndemnityRecords);

  const handlePay = (empId: string) => {
    console.log("Process indemnity payment for:", empId);
    setRecords(prev =>
      prev.map(record =>
        record.emp_id === empId ? { ...record, status: "Paid" as const } : record
      )
    );
  };

  const handleEdit = (record: any) => {
    console.log("Edit indemnity record:", record);
  };

  const totalIndemnity = records.reduce((acc, r) => acc + r.indemnity_amount, 0);
  const activeRecords = records.filter(r => r.status === "Active").length;
  const paidRecords = records.filter(r => r.status === "Paid").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Indemnity Management</h1>
        <p className="text-muted-foreground">
          Track and manage employee indemnity calculations and payments
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Indemnity Liability
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalIndemnity.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all employees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Records
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeRecords}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Current employees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Paid Out
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{paidRecords}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Completed payments
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Indemnity Records</CardTitle>
          <CardDescription>
            Employee end-of-service benefit calculations based on years of service
          </CardDescription>
        </CardHeader>
        <CardContent>
          <IndemnityTable
            records={records}
            onPay={handlePay}
            onEdit={handleEdit}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Calculation Method</CardTitle>
          <CardDescription>
            How indemnity is calculated for employees
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>Years 1-5:</strong> 21 days of basic salary per year of service
          </p>
          <p>
            <strong>Years 5+:</strong> 30 days of basic salary per year of service
          </p>
          <p className="text-muted-foreground mt-4">
            Note: Calculation assumes a standard formula. Actual amounts may vary based on
            employment contract terms and local labor laws.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
