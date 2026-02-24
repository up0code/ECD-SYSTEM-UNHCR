'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useUserManagement } from '@/contexts/user-management-context';

export function TimeSettings({ onBack }: { onBack: () => void }) {
  const { toast } = useToast();
  const { settings, updateSettings } = useUserManagement();

  const handleSave = () => {
    // The state is already updated on change, this button just provides user feedback
    toast({
        title: "Settings Saved",
        description: `Arrival time set to ${settings.expectedTime}, with a ${settings.lateThreshold} minute late threshold.`,
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft />
            </Button>
            <div>
                <CardTitle>Time Settings</CardTitle>
                <CardDescription>Configure attendance timing rules for the school.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="expectedTime">Expected Arrival Time</Label>
            <Input 
                id="expectedTime" 
                type="time" 
                value={settings.expectedTime} 
                onChange={e => updateSettings({ expectedTime: e.target.value })} 
                className="w-full md:w-1/2"
            />
        </div>
         <div className="space-y-2">
            <Label htmlFor="lateThreshold">Late Threshold (minutes)</Label>
            <Input 
                id="lateThreshold" 
                type="number" 
                value={settings.lateThreshold} 
                onChange={e => updateSettings({ lateThreshold: Number(e.target.value) })}
                className="w-full md:w-1/2" 
            />
            <p className="text-sm text-muted-foreground">Students checking in after this threshold will be marked as 'late'.</p>
        </div>
         <div className="space-y-2">
            <Label htmlFor="maxAbsences">Max Unexcused Absences</Label>
            <Input 
                id="maxAbsences" 
                type="number" 
                value={settings.maxUnexcusedAbsences} 
                onChange={e => updateSettings({ maxUnexcusedAbsences: Number(e.target.value) })}
                className="w-full md:w-1/2" 
            />
            <p className="text-sm text-muted-foreground">The maximum number of unexcused absences before a student is flagged.</p>
        </div>
        <Button onClick={handleSave}>Save Settings</Button>
      </CardContent>
    </Card>
  );
}
