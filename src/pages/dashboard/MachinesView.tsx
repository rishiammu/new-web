import React, { useState } from 'react';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Cpu,
  Flame,
  Gauge,
  Plus,
  Play,
  Pause,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Trash2,
  Zap,
  Wrench
} from 'lucide-react';
import { useIoT } from '../../context/IoTContext';
import { TelemetryChart } from '../../components/TelemetryChart';
import { Machine } from '../../types';

interface MachinesViewProps {
  onNavigateTab: (tab: string) => void;
  onOpenAddMachine: () => void;
}

export const MachinesView: React.FC<MachinesViewProps> = ({ onNavigateTab, onOpenAddMachine }) => {
  const {
    machines,
    selectedMachineId,
    setSelectedMachineId,
    selectedMachine,
    triggerFaultNow,
    clearActiveFault,
    simulationFault,
    faultTargetMachineId,
    deleteMachine,
    isSimulating,
    toggleSimulation,
    startSimulation,
  } = useIoT();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'HEALTHY' | 'WARNING' | 'CRITICAL'>('ALL');

  const filteredMachines = machines.filter(m => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Machine Details Drill-Down View
  if (selectedMachine) {
    const m = selectedMachine;
    const t = m.thresholds;
    const statusColor =
      m.status === 'HEALTHY'
        ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
        : m.status === 'WARNING'
        ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
        : 'text-rose-400 border-rose-500/30 bg-rose-500/10';

    const isCurrentFaultTarget = simulationFault !== 'NONE' && faultTargetMachineId === m.id;

    return (
      <div className="space-y-6">
        {/* Navigation Breadcrumb & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => setSelectedMachineId(null)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Machines</span>
          </button>

          <div className="flex items-center gap-2">
            {/* Quick Fault Injection for this specific machine */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
              <span className="text-slate-400 text-[11px] px-1 hidden sm:inline">Simulate Fault:</span>
              <button
                onClick={() => triggerFaultNow('VIBRATION_SPIKE', m.id, 25)}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 text-slate-300 text-[11px] transition-colors"
              >
                Vibration Spike
              </button>
              <button
                onClick={() => triggerFaultNow('THERMAL_RUNAWAY', m.id, 25)}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-amber-950/60 hover:text-amber-300 text-slate-300 text-[11px] transition-colors"
              >
                Thermal Overheat
              </button>
              <button
                onClick={() => triggerFaultNow('PRESSURE_DROP', m.id, 25)}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-purple-950/60 hover:text-purple-300 text-slate-300 text-[11px] transition-colors"
              >
                Pressure Drop
              </button>
              {isCurrentFaultTarget && (
                <button
                  onClick={clearActiveFault}
                  className="px-2 py-1 rounded bg-cyan-950 text-cyan-300 text-[11px] font-semibold border border-cyan-800"
                >
                  Clear
                </button>
              )}
            </div>

            <button
              onClick={() => onNavigateTab('anomalies')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>View Anomalies</span>
            </button>

            {m.createdManually && (
              <button
                onClick={() => deleteMachine(m.id)}
                className="p-2 text-slate-400 hover:text-rose-400 bg-slate-800 hover:bg-rose-950/50 rounded-lg border border-slate-700 transition-colors"
                title="Remove Machine"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Machine Header */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
                <img
                  src="/src/assets/images/industrial_machine_cnc_1790870095504.jpg"
                  alt={m.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center -z-10 text-cyan-400">
                  <Cpu className="w-8 h-8" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight text-white">{m.name}</h1>
                  <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider border ${statusColor}`}>
                    {m.status}
                  </span>
                  {isCurrentFaultTarget && (
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500 text-rose-300 text-[10px] font-mono font-bold animate-pulse">
                      FAULT ACTIVE
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 mt-1 font-mono">
                  {m.type} · Location: {m.location}
                </div>
              </div>
            </div>

            {/* Health Score & Anomaly Probability */}
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-xs text-slate-400 uppercase tracking-wider">Health Score</div>
                <div className="font-mono text-3xl font-bold text-cyan-300 tabular-nums">
                  {m.healthScore}%
                </div>
              </div>
              <div className="text-right pl-6 border-l border-slate-800">
                <div className="text-xs text-slate-400 uppercase tracking-wider">Anomaly Probability</div>
                <div className={`font-mono text-3xl font-bold tabular-nums ${m.anomalyScore > 50 ? 'text-amber-400' : 'text-slate-300'}`}>
                  {m.anomalyScore}%
                </div>
              </div>
            </div>
          </div>

          {/* Current Live Sensor Values vs Configured Baseline Limits */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
            {/* Temperature */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Temperature</span>
              </div>
              <div className="font-mono text-2xl font-bold text-white tabular-nums">
                {m.temperature.toFixed(1)} <span className="text-xs font-normal text-slate-400 font-sans">{t.temperature.unit}</span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                Range: {t.temperature.min} – {t.temperature.max} {t.temperature.unit}
              </div>
            </div>

            {/* Vibration */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>Vibration (RMS)</span>
              </div>
              <div className="font-mono text-2xl font-bold text-white tabular-nums">
                {m.vibration.toFixed(2)} <span className="text-xs font-normal text-slate-400 font-sans">{t.vibration.unit}</span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                Threshold: ≤ {t.vibration.max} {t.vibration.unit}
              </div>
            </div>

            {/* Pressure */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pressure</span>
              </div>
              <div className="font-mono text-2xl font-bold text-white tabular-nums">
                {m.pressure.toFixed(1)} <span className="text-xs font-normal text-slate-400 font-sans">{t.pressure.unit}</span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                Normal: {t.pressure.min} – {t.pressure.max} {t.pressure.unit}
              </div>
            </div>

            {/* RPM / Current */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                <span>Rotor Velocity</span>
              </div>
              <div className="font-mono text-2xl font-bold text-white tabular-nums">
                {m.rpm} <span className="text-xs font-normal text-slate-400 font-sans">RPM</span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                Current: {m.current ? `${m.current.toFixed(1)} A` : 'Nominal'}
              </div>
            </div>
          </div>
        </div>

        {/* Machine Historical Charts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Sensor Telemetry Waveforms (Live Feed)
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              Calibrated against configured machine envelope
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TelemetryChart
              data={m.history}
              metricKey="temperature"
              label={`Temperature History (${t.temperature.unit})`}
              unit={t.temperature.unit}
              strokeColor="#38BDF8"
              warningThreshold={t.temperature.max}
              criticalThreshold={t.temperature.criticalMax}
              height={140}
            />

            <TelemetryChart
              data={m.history}
              metricKey="vibration"
              label={`Vibration History (${t.vibration.unit})`}
              unit={t.vibration.unit}
              strokeColor="#F59E0B"
              warningThreshold={t.vibration.max}
              criticalThreshold={t.vibration.criticalMax}
              height={140}
            />

            <TelemetryChart
              data={m.history}
              metricKey="pressure"
              label={`Hydraulic Pressure History (${t.pressure.unit})`}
              unit={t.pressure.unit}
              strokeColor="#10B981"
              warningThreshold={t.pressure.min}
              criticalThreshold={t.pressure.criticalMin}
              height={140}
            />

            <TelemetryChart
              data={m.history}
              metricKey="rpm"
              label="Rotor RPM Telemetry"
              unit="RPM"
              strokeColor="#A855F7"
              height={140}
            />
          </div>
        </div>
      </div>
    );
  }

  // Machines Fleet List View
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Machine Monitoring</h1>
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold font-mono border ${
              isSimulating
                ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-400'
                : 'bg-slate-800/80 border-slate-700 text-slate-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isSimulating ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              {isSimulating ? 'LIVE STREAMING ALL' : 'SIMULATOR IDLE'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Active multi-channel telemetry across all {machines.length} machines. 2 anomalous machines flagged; remaining {Math.max(0, machines.length - 2)} systems operating normally.
          </p>
        </div>

        {/* Action button + Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Start / Stop Simulator Button */}
          <button
            onClick={toggleSimulation}
            className={`px-3 py-1.5 font-bold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1.5 ${
              isSimulating
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25 animate-pulse'
            }`}
          >
            {isSimulating ? (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-400" />
                <span>Stop Simulator</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Simulator</span>
              </>
            )}
          </button>

          <button
            onClick={onOpenAddMachine}
            className="px-3 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Machine/System</span>
          </button>

          <input
            type="text"
            placeholder="Search machines..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />

          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
            {(['ALL', 'HEALTHY', 'WARNING', 'CRITICAL'] as const).map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  statusFilter === f
                    ? 'bg-slate-800 text-cyan-300 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Machine Fleet Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMachines.map(machine => {
          const statusColor =
            machine.status === 'HEALTHY'
              ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
              : machine.status === 'WARNING'
              ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
              : 'text-rose-400 border-rose-500/30 bg-rose-500/10';

          return (
            <div
              key={machine.id}
              onClick={() => setSelectedMachineId(machine.id)}
              className="bg-[#0F172A] border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-sm cursor-pointer transition-all hover:-translate-y-0.5 group"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {machine.name}
                      </h3>
                      {machine.createdManually && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono">
                          Custom
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">{machine.type}</div>
                  </div>
                </div>

                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${statusColor}`}>
                  {machine.status}
                </span>
              </div>

              {/* Telemetry Quick Grid */}
              <div className="grid grid-cols-3 gap-2 py-2 mb-3 text-xs bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60 font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block">TEMP</span>
                  <span className="font-semibold text-slate-200 tabular-nums">
                    {machine.temperature.toFixed(1)} {machine.thresholds.temperature.unit}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">VIBRATION</span>
                  <span className="font-semibold text-slate-200 tabular-nums">
                    {machine.vibration.toFixed(2)} {machine.thresholds.vibration.unit}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">PRESSURE</span>
                  <span className="font-semibold text-slate-200 tabular-nums">
                    {machine.pressure.toFixed(1)} {machine.thresholds.pressure.unit}
                  </span>
                </div>
              </div>

              {/* Health Score Bar */}
              <div className="space-y-1.5 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Machine Health</span>
                  <span className="font-mono font-semibold text-cyan-300 tabular-nums">{machine.healthScore}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      machine.healthScore > 80
                        ? 'bg-emerald-400'
                        : machine.healthScore > 60
                        ? 'bg-amber-400'
                        : 'bg-rose-400'
                    }`}
                    style={{ width: `${machine.healthScore}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                <span className="text-[11px] text-slate-500 font-mono">{machine.location}</span>
                <span className="text-xs font-semibold text-cyan-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  Inspect Details <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
