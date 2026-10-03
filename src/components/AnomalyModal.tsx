import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle, ArrowRight, ShieldAlert, Cpu, Activity, Clock, Wrench } from 'lucide-react';
import { AnomalyRecord } from '../types';
import { useIoT } from '../context/IoTContext';
import { TelemetryChart } from './TelemetryChart';

interface AnomalyModalProps {
  anomaly: AnomalyRecord | null;
  onClose: () => void;
  onResolve: (id: string, notes?: string) => void;
  onViewMachine: (machineId: string) => void;
}

export const AnomalyModal: React.FC<AnomalyModalProps> = ({
  anomaly,
  onClose,
  onResolve,
  onViewMachine,
}) => {
  const { machines } = useIoT();
  const [resolutionNote, setResolutionNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!anomaly) return null;

  const targetMachine = machines.find(m => m.id === anomaly.machineId);

  const severityColor =
    anomaly.severity === 'CRITICAL'
      ? 'text-rose-400 border-rose-500/30 bg-rose-500/10'
      : anomaly.severity === 'HIGH'
      ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
      : 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';

  const handleResolveSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onResolve(anomaly.id, resolutionNote || 'Inspection completed. Physical telemetry verified within nominal envelope.');
      setIsSubmitting(false);
      onClose();
    }, 200);
  };

  // Determine chart metric
  const chartMetricKey =
    anomaly.parameter === 'Vibration'
      ? 'vibration'
      : anomaly.parameter === 'Pressure'
      ? 'pressure'
      : anomaly.parameter === 'RPM'
      ? 'rpm'
      : 'temperature';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0F172A] border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-800">
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-cyan-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Incident Diagnostic · {anomaly.time}
              </span>
              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${severityColor}`}>
                {anomaly.severity}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight mt-0.5">{anomaly.machineName}</h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{anomaly.faultCategory}</p>
          </div>
        </div>

        {/* Expected vs Actual Comparison Panel */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 px-4 bg-slate-900/80 rounded-xl border border-slate-800 mb-5 text-xs">
          <div>
            <span className="text-slate-500 uppercase tracking-wider text-[10px] block mb-0.5">Detected Value</span>
            <span className="font-mono text-base font-bold text-rose-300 tabular-nums">{anomaly.detectedValue}</span>
          </div>
          <div>
            <span className="text-slate-500 uppercase tracking-wider text-[10px] block mb-0.5">Expected Normal</span>
            <span className="font-mono text-sm font-semibold text-slate-200 tabular-nums">{anomaly.expectedRange}</span>
          </div>
          <div>
            <span className="text-slate-500 uppercase tracking-wider text-[10px] block mb-0.5">Nominal Setpoint</span>
            <span className="font-mono text-sm font-semibold text-cyan-300 tabular-nums">{anomaly.baselineValue}</span>
          </div>
          <div>
            <span className="text-slate-500 uppercase tracking-wider text-[10px] block mb-0.5">Anomaly Probability</span>
            <span className="font-mono text-base font-bold text-cyan-400 tabular-nums">{anomaly.anomalyScore}%</span>
          </div>
        </div>

        {/* What Changed / Deviation Description */}
        <div className="mb-4 p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs">
          <div className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            <span>Telemetry Deviation Variance</span>
          </div>
          <p className="text-slate-200 font-mono">
            {anomaly.delta}
          </p>
        </div>

        {/* Historical Telemetry Curve for Affected Sensor */}
        {targetMachine && targetMachine.history.length > 0 && (
          <div className="mb-4">
            <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Telemetry Waveform ({anomaly.parameter})</span>
              <span className="text-slate-500 font-mono text-[10px]">Real-time trace</span>
            </div>
            <TelemetryChart
              data={targetMachine.history}
              metricKey={chartMetricKey}
              label={`${anomaly.machineName} - ${anomaly.parameter} Stream`}
              unit={chartMetricKey === 'vibration' ? 'mm/s' : chartMetricKey === 'pressure' ? 'bar' : chartMetricKey === 'rpm' ? 'RPM' : '°C'}
              strokeColor={anomaly.severity === 'CRITICAL' ? '#EF4444' : '#F59E0B'}
              height={120}
            />
          </div>
        )}

        {/* Contributing Diagnostic Observations */}
        <div className="mb-4">
          <h4 className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Automated Diagnostic Observations
          </h4>
          <ul className="space-y-1.5 text-xs">
            {anomaly.contributingFactors.map((factor, idx) => (
              <li key={idx} className="flex items-start gap-2 text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommended Action Checklist */}
        <div className="mb-5 p-3.5 bg-cyan-950/20 border border-cyan-800/40 rounded-xl">
          <div className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5" />
            <span>Recommended Maintenance Intervention</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            {anomaly.recommendedAction}
          </p>
        </div>

        {/* Resolution Notes Input (if open) */}
        {anomaly.status !== 'RESOLVED' ? (
          <div className="mb-5 p-3 bg-slate-900/70 border border-slate-800 rounded-xl">
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              Resolution / Maintenance Notes (Optional):
            </label>
            <input
              type="text"
              value={resolutionNote}
              onChange={e => setResolutionNote(e.target.value)}
              placeholder="e.g. Bearing race greased and dynamic harmonic balance verified nominal."
              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        ) : (
          <div className="mb-5 p-3 bg-emerald-950/30 border border-emerald-800/50 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Resolved by {anomaly.resolvedBy || 'Operations Lead'} ({anomaly.resolvedAt || 'Recently'})</span>
            </div>
            {anomaly.resolutionNotes && (
              <span className="text-[11px] text-slate-400 italic font-mono">"{anomaly.resolutionNotes}"</span>
            )}
          </div>
        )}

        {/* Actions Footer */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={() => {
              onViewMachine(anomaly.machineId);
              onClose();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>View Asset Telemetry</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {anomaly.status !== 'RESOLVED' ? (
            <button
              onClick={handleResolveSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Resolving Incident...' : 'Acknowledge & Mark as Resolved'}</span>
            </button>
          ) : (
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Incident Closed
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
