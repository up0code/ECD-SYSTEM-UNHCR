'use client';
import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import Header from '@/components/dashboard/header';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  Users,
  Calendar,
  CheckSquare,
  QrCode,
  BarChart2,
  FileText,
  MessageSquare,
  Settings,
  User,
  BookOpen,
  Shield,
  HeartHandshake,
  Users2,
} from 'lucide-react';

// Import all the tab components
import AdminTab from '@/components/dashboard/tabs/admin-tab';
import AnalyticsTab from '@/components/dashboard/tabs/analytics-tab';
import AttendanceTab from '@/components/dashboard/tabs/attendance-tab';
import CalendarTab from '@/components/dashboard/tabs/calendar-tab';
import CheckinTab from '@/components/dashboard/tabs/checkin-tab';
import ProfileTab from '@/components/dashboard/tabs/profile-tab';
import QrCodesTab from '@/components/dashboard/tabs/qrcodes-tab';
import ReportsTab from '@/components/dashboard/tabs/reports-tab';
import SettingsTab from '@/components/dashboard/tabs/settings-tab';
import MessagesTab from '@/components/dashboard/tabs/messages-tab';
import TeacherTab from '@/components/dashboard/tabs/teacher-tab';
import StudentsTab from '@/components/dashboard/tabs/students-tab';
import ParentTab from '@/components/dashboard/tabs/parent-tab';
import TeachersTab from '@/components/dashboard/tabs/teachers-tab';
import ParentsTab from '@/components/dashboard/tabs/parents-tab';
import { useUserManagement } from '@/contexts/user-management-context';
import { Badge } from '@/components/ui/badge';

type View =
  | 'attendance'
  | 'checkin'
  | 'qrcodes'
  | 'calendar'
  | 'analytics'
  | 'reports'
  | 'myclass'
  | 'admin'
  | 'profile'
  | 'settings'
  | 'messages'
  | 'students'
  | 'teachers'
  | 'parents'
  | 'parent';

