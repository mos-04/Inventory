import { useEffect, useState } from "react";
import IndemnityTable from "@/components/IndemnityTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Users } from "lucide-react";
interface EmployeeLite { emp_id: string; name: string; designation: string; doj: string; basic_salary: string; }
interface IndemnityRow { emp_id: string; years_of_service: number; indemnity_amount: number; status: "Active"|"Paid"|"Pending"; }

export default function Indemnity() {
  const [records, setRecords] = useState<any[]>([]);
  const [employees, setEmployees] = useState<Record<string, EmployeeLite>>({});

  async function loadData() {
    try {
      const [indRes, empRes] = await Promise.all([
        fetch("/api/indemnity", { credentials: "include" }),
        fetch("/api/employees", { credentials: "include" })
      ]);
      const indemnity = indRes.ok ? await indRes.json() : [];
      const emps = empRes.ok ? await empRes.json() : [];
      const map: Record<string, EmployeeLite> = {};
      (emps || []).forEach((e: any) => { map[e.emp_id] = { emp_id: e.emp_id, name: e.name, designation: e.designation, doj: e.doj, basic_salary: e.basic_salary }; });
      setEmployees(map);
      const tableRows = (indemnity || []).map((r: any) => ({
        emp_id: r.emp_id,
        emp_name: map[r.emp_id]?.name || r.emp_id,
        designation: map[r.emp_id]?.designation || "",
        doj: map[r.emp_id]?.doj || "",
        years_of_service: Number(r.years_of_service || 0),
        basic_salary: Number(map[r.emp_id]?.basic_salary || 0),
        indemnity_amount: Number(r.indemnity_amount || 0),
        status: r.status as "Active"|"Paid"|"Pending",
      }));
      setRecords(tableRows);
    } catch (err) {
      console.error("Failed to load indemnity data", err);
    }
  }

  useEffect(() => { loadData(); }, []);

  const handlePay = async (empId: string) => {
    // No dedicated pay endpoint; if needed, this could call an update route when available.
    alert("Mark as paid not implemented on server yet.");
  };

  const handleEdit = (record: any) => {
    console.log("Edit indemnity record:", record);
  };

  const totalIndemnity = records.reduce((acc, r: any) => acc + r.indemnity_amount, 0);
  const activeRecords = records.filter((r: any) => r.status === "Active").length;
  const paidRecords = records.filter((r: any) => r.status === "Paid").length;

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
          <IndemnityTable records={records} onPay={handlePay} onEdit={handleEdit} />
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
