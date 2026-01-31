
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { CalendarCheck, Users, BookOpen, FilePieChart, Settings, Share2, School as SchoolIcon, LogOut, ChevronDown, PlusCircle, Check, Plus } from 'lucide-react';
import { useAttendance } from '../store/AttendanceContext';

const Home: React.FC = () => {
  const { db, currentSchool, logout, switchSchool, addSchool } = useAttendance();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showSchoolSwitcher, setShowSchoolSwitcher] = useState(false);
  const [showAddSchool, setShowAddSchool] = useState(false);

  // Estados para nova escola - Simplificados para apenas o necessário
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSubject, setNewSubject] = useState(currentSchool?.defaultSubject || '');

  const schoolClasses = db.classes.filter(c => c.schoolId === db.currentSchoolId);
  const schoolStudents = db.students.filter(s => schoolClasses.some(c => c.id === s.classId));

  const stats = [
    { label: 'Turmas', count: schoolClasses.length, icon: <BookOpen />, color: 'bg-blue-500' },
    { label: 'Alunos', count: schoolStudents.length, icon: <Users />, color: 'bg-green-500' },
  ];

  const navigateTo = (path: string) => {
    window.location.hash = path;
  };

  const handleConfirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
  };

  const handleCreateSchool = () => {
    if (newSchoolName.trim()) {
      addSchool({
        name: newSchoolName,
        teacherName: db.schoolInfo.teacherName, // Utiliza o nome do professor já cadastrado no sistema
        email: db.schoolInfo.email,
        defaultSubject: newSubject || 'Geral'
      });
      setShowAddSchool(false);
      setNewSchoolName('');
      setNewSubject('');
      setShowSchoolSwitcher(false);
    }
  };

  return (
    <Layout title="Chamada Simples">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-teal-700 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden">
          {/* Logout Button */}
          <button 
            onClick={() => setShowLogoutConfirm(true)}
            className="absolute top-4 right-4 z-30 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/10 active:scale-90 cursor-pointer"
            title="Sair"
          >
            <LogOut className="w-5 h-5 text-teal-100" />
          </button>

          <div className="relative z-10">
            <h2 className="text-2xl font-black mb-1 pr-12 truncate">Olá, {currentSchool?.teacherName || db.schoolInfo.teacherName || 'Professor'}!</h2>
            
            <div className="mt-3">
              {currentSchool ? (
                <div className="space-y-1">
                  <button 
                    onClick={() => setShowSchoolSwitcher(true)}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg border border-white/10 transition-all active:scale-95"
                  >
                    <SchoolIcon className="w-4 h-4 text-teal-200" />
                    <span className="font-bold text-sm truncate max-w-[180px]">{currentSchool.name}</span>
                    <ChevronDown className="w-4 h-4 text-teal-300" />
                  </button>
                  <div className="flex items-center gap-2 text-teal-100/90 text-xs mt-1 ml-1">
                    <BookOpen className="w-3 h-3" />
                    <span className="font-medium truncate">{currentSchool.defaultSubject || 'Geral'}</span>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setShowAddSchool(true)}
                  className="flex items-center gap-2 bg-white/15 hover:bg-white/25 px-4 py-2.5 rounded-xl border-2 border-dashed border-white/30 transition-all active:scale-95 group"
                >
                  <PlusCircle className="w-5 h-5 text-teal-200 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-sm">Adicionar Escola</span>
                </button>
              )}
            </div>

            <div className="mt-6 flex gap-4">
              {stats.map((s, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-md rounded-xl py-2 px-4 border border-white/10 min-w-[80px]">
                  <span className="block text-[10px] uppercase font-bold tracking-wider opacity-70">{s.label}</span>
                  <span className="text-xl font-black">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-10 pointer-events-none">
            <CalendarCheck className="w-40 h-40" />
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-2 gap-4">
          <DashboardItem 
            icon={<CalendarCheck className="w-8 h-8 text-teal-700" />} 
            label="Fazer Chamada" 
            onClick={() => navigateTo('#/attendance')} 
            color="bg-teal-50"
          />
          <DashboardItem 
            icon={<FilePieChart className="w-8 h-8 text-orange-600" />} 
            label="Relatórios" 
            onClick={() => navigateTo('#/reports')} 
            color="bg-orange-50"
          />
          <DashboardItem 
            icon={<BookOpen className="w-8 h-8 text-blue-600" />} 
            label="Gerenciar Turmas" 
            onClick={() => navigateTo('#/classes')} 
            color="bg-blue-50"
          />
          <DashboardItem 
            icon={<Users className="w-8 h-8 text-green-600" />} 
            label="Gerenciar Alunos" 
            onClick={() => navigateTo('#/students')} 
            color="bg-green-50"
          />
          <DashboardItem 
            icon={<Settings className="w-8 h-8 text-gray-600" />} 
            label="Configurações" 
            onClick={() => navigateTo('#/settings')} 
            color="bg-gray-100"
          />
          <DashboardItem 
            icon={<Share2 className="w-8 h-8 text-purple-600" />} 
            label="Exportar Dados" 
            onClick={() => navigateTo('#/settings')} 
            color="bg-purple-50"
          />
        </div>
      </div>

      {/* School Switcher Modal */}
      {showSchoolSwitcher && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-gray-800">Minhas Escolas</h3>
              <button 
                onClick={() => setShowAddSchool(true)}
                className="flex items-center gap-1 text-teal-600 font-bold text-sm p-2 hover:bg-teal-50 rounded-xl transition-colors"
              >
                <PlusCircle className="w-5 h-5" /> Adicionar
              </button>
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {db.schools.map((school) => (
                <button
                  key={school.id}
                  onClick={() => { switchSchool(school.id); setShowSchoolSwitcher(false); }}
                  className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all border-2 ${
                    db.currentSchoolId === school.id 
                      ? 'border-teal-500 bg-teal-50' 
                      : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${
                    db.currentSchoolId === school.id ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {school.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-bold text-gray-800 text-sm leading-tight">{school.name}</h4>
                    <p className="text-[10px] text-gray-400 font-medium uppercase mt-0.5">{school.defaultSubject}</p>
                  </div>
                  {db.currentSchoolId === school.id && <Check className="w-5 h-5 text-teal-600" />}
                </button>
              ))}
              {db.schools.length === 0 && (
                <div className="text-center py-10 text-gray-400 italic text-sm">
                  Nenhuma escola cadastrada.
                </div>
              )}
            </div>

            <button 
              onClick={() => setShowSchoolSwitcher(false)}
              className="w-full mt-6 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold active:scale-95 transition-all"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Add School Modal Overlay */}
      {showAddSchool && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black text-gray-800 mb-4">Nova Escola</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Nome da Escola</label>
                <input 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                  placeholder="Ex: Escola Modelo"
                  autoFocus
                  value={newSchoolName}
                  onChange={(e) => setNewSchoolName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Disciplina Principal</label>
                <input 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                  placeholder="Ex: Matemática"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => setShowAddSchool(false)}
                  className="flex-1 py-3 text-gray-400 text-sm font-bold"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleCreateSchool}
                  className="flex-1 py-3 bg-teal-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-teal-100 active:scale-95 transition-transform"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4">
                <LogOut className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-lg font-black text-gray-800 mb-2">Sair do Sistema?</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-6">
                Sua sessão será encerrada. Você precisará de sua senha para acessar os dados novamente.
              </p>
              <div className="flex flex-col w-full gap-2">
                <button 
                  onClick={handleConfirmLogout}
                  className="w-full py-3 bg-orange-500 text-white rounded-2xl font-black shadow-lg shadow-orange-100 active:scale-95 transition-all"
                >
                  Confirmar Saída
                </button>
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="w-full py-3 bg-gray-100 text-gray-500 rounded-2xl font-bold active:scale-95 transition-all"
                >
                  Continuar aqui
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

const DashboardItem: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; color: string }> = ({ icon, label, onClick, color }) => (
  <button 
    onClick={onClick} 
    className={`${color} rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm border border-black/5 hover:shadow-md active:scale-95 transition-all duration-200 cursor-pointer w-full group`}
  >
    <div className="mb-3 pointer-events-none group-hover:scale-110 transition-transform">{icon}</div>
    <span className="text-sm font-bold text-gray-800 leading-tight pointer-events-none">{label}</span>
  </button>
);

export default Home;
