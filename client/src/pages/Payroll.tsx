import { useState } from "react";
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

const mockPayrollData = [
  {
    emp_id: "101",
    name: "John Smith",
    designation: "Site Engineer",
    worked_days: 26,
    salary_earned: 4500,
    fot_earned: 150,
    hot_earned: 75,
    food_allow: 260,
    allow_other: 0,
    not_earned: 0,
    deductions: 0,
    total_earnings: 4985,
    comment: ""
  },
  {
    emp_id: "102",
    name: "Sarah Johnson",
    designation: "HR Manager",
    worked_days: 24,
    salary_earned: 4800,
    fot_earned: 0,
    hot_earned: 120,
    food_allow: 240,
    allow_other: 100,
    not_earned: 400,
    deductions: 50,
    total_earnings: 4810,
    comment: "Advanced payment deducted"
  },
  {
    emp_id: "103",
    name: "Ahmed Ali",
    designation: "Foreman",
    worked_days: 26,
    salary_earned: 3800,
    fot_earned: 75,
    hot_earned: 0,
    food_allow: 260,
    allow_other: 0,
    not_earned: 0,
    deductions: 0,
    total_earnings: 4135,
    comment: ""
  },
];

export default function Payroll() {
  const [selectedMonth, setSelectedMonth] = useState("01-2025");
  const [payrollData, setPayrollData] = useState(mockPayrollData);

  const months = [
    { value: "12-2024", label: "December 2024" },
    { value: "01-2025", label: "January 2025" },
    { value: "02-2025", label: "February 2025" },
  ];

  const handleCalculate = () => {
    console.log("Calculate payroll for:", selectedMonth);
    setPayrollData(mockPayrollData);
  };

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
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleCalculate} data-testid="button-calculate">
          <Calculator className="h-4 w-4 mr-2" />
          Calculate Payroll
        </Button>
      </div>

      {payrollData.length > 0 && (
        <PayrollTable
          data={payrollData}
          onSave={(data) => console.log("Save draft:", data)}
          onApprove={(data) => console.log("Approve and generate:", data)}
        />
      )}
    </div>
  );
}
