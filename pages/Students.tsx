
import React, { useState, useRef } from 'react';
import Layout from '../components/Layout';
import { useAttendance } from '../store/AttendanceContext';
import { StudentStatus, Student } from '../types';
import { Plus, Trash2, Users, Search, FileUp, Edit2, AlertTriangle, Info } from 'lucide-react';

const Students: React.FC = () => {
  const { db, addStudent, editStudent, bulkAddStudents, deleteStudent } = useAttendance();
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const [selectedClass, setSelectedClass] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<StudentStatus>(StudentStatus.ATIVO);
  const [search, setSearch] = useState('');
  const [importText, setImportText] = useState('');

  const filteredStudents = db.students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) &&
    (!selectedClass || s.classId === selectedClass)
  );

  const resetForm = () => {
    setName('');
    setStatus(StudentStatus.ATIVO);
    setEditingStudent(null);
    setShowAdd(false);
  };

  const handleAddOrEdit = () => {
    if (name.trim() && selectedClass) {
      if (editingStudent) {
        editStudent(editingStudent.id, name, '0', status, selectedClass);
      } else {
        addStudent(selectedClass, name, '0', status);
      }
      resetForm();
    } else {
      alert('Preencha o nome e selecione uma turma.');
    }
  };

  const startEdit = (s: Student) => {
    setEditingStudent(s);
    setName(s.name);
    setStatus(s.status);
    setSelectedClass(s.classId);
    setShowAdd(true);
    setShowImport(false);
  };

  const handleBulkImport = () => {
    if (!selectedClass) {
      alert('Selecione uma turma primeiro.');
      return;
    }
    const names = importText.split('\n').map(n => n.trim()).filter(n => n.length > 0);
    if (names.length === 0) {
      alert('Insira ao menos um nome.');
      return;
    }
    const studentData = names.map((n) => ({ name: n, rollNumber: '0' }));
    bulkAddStudents(selectedClass, studentData);
    setImportText('');
    setShowImport(false);
    alert(`${names.length} alunos importados com sucesso!`);
  };

  const confirmDelete = () => {
    if (studentToDelete) {
      deleteStudent(studentToDelete.id);
      setStudentToDelete(null);
    }
  };

  const getStatusColor = (s: StudentStatus) => {
    switch (s) {
      case StudentStatus.ATIVO: return 'bg-green-100 text-green-700';
      case StudentStatus.TRANSFERIDO: return 'bg-orange-100 text-orange-700';
      case StudentStatus.INDEFINIDO: return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Layout title="Gerenciar Alunos" onBack={() => window.location.hash = '#/'}>
      <div className="space-y-4 pb-20">
        {/* Busca e Filtro */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" 
              placeholder="Buscar aluno..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select 
            className="bg-white border border-gray-200 rounded-lg px-2 text-xs text-gray-600 focus:ring-2 focus:ring-teal-500 outline-none"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">Todas as Turmas</option>
            {db.classes.filter(c => c.schoolId === db.currentSchoolId).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => { setShowImport(false); editingStudent ? resetForm() : setShowAdd(true); }}
            className="py-3 bg-teal-700 text-white rounded-xl shadow-md flex items-center justify-center gap-2 font-semibold text-sm"
          >
            <Plus className="w-4 h-4" /> {editingStudent ? 'Cancelar Edição' : 'Novo Aluno'}
          </button>
          <button 
            onClick={() => { setShowAdd(false); resetForm(); setShowImport(true); }}
            className="py-3 bg-white border border-teal-700 text-teal-700 rounded-xl shadow-md flex items-center justify-center gap-2 font-semibold text-sm"
          >
            <FileUp className="w-4 h-4" /> Importar Lista
          </button>
        </div>

        {/* Modal Importação */}
        {showImport && (
          <div className="bg-white p-4 rounded-xl shadow-md border border-teal-200 animate-in fade-in slide-in-from-top-4">
            <h3 className="font-bold mb-1 text-teal-800 flex items-center gap-2"><FileUp className="w-4 h-4" /> Importar Alunos</h3>
            <p className="text-[10px] text-gray-500 mb-3">Selecione a turma e cole a lista de nomes (um por linha).</p>
            
            <select 
              className="w-full border-gray-200 rounded-lg p-2 mb-3 border text-sm" 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">Turma de Destino *</option>
              {db.classes.filter(c => c.schoolId === db.currentSchoolId).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <textarea 
              className="w-full h-32 border-gray-200 rounded-lg p-2 mb-4 border text-sm outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Ex:&#10;Ana Maria&#10;Bruno Silva&#10;Carlos José"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
            ></textarea>
            
            <div className="flex gap-2">
              <button onClick={() => setShowImport(false)} className="flex-1 py-2 text-gray-400 text-sm font-medium">Cancelar</button>
              <button onClick={handleBulkImport} className="flex-1 py-2 bg-teal-700 text-white rounded-lg text-sm font-bold">Salvar Lista</button>
            </div>
          </div>
        )}

        {/* Cadastro/Edição Manual */}
        {showAdd && (
          <div className="bg-white p-4 rounded-xl shadow-md border border-teal-100 animate-in fade-in slide-in-from-top-4">
            <h3 className="font-bold mb-3 text-teal-800">{editingStudent ? 'Editar Aluno' : 'Novo Cadastro'}</h3>
            <select 
              className="w-full border-gray-200 rounded-lg p-3 mb-2 border text-sm" 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">Turma *</option>
              {db.classes.filter(c => c.schoolId === db.currentSchoolId).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input 
              className="w-full border-gray-200 rounded-lg p-3 mb-2 border text-sm outline-none focus:ring-2 focus:ring-teal-500" 
              placeholder="Nome Completo *"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="flex flex-col gap-2 mb-4">
              <select 
                className="w-full border-gray-200 rounded-lg p-3 border text-xs font-semibold" 
                value={status}
                onChange={(e) => setStatus(e.target.value as StudentStatus)}
              >
                <option value={StudentStatus.ATIVO}>Status: Ativo</option>
                <option value={StudentStatus.TRANSFERIDO}>Transferido</option>
                <option value={StudentStatus.INDEFINIDO}>Indefinido</option>
              </select>
              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
                <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <p className="text-[10px] text-blue-700 leading-tight">
                  O número de chamada será atribuído automaticamente com base na ordem alfabética.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={resetForm} className="flex-1 py-2 text-gray-500 text-sm font-medium">Cancelar</button>
              <button onClick={handleAddOrEdit} className="flex-1 py-2 bg-teal-700 text-white rounded-lg text-sm font-bold">
                {editingStudent ? 'Atualizar' : 'Salvar'}
              </button>
            </div>
          </div>
        )}

        {/* Listagem */}
        <div className="space-y-2">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Nenhum aluno encontrado.</p>
            </div>
          ) : (
            filteredStudents.sort((a,b) => a.name.localeCompare(b.name)).map((s) => (
              <div key={s.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-teal-700 font-black text-[10px] border border-gray-100">
                  {s.rollNumber}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-800 truncate text-sm leading-tight">{s.name}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] text-teal-600 font-bold uppercase">
                      {db.classes.find(c => c.id === s.classId)?.name}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase ${getStatusColor(s.status)}`}>
                      {s.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => startEdit(s)}
                    className="p-2 text-gray-300 hover:text-teal-600 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setStudentToDelete(s)}
                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-black text-gray-800 mb-2">Excluir Aluno?</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-6">
                Você deseja excluir <span className="font-bold text-gray-700">"{studentToDelete.name}"</span>? 
                Esta ação apagará permanentemente todos os dados deste aluno.
              </p>
              <div className="flex flex-col w-full gap-2">
                <button 
                  onClick={confirmDelete}
                  className="w-full py-3 bg-red-500 text-white rounded-2xl font-black shadow-lg shadow-red-200 active:scale-95 transition-all"
                >
                  Sim, Excluir
                </button>
                <button 
                  onClick={() => setStudentToDelete(null)}
                  className="w-full py-3 bg-gray-100 text-gray-500 rounded-2xl font-bold active:scale-95 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Students;
