
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useAttendance } from '../store/AttendanceContext';
import { Plus, Trash2, BookOpen, FileUp, School, Clock, Edit2, AlertTriangle, X } from 'lucide-react';
import { SchoolClass } from '../types';

const Classes: React.FC = () => {
  const { db, currentSchool, addClass, editClass, bulkAddClasses, deleteClass } = useAttendance();
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
  const [classToDelete, setClassToDelete] = useState<SchoolClass | null>(null);

  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [subject, setSubject] = useState(currentSchool?.defaultSubject || '');
  const [shift, setShift] = useState('Manhã');
  const [importText, setImportText] = useState('');

  // Filtra turmas da escola atual
  const schoolClasses = db.classes.filter(c => c.schoolId === db.currentSchoolId);

  const resetForm = () => {
    setName('');
    setDesc('');
    setSubject(currentSchool?.defaultSubject || '');
    setShift('Manhã');
    setEditingClass(null);
    setShowAdd(false);
  };

  const handleAddOrEdit = () => {
    if (name.trim()) {
      if (editingClass) {
        editClass(editingClass.id, name, desc, subject || 'Geral', shift);
      } else {
        addClass(name, desc, subject || 'Geral', shift);
      }
      resetForm();
    }
  };

  const startEdit = (c: SchoolClass) => {
    setEditingClass(c);
    setName(c.name);
    setDesc(c.description);
    setSubject(c.subject);
    setShift(c.shift);
    setShowAdd(true);
    setShowImport(false);
  };

  const handleBulkImport = () => {
    const lines = importText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) {
      alert('Insira ao menos um nome de turma.');
      return;
    }
    const classData = lines.map(l => ({ name: l, description: 'Turma importada', subject: currentSchool?.defaultSubject || 'Geral', shift: 'Manhã' }));
    bulkAddClasses(classData);
    setImportText('');
    setShowImport(false);
    alert(`${lines.length} turmas criadas!`);
  };

  const confirmDelete = () => {
    if (classToDelete) {
      deleteClass(classToDelete.id);
      setClassToDelete(null);
    }
  };

  return (
    <Layout title="Gerenciar Turmas" onBack={() => window.location.hash = '#/'}>
      <div className="space-y-4 pb-10">
        <div className="flex justify-between items-center mb-2">
          <div className="flex flex-col">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Suas Turmas</h2>
            <span className="text-[10px] text-teal-600 font-bold uppercase">{currentSchool?.name}</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => { setShowImport(false); editingClass ? resetForm() : setShowAdd(!showAdd); }}
              className="bg-teal-700 text-white p-2 rounded-lg shadow-md"
            >
              <Plus className={`w-5 h-5 transition-transform ${showAdd && !editingClass ? 'rotate-45' : ''}`} />
            </button>
            <button 
              onClick={() => { setShowAdd(false); setEditingClass(null); setShowImport(!showImport); }}
              className="bg-white border border-teal-700 text-teal-700 p-2 rounded-lg shadow-sm"
            >
              <FileUp className="w-5 h-5" />
            </button>
          </div>
        </div>

        {showImport && (
          <div className="bg-white p-4 rounded-xl shadow-md border border-teal-200">
            <h3 className="font-bold mb-1 text-teal-800">Importação de Turmas</h3>
            <p className="text-[10px] text-gray-500 mb-3">Cole os nomes das turmas (uma por linha).</p>
            <textarea 
              className="w-full h-24 border-gray-200 rounded-lg p-3 mb-4 border text-sm"
              placeholder="Ex:&#10;9º Ano A&#10;1º Médio Matutino"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
            ></textarea>
            <div className="flex gap-2">
              <button onClick={() => setShowImport(false)} className="flex-1 py-2 text-gray-400 text-sm">Cancelar</button>
              <button onClick={handleBulkImport} className="flex-1 py-2 bg-teal-700 text-white rounded-lg text-sm font-bold">Criar Todas</button>
            </div>
          </div>
        )}

        {showAdd && (
          <div className="bg-white p-4 rounded-xl shadow-md border border-teal-100 animate-in fade-in slide-in-from-top-2">
            <h3 className="font-bold mb-3 text-teal-800">{editingClass ? 'Editar Turma' : 'Nova Turma'}</h3>
            <input 
              className="w-full border-gray-200 rounded-lg p-3 mb-2 border text-sm focus:ring-2 focus:ring-teal-500 outline-none" 
              placeholder="Nome da Turma (Ex: 9º Ano A)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input 
              className="w-full border-gray-200 rounded-lg p-3 mb-2 border text-sm focus:ring-2 focus:ring-teal-500 outline-none" 
              placeholder="Disciplina (Ex: Matemática)"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            <div className="flex gap-2 mb-4">
              <select 
                className="flex-1 border-gray-200 rounded-lg p-3 border text-sm bg-white"
                value={shift}
                onChange={(e) => setShift(e.target.value)}
              >
                <option value="Manhã">Manhã</option>
                <option value="Tarde">Tarde</option>
                <option value="Noite">Noite</option>
                <option value="Integral">Integral</option>
              </select>
              <input 
                className="flex-1 border-gray-200 rounded-lg p-3 border text-sm" 
                placeholder="Descrição (Opcional)"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button onClick={resetForm} className="flex-1 py-2 text-gray-500 text-sm">Cancelar</button>
              <button onClick={handleAddOrEdit} className="flex-1 py-2 bg-teal-700 text-white rounded-lg text-sm font-bold">
                {editingClass ? 'Atualizar Turma' : 'Criar Turma'}
              </button>
            </div>
          </div>
        )}

        {schoolClasses.length === 0 ? (
          <div className="text-center py-12 text-gray-400 italic">
            <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-10" />
            <p>Nenhuma turma cadastrada nesta escola.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {schoolClasses.map((c) => (
              <div key={c.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center text-teal-700 font-black text-xs flex-shrink-0">
                  {c.name.substring(0, 3).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-800 text-sm truncate">{c.name}</h4>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                      <School className="w-3 h-3" /> {c.subject}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                      <Clock className="w-3 h-3" /> {c.shift}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => startEdit(c)}
                    className="p-2 text-gray-300 hover:text-teal-600 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setClassToDelete(c)}
                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {classToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-black text-gray-800 mb-2">Excluir Turma?</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-6">
                Você está prestes a excluir a turma <span className="font-bold text-gray-700">"{classToDelete.name}"</span>. 
                Isso apagará permanentemente todos os alunos e registros de chamada vinculados.
              </p>
              <div className="flex flex-col w-full gap-2">
                <button 
                  onClick={confirmDelete}
                  className="w-full py-3 bg-red-500 text-white rounded-2xl font-black shadow-lg shadow-red-200 active:scale-95 transition-all"
                >
                  Sim, Excluir
                </button>
                <button 
                  onClick={() => setClassToDelete(null)}
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

export default Classes;
