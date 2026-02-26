'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useUserManagement } from '@/contexts/user-management-context';
import QrcodeScanner from '@/components/qrcode-scanner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle, Camera, Clock, CameraOff, RefreshCw } from 'lucide-react';
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
    try {
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
    } catch (e) {
        console.warn("Audio feedback failed", e);
    }
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
        // Request permission with flexible constraints to avoid "Device not found"
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: cameraFacingMode } 
        }).catch(() => {
            // Fallback to any camera if specific facing mode fails
            return navigator.mediaDevices.getUserMedia({ video: true });
        });
        
        // Stop the tracks immediately, html5-qrcode will manage its own stream
        stream.getTracks().forEach(track => track.stop());
        setHasCameraPermission(true);
      } catch (err: any) {
        console.error("Camera permission error:", err);
        setHasCameraPermission(false);
        if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
            setError("No camera was found on this device.");
        } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            setError("Camera access was denied. Please enable camera permissions in your browser settings.");
        } else {
            setError("An error occurred while trying to access the camera.");
        }
      }
    };
    requestCameraPermission();
  }, [cameraFacingMode]);

  const onScanSuccess = useCallback((decodedText: string) => {
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
  }, [students, settings, updateStudentAttendance, toast]);

  const onScanFailure = useCallback((errorMessage: string) => {
    // This is noisy during normal operation, so we ignore it.
  }, []);

  const toggleCamera = () => {
    setCameraFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
    setError(null); // Reset error when switching
  }

  const renderScanner = () => {
    if (hasCameraPermission === null) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                < RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Requesting camera permission...</p>
            </div>
        );
    }
    
    if (hasCameraPermission === false || error?.includes("No camera")) {
        return (
            <Alert variant="destructive">
                <CameraOff className="h-4 w-4" />
                <AlertTitle>Camera Issue</AlertTitle>
                <AlertDescription>
                    {error || "Camera access is required for the QR code scanner. Please check your device settings and refresh."}
                </AlertDescription>
            </Alert>
        );
    }
    
    return (
        <div className="relative">
            <QrcodeScanner
                key={cameraFacingMode}
                onScanSuccess={onScanSuccess}
                onScanFailure={onScanFailure}
                facingMode={cameraFacingMode}
            />
            <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleCamera} 
                className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm hover:bg-background shadow-sm"
            >
                <Camera className="mr-2 h-4 w-4" />
                Switch Camera
            </Button>
        </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>QR Code Check-In</CardTitle>
        <CardDescription>Scan a student's QR code. Expected arrival: <span className="font-bold">{settings.expectedTime}</span>.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="w-full max-w-md mx-auto p-4 border rounded-lg bg-black/5">
          {renderScanner()}
        </div>
        
        {lastResult && (
          <Alert variant="default" className={lastResult.status === 'late' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'}>
            {lastResult.status === 'late' ? <Clock className="h-4 w-4 text-orange-600" /> : <CheckCircle className="h-4 w-4 text-green-600" />}
            <AlertTitle>Last Scan: <span className="capitalize">{lastResult.status}</span></AlertTitle>
            <AlertDescription>
              <p><strong>Name:</strong> {lastResult.student.name}</p>
              <p><strong>Student ID:</strong> {lastResult.student.studentId}</p>
              <p><strong>Time:</strong> {lastResult.timestamp.toLocaleTimeString()}</p>
            </AlertDescription>
          </Alert>
        )}
        
        {error && !error.includes("No camera") && (
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