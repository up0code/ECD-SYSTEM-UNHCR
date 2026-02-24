'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, CalendarPlus } from 'lucide-react';
import { TimeSettings } from '@/components/admin/time-settings';
import { HolidaySettings } from '@/components/admin/holiday-settings';

type SettingsView = 'menu' | 'timeSettings' | 'holidaySettings';

export default function SettingsTab() {
  const [view, setView] = useState<SettingsView>('menu');

  const SettingsMenu = () => (
     <Card>
        <CardHeader>
            <CardTitle>Application Settings</CardTitle>
            <CardDescription>This section is being connected to Firebase. Some features may be temporarily unavailable.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="flex flex-col">
                <CardHeader><CardTitle>Time Settings</CardTitle></CardHeader>
                <CardContent className="flex-grow"><CardDescription>Set the expected arrival time and late threshold for attendance.</CardDescription></CardContent>
                <CardContent><Button className="w-full" variant="outline" onClick={() => setView('timeSettings')}><Settings className="mr-2 h-4 w-4" /> Configure Time</Button></CardContent>
            </Card>
            <Card className="flex flex-col">
                <CardHeader><CardTitle>Manage Holidays</CardTitle></CardHeader>
                <CardContent className="flex-grow"><CardDescription>Add or remove school holidays from the calendar.</CardDescription></CardContent>
                <CardContent><Button className="w-full" variant="outline" onClick={() => setView('holidaySettings')}><CalendarPlus className="mr-2 h-4 w-4" /> Manage Holidays</Button></CardContent>
            </Card>
        </CardContent>
    </Card>
  );

  const renderView = () => {
    switch (view) {
      case 'timeSettings': return <TimeSettings onBack={() => setView('menu')} />;
      case 'holidaySettings': return <HolidaySettings onBack={() => setView('menu')} />;
      default: return <SettingsMenu />;
    }
  };

  return (
    <div className="space-y-6">
      {renderView()}
    </div>
  );
}
