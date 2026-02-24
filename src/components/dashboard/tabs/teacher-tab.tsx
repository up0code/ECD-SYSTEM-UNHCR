'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AiClassInsight } from '@/components/teacher/ai-class-insight';
import { BookOpen, BrainCircuit, UserPlus, ArrowLeft } from 'lucide-react';
import {
  generateStudentBio,
  GenerateStudentBioOutput,
} from '@/ai/flows/generate-student-bio-flow';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserManagement } from '@/contexts/user-management-context';
import { AddStudentForm as TeacherAddStudentForm } from '@/components/teacher/add-student-form';
import type { Student } from '@/lib/types';

type TeacherView = 'myClass' | 'aiInsight' | 'addStudent';

export default function TeacherTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [view, setView] = useState<TeacherView>('myClass');
  const [bios, setBios] = useState<Record<string, string>>({});
  const [loadingBio, setLoadingBio] = useState<Record<string, boolean>>({});
  const { teachers, students, addStudent } = useUserManagement();

  const teacher = teachers.find(t => t.email === user?.email);
  const myStudents = students.filter(s => s.teacherId === teacher?.id && s.status === 'approved');

  const handleAddStudent = (studentData: Omit<Student, 'id' | 'studentId' | 'status'>) => {
    addStudent(studentData);
    // The toast is now handled in the form itself, but we need to switch the view back
    setView('myClass');
  };

  const getAttendanceForToday = (studentId: string) => {
    const student = myStudents.find(s => s.id === studentId);
    if (!student) return <Badge variant="outline">N/A</Badge>;
    const status = student.attendance[new Date().toDateString()];
    switch (status) {
      case 'present': return <Badge>Present</Badge>;
      case 'late': return <Badge variant="secondary">Late</Badge>;
      case 'unexcused': return <Badge variant="destructive">Absent</Badge>;
      case 'excused': return <Badge variant="outline">Excused</Badge>;
      default: return <Badge variant="outline">N/A</Badge>;
    }
  };

  const handleGenerateBio = async (studentId: string, studentName: string, studentClass: string) => {
    setLoadingBio(prev => ({...prev, [studentId]: true}));
    try {
        const result: GenerateStudentBioOutput = await generateStudentBio({name: studentName, studentClass: studentClass});
        setBios(prev => ({...prev, [studentId]: result.bio}));
        toast({ title: `Generated bio for ${studentName}`});
    } catch (e) {
        console.error(e);
        toast({ title: `Error generating bio for ${studentName}`, variant: 'destructive'});
    } finally {
        setLoadingBio(prev => ({...prev, [studentId]: false}));
    }
  };

  const TeacherMenu = () => (
     <Card>
      <CardHeader>
        <CardTitle>Teacher Dashboard</CardTitle>
        <CardDescription>Welcome, {teacher?.name}. Here are your tools and class overview.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
         <Card className="flex flex-col">
            <CardHeader><CardTitle>My Class</CardTitle><CardDescription>View your student roster and their status for today.</CardDescription></CardHeader>
            <CardContent className="flex-grow"></CardContent>
            <CardFooter><Button className="w-full" onClick={() => setView('myClass')}><BookOpen className="mr-2 h-4 w-4"/> View My Class</Button></CardFooter>
        </Card>
        <Card className="flex flex-col">
            <CardHeader><CardTitle>AI Attendance Insight</CardTitle><CardDescription>Get an AI-powered summary of your students' attendance patterns.</CardDescription></CardHeader>
            <CardContent className="flex-grow"></CardContent>
            <CardFooter><Button className="w-full" variant="outline" onClick={() => setView('aiInsight')}><BrainCircuit className="mr-2 h-4 w-4"/> Get AI Insight</Button></CardFooter>
        </Card>
      </CardContent>
    </Card>
  );

  const MyClassView = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>My Class Roster</CardTitle>
            <CardDescription>An overview of your students. Click to generate a creative bio for each student.</CardDescription>
          </div>
           <Button onClick={() => setView('addStudent')}><UserPlus className="mr-2 h-4 w-4" /> Add Student</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Today's Attendance</TableHead>
                        <TableHead>AI Generated Bio</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {myStudents.map(student => (
                        <TableRow key={student.id}>
                            <TableCell>
                                <div className="font-medium">{student.name}</div>
                                <div className="text-sm text-muted-foreground">{student.studentId} | {student.class}</div>
                            </TableCell>
                            <TableCell>{getAttendanceForToday(student.id)}</TableCell>
                             <TableCell>
                                {loadingBio[student.id] ? <Skeleton className="h-10 w-full" /> : 
                                 bios[student.id] ? <p className="text-sm text-muted-foreground">{bios[student.id]}</p> : 
                                <Button size="sm" variant="ghost" onClick={() => handleGenerateBio(student.id, student.name, student.class)}>
                                    Generate Bio
                                </Button>}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );


  const renderView = () => {
    switch (view) {
      case 'myClass': return <MyClassView />;
      case 'aiInsight': return <AiClassInsight onBack={() => setView('myClass')} />;
      case 'addStudent': return teacher ? <TeacherAddStudentForm teacher={teacher} onAddStudent={handleAddStudent} onBack={() => setView('myClass')} /> : <MyClassView />;
      default: return <TeacherMenu />;
    }
  };

  return (
    <div className="space-y-6">
      {renderView()}
    </div>
  );
}
