
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAttendance } from '../store/AttendanceContext';
import { AttendanceStatus, StudentStatus } from '../types';
import { Save, Calendar, CheckCircle2 } from 'lucide-react';

const Attendance: React.FC = () => {
  const { db, saveAttendance } = useAttendance();
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState<Record<string, AttendanceStatus>>({});

  // CRÍTICO: Filtra apenas alunos ATIVOS para a chamada
  const activeStudents = db.students
    .filter(s => s.classId === selectedClass && s.status === StudentStatus.ATIVO)
    .sort((a, b) => a.name.localeCompare(b.name));

  useEffect(() => {
    const existing = db.attendance.filter(a => a.classId === selectedClass && a.date === date);
    const initialRecords: Record<string, AttendanceStatus> = {};
    
    activeStudents.forEach(s => {
      initialRecords[s.id] = AttendanceStatus.PRESENT;
    });
    existing.forEach(e => {
      initialRecords[e.studentId] = e.status;
    });

    setRecords(initialRecords);
  }, [selectedClass, date]);

  const toggleStatus = (studentId: string, status: AttendanceStatus) => {
    setRecords(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSave = () => {
    if (!selectedClass) {
      alert('Selecione uma turma primeiro.');
      return;
    }
    const dataToSave = Object.entries(records).map(([studentId, status]) => ({ studentId, status }));
    saveAttendance(selectedClass, date, dataToSave);
    alert('Frequência salva com sucesso!');
    window.location.hash = '#/';
  };

  return (
    <Layout title="Realizar Chamada" onBack={() => window.location.hash = '#/'}>
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Selecionar Turma</label>
            <select 
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-700 outline-none focus:ring-2 focus:ring-teal-500 font-medium"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">Escolha a Turma...</option>
              {db.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Data da Aula</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-600" />
              <input 
                type="date"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 pl-10 pr-3 text-gray-700 outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {!selectedClass ? (
          <div className="text-center py-16 text-gray-400 flex flex-col items-center">
            <CheckCircle2 className="w-12 h-12 mb-2 opacity-10" />
            <p className="text-sm italic">Selecione uma turma acima.</p>
          </div>
        ) : (
          <>
            <div className="bg-white p-3 rounded-lg border border-gray-100 flex justify-around shadow-sm mb-2">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded bg-green-500 flex items-center justify-center text-[10px] text-white font-bold">P</div>
                <span className="text-[10px] font-semibold text-gray-500">Presente</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded bg-red-500 flex items-center justify-center text-[10px] text-white font-bold">F</div>
                <span className="text-[10px] font-semibold text-gray-500">Falta</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center text-[10px] text-white font-bold">J</div>
                <span className="text-[10px] font-semibold text-gray-500">Justificada</span>
              </div>
            </div>

            <div className="space-y-2 pb-24">
              {activeStudents.map((student) => (
                <div key={student.id} className="bg-white p-3 rounded-xl border border-gray-100 flex items-center justify-between gap-3 shadow-sm">
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] text-gray-400 font-black block">Nº {student.rollNumber || '-'}</span>
                    <h4 className="font-bold text-gray-800 truncate text-sm">{student.name}</h4>
                  </div>
                  <div className="flex gap-1.5">
                    <StatusBtn active={records[student.id] === AttendanceStatus.PRESENT} onClick={() => toggleStatus(student.id, AttendanceStatus.PRESENT)} label="P" color="bg-green-500" />
                    <StatusBtn active={records[student.id] === AttendanceStatus.ABSENT} onClick={() => toggleStatus(student.id, AttendanceStatus.ABSENT)} label="F" color="bg-red-500" />
                    <StatusBtn active={records[student.id] === AttendanceStatus.JUSTIFIED} onClick={() => toggleStatus(student.id, AttendanceStatus.JUSTIFIED)} label="J" color="bg-blue-500" />
                  </div>
                </div>
              ))}
              {activeStudents.length === 0 && (
                <div className="p-10 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <p className="text-xs text-gray-400">Não há alunos "Ativos" nesta turma.</p>
                </div>
              )}
            </div>

            <div className="fixed bottom-24 left-0 right-0 px-6 z-40">
              <button 
                onClick={handleSave}
                className="w-full max-w-md mx-auto bg-teal-700 text-white py-4 rounded-2xl shadow-2xl flex items-center justify-center gap-3 font-black hover:bg-teal-800 transition-all active:scale-95"
              >
                <Save className="w-6 h-6" /> Salvar Chamada
              </button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

const StatusBtn: React.FC<{ active: boolean; onClick: () => void; label: string; color: string }> = ({ active, onClick, label, color }) => (
  <button 
    onClick={onClick}
    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 font-black text-sm ${
      active ? `${color} text-white shadow-lg scale-110` : 'bg-gray-100 text-gray-400'
    }`}
  >
    {label}
  </button>
);

export default Attendance;
