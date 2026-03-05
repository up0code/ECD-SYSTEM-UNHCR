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

const playPipSound = () => {
    if (typeof window === 'undefined') return;
    try {
        const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
        if (!AudioContextClass) return;
        const context = new AudioContextClass();
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, context.currentTime);
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
  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user' | undefined>('environment');

  useEffect(() => {
    const requestCameraPermission = async () => {
      try {
        // First attempt with the preferred facing mode
        const constraints: MediaStreamConstraints = { 
            video: cameraFacingMode ? { facingMode: cameraFacingMode } : true 
        };
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            stream.getTracks().forEach(track => track.stop());
            setHasCameraPermission(true);
            setError(null);
        } catch (initialErr: any) {
            // If specific facing mode fails, try any video device
            console.warn("Specific camera request failed, trying fallback:", initialErr.name);
            const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
            fallbackStream.getTracks().forEach(track => track.stop());
            setHasCameraPermission(true);
            setCameraFacingMode(undefined); // Reset to "any" camera
            setError(null);
        }
      } catch (err: any) {
        console.error("All camera access attempts failed:", err);
        setHasCameraPermission(false);
        if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
            setError("No camera found on this device.");
        } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            setError("Camera access was denied. Please check your browser permissions.");
        } else {
            setError(`Unable to access camera: ${err.message || 'Check hardware connection'}`);
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
      });
    } else {
      setError(`Student ID not found: ${decodedText}`);
      setLastResult(null);
    }
  }, [students, settings, updateStudentAttendance, toast]);

  const onScanFailure = useCallback(() => {
    // Routing scanning failures are normal and ignored
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
                <p className="text-muted-foreground">Connecting to camera...</p>
            </div>
        );
    }
    
    if (hasCameraPermission === false) {
        return (
            <Alert variant="destructive" className="max-w-md mx-auto">
                <CameraOff className="h-4 w-4" />
                <AlertTitle>Camera Required</AlertTitle>
                <AlertDescription>
                    {error || "We couldn't access your camera. Please ensure it's plugged in and permitted in your browser."}
                </AlertDescription>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => window.location.reload()}>
                    Refresh & Retry
                </Button>
            </Alert>
        );
    }
    
    return (
        <div className="relative group">
            <QrcodeScanner
                key={cameraFacingMode || 'any'}
                onScanSuccess={onScanSuccess}
                onScanFailure={onScanFailure}
                facingMode={cameraFacingMode}
            />
            <Button 
                variant="secondary" 
                size="sm" 
                onClick={toggleCamera} 
                className="absolute top-4 right-4 z-10 opacity-70 hover:opacity-100 transition-opacity"
            >
                <Camera className="mr-2 h-4 w-4" />
                Switch Lens
            </Button>
        </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="border-t-4 border-t-accent shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-accent" />
              QR Check-In Terminal
          </CardTitle>
          <CardDescription>
            Scan student QR codes for daily attendance. Expected time: <strong>{settings.expectedTime}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="overflow-hidden rounded-xl border bg-black shadow-inner min-h-[300px] flex items-center justify-center">
            {renderScanner()}
          </div>
          
          {lastResult && (
            <Alert className={`animate-in fade-in slide-in-from-top-2 ${lastResult.status === 'late' ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}>
              {lastResult.status === 'late' ? <Clock className="h-4 w-4 text-orange-600" /> : <CheckCircle className="h-4 w-4 text-green-600" />}
              <AlertTitle className="font-bold">Check-In Logged: {lastResult.student.name}</AlertTitle>
              <AlertDescription className="capitalize">
                Status: <strong>{lastResult.status}</strong> at {lastResult.timestamp.toLocaleTimeString()}
              </AlertDescription>
            </Alert>
          )}
          
          {error && !hasCameraPermission && (
            <Alert variant="destructive" className="animate-in head-shake">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Scan Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
