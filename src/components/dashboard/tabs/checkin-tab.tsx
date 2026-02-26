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
        const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
        if (!AudioContextClass) return;
        const context = new AudioContextClass();
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
  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user' | 'any'>('environment');

  useEffect(() => {
    const requestCameraPermission = async () => {
      try {
        // Try requested facing mode first
        let constraints: MediaStreamConstraints = { 
            video: cameraFacingMode === 'any' ? true : { facingMode: cameraFacingMode } 
        };
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            stream.getTracks().forEach(track => track.stop());
            setHasCameraPermission(true);
            setError(null);
        } catch (initialErr: any) {
            // If environment fails, try any video
            if (cameraFacingMode === 'environment') {
                const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
                fallbackStream.getTracks().forEach(track => track.stop());
                setHasCameraPermission(true);
                setCameraFacingMode('any');
                setError(null);
            } else {
                throw initialErr;
            }
        }
      } catch (err: any) {
        console.error("Camera access error:", err);
        setHasCameraPermission(false);
        if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
            setError("No camera found. If you are on a desktop, please ensure a webcam is connected.");
        } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            setError("Camera access denied. Please enable camera permissions in your browser settings.");
        } else {
            setError(`Camera error: ${err.message || 'Unknown error'}`);
        }
      }
    };
    requestCameraPermission();
  }, [cameraFacingMode]);

  const onScanSuccess = useCallback((decodedText: string) => {
    playPipSound(); 
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
    // Ignore routine scan failures
  }, []);

  const toggleCamera = () => {
    const nextMode = cameraFacingMode === 'environment' ? 'user' : 'environment';
    setCameraFacingMode(nextMode);
    setError(null);
  }

  const renderScanner = () => {
    if (hasCameraPermission === null) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Initializing camera...</p>
            </div>
        );
    }
    
    if (hasCameraPermission === false) {
        return (
            <Alert variant="destructive">
                <CameraOff className="h-4 w-4" />
                <AlertTitle>Scanner Unavailable</AlertTitle>
                <AlertDescription>
                    {error || "Camera access is required. Please check your browser settings."}
                </AlertDescription>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => window.location.reload()}>
                    Retry Access
                </Button>
            </Alert>
        );
    }
    
    return (
        <div className="relative">
            <QrcodeScanner
                key={cameraFacingMode}
                onScanSuccess={onScanSuccess}
                onScanFailure={onScanFailure}
                facingMode={cameraFacingMode === 'any' ? undefined : cameraFacingMode}
            />
            <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleCamera} 
                className="absolute top-2 right-2 z-10 bg-background/90 backdrop-blur-sm hover:bg-background shadow-md border-primary/20"
            >
                <Camera className="mr-2 h-4 w-4" />
                Switch Lens
            </Button>
        </div>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto border-t-4 border-t-accent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-accent" />
            QR Code Check-In
        </CardTitle>
        <CardDescription>Scan student codes for attendance. Punctual before: <span className="font-bold text-foreground">{settings.expectedTime}</span>.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="w-full overflow-hidden rounded-xl border-2 border-muted bg-black/5 shadow-inner">
          {renderScanner()}
        </div>
        
        {lastResult && (
          <Alert variant="default" className={`animate-in fade-in slide-in-from-bottom-2 ${lastResult.status === 'late' ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800' : 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'}`}>
            {lastResult.status === 'late' ? <Clock className="h-4 w-4 text-orange-600" /> : <CheckCircle className="h-4 w-4 text-green-600" />}
            <AlertTitle className="font-bold">Last Scan: <span className="capitalize">{lastResult.status}</span></AlertTitle>
            <AlertDescription className="mt-2 text-sm grid grid-cols-2 gap-x-4">
              <div>
                <p className="text-muted-foreground text-xs uppercase font-semibold">Student Name</p>
                <p className="font-medium">{lastResult.student.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase font-semibold">Scan Time</p>
                <p className="font-medium">{lastResult.timestamp.toLocaleTimeString()}</p>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {error && (
          <Alert variant="destructive" className="animate-in head-shake">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Scan Status</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
