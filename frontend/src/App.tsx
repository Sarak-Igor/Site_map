import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { ThemeProvider } from './core/contexts/ThemeContext';
import SarakShell from './core/components/SarakShell';
import GoogleTranslateWidget from './core/components/GoogleTranslateWidget';
import { Activity, Key, Palette, Box } from 'lucide-react';
import ApiKeysPage from './modules/llm/ApiKeysPage';
import SitemapBuilder from './modules/sitemap/pages/SitemapBuilder';
import LayoutSelector from './core/components/LayoutSelector';

const SarakConfig = {
  branding: {
    name: "Sarak - Maps",
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

const AppContent = () => {
  const [activeTab, setActiveTab] = useState(SarakConfig.defaultTab);

  const renderContent = (tab: string) => {
    switch (tab) {
      case 'sitemap-builder': return <SitemapBuilder />;
      case 'themes': return <LayoutSelector />;
      case 'api-keys': return <ApiKeysPage />;
      default: return null;
    }
  };

  return (
    <>
      <GoogleTranslateWidget />
      <Routes>
        <Route path="/*" element={
          <SarakShell
            config={SarakConfig}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            renderContent={renderContent}
            moduleSelector={null}
          />
        } />
        {/* Redireciona qualquer rota antiga de login para home */}
        <Route path="/login" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

const App = () => (
  <ThemeProvider>
    <Router>
      <AppContent />
    </Router>
  </ThemeProvider>
);

export default App;
