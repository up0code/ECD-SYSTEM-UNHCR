'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, UserCog, DatabaseBackup, ShieldCheck, UserCheck, Users, BookOpen, HeartHandshake } from 'lucide-react';
import { BackupRestore } from '@/components/admin/backup-restore';
import { ManageUsers } from '@/components/admin/manage-users';
import { AddTeacherForm } from '@/components/admin/add-teacher-form';
import { AddStudentForm } from '@/components/admin/add-student-form';
import { PolicyCompliance } from '@/components/admin/policy-compliance';
import type { Student, Teacher, Parent } from '@/lib/types';
import { EditUserForm } from '@/components/admin/edit-user-form';
import { useToast } from '@/hooks/use-toast';
import { useUserManagement } from '@/contexts/user-management-context';
import { PendingApprovals } from '@/components/admin/pending-approvals';
import { Badge } from '@/components/ui/badge';

type User = (Student & { role: 'student' }) | (Teacher & { role: 'teacher' }) | (Parent & { role: 'parent' });
type AdminView = 'menu' | 'addTeacher' | 'addStudent' | 'backupRestore' | 'manageUsers' | 'policyCompliance' | 'editUser' | 'pendingApprovals';

export default function AdminTab() {
  const [view, setView] = useState<AdminView>('menu');
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const { toast } = useToast();

  const { students, teachers, parents, addTeacher, addStudent, updateUser, deleteUser } = useUserManagement();
  const pendingCount = students.filter(s => s.status === 'pending').length;
  const studentCount = students.length;
  const teacherCount = teachers.filter(t => t.email !== 'admin@test.com').length;
  const parentCount = parents.length;


  const handleDeleteUser = (userId: string) => {
    deleteUser(userId);
    toast({ title: 'User Deleted', description: 'The user has been removed from the system.' });
    setView('menu'); // Go back to menu after deletion
  };
  
  const handleEditUser = (user: User) => {
    setUserToEdit(user);
    setView('editUser');
  };

  const handleSaveUser = (updatedUser: User) => {
    updateUser(updatedUser);
    setUserToEdit(null);
    setView('manageUsers');
    toast({ title: 'User Updated', description: `${updatedUser.name}'s information has been updated.` });
  };
  
  const handleAddTeacher = (teacherData: Omit<Teacher, 'id' | 'teacherId'>) => {
    addTeacher(teacherData);
    toast({ title: 'Teacher Added', description: `${teacherData.name} has been added.` });
    setView('menu');
  }

  const handleAddStudent = (studentData: Omit<Student, 'id' | 'studentId' | 'status'>) => {
    addStudent(studentData);
    toast({ title: 'Student Added', description: `${studentData.name} has been added.` });
    setView('menu');
  }

  const allUsers: User[] = [
      ...teachers.map(t => ({...t, role: (t.email.toLowerCase() === 'admin@test.com' ? 'admin' : 'teacher') as const})), 
      ...students.map(s => ({...s, role: 'student' as const})),
      ...parents.map(p => ({...p, role: 'parent' as const})),
  ];

  const AdminMenu = () => (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Admin Dashboard</CardTitle>
                <CardDescription>An overview of the system's key metrics.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{studentCount}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{teacherCount}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Parents</CardTitle>
                        <HeartHandshake className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{parentCount}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingCount}</div>
                    </CardContent>
                </Card>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Admin Panel</CardTitle>
                <CardDescription>Manage users, system settings, and run compliance checks.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="flex flex-col">
                    <CardHeader><CardTitle>Pending Approvals</CardTitle></CardHeader>
                    <CardContent className="flex-grow">
                        <CardDescription>
                            {pendingCount > 0 
                                ? `There are ${pendingCount} new student registration(s) to review.` 
                                : 'Review and approve new student registrations.'
                            }
                        </CardDescription>
                    </CardContent>
                    <CardContent>
                        <Button className="w-full" onClick={() => setView('pendingApprovals')}>
                            <UserCheck className="mr-2 h-4 w-4" /> 
                            View Approvals
                            {pendingCount > 0 && <Badge variant="destructive" className="ml-2">{pendingCount}</Badge>}
                        </Button>
                    </CardContent>
                </Card>
                <Card className="flex flex-col">
                    <CardHeader><CardTitle>Add Student</CardTitle></CardHeader>
                    <CardContent className="flex-grow"><CardDescription>Manually add a new, pre-approved student account.</CardDescription></CardContent>
                    <CardContent><Button className="w-full" variant="outline" onClick={() => setView('addStudent')}><UserPlus className="mr-2 h-4 w-4" /> Add Student</Button></CardContent>
                </Card>
                <Card className="flex flex-col">
                    <CardHeader><CardTitle>Add Teacher</CardTitle></CardHeader>
                    <CardContent className="flex-grow"><CardDescription>Onboard a new teacher.</CardDescription></CardContent>
                    <CardContent><Button className="w-full" variant="outline" onClick={() => setView('addTeacher')}><UserPlus className="mr-2 h-4 w-4" /> Add Teacher</Button></CardContent>
                </Card>
                <Card className="flex flex-col">
                    <CardHeader><CardTitle>Manage Users</CardTitle></CardHeader>
                    <CardContent className="flex-grow"><CardDescription>Edit or remove students, teachers, and parents.</CardDescription></CardContent>
                    <CardContent><Button className="w-full" variant="outline" onClick={() => setView('manageUsers')}><Users className="mr-2 h-4 w-4" /> Manage Users</Button></CardContent>
                </Card>
                <Card className="flex flex-col">
                    <CardHeader><CardTitle>AI Policy Compliance</CardTitle></CardHeader>
                    <CardContent className="flex-grow"><CardDescription>Automatically flag students violating attendance policies.</CardDescription></CardContent>
                    <CardContent><Button className="w-full" variant="outline" onClick={() => setView('policyCompliance')}><ShieldCheck className="mr-2 h-4 w-4" /> Run Analysis</Button></CardContent>
                </Card>
                <Card className="flex flex-col">
                    <CardHeader><CardTitle>Backup & Restore</CardTitle></CardHeader>
                    <CardContent className="flex-grow"><CardDescription>Download a backup or restore system data.</CardDescription></CardContent>
                    <CardContent><Button className="w-full" variant="outline" onClick={() => setView('backupRestore')}><DatabaseBackup className="mr-2 h-4 w-4" /> Backup/Restore</Button></CardContent>
                </Card>
            </CardContent>
        </Card>
    </div>
  );

  const renderView = () => {
    switch (view) {
      case 'pendingApprovals': return <PendingApprovals students={students} onBack={() => setView('menu')} />;
      case 'addStudent': return <AddStudentForm teachers={teachers} onAddStudent={handleAddStudent} onBack={() => setView('menu')} />;
      case 'addTeacher': return <AddTeacherForm onAddTeacher={handleAddTeacher} onBack={() => setView('menu')} />;
      case 'backupRestore': return <BackupRestore onBack={() => setView('menu')} />;
      case 'manageUsers': 
        const usersToManage = allUsers.filter(u => u.email !== 'admin@test.com');
        return <ManageUsers users={usersToManage} onEdit={handleEditUser} onDelete={handleDeleteUser} onBack={() => setView('menu')} />;
      case 'policyCompliance': return <PolicyCompliance students={students} onBack={() => setView('menu')} />;
      case 'editUser': return userToEdit ? <EditUserForm user={userToEdit} onSave={handleSaveUser} onBack={() => setView('manageUsers')} /> : <AdminMenu />;
      default: return <AdminMenu />;
    }
  };

  return (
    <div className="space-y-6">
      {renderView()}
    </div>
  );
}
