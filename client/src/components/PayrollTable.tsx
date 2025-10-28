import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil } from "lucide-react";
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
  basic_salary: number;
  ot_amount: number;
  food_allowance: number;
  gross_salary: number;
  deductions: number;
  net_salary: number;
  generated_at?: string;
  comment?: string;
}

interface PayrollTableProps {
  data: PayrollRow[];
  onSave?: (data: PayrollRow[]) => void;
  onApprove?: (data: PayrollRow[]) => void;
}

export default function PayrollTable({ data, onSave, onApprove }: PayrollTableProps) {
  const [payrollData, setPayrollData] = useState<PayrollRow[]>(data);
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; field: string } | null>(null);

  const updateCell = (rowIndex: number, field: keyof PayrollRow, value: string | number) => {
    setPayrollData((prev) => {
      const newData = [...prev];
      newData[rowIndex] = { ...newData[rowIndex], [field]: value };

      if (
        ["basic_salary", "ot_amount", "food_allowance", "deductions"].includes(field)
      ) {
        const row = newData[rowIndex];
        const basic = Number(row.basic_salary ?? 0);
        const ot = Number(row.ot_amount ?? 0);
        const food = Number(row.food_allowance ?? 0);
        const deduct = Number(row.deductions ?? 0);
        const gross = basic + ot + food;
        const net = gross - deduct;
        row.gross_salary = gross;
        row.net_salary = net;
      }

      return newData;
    });
  };

  const handleSave = () => {
    onSave?.(payrollData);
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
              <TableHead className="font-semibold">Basic Salary</TableHead>
              <TableHead className="font-semibold">OT Amount</TableHead>
              <TableHead className="font-semibold">Food Allowance</TableHead>
              <TableHead className="font-semibold">Gross Salary</TableHead>
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
                    value={row.basic_salary ?? 0}
                    onChange={(e) => updateCell(rowIndex, "basic_salary", Number(e.target.value))}
                    className="w-32"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={row.ot_amount ?? 0}
                    onChange={(e) => updateCell(rowIndex, "ot_amount", Number(e.target.value))}
                    className="w-32"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={row.food_allowance ?? 0}
                    onChange={(e) => updateCell(rowIndex, "food_allowance", Number(e.target.value))}
                    className="w-32"
                  />
                </TableCell>
                <TableCell className="font-mono text-right">{(row.gross_salary ?? 0).toFixed(2)}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={row.deductions ?? 0}
                    onChange={(e) => updateCell(rowIndex, "deductions", Number(e.target.value))}
                    className="w-32"
                  />
                </TableCell>
                <TableCell className="font-mono text-right font-semibold">{(row.net_salary ?? 0).toFixed(2)}</TableCell>
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
        <Button variant="outline" onClick={handleSave} data-testid="button-save-draft">Save Draft</Button>
        <Button onClick={handleApprove} data-testid="button-approve-payroll">Approve & Generate Sheet</Button>
      </div>
    </div>
  );
}
