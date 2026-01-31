
import React from 'react';
import { Home, Users, BookOpen, FileText, Settings, ArrowLeft } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  onBack?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, title, onBack }) => {
  const navigateTo = (path: string) => {
    window.location.hash = path;
  };

  return (
    <div className="min-h-screen pb-20 flex flex-col">
      {/* Header */}
      <header className="bg-teal-700 text-white p-4 flex items-center shadow-md sticky top-0 z-50">
        {onBack && (
          <button onClick={onBack} className="mr-4 p-1 rounded-full hover:bg-teal-600 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}
        <h1 className="text-xl font-bold flex-1 truncate">{title}</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 max-w-lg mx-auto w-full">
        {children}
      </main>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-6 flex justify-between items-center z-50">
        <NavItem icon={<Home />} label="Início" onClick={() => navigateTo('#/')} active={window.location.hash === '#/' || window.location.hash === ''} />
        <NavItem icon={<BookOpen />} label="Turmas" onClick={() => navigateTo('#/classes')} active={window.location.hash.startsWith('#/classes')} />
        <NavItem icon={<Users />} label="Alunos" onClick={() => navigateTo('#/students')} active={window.location.hash.startsWith('#/students')} />
        <NavItem icon={<FileText />} label="Relatórios" onClick={() => navigateTo('#/reports')} active={window.location.hash.startsWith('#/reports')} />
        <NavItem icon={<Settings />} label="Ajustes" onClick={() => navigateTo('#/settings')} active={window.location.hash.startsWith('#/settings')} />
      </nav>
    </div>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; active: boolean }> = ({ icon, label, onClick, active }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 focus:outline-none ${active ? 'text-teal-700' : 'text-gray-400'}`}>
    <div className={`${active ? 'scale-110' : ''} transition-transform pointer-events-none`}>
      {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6' })}
    </div>
    <span className="text-[10px] font-medium uppercase tracking-wider pointer-events-none">{label}</span>
  </button>
);

export default Layout;
