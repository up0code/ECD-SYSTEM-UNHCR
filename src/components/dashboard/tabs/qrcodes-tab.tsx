'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserManagement } from '@/contexts/user-management-context';
import QRCodeComponent from '@/components/qr-code';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function QrCodesTab() {
  const { toast } = useToast();
  const { students } = useUserManagement();

  const handlePrint = () => {
    // This is a simplified print functionality.
    // In a real app, you would generate a print-friendly CSS and layout.
    window.print();
  };

  const handleDownload = (studentName: string) => {
    toast({
      title: 'Feature not implemented',
      description: `Download for ${studentName} is for demonstration purposes only.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center">
            <div>
                <CardTitle>Student QR Codes</CardTitle>
                <CardDescription>
                QR codes for each student for check-in. Each code contains the student's unique ID.
                </CardDescription>
            </div>
            <Button onClick={handlePrint} className="mt-4 sm:mt-0">Print All</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {students.map((student) => (
            <Card key={student.id} className="flex flex-col items-center text-center p-4">
              <QRCodeComponent text={student.studentId} width={128} height={128} />
              <div className="mt-4">
                <p className="font-semibold">{student.name}</p>
                <p className="text-sm text-muted-foreground">{student.studentId}</p>
              </div>
               <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => handleDownload(student.name)}>
                Download
              </Button>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
