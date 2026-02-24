'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Holiday } from '@/lib/types';
import { useUserManagement } from '@/contexts/user-management-context';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function HolidaySettings({ onBack }: { onBack: () => void }) {
  const { toast } = useToast();
  const { holidays, setHolidays } = useUserManagement();
  const [newHolidayName, setNewHolidayName] = useState('');
  const [newHolidayDate, setNewHolidayDate] = useState('');


  const handleAddHoliday = () => {
    if (!newHolidayName || !newHolidayDate) {
        toast({ title: 'Please provide a name and a date.', variant: 'destructive' });
        return;
    }
    const newHoliday: Holiday = { id: newHolidayDate, name: newHolidayName };
    setHolidays([...holidays, newHoliday].sort((a,b) => new Date(a.id).getTime() - new Date(b.id).getTime()));
    setNewHolidayName('');
    setNewHolidayDate('');
    toast({ title: 'Holiday Added' });
  };
  
  const handleDeleteHoliday = (id: string) => {
    setHolidays(holidays.filter(h => h.id !== id));
    toast({ title: 'Holiday Removed' });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft />
            </Button>
            <div>
                <CardTitle>Manage Holidays</CardTitle>
                <CardDescription>Add or remove school holidays from the calendar. These dates will be ignored for attendance purposes.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4">
            <h3 className="font-semibold">Add New Holiday</h3>
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 space-y-2">
                    <Label htmlFor="holidayName">Holiday Name</Label>
                    <Input id="holidayName" value={newHolidayName} onChange={e => setNewHolidayName(e.target.value)} />
                </div>
                <div className="flex-1 space-y-2">
                    <Label htmlFor="holidayDate">Date</Label>
                    <Input id="holidayDate" type="date" value={newHolidayDate} onChange={e => setNewHolidayDate(e.target.value)} />
                </div>
            </div>
            <Button onClick={handleAddHoliday}>Add Holiday</Button>
        </div>

        <div>
            <h3 className="font-semibold">Current Holidays</h3>
            <div className="border rounded-md mt-2">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {holidays.length > 0 ? holidays.map(holiday => (
                            <TableRow key={holiday.id}>
                                <TableCell>{new Date(holiday.id + 'T00:00:00').toLocaleDateString(undefined, { timeZone: 'UTC' })}</TableCell>
                                <TableCell>{holiday.name}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteHoliday(holiday.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )) : (
                             <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center">No holidays have been added.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
