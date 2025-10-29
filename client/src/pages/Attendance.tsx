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
import { supabase } from "../../../shared/supabaseClient";
import { apiRequest } from "@/lib/queryClient";

export default function Attendance() {
  const [months, setMonths] = useState<{ value: string; label: string }[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  useEffect(() => {
    async function fetchMonths() {
      const { data, error } = await supabase.from("attendance").select("month");
      if (error) {
        console.error("Failed to fetch months:", error);
        return;
      }
      if (data) {
        const uniqueMonths = Array.from(new Set(data.map((row) => row.month)))
          .map((monthStr) => {
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
        setSelectedMonth(uniqueMonths[0]?.value || "");
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

      <AttendanceUpload selectedMonth={selectedMonth} onUpload={handleUpload} />
    </div>
  );
}
