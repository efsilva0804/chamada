
export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  JUSTIFIED = 'JUSTIFIED'
}

export enum StudentStatus {
  ATIVO = 'ATIVO',
  TRANSFERIDO = 'TRANSFERIDO',
  INDEFINIDO = 'INDEFINIDO'
}

export interface School {
  id: string;
  name: string;
  teacherName: string;
  email: string;
  password?: string;
  defaultSubject: string;
}

export interface SchoolInfo {
  teacherName: string;
  schoolName: string;
  email: string;
  password?: string;
  defaultSubject: string;
  isRegistered: boolean;
  isLoggedIn: boolean;
}

export interface SchoolClass {
  id: string;
  schoolId: string; // Vínculo com a escola
  name: string;
  description: string;
  subject: string;
  shift: string;
}

export interface Student {
  id: string;
  classId: string;
  name: string;
  rollNumber: string;
  status: StudentStatus;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  classId: string;
  studentId: string;
  status: AttendanceStatus;
}

export interface Database {
  schools: School[];
  currentSchoolId: string | null;
  classes: SchoolClass[];
  students: Student[];
  attendance: AttendanceRecord[];
  schoolInfo: SchoolInfo; // Mantido para compatibilidade de login global
}
