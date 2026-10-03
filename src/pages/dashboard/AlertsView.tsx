import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Mail, Cpu, Check, Send, Search, CheckCheck, Play, Pause } from 'lucide-react';
import { useIoT } from '../../context/IoTContext';
import { AlertRecord } from '../../types';

interface AlertsViewProps {
  onSelectMachine: (machineId: string) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({ onSelectMachine }) => {
  const { alerts, resolveAlert, emailDispatches, isSimulating, toggleSimulation } = useIoT();
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'RESOLVED' | 'ALL'>('ACTIVE');
  const [search, setSearch] = useState('');
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionInput, setResolutionInput] = useState('');

  const activeAlerts = alerts.filter(a => a.status !== 'RESOLVED');
  const resolvedAlerts = alerts.filter(a => a.status === 'RESOLVED');

  const filteredAlerts = alerts.filter(a => {
    const matchesTab =
      activeTab === 'ALL'
        ? true
        : activeTab === 'ACTIVE'
        ? a.status !== 'RESOLVED'
        : a.status === 'RESOLVED';

    const matchesSearch =
      a.machineName.toLowerCase().includes(search.toLowerCase()) ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.message.toLowerCase().includes(search.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const handleConfirmResolve = (alertId: string) => {
    resolveAlert(alertId, resolutionInput || 'Maintenance technician verified sensor within baseline.');
    setResolvingId(null);
    setResolutionInput('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Alert Center</h1>
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold font-mono border ${
              isSimulating
                ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-400'
                : 'bg-slate-800/80 border-slate-700 text-slate-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isSimulating ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              {isSimulating ? 'ACTIVE MONITORING (ALL FLEET)' : 'SIMULATOR IDLE'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated alerts tracking 2 anomalous assets (Motor 02, Rotary Compressor 05); all remaining machines normal.
          </p>
        </div>

        {/* Simulator Button & Tab switch */}
        <div className="flex flex-wrap items-center gap-2">
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

          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setActiveTab('ACTIVE')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                activeTab === 'ACTIVE'
                  ? 'bg-amber-950/60 text-amber-300 font-semibold border border-amber-800/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Active Alerts ({activeAlerts.length})
            </button>
            <button
              onClick={() => setActiveTab('RESOLVED')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                activeTab === 'RESOLVED'
                  ? 'bg-emerald-950/60 text-emerald-300 font-semibold border border-emerald-800/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Resolved ({resolvedAlerts.length})
            </button>
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                activeTab === 'ALL'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({alerts.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Alerts Feed */}
        <div className="lg:col-span-8 space-y-4">
          {filteredAlerts.length === 0 ? (
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-10 text-center text-slate-400 text-xs">
              <CheckCheck className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
              <div className="text-sm font-semibold text-slate-200">No Alerts in Current View</div>
              <p className="text-slate-500 mt-1">All industrial operations are running within nominal limits.</p>
            </div>
          ) : (
            filteredAlerts.map(alert => {
              const isResolved = alert.status === 'RESOLVED';
              const isCritical = alert.status === 'CRITICAL';
              const isResolvingThis = resolvingId === alert.id;

              return (
                <div
                  key={alert.id}
                  className={`bg-[#0F172A] border rounded-2xl p-5 transition-all shadow-sm ${
                    isResolved
                      ? 'border-slate-800 opacity-80'
                      : isCritical
                      ? 'border-rose-800/60 shadow-rose-950/10'
                      : 'border-amber-800/60 shadow-amber-950/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-800/70 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          isResolved
                            ? 'bg-slate-800 text-slate-400'
                            : isCritical
                            ? 'bg-rose-950/80 text-rose-400 border border-rose-800'
                            : 'bg-amber-950/80 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {isResolved ? (
                          <CheckCircle className="w-5 h-5 text-emerald-400" />
                        ) : isCritical ? (
                          <AlertCircle className="w-5 h-5" />
                        ) : (
                          <AlertTriangle className="w-5 h-5" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            {alert.machineName}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">· {alert.timestamp}</span>
                        </div>
                        <h3 className="text-base font-bold text-white mt-0.5">{alert.title}</h3>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider border ${
                          isResolved
                            ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                            : isCritical
                            ? 'text-rose-400 border-rose-500/30 bg-rose-500/10'
                            : 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                        }`}
                      >
                        {alert.status}
                      </span>
                      <div className="text-[11px] font-mono text-slate-400 mt-1">
                        Score: <span className="font-bold text-cyan-300">{alert.anomalyScore}%</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                    {alert.message}
                  </p>

                  {/* Recommended Action Box */}
                  <div className="mb-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                    <span className="text-cyan-400 font-semibold uppercase tracking-wider text-[11px] block mb-0.5">
                      Recommended Action:
                    </span>
                    <span className="text-slate-300">{alert.recommendedAction}</span>
                  </div>

                  {/* Quick Resolution Inline Form */}
                  {isResolvingThis && (
                    <div className="mb-4 p-3 rounded-xl bg-slate-900 border border-slate-700 space-y-2">
                      <label className="block text-[11px] text-slate-300 font-medium">
                        Engineer Resolution Notes:
                      </label>
                      <input
                        type="text"
                        autoFocus
                        value={resolutionInput}
                        onChange={e => setResolutionInput(e.target.value)}
                        placeholder="e.g. Visual inspection performed; bearing lubricated; vibration stabilized."
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                      />
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          onClick={() => setResolvingId(null)}
                          className="px-3 py-1 text-slate-400 hover:text-slate-200 text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleConfirmResolve(alert.id)}
                          className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-md shadow-sm"
                        >
                          Confirm & Resolve
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Actions & Resolution status */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectMachine(alert.machineId)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
                      >
                        <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                        <span>View Machine Telemetry</span>
                      </button>

                      {alert.emailDispatched && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono pl-1">
                          <Mail className="w-3 h-3 text-cyan-400" />
                          <span>Dispatched via Spring Mail</span>
                        </div>
                      )}
                    </div>

                    {!isResolved ? (
                      !isResolvingThis && (
                        <button
                          onClick={() => setResolvingId(alert.id)}
                          className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Mark as Resolved</span>
                        </button>
                      )
                    ) : (
                      <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Resolved by {alert.resolvedBy || 'Operations Lead'} ({alert.resolvedAt || 'Recently'})</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Spring Mail Notification Simulator Feed */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Mail className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Spring Mail Relay</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Outbound SMTP relay log. Alerts are sent to plant on-call maintenance engineers.
            </p>

            <div className="space-y-3 font-mono text-[11px]">
              {emailDispatches.map(mail => (
                <div key={mail.id} className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Send className="w-3 h-3" /> SENT
                    </span>
                    <span>{mail.timestamp}</span>
                  </div>
                  <div className="text-cyan-300 font-semibold font-sans text-xs">
                    {mail.subject}
                  </div>
                  <div className="text-slate-500 truncate">
                    To: {mail.recipient}
                  </div>
                  <div className="text-slate-400 text-[10px] whitespace-pre-line pt-1 border-t border-slate-800 font-mono">
                    {mail.body.slice(0, 130)}...
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
