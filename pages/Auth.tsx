
import React, { useState } from 'react';
import { useAttendance } from '../store/AttendanceContext';
import { User, BookOpen, ArrowRight, Lock, LogIn, UserPlus } from 'lucide-react';

const Auth: React.FC = () => {
  const { db, signup, login } = useAttendance();
  const [mode, setMode] = useState<'login' | 'signup'>(db.schoolInfo.isRegistered ? 'login' : 'signup');
  
  const [formData, setFormData] = useState({
    teacherName: '',
    password: '',
    defaultSubject: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'signup') {
      if (!formData.teacherName || !formData.password) {
        alert('Por favor, preencha o nome e a senha.');
        return;
      }
      signup(formData);
    } else {
      if (!formData.teacherName || !formData.password) {
        alert('Por favor, informe seu nome e senha para entrar.');
        return;
      }
      const success = login(formData.teacherName, formData.password);
      if (!success) {
        alert('Nome ou senha incorretos. Verifique os dados e tente novamente.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Visual */}
      <div className="bg-teal-700 h-56 flex flex-col items-center justify-center text-white px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 border-8 border-white rounded-full"></div>
        </div>
        <h1 className="text-4xl font-black tracking-tight z-10">Chamada Simples</h1>
        <p className="text-teal-100 opacity-80 text-sm mt-2 uppercase tracking-widest font-bold z-10">
          Educação levada a sério
        </p>
      </div>

      {/* Form Container */}
      <div className="flex-1 -mt-10 bg-gray-50 rounded-t-[40px] px-8 pt-10 pb-12 shadow-inner">
        <div className="flex justify-center mb-8 bg-gray-200/50 p-1 rounded-2xl w-full max-w-xs mx-auto">
          <button 
            onClick={() => { setMode('login'); setFormData({ ...formData, teacherName: '' }); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'login' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500'}`}
          >
            <LogIn className="w-4 h-4" /> Entrar
          </button>
          <button 
            onClick={() => { setMode('signup'); setFormData({ ...formData, teacherName: '' }); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'signup' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500'}`}
          >
            <UserPlus className="w-4 h-4" /> Cadastro
          </button>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-black text-gray-800">
            {mode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {mode === 'login' ? 'Informe seu nome e senha cadastrados.' : 'Organize suas turmas e alunos agora.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 flex items-center gap-1">
              <User className="w-3 h-3" /> {mode === 'login' ? 'Seu Nome de Usuário' : 'Seu Primeiro Nome'} *
            </label>
            <input 
              className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-teal-500 transition-all shadow-sm"
              placeholder={mode === 'login' ? "Ex: Prof. Roberto" : "Como devemos te chamar?"}
              value={formData.teacherName}
              onChange={e => setFormData({...formData, teacherName: e.target.value})}
            />
          </div>

          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> Disciplina Principal
              </label>
              <input 
                className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-teal-500 transition-all shadow-sm"
                placeholder="Ex: Língua Portuguesa"
                value={formData.defaultSubject}
                onChange={e => setFormData({...formData, defaultSubject: e.target.value})}
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Senha de Acesso *
            </label>
            <input 
              type="password"
              className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-teal-500 transition-all shadow-sm"
              placeholder="••••••••"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-teal-700 text-white py-4 rounded-2xl font-black shadow-lg shadow-teal-700/20 flex items-center justify-center gap-3 mt-8 active:scale-95 transition-all hover:bg-teal-800"
          >
            {mode === 'login' ? 'Entrar no Sistema' : 'Finalizar Cadastro'} 
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <p className="text-center text-[10px] text-gray-400 mt-12 uppercase font-bold tracking-widest leading-relaxed">
          Seus dados são salvos localmente<br/>e nunca saem do seu dispositivo.
        </p>
      </div>
    </div>
  );
};

export default Auth;
