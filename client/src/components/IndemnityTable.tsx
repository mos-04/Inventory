import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pencil, DollarSign } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface IndemnityRecord {
  emp_id: string;
  emp_name: string;
  designation: string;
  doj: string;
  years_of_service: number;
  basic_salary: number;
  indemnity_amount: number;
  status: "Active" | "Paid" | "Pending";
}

interface IndemnityTableProps {
  records: IndemnityRecord[];
  onPay?: (empId: string) => void;
  onEdit?: (record: IndemnityRecord) => void;
}

export default function IndemnityTable({ records, onPay, onEdit }: IndemnityTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "default";
      case "Paid":
        return "secondary";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="sticky top-0 bg-muted/50">
            <TableRow>
              <TableHead className="font-semibold">Emp ID</TableHead>
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Designation</TableHead>
              <TableHead className="font-semibold">DOJ</TableHead>
              <TableHead className="font-semibold text-right">Years of Service</TableHead>
              <TableHead className="font-semibold text-right">Basic Salary</TableHead>
              <TableHead className="font-semibold text-right">Indemnity Amount</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.emp_id} className="hover-elevate" data-testid={`row-indemnity-${record.emp_id}`}>
                <TableCell className="font-mono text-sm">{record.emp_id}</TableCell>
                <TableCell className="font-medium">{record.emp_name}</TableCell>
                <TableCell className="text-sm">{record.designation}</TableCell>
                <TableCell className="text-sm">{record.doj}</TableCell>
                <TableCell className="text-right font-mono text-sm">{record.years_of_service}</TableCell>
                <TableCell className="text-right font-mono text-sm">
                  ${record.basic_salary.toLocaleString()}
                </TableCell>
                <TableCell className="text-right font-mono text-sm font-semibold">
                  ${record.indemnity_amount.toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(record.status)}>
                    {record.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onEdit?.(record)}
                      data-testid={`button-edit-indemnity-${record.emp_id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {record.status === "Active" && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onPay?.(record.emp_id)}
                        data-testid={`button-pay-indemnity-${record.emp_id}`}
                      >
                        <DollarSign className="h-4 w-4 text-green-600" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
