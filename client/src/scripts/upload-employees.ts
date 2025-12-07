// scripts/upload-employees.ts
import fs from "fs";
import { parse } from "csv-parse/sync";
import fetch from "node-fetch";


function toIso(d: string | undefined): string | null {
  if (!d) return null;
  const parts = d.split(/[\/\-]/).map(p => p.trim());
  if (parts.length !== 3) return null;

  // All your sheet dates are like 26/04/2029 (DD/MM/YYYY)
  const [dd, mm, yyyy] = parts;

  // guard
  if (yyyy.length !== 4) return null;

  return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
}

async function main() {
  // 1. read CSV
  const csvBuf = fs.readFileSync("employees.csv");
  const records = parse(csvBuf, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as any[];

  // 2. map CSV columns → backend payload
  const employees = records.map((r, index) => ({
emp_id: String(
  r['Employee \r\nNo.'] ??   // handles the broken header with newline
  r['Employee No.'] ??       // normal header variant
  r['Employee No']           // fallback
),
    name: r["Employee Name"],
    civil_id: r["Civil id #"] || null,
    designation: r["Designation"],
    department: r["Department"],
    category: r["Category"] || "Direct",
    doj: toIso(r["DOJ"]),                                   // ✅ uses toIso
    internal_department_doj: toIso(r["DOJ to internal departments"] || ""),
    five_year_calc_date: toIso(r["5 year calculation"] || ""),
    basic_salary: Number(r["Monthly Salary"] || 0),
    food_allowance: Number(r["Food Allowance"] || 0),
    other_allowance: Number(r["Other Allowance"] || 0),
    working_hours: Number(r["Working hrs"] || 8),
    indemnity_rate: Number(r["Indemnity to be calculated @"] || 15),
  }));

  console.log("Prepared employees:", employees.length);

  // 3. POST to your bulk endpoint (no auth)
  const res = await fetch("http://localhost:5000/api/employees/bulk", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ employees }),
  });

  const data = await res.json();
  console.log("Status:", res.status);
  console.dir(data, { depth: null });
}

main().catch(console.error);
