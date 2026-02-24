'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Copy, Check, Trash2 } from 'lucide-react';
import type { Student } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useUserManagement } from '@/contexts/user-management-context';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function PendingApprovals({ students, onBack }: { students: Student[], onBack: () => void }) {
    const { toast } = useToast();
    const { adminApproveStudent, deleteUser } = useUserManagement();
    const pendingStudents = students.filter(s => s.status === 'pending');

    const handleApprove = (student: Student) => {
        adminApproveStudent(student.id);
        toast({ title: 'Student Approved', description: `${student.name} can now log in.` });
    };

    const handleDelete = (student: Student) => {
        deleteUser(student.id);
        toast({ title: 'Registration Rejected', description: `The registration for ${student.name} has been deleted.`, variant: 'destructive' });
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast({ title: 'Code Copied!', description: 'The approval code has been copied to your clipboard.' });
    };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft />
          </Button>
          <div>
            <CardTitle>Pending Student Approvals</CardTitle>
            <CardDescription>Review and directly approve or reject new student registrations.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Approval Code</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingStudents.length > 0 ? (
                pendingStudents.map(student => (
                    <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>
                        <div className="flex items-center justify-start gap-2">
                            <span className="font-mono text-sm bg-muted px-2 py-1 rounded">{student.approvalCode}</span>
                             <Button variant="ghost" size="icon" onClick={() => copyCode(student.approvalCode || '')}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </TableCell>
                    <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleApprove(student)}>
                                <Check className="mr-2 h-4 w-4" /> Approve
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                        <Trash2 className="mr-2 h-4 w-4" /> Reject
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently delete the pending registration for {student.name}. This action cannot be undone.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(student)}>Reject</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </TableCell>
                    </TableRow>
                ))
              ) : (
                 <TableRow>
                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                        No students are currently pending approval.
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
