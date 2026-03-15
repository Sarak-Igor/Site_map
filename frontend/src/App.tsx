import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// SARAK CORE (Framework agnóstico)
import { ThemeProvider } from './core/contexts/ThemeContext';
import { AuthProvider, useAuth } from './core/auth/AuthContext';
import SarakShell from './core/components/SarakShell';
import ProtectedRoute from './core/auth/ProtectedRoute';
import Login from './core/auth/Login';
import { ModuleSelector } from './core/components/Controls';
import GoogleTranslateWidget from './core/components/GoogleTranslateWidget';
import ChangePasswordModal from './core/auth/ChangePasswordModal';
// MÓDULOS (Conteúdo do Projeto)
// Importe os arquivos de configuração e os módulos do seu novo projeto aqui.
// Exemplo: import MyCustomModule from './modules/my-custom-module/Main';
import { Box, Key, Activity, Palette } from 'lucide-react';
import ApiKeysPage from './modules/llm/ApiKeysPage';
import SitemapBuilder from './modules/sitemap/pages/SitemapBuilder';
import LayoutSelector from './core/components/LayoutSelector';

const SarakConfig = {
  branding: {
    name: "Sarak - Site Map",
    logoPath: "logo.png"
  },
  defaultTab: 'sitemap-builder',
  navigation: [
    { id: 'sitemap-builder', label: 'Mapa Mental', icon: <Activity className="w-4 h-4" /> },
    { id: 'themes', label: 'Temas', icon: <Palette className="w-4 h-4" /> },
    { id: 'api-keys', label: 'Dashboard LLM', icon: <Key className="w-4 h-4" /> }
  ],
  modules: [
    { id: 'core', name: 'Core', icon: <Box className="w-4 h-4" /> }
  ]
};

const WelcomeScreen = () => (
  <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-theme-card border border-theme-border rounded-theme shadow-theme">
    <h1 className="text-4xl font-bold text-theme-title mb-4">Bem-vindo ao Novo Projeto</h1>
    <p className="text-theme-muted text-lg max-w-2xl">
      A base do Sarak UI Engine está perfeitamente instalada.
      Você pode começar a desenvolver as regras de negócio conectando seus novos módulos aqui.
    </p>
  </div>
);

const AppContent = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(SarakConfig.defaultTab);
  const [currentModule, setCurrentModule] = useState(SarakConfig.modules[0]?.id);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const renderContent = (tab: any) => {
    switch (tab) {
      case 'sitemap-builder':
        return <SitemapBuilder />;
      case 'themes':
        return <LayoutSelector />;
      case 'api-keys':
        return <ApiKeysPage />;
      default:
        return <WelcomeScreen />;
    }
  };

  return (
    <>
      <GoogleTranslateWidget />
      <Routes>
        <Route path="/login" element={<Login branding={SarakConfig.branding} />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <SarakShell
              config={SarakConfig}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              renderContent={renderContent}
              user={user}
              onLogout={logout}
              onPasswordModal={() => setIsPasswordModalOpen(true)}
              moduleSelector={null}
            />
          </ProtectedRoute>
        } />
      </Routes>
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </>
  );
};

const App = () => (
  <AuthProvider>
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  </AuthProvider>
);

export default App;
