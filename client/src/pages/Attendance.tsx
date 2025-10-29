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
import { toast } from "@/hooks/use-toast";

export default function Attendance() {
  const [months, setMonths] = useState<{ value: string; label: string }[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [uploadKey, setUploadKey] = useState(0); // remount uploader on success to clear state

  useEffect(() => {
    // Generate the last 12 months as options: MM-YYYY
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
    const options: { value: string; label: string }[] = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = String(d.getFullYear());
      options.push({ value: `${mm}-${yyyy}`, label: `${monthNames[d.getMonth()]} ${yyyy}` });
    }
    setMonths(options);
    setSelectedMonth(options[0]?.value || "");
  }, []);

  const handleUpload = async (records: any[]) => {
    try {
      if (!selectedMonth) {
        toast({ title: "Select a month", description: "Please choose a month before saving.", variant: "default" });
        return;
      }
      setIsSaving(true);
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

      const res = await apiRequest("POST", "/api/attendance/bulk", payload);
      const body = await res.json().catch(() => null);
      const count = Array.isArray(body) ? body.length : (Array.isArray(body?.created) ? body.created.length : payload.length);
      toast({ title: "Saved", description: `Saved ${count} attendance record(s) for ${selectedMonth}.` });
      // Clear the uploader state by remounting it
      setUploadKey((k) => k + 1);
    } catch (err: any) {
      console.error(err);
      // Extract server error details if available
      let message = "Failed to save attendance records.";
      const raw = String(err?.message ?? err);
      const idx = raw.indexOf(": ");
      const maybeJson = idx >= 0 ? raw.slice(idx + 2) : "";
      try {
        const parsed = JSON.parse(maybeJson);
        message = parsed?.detail || parsed?.details || parsed?.error || message;
        if (parsed?.code) message += ` (code ${parsed.code})`;
      } catch {
        // keep default message
      }
      toast({ title: "Upload failed", description: message, variant: "destructive" });
    } finally {
      setIsSaving(false);
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

      <AttendanceUpload key={uploadKey} selectedMonth={selectedMonth} onUpload={handleUpload} isSaving={isSaving} />
    </div>
  );
}
