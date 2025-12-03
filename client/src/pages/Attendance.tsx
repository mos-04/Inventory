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
import { apiRequest } from "@/lib/queryClient";

export default function Attendance() {
  const [months, setMonths] = useState<{ value: string; label: string }[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [uploaderKey, setUploaderKey] = useState(0);

  useEffect(() => {
    // Generate all months (e.g., last 12 months + next 6 months)
    function generateMonths() {
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
      ];

      const now = new Date();
      const allMonths = [];

      // Generate 12 months back + current month + 6 months forward = 19 months
      for (let i = -12; i <= 6; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const yyyy = date.getFullYear();
        const value = `${mm}-${yyyy}`;
        const label = `${monthNames[date.getMonth()]} ${yyyy}`;
        allMonths.push({ value, label });
      }

      // Sort by date (newest first)
      allMonths.sort((a, b) => (a.value < b.value ? 1 : -1));

      return allMonths;
    }

    const generatedMonths = generateMonths();
    setMonths(generatedMonths);
    
    // Set current month as default
    const now = new Date();
    const currentMonth = `${String(now.getMonth() + 1).padStart(2, "0")}-${now.getFullYear()}`;
    setSelectedMonth(currentMonth);
  }, []);

  const handleUpload = async (records: any[]) => {
    try {
      const to2 = (n: number) => (Number.isFinite(n) ? n.toFixed(2) : "0.00");
      const payload = records.map((r) => {
        const working_days = r.total_working_days ?? (Array.isArray(r.dailyStatus) ? r.dailyStatus.length : 30);
        const present_days = Number(r.worked_days ?? 0);
        const absent_days = Math.max(Number(working_days) - present_days, 0);

        return {
          emp_id: r.emp_id,
          month: selectedMonth,
          working_days,
          present_days,
          absent_days,
          ot_hours_normal: to2(r.normal_ot),
          ot_hours_friday: to2(r.friday_ot),
          ot_hours_holiday: to2(r.holiday_ot),
        };
      });

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
            {months.map((month) => (
              <SelectItem key={month.value} value={month.value}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <AttendanceUpload key={uploaderKey} selectedMonth={selectedMonth} onUpload={handleUpload} />
    </div>
  );
}
