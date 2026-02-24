'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Student, Teacher } from '@/lib/types';

export function AddStudentForm({ teacher, onAddStudent, onBack }: { teacher: Teacher, onAddStudent: (student: Omit<Student, 'id' | 'studentId' | 'status'>) => void; onBack: () => void }) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    if (!name || !email || !password) {
      toast({ title: 'Name, email, and password are required.', variant: 'destructive' });
      return;
    }
    
    // For simplicity, we'll pick the first class from the teacher's list of classes
    const studentClass = teacher.classes.split(',')[0].trim();

    const newStudentData = {
      name,
      email,
      password,
      class: studentClass,
      teacherId: teacher.id,
      dob: '2016-01-01',
      phone: '555-0199',
      address: 'N/A',
      photo: null,
      grades: {},
      attendance: {},
    };

    onAddStudent(newStudentData);
    toast({ title: 'Student Added', description: `${name} has been added to ${studentClass}.` });
    onBack();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft />
          </Button>
          <div>
            <CardTitle>Add New Student</CardTitle>
            <CardDescription>Add a new, approved student to your class.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john.doe@example.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Temporary Password" />
        </div>
        <Button onClick={handleSubmit}>Add Student</Button>
      </CardContent>
    </Card>
  );
}
