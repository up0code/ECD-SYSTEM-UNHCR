'use client';
import { useState } from 'react';
import { useUserManagement } from '@/contexts/user-management-context';
import { useToast } from '@/hooks/use-toast';
import type { Student } from '@/lib/types';
import { AddStudentForm } from '@/components/admin/add-student-form';
import { EditUserForm } from '@/components/admin/edit-user-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, ArrowLeft, MoreHorizontal, Trash2, Edit, Copy } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
} from "@/components/ui/alert-dialog";

type StudentView = 'list' | 'add' | 'edit';

function StudentList({ students, onEdit, onDelete }: { students: Student[], onEdit: (student: Student) => void, onDelete: (userId: string) => void }) {
  const { toast } = useToast();

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: 'Code Copied!', description: 'The approval code has been copied to your clipboard.' });
  };
    
  return (
     <div className="border rounded-md">
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Status / Code</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map(student => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.class}</TableCell>
                  <TableCell>
                    {student.status === 'pending' ? (
                        <div className="flex items-center gap-2">
                           <Badge variant="destructive">{student.status}</Badge>
                           <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{student.approvalCode}</span>
                           <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyCode(student.approvalCode || '')}>
                                <Copy className="h-3.5 w-3.5" />
                           </Button>
                        </div>
                    ) : (
                        <Badge variant="default">{student.status}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => onEdit(student)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the account for {student.name}.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(student.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
     </div>
  );
}


export default function StudentsTab() {
  const { students, teachers, addStudent, updateUser, deleteUser } = useUserManagement();
  const { toast } = useToast();
  const [view, setView] = useState<StudentView>('list');
  const [userToEdit, setUserToEdit] = useState<Student | null>(null);

  const handleAddStudent = (studentData: Omit<Student, 'id' | 'studentId' | 'status'>) => {
    addStudent(studentData);
    toast({ title: 'Student Added', description: `${studentData.name} has been added.` });
    setView('list');
  };

  const handleEditStudent = (student: Student) => {
    setUserToEdit(student);
    setView('edit');
  };

  const handleSaveStudent = (updatedUser: Student) => {
    // The EditUserForm returns a generic user, so we cast it back
    updateUser(updatedUser);
    setUserToEdit(null);
    setView('list');
    toast({ title: 'Student Updated', description: `${updatedUser.name}'s information has been updated.` });
  };

  const handleDeleteStudent = (userId: string) => {
    deleteUser(userId);
    toast({ title: 'Student Deleted', description: 'The student has been removed from the system.' });
  };

  const onBack = () => setView('list');

  const renderView = () => {
    switch (view) {
      case 'add':
        return <AddStudentForm teachers={teachers} onAddStudent={handleAddStudent} onBack={onBack} />;
      case 'edit':
        return userToEdit ? <EditUserForm user={{...userToEdit, role: 'student'}} onSave={(user) => handleSaveStudent(user as Student)} onBack={onBack} /> : null;
      case 'list':
      default:
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Manage Students</CardTitle>
                    <CardDescription>View, add, edit, or remove students. Pending students will show an approval code.</CardDescription>
                </div>
                <Button onClick={() => setView('add')}><UserPlus className="mr-2"/> Add Student</Button>
              </div>
            </CardHeader>
            <CardContent>
              <StudentList students={students} onEdit={handleEditStudent} onDelete={handleDeleteStudent} />
            </CardContent>
          </Card>
        );
    }
  };

  return <div className="space-y-6">{renderView()}</div>;
}
