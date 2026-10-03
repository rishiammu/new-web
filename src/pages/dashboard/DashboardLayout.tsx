import React, { useState } from 'react';
import {
  Activity,
  Cpu,
  BarChart3,
  ShieldAlert,
  Bell,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Home,
  CheckCircle2,
  Terminal,
  Zap,
  Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useIoT } from '../../context/IoTContext';
import { DashboardOverview } from './DashboardOverview';
import { MachinesView } from './MachinesView';
import { SensorsView } from './SensorsView';
import { AnomaliesView } from './AnomaliesView';
import { AlertsView } from './AlertsView';
import { ReportsView } from './ReportsView';
import { ArchitectureDocsView } from './ArchitectureDocsView';
import { SimulationControlBar } from '../../components/SimulationControlBar';
import { AnomalyModal } from '../../components/AnomalyModal';
import { AddMachineModal } from '../../components/AddMachineModal';

interface DashboardLayoutProps {
  onNavigateLanding: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ onNavigateLanding }) => {
  const { currentUser, logout } = useAuth();
  const {
    selectedMachineId,
    setSelectedMachineId,
    selectedAnomaly,
    setSelectedAnomaly,
    resolveAnomaly,
    stats,
  } = useIoT();

  const [activeTab, setActiveTab] = useState<'overview' | 'machines' | 'sensors' | 'anomalies' | 'alerts' | 'reports' | 'architecture'>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isAddMachineOpen, setIsAddMachineOpen] = useState(false);

  const handleSelectMachine = (machineId: string) => {
    setSelectedMachineId(machineId);
    setActiveTab('machines');
  };

  const handleMachineCreated = (machineId: string) => {
    setSelectedMachineId(machineId);
    setActiveTab('machines');
  };

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'machines', label: 'Machines', icon: Cpu, badge: stats.totalMachines },
    { id: 'sensors', label: 'Sensor Data', icon: Activity },
    { id: 'anomalies', label: 'Anomalies', icon: ShieldAlert, badge: stats.openAnomaliesCount > 0 ? stats.openAnomaliesCount : undefined, badgeColor: 'bg-amber-500/20 text-amber-400' },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: stats.criticalAlertsCount > 0 ? stats.criticalAlertsCount : undefined, badgeColor: 'bg-rose-500/20 text-rose-400' },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'architecture', label: 'Architecture & ML', icon: Terminal },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col">
      {/* Simulation Banner */}
      <SimulationControlBar />

      <div className="flex-1 flex overflow-hidden">
        {/* ============================================================
            SIDEBAR (Desktop)
            ============================================================ */}
        <aside className="hidden lg:flex lg:flex-col w-64 bg-[#0D121F] border-r border-slate-800/80 p-4 justify-between shrink-0">
          <div className="space-y-6">
            {/* Brand in Sidebar */}
            <div className="flex items-center justify-between px-2">
              <button
                onClick={onNavigateLanding}
                className="flex items-center gap-2.5 text-left focus:outline-none group"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                  <Activity className="w-5 h-5 text-slate-950 font-bold" />
                </div>
                <div>
                  <div className="text-sm font-bold tracking-tight text-white leading-tight">
                    SMART IoT
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Industrial System
                  </div>
                </div>
              </button>
            </div>

            {/* Quick Add Asset Button in Sidebar */}
            <div className="px-1">
              <button
                onClick={() => setIsAddMachineOpen(true)}
                className="w-full py-2 px-3 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Machine / System</span>
              </button>
            </div>

            {/* Navigation links */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      if (item.id !== 'machines') setSelectedMachineId(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-cyan-500/10 text-cyan-300 font-semibold border border-cyan-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* User profile & Logout */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <button
              onClick={onNavigateLanding}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800/40 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Back to Landing Page</span>
            </button>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div className="truncate pr-2">
                <div className="text-xs font-semibold text-white truncate">
                  {currentUser?.name || 'Operations Lead'}
                </div>
                <div className="text-[10px] text-cyan-400 font-mono truncate">
                  {currentUser?.email || 'engineer@smartiot.industrial'}
                </div>
              </div>

              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* ============================================================
            MAIN CONTENT AREA
            ============================================================ */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          {/* Mobile Header Bar */}
          <div className="lg:hidden flex items-center justify-between p-4 bg-[#0D121F] border-b border-slate-800">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800"
                aria-label="Toggle menu"
              >
                {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <span className="text-sm font-bold text-white">SMART IoT Console</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddMachineOpen(true)}
                className="p-1.5 bg-cyan-400 text-slate-950 rounded-lg"
                title="Add Machine"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={onNavigateLanding}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Landing</span>
              </button>
            </div>
          </div>

          {/* Mobile Drawer */}
          {mobileSidebarOpen && (
            <div className="lg:hidden bg-[#0D121F] border-b border-slate-800 p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      if (item.id !== 'machines') setSelectedMachineId(null);
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium ${
                      isActive ? 'bg-cyan-500/10 text-cyan-300 font-semibold' : 'text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className="text-[10px] font-mono">{item.badge}</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Tab View Content */}
          <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {activeTab === 'overview' && (
              <DashboardOverview
                onSelectMachine={handleSelectMachine}
                onNavigateTab={(tab) => {
                  setActiveTab(tab as any);
                  if (tab !== 'machines') setSelectedMachineId(null);
                }}
                onOpenAddMachine={() => setIsAddMachineOpen(true)}
              />
            )}

            {activeTab === 'machines' && (
              <MachinesView
                onNavigateTab={(tab) => setActiveTab(tab as any)}
                onOpenAddMachine={() => setIsAddMachineOpen(true)}
              />
            )}

            {activeTab === 'sensors' && <SensorsView />}

            {activeTab === 'anomalies' && (
              <AnomaliesView onSelectMachine={handleSelectMachine} />
            )}

            {activeTab === 'alerts' && (
              <AlertsView onSelectMachine={handleSelectMachine} />
            )}

            {activeTab === 'reports' && <ReportsView />}

            {activeTab === 'architecture' && <ArchitectureDocsView />}
          </div>
        </main>
      </div>

      {/* Global Anomaly Details Inspection Modal */}
      <AnomalyModal
        anomaly={selectedAnomaly}
        onClose={() => setSelectedAnomaly(null)}
        onResolve={resolveAnomaly}
        onViewMachine={handleSelectMachine}
      />

      {/* Add Machine / System Modal */}
      <AddMachineModal
        isOpen={isAddMachineOpen}
        onClose={() => setIsAddMachineOpen(false)}
        onMachineCreated={handleMachineCreated}
      />
    </div>
  );
};
