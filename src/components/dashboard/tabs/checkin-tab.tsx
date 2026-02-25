'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useUserManagement } from '@/contexts/user-management-context';
import QrcodeScanner from '@/components/qrcode-scanner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle, Camera, Clock, CameraOff } from 'lucide-react';
import type { Student } from '@/lib/types';
import { Button } from '@/components/ui/button';

type ScanResult = {
  student: Student;
  timestamp: Date;
  status: 'present' | 'late';
};

// Function to play a 'pip' sound
const playPipSound = () => {
    if (typeof window === 'undefined') return;
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (!context) return;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, context.currentTime); // A6 note
    gainNode.gain.setValueAtTime(0.5, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.5);

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start();
    oscillator.stop(context.currentTime + 0.3);
};


export default function CheckinTab() {
  const { toast } = useToast();
  const { students, settings, updateStudentAttendance } = useUserManagement();
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>('environment');

  useEffect(() => {
    const requestCameraPermission = async () => {
      try {
        // Request permission
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        // Stop the tracks immediately, html5-qrcode will manage its own stream
        stream.getTracks().forEach(track => track.stop());
        setHasCameraPermission(true);
      } catch (err) {
        console.error("Camera permission error:", err);
        setHasCameraPermission(false);
        setError("Camera access was denied. Please enable camera permissions in your browser settings to use the scanner.");
      }
    };
    requestCameraPermission();
  }, []);

  const onScanSuccess = (decodedText: string) => {
    playPipSound(); // Play sound on successful scan
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

  const renderScanner = () => {
    if (hasCameraPermission === null) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-muted-foreground">Requesting camera permission...</p>
            </div>
        );
    }
    if (hasCameraPermission === false) {
        return (
            <Alert variant="destructive">
                <CameraOff className="h-4 w-4" />
                <AlertTitle>Camera Access Denied</AlertTitle>
                <AlertDescription>
                    Camera access is required for the QR code scanner. Please enable it in your browser settings and refresh the page.
                </AlertDescription>
            </Alert>
        );
    }
    return (
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
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>QR Code Check-In</CardTitle>
        <CardDescription>Scan a student's QR code to mark them as present or late based on the school's arrival time of <span className="font-bold">{settings.expectedTime}</span>.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="w-full max-w-md mx-auto p-4 border rounded-lg relative">
          {renderScanner()}
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
