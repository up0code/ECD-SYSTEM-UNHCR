'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useUserManagement } from '@/contexts/user-management-context';

export default function AnalyticsTab() {
  const { students } = useUserManagement();

  // --- Data Processing ---
  const getTotalAttendanceStats = () => {
    let present = 0, late = 0, excused = 0, unexcused = 0, total = 0;
    students.forEach(student => {
      Object.values(student.attendance).forEach(status => {
        if (status === 'present') present++;
        if (status === 'late') late++;
        if (status === 'excused') excused++;
        if (status === 'unexcused') unexcused++;
        total++;
      });
    });
    return { present, late, excused, unexcused, total };
  };

  const overallStats = getTotalAttendanceStats();
  const overallAttendanceRate = overallStats.total > 0 ? (overallStats.present + overallStats.late) / overallStats.total * 100 : 0;
  const overallLatenessRate = (overallStats.present + overallStats.late) > 0 ? overallStats.late / (overallStats.present + overallStats.late) * 100 : 0;

  const pieData = [
    { name: 'Present', value: overallStats.present },
    { name: 'Late', value: overallStats.late },
    { name: 'Excused', value: overallStats.excused },
    { name: 'Unexcused', value: overallStats.unexcused },
  ];

  const COLORS = ['hsl(var(--chart-2))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))', 'hsl(var(--destructive))'];

  const attendanceByClass = students.reduce((acc, student) => {
    if (!acc[student.class]) {
      acc[student.class] = { name: student.class, present: 0, absent: 0, late: 0, total: 0 };
    }
    Object.values(student.attendance).forEach(status => {
      if (status === 'present') acc[student.class].present++;
      if (status === 'late') acc[student.class].late++;
      if (status === 'unexcused') acc[student.class].absent++;
      acc[student.class].total++;
    });
    return acc;
  }, {} as Record<string, any>);

  const barData = Object.values(attendanceByClass).map(c => ({
      ...c,
      attendanceRate: c.total > 0 ? ((c.present + c.late) / c.total) * 100 : 0,
  }));

  const getTrendData = () => {
      const trend: Record<string, {date: string, present: number, late: number, unexcused: number}> = {};
      students.forEach(student => {
          Object.entries(student.attendance).forEach(([date, status]) => {
              const formattedDate = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              if (!trend[date]) {
                  trend[date] = { date: formattedDate, present: 0, late: 0, unexcused: 0 };
              }
              if (status === 'present') trend[date].present++;
              if (status === 'late') trend[date].late++;
              if (status === 'unexcused') trend[date].unexcused++;
          })
      });
      return Object.values(trend).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
  const trendData = getTrendData();

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Attendance Analytics</CardTitle>
                <CardDescription>A live overview of school-wide attendance metrics and trends.</CardDescription>
            </CardHeader>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader><CardTitle>Overall Attendance</CardTitle></CardHeader>
                <CardContent><p className="text-3xl font-bold">{overallAttendanceRate.toFixed(1)}%</p></CardContent>
            </Card>
             <Card>
                <CardHeader><CardTitle>Overall Lateness</CardTitle></CardHeader>
                <CardContent><p className="text-3xl font-bold">{overallLatenessRate.toFixed(1)}%</p><p className="text-xs text-muted-foreground">Of all present/late students</p></CardContent>
            </Card>
             <Card>
                <CardHeader><CardTitle>Total Absences (Unexcused)</CardTitle></CardHeader>
                <CardContent><p className="text-3xl font-bold">{overallStats.unexcused}</p></CardContent>
            </Card>
             <Card>
                <CardHeader><CardTitle>Total Students</CardTitle></CardHeader>
                <CardContent><p className="text-3xl font-bold">{students.length}</p></CardContent>
            </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Attendance Breakdown</CardTitle>
                    <CardDescription>Distribution of attendance statuses across all records.</CardDescription>
                </CardHeader>
                <CardContent>
                     <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Attendance by Class</CardTitle>
                    <CardDescription>Comparing attendance rates between different classes.</CardDescription>
                </CardHeader>
                <CardContent>
                     <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={barData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis unit="%" domain={[0, 100]} />
                            <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                            <Legend />
                            <Bar dataKey="attendanceRate" name="Attendance Rate" fill="hsl(var(--primary))" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>

         <Card>
            <CardHeader>
                <CardTitle>Daily Attendance Trends</CardTitle>
                <CardDescription>Attendance patterns over the last few school days.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="present" stroke="hsl(var(--chart-2))" name="Present"/>
                        <Line type="monotone" dataKey="late" stroke="hsl(var(--chart-4))" name="Late"/>
                        <Line type="monotone" dataKey="unexcused" stroke="hsl(var(--destructive))" name="Unexcused"/>
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    </div>
  );
}
