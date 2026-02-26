export interface Student {
  id: string; // Firestore document ID
  name: string;
  email: string;
  password?: string;
  phone: string;
  class: string;
  studentId: string; // Human-readable ID
  dob: string;
  address: string;
  teacherId: string | null; // Firestore document ID of teacher
  parentId?: string | null; // Firestore document ID of parent
  photo: string | null;
  grades: Record<string, string[]>;
  attendance: Record<string, 'present' | 'late' | 'excused' | 'unexcused'>;
  excuseReason?: string;
  bio?: string;
  status: 'approved' | 'pending';
  approvalCode?: string;
}

export interface Teacher {
  id: string; // Firestore document ID
  name: string;
  email: string;
  password?: string;
  phone: string;
  teacherId: string; // Human-readable ID
  subjects: string;
  classes: string;
  bio: string;
  notes: Record<string, string>; // studentId: note
}

export interface Parent {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
}

export interface Meeting {
  id: string; // Firestore document ID
  studentId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  dateTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface Message {
  id: string; // Firestore document ID
  senderId: string;
  senderName: string;
  recipient: string; // e.g., 'all-students', 'all-teachers', a class ID, or a user ID
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Holiday {
    id: string; // date string YYYY-MM-DD
    name: string;
}

export interface SystemSettings {
    expectedTime: string; // HH:MM format
    lateThreshold: number; // in minutes
    maxUnexcusedAbsences: number;
    themeColor: 'purple' | 'blue' | 'green' | 'orange';
}


export type UserRole = 'admin' | 'teacher' | 'student' | 'parent';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
}
