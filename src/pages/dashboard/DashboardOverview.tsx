import React from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Cpu,
  Plus,
  Play,
  Pause,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  XOctagon,
  Flame,
  Gauge
} from 'lucide-react';
import { useIoT } from '../../context/IoTContext';
import { TelemetryChart } from '../../components/TelemetryChart';

interface DashboardOverviewProps {
  onSelectMachine: (machineId: string) => void;
  onNavigateTab: (tab: string) => void;
  onOpenAddMachine: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onSelectMachine,
  onNavigateTab,
  onOpenAddMachine,
}) => {
  const {
    machines,
    alerts,
    anomalies,
    stats,
    setSelectedAnomaly,
    resolveAlert,
    isSimulating,
    toggleSimulation,
    startSimulation,
  } = useIoT();

  // Find reference machines:
  // Anomaly 1: Motor 02 (mach_02)
  const motor02 = machines.find(m => m.id === 'mach_02') || machines[1] || machines[0];
  // Anomaly 2: Rotary Compressor 05 (mach_05)
  const compressor05 = machines.find(m => m.id === 'mach_05') || machines[4] || machines[0];
  // Healthy Machine 1: CNC Machine 01 (mach_01)
  const cnc01 = machines.find(m => m.id === 'mach_01') || machines[0];
  // Healthy Machine 2: Hydraulic Pump 03 (mach_03)
  const pump03 = machines.find(m => m.id === 'mach_03') || machines[2] || machines[0];

  const activeAnomalies = anomalies.filter(a => a.status !== 'RESOLVED');

  return (
    <div className="space-y-6">
      {/* Top Header with Simulator and Add Machine Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Industrial Overview</h1>
            <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold font-mono border ${
              isSimulating
                ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-400'
                : 'bg-slate-800/80 border-slate-700 text-slate-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isSimulating ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              {isSimulating ? 'MONITORING ACTIVE (ALL MACHINES)' : 'SIMULATOR IDLE'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Continuous real-time telemetry processing across all connected machinery assets.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Prominent Start / Stop Simulator Button */}
          <button
            onClick={toggleSimulation}
            className={`px-4 py-2 font-bold text-xs rounded-lg shadow-sm transition-all flex items-center gap-2 ${
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

          {/* Add Machine Button */}
          <button
            onClick={onOpenAddMachine}
            className="px-3.5 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-xs rounded-lg shadow-sm shadow-cyan-400/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Machine/System</span>
          </button>
        </div>
      </div>

      {/* Simulator Inactive Banner (Call to Action) */}
      {!isSimulating && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-cyan-950/30 to-slate-900 border border-emerald-800/60 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shrink-0">
              <Play className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Simulator is Ready to Start</h3>
              <p className="text-slate-300 mt-0.5">
                Click <strong>Start Simulator</strong> to begin continuous multi-machine telemetry streaming. The engine will monitor all {machines.length} machines and detect the 2 anomalous machines while keeping all other systems normal.
              </p>
            </div>
          </div>
          <button
            onClick={startSimulation}
            className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs rounded-lg shadow-md transition-all shrink-0 flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Simulator Now</span>
          </button>
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Machines */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Monitored Systems</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="font-mono text-3xl font-bold text-white tabular-nums">
            {stats.totalMachines}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>All systems active</span>
            <span className="text-cyan-400 font-semibold">{stats.averageHealth}% Fleet Health</span>
          </div>
        </div>

        {/* Healthy Systems (All remaining machines are healthy!) */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Normal Health Systems</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-mono text-3xl font-bold text-emerald-400 tabular-nums">
            {stats.healthyCount}
          </div>
          <div className="text-[11px] text-emerald-500/80 mt-1">
            Operating in baseline limits
          </div>
        </div>

        {/* Detected Anomalies (Exactly 2 machines) */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Detected Anomalies</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-mono text-3xl font-bold text-amber-400 tabular-nums">
            {activeAnomalies.length}
          </div>
          <div className="text-[11px] text-amber-500/80 mt-1">
            Electric Motor 02 · Air Compressor 05
          </div>
        </div>

        {/* Critical Alerts */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Critical Failures</span>
            <XOctagon className="w-4 h-4 text-rose-400" />
          </div>
          <div className="font-mono text-3xl font-bold text-slate-200 tabular-nums">
            {stats.criticalCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            0 critical emergency stops
          </div>
        </div>
      </div>

      {/* Detected Anomalies Summary Panel (Highlights the 2 anomalous machines) */}
      <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/60 shadow-sm space-y-3 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-900/40 pb-2.5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-bold text-amber-200 text-sm">
              Machine Learning Telemetry: Exactly 2 Anomalies Detected
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Remaining {stats.healthyCount} machines are operating with normal health
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {activeAnomalies.slice(0, 2).map((anom) => (
            <div
              key={anom.id}
              onClick={() => setSelectedAnomaly(anom)}
              className="p-3 rounded-lg bg-slate-900/80 border border-amber-900/50 hover:border-amber-700 cursor-pointer transition-colors flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-xs">{anom.machineName}</span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {anom.severity}
                  </span>
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  <strong>{anom.parameter}:</strong> {anom.detectedValue} <span className="text-slate-400 font-mono">({anom.delta})</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5 truncate max-w-[280px]">
                  {anom.faultCategory}
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-semibold text-cyan-400 hover:text-cyan-300">
                  Inspect →
                </span>
                <div className="text-[10px] text-slate-400 font-mono mt-1">
                  Score: {anom.anomalyScore}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Telemetry Trend Curves */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Live Sensor Telemetry Streams (All Machines Monitored)
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              2 Anomalous Machines Shown Alongside Nominal Operating Baseline Systems
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('sensors')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
          >
            <span>Sensor Console</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Chart 1: Anomaly 1 - Motor 02 Vibration Spike */}
          <TelemetryChart
            data={motor02.history}
            metricKey="vibration"
            label={`1. Vibration RMS: ${motor02.name} [ANOMALY 1]`}
            unit="mm/s"
            strokeColor="#F59E0B"
            warningThreshold={motor02.thresholds.vibration.max}
            criticalThreshold={motor02.thresholds.vibration.criticalMax}
            height={130}
          />

          {/* Chart 2: Anomaly 2 - Rotary Compressor 05 Thermal Overheat */}
          <TelemetryChart
            data={compressor05.history}
            metricKey="temperature"
            label={`2. Temperature: ${compressor05.name} [ANOMALY 2]`}
            unit="°C"
            strokeColor="#EF4444"
            warningThreshold={compressor05.thresholds.temperature.max}
            criticalThreshold={compressor05.thresholds.temperature.criticalMax}
            height={130}
          />

          {/* Chart 3: Normal System 1 - CNC Machine 01 (Temperature: Normal) */}
          <TelemetryChart
            data={cnc01.history}
            metricKey="temperature"
            label={`3. Temperature: ${cnc01.name} [NORMAL SYSTEM]`}
            unit="°C"
            strokeColor="#38BDF8"
            warningThreshold={cnc01.thresholds.temperature.max}
            criticalThreshold={cnc01.thresholds.temperature.criticalMax}
            height={130}
          />

          {/* Chart 4: Normal System 2 - Hydraulic Pump 03 (Pressure: Normal) */}
          <TelemetryChart
            data={pump03.history}
            metricKey="pressure"
            label={`4. Hydraulic Pressure: ${pump03.name} [NORMAL SYSTEM]`}
            unit="bar"
            strokeColor="#10B981"
            warningThreshold={pump03.thresholds.pressure.min}
            criticalThreshold={pump03.thresholds.pressure.criticalMin}
            height={130}
          />
        </div>
      </div>

      {/* Connected Machines Fleet Table */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Machine Fleet Status</h3>
            <p className="text-xs text-slate-400">
              Monitoring all {machines.length} machines. 2 anomalous machines highlighted; all other systems healthy.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAddMachine}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Asset</span>
            </button>
            <button
              onClick={() => onNavigateTab('machines')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
            >
              <span>Manage Fleet ({machines.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-medium uppercase tracking-wider text-[11px]">
                <th className="py-3 px-5">Machine / System</th>
                <th className="py-3 px-4">Temperature</th>
                <th className="py-3 px-4">Vibration</th>
                <th className="py-3 px-4">Pressure</th>
                <th className="py-3 px-4">RPM</th>
                <th className="py-3 px-4">Health</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Anomaly Score</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono text-slate-200">
              {machines.map((machine) => {
                const isAnomalous = machine.status !== 'HEALTHY';
                const statusColor =
                  machine.status === 'HEALTHY'
                    ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                    : machine.status === 'WARNING'
                    ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                    : 'text-rose-400 border-rose-500/30 bg-rose-500/10';

                return (
                  <tr
                    key={machine.id}
                    onClick={() => onSelectMachine(machine.id)}
                    className={`hover:bg-slate-800/40 cursor-pointer transition-colors ${
                      isAnomalous ? 'bg-amber-950/10' : ''
                    }`}
                  >
                    <td className="py-3.5 px-5 font-sans font-medium text-white">
                      <div className="flex items-center gap-2">
                        <span>{machine.name}</span>
                        {isAnomalous && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold">
                            ANOMALY
                          </span>
                        )}
                        {machine.createdManually && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono">
                            Custom
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">{machine.type} · {machine.location}</div>
                    </td>
                    <td className="py-3.5 px-4 tabular-nums">
                      <span className={machine.id === 'mach_05' && isAnomalous ? 'text-amber-300 font-bold' : ''}>
                        {machine.temperature.toFixed(1)} {machine.thresholds.temperature.unit}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 tabular-nums">
                      <span className={machine.id === 'mach_02' && isAnomalous ? 'text-amber-300 font-bold' : ''}>
                        {machine.vibration.toFixed(2)} {machine.thresholds.vibration.unit}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 tabular-nums">
                      {machine.pressure.toFixed(1)} {machine.thresholds.pressure.unit}
                    </td>
                    <td className="py-3.5 px-4 tabular-nums">
                      {machine.rpm}
                    </td>
                    <td className="py-3.5 px-4 tabular-nums">
                      <span className={`font-semibold ${isAnomalous ? 'text-amber-300' : 'text-emerald-400'}`}>
                        {machine.healthScore}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${statusColor}`}>
                        {machine.status === 'HEALTHY' ? 'Normal' : machine.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 tabular-nums">
                      <span className={`font-semibold ${machine.anomalyScore > 50 ? 'text-amber-400' : 'text-slate-400'}`}>
                        {machine.anomalyScore}%
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right font-sans">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectMachine(machine.id);
                        }}
                        className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        Inspect →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
