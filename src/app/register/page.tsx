'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUserManagement } from '@/contexts/user-management-context';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { UserRole } from '@/lib/types';

export default function RegisterPage() {
  const { registerStudent, registerParent } = useUserManagement();
  const { toast } = useToast();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!name || !email || !password) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }
    
    try {
      if (role === 'student') {
        registerStudent({ name, email, password });
        toast({
          title: 'Registration Successful!',
          description: 'Please get the approval code from your administrator to activate your account.',
        });
        router.push(`/approve?email=${encodeURIComponent(email)}`);
      } else if (role === 'parent') {
        registerParent({ name, email, password });
        toast({
          title: 'Registration Successful!',
          description: 'You can now log in.',
        });
        router.push('/login');
      }

    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleRegister}>
          <CardHeader>
            <CardTitle>Create an Account</CardTitle>
            <CardDescription>
              Choose your role and fill in your details to register.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Registration Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
             <div className="space-y-2">
                <Label>I am a...</Label>
                <RadioGroup defaultValue="student" onValueChange={(value) => setRole(value as UserRole)} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="student" id="role-student" />
                        <Label htmlFor="role-student">Student</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="parent" id="role-parent" />
                        <Label htmlFor="role-parent">Parent</Label>
                    </div>
                </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {role === 'student' && (
                <p className="text-xs text-muted-foreground">
                    After registering, you must get an approval code from an administrator to log in.
                </p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-accent hover:underline">
                    Login
                </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
