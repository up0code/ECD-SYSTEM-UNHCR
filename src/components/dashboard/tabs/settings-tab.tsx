'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, CalendarPlus, Palette, Check } from 'lucide-react';
import { TimeSettings } from '@/components/admin/time-settings';
import { HolidaySettings } from '@/components/admin/holiday-settings';
import { useToast } from '@/hooks/use-toast';

type SettingsView = 'menu' | 'timeSettings' | 'holidaySettings' | 'themeSettings';

export default function SettingsTab() {
  const [view, setView] = useState<SettingsView>('menu');
  const { toast } = useToast();

  const handleApplyTheme = (color: string) => {
    toast({
      title: "Theme Applied",
      description: `The ${color} theme has been set as the primary style.`,
    });
  };

  const ThemeSettingsView = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setView('menu')}>
            <Palette className="h-4 w-4" />
          </Button>
          <div>
            <CardTitle>Theme & Appearance</CardTitle>
            <CardDescription>Customize the visual style of your dashboard.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
            <h3 className="font-semibold">Color Palettes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-2 border-accent p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[#D8CEE6] border"></div>
                        <div>
                            <p className="font-medium">Purple Professional (Active)</p>
                            <p className="text-xs text-muted-foreground">Main school theme</p>
                        </div>
                    </div>
                    <Check className="h-5 w-5 text-accent" />
                </Card>
                <Card className="p-4 flex items-center justify-between cursor-pointer hover:border-blue-500 transition-all" onClick={() => handleApplyTheme('Blue')}>
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-400 border"></div>
                        <div>
                            <p className="font-medium">Classic Blue</p>
                            <p className="text-xs text-muted-foreground">Standard corporate look</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 flex items-center justify-between cursor-pointer hover:border-green-500 transition-all" onClick={() => handleApplyTheme('Green')}>
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-green-400 border"></div>
                        <div>
                            <p className="font-medium">Forest Green</p>
                            <p className="text-xs text-muted-foreground">Calm and natural</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 flex items-center justify-between cursor-pointer hover:border-orange-500 transition-all" onClick={() => handleApplyTheme('Orange')}>
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-orange-400 border"></div>
                        <div>
                            <p className="font-medium">Sunset Orange</p>
                            <p className="text-xs text-muted-foreground">Energetic and vibrant</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
        <Button onClick={() => setView('menu')}>Back to Settings</Button>
      </CardContent>
    </Card>
  );

  const SettingsMenu = () => (
     <Card>
        <CardHeader>
            <CardTitle>Application Settings</CardTitle>
            <CardDescription>Configure system behavior, attendance rules, and appearance.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="flex flex-col hover:border-accent transition-colors cursor-pointer" onClick={() => setView('timeSettings')}>
                <CardHeader><CardTitle className="text-base">Time Settings</CardTitle></CardHeader>
                <CardContent className="flex-grow"><CardDescription>Set the expected arrival time and late threshold for attendance.</CardDescription></CardContent>
                <CardContent><Button className="w-full" variant="outline" size="sm"><Settings className="mr-2 h-4 w-4" /> Configure Time</Button></CardContent>
            </Card>
            <Card className="flex flex-col hover:border-accent transition-colors cursor-pointer" onClick={() => setView('holidaySettings')}>
                <CardHeader><CardTitle className="text-base">Manage Holidays</CardTitle></CardHeader>
                <CardContent className="flex-grow"><CardDescription>Add or remove school holidays from the calendar.</CardDescription></CardContent>
                <CardContent><Button className="w-full" variant="outline" size="sm"><CalendarPlus className="mr-2 h-4 w-4" /> Manage Holidays</Button></CardContent>
            </Card>
             <Card className="flex flex-col hover:border-accent transition-colors cursor-pointer" onClick={() => setView('themeSettings')}>
                <CardHeader><CardTitle className="text-base">Appearance & Colors</CardTitle></CardHeader>
                <CardContent className="flex-grow"><CardDescription>Change the theme colors and styling of the application.</CardDescription></CardContent>
                <CardContent><Button className="w-full" variant="outline" size="sm"><Palette className="mr-2 h-4 w-4" /> Change Colors</Button></CardContent>
            </Card>
        </CardContent>
    </Card>
  );

  const renderView = () => {
    switch (view) {
      case 'timeSettings': return <TimeSettings onBack={() => setView('menu')} />;
      case 'holidaySettings': return <HolidaySettings onBack={() => setView('menu')} />;
      case 'themeSettings': return <ThemeSettingsView />;
      default: return <SettingsMenu />;
    }
  };

  return (
    <div className="space-y-6">
      {renderView()}
    </div>
  );
}