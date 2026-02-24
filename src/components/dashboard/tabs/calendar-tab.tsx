'use client';
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { useUserManagement } from '@/contexts/user-management-context';
import { useAuth } from '@/contexts/auth-context';

export default function CalendarTab() {
  const { user } = useAuth();
  const { students, holidays: holidayData } = useUserManagement();

  // Find the current student's attendance if logged in as a student
  const studentData = students.find(s => s.email === user?.email);

  const holidays = holidayData.map(h => new Date(h.id + 'T00:00:00'));
  
  const attendanceDates = studentData ? Object.entries(studentData.attendance).reduce((acc, [date, status]) => {
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(new Date(date));
    return acc;
  }, {} as Record<string, Date[]>) : {};


  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Calendar</CardTitle>
        <CardDescription>View holidays and your personal attendance record.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row gap-6">
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
             <div className="pt-4">
                <h3 className="font-semibold">Upcoming Holidays</h3>
                <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                    {holidayData.filter(h => new Date(h.id) >= new Date()).slice(0, 3).map(h => (
                        <li key={h.id}>{h.name} - {new Date(h.id + 'T00:00:00').toLocaleDateString(undefined, { timeZone: 'UTC' })}</li>
                    ))}
                </ul>
             </div>
        </div>
      </CardContent>
    </Card>
  );
}
