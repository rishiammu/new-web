import React from 'react';
import { Activity, Play, Pause, Flame, Gauge, Zap, RotateCcw, AlertTriangle, Cpu, Radio } from 'lucide-react';
import { useIoT } from '../context/IoTContext';
import { SimulationFaultType } from '../types';

export const SimulationControlBar: React.FC = () => {
  const {
    machines,
    isSimulating,
    startSimulation,
    stopSimulation,
    toggleSimulation,
    simulationFault,
    faultTargetMachineId,
    setFaultTargetMachineId,
    faultSecondsRemaining,
    triggerFaultNow,
    clearActiveFault,
  } = useIoT();

  const targetMachine = machines.find(m => m.id === faultTargetMachineId) || machines[0];

  return (
    <div className={`border-b transition-colors px-4 py-2.5 text-xs ${
      isSimulating
        ? 'bg-[#0B1322] border-cyan-900/60 text-slate-200'
        : 'bg-[#10141F] border-slate-800 text-slate-400'
    }`}>
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Prominent Start / Stop Simulator Button & Status */}
        <div className="flex items-center flex-wrap gap-3">
          <button
            onClick={toggleSimulation}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md ${
              isSimulating
                ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/50'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25 animate-pulse'
            }`}
          >
            {isSimulating ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Stop Simulator</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Start Simulator</span>
              </>
            )}
          </button>

          {/* Running State Badge */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              {isSimulating && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isSimulating ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
            </span>

            <div className="text-[11px] font-mono">
              {isSimulating ? (
                <span className="text-emerald-300 font-semibold flex items-center gap-1.5">
                  <span>LIVE MONITORING ACTIVE</span>
                  <span className="text-slate-400 font-normal">· Streaming all {machines.length} machines</span>
                </span>
              ) : (
                <span className="text-slate-400">
                  SIMULATOR IDLE · Click <strong className="text-white font-semibold">Start Simulator</strong> to run telemetry
                </span>
              )}
            </div>
          </div>

          {/* Realism Badge: 2 Anomalies Monitored, Remaining Systems Normal */}
          <div className="hidden xl:flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900/80 border border-slate-800 text-[11px]">
            <span className="text-amber-400 font-medium">2 Anomalies Detected</span>
            <span className="text-slate-500">·</span>
            <span className="text-emerald-400 font-medium">{Math.max(0, machines.length - 2)} Systems Normal</span>
          </div>

          {/* Target Asset Picker */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-md px-2 py-1 text-xs">
            <span className="text-[11px] text-slate-400">Target Asset:</span>
            <select
              value={faultTargetMachineId}
              onChange={(e) => setFaultTargetMachineId(e.target.value)}
              className="bg-transparent text-cyan-300 font-medium text-xs focus:outline-none cursor-pointer"
            >
              {machines.map(m => (
                <option key={m.id} value={m.id} className="bg-slate-900 text-slate-200">
                  {m.name} ({m.status})
                </option>
              ))}
            </select>
          </div>

          {/* Active injected fault status banner */}
          {simulationFault !== 'NONE' && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-950/70 border border-amber-800/70 text-amber-300 text-[11px] animate-pulse">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              <span>Fault Active on {targetMachine?.name} ({faultSecondsRemaining}s left)</span>
            </div>
          )}
        </div>

        {/* Right: Quick Injected Fault Triggers */}
        <div className="flex items-center flex-wrap gap-1.5">
          <span className="text-[11px] text-slate-400 hidden lg:inline mr-1">Inject Fault:</span>

          <button
            onClick={() => triggerFaultNow('VIBRATION_SPIKE', faultTargetMachineId, 25)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors border ${
              simulationFault === 'VIBRATION_SPIKE'
                ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-semibold shadow-sm'
                : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-300'
            }`}
            title={`Inject bearing vibration spike into ${targetMachine?.name}`}
          >
            <Activity className="w-3.5 h-3.5 text-rose-400" />
            <span>Vibration Spike</span>
          </button>

          <button
            onClick={() => triggerFaultNow('THERMAL_RUNAWAY', faultTargetMachineId, 25)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors border ${
              simulationFault === 'THERMAL_RUNAWAY'
                ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold shadow-sm'
                : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-300'
            }`}
            title={`Inject thermal runaway overheat into ${targetMachine?.name}`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Thermal Overheat</span>
          </button>

          <button
            onClick={() => triggerFaultNow('PRESSURE_DROP', faultTargetMachineId, 25)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors border ${
              simulationFault === 'PRESSURE_DROP'
                ? 'bg-purple-500/20 border-purple-500 text-purple-300 font-semibold shadow-sm'
                : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-300'
            }`}
            title={`Drop hydraulic line pressure in ${targetMachine?.name}`}
          >
            <Gauge className="w-3.5 h-3.5 text-purple-400" />
            <span>Pressure Drop</span>
          </button>

          {/* Reset / Clear fault */}
          {simulationFault !== 'NONE' && (
            <button
              onClick={clearActiveFault}
              className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-medium"
              title="Reset target machine to nominal baseline"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear Fault</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