export default function Dashboard() {
  const { user } = useAuth();
  const { messages, students } = useUserManagement();
  const [view, setView] = useState<View>('attendance');

  if (!user) return null;

  const getUnreadCount = () => {
    if (!user) return 0;

    const currentStudent = students.find(s => s.id === user.uid);
    const studentClass = currentStudent ? `class-${currentStudent.class}` : null;

    const userMessages = messages.filter(msg => {
      if (msg.read) return false;
      if (msg.senderId === user.uid) return false; // Don't count own messages as unread

      // Direct message to user
      if (msg.recipient === user.uid) return true;
      // Group messages
      if (user.role === 'student' && msg.recipient === 'all-students') return true;
      if ((user.role === 'teacher' || user.role === 'admin') && msg.recipient === 'all-teachers') return true;
      // Class messages
      if (user.role === 'student' && studentClass && msg.recipient === studentClass) return true;
      
      return false;
    });

    return userMessages.length;
  };
  const unreadCount = getUnreadCount();

  const renderView = () => {
    switch (view) {
      case 'attendance':
        return <AttendanceTab />;
      case 'checkin':
        return <CheckinTab />;
      case 'qrcodes':
        return <QrCodesTab />;
      case 'calendar':
        return <CalendarTab />;
      case 'analytics':
        return <AnalyticsTab />;
      case 'reports':
        return <ReportsTab />;
      case 'myclass':
        return <TeacherTab />;
      case 'admin':
        return <AdminTab />;
      case 'profile':
        return <ProfileTab />;
      case 'settings':
        return <SettingsTab />;
      case 'messages':
        return <MessagesTab />;
      case 'students':
        return <StudentsTab />;
      case 'teachers':
        return <TeachersTab />;
      case 'parents':
        return <ParentsTab />;
      case 'parent':
        return <ParentTab />;
      default:
        return <AttendanceTab />;
    }
  };

  const adminNav = (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton onClick={() => setView('attendance')} isActive={view === 'attendance'} tooltip="Attendance"><CheckSquare /><span>Attendance</span></SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton onClick={() => setView('students')} isActive={view === 'students'} tooltip="Students"><Users /><span>Students</span></SidebarMenuButton>
      </SidebarMenuItem>
       <SidebarMenuItem>
        <SidebarMenuButton onClick={() => setView('teachers')} isActive={view === 'teachers'} tooltip="Teachers"><Users2 /><span>Teachers</span></SidebarMenuButton>
      </SidebarMenuItem>
       <SidebarMenuItem>
        <SidebarMenuButton onClick={() => setView('parents')} isActive={view === 'parents'} tooltip="Parents"><HeartHandshake /><span>Parents</span></SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton onClick={() => setView('checkin')} isActive={view === 'checkin'} tooltip="Check-In"><QrCode /><span>Check-In</span></SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton onClick={() => setView('qrcodes')} isActive={view === 'qrcodes'} tooltip="QR Codes"><QrCode /><span>QR Codes</span></SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton onClick={() => setView('calendar')} isActive={view === 'calendar'} tooltip="Calendar"><Calendar /><span>Calendar</span></SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton onClick={() => setView('analytics')} isActive={view === 'analytics'} tooltip="Analytics"><BarChart2 /><span>Analytics</span></SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton onClick={() => setView('reports')} isActive={view === 'reports'} tooltip="Reports"><FileText /><span>Reports</span></SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton onClick={() => setView('messages')} isActive={view === 'messages'} tooltip="Messages">
            <MessageSquare /><span>Messages</span>
            {unreadCount > 0 && <Badge variant="destructive" className="ml-auto">{unreadCount}</Badge>}
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton onClick={() => setView('admin')} isActive={view === 'admin'} tooltip="Admin"><Shield /><span>Admin</span></SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton onClick={() => setView('settings')} isActive={view === 'settings'} tooltip="Settings"><Settings /><span>Settings</span></SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton onClick={() => setView('profile')} isActive={view === 'profile'} tooltip="Profile"><User /><span>Profile</span></SidebarMenuButton>
      </SidebarMenuItem>
    </>
  );
  const teacherNav = (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton onClick={() => setView('attendance')} isActive={view === 'attendance'} tooltip="Attendance"><CheckSquare /><span>Attendance</span></SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton onClick={() => setView('checkin')} isActive={view === 'checkin'} tooltip="Check-In"><QrCode /><span>Check-In</span></SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton onClick={() => setView('calendar')} isActive={view === 'calendar'} tooltip="Calendar"><Calendar /><span>Calendar</span></SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton onClick={() => setView('myclass')} isActive={view === 'myclass'} tooltip="My Class"><BookOpen /><span>My Class</span></SidebarMenuButton>
      </SidebarMenuItem>
       <SidebarMenuItem>
        <SidebarMenuButton onClick={() => setView('messages')} isActive={view === 'messages'} tooltip="Messages">
            <MessageSquare /><span>Messages</span>
            {unreadCount > 0 && <Badge variant="destructive" className="ml-auto">{unreadCount}</Badge>}
        </SidebarMenuButton>
      </SidebarMenuItem>
       <SidebarMenuItem>
        <SidebarMenuButton onClick={() => setView('profile')} isActive={view === 'profile'} tooltip="Profile"><User /><span>Profile</span></SidebarMenuButton>
      </SidebarMenuItem>
    </>
  );
  const studentNav = (
    <>
       <SidebarMenuItem>
        <SidebarMenuButton onClick={() => setView('attendance')} isActive={view === 'attendance'} tooltip="Attendance"><CheckSquare /><span>Attendance</span></SidebarMenuButton>
      </SidebarMenuItem>
       <SidebarMenuItem>
        <SidebarMenuButton onClick={() => setView('calendar')} isActive={view === 'calendar'} tooltip="Calendar"><Calendar /><span>Calendar</span></SidebarMenuButton>
      </SidebarMenuItem>
       <SidebarMenuItem>
        <SidebarMenuButton onClick={() => setView('messages')} isActive={view === 'messages'} tooltip="Messages">
            <MessageSquare /><span>Messages</span>
            {unreadCount > 0 && <Badge variant="destructive" className="ml-auto">{unreadCount}</Badge>}
        </SidebarMenuButton>
      </SidebarMenuItem>
       <SidebarMenuItem>
        <SidebarMenuButton onClick={() => setView('profile')} isActive={view === 'profile'} tooltip="Profile"><User /><span>Profile</span></SidebarMenuButton>
      </SidebarMenuItem>
    </>
  );

  const parentNav = (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton onClick={() => setView('parent')} isActive={view === 'parent'} tooltip="My Child"><HeartHandshake /><span>My Child</span></SidebarMenuButton>
      </SidebarMenuItem>
       <SidebarMenuItem>
        <SidebarMenuButton onClick={() => setView('calendar')} isActive={view === 'calendar'} tooltip="School Calendar"><Calendar /><span>Calendar</span></SidebarMenuButton>
      </SidebarMenuItem>
       <SidebarMenuItem>
        <SidebarMenuButton onClick={() => setView('profile')} isActive={view === 'profile'} tooltip="Profile"><User /><span>Profile</span></SidebarMenuButton>
      </SidebarMenuItem>
    </>
  );

  return (
     <SidebarProvider expandOnHover={true}>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <a href="/" className="flex items-center space-x-2 px-2">
            <span className="inline-block font-bold text-primary">G P T</span>
          </a>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            { user.role === 'admin' && adminNav }
            { user.role === 'teacher' && teacherNav }
            { user.role === 'student' && studentNav }
            { user.role === 'parent' && parentNav }
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="container py-6">
          {renderView()}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
