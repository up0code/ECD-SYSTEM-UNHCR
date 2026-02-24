'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { useUserManagement } from '@/contexts/user-management-context';
import { useAuth } from '@/contexts/auth-context';

export default function CalendarTab() {
  const { user } = useAuth();
  const { students, holidays: holidayData } = useUserManagement();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Find the current student's attendance if logged in as a student
  const studentData = students.find(s => s.email === user?.email);

  const holidaysWithDateObjects = holidayData.map(h => ({ name: h.name, date: new Date(h.id + 'T00:00:00')}));
  const holidays = holidaysWithDateObjects.map(h => h.date);
  
  const attendanceDates = studentData ? Object.entries(studentData.attendance).reduce((acc, [date, status]) => {
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(new Date(date));
    return acc;
  }, {} as Record<string, Date[]>) : {};

  const getStatusForSelectedDate = () => {
    if (!studentData) {
        return <p className="text-muted-foreground">This calendar is for viewing personal attendance. No student profile is associated with this account.</p>;
    }
    if (!selectedDate) {
        return <p className="text-muted-foreground">Select a day to see its status.</p>;
    }

    const holiday = holidaysWithDateObjects.find(h => h.date.toDateString() === selectedDate.toDateString());
    if (holiday) {
        return <p>Status: <Badge className="bg-yellow-100 text-yellow-800">{holiday.name} (Holiday)</Badge></p>;
    }

    const status = studentData?.attendance[selectedDate.toDateString()];
    if (status) {
        let badgeClassName = "";
        switch (status) {
            case 'present': badgeClassName = 'bg-green-100 text-green-800'; break;
            case 'late': badgeClassName = 'bg-orange-100 text-orange-800'; break;
            case 'excused': badgeClassName = 'bg-blue-100 text-blue-800'; break;
            case 'unexcused': badgeClassName = 'bg-red-100 text-red-800'; break;
        }
        return <p>Status: <Badge className={badgeClassName}>{status}</Badge></p>;
    }
    
    if (selectedDate > new Date()) {
         return <p className="text-muted-foreground">No attendance record for this future date.</p>;
    }
    
    const dayOfWeek = selectedDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
        return <p className="text-muted-foreground">No attendance record (Weekend).</p>;
    }

    return <p className="text-muted-foreground">Not Found: No attendance record for this day.</p>;
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Calendar</CardTitle>
        <CardDescription>View holidays and your personal attendance record. Click a date to see the status.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6">
            <div className="flex justify-center">
            <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
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
        </div>
         <div className="mt-6 border-t pt-6">
            <h3 className="font-semibold mb-2">Selected Day Status</h3>
            <div className="p-4 bg-muted/50 rounded-lg min-h-[60px] flex items-center">
                {getStatusForSelectedDate()}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
