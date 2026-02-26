'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, CalendarPlus, Palette, Check, Wand2 } from 'lucide-react';
import { TimeSettings } from '@/components/admin/time-settings';
import { HolidaySettings } from '@/components/admin/holiday-settings';
import { useToast } from '@/hooks/use-toast';
import { useUserManagement } from '@/contexts/user-management-context';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

type SettingsView = 'menu' | 'timeSettings' | 'holidaySettings' | 'themeSettings';

export default function SettingsTab() {
  const [view, setView] = useState<SettingsView>('menu');
  const { toast } = useToast();
  const { settings, updateSettings } = useUserManagement();

  const handleApplyTheme = (color: 'purple' | 'blue' | 'green' | 'orange' | 'custom') => {
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
            <CardDescription>Customize the visual style and density of your dashboard.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
                <Palette className="h-5 w-5" /> 1. Select a Palette
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card 
                  className={cn(
                    "p-4 flex items-center justify-between cursor-pointer transition-all border-2",
                    settings.themeColor === 'purple' ? "border-accent bg-accent/5" : "hover:border-muted-foreground"
                  )}
                  onClick={() => handleApplyTheme('purple')}
                >
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[#D8CEE6] border"></div>
                        <div>
                            <p className="font-medium">Original Purple</p>
                        </div>
                    </div>
                    {settings.themeColor === 'purple' && <Check className="h-5 w-5 text-accent" />}
                </Card>
                <Card 
                  className={cn(
                    "p-4 flex items-center justify-between cursor-pointer transition-all border-2",
                    settings.themeColor === 'blue' ? "border-accent bg-accent/5" : "hover:border-blue-500"
                  )}
                  onClick={() => handleApplyTheme('blue')}
                >
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-400 border"></div>
                        <div>
                            <p className="font-medium">Classic Blue</p>
                        </div>
                    </div>
                    {settings.themeColor === 'blue' && <Check className="h-5 w-5 text-accent" />}
                </Card>
                <Card 
                  className={cn(
                    "p-4 flex items-center justify-between cursor-pointer transition-all border-2",
                    settings.themeColor === 'green' ? "border-accent bg-accent/5" : "hover:border-green-500"
                  )}
                  onClick={() => handleApplyTheme('green')}
                >
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-green-400 border"></div>
                        <div>
                            <p className="font-medium">Forest Green</p>
                        </div>
                    </div>
                    {settings.themeColor === 'green' && <Check className="h-5 w-5 text-accent" />}
                </Card>
                 <Card 
                  className={cn(
                    "p-4 flex items-center justify-between cursor-pointer transition-all border-2",
                    settings.themeColor === 'orange' ? "border-accent bg-accent/5" : "hover:border-orange-500"
                  )}
                  onClick={() => handleApplyTheme('orange')}
                >
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-orange-400 border"></div>
                        <div>
                            <p className="font-medium">Sunset Orange</p>
                        </div>
                    </div>
                    {settings.themeColor === 'orange' && <Check className="h-5 w-5 text-accent" />}
                </Card>
                 <Card 
                  className={cn(
                    "p-4 flex items-center justify-between cursor-pointer transition-all border-2",
                    settings.themeColor === 'custom' ? "border-accent bg-accent/5" : "hover:border-primary"
                  )}
                  onClick={() => handleApplyTheme('custom')}
                >
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full border bg-gradient-to-tr from-red-500 via-green-500 to-blue-500"></div>
                        <div>
                            <p className="font-medium">Custom Mixer</p>
                        </div>
                    </div>
                    {settings.themeColor === 'custom' && <Check className="h-5 w-5 text-accent" />}
                </Card>
            </div>
        </div>

        {settings.themeColor === 'custom' && (
             <div className="space-y-6 pt-4 border-t animate-in fade-in slide-in-from-top-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Wand2 className="h-5 w-5" /> 2. Mix Your Custom Color
                </h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <Label>Primary Color Hue</Label>
                        <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{settings.customHue}°</span>
                    </div>
                    <Slider 
                        defaultValue={[settings.customHue]} 
                        max={360} 
                        step={1} 
                        onValueChange={(val) => updateSettings({ customHue: val[0] })}
                        className="w-full"
                    />
                    <div className="h-2 w-full rounded-full bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 via-purple-500 to-red-500"></div>
                </div>
            </div>
        )}

        <div className="space-y-6 pt-4 border-t">
            <h3 className="font-semibold text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" /> {settings.themeColor === 'custom' ? '3' : '2'}. Component Rounding (Color Size)
            </h3>
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <Label>Corner Radius</Label>
                    <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{(settings.borderRadius * 16).toFixed(0)}px</span>
                </div>
                <Slider 
                    defaultValue={[settings.borderRadius]} 
                    max={2} 
                    step={0.1} 
                    onValueChange={(val) => updateSettings({ borderRadius: val[0] })}
                    className="w-full md:w-1/2"
                />
                <div className="flex gap-4">
                    <div className="p-4 border bg-card text-center text-xs" style={{ borderRadius: `${settings.borderRadius}rem` }}>Card Preview</div>
                    <Button size="sm" style={{ borderRadius: `${settings.borderRadius}rem` }}>Button Preview</Button>
                </div>
            </div>
        </div>

        <Button onClick={() => setView('menu')} variant="outline">Back to Settings</Button>
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
                <CardContent className="flex-grow"><CardDescription>Mix your own colors and change the rounding style of the application.</CardDescription></CardContent>
                <CardContent><Button className="w-full" variant="outline" size="sm"><Palette className="mr-2 h-4 w-4" /> Change Style</Button></CardContent>
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
