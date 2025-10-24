import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, FileSpreadsheet, FileText } from "lucide-react";

export default function Reports() {
  const [selectedMonth, setSelectedMonth] = useState("01-2025");
  const [format, setFormat] = useState("excel");
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    "emp_id", "name", "designation", "salary", "total_earnings"
  ]);

  const months = [
    { value: "12-2024", label: "December 2024" },
    { value: "01-2025", label: "January 2025" },
    { value: "02-2025", label: "February 2025" },
  ];

  const availableColumns = [
    { id: "emp_id", label: "Employee ID" },
    { id: "name", label: "Name" },
    { id: "designation", label: "Designation" },
    { id: "project", label: "Project" },
    { id: "category", label: "Category" },
    { id: "salary", label: "Basic Salary" },
    { id: "worked_days", label: "Worked Days" },
    { id: "normal_ot", label: "Normal OT" },
    { id: "friday_ot", label: "Friday OT" },
    { id: "holiday_ot", label: "Holiday OT" },
    { id: "food_allow", label: "Food Allowance" },
    { id: "deductions", label: "Deductions" },
    { id: "total_earnings", label: "Total Earnings" },
    { id: "comments", label: "Comments" },
  ];

  const toggleColumn = (columnId: string) => {
    setSelectedColumns(prev =>
      prev.includes(columnId)
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId]
    );
  };

  const handleDownload = () => {
    console.log("Download report:", {
      month: selectedMonth,
      format,
      columns: selectedColumns
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Reports</h1>
        <p className="text-muted-foreground">
          Download salary sheets and payroll reports
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Export Salary Sheet</CardTitle>
          <CardDescription>
            Select month and format to download payroll report
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="report-month" className="text-sm font-medium">
                Select Month
              </Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger id="report-month" className="h-10" data-testid="select-report-month">
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

            <div className="space-y-2">
              <Label htmlFor="format" className="text-sm font-medium">
                Export Format
              </Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger id="format" className="h-10" data-testid="select-format">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                  <SelectItem value="csv">CSV (.csv)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Select Columns to Export</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border rounded-lg p-4">
              {availableColumns.map((column) => (
                <div key={column.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={column.id}
                    checked={selectedColumns.includes(column.id)}
                    onCheckedChange={() => toggleColumn(column.id)}
                    data-testid={`checkbox-${column.id}`}
                  />
                  <Label
                    htmlFor={column.id}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {column.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleDownload}
              disabled={selectedColumns.length === 0}
              data-testid="button-download-report"
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
            {format === "excel" ? (
              <FileSpreadsheet className="h-10 w-10 text-muted-foreground" />
            ) : (
              <FileText className="h-10 w-10 text-muted-foreground" />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
