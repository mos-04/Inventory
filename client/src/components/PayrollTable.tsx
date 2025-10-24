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
  emp_id: string;
  name: string;
  designation: string;
  worked_days: number;
  salary_earned: number;
  fot_earned: number;
  hot_earned: number;
  food_allow: number;
  allow_other: number;
  not_earned: number;
  deductions: number;
  total_earnings: number;
  comment: string;
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
    setPayrollData(prev => {
      const newData = [...prev];
      newData[rowIndex] = { ...newData[rowIndex], [field]: value };
      
      if (field === 'allow_other' || field === 'deductions') {
        const row = newData[rowIndex];
        row.total_earnings = 
          row.salary_earned + 
          row.fot_earned + 
          row.hot_earned + 
          row.food_allow + 
          Number(row.allow_other) - 
          row.not_earned - 
          Number(row.deductions);
      }
      
      return newData;
    });
  };

  const handleSave = () => {
    console.log("Saving payroll data:", payrollData);
    onSave?.(payrollData);
  };

  const handleApprove = () => {
    console.log("Approving payroll:", payrollData);
    onApprove?.(payrollData);
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-muted/50 z-10">
            <TableRow>
              <TableHead className="font-semibold sticky left-0 bg-muted/50 z-20">Emp ID</TableHead>
              <TableHead className="font-semibold sticky left-20 bg-muted/50 z-20">Name</TableHead>
              <TableHead className="font-semibold">Designation</TableHead>
              <TableHead className="font-semibold text-right">Worked Days</TableHead>
              <TableHead className="font-semibold text-right">Salary Earned</TableHead>
              <TableHead className="font-semibold text-right">FOT Earned</TableHead>
              <TableHead className="font-semibold text-right">HOT Earned</TableHead>
              <TableHead className="font-semibold text-right">Food Allow</TableHead>
              <TableHead className="font-semibold text-right">Other Allow</TableHead>
              <TableHead className="font-semibold text-right">Not Earned</TableHead>
              <TableHead className="font-semibold text-right">Deductions</TableHead>
              <TableHead className="font-semibold text-right">Total</TableHead>
              <TableHead className="font-semibold min-w-48">Comments</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payrollData.map((row, rowIndex) => (
              <TableRow key={row.emp_id} className="hover-elevate" data-testid={`row-payroll-${row.emp_id}`}>
                <TableCell className="font-mono text-sm sticky left-0 bg-background">{row.emp_id}</TableCell>
                <TableCell className="font-medium sticky left-20 bg-background">{row.name}</TableCell>
                <TableCell className="text-sm">{row.designation}</TableCell>
                <TableCell className="text-right font-mono text-sm bg-muted/30">{row.worked_days}</TableCell>
                <TableCell className="text-right font-mono text-sm bg-muted/30">
                  ${row.salary_earned.toFixed(2)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm bg-muted/30">
                  ${row.fot_earned.toFixed(2)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm bg-muted/30">
                  ${row.hot_earned.toFixed(2)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm bg-muted/30">
                  ${row.food_allow.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  {editingCell?.rowIndex === rowIndex && editingCell.field === 'allow_other' ? (
                    <Input
                      type="number"
                      value={row.allow_other}
                      onChange={(e) => updateCell(rowIndex, 'allow_other', Number(e.target.value))}
                      onBlur={() => setEditingCell(null)}
                      autoFocus
                      className="h-8 w-24 text-right font-mono"
                    />
                  ) : (
                    <div
                      className="flex items-center justify-end gap-1 cursor-pointer hover-elevate active-elevate-2 px-2 py-1 rounded"
                      onClick={() => setEditingCell({ rowIndex, field: 'allow_other' })}
                    >
                      <span className="font-mono text-sm">${row.allow_other.toFixed(2)}</span>
                      <Pencil className="h-3 w-3 text-muted-foreground" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right font-mono text-sm bg-muted/30">
                  ${row.not_earned.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  {editingCell?.rowIndex === rowIndex && editingCell.field === 'deductions' ? (
                    <Input
                      type="number"
                      value={row.deductions}
                      onChange={(e) => updateCell(rowIndex, 'deductions', Number(e.target.value))}
                      onBlur={() => setEditingCell(null)}
                      autoFocus
                      className="h-8 w-24 text-right font-mono"
                    />
                  ) : (
                    <div
                      className="flex items-center justify-end gap-1 cursor-pointer hover-elevate active-elevate-2 px-2 py-1 rounded"
                      onClick={() => setEditingCell({ rowIndex, field: 'deductions' })}
                    >
                      <span className="font-mono text-sm">${row.deductions.toFixed(2)}</span>
                      <Pencil className="h-3 w-3 text-muted-foreground" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right font-mono text-sm font-semibold">
                  ${row.total_earnings.toFixed(2)}
                </TableCell>
                <TableCell>
                  {editingCell?.rowIndex === rowIndex && editingCell.field === 'comment' ? (
                    <Textarea
                      value={row.comment}
                      onChange={(e) => updateCell(rowIndex, 'comment', e.target.value)}
                      onBlur={() => setEditingCell(null)}
                      autoFocus
                      className="min-h-16 text-sm"
                    />
                  ) : (
                    <div
                      className="cursor-pointer hover-elevate active-elevate-2 px-2 py-1 rounded min-h-8 flex items-center gap-2"
                      onClick={() => setEditingCell({ rowIndex, field: 'comment' })}
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
        <Button
          variant="outline"
          onClick={handleSave}
          data-testid="button-save-draft"
        >
          Save Draft
        </Button>
        <Button
          onClick={handleApprove}
          data-testid="button-approve-payroll"
        >
          Approve & Generate Sheet
        </Button>
      </div>
    </div>
  );
}
