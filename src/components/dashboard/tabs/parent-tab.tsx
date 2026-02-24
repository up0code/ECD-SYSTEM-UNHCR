'use client';
import { useAuth } from '@/contexts/auth-context';
import { useUserManagement } from '@/contexts/user-management-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { MOCK_HOLIDAYS } from '@/lib/mock-data';

export default function ParentTab() {
  const { user } = useAuth();
  const { students } = useUserManagement();

  const myChildren = students.filter(s => s.parentId === user?.uid);
  const child = myChildren[0]; // For this version, we'll just show the first linked child.

  const holidays = MOCK_HOLIDAYS.map(h => new Date(h.id + 'T00:00:00'));

  const attendanceDates = child ? Object.entries(child.attendance).reduce((acc, [date, status]) => {
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(new Date(date));
    return acc;
  }, {} as Record<string, Date[]>) : {};


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Parent Dashboard</CardTitle>
          <CardDescription>Welcome, {user?.displayName}. View your child's attendance information.</CardDescription>
        </CardHeader>
      </Card>

      {child ? (
         <Card>
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-xl">
                        {child.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle>{child.name}</CardTitle>
                    <CardDescription>
                        {child.class} | {child.studentId}
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="mt-4">
                 <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex justify-center">
                    <Calendar
                        mode="single"
                        className="rounded-md border"
                        modifiers={{ 
                            holidays: holidays,
                            present: attendanceDates.present || [],
                            late: attendanceDates.late || [],
                            excused: attendanceDates.excused || [],
                            unexcused: attendanceDates.unexcused || [],
                        }}
                        modifiersClassNames={{
                            holidays: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200',
                            present: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200',
                            late: 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200',
                            excused: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200',
                            unexcused: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200',
                        }}
                    />
                    </div>
                    <div className="w-full md:w-1/3 space-y-4">
                        <h3 className="font-semibold">Legend</h3>
                        <div className="flex flex-wrap gap-2">
                            <Badge className="bg-green-100 text-green-800">Present</Badge>
                            <Badge className="bg-orange-100 text-orange-800">Late</Badge>
                            <Badge className="bg-blue-100 text-blue-800">Excused</Badge>
                            <Badge className="bg-red-100 text-red-800">Unexcused</Badge>
                            <Badge className="bg-yellow-100 text-yellow-800">Holiday</Badge>
                        </div>
                    </div>
                </div>
            </CardContent>
         </Card>
      ) : (
         <Card>
            <CardContent className="p-10 text-center">
                <p className="text-muted-foreground">Your account is not yet linked to a student.</p>
                <p className="text-sm text-muted-foreground mt-2">Please contact the school administration to link your child's profile.</p>
            </CardContent>
         </Card>
      )}
    </div>
  );
}
