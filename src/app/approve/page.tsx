'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

function ApproveForm() {
  const { approveStudent } = useUserManagement();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!code) {
      setError('Approval code is required.');
      setLoading(false);
      return;
    }
     if (!email) {
      setError('Email not found. Please try registering again.');
      setLoading(false);
      return;
    }
    
    const success = approveStudent(email, code);

    if (success) {
      toast({
        title: 'Account Approved!',
        description: 'You can now log in with your credentials.',
      });
      router.push('/login');
    } else {
      setError('Invalid approval code. Please check the code and try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Enter Approval Code</CardTitle>
            <CardDescription>
              An administrator has been given a code to approve your account. Please enter it below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Approval Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="code">Approval Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="6-digit code"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Verifying...' : 'Approve Account'}
            </Button>
             <div className="text-sm text-center text-muted-foreground">
                Wrong account?{' '}
                <Link href="/register" className="font-medium text-accent hover:underline">
                    Register again
                </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function ApprovePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ApproveForm />
        </Suspense>
    )
}
