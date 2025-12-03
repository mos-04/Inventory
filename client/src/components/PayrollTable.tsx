import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PayrollRow {
  id?: number;
  emp_id: string;
  month?: string;
  basic_salary: string | number;
  ot_amount: string | number;
  food_allowance: string | number;
  gross_salary?: string | number;
  days_worked?: string | number;
  deductions: string | number;
  net_salary: string | number;
  generated_at?: string | Date;
  comment?: string;
  contract_basic_salary?: string | number;
  working_days?: string | number;
  hours_per_day?: string | number;
  scheduled_hours?: string | number;
}

interface PayrollTableProps {
  data: PayrollRow[];
  onSave?: (data: PayrollRow[]) => void;
  onApprove?: (data: PayrollRow[]) => void;
}

const DEFAULT_HOURS_PER_DAY = 8;
const DEFAULT_MONTH_WORKING_DAYS = 26;

const toNumber = (value: string | number | undefined | null, fallback = 0): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

 const recalcPayrollRow = (row: PayrollRow): PayrollRow => {
  // 1. Get standard inputs
  const hoursPerDay = toNumber(row.hours_per_day, DEFAULT_HOURS_PER_DAY);
  
  // "working_days" = Total available working days in the month (e.g., 26 or 30)
  // If this is missing from your data, you must provide a default (e.g., 26) or the math breaks.
  const rawWorkingDays = toNumber(row.working_days, 0);
  // Guard against attendance uploads that duplicated days_worked into working_days
  const totalMonthWorkingDays = rawWorkingDays > toNumber(row.days_worked, 0)
    ? rawWorkingDays
    : Math.max(DEFAULT_MONTH_WORKING_DAYS, toNumber(row.days_worked, 0)); 
  
  // "days_worked" = Actual days the employee attended
  const daysWorked = toNumber(row.days_worked, 0);
  
  // "contract_basic_salary" = The full monthly salary per contract
  // Fallback to basic_salary if contract field is missing
  const contractBasic = toNumber(row.contract_basic_salary, toNumber(row.basic_salary, 0));

  // 2. Calculate Hourly Rate
  // Formula: Contract Basic / (Total Month Days * Hours Per Day)
  const totalScheduledHours = totalMonthWorkingDays * hoursPerDay;
  let hourlyRate = 0;
  
  if (totalScheduledHours > 0) {
    hourlyRate = contractBasic / totalScheduledHours;
  }

  // 3. Calculate Earned Basic (The "Hourly * Worked" part)
  const totalWorkedHours = daysWorked * hoursPerDay;
  const earnedBasic = hourlyRate * totalWorkedHours;

  // 4. Allowances & Deductions
  const ot = toNumber(row.ot_amount, 0);
  const food = toNumber(row.food_allowance, 0);
  const deductions = toNumber(row.deductions, 0);

  // 5. Final Calculations
  // Gross = Earned Basic (based on hourly) + OT + Food
  const gross = earnedBasic + ot + food;
  const net = gross - deductions;

  return {
    ...row,
    contract_basic_salary: contractBasic,
    hours_per_day: hoursPerDay,
    working_days: totalMonthWorkingDays,
    // Update basic_salary to show the Calculated/Earned amount, not the Contract amount
    basic_salary: earnedBasic, 
    gross_salary: gross,
    net_salary: net,
  };
};

const normalizeRows = (rows: PayrollRow[]): PayrollRow[] => rows.map((row) => recalcPayrollRow({ ...row }));

export default function PayrollTable({ data, onSave, onApprove }: PayrollTableProps) {
  const [payrollData, setPayrollData] = useState<PayrollRow[]>(() => normalizeRows(data));
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; field: string } | null>(null);

  useEffect(() => {
    setPayrollData(normalizeRows(data));
  }, [data]);

  const updateCell = (rowIndex: number, field: keyof PayrollRow, value: string | number) => {
    setPayrollData((prev) => {
      const newData = [...prev];
      const updatedRow: PayrollRow = { ...newData[rowIndex], [field]: value };
      newData[rowIndex] = recalcPayrollRow(updatedRow);
      return newData;
    });
  };

  const handleApprove = () => {
    onApprove?.(payrollData);
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-muted/50 z-10">
            <TableRow>
              <TableHead className="font-semibold sticky left-0 bg-muted/50 z-20">Emp ID</TableHead>
              <TableHead className="font-semibold">Gross Salary</TableHead>
              <TableHead className="font-semibold">OT Amount</TableHead>
              <TableHead className="font-semibold">Food Allowance</TableHead>
              <TableHead className="font-semibold">Days Worked</TableHead>
              <TableHead className="font-semibold">Deductions</TableHead>
              <TableHead className="font-semibold">Net Salary</TableHead>
              <TableHead className="min-w-48 font-semibold">Comments</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payrollData.map((row, rowIndex) => (
              <TableRow key={row.emp_id + (row.month ?? "")} className="hover-elevate" data-testid={`row-payroll-${row.emp_id}`}>
                <TableCell className="font-mono text-sm sticky left-0 bg-background">{row.emp_id}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={Number(row.basic_salary ?? 0).toFixed(2)}
                    readOnly
                    title={`Derived from contract basic × attendance. Contract: ${toNumber(row.contract_basic_salary, Number(row.basic_salary ?? 0)).toFixed(2)} KWD`}
                    className="w-32 bg-muted/40 cursor-not-allowed"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={Number(row.ot_amount ?? 0)}
                    onChange={(e) => updateCell(rowIndex, "ot_amount", Number(e.target.value))}
                    className="w-32"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={Number(row.food_allowance ?? 0)}
                    onChange={(e) => updateCell(rowIndex, "food_allowance", Number(e.target.value))}
                    className="w-32"
                  />
                </TableCell>
                <TableCell className="font-mono text-center">
                  {row.days_worked !== undefined && row.days_worked !== null
                    ? Number(row.days_worked).toFixed(0)
                    : "-"}
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={Number(row.deductions ?? 0)}
                    onChange={(e) => updateCell(rowIndex, "deductions", Number(e.target.value))}
                    className="w-32"
                  />
                </TableCell>
                <TableCell className="font-mono text-right font-semibold">{Number(row.net_salary ?? 0).toFixed(2)}</TableCell>
                <TableCell>
                  {editingCell?.rowIndex === rowIndex && editingCell.field === "comment" ? (
                    <Textarea
                      value={row.comment ?? ""}
                      onChange={(e) => updateCell(rowIndex, "comment", e.target.value)}
                      onBlur={() => setEditingCell(null)}
                      autoFocus
                      className="min-h-16 text-sm"
                    />
                  ) : (
                    <div
                      className="cursor-pointer hover-elevate active-elevate-2 px-2 py-1 rounded min-h-8 flex items-center gap-2"
                      onClick={() => setEditingCell({ rowIndex, field: "comment" })}
                    >
                      <span className="text-sm flex-1">{row.comment || "Add comment..."}</span>
                      <Pencil className="h-3 w-3 text-muted-foreground" />
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button onClick={handleApprove} data-testid="button-approve-payroll">
          <Download className="h-4 w-4 mr-2" />
          Download File
        </Button>
      </div>
    </div>
  );
}
