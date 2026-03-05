'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { useUserManagement } from '@/contexts/user-management-context';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';


export default function MessagesTab() {
  const { user } = useAuth();
  const { messages, students, teachers, deleteMessage, markMessagesAsReadForUser, addMessage } = useUserManagement();
  const { toast } = useToast();
  const [recipient, setRecipient] = useState('all-students');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if(user) {
        // This marks visible messages as read. 
        // Logic inside markMessagesAsReadForUser handles checking if updates are actually needed to prevent loops.
        markMessagesAsReadForUser(user.uid);
    }
    // Only run when user ID or unread status might have changed, but avoid recursive triggers
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]); 
  
  const getRelevantMessages = () => {
    if (!user) return [];

    const currentStudent = students.find(s => s.id === user.uid);
    const studentClass = currentStudent ? `class-${currentStudent.class}` : null;

    return messages.filter(msg => {
        // Direct messages to user
        if (msg.recipient === user.uid) return true;
        // Group messages
        if (user.role === 'student' && msg.recipient === 'all-students') return true;
        if ((user.role === 'teacher' || user.role === 'admin') && msg.recipient === 'all-teachers') return true;
        // Class messages for students
        if (user.role === 'student' && studentClass && msg.recipient === studentClass) return true;
        // Messages sent BY the user
        if (msg.senderId === user.uid) return true;

        return false;
      })
      .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      // Deduplicate messages (in case user is sender and recipient of a group message)
      .filter((msg, index, self) => index === self.findIndex(t => t.id === msg.id));
  }

  const userMessages = getRelevantMessages();
  const all_classes = [...new Set(students.map(s => s.class))].sort();

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


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card>
            <CardHeader>
                <CardTitle>Send a Message</CardTitle>
                <CardDescription>Communicate with others.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="recipient">Recipient</Label>
                    <Select value={recipient} onValueChange={setRecipient}>
                    <SelectTrigger id="recipient" className="w-full">
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
      </div>
      <div className="lg:col-span-2">
         <Card>
            <CardHeader>
                <CardTitle>Inbox</CardTitle>
                <CardDescription>Message history and announcements.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {userMessages.length > 0 ? (
                        userMessages.map(msg => (
                            <div key={msg.id} className="group flex items-start gap-4">
                                <Avatar>
                                    <AvatarFallback>
                                        {msg.senderName.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex items-baseline justify-between">
                                        <p className="font-semibold">{msg.senderName}</p>
                                        <div className="flex items-center gap-2">
                                        <p className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                                        </p>
                                        { user?.uid === msg.senderId && (
                                            <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100">
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete this message.
                                                </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => deleteMessage(msg.id)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                            </AlertDialog>
                                        )}
                                        </div>
                                    </div>
                                    <div className="p-3 bg-muted/50 rounded-lg mt-1">
                                        <p className="text-sm text-foreground">{msg.content}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-muted-foreground">Your inbox is empty.</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
