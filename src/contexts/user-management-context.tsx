'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { Student, Teacher, Parent, Message, Holiday, SystemSettings } from '@/lib/types';
import { MOCK_STUDENTS, MOCK_TEACHERS, MOCK_PARENTS, MOCK_HOLIDAYS, MOCK_SETTINGS } from '@/lib/mock-data';

const STUDENTS_STORAGE_KEY = 'ecd-unhcr-students';
const TEACHERS_STORAGE_KEY = 'ecd-unhcr-teachers';
const PARENTS_STORAGE_KEY = 'ecd-unhcr-parents';
const MESSAGES_STORAGE_KEY = 'ecd-unhcr-messages';
const HOLIDAYS_STORAGE_KEY = 'ecd-unhcr-holidays';
const SETTINGS_STORAGE_KEY = 'ecd-unhcr-settings';

const MOCK_MESSAGES: Message[] = [
    {
        id: 'msg-1',
        senderId: 'teacher-1',
        senderName: 'Maria Garcia',
        recipient: 'all-students',
        content: 'Reminder: Parent-teacher conferences are next week. Please sign up for a time slot.',
        timestamp: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
        read: false,
    },
    {
        id: 'msg-2',
        senderId: 'admin-1',
        senderName: 'Admin User',
        recipient: 'all-students',
        content: 'The school will be closed this Friday for a staff development day.',
        timestamp: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
        read: false,
    }
];

const generateApprovalCode = () => Math.floor(100000 + Math.random() * 900000).toString();

type RegisteringUser = Pick<Student, 'name' | 'email' | 'password'>;
type AttendanceStatus = 'present' | 'late' | 'excused' | 'unexcused';

interface UserManagementContextType {
  students: Student[];
  teachers: Teacher[];
  parents: Parent[];
  messages: Message[];
  holidays: Holiday[];
  settings: SystemSettings;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  setHolidays: (holidays: Holiday[]) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp' | 'read'>) => void;
  deleteMessage: (messageId: string) => void;
  markMessagesAsReadForUser: (userId: string) => void;
  addStudent: (student: Omit<Student, 'id' | 'studentId' | 'status'>) => void;
  addTeacher: (teacher: Omit<Teacher, 'id' | 'teacherId'>) => void;
  addParent: (parent: Omit<Parent, 'id'>) => void;
  registerStudent: (student: RegisteringUser) => void;
  registerParent: (parent: RegisteringUser) => void;
  approveStudent: (email: string, code: string) => boolean;
  adminApproveStudent: (studentId: string) => void;
  updateStudentAttendance: (studentId: string, date: string, status: AttendanceStatus) => void;
  updateUser: (user: Student | Teacher | Parent) => void;
  deleteUser: (userId: string) => void;
}

const UserManagementContext = createContext<UserManagementContextType | undefined>(undefined);

