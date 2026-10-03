import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { IoTProvider, useIoT } from './context/IoTContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { LandingPage } from './pages/LandingPage';
import { DashboardLayout } from './pages/dashboard/DashboardLayout';
import { ArchitectureModal } from './components/ArchitectureModal';

const AppContent: React.FC = () => {
  const { isAuthenticated, openLoginModal } = useAuth();
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard'>('landing');
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState(false);

  const handleNavigate = (view: string) => {
    if (view === 'dashboard') {
      if (!isAuthenticated) {
        openLoginModal();
        return;
      }
      setCurrentView('dashboard');
    } else {
      setCurrentView('landing');
    }
  };

  const handleDashboardLaunchFromLanding = () => {
    if (!isAuthenticated) {
      openLoginModal();
    } else {
      setCurrentView('dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/25 selection:text-cyan-200">
      {/* If in Landing mode, display global Top Navbar */}
      {currentView === 'landing' && (
        <Navbar
          currentView={currentView}
          onNavigate={handleNavigate}
          onOpenArchitectureModal={() => setIsArchitectureModalOpen(true)}
        />
      )}

      {/* Main Page Rendering */}
      <div className="flex-1 flex flex-col">
        {currentView === 'landing' ? (
          <>
            <LandingPage
              onNavigateToDashboard={handleDashboardLaunchFromLanding}
              onOpenArchitectureModal={() => setIsArchitectureModalOpen(true)}
            />
            <Footer onNavigate={handleNavigate} />
          </>
        ) : (
          <DashboardLayout onNavigateLanding={() => setCurrentView('landing')} />
        )}
      </div>

      {/* Authentication Modal */}
      <AuthModal
        onSuccessRedirect={() => {
          setCurrentView('dashboard');
        }}
      />

      {/* Architecture & Backend Code Modal */}
      <ArchitectureModal
        isOpen={isArchitectureModalOpen}
        onClose={() => setIsArchitectureModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <IoTProvider>
        <AppContent />
      </IoTProvider>
    </AuthProvider>
  );
}
