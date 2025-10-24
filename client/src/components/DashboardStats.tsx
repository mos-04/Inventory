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
        {trend && (
          <p className="text-xs text-muted-foreground mt-1">{trend}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title="Total Employees"
        value="248"
        icon={<Users className="h-4 w-4" />}
        trend="+12 from last month"
      />
      <StatsCard
        title="Monthly Payroll"
        value="$1.2M"
        icon={<DollarSign className="h-4 w-4" />}
        trend="+5.2% from last month"
      />
      <StatsCard
        title="Active Projects"
        value="8"
        icon={<TrendingUp className="h-4 w-4" />}
        trend="2 new this month"
      />
      <StatsCard
        title="Attendance Rate"
        value="94.5%"
        icon={<Calendar className="h-4 w-4" />}
        trend="+2.1% from last month"
      />
    </div>
  );
}
