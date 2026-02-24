'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { comprehensiveReportAnalysis, ComprehensiveReportAnalysisOutput } from '@/ai/flows/comprehensive-report-analysis-flow';
import { useUserManagement } from '@/contexts/user-management-context';

export default function ReportsTab() {
  const { toast } = useToast();
  const { students } = useUserManagement();
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ComprehensiveReportAnalysisOutput | null>(null);

  const handleGenerateReport = async () => {
    setLoading(true);
    setAnalysisResult(null);

    // Create a simple CSV-like string from live data
    let reportContent = "StudentID,Name,Class,Date,Status\n";
    students.forEach(student => {
      Object.entries(student.attendance).forEach(([date, status]) => {
        reportContent += `${student.studentId},${student.name},${student.class},${new Date(date).toISOString().split('T')[0]},${status}\n`;
      });
    });
    
    try {
      const result = await comprehensiveReportAnalysis({ reportContent });
      setAnalysisResult(result);
      toast({
        title: 'Analysis Complete',
        description: 'AI-powered report summary has been generated.',
      });
    } catch (error) {
      console.error("Failed to generate report:", error);
      toast({
        title: 'Analysis Failed',
        description: 'Could not generate the AI summary. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate AI Attendance Report</CardTitle>
          <CardDescription>
            Use AI to analyze the entire school's attendance data and generate a summary with key takeaways.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGenerateReport} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Generate School-Wide Analysis'
            )}
          </Button>
        </CardContent>
      </Card>

      {analysisResult && (
        <Card>
            <CardHeader>
                <CardTitle>AI Analysis Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h3 className="font-semibold text-lg mb-2">Summary</h3>
                    <p className="text-muted-foreground">{analysisResult.summary}</p>
                </div>
                <div>
                    <h3 className="font-semibold text-lg mb-2">Key Takeaways</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {analysisResult.keyTakeaways.map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                </div>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
