import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './components/LandingPage';
import Sidebar from './components/Sidebar';
import Overview from './views/Overview';
import Aquariums from './views/Aquariums';
import TitanCopilot from './components/TitanCopilot';
import { Menu } from 'lucide-react';

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#05051a] text-white">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-[#4fb7b3] border-t-transparent rounded-full animate-spin" />
      <p className="text-sm tracking-widest uppercase text-[#4fb7b3] animate-pulse">
        Carregando Sistema Titan...
      </p>
    </div>
  </div>
);

// Placeholder Views
const EventsView = () => <div className="p-8 text-white max-w-7xl mx-auto"><h2 className="text-2xl font-bold mb-4">Eventos</h2><p className="text-slate-400">Módulo em desenvolvimento.</p></div>;
const ToolsView = () => <div className="p-8 text-white max-w-7xl mx-auto"><h2 className="text-2xl font-bold mb-4">Ferramentas</h2><p className="text-slate-400">Módulo em desenvolvimento.</p></div>;
const AccountView = () => <div className="p-8 text-white max-w-7xl mx-auto"><h2 className="text-2xl font-bold mb-4">Minha Conta</h2><p className="text-slate-400">Módulo em desenvolvimento.</p></div>;
const AdminView = () => <div className="p-8 text-white max-w-7xl mx-auto"><h2 className="text-2xl font-bold mb-4">Administração</h2><p className="text-slate-400">Módulo em desenvolvimento.</p></div>;
const TravelView = () => <div className="p-8 text-white max-w-7xl mx-auto"><h2 className="text-2xl font-bold mb-4">Modo Viagem</h2><p className="text-slate-400">Módulo em desenvolvimento.</p></div>;

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <LandingPage />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'overview': return <Overview />;
      case 'aquariums': return <Aquariums />;
      case 'events': return <EventsView />;
      case 'tools': return <ToolsView />;
      case 'account': return <AccountView />;
      case 'admin': return <AdminView />;
      case 'travel': return <TravelView />;
      default: return <Overview />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#05051a] text-white font-sans selection:bg-[#4fb7b3] selection:text-black overflow-hidden">
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />
      
      <main className="flex-1 md:ml-[280px] h-screen overflow-y-auto overflow-x-hidden relative bg-[#05051a]">
        {/* Mobile Header */}
        <header className="md:hidden h-16 border-b border-white/5 bg-[#05051a]/90 backdrop-blur flex items-center justify-between px-4 sticky top-0 z-30">
           <div className="flex items-center gap-2">
             <span className="text-[#4fb7b3]">●</span>
             <span className="font-heading font-bold text-white">TITAN AQUATICS</span>
           </div>
           <button 
             onClick={() => setMobileMenuOpen(true)}
             className="p-2 text-white hover:bg-white/10 rounded-lg"
           >
             <Menu size={20} />
           </button>
        </header>

        {renderView()}
      </main>

      <TitanCopilot />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}