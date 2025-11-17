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
import { Calculator, RefreshCw } from "lucide-react";

export default function Payroll() {
  const [months, setMonths] = useState<{ value: string; label: string }[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [payrollData, setPayrollData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);

  // Generate months dynamically (same as attendance page)
  useEffect(() => {
    function generateMonths() {
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
      ];

      const now = new Date();
      const allMonths = [];

      // Generate 12 months back + current month + 6 months forward
      for (let i = -12; i <= 6; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const yyyy = date.getFullYear();
        const value = `${mm}-${yyyy}`;
        const label = `${monthNames[date.getMonth()]} ${yyyy}`;
        allMonths.push({ value, label });
      }

      // Sort by date (newest first)
      allMonths.sort((a, b) => (a.value < b.value ? 1 : -1));

      return allMonths;
    }

    const generatedMonths = generateMonths();
    setMonths(generatedMonths);
    
    // Set current month as default
    const now = new Date();
    const currentMonth = `${String(now.getMonth() + 1).padStart(2, "0")}-${now.getFullYear()}`;
    setSelectedMonth(currentMonth);
  }, []);

  // Format MM-YYYY to readable e.g. "January 2025"
  function formatMonthLabel(monthStr: string) {
    if (!monthStr) return "";
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

  // Calculate payroll for selected month
  async function handleCalculate() {
    if (!selectedMonth) {
      alert("Please select a month");
      return;
    }
    else{
      alert("Payroll calculation in progress. Please do not navigate away from the page.");
    
    }

    const confirmed = window.confirm(
      `Generate payroll for ${formatMonthLabel(selectedMonth)}? This will calculate salary based on attendance data.`
    );
    if (!confirmed) return;

    setCalculating(true);
    try {
      const res = await fetch("/api/payroll/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ month: selectedMonth }),
      });
      
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Failed to generate payroll");
      }
      
      const result = await res.json();
      
      // Show detailed message
      let message = result.message || `Payroll generated successfully for ${result.count || 0} employees`;
      
      if (result.warnings && result.warnings.length > 0) {
        const warningList = result.warnings
          .map((w: any) => `- ${w.emp_id} (${w.name}): ${w.error}`)
          .join('\n');
        message += `\n\nWarnings:\n${warningList}`;
      }
      
      alert(message);
      
      // Refresh payroll data
      const listRes = await fetch(`/api/payroll?month=${encodeURIComponent(selectedMonth)}`, {
        credentials: "include",
      });
      if (listRes.ok) {
        const data = await listRes.json();
        setPayrollData(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to generate payroll:", err);
      alert(`Failed to generate payroll: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setCalculating(false);
    }
  }

  // Refresh data manually
  async function handleRefresh() {
    if (!selectedMonth) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/payroll?month=${encodeURIComponent(selectedMonth)}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setPayrollData(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to refresh payroll:", err);
    } finally {
      setLoading(false);
    }
  }

  // Save edited payroll data
  async function handleSave(data: any[]) {
    if (!selectedMonth) return;
    
    setLoading(true);
    try {
      // Update each payroll record
      for (const row of data) {
        const res = await fetch(`/api/payroll/${row.emp_id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            month: selectedMonth,
            basic_salary: row.basic_salary,
            ot_amount: row.ot_amount,
            food_allowance: row.food_allowance,
            gross_salary: row.gross_salary,
            deductions: row.deductions,
            net_salary: row.net_salary,
            comment: row.comment,
          }),
        });

        if (!res.ok) {
          throw new Error(`Failed to save payroll for ${row.emp_id}`);
        }
      }

      alert("Payroll saved successfully");
      await handleRefresh();
    } catch (err) {
      console.error("Error saving payroll:", err);
      alert(`Failed to save payroll: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  // Approve and finalize payroll
  async function handleApprove(data: any[]) {
    const confirmed = window.confirm(
      `Approve and finalize payroll for ${formatMonthLabel(selectedMonth)}? This action cannot be undone.`
    );

    if (!confirmed) return;

    // First save the data
    await handleSave(data);

    alert("Payroll approved and finalized successfully!");
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Generate Payroll</h1>
          <p className="text-muted-foreground">
            Calculate and approve monthly salary payments
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={loading || !selectedMonth}
          data-testid="button-refresh"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
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
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={handleCalculate}
          data-testid="button-calculate"
          disabled={!selectedMonth || calculating || loading}
        >
          <Calculator className="h-4 w-4 mr-2" />
          {calculating ? "Calculating..." : "Calculate Payroll"}
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading payroll data...</p>
        </div>
      ) : payrollData.length > 0 ? (
        <PayrollTable data={payrollData} onSave={handleSave} onApprove={handleApprove} />
      ) : (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">
            No payroll data available for {formatMonthLabel(selectedMonth)}
          </p>
          <p className="text-sm text-muted-foreground">
            Click "Calculate Payroll" to generate salary data based on attendance records
          </p>
        </div>
      )}
    </div>
  );
}
