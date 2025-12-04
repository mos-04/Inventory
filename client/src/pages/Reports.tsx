import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/apiFetch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, FileSpreadsheet, FileText, RefreshCw } from "lucide-react";
import * as XLSX from "xlsx";

export default function Reports() {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [months, setMonths] = useState<{ value: string; label: string }[]>([]);
  const [format, setFormat] = useState("excel");
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    "emp_id",
    "name",
    "designation",
    "salary",
    "worked_days",
    "normal_ot",
    "friday_ot",
    "holiday_ot",
    "total_earnings",
    "comments", // Added to default selected columns
  ]);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function generateMonths() {
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
      ];

      try {
        const [attendanceRes, payrollRes] = await Promise.all([
          apiFetch("/api/attendance"),
          apiFetch("/api/payroll")
        ]);

        const attendanceData = attendanceRes.ok ? await attendanceRes.json() : [];
        const payrollData = payrollRes.ok ? await payrollRes.json() : [];

        const allMonthsSet = new Set<string>();
        attendanceData.forEach((record: any) => {
          if (record.month) allMonthsSet.add(record.month);
        });
        payrollData.forEach((record: any) => {
          if (record.month) allMonthsSet.add(record.month);
        });

        const existingMonths: { value: string; label: string; date: Date }[] = [];
        allMonthsSet.forEach(monthStr => {
          try {
            const [mm, yyyy] = monthStr.split('-');
            const date = new Date(parseInt(yyyy), parseInt(mm) - 1, 1);
            const label = `${monthNames[date.getMonth()]} ${yyyy}`;
            existingMonths.push({
              value: `${yyyy}-${mm.padStart(2, '0')}`,
              label,
              date
            });
          } catch {}
        });

        const now = new Date();
        const currentYear = now.getFullYear();
        for (let month = 1; month <= 12; month++) {
          const date = new Date(currentYear, month - 1, 1);
          const mm = String(month).padStart(2, "0");
          const yyyy = currentYear;
          const value = `${yyyy}-${mm}`;
          const label = `${monthNames[month - 1]} ${currentYear}`;

          existingMonths.push({ value, label, date });
        }

        for (let i = 0; i <= 6; i++) {
          const date = new Date(now.getFullYear(), now.getMonth() + i + 1, 1);
          const mm = String(date.getMonth() + 1).padStart(2, "0");
          const yyyy = date.getFullYear();
          const value = `${yyyy}-${mm}`;
          const label = `${monthNames[date.getMonth()]} ${yyyy}`;
          existingMonths.push({ value, label, date });
        }

        const uniqueMonths = Array.from(
          new Map(existingMonths.map(item => [item.value, item])).values()
        );

        uniqueMonths.sort((a, b) => b.date.getTime() - a.date.getTime());

        const cleanMonths = uniqueMonths.map(({ value, label }) => ({ value, label }));
        setMonths(cleanMonths);

        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        setSelectedMonth(currentMonth);

      } catch (error) {
        console.error("Failed to fetch existing months:", error);
        generateCurrentYearMonths();
      }
    }

    function generateCurrentYearMonths() {
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
      ];
      const now = new Date();
      const currentYear = now.getFullYear();
      const allMonths: { value: string; label: string }[] = [];

      for (let month = 1; month <= 12; month++) {
        const mm = String(month).padStart(2, "0");
        const value = `${currentYear}-${mm}`;
        const label = `${monthNames[month - 1]} ${currentYear}`;
        allMonths.push({ value, label });
      }
      setMonths(allMonths);
      setSelectedMonth(`${currentYear}-${String(now.getMonth() + 1).padStart(2, "0")}`);
    }

    generateMonths();
  }, []);

  useEffect(() => {
    if (!selectedMonth) return;

    async function loadReport() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch(`/api/reports?month=${encodeURIComponent(selectedMonth)}`);
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || "Failed to load report");
        }
        const data = await res.json();
        setRows(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error("Report load error:", err);
        setError(err.message || "Failed to load report");
        setRows([]);
      } finally {
        setLoading(false);
      }
    }

    loadReport();
  }, [selectedMonth]);

  const availableColumns = [
    { id: "emp_id", label: "Employee ID" },
    { id: "name", label: "Name" },
    { id: "designation", label: "Designation" },
    { id: "department", label: "Department" },
    { id: "salary", label: "Basic Salary" },
    { id: "worked_days", label: "Worked Days" },
    { id: "working_days", label: "Working Days" },
    { id: "normal_ot", label: "Normal OT Hours" },
    { id: "friday_ot", label: "Friday OT Hours" },
    { id: "holiday_ot", label: "Holiday OT Hours" },
    { id: "food_allow", label: "Food Allowance" },
    { id: "deductions", label: "Deductions" },
    { id: "gross_salary", label: "Gross Salary" },
    { id: "total_earnings", label: "Net Salary" },
    { id: "comments", label: "Comments" }, // Include comments column
  ];

  const toggleColumn = (columnId: string) => {
    setSelectedColumns((prev) =>
      prev.includes(columnId) ? prev.filter((id) => id !== columnId) : [...prev, columnId]
    );
  };

  const handleDownloadExcel = () => {
    if (rows.length === 0) {
      alert("No data to export");
      return;
    }

    const columnMap: Record<string, string> = {};
    availableColumns.forEach((col) => {
      columnMap[col.id] = col.label;
    });

    const excelData = rows.map((row) => {
      const filteredRow: Record<string, any> = {};
      selectedColumns.forEach((colId) => {
        const label = columnMap[colId] || colId;
        let value = row[colId];

        if (
          typeof value === "number" &&
          ["salary", "food_allow", "deductions", "gross_salary", "total_earnings"].includes(colId)
        ) {
          value = parseFloat(value.toString()).toFixed(2);
        }

        filteredRow[label] = value ?? "";
      });
      return filteredRow;
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

    const maxWidths: number[] = [];
    selectedColumns.forEach((colId, idx) => {
      const label = columnMap[colId] || colId;
      maxWidths[idx] = Math.max(label.length, 15);
    });
    worksheet["!cols"] = maxWidths.map((w) => ({ wch: w }));

    const filename = `Salary_Report_${selectedMonth}.xlsx`;
    XLSX.writeFile(workbook, filename);
  };

  const handleDownloadCSV = () => {
    if (rows.length === 0) {
      alert("No data to export");
      return;
    }

    const columnMap: Record<string, string> = {};
    availableColumns.forEach((col) => {
      columnMap[col.id] = col.label;
    });

    const header = selectedColumns.map((colId) => columnMap[colId] || colId).join(",");

    const csvLines = rows.map((row) =>
      selectedColumns
        .map((colId) => {
          let value = row[colId] ?? "";
          if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
            value = `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(",")
    );

    const csvContent = [header, ...csvLines].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Salary_Report_${selectedMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownload = () => {
    if (format === "excel") {
      handleDownloadExcel();
    } else {
      handleDownloadCSV();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Reports</h1>
        <p className="text-muted-foreground">Download salary sheets and payroll reports</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Salary Sheet</CardTitle>
          <CardDescription>Aggregated payroll and attendance for selected month</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="report-month" className="text-sm font-medium">
                Select Month
              </Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger
                  id="report-month"
                  className="h-10"
                  data-testid="select-report-month"
                >
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
                  <Label htmlFor={column.id} className="text-sm font-normal cursor-pointer">
                    {column.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleDownload}
              disabled={selectedColumns.length === 0 || rows.length === 0 || loading}
              data-testid="button-download-report"
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              {loading ? "Loading..." : "Download Report"}
            </Button>
            {format === "excel" ? (
              <FileSpreadsheet className="h-10 w-10 text-muted-foreground" />
            ) : (
              <FileText className="h-10 w-10 text-muted-foreground" />
            )}
          </div>

          <div className="mt-6 space-y-2">
            {loading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <p>Loading report data...</p>
              </div>
            )}
            {error && <p className="text-destructive text-sm">Error: {error}</p>}
            {!loading && !error && rows.length === 0 && (
              <p className="text-muted-foreground">
                No data available for {months.find((m) => m.value === selectedMonth)?.label}
              </p>
            )}
            {!loading && !error && rows.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Found {rows.length} employee record{rows.length !== 1 ? "s" : ""} for{" "}
                {months.find((m) => m.value === selectedMonth)?.label}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
