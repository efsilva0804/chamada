
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Database, School, SchoolClass, Student, AttendanceRecord, AttendanceStatus, StudentStatus, SchoolInfo } from '../types';

interface AttendanceContextType {
  db: Database;
  currentSchool: School | null;
  addSchool: (info: Omit<School, 'id'>) => void;
  switchSchool: (id: string) => void;
  deleteSchool: (id: string) => void;
  addClass: (name: string, description: string, subject: string, shift: string) => void;
  editClass: (id: string, name: string, description: string, subject: string, shift: string) => void;
  bulkAddClasses: (classes: { name: string; description: string; subject?: string; shift?: string }[]) => void;
  deleteClass: (id: string) => void;
  addStudent: (classId: string, name: string, rollNumber: string, status: StudentStatus) => void;
  editStudent: (id: string, name: string, rollNumber: string, status: StudentStatus, classId: string) => void;
  bulkAddStudents: (classId: string, students: { name: string; rollNumber: string }[]) => void;
  deleteStudent: (id: string) => void;
  saveAttendance: (classId: string, date: string, records: { studentId: string; status: AttendanceStatus }[]) => void;
  updateSchoolInfo: (info: SchoolInfo) => void;
  signup: (info: Omit<SchoolInfo, 'isRegistered' | 'isLoggedIn' | 'email' | 'schoolName'>) => void;
  login: (name: string, pass: string) => boolean;
  logout: () => void;
  exportData: () => void;
  importData: (json: string) => void;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

const STORAGE_KEY = 'chamada_simples_db_v2';

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [db, setDb] = useState<Database>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const defaultData: Database = { 
      schools: [],
      currentSchoolId: null,
      classes: [], 
      students: [], 
      attendance: [], 
      schoolInfo: { 
        teacherName: '', 
        schoolName: '', 
        email: '', 
        password: '',
        defaultSubject: '',
        isRegistered: false,
        isLoggedIn: false
      } 
    };
    
