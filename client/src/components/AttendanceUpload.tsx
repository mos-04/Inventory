import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import * as XLSX from "xlsx";
import { supabase } from "../../../shared/supabaseClient"; // Adjust path as needed


interface AttendanceRecord {
  emp_id: string;
  worked_days: number;
  normal_ot: number;
  friday_ot: number;
  holiday_ot: number;
  unpaid_days: number;
  isValid: boolean;
  error?: string;
  comments?: string;
  dailyStatus?: string[];
}


interface AttendanceUploadProps {
  selectedMonth: string; // We need the selected month to assign records
  onUpload?: (records: AttendanceRecord[]) => void;
}


export default function AttendanceUpload({ selectedMonth, onUpload }: AttendanceUploadProps) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [fileName, setFileName] = useState("");


  // Sync employee if not exist
  async function syncEmployee(emp_id: string, name: string) {
    if (!emp_id) return;

    const { data: existingEmp, error } = await supabase
      .from('employees')
      .select('emp_id')
      .eq('emp_id', emp_id)
      .single();

    if (error && error.code !== 'PGRST116') {
      // Ignore not found error PGRST116, log others
      console.error("Error fetching employee:", error);
      return;
    }
    if (!existingEmp) {
      const { error: insertError } = await supabase.from('employees').insert({
        emp_id,
        name,
        // Fill other fields if necessary; defaults or empty
      });
      if (insertError) {
        console.error(`Failed to insert employee ${emp_id}:`, insertError);
      }
    }
  }


  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target?.result;
      if (!bstr) return;

      const workbook = XLSX.read(bstr, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      const jsonData = XLSX.utils.sheet_to_json<any>(sheet, { defval: "" });

      // Find header row index where SL# is column key
      const dataStartIndex = jsonData.findIndex(row => {
        const keys = Object.keys(row).map(k => k.toLowerCase());
        return keys.includes("sl#") || Object.values(row).some(v => String(v).toLowerCase() === "sl#");
      });

      if (dataStartIndex < 0) {
        alert("Invalid file format: header row 'SL#' not found");
        return;
      }

      // Attendance rows start after header row
      const attendanceRows = jsonData.slice(dataStartIndex + 1);

      const parsedRecords: AttendanceRecord[] = [];

      for (const row of attendanceRows) {
        const emp_id = String(row["Emp id"] || "").trim();
        const name = String(row["Name"] || "").trim();

        if (!emp_id) {
          parsedRecords.push({
            emp_id: "",
            worked_days: 0,
            normal_ot: 0,
            friday_ot: 0,
            holiday_ot: 0,
            unpaid_days: 0,
            isValid: false,
            error: "Missing Emp ID",
            comments: row["Comments"] || "",
            dailyStatus: [],
          });
          continue;
        }

        // Read daily attendance marks for days 1-30
        const dailyStatus = [];
        for (let day = 1; day <= 30; day++) {
          dailyStatus.push(row[day.toString()] || "");
        }

        // Calculate worked days counting "P" or "p"
        const worked_days = dailyStatus.filter(d => d === "P" || d === "p").length;

        const roundOff = Number(row["Round Off"] || 0);
        const comments = String(row["Comments"] || "").trim();

        const OT = Number(row["OT"] || 0);
        const FOT = Number(row["FOT"] || 0);
        const PHOT = Number(row["PHOT"] || 0);
        const unpaid_days = 30 - worked_days;

        // Sync employee record (fire and forget)
        await syncEmployee(emp_id, name);

        parsedRecords.push({
          emp_id,
          worked_days,
          normal_ot: OT,
          friday_ot: FOT,
          holiday_ot: PHOT,
          unpaid_days,
          comments,
          isValid: true,
          dailyStatus,
        });
      }

      setFileName(file.name);
      setRecords(parsedRecords);
    };

    reader.readAsBinaryString(file);
  };


  const handleConfirm = () => {
    const validRecords = records.filter((r) => r.isValid);
    onUpload?.(validRecords);
  };


  const validCount = records.filter((r) => r.isValid).length;
  const errorCount = records.filter((r) => !r.isValid).length;


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Attendance</CardTitle>
          <CardDescription>Import attendance data from Excel or CSV file</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed rounded-lg p-8 text-center hover-elevate active-elevate-2 cursor-pointer transition-colors">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              data-testid="input-file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm font-medium mb-1">{fileName || "Click to upload or drag and drop"}</p>
              <p className="text-xs text-muted-foreground">
                Excel (.xlsx, .xls) or CSV files only
              </p>
            </label>
          </div>


          {records.length > 0 && (
            <Alert>
              <AlertDescription className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="font-medium">{validCount} valid records</span>
                {errorCount > 0 && (
                  <>
                    <AlertCircle className="h-4 w-4 text-destructive ml-4" />
                    <span className="font-medium text-destructive">{errorCount} errors found</span>
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>


      {records.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>Review attendance data before confirming</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="sticky top-0 bg-muted/50">
                  <TableRow>
                    <TableHead className="font-semibold">Emp ID</TableHead>
                    <TableHead className="font-semibold text-right">Worked Days</TableHead>
                    <TableHead className="font-semibold text-right">Normal OT</TableHead>
                    <TableHead className="font-semibold text-right">Friday OT</TableHead>
                    <TableHead className="font-semibold text-right">Holiday OT</TableHead>
                    <TableHead className="font-semibold text-right">Unpaid Days</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Comments</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record, index) => (
                    <TableRow
                      key={index}
                      className={record.isValid ? "hover-elevate" : "bg-destructive/10"}
                      data-testid={`row-attendance-${record.emp_id}`}
                    >
                      <TableCell className="font-mono text-sm">{record.emp_id}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{record.worked_days}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{record.normal_ot}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{record.friday_ot}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{record.holiday_ot}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{record.unpaid_days}</TableCell>
                      <TableCell>
                        {record.isValid ? (
                          <span className="text-green-600 text-sm flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" />
                            Valid
                          </span>
                        ) : (
                          <span className="text-destructive text-sm flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {record.error}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-pre-wrap text-sm">{record.comments}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>


            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setRecords([])}
                data-testid="button-cancel-upload"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={validCount === 0}
                data-testid="button-confirm-upload"
              >
                Confirm & Save
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
