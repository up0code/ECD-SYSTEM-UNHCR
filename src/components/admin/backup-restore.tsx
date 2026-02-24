'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function BackupRestore({ onBack }: { onBack: () => void }) {
  const { toast } = useToast();

  const handleBackup = () => {
    toast({
        title: "Backup Started (Simulated)",
        description: "A backup of the system data is being generated for download.",
    });
  };

  const handleRestore = () => {
    toast({
        title: "Restore Canceled",
        description: "This feature is disabled in the demo environment to prevent data loss.",
        variant: "destructive"
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft />
            </Button>
            <div>
                <CardTitle>Backup & Restore</CardTitle>
                <CardDescription>Manage system data backups.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Download Backup</CardTitle>
                <CardDescription>Create and download a full backup of all student, teacher, and attendance data.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={handleBackup}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Full Backup
                </Button>
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <CardTitle>Restore from Backup</CardTitle>
                <CardDescription>Upload a backup file to restore the system to a previous state. This action is disabled in the demo.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button variant="outline" onClick={handleRestore}>
                    <Upload className="mr-2 h-4 w-4" />
                    Restore from File
                </Button>
            </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
