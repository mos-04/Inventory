import { useState, useEffect } from "react";
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
  const [selectedMonth, setSelectedMonth] = useState("");
  const [months, setMonths] = useState<{ value: string; label: string }[]>([]);
  const [format, setFormat] = useState("excel");
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    "emp_id", "name", "designation", "salary", "worked_days", "normal_ot", "friday_ot", "holiday_ot", "total_earnings"
  ]);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derive months from payroll table (single call)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/payroll", { credentials: "include" });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        const rawMonths: string[] = Array.from(
          new Set(
            (data || [])
              .map((p: any) => p.month)
              .filter((m: any): m is string => typeof m === "string")
          )
        );
        const uniqueMonths = rawMonths
          .map((m: string) => {
            const [mm, yyyy] = m.split("-");
            const names = ["January","February","March","April","May","June","July","August","September","October","November","December"];
            return { value: m, label: `${names[parseInt(mm)-1]} ${yyyy}` };
          })
          .sort((a, b) => (a.value < b.value ? 1 : -1));
        setMonths(uniqueMonths);
        setSelectedMonth(uniqueMonths.length ? uniqueMonths[0].value : "");
      } catch (err) {
        console.error("Failed to load months", err);
      }
    })();
  }, []);

  // Load report rows whenever month changes
  useEffect(() => {
    if (!selectedMonth) return;
    (async () => {
      setLoading(true); setError(null);
      try {
        const res = await fetch(`/api/reports?month=${encodeURIComponent(selectedMonth)}`, { credentials: "include" });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setRows(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message || "Failed to load report");
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedMonth]);

  const availableColumns = [
    { id: "emp_id", label: "Employee ID" },
    { id: "name", label: "Name" },
    { id: "designation", label: "Designation" },
    { id: "department", label: "Department" },
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
    const header = selectedColumns.join(",");
    const csvLines = rows.map(r => selectedColumns.map(c => JSON.stringify(r[c] ?? "")).join(","));
    const blob = new Blob([header + "\n" + csvLines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${selectedMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
          <CardTitle>Monthly Salary Sheet</CardTitle>
          <CardDescription>
            Aggregated payroll and attendance for selected month
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

          <div className="mt-6 space-y-2">
            {loading && <p>Loading report...</p>}
            {error && <p className="text-destructive text-sm">{error}</p>}
            {!loading && !error && rows.length === 0 && <p>No data for {selectedMonth}</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
