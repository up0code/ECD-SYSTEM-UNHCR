'use client';
import { useState } from 'react';
import { useUserManagement } from '@/contexts/user-management-context';
import { useToast } from '@/hooks/use-toast';
import type { Teacher } from '@/lib/types';
import { AddTeacherForm } from '@/components/admin/add-teacher-form';
import { EditUserForm } from '@/components/admin/edit-user-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, MoreHorizontal, Trash2, Edit } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

type TeacherView = 'list' | 'add' | 'edit';

function TeacherList({ teachers, onEdit, onDelete }: { teachers: Teacher[], onEdit: (teacher: Teacher) => void, onDelete: (userId: string) => void }) {
  return (
     <div className="border rounded-md">
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Classes</TableHead>
                <TableHead>Subjects</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.map(teacher => (
                <TableRow key={teacher.id}>
                  <TableCell className="font-medium">{teacher.name}</TableCell>
                  <TableCell>{teacher.email}</TableCell>
                  <TableCell>{teacher.classes}</TableCell>
                   <TableCell>{teacher.subjects}</TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => onEdit(teacher)}>
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
                            This action cannot be undone. This will permanently delete the account for {teacher.name}.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(teacher.id)}>Delete</AlertDialogAction>
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

export default function TeachersTab() {
  const { teachers, addTeacher, updateUser, deleteUser } = useUserManagement();
  const { toast } = useToast();
  const [view, setView] = useState<TeacherView>('list');
  const [userToEdit, setUserToEdit] = useState<Teacher | null>(null);

  const handleAddTeacher = (teacherData: Omit<Teacher, 'id' | 'teacherId'>) => {
    addTeacher(teacherData);
    toast({ title: 'Teacher Added', description: `${teacherData.name} has been added.` });
    setView('list');
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setUserToEdit(teacher);
    setView('edit');
  };

  const handleSaveTeacher = (updatedUser: Teacher) => {
    updateUser(updatedUser);
    setUserToEdit(null);
    setView('list');
    toast({ title: 'Teacher Updated', description: `${updatedUser.name}'s information has been updated.` });
  };

  const handleDeleteTeacher = (userId: string) => {
    deleteUser(userId);
    toast({ title: 'Teacher Deleted', description: 'The teacher has been removed from the system.' });
  };

  const onBack = () => setView('list');
  
  // Filter out the admin user
  const teachersOnly = teachers.filter(t => t.email !== 'admin@test.com');

  const renderView = () => {
    switch (view) {
      case 'add':
        return <AddTeacherForm onAddTeacher={handleAddTeacher} onBack={onBack} />;
      case 'edit':
        return userToEdit ? <EditUserForm user={{...userToEdit, role: 'teacher'}} onSave={(user) => handleSaveTeacher(user as Teacher)} onBack={onBack} /> : null;
      case 'list':
      default:
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Manage Teachers</CardTitle>
                    <CardDescription>View, add, edit, or remove teachers.</CardDescription>
                </div>
                <Button onClick={() => setView('add')}><UserPlus className="mr-2"/> Add Teacher</Button>
              </div>
            </CardHeader>
            <CardContent>
              <TeacherList teachers={teachersOnly} onEdit={handleEditTeacher} onDelete={handleDeleteTeacher} />
            </CardContent>
          </Card>
        );
    }
  };

  return <div className="space-y-6">{renderView()}</div>;
}
