'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminPolicyCompliance, FlaggedStudentSuggestion } from '@/ai/flows/admin-policy-compliance';
import type { Student } from '@/lib/types';
import { useUserManagement } from '@/contexts/user-management-context';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function PolicyCompliance({ students, onBack }: { students: Student[], onBack: () => void }) {
  const { toast } = useToast();
  const { settings } = useUserManagement();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<FlaggedStudentSuggestion[] | null>(null);

  const handleAnalysis = async () => {
    setLoading(true);
    setResults(null);
    try {
        const policy = {
            maxUnexcusedAbsences: settings.maxUnexcusedAbsences,
            lateThresholdMinutes: settings.lateThreshold,
            expectedArrivalTime: settings.expectedTime
        };

        const studentDataForCheck = students.map(s => ({
            id: s.id,
            name: s.name,
            studentId: s.studentId,
            attendance: s.attendance,
        }));
        
        const flaggedStudents = await adminPolicyCompliance({ students: studentDataForCheck, policy });
        setResults(flaggedStudents);
        toast({
            title: 'Analysis Complete',
            description: `${flaggedStudents.length} student(s) flagged for policy review.`,
        });

    } catch (e: any) {
        console.error(e);
        toast({
            title: 'Analysis Failed',
            description: 'Could not run the AI policy compliance check.',
            variant: 'destructive',
        });
    } finally {
        setLoading(false);
    }
  };


  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft />
          </Button>
          <div>
            <CardTitle>AI Policy Compliance Check</CardTitle>
            <CardDescription>Automatically flag students who are approaching or violating attendance policies based on the current system settings.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 border-dashed border-2 rounded-lg text-center">
            <p className="text-muted-foreground mb-4">Click the button to run an AI-powered analysis on all student attendance data against the school's policy.</p>
             <Button onClick={handleAnalysis} disabled={loading}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : 'Run Compliance Analysis'}
            </Button>
        </div>

        {results && (
            <div>
                <h3 className="text-lg font-semibold mb-4">Analysis Results</h3>
                {results.length > 0 ? (
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead>Suggested Intervention</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {results.map(student => (
                                    <TableRow key={student.studentId}>
                                        <TableCell>
                                            <div className="font-medium">{student.studentName}</div>
                                            <div className="text-sm text-muted-foreground">{student.studentId}</div>
                                        </TableCell>
                                        <TableCell>{student.reason}</TableCell>
                                        <TableCell>{student.suggestedIntervention}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <ShieldCheck className="mx-auto h-12 w-12 text-green-500" />
                        <p className="mt-4 text-lg font-medium">All students are in compliance.</p>
                        <p className="text-muted-foreground">No attendance policy violations were found based on the current settings.</p>
                    </div>
                )}
            </div>
        )}
      </CardContent>
    </Card>
  );
}
