// src/App.tsx
import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';

function AppContent() {
  const { user, loading } = useAuth();

  // Enquanto o Supabase ainda está carregando a sessão
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050816] text-white">
        <p className="text-sm tracking-wide opacity-70">
          Carregando seu painel inteligente do TitanAquatics...
        </p>
      </div>
    );
  }

  // Se tem usuário logado, mostra o Dashboard
  if (user) {
    return <Dashboard />;
  }

  // Se não tem usuário, mostra a landing
  return <LandingPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