export function UserManagementProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [teachers, setTeachers] = useState<Teacher[]>(MOCK_TEACHERS);
  const [parents, setParents] = useState<Parent[]>(MOCK_PARENTS);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [holidays, setHolidays] = useState<Holiday[]>(MOCK_HOLIDAYS);
  const [settings, setSettings] = useState<SystemSettings>(MOCK_SETTINGS);
  const [isInitialized, setIsInitialized] = useState(false);

  const loadInitialData = useCallback(() => {
    if (typeof window === 'undefined') return;

    const getData = <T,>(key: string, fallback: T): T => {
      try {
        const stored = localStorage.getItem(key);
        if (!stored) return fallback;
        const parsed = JSON.parse(stored);
        if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed) && typeof fallback === 'object') {
          return { ...fallback, ...parsed };
        }
        return parsed;
      } catch (e) {
        return fallback;
      }
    };

    setStudents(getData(STUDENTS_STORAGE_KEY, MOCK_STUDENTS));
    setTeachers(getData(TEACHERS_STORAGE_KEY, MOCK_TEACHERS));
    setParents(getData(PARENTS_STORAGE_KEY, MOCK_PARENTS));
    setMessages(getData(MESSAGES_STORAGE_KEY, MOCK_MESSAGES));
    setHolidays(getData(HOLIDAYS_STORAGE_KEY, MOCK_HOLIDAYS));
    setSettings(getData(SETTINGS_STORAGE_KEY, MOCK_SETTINGS));
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const addStudent = (studentData: Omit<Student, 'id' | 'studentId' | 'status'>) => {
    const newStudent: Student = {
      ...studentData,
      id: `student-${Date.now()}`,
      studentId: `S${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'approved',
    };
    const updated = [...students, newStudent];
    setStudents(updated);
    localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(updated));
  };
  
  const registerStudent = (studentData: RegisteringUser) => {
    const newStudent: Student = {
      ...studentData,
      id: `student-${Date.now()}`,
      studentId: `S${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'pending',
      approvalCode: generateApprovalCode(),
      class: 'Unassigned',
      teacherId: null,
      dob: '', phone: '', address: '', photo: null, grades: {}, attendance: {},
    };
    const updated = [...students, newStudent];
    setStudents(updated);
    localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(updated));
  };

  const registerParent = (parentData: RegisteringUser) => {
    const newParent: Parent = {
        ...parentData,
        id: `parent-${Date.now()}`,
        phone: '',
    };
    const updated = [...parents, newParent];
    setParents(updated);
    localStorage.setItem(PARENTS_STORAGE_KEY, JSON.stringify(updated));
  };

  const approveStudent = (email: string, code: string): boolean => {
    const studentIndex = students.findIndex(s => 
        s.email.toLowerCase() === email.toLowerCase() && 
        s.status === 'pending' && 
        s.approvalCode === code
    );

    if (studentIndex > -1) {
        const updated = [...students];
        const studentToApprove = { ...updated[studentIndex] };
        delete studentToApprove.approvalCode;
        studentToApprove.status = 'approved';
        updated[studentIndex] = studentToApprove;
        setStudents(updated);
        localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(updated));
        return true;
    }
    return false;
  };

  const adminApproveStudent = (studentId: string) => {
    const studentIndex = students.findIndex(s => s.id === studentId && s.status === 'pending');
    if (studentIndex > -1) {
      const updated = [...students];
      const studentToApprove = { ...updated[studentIndex] };
      delete studentToApprove.approvalCode;
      studentToApprove.status = 'approved';
      updated[studentIndex] = studentToApprove;
      setStudents(updated);
      localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(updated));
    }
  };

  const addTeacher = (teacherData: Omit<Teacher, 'id' | 'teacherId'>) => {
    const newTeacher: Teacher = {
      ...teacherData,
      id: `teacher-${Date.now()}`,
      teacherId: `T${Math.floor(100 + Math.random() * 900)}`,
    };
    const updated = [...teachers, newTeacher];
    setTeachers(updated);
    localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(updated));
  };
  
  const addParent = (parentData: Omit<Parent, 'id'>) => {
    const newParent: Parent = {
      ...parentData,
      id: `parent-${Date.now()}`,
      phone: parentData.phone || '',
    };
    const updated = [...parents, newParent];
    setParents(updated);
    localStorage.setItem(PARENTS_STORAGE_KEY, JSON.stringify(updated));
  };

  const updateStudentAttendance = (studentId: string, date: string, status: AttendanceStatus) => {
    const updated = students.map(s => {
        if (s.id === studentId) {
            return { ...s, attendance: { ...s.attendance, [date]: status } };
        }
        return s;
    });
    setStudents(updated);
    localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(updated));
  };

  const updateUser = (userToUpdate: Student | Teacher | Parent) => {
    if ('studentId' in userToUpdate) {
        const updated = students.map(s => s.id === userToUpdate.id ? userToUpdate as Student : s);
        setStudents(updated);
        localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(updated));
    } else if ('teacherId' in userToUpdate) {
        const updated = teachers.map(t => t.id === userToUpdate.id ? userToUpdate as Teacher : t);
        setTeachers(updated);
        localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(updated));
    } else {
        const updated = parents.map(p => p.id === userToUpdate.id ? userToUpdate as Parent : p);
        setParents(updated);
        localStorage.setItem(PARENTS_STORAGE_KEY, JSON.stringify(updated));
    }
  };
  
  const deleteUser = (userId: string) => {
    const updatedStudents = students.filter(s => s.id !== userId);
    const updatedTeachers = teachers.filter(t => t.id !== userId);
    const updatedParents = parents.filter(p => p.id !== userId);
    
    setStudents(updatedStudents);
    setTeachers(updatedTeachers);
    setParents(updatedParents);
    
    localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(updatedStudents));
    localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(updatedTeachers));
    localStorage.setItem(PARENTS_STORAGE_KEY, JSON.stringify(updatedParents));
  };

  const addMessage = (messageData: Omit<Message, 'id' | 'timestamp' | 'read'>) => {
    const newMessage: Message = {
        ...messageData,
        id: `msg-${Date.now()}`,
        timestamp: new Date().toISOString(),
        read: false,
    };
    const updated = [...messages, newMessage];
    setMessages(updated);
    localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(updated));
  };

  const deleteMessage = (messageId: string) => {
    const updated = messages.filter(m => m.id !== messageId);
    setMessages(updated);
    localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(updated));
  };

  const markMessagesAsReadForUser = (userId: string) => {
    const student = students.find(s => s.id === userId);
    const studentClass = student ? `class-${student.class}` : null;
    const updated = messages.map(msg => {
        const isForUser = 
            msg.recipient === userId ||
            (student && msg.recipient === 'all-students') ||
            (studentClass && msg.recipient === studentClass);
        
        if(isForUser && !msg.read) return {...msg, read: true};
        return msg;
    });
    setMessages(updated);
    localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(updated));
  }

  const setHolidaysState = (newHolidays: Holiday[]) => {
    setHolidays(newHolidays);
    localStorage.setItem(HOLIDAYS_STORAGE_KEY, JSON.stringify(newHolidays));
  }

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
  }

  const value = { 
    students, 
    teachers, 
    parents, 
    messages, 
    holidays, 
    settings, 
    updateSettings, 
    setHolidays: setHolidaysState, 
    addMessage, 
    deleteMessage, 
    markMessagesAsReadForUser, 
    addStudent, 
    addTeacher, 
    addParent, 
    registerStudent, 
    registerParent, 
    approveStudent, 
    adminApproveStudent, 
    updateStudentAttendance, 
    updateUser, 
    deleteUser 
  };

  return <UserManagementContext.Provider value={value}>{children}</UserManagementContext.Provider>;
}

export function useUserManagement() {
  const context = useContext(UserManagementContext);
  if (context === undefined) {
    throw new Error('useUserManagement must be used within a UserManagementProvider');
  }
  return context;
}
