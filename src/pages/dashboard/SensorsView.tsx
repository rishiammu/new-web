import React, { useState } from 'react';
import { Activity, Flame, Gauge, TrendingUp, Cpu, CheckCircle2, AlertTriangle, ArrowUpRight, ArrowDownRight, Play, Pause } from 'lucide-react';
import { useIoT } from '../../context/IoTContext';
import { TelemetryChart } from '../../components/TelemetryChart';

export const SensorsView: React.FC = () => {
  const { machines, isSimulating, toggleSimulation } = useIoT();
  const [selectedMachineId, setSelectedMachineId] = useState<string>(machines[0]?.id || 'mach_01');

  const currentMachine = machines.find(m => m.id === selectedMachineId) || machines[0];

  if (!currentMachine) {
    return (
      <div className="p-8 text-center text-slate-400">
        No sensor stream available.
      </div>
    );
  }

  // Derive trends from history
  const history = currentMachine.history || [];
  const prevReading = history.length > 1 ? history[history.length - 2] : null;

  const tempTrend = prevReading ? (currentMachine.temperature - prevReading.temperature) : 0;
  const vibTrend = prevReading ? (currentMachine.vibration - prevReading.vibration) : 0;
  const presTrend = prevReading ? (currentMachine.pressure - prevReading.pressure) : 0;
  const rpmTrend = prevReading ? (currentMachine.rpm - prevReading.rpm) : 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Sensor Telemetry</h1>
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold font-mono border ${
              isSimulating
                ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-400'
                : 'bg-slate-800/80 border-slate-700 text-slate-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isSimulating ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              {isSimulating ? 'STREAMING ALL ASSETS' : 'SIMULATOR IDLE'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Continuous multi-channel telemetry streams across all {machines.length} assets. Exactly 2 anomalous machines flagged; all remaining systems normal.
          </p>
        </div>

        {/* Machine Selector & Simulator Button */}
        <div className="flex items-center gap-2.5">
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

          <span className="text-xs text-slate-400">Asset:</span>
          <select
            value={selectedMachineId}
            onChange={(e) => setSelectedMachineId(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-cyan-300 font-semibold focus:outline-none focus:border-cyan-500"
          >
            {machines.map(m => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4 Sensor Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sensor 1: Temperature */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Temperature</span>
            </span>
            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${
              currentMachine.temperature > currentMachine.thresholds.temperature.max
                ? 'text-rose-400 border-rose-500/30 bg-rose-500/10'
                : 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
            }`}>
              {currentMachine.temperature > currentMachine.thresholds.temperature.max ? 'ELEVATED' : 'NOMINAL'}
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div className="font-mono text-3xl font-bold text-white tabular-nums">
              {currentMachine.temperature.toFixed(1)} <span className="text-sm font-normal text-slate-400">{currentMachine.thresholds.temperature.unit}</span>
            </div>
            <div className={`flex items-center text-xs font-mono tabular-nums ${
              tempTrend > 0 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {tempTrend >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              <span>{Math.abs(tempTrend).toFixed(1)}{currentMachine.thresholds.temperature.unit}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono">
            <span>Range: {currentMachine.thresholds.temperature.min}–{currentMachine.thresholds.temperature.max} {currentMachine.thresholds.temperature.unit}</span>
            <span>{currentMachine.lastUpdated}</span>
          </div>
        </div>

        {/* Sensor 2: Vibration */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Vibration (RMS)</span>
            </span>
            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${
              currentMachine.vibration > currentMachine.thresholds.vibration.max
                ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                : 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
            }`}>
              {currentMachine.vibration > currentMachine.thresholds.vibration.max ? 'ELEVATED' : 'NOMINAL'}
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div className="font-mono text-3xl font-bold text-white tabular-nums">
              {currentMachine.vibration.toFixed(2)} <span className="text-sm font-normal text-slate-400">{currentMachine.thresholds.vibration.unit}</span>
            </div>
            <div className={`flex items-center text-xs font-mono tabular-nums ${
              vibTrend > 0 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {vibTrend >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              <span>{Math.abs(vibTrend).toFixed(2)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono">
            <span>Limit: ≤ {currentMachine.thresholds.vibration.max} {currentMachine.thresholds.vibration.unit}</span>
            <span>{currentMachine.lastUpdated}</span>
          </div>
        </div>

        {/* Sensor 3: Pressure */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-emerald-400" />
              <span>Pressure</span>
            </span>
            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${
              currentMachine.pressure < currentMachine.thresholds.pressure.min
                ? 'text-rose-400 border-rose-500/30 bg-rose-500/10'
                : 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
            }`}>
              {currentMachine.pressure < currentMachine.thresholds.pressure.min ? 'LOW PRESS' : 'NOMINAL'}
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div className="font-mono text-3xl font-bold text-white tabular-nums">
              {currentMachine.pressure.toFixed(1)} <span className="text-sm font-normal text-slate-400">{currentMachine.thresholds.pressure.unit}</span>
            </div>
            <div className={`flex items-center text-xs font-mono tabular-nums ${
              presTrend < 0 ? 'text-rose-400' : 'text-emerald-400'
            }`}>
              {presTrend >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              <span>{Math.abs(presTrend).toFixed(1)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono">
            <span>Envelope: {currentMachine.thresholds.pressure.min}–{currentMachine.thresholds.pressure.max} {currentMachine.thresholds.pressure.unit}</span>
            <span>{currentMachine.lastUpdated}</span>
          </div>
        </div>

        {/* Sensor 4: RPM */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>Rotational Speed</span>
            </span>
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold border text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
              STABLE
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div className="font-mono text-3xl font-bold text-white tabular-nums">
              {currentMachine.rpm} <span className="text-sm font-normal text-slate-400">RPM</span>
            </div>
            <div className="flex items-center text-xs font-mono tabular-nums text-slate-400">
              <span>{rpmTrend >= 0 ? `+${rpmTrend}` : rpmTrend}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono">
            <span>Spindle Tachometer</span>
            <span>{currentMachine.lastUpdated}</span>
          </div>
        </div>
      </div>

      {/* Sensor Waveforms / Charts */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
          Telemetry Streams: {currentMachine.name}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TelemetryChart
            data={currentMachine.history}
            metricKey="temperature"
            label="Thermal Channel (Core Winding)"
            unit="°C"
            strokeColor="#38BDF8"
            warningThreshold={75}
            criticalThreshold={85}
            height={140}
          />

          <TelemetryChart
            data={currentMachine.history}
            metricKey="vibration"
            label="Accelerometric Vibration Channel"
            unit="mm/s"
            strokeColor="#F59E0B"
            warningThreshold={5.0}
            criticalThreshold={7.0}
            height={140}
          />

          <TelemetryChart
            data={currentMachine.history}
            metricKey="pressure"
            label="Piezoelectric Hydraulic Pressure"
            unit="bar"
            strokeColor="#10B981"
            warningThreshold={5.0}
            criticalThreshold={3.5}
            height={140}
          />

          <TelemetryChart
            data={currentMachine.history}
            metricKey="rpm"
            label="Rotational Velocity (RPM)"
            unit="RPM"
            strokeColor="#818CF8"
            height={140}
          />
        </div>
      </div>
    </div>
  );
};
