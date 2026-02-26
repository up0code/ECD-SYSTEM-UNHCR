'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
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
    },
     {
        id: 'msg-3',
        senderId: 'teacher-2',
        senderName: 'John Smith',
        recipient: 'student-4', // Sent to Diana Prince
        content: 'Great work on the last math test, Diana! Keep it up.',
        timestamp: new Date().toISOString(),
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
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(MOCK_SETTINGS);

  useEffect(() => {
    const loadData = <T,>(key: string, mockData: T): T => {
      try {
        const storedData = localStorage.getItem(key);
        if (storedData) {
          const parsed = JSON.parse(storedData);
          // Merge with mockData to ensure all keys (like customHue) exist if schema evolved
          if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
            return { ...mockData, ...parsed };
          }
          return parsed;
        }
        localStorage.setItem(key, JSON.stringify(mockData));
        return mockData;
      } catch (error) {
        console.error(`Failed to access localStorage for key ${key}. Using mock data.`, error);
        return mockData;
      }
    };
    
    setStudents(loadData(STUDENTS_STORAGE_KEY, MOCK_STUDENTS));
    setTeachers(loadData(TEACHERS_STORAGE_KEY, MOCK_TEACHERS));
    setParents(loadData(PARENTS_STORAGE_KEY, MOCK_PARENTS));
    setMessages(loadData(MESSAGES_STORAGE_KEY, MOCK_MESSAGES));
    setHolidays(loadData(HOLIDAYS_STORAGE_KEY, MOCK_HOLIDAYS));
    setSettings(loadData(SETTINGS_STORAGE_KEY, MOCK_SETTINGS));

    const handleStorageChange = (e: StorageEvent) => {
        if (e.key === STUDENTS_STORAGE_KEY && e.newValue) setStudents(JSON.parse(e.newValue));
        if (e.key === TEACHERS_STORAGE_KEY && e.newValue) setTeachers(JSON.parse(e.newValue));
        if (e.key === PARENTS_STORAGE_KEY && e.newValue) setParents(JSON.parse(e.newValue));
        if (e.key === MESSAGES_STORAGE_KEY && e.newValue) setMessages(JSON.parse(e.newValue));
        if (e.key === HOLIDAYS_STORAGE_KEY && e.newValue) setHolidays(JSON.parse(e.newValue));
        if (e.key === SETTINGS_STORAGE_KEY && e.newValue) {
            const parsed = JSON.parse(e.newValue);
            setSettings({ ...MOCK_SETTINGS, ...parsed });
        }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  const addStudent = (studentData: Omit<Student, 'id' | 'studentId' | 'status'>) => {
    setStudents(prev => {
        const newStudent: Student = {
          ...studentData,
          id: `student-${Date.now()}`,
          studentId: `S${Math.floor(1000 + Math.random() * 9000)}`,
          status: 'approved',
        };
        const updated = [...prev, newStudent];
        localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(updated));
        return updated;
    });
  };
  
  const registerStudent = (studentData: RegisteringUser) => {
    setStudents(prevStudents => {
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
      const updatedStudents = [...prevStudents, newStudent];
      localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(updatedStudents));
      return updatedStudents;
    });
  };

  const registerParent = (parentData: RegisteringUser) => {
    setParents(prevParents => {
      const newParent: Parent = {
          ...parentData,
          id: `parent-${Date.now()}`,
          phone: '',
      };
      const updatedParents = [...prevParents, newParent];
      localStorage.setItem(PARENTS_STORAGE_KEY, JSON.stringify(updatedParents));
      return updatedParents;
    });
  };

  const approveStudent = (email: string, code: string): boolean => {
    const trimmedCode = code.trim();
    const trimmedEmail = email.trim().toLowerCase();
    
    let success = false;
    setStudents(prev => {
      const studentIndex = prev.findIndex(s => 
          s.email.trim().toLowerCase() === trimmedEmail && 
          s.status === 'pending' && 
          s.approvalCode === trimmedCode
      );

      if (studentIndex > -1) {
          success = true;
          const updated = [...prev];
          const studentToApprove = { ...updated[studentIndex] };
          delete studentToApprove.approvalCode;
          studentToApprove.status = 'approved';
          updated[studentIndex] = studentToApprove;
          localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(updated));
          return updated;
      }
      return prev;
    });
    return success;
  };

  const adminApproveStudent = (studentId: string) => {
    setStudents(prev => {
      const studentIndex = prev.findIndex(s => s.id === studentId && s.status === 'pending');

      if (studentIndex > -1) {
        const updated = [...prev];
        const studentToApprove = { ...updated[studentIndex] };
        delete studentToApprove.approvalCode;
        studentToApprove.status = 'approved';
        updated[studentIndex] = studentToApprove;
        localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      }
      return prev;
    });
  };

  const addTeacher = (teacherData: Omit<Teacher, 'id' | 'teacherId'>) => {
    setTeachers(prev => {
        const newTeacher: Teacher = {
          ...teacherData,
          id: `teacher-${Date.now()}`,
          teacherId: `T${Math.floor(100 + Math.random() * 900)}`,
        };
        const updated = [...prev, newTeacher];
        localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(updated));
        return updated;
    });
  };
  
  const addParent = (parentData: Omit<Parent, 'id'>) => {
    setParents(prev => {
        const newParent: Parent = {
          ...parentData,
          id: `parent-${Date.now()}`,
          phone: parentData.phone || '',
        };
        const updated = [...prev, newParent];
        localStorage.setItem(PARENTS_STORAGE_KEY, JSON.stringify(updated));
        return updated;
    });
  };

  const updateStudentAttendance = (studentId: string, date: string, status: AttendanceStatus) => {
    setStudents(prev => {
        const updated = prev.map(s => {
            if (s.id === studentId) {
                return {
                    ...s,
                    attendance: {
                        ...s.attendance,
                        [date]: status,
                    }
                }
            }
            return s;
        });
        localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(updated));
        return updated;
    });
  };

  const updateUser = (userToUpdate: Student | Teacher | Parent) => {
    if ('studentId' in userToUpdate) { // It's a Student
      setStudents(prev => {
        const updated = prev.map(s => s.id === userToUpdate.id ? userToUpdate as Student : s);
        localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    } else if ('teacherId' in userToUpdate) { // It's a Teacher
      setTeachers(prev => {
        const updated = prev.map(t => t.id === userToUpdate.id ? userToUpdate as Teacher : t);
        localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    } else { // It's a Parent
       setParents(prev => {
        const updated = prev.map(p => p.id === userToUpdate.id ? userToUpdate as Parent : p);
        localStorage.setItem(PARENTS_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    }
  };
  
  const deleteUser = (userId: string) => {
    setStudents(prev => {
        const updated = prev.filter(s => s.id !== userId);
        if (updated.length < prev.length) {
             localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(updated));
        }
        return updated;
    });
    setTeachers(prev => {
        const updated = prev.filter(t => t.id !== userId);
         if (updated.length < prev.length) {
            localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(updated));
        }
        return updated;
    });
     setParents(prev => {
        const updated = prev.filter(p => p.id !== userId);
         if (updated.length < prev.length) {
            localStorage.setItem(PARENTS_STORAGE_KEY, JSON.stringify(updated));
        }
        return updated;
    });
  };

  const addMessage = (messageData: Omit<Message, 'id' | 'timestamp' | 'read'>) => {
    setMessages(prev => {
        const newMessage: Message = {
            ...messageData,
            id: `msg-${Date.now()}`,
            timestamp: new Date().toISOString(),
            read: false,
        };
        const updated = [...prev, newMessage];
        localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(updated));
        return updated;
    });
  };

  const deleteMessage = (messageId: string) => {
    setMessages(prev => {
        const updated = prev.filter(m => m.id !== messageId);
        localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(updated));
        return updated;
    });
  };

  const markMessagesAsReadForUser = (userId: string) => {
    setMessages(prev => {
        const student = students.find(s => s.id === userId);
        const studentClass = student ? `class-${student.class}` : null;
        let changed = false;

        const updated = prev.map(msg => {
            const isForUser = 
                msg.recipient === userId ||
                (student && msg.recipient === 'all-students') ||
                (studentClass && msg.recipient === studentClass);
            
            if(isForUser && !msg.read) {
                changed = true;
                return {...msg, read: true};
            }
            return msg;
        });

        if (changed) {
            localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(updated));
            return updated;
        }
        return prev;
    });
  }

  const setHolidaysState = (newHolidays: Holiday[]) => {
    setHolidays(newHolidays);
    localStorage.setItem(HOLIDAYS_STORAGE_KEY, JSON.stringify(newHolidays));
  }

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings(prev => {
        const updated = { ...prev, ...newSettings };
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
        return updated;
    });
  }

  const value = { students, teachers, parents, messages, holidays, settings, updateSettings, setHolidays: setHolidaysState, addMessage, deleteMessage, markMessagesAsReadForUser, addStudent, addTeacher, addParent, registerStudent, registerParent, approveStudent, adminApproveStudent, updateStudentAttendance, updateUser, deleteUser };

  return <UserManagementContext.Provider value={value}>{children}</UserManagementContext.Provider>;
}

export function useUserManagement() {
  const context = useContext(UserManagementContext);
  if (context === undefined) {
    throw new Error('useUserManagement must be used within a UserManagementProvider');
  }
  return context;
}
