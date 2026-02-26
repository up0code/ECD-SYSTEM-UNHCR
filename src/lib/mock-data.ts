import type { Student, Teacher, Holiday, Message, Parent, SystemSettings } from './types';

// Let's create some dates for attendance
const d = new Date();
const today = new Date(d.getFullYear(), d.getMonth(), d.getDate());
const yesterday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1);
const twoDaysAgo = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 2);
const threeDaysAgo = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 3);
const fourDaysAgo = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 4);


export const MOCK_TEACHERS: Teacher[] = [
  {
    id: 'admin-1',
    teacherId: 'A001',
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'magdisalih',
    phone: '555-0100',
    subjects: 'System Administration',
    classes: 'All',
    bio: 'System Administrator.',
    notes: {},
  },
  {
    id: 'teacher-1',
    teacherId: 'T001',
    name: 'Maria Garcia',
    email: 'teacher@test.com',
    password: 'password',
    phone: '555-0101',
    subjects: 'English, History',
    classes: 'Class A, Class B',
    bio: 'Experienced teacher with a passion for literature.',
    notes: {},
  },
  {
    id: 'teacher-2',
    teacherId: 'T002',
    name: 'John Smith',
    email: 'j.smith@test.com',
    password: 'password',
    phone: '555-0102',
    subjects: 'Math, Science',
    classes: 'Class C',
    bio: 'Loves making math fun and accessible for all students.',
    notes: {},
  },
];

export const MOCK_PARENTS: Parent[] = [
    {
        id: 'parent-1',
        name: 'Mr. Johnson',
        email: 'parent@test.com',
        password: 'password',
        phone: '555-0201',
    }
];

export const MOCK_STUDENTS: Student[] = [
  {
    id: 'student-1',
    studentId: 'S001',
    name: 'Alice Johnson',
    email: 'alice@test.com',
    password: 'password',
    class: 'Class A',
    teacherId: 'teacher-1',
    parentId: 'parent-1',
    dob: '2015-05-20',
    phone: '555-0111',
    address: '123 Maple St',
    photo: null,
    grades: { 'English': ['A', 'B'], 'History': ['A'] },
    attendance: {
      [fourDaysAgo.toDateString()]: 'present',
      [threeDaysAgo.toDateString()]: 'present',
      [twoDaysAgo.toDateString()]: 'present',
      [yesterday.toDateString()]: 'present',
      [today.toDateString()]: 'present',
    },
    bio: 'Alice is a bright and curious student who loves to read.',
    status: 'approved',
  },
  {
    id: 'student-2',
    studentId: 'S002',
    name: 'Bob Williams',
    email: 'bob@test.com',
    password: 'password',
    class: 'Class A',
    teacherId: 'teacher-1',
    dob: '2015-08-12',
    phone: '555-0112',
    address: '456 Oak Ave',
    photo: null,
    grades: { 'English': ['B', 'C'], 'History': ['B'] },
    attendance: {
      [fourDaysAgo.toDateString()]: 'present',
      [threeDaysAgo.toDateString()]: 'late',
      [twoDaysAgo.toDateString()]: 'present',
      [yesterday.toDateString()]: 'late',
      [today.toDateString()]: 'present',
    },
    bio: 'Bob is a creative student with a talent for drawing.',
    status: 'approved',
  },
    {
    id: 'student-3',
    studentId: 'S003',
    name: 'Charlie Brown',
    email: 'charlie@test.com',
    password: 'password',
    class: 'Class B',
    teacherId: 'teacher-1',
    dob: '2016-01-30',
    phone: '555-0113',
    address: '789 Pine Ln',
    photo: null,
    grades: { 'English': ['C'], 'History': ['B', 'A'] },
    attendance: {
      [fourDaysAgo.toDateString()]: 'present',
      [threeDaysAgo.toDateString()]: 'present',
      [twoDaysAgo.toDateString()]: 'unexcused',
      [yesterday.toDateString()]: 'present',
      [today.toDateString()]: 'present',
    },
    excuseReason: 'Was feeling unwell.',
    bio: 'Charlie is a kind and thoughtful student, always willing to help others.',
    status: 'approved',
  },
  {
    id: 'student-4',
    studentId: 'S004',
    name: 'Diana Prince',
    email: 'student@test.com',
    password: 'password',
    class: 'Class C',
    teacherId: 'teacher-2',
    dob: '2015-11-11',
    phone: '555-0114',
    address: '101 Amazon Way',
    photo: null,
    grades: { 'Math': ['A', 'A'], 'Science': ['A'] },
    attendance: {
      [fourDaysAgo.toDateString()]: 'present',
      [threeDaysAgo.toDateString()]: 'excused',
      [twoDaysAgo.toDateString()]: 'present',
      [yesterday.toDateString()]: 'present',
      [today.toDateString()]: 'late',
    },
    bio: 'Diana is a natural leader and excels in all her subjects.',
    status: 'approved',
  },
  {
    id: 'student-5',
    studentId: 'S005',
    name: 'Eve Adams',
    class: 'Class C',
    teacherId: 'teacher-2',
    dob: '2016-02-14',
    phone: '555-0115',
    address: '21B Baker St',
    photo: null,
    grades: { 'Math': ['B'], 'Science': ['C', 'B'] },
    attendance: {
      [fourDaysAgo.toDateString()]: 'unexcused',
      [threeDaysAgo.toDateString()]: 'unexcused',
      [twoDaysAgo.toDateString()]: 'present',
      [yesterday.toDateString()]: 'late',
      [today.toDateString()]: 'unexcused',
    },
    email: 'eve@test.com',
    password: 'password',
    bio: 'Eve has shown great improvement in her science scores this semester.',
    status: 'approved',
  },
];

export const MOCK_HOLIDAYS: Holiday[] = [
    { id: '2024-12-25', name: 'Christmas Day' },
    { id: '2025-01-01', name: 'New Year\'s Day' },
];

export const MOCK_SETTINGS: SystemSettings = {
    expectedTime: '08:30',
    lateThreshold: 15,
    maxUnexcusedAbsences: 3,
    themeColor: 'purple'
};
