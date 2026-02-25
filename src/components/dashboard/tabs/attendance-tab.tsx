'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import type { Student } from '@/lib/types';
import { useUserManagement } from '@/contexts/user-management-context';
import { useAuth } from '@/contexts/auth-context';

type AttendanceStatus = 'present' | 'late' | 'excused' | 'unexcused';
const attendanceStatuses: AttendanceStatus[] = ['present', 'late', 'excused', 'unexcused'];

export default function AttendanceTab() {
  const { user } = useAuth();
  const { students, updateStudentAttendance } = useUserManagement();
  const [date, setDate] = useState<Date>(new Date());
  const [selectedClass, setSelectedClass] = useState<string>('all');
  
  const filteredStudents = students.filter(student => 
    selectedClass === 'all' || student.class === selectedClass
  );

  const getStatusForDate = (student: Student, d: Date): AttendanceStatus => {
    return student.attendance[d.toDateString()] || 'unexcused';
  };
  
  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    updateStudentAttendance(studentId, date.toDateString(), status);
    // The context will trigger a re-render
  };

  const getStatusVariant = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return 'default';
      case 'late':
        return 'secondary';
      case 'excused':
        return 'outline';
      case 'unexcused':
        return 'destructive';
    }
  };

  const all_classes = [...new Set(students.map(s => s.class))];
  const canEdit = user?.role === 'admin' || user?.role === 'teacher';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Attendance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Popover>
                <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className="w-full sm:w-[280px] justify-start text-left font-normal"
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(date, "PPP")}
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => d && setDate(d)}
                    initialFocus
                />
                </PopoverContent>
            </Popover>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {all_classes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
        <div className="border rounded-md">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead>Class</TableHead>
                <TableHead className="text-center">Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredStudents.length > 0 ? filteredStudents.map((student) => {
                  const status = getStatusForDate(student, date);
                  return (
                    <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.studentId}</TableCell>
                        <TableCell>{student.class}</TableCell>
                        <TableCell className="text-center">
                          {canEdit ? (
                             <Select value={status} onValueChange={(newStatus) => handleStatusChange(student.id, newStatus as AttendanceStatus)}>
                              <SelectTrigger className="w-32 mx-auto">
                                <SelectValue placeholder="Set status" />
                              </SelectTrigger>
                              <SelectContent>
                                {attendanceStatuses.map(s => (
                                  <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge variant={getStatusVariant(status)}>
                              {status}
                            </Badge>
                          )}
                        </TableCell>
                    </TableRow>
                  )
                }) : (
                <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No students in this class.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
