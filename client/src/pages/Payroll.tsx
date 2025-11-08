import { useState, useEffect } from "react";
import PayrollTable from "@/components/PayrollTable";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calculator } from "lucide-react";
// Supabase removed; using local REST API

export default function Payroll() {
  const [months, setMonths] = useState<{ value: string; label: string }[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [payrollData, setPayrollData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch distinct months from payroll on mount
useEffect(() => {
  async function fetchMonths() {
    try {
      const res = await fetch("/api/payroll", { credentials: "include" });
      if (!res.ok) throw new Error(await res.text());
      const all = await res.json();
      if (Array.isArray(all) && all.length > 0) {
        const uniqueMonths = Array.from(new Set(all.map((row: any) => row.month)))
          .map((monthStr) => ({ value: monthStr, label: formatMonthLabel(monthStr) }))
          .sort((a, b) => (a.value < b.value ? 1 : -1));
        setMonths(uniqueMonths);
        setSelectedMonth(uniqueMonths[0].value);
      }
    } catch (err) {
      console.error("Error fetching months:", err);
    }
  }

  fetchMonths();
}, []);


  // Format MM-YYYY to readable e.g. "January 2025"
  function formatMonthLabel(monthStr: string) {
    const [mm, yyyy] = monthStr.split("-");
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    const monthIndex = parseInt(mm, 10) - 1;
    return `${monthNames[monthIndex]} ${yyyy}`;
  }

  // Fetch payroll data when selectedMonth changes
  useEffect(() => {
    if (!selectedMonth) return;

    async function fetchPayroll() {
      setLoading(true);
      try {
        const res = await fetch(`/api/payroll?month=${encodeURIComponent(selectedMonth)}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setPayrollData(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching payroll data:", err);
        setPayrollData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPayroll();
  }, [selectedMonth]);

  async function handleCalculate() {
    if (!selectedMonth) return;
    try {
      setLoading(true);
      const res = await fetch("/api/payroll/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ month: selectedMonth }),
      });
      if (!res.ok) throw new Error(await res.text());
      const created = await res.json();
      // Refresh list
      const listRes = await fetch(`/api/payroll?month=${encodeURIComponent(selectedMonth)}`, {
        credentials: "include",
      });
      setPayrollData(listRes.ok ? await listRes.json() : created || []);
    } catch (err) {
      console.error("Failed to generate payroll:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(data: any[]) {
    // Save logic as before
  }

  async function handleApprove(data: any[]) {
    // Approve logic as before
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Generate Payroll</h1>
        <p className="text-muted-foreground">
          Calculate and approve monthly salary payments
        </p>
      </div>

      <div className="flex items-end gap-4">
        <div className="max-w-xs flex-1">
          <Label htmlFor="payroll-month" className="text-sm font-medium mb-2 block">
            Select Month
          </Label>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger id="payroll-month" className="h-10" data-testid="select-payroll-month">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
  {months.length === 0 ? (
    <SelectItem disabled value="no-data">
      No months found
    </SelectItem>
  ) : (
    months.map((month) => (
      <SelectItem key={month.value} value={month.value}>
        {month.label}
      </SelectItem>
    ))
  )}
</SelectContent>
          </Select>
        </div>
        <Button onClick={handleCalculate} data-testid="button-calculate" disabled={!selectedMonth}>
          <Calculator className="h-4 w-4 mr-2" />
          Calculate Payroll
        </Button>
      </div>

      {loading ? (
        <p>Loading payroll data...</p>
      ) : payrollData.length > 0 ? (
        <PayrollTable data={payrollData} onSave={handleSave} onApprove={handleApprove} />
      ) : (
        <p>No payroll data available for {formatMonthLabel(selectedMonth)}</p>
      )}
    </div>
  );
}
