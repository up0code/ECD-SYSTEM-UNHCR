'use client';
import { useState } from 'react';
import { useUserManagement } from '@/contexts/user-management-context';
import { useToast } from '@/hooks/use-toast';
import type { Parent } from '@/lib/types';
import { AddParentForm } from '@/components/admin/add-parent-form';
import { EditUserForm } from '@/components/admin/edit-user-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, MoreHorizontal, Trash2, Edit } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

type ParentView = 'list' | 'add' | 'edit';

function ParentList({ parents, onEdit, onDelete }: { parents: Parent[], onEdit: (parent: Parent) => void, onDelete: (userId: string) => void }) {
  return (
     <div className="border rounded-md">
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parents.map(parent => (
                <TableRow key={parent.id}>
                  <TableCell className="font-medium">{parent.name}</TableCell>
                  <TableCell>{parent.email}</TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => onEdit(parent)}>
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
                            This action cannot be undone. This will permanently delete the account for {parent.name}.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(parent.id)}>Delete</AlertDialogAction>
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

export default function ParentsTab() {
  const { parents, addParent, updateUser, deleteUser } = useUserManagement();
  const { toast } = useToast();
  const [view, setView] = useState<ParentView>('list');
  const [userToEdit, setUserToEdit] = useState<Parent | null>(null);

  const handleAddParent = (parentData: Omit<Parent, 'id'>) => {
    addParent(parentData);
    toast({ title: 'Parent Added', description: `${parentData.name} has been added.` });
    setView('list');
  };

  const handleEditParent = (parent: Parent) => {
    setUserToEdit(parent);
    setView('edit');
  };

  const handleSaveParent = (updatedUser: Parent) => {
    updateUser(updatedUser);
    setUserToEdit(null);
    setView('list');
    toast({ title: 'Parent Updated', description: `${updatedUser.name}'s information has been updated.` });
  };

  const handleDeleteParent = (userId: string) => {
    deleteUser(userId);
    toast({ title: 'Parent Deleted', description: 'The parent has been removed from the system.' });
  };

  const onBack = () => setView('list');

  const renderView = () => {
    switch (view) {
      case 'add':
        return <AddParentForm onAddParent={handleAddParent} onBack={onBack} />;
      case 'edit':
        return userToEdit ? <EditUserForm user={{...userToEdit, role: 'parent'}} onSave={(user) => handleSaveParent(user as Parent)} onBack={onBack} /> : null;
      case 'list':
      default:
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Manage Parents</CardTitle>
                    <CardDescription>View, add, edit, or remove parents.</CardDescription>
                </div>
                <Button onClick={() => setView('add')}><UserPlus className="mr-2"/> Add Parent</Button>
              </div>
            </CardHeader>
            <CardContent>
              <ParentList parents={parents} onEdit={handleEditParent} onDelete={handleDeleteParent} />
            </CardContent>
          </Card>
        );
    }
  };

  return <div className="space-y-6">{renderView()}</div>;
}
