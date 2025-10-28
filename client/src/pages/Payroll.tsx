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
import { supabase } from "../../../shared/supabaseClient"; 

export default function Payroll() {
  const [months, setMonths] = useState<{ value: string; label: string }[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [payrollData, setPayrollData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch distinct months from payroll on mount
useEffect(() => {
  async function fetchMonths() {
    const { data, error } = await supabase
      .from("payroll")
      .select("month");

    if (error) {
      console.error("Error fetching months:", error);
      return;
    }

    if (data && data.length > 0) {
      const uniqueMonths = Array.from(new Set(data.map(row => row.month)))
        .map(monthStr => ({
          value: monthStr,
          label: formatMonthLabel(monthStr),
        }))
        .sort((a, b) => (a.value < b.value ? 1 : -1));

      setMonths(uniqueMonths);
      setSelectedMonth(uniqueMonths[0].value);
    }
  }

  fetchMonths(); // Correct: call the function ONCE on mount
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
      const { data, error } = await supabase
        .from("payroll")
        .select("*")
        .eq("month", selectedMonth);

      if (error) {
        console.error("Error fetching payroll data:", error);
        setPayrollData([]);
      } else {
        setPayrollData(data || []);
      }
      setLoading(false);
    }

    fetchPayroll();
  }, [selectedMonth]);

  async function handleCalculate() {
    // Your calculation logic here or trigger backend API
    console.log("Calculate payroll for:", selectedMonth);
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
