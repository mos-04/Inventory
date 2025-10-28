import { useState, useEffect } from "react";
import { supabase } from "../../../shared/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, TrendingUp, Calendar } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
}

function StatsCard({ title, value, icon, trend }: StatsCardProps) {
 

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {trend && <p className="text-xs text-muted-foreground mt-1">{trend}</p>}
      </CardContent>
    </Card>
  );
}

export default function DashboardStats() {
  const [stats, setStats] = useState({
    employees: 0,
    payroll: 0,
    projects: 0,
    attendanceRate: "0%",
  });

  const getCurrentMonth = () => {
    const now = new Date();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const year = now.getFullYear();
    return `${month}-${year}`;
  };

  useEffect(() => {
    async function fetchStats() {
      const currentMonth = getCurrentMonth();

      // Fetch total employees count
      const { count: employeesCount, error: empErr } = await supabase
        .from("employees")
        .select("*", { count: "exact", head: true });
      if (empErr) console.error("Employees fetch error:", empErr);

      // Monthly payroll total (sum of net_salary for current month)
      const { data: payrollData, error: payrollErr } = await supabase
        .from("payroll")
        .select("net_salary")
        .eq("month", currentMonth);
      if (payrollErr) console.error("Payroll fetch error:", payrollErr);
      const payrollSum = payrollData
        ? payrollData.reduce((sum, row) => sum + Number(row.net_salary || 0), 0)
        : 0;

      // Count active projects (distinct projects in employees table)
      const { data: projectData, error: projectErr } = await supabase
        .from("employees")
        .select("project", { count: "exact", head: false });
      if (projectErr) console.error("Projects fetch error:", projectErr);
      const uniqueProjects = projectData
        ? Array.from(new Set(projectData.map((row) => row.project))).length
        : 0;

      // Attendance rate: total present_days / total working_days aggregated for current month
      const { data: attendanceData, error: attendanceErr } = await supabase
        .from("attendance")
        .select("present_days, working_days")
        .eq("month", currentMonth);
      if (attendanceErr) console.error("Attendance fetch error:", attendanceErr);

      let totalPresent = 0;
      let totalWorking = 0;
      if (attendanceData) {
        attendanceData.forEach(({ present_days, working_days }) => {
          totalPresent += present_days ?? 0;
          totalWorking += working_days ?? 0;
        });
      }
      const attendanceRate =
        totalWorking > 0 ? ((totalPresent / totalWorking) * 100).toFixed(1) + "%" : "0%";

      setStats({
        employees: employeesCount || 0,
        payroll: payrollSum,
        projects: uniqueProjects,
        attendanceRate,
      });
    }

    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title="Total Employees"
        value={stats.employees.toString()}
        icon={<Users className="h-4 w-4" />}
        trend="" // You can add real trends if you implement
      />
      <StatsCard
        title="Monthly Payroll"
        value={`₹${stats.payroll.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
        icon={<DollarSign className="h-4 w-4" />}
        trend=""
      />
      <StatsCard
        title="Active Projects"
        value={stats.projects.toString()}
        icon={<TrendingUp className="h-4 w-4" />}
        trend=""
      />
      <StatsCard
        title="Attendance Rate"
        value={stats.attendanceRate}
        icon={<Calendar className="h-4 w-4" />}
        trend=""
      />
    </div>

  );
}
