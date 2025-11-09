import { useState, useEffect } from "react";
import AttendanceUpload from "@/components/AttendanceUpload";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// Supabase removed; using local REST API
import { apiRequest } from "@/lib/queryClient";

export default function Attendance() {
  const [months, setMonths] = useState<{ value: string; label: string }[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [uploaderKey, setUploaderKey] = useState(0);

  useEffect(() => {
    async function fetchMonths() {
      try {
        const res = await fetch("/api/attendance", { credentials: "include" });
        if (!res.ok) throw new Error(await res.text());
        const all = await res.json();
        const rawMonths: string[] = Array.from(new Set((all || []).map((row: any) => row.month).filter((m: any): m is string => typeof m === "string")));
        const uniqueMonths = rawMonths
          .map((monthStr: string) => {
            const [mm, yyyy] = monthStr.split("-");
            const monthNames = [
              "January",
              "February",
              "March",
              "April",
              "May",
              "June",
              "July",
              "August",
              "September",
              "October",
              "November",
              "December",
            ];
            const monthIndex = parseInt(mm) - 1;
            return { value: monthStr, label: `${monthNames[monthIndex]} ${yyyy}` };
          })
          .sort((a, b) => (a.value < b.value ? 1 : -1));
        setMonths(uniqueMonths);
        setSelectedMonth(uniqueMonths.length ? uniqueMonths[0].value : "");
      } catch (err) {
        console.error("Failed to fetch months", err);
      }
    }
    fetchMonths();
  }, []);

  const handleUpload = async (records: any[]) => {
    try {
      // Map UI records to backend InsertAttendance payload
      const to2 = (n: number) => (Number.isFinite(n) ? n.toFixed(2) : "0.00");
      const payload = records.map((r) => ({
        emp_id: r.emp_id,
        month: selectedMonth,
        working_days: Array.isArray(r.dailyStatus) ? r.dailyStatus.length : 30,
        present_days: r.worked_days,
        absent_days: r.unpaid_days,
        ot_hours_normal: to2(r.normal_ot),
        ot_hours_friday: to2(r.friday_ot),
        ot_hours_holiday: to2(r.holiday_ot),
      }));

      await apiRequest("POST", "/api/attendance/bulk", payload);
      alert("Attendance records saved successfully.");
      setUploaderKey((k) => k + 1);
    } catch (err) {
      console.error(err);
      alert("Failed to save attendance records.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Upload Attendance</h1>
        <p className="text-muted-foreground">
          Import monthly attendance records from Excel or CSV files
        </p>
      </div>

      <div className="max-w-xs">
        <Label htmlFor="month" className="text-sm font-medium mb-2 block">
          Select Month
        </Label>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger id="month" className="h-10" data-testid="select-month">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
  {months.length === 0 ? (
    <SelectItem value="no-data" disabled>
      No months available
    </SelectItem>
  ) : (
    months
      .filter((month) => month.value && month.value.trim() !== "")
      .map((month) => (
        <SelectItem key={month.value} value={month.value}>
          {month.label}
        </SelectItem>
      ))
  )}
</SelectContent>
        </Select>
      </div>

      <AttendanceUpload key={uploaderKey} selectedMonth={selectedMonth} onUpload={handleUpload} />
    </div>
  );
}
