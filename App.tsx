
import React, { useState, useEffect } from 'react';
import { AttendanceProvider, useAttendance } from './store/AttendanceContext';
import Home from './pages/Home';
import Classes from './pages/Classes';
import Students from './pages/Students';
import Attendance from './pages/Attendance';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Auth from './pages/Auth';

const AppContent: React.FC = () => {
  const { db } = useAttendance();
  const [currentHash, setCurrentHash] = useState(window.location.hash || '#/');

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash || '#/');
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Se o usuário não estiver logado, obriga a passar pela tela de Auth
  if (!db.schoolInfo.isLoggedIn) {
    return <Auth />;
  }

  const renderPage = () => {
    if (currentHash === '#/') return <Home />;
    if (currentHash === '#/classes') return <Classes />;
    if (currentHash === '#/students') return <Students />;
    if (currentHash === '#/attendance') return <Attendance />;
    if (currentHash === '#/reports') return <Reports />;
    if (currentHash === '#/settings') return <Settings />;
    if (currentHash === '#/auth') return <Auth />;
    return <Home />;
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 shadow-xl overflow-x-hidden">
      {renderPage()}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AttendanceProvider>
      <AppContent />
    </AttendanceProvider>
  );
};

export default App;
