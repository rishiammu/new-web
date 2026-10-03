import React, { useState } from 'react';
import { Activity, LogOut, Menu, User as UserIcon, X, LayoutDashboard, Play, Pause, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useIoT } from '../context/IoTContext';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenArchitectureModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenArchitectureModal }) => {
  const { currentUser, isAuthenticated, logout, openLoginModal, openRegisterModal } = useAuth();
  const { isSimulating, toggleSimulation, startSimulation } = useIoT();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (view: string) => {
    if (view === 'dashboard' && !isAuthenticated) {
      openLoginModal();
      return;
    }
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  const handleStartSimulatorClick = () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    startSimulation();
    onNavigate('dashboard');
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0B0F19]/90 backdrop-blur-md border-b border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => handleNavClick('landing')}
          className="flex items-center gap-2.5 group text-left focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="text-base font-bold tracking-tight text-white leading-tight">
              SMART IoT
            </div>
            <div className="text-[11px] text-slate-400 font-medium tracking-tight">
              Industrial Anomaly Detection
            </div>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <button
            onClick={() => handleNavClick('landing')}
            className={`hover:text-cyan-400 transition-colors ${currentView === 'landing' ? 'text-cyan-400' : ''}`}
          >
            Overview
          </button>
          <a
            href="#features"
            onClick={(e) => {
              if (currentView !== 'landing') {
                e.preventDefault();
                handleNavClick('landing');
                setTimeout(() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
            className="hover:text-cyan-400 transition-colors"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            onClick={(e) => {
              if (currentView !== 'landing') {
                e.preventDefault();
                handleNavClick('landing');
                setTimeout(() => {
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
            className="hover:text-cyan-400 transition-colors"
          >
            How It Works
          </a>
          <button
            onClick={() => handleNavClick('dashboard')}
            className={`flex items-center gap-1.5 hover:text-cyan-400 transition-colors ${
              currentView === 'dashboard' ? 'text-cyan-400 font-semibold' : ''
            }`}
          >
            <span>Dashboard</span>
          </button>
          {onOpenArchitectureModal && (
            <button
              onClick={onOpenArchitectureModal}
              className="flex items-center gap-1 hover:text-cyan-400 text-slate-400 text-xs transition-colors"
              title="Project Explanation, Technologies & Terms Glossary"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Docs & Terms</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Global Start Simulator Quick Action */}
          <button
            onClick={isSimulating ? toggleSimulation : handleStartSimulatorClick}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
              isSimulating
                ? 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/40'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 animate-pulse'
            }`}
          >
            {isSimulating ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Simulating (Active)</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Simulator</span>
              </>
            )}
          </button>

          {isAuthenticated && currentUser ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleNavClick('dashboard')}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700/80 rounded-lg text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400" />
                <span>Console</span>
              </button>

              <div className="flex items-center gap-2 pl-2 border-l border-slate-800 text-xs">
                <div className="text-right">
                  <div className="font-semibold text-slate-200">{currentUser.name}</div>
                  <div className="text-[10px] text-cyan-400 font-mono">
                    {currentUser.role === 'OPERATIONS_ENGINEER' ? 'Operations Eng' : 'Plant Mgr'}
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-md hover:bg-slate-800 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={openLoginModal}
                className="text-xs font-medium text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800/60 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={openRegisterModal}
                className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-sm shadow-cyan-400/20 transition-colors whitespace-nowrap"
              >
                Get Started
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800/60"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0F172A] border-b border-slate-800 px-4 pt-3 pb-5 space-y-3">
          <nav className="flex flex-col space-y-2 text-sm font-medium">
            <button
              onClick={() => handleNavClick('landing')}
              className="text-left py-2 px-3 rounded-md hover:bg-slate-800 text-slate-200"
            >
              Overview
            </button>
            <a
              href="#features"
              onClick={() => {
                handleNavClick('landing');
                setTimeout(() => document.getElementById('features')?.scrollIntoView(), 100);
              }}
              className="py-2 px-3 rounded-md hover:bg-slate-800 text-slate-200 block"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => {
                handleNavClick('landing');
                setTimeout(() => document.getElementById('how-it-works')?.scrollIntoView(), 100);
              }}
              className="py-2 px-3 rounded-md hover:bg-slate-800 text-slate-200 block"
            >
              How It Works
            </a>
            <button
              onClick={() => handleNavClick('dashboard')}
              className="text-left py-2 px-3 rounded-md hover:bg-slate-800 text-cyan-400 font-semibold"
            >
              Dashboard Console
            </button>
          </nav>

          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            <button
              onClick={() => {
                if (isSimulating) {
                  toggleSimulation();
                } else {
                  handleStartSimulatorClick();
                }
                setMobileMenuOpen(false);
              }}
              className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                isSimulating
                  ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40'
                  : 'bg-emerald-500 text-slate-950 shadow-sm'
              }`}
            >
              {isSimulating ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-amber-400" />
                  <span>Simulation Active · Tap to Stop</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Simulator</span>
                </>
              )}
            </button>

            {isAuthenticated && currentUser ? (
              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="text-sm font-semibold text-slate-200">{currentUser.name}</div>
                  <div className="text-xs text-slate-400">{currentUser.email}</div>
                </div>
                <button
                  onClick={logout}
                  className="px-3 py-1.5 text-xs text-rose-400 bg-rose-950/40 border border-rose-900/60 rounded-md"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openLoginModal();
                  }}
                  className="w-full py-2 text-center text-xs font-semibold text-slate-200 bg-slate-800 rounded-lg border border-slate-700"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openRegisterModal();
                  }}
                  className="w-full py-2 text-center text-xs font-semibold text-slate-950 bg-cyan-400 rounded-lg"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
