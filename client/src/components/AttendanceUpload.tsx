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

interface AttendanceRecord {
  emp_id: string;
  worked_days: number;
  normal_ot: number;
  friday_ot: number;
  holiday_ot: number;
  unpaid_days: number;
  isValid: boolean;
  error?: string;
}

interface AttendanceUploadProps {
  onUpload?: (records: AttendanceRecord[]) => void;
}

export default function AttendanceUpload({ onUpload }: AttendanceUploadProps) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [fileName, setFileName] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      console.log("File uploaded:", file.name);
      
      const mockRecords: AttendanceRecord[] = [
        { emp_id: "101", worked_days: 26, normal_ot: 10, friday_ot: 5, holiday_ot: 0, unpaid_days: 0, isValid: true },
        { emp_id: "102", worked_days: 24, normal_ot: 0, friday_ot: 8, holiday_ot: 2, unpaid_days: 2, isValid: true },
        { emp_id: "999", worked_days: 22, normal_ot: 5, friday_ot: 0, holiday_ot: 0, unpaid_days: 3, isValid: false, error: "Employee ID not found" },
      ];
      setRecords(mockRecords);
    }
  };

  const handleConfirm = () => {
    const validRecords = records.filter(r => r.isValid);
    console.log("Confirmed records:", validRecords);
    onUpload?.(validRecords);
  };

  const validCount = records.filter(r => r.isValid).length;
  const errorCount = records.filter(r => !r.isValid).length;

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
              <p className="text-sm font-medium mb-1">
                {fileName || "Click to upload or drag and drop"}
              </p>
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
