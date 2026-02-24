'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useUserManagement } from '@/contexts/user-management-context';
import { useAuth } from '@/contexts/auth-context';

export default function CommunicationTab() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { students, teachers, addMessage } = useUserManagement();
  const [recipient, setRecipient] = useState('all-students');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast({
        title: 'Cannot send empty message',
        variant: 'destructive',
      });
      return;
    }
    if (!user) {
        toast({ title: 'You must be logged in to send a message.', variant: 'destructive' });
        return;
    }

    addMessage({
        senderId: user.uid,
        senderName: user.displayName || 'System',
        recipient,
        content: message,
    });

    toast({
      title: 'Message Sent!',
      description: `Your message has been sent.`,
    });
    setMessage('');
  };
  
  const all_classes = [...new Set(students.map(s => s.class))].sort();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send a Message</CardTitle>
        <CardDescription>Communicate with students, teachers, or specific classes.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient</Label>
            <Select value={recipient} onValueChange={setRecipient}>
              <SelectTrigger id="recipient" className="w-full md:w-1/2">
                <SelectValue placeholder="Select a recipient..." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                    <SelectLabel>Groups</SelectLabel>
                    <SelectItem value="all-students">All Students</SelectItem>
                    <SelectItem value="all-teachers">All Teachers</SelectItem>
                </SelectGroup>
                <SelectGroup>
                    <SelectLabel>Classes</SelectLabel>
                    {all_classes.map(c => <SelectItem key={c} value={`class-${c}`}>Class: {c}</SelectItem>)}
                </SelectGroup>
                 <SelectGroup>
                    <SelectLabel>Students</SelectLabel>
                    {students.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectGroup>
                 <SelectGroup>
                    <SelectLabel>Teachers</SelectLabel>
                    {teachers.filter(t => t.email !== 'admin@test.com').map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Type your message here..."
              className="min-h-[150px]"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <Button type="submit">Send Message</Button>
        </form>
      </CardContent>
    </Card>
  );
}
