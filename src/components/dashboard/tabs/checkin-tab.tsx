'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useUserManagement } from '@/contexts/user-management-context';
import QrcodeScanner from '@/components/qrcode-scanner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle, Camera, Clock } from 'lucide-react';
import type { Student } from '@/lib/types';
import { Button } from '@/components/ui/button';

type ScanResult = {
  student: Student;
  timestamp: Date;
  status: 'present' | 'late';
};

export default function CheckinTab() {
  const { toast } = useToast();
  const { students, settings, updateStudentAttendance } = useUserManagement();
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>('environment');

  const onScanSuccess = (decodedText: string) => {
    const student = students.find(s => s.studentId === decodedText);
    if (student) {
      const now = new Date();
      const [hours, minutes] = settings.expectedTime.split(':').map(Number);
      const expectedTimeToday = new Date();
      expectedTimeToday.setHours(hours, minutes, 0, 0);

      const status = now > expectedTimeToday ? 'late' : 'present';

      updateStudentAttendance(student.id, now.toDateString(), status);
      
      setLastResult({ student, timestamp: now, status });
      setError(null);

      toast({
        title: 'Check-In Successful',
        description: `${student.name} marked as ${status}.`,
        className: status === 'late' ? 'bg-orange-100 dark:bg-orange-900/30' : ''
      });
    } else {
      setError(`Student ID not found: ${decodedText}`);
      setLastResult(null);
       toast({
        title: 'Check-In Failed',
        description: `No student found with ID: ${decodedText}`,
        variant: 'destructive',
      });
    }
  };

  const onScanFailure = (errorMessage: string) => {
    // This can be noisy, so we often ignore it.
  };

  const toggleCamera = () => {
    setCameraFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>QR Code Check-In</CardTitle>
        <CardDescription>Scan a student's QR code to mark them as present or late based on the school's arrival time of <span className="font-bold">{settings.expectedTime}</span>.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="w-full max-w-md mx-auto p-4 border rounded-lg relative">
          {showScanner ? (
            <>
             <QrcodeScanner
              key={cameraFacingMode}
              onScanSuccess={onScanSuccess}
              onScanFailure={onScanFailure}
              facingMode={cameraFacingMode}
            />
            <Button variant="outline" size="icon" onClick={toggleCamera} className="absolute top-2 right-2 z-10 bg-background/50 backdrop-blur-sm hover:bg-background/75">
                <Camera />
                <span className="sr-only">Switch Camera</span>
            </Button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-muted-foreground mb-4">Click the button to start the camera and begin scanning.</p>
                <Button onClick={() => setShowScanner(true)}>Start Scanner</Button>
            </div>
          )}
        </div>
        
        {lastResult && (
          <Alert variant="default" className={lastResult.status === 'late' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'}>
            {lastResult.status === 'late' ? <Clock className="h-4 w-4 text-orange-600" /> : <CheckCircle className="h-4 w-4 text-green-600" />}
            <AlertTitle>Last Successful Scan: <span className="capitalize">{lastResult.status}</span></AlertTitle>
            <AlertDescription>
              <p><strong>Name:</strong> {lastResult.student.name}</p>
              <p><strong>Student ID:</strong> {lastResult.student.studentId}</p>
              <p><strong>Timestamp:</strong> {lastResult.timestamp.toLocaleString()}</p>
            </AlertDescription>
          </Alert>
        )}
        
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Scan Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