    if (!saved) return defaultData;
    try {
      const parsed = JSON.parse(saved);
      if (!parsed.schools) parsed.schools = [];
      if (parsed.currentSchoolId === undefined) parsed.currentSchoolId = null;
      return parsed;
    } catch (e) {
      return defaultData;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }, [db]);

  const currentSchool = db.schools.find(s => s.id === db.currentSchoolId) || null;

  const applyAutoNumbering = (students: Student[], classId: string): Student[] => {
    const otherStudents = students.filter(s => s.classId !== classId);
    const classStudents = students.filter(s => s.classId === classId);
    
    const sorted = [...classStudents].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    const numbered = sorted.map((s, index) => ({
      ...s,
      rollNumber: (index + 1).toString().padStart(2, '0')
    }));

    return [...otherStudents, ...numbered];
  };

  const signup = (info: Omit<SchoolInfo, 'isRegistered' | 'isLoggedIn' | 'email' | 'schoolName'>) => {
    const schoolInfoData: SchoolInfo = {
      ...info,
      email: '',
      schoolName: '',
      isRegistered: true,
      isLoggedIn: true
    };

    setDb(prev => ({
      ...prev,
      schools: [],
      currentSchoolId: null,
      schoolInfo: schoolInfoData
    }));
  };

  const addSchool = (info: Omit<School, 'id'>) => {
    const newSchool: School = { ...info, id: crypto.randomUUID() };
    setDb(prev => ({
      ...prev,
      schools: [...prev.schools, newSchool],
      currentSchoolId: newSchool.id
    }));
  };

  const switchSchool = (id: string) => {
    setDb(prev => ({ ...prev, currentSchoolId: id }));
  };

  const deleteSchool = (id: string) => {
    setDb(prev => {
      const newSchools = prev.schools.filter(s => s.id !== id);
      const newCurrentId = prev.currentSchoolId === id ? (newSchools[0]?.id || null) : prev.currentSchoolId;
      return {
        ...prev,
        schools: newSchools,
        currentSchoolId: newCurrentId,
        classes: prev.classes.filter(c => c.schoolId !== id),
        students: prev.students.filter(s => !prev.classes.find(c => c.id === s.classId && c.schoolId === id))
      };
    });
  };

  const login = (name: string, pass: string): boolean => {
    if (
      db.schoolInfo.isRegistered && 
      db.schoolInfo.teacherName.toLowerCase().trim() === name.toLowerCase().trim() && 
      db.schoolInfo.password === pass
    ) {
      setDb(prev => ({
        ...prev,
        schoolInfo: { ...prev.schoolInfo, isLoggedIn: true }
      }));
      return true;
    }
    return false;
  };

  const logout = () => {
    setDb(prev => ({
      ...prev,
      schoolInfo: { ...prev.schoolInfo, isLoggedIn: false }
    }));
    window.location.hash = '#/';
  };

  const addClass = (name: string, description: string, subject: string, shift: string) => {
    if (!db.currentSchoolId) return;
    const newClass: SchoolClass = { 
      id: crypto.randomUUID(), 
      schoolId: db.currentSchoolId, 
      name, 
      description, 
      subject, 
      shift 
    };
    setDb(prev => ({ ...prev, classes: [...prev.classes, newClass] }));
  };

  const editClass = (id: string, name: string, description: string, subject: string, shift: string) => {
    setDb(prev => ({
      ...prev,
      classes: prev.classes.map(c => c.id === id ? { ...c, name, description, subject, shift } : c)
    }));
  };

  const bulkAddClasses = (classes: { name: string; description: string; subject?: string; shift?: string }[]) => {
    if (!db.currentSchoolId) return;
    const newClasses = classes.map(c => ({
      id: crypto.randomUUID(),
      schoolId: db.currentSchoolId!,
      name: c.name,
      description: c.description,
      subject: c.subject || currentSchool?.defaultSubject || 'Geral',
      shift: c.shift || 'Não informado'
    }));
    setDb(prev => ({ ...prev, classes: [...prev.classes, ...newClasses] }));
  };

  const updateSchoolInfo = (info: SchoolInfo) => {
    setDb(prev => {
      const updatedSchools = prev.schools.map(s => 
        s.id === prev.currentSchoolId ? { 
          ...s, 
          name: info.schoolName, 
          teacherName: info.teacherName,
          email: info.email,
          defaultSubject: info.defaultSubject
        } : s
      );
      return { ...prev, schoolInfo: info, schools: updatedSchools };
    });
  };

  const deleteClass = (id: string) => {
    setDb(prev => ({
      ...prev,
      classes: prev.classes.filter(c => c.id !== id),
      students: prev.students.filter(s => s.classId !== id),
      attendance: prev.attendance.filter(a => a.classId !== id)
    }));
  };

  const addStudent = (classId: string, name: string, rollNumber: string, status: StudentStatus) => {
    const newStudent: Student = { id: crypto.randomUUID(), classId, name, rollNumber: '0', status };
    setDb(prev => {
      const updatedList = [...prev.students, newStudent];
      return { ...prev, students: applyAutoNumbering(updatedList, classId) };
    });
  };

  const editStudent = (id: string, name: string, rollNumber: string, status: StudentStatus, classId: string) => {
    setDb(prev => {
      const updatedList = prev.students.map(s => s.id === id ? { ...s, name, status, classId } : s);
      return { ...prev, students: applyAutoNumbering(updatedList, classId) };
    });
  };

  const bulkAddStudents = (classId: string, students: { name: string; rollNumber: string }[]) => {
    const newStudents = students.map(s => ({
      id: crypto.randomUUID(),
      classId,
      name: s.name,
      rollNumber: '0',
      status: StudentStatus.ATIVO
    }));
    setDb(prev => {
      const updatedList = [...prev.students, ...newStudents];
      return { ...prev, students: applyAutoNumbering(updatedList, classId) };
    });
  };

  const deleteStudent = (id: string) => {
    setDb(prev => {
      const studentToRemove = prev.students.find(s => s.id === id);
      const remainingStudents = prev.students.filter(s => s.id !== id);
      const classId = studentToRemove?.classId;
      
      const newList = classId ? applyAutoNumbering(remainingStudents, classId) : remainingStudents;

      return {
        ...prev,
        students: newList,
        attendance: prev.attendance.filter(a => a.studentId !== id)
      };
    });
  };

  const saveAttendance = (classId: string, date: string, records: { studentId: string; status: AttendanceStatus }[]) => {
    const newRecords: AttendanceRecord[] = records.map(r => ({
      id: crypto.randomUUID(),
      date,
      classId,
      studentId: r.studentId,
      status: r.status
    }));

    setDb(prev => {
      const filteredAttendance = prev.attendance.filter(a => !(a.classId === classId && a.date === date));
      return { ...prev, attendance: [...filteredAttendance, ...newRecords] };
    });
  };

  const exportData = () => {
    const dataStr = JSON.stringify(db, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `backup_completo_${new Date().toISOString().split('T')[0]}.json`);
    linkElement.click();
  };

  const importData = (json: string) => {
    try {
      const parsed = JSON.parse(json);
      if (parsed.schools || parsed.schoolInfo) {
        setDb(parsed);
        alert('Dados importados com sucesso!');
      }
    } catch (e) {
      alert('Erro ao importar arquivo.');
    }
  };

  return (
    <AttendanceContext.Provider value={{
      db,
      currentSchool,
      addSchool,
      switchSchool,
      deleteSchool,
      addClass,
      editClass,
      bulkAddClasses,
      deleteClass,
      addStudent,
      editStudent,
      bulkAddStudents,
      deleteStudent,
      saveAttendance,
      updateSchoolInfo,
      signup,
      login,
      logout,
      exportData,
      importData
    }}>
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) throw new Error('useAttendance must be used within an AttendanceProvider');
  return context;
};
