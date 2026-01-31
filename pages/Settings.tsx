
import React, { useRef, useState } from 'react';
import Layout from '../components/Layout';
import { useAttendance } from '../store/AttendanceContext';
import { Download, Upload, Trash2, ShieldCheck, User, School, Info, Save, Mail, BookOpen, LogOut } from 'lucide-react';

const Settings: React.FC = () => {
  const { db, exportData, importData, updateSchoolInfo, logout } = useAttendance();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [teacherName, setTeacherName] = useState(db.schoolInfo.teacherName);
  const [schoolName, setSchoolName] = useState(db.schoolInfo.schoolName);
  const [email, setEmail] = useState(db.schoolInfo.email || '');
  const [defaultSubject, setDefaultSubject] = useState(db.schoolInfo.defaultSubject || '');
  const [hasChanges, setHasChanges] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        importData(content);
      };
      reader.readAsText(file);
    }
  };

  const handleSaveProfile = () => {
    updateSchoolInfo({ 
      ...db.schoolInfo,
      teacherName, 
      schoolName, 
      email, 
      defaultSubject 
    });
    setHasChanges(false);
    alert('Perfil atualizado com sucesso!');
  };

  const handleConfirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
  };

  return (
    <Layout title="Configurações" onBack={() => window.location.hash = '#/'}>
      <div className="space-y-6 pb-10">
        
        <section>
          <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 ml-1 tracking-widest">Perfil Profissional</h3>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                <User className="w-3 h-3" /> Nome do Professor
              </label>
              <input 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                value={teacherName}
                onChange={(e) => { setTeacherName(e.target.value); setHasChanges(true); }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                <Mail className="w-3 h-3" /> E-mail
              </label>
              <input 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setHasChanges(true); }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                <School className="w-3 h-3" /> Nome da Escola
              </label>
              <input 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                value={schoolName}
                onChange={(e) => { setSchoolName(e.target.value); setHasChanges(true); }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> Disciplina
              </label>
              <input 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                value={defaultSubject}
                onChange={(e) => { setDefaultSubject(e.target.value); setHasChanges(true); }}
              />
            </div>
            {hasChanges && (
              <button 
                onClick={handleSaveProfile}
                className="w-full py-3 bg-teal-700 text-white rounded-xl shadow-md flex items-center justify-center gap-2 font-bold text-xs animate-in fade-in"
              >
                <Save className="w-4 h-4" /> Salvar Alterações
              </button>
            )}
          </div>
        </section>

        <section>
          <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 ml-1 tracking-widest">Sessão</h3>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <SettingsItem 
              icon={<LogOut className="text-orange-500" />} 
              title="Sair da Conta" 
              subtitle="Proteja seus dados saindo da sessão."
              onClick={() => setShowLogoutConfirm(true)}
              isLast
            />
          </div>
        </section>

        <section>
          <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 ml-1 tracking-widest">Dados e Backup</h3>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <SettingsItem 
              icon={<Download className="text-blue-500" />} 
              title="Exportar Backup" 
              subtitle="Gera um arquivo .json para salvar onde quiser."
              onClick={exportData}
            />
            <SettingsItem 
              icon={<Upload className="text-green-500" />} 
              title="Importar Backup" 
              subtitle="Restaura seus dados de um arquivo salvo."
              onClick={() => fileInputRef.current?.click()}
            />
            <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImport} />
            <SettingsItem 
              icon={<Trash2 className="text-red-500" />} 
              title="Limpar Todos os Dados" 
              subtitle="CUIDADO: Isso apagará tudo permanentemente."
              onClick={() => {
                if(confirm('TEM CERTEZA? Isso não pode ser desfeito.')) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              isLast
            />
          </div>
        </section>

        <section>
          <div className="bg-teal-700 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="text-xl font-bold">Chamada Simples</h4>
              <p className="text-teal-100 text-sm mt-1 opacity-80">Versão 1.3.0 (Offline Safe)</p>
              <div className="mt-6 flex items-center gap-2 text-xs font-medium">
                <ShieldCheck className="w-4 h-4" /> 100% Offline & Seguro
              </div>
            </div>
            <Info className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10" />
          </div>
        </section>
      </div>

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

const SettingsItem: React.FC<{ icon: React.ReactNode; title: string; subtitle: string; onClick: () => void; isLast?: boolean }> = ({ icon, title, subtitle, onClick, isLast }) => (
  <button onClick={onClick} className={`w-full p-4 flex items-center gap-4 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left ${!isLast ? 'border-b border-gray-50' : ''}`}>
    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
      {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5' })}
    </div>
    <div className="flex-1">
      <h4 className="font-semibold text-gray-800 text-sm">{title}</h4>
      <p className="text-[10px] text-gray-500">{subtitle}</p>
    </div>
  </button>
);

export default Settings;
