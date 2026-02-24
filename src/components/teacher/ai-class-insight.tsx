'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BrainCircuit, Loader2, UserCheck, UserX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { useUserManagement } from '@/contexts/user-management-context';
import { teacherAttendanceInsight, TeacherAttendanceInsightOutput } from '@/ai/flows/teacher-attendance-insight';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function AiClassInsight({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { teachers, students } = useUserManagement();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TeacherAttendanceInsightOutput | null>(null);

  const handleAnalysis = async () => {
    setLoading(true);
    setResults(null);
    const teacher = teachers.find(t => t.email === user?.email);

    if (!teacher) {
        toast({ title: 'Could not identify teacher.', variant: 'destructive'});
        setLoading(false);
        return;
    }

    try {
        const studentRawData = students.map(s => ({
            id: s.id,
            name: s.name,
            class: s.class,
            teacherId: s.teacherId,
            attendance: s.attendance
        }));

      const insight = await teacherAttendanceInsight({
        teacherId: teacher.id,
        teacherName: teacher.name,
        students: studentRawData,
        currentDate: new Date().toISOString().split('T')[0],
      });
      setResults(insight);
      toast({
        title: 'Insight Generated',
        description: 'AI-powered attendance summary is ready.',
      });
    } catch (e: any) {
      console.error(e);
      toast({
        title: 'Analysis Failed',
        description: 'Could not generate the AI insight.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // Automatically run analysis on component mount
    handleAnalysis();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft />
          </Button>
          <div>
            <CardTitle>AI Attendance Insight</CardTitle>
            <CardDescription>An AI-generated summary of your students' attendance patterns.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading && (
            <div className="flex items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Analyzing attendance data...</p>
            </div>
        )}
        {results && (
            <div className="space-y-6">
                <Alert>
                    <BrainCircuit className="h-4 w-4"/>
                    <AlertTitle>AI Summary</AlertTitle>
                    <AlertDescription>
                        {results.summary}
                    </AlertDescription>
                </Alert>

                <div>
                    <h3 className="font-semibold text-lg mb-2">Students Needing Attention</h3>
                    {results.studentsNeedingAttention.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2">
                            {results.studentsNeedingAttention.map(student => (
                                <Card key={student.id}>
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium">{student.name}</CardTitle>
                                        <UserX className="h-4 w-4 text-destructive" />
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-xs text-muted-foreground">{student.reason}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 border rounded-lg">
                            <UserCheck className="mx-auto h-12 w-12 text-green-500" />
                            <p className="mt-4 text-lg font-medium">Great job!</p>
                            <p className="text-muted-foreground">No students are currently showing significant attendance issues.</p>
                        </div>
                    )}
                </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
