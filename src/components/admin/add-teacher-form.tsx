'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Teacher } from '@/lib/types';

export function AddTeacherForm({ onAddTeacher, onBack }: { onAddTeacher: (teacher: Omit<Teacher, 'id' | 'teacherId'>) => void; onBack: () => void }) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [subjects, setSubjects] = useState('');
  const [classes, setClasses] = useState('');

  const handleSubmit = () => {
    if (!name || !email || !password) {
      toast({ title: 'Name, email and password are required.', variant: 'destructive' });
      return;
    }

    const newTeacherData = {
      name,
      email,
      password,
      subjects,
      classes,
      phone: '555-0198',
      bio: '',
      notes: {},
    };

    onAddTeacher(newTeacherData);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft />
            </Button>
            <div>
              <CardTitle>Add New Teacher</CardTitle>
              <CardDescription>Fill in the details to add a new teacher.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane.smith@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subjects">Subjects</Label>
            <Input id="subjects" value={subjects} onChange={(e) => setSubjects(e.target.value)} placeholder="Math, Science" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="classes">Classes</Label>
            <Input id="classes" value={classes} onChange={(e) => setClasses(e.target.value)} placeholder="Class A, Class B" />
          </div>
          <Button onClick={handleSubmit} className="w-full">Add Teacher</Button>
        </CardContent>
      </Card>
    </div>
  );
}
