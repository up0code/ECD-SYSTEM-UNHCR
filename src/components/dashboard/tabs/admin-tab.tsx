'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, UserCog, DatabaseBackup, ShieldCheck, UserCheck, Users, BookOpen, HeartHandshake, LayoutDashboard } from 'lucide-react';
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
    setView('menu');
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
        <div className="flex items-center gap-2 mb-2">
            <LayoutDashboard className="h-6 w-6 text-accent" />
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-l-4 border-l-accent shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{studentCount}</div>
                    <p className="text-xs text-muted-foreground mt-1">Enrolled students</p>
                </CardContent>
            </Card>
             <Card className="border-l-4 border-l-primary shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{teacherCount}</div>
                    <p className="text-xs text-muted-foreground mt-1">Teaching staff</p>
                </CardContent>
            </Card>
             <Card className="border-l-4 border-l-green-500 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Parents</CardTitle>
                    <HeartHandshake className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{parentCount}</div>
                    <p className="text-xs text-muted-foreground mt-1">Linked accounts</p>
                </CardContent>
            </Card>
             <Card className={`border-l-4 shadow-sm ${pendingCount > 0 ? 'border-l-destructive animate-pulse' : 'border-l-muted'}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{pendingCount}</div>
                    <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
                </CardContent>
            </Card>
        </div>

        <Card className="shadow-md">
            <CardHeader>
                <CardTitle>Management Console</CardTitle>
                <CardDescription>Administrative tools and system configurations.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="flex flex-col hover:border-accent transition-colors cursor-pointer" onClick={() => setView('pendingApprovals')}>
                    <CardHeader><CardTitle className="text-base">Pending Approvals</CardTitle></CardHeader>
                    <CardContent className="flex-grow">
                        <CardDescription>
                            {pendingCount > 0 
                                ? `You have ${pendingCount} registration(s) to verify.` 
                                : 'Check for new student sign-ups.'
                            }
                        </CardDescription>
                    </CardContent>
                    <CardContent>
                        <Button className="w-full" size="sm">
                            <UserCheck className="mr-2 h-4 w-4" /> 
                            View List
                            {pendingCount > 0 && <Badge variant="destructive" className="ml-2">{pendingCount}</Badge>}
                        </Button>
                    </CardContent>
                </Card>
                <Card className="flex flex-col hover:border-accent transition-colors cursor-pointer" onClick={() => setView('addStudent')}>
                    <CardHeader><CardTitle className="text-base">Quick Add: Student</CardTitle></CardHeader>
                    <CardContent className="flex-grow"><CardDescription>Directly create an approved student account.</CardDescription></CardContent>
                    <CardContent><Button className="w-full" variant="outline" size="sm"><UserPlus className="mr-2 h-4 w-4" /> Add Student</Button></CardContent>
                </Card>
                <Card className="flex flex-col hover:border-accent transition-colors cursor-pointer" onClick={() => setView('addTeacher')}>
                    <CardHeader><CardTitle className="text-base">Quick Add: Teacher</CardTitle></CardHeader>
                    <CardContent className="flex-grow"><CardDescription>Register a new faculty member.</CardDescription></CardContent>
                    <CardContent><Button className="w-full" variant="outline" size="sm"><UserPlus className="mr-2 h-4 w-4" /> Add Teacher</Button></CardContent>
                </Card>
                <Card className="flex flex-col hover:border-accent transition-colors cursor-pointer" onClick={() => setView('manageUsers')}>
                    <CardHeader><CardTitle className="text-base">User Directory</CardTitle></CardHeader>
                    <CardContent className="flex-grow"><CardDescription>Edit or remove existing users across all roles.</CardDescription></CardContent>
                    <CardContent><Button className="w-full" variant="outline" size="sm"><Users className="mr-2 h-4 w-4" /> Open Directory</Button></CardContent>
                </Card>
                <Card className="flex flex-col hover:border-accent transition-colors cursor-pointer" onClick={() => setView('policyCompliance')}>
                    <CardHeader><CardTitle className="text-base">Policy AI Agent</CardTitle></CardHeader>
                    <CardContent className="flex-grow"><CardDescription>Run AI analysis to flag attendance policy violations.</CardDescription></CardContent>
                    <CardContent><Button className="w-full" variant="outline" size="sm"><ShieldCheck className="mr-2 h-4 w-4" /> Run Analysis</Button></CardContent>
                </Card>
                <Card className="flex flex-col hover:border-accent transition-colors cursor-pointer" onClick={() => setView('backupRestore')}>
                    <CardHeader><CardTitle className="text-base">Data Management</CardTitle></CardHeader>
                    <CardContent className="flex-grow"><CardDescription>Manage database backups and system restoration.</CardDescription></CardContent>
                    <CardContent><Button className="w-full" variant="outline" size="sm"><DatabaseBackup className="mr-2 h-4 w-4" /> Backup Tools</Button></CardContent>
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