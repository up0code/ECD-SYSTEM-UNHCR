'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, CalendarPlus, Palette, Check } from 'lucide-react';
import { TimeSettings } from '@/components/admin/time-settings';
import { HolidaySettings } from '@/components/admin/holiday-settings';
import { useToast } from '@/hooks/use-toast';
import { useUserManagement } from '@/contexts/user-management-context';
import { cn } from '@/lib/utils';

type SettingsView = 'menu' | 'timeSettings' | 'holidaySettings' | 'themeSettings';

export default function SettingsTab() {
  const [view, setView] = useState<SettingsView>('menu');
  const { toast } = useToast();
  const { settings, updateSettings } = useUserManagement();

  const handleApplyTheme = (color: 'purple' | 'blue' | 'green' | 'orange') => {
    updateSettings({ themeColor: color });
    toast({
      title: "Theme Applied",
      description: `The ${color.charAt(0).toUpperCase() + color.slice(1)} theme has been set as the primary style.`,
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
                <Card 
                  className={cn(
                    "p-4 flex items-center justify-between cursor-pointer transition-all border-2",
                    settings.themeColor === 'purple' ? "border-accent" : "hover:border-muted-foreground"
                  )}
                  onClick={() => handleApplyTheme('purple')}
                >
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[#D8CEE6] border"></div>
                        <div>
                            <p className="font-medium">Purple Professional</p>
                            <p className="text-xs text-muted-foreground">Original theme</p>
                        </div>
                    </div>
                    {settings.themeColor === 'purple' && <Check className="h-5 w-5 text-accent" />}
                </Card>
                <Card 
                  className={cn(
                    "p-4 flex items-center justify-between cursor-pointer transition-all border-2",
                    settings.themeColor === 'blue' ? "border-accent" : "hover:border-blue-500"
                  )}
                  onClick={() => handleApplyTheme('blue')}
                >
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-400 border"></div>
                        <div>
                            <p className="font-medium">Classic Blue</p>
                            <p className="text-xs text-muted-foreground">Standard corporate look</p>
                        </div>
                    </div>
                    {settings.themeColor === 'blue' && <Check className="h-5 w-5 text-accent" />}
                </Card>
                <Card 
                  className={cn(
                    "p-4 flex items-center justify-between cursor-pointer transition-all border-2",
                    settings.themeColor === 'green' ? "border-accent" : "hover:border-green-500"
                  )}
                  onClick={() => handleApplyTheme('green')}
                >
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-green-400 border"></div>
                        <div>
                            <p className="font-medium">Forest Green</p>
                            <p className="text-xs text-muted-foreground">Calm and natural</p>
                        </div>
                    </div>
                    {settings.themeColor === 'green' && <Check className="h-5 w-5 text-accent" />}
                </Card>
                <Card 
                  className={cn(
                    "p-4 flex items-center justify-between cursor-pointer transition-all border-2",
                    settings.themeColor === 'orange' ? "border-accent" : "hover:border-orange-500"
                  )}
                  onClick={() => handleApplyTheme('orange')}
                >
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-orange-400 border"></div>
                        <div>
                            <p className="font-medium">Sunset Orange</p>
                            <p className="text-xs text-muted-foreground">Energetic and vibrant</p>
                        </div>
                    </div>
                    {settings.themeColor === 'orange' && <Check className="h-5 w-5 text-accent" />}
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
