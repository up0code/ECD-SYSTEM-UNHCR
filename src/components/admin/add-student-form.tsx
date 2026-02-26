'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Student, Teacher } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function AddStudentForm({ teachers, onAddStudent, onBack }: { teachers: Teacher[], onAddStudent: (student: Omit<Student, 'id' | 'studentId' | 'status'>) => void; onBack: () => void }) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [className, setClassName] = useState('Class A');
  const [teacherId, setTeacherId] = useState(teachers.length > 0 ? teachers[0].id : '');

  const handleSubmit = () => {
    if (!name || !email || !password) {
      toast({ title: 'Name, email, and password are required.', variant: 'destructive' });
      return;
    }
    
    const newStudentData = {
      name,
      email,
      password,
      class: className,
      teacherId,
      dob: '2016-01-01',
      phone: '555-0199',
      address: 'N/A',
      photo: null,
      grades: {},
      attendance: {},
    };

    onAddStudent(newStudentData);
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
              <CardTitle>Add New Student</CardTitle>
              <CardDescription>Fill in the details to add a new, approved student.</CardDescription>
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
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="class">Class</Label>
            <Select value={className} onValueChange={setClassName}>
              <SelectTrigger id="class">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Class A">Class A</SelectItem>
                <SelectItem value="Class B">Class B</SelectItem>
                <SelectItem value="Class C">Class C</SelectItem>
              </SelectContent>
            </Select>
          </div>
           <div className="space-y-2">
            <Label htmlFor="teacher">Teacher</Label>
            <Select value={teacherId} onValueChange={setTeacherId}>
              <SelectTrigger id="teacher">
                <SelectValue placeholder="Select teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachers.filter(t => t.email !== 'admin@test.com').map(teacher => (
                  <SelectItem key={teacher.id} value={teacher.id}>{teacher.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSubmit} className="w-full">Add Student</Button>
        </CardContent>
      </Card>
    </div>
  );
}
