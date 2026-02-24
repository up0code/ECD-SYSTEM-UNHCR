'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Student, Teacher } from '@/lib/types';

type User = (Student & { role: 'student' }) | (Teacher & { role: 'teacher' });

export function EditUserForm({ user, onSave, onBack }: { user: User; onSave: (user: User) => void; onBack: () => void }) {
  const { toast } = useToast();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);

  useEffect(() => {
    setName(user.name);
    setEmail(user.email);
  }, [user]);

  const handleSubmit = () => {
    if (!name || !email) {
      toast({ title: 'Name and email are required.', variant: 'destructive' });
      return;
    }
    
    const updatedUser = { ...user, name, email };
    onSave(updatedUser);
    // Toast is now handled in the parent component (AdminTab)
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft />
          </Button>
          <div>
            <CardTitle>Edit User: {user.name}</CardTitle>
            <CardDescription>Update the user's details below.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <Button onClick={handleSubmit}>Save Changes</Button>
      </CardContent>
    </Card>
  );
}
