import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, Search, Filter, Clock, Archive, Play, Pause } from 'lucide-react';
import { useIoT } from '../../context/IoTContext';
import { AnomalySeverity, AnomalyRecord } from '../../types';

interface AnomaliesViewProps {
  onSelectMachine: (machineId: string) => void;
}

export const AnomaliesView: React.FC<AnomaliesViewProps> = ({ onSelectMachine }) => {
  const { anomalies, setSelectedAnomaly, machines, stats, isSimulating, toggleSimulation } = useIoT();
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'RESOLVED' | 'ALL'>('ACTIVE');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const activeCount = anomalies.filter(a => a.status !== 'RESOLVED').length;
  const resolvedCount = anomalies.filter(a => a.status === 'RESOLVED').length;

  const filtered = anomalies.filter(a => {
    const matchesTab =
      activeTab === 'ALL'
        ? true
        : activeTab === 'ACTIVE'
        ? a.status !== 'RESOLVED'
        : a.status === 'RESOLVED';

    const matchesSev = filterSeverity === 'ALL' || a.severity === filterSeverity;
    const matchesSearch =
      a.machineName.toLowerCase().includes(search.toLowerCase()) ||
      a.parameter.toLowerCase().includes(search.toLowerCase()) ||
      a.faultCategory.toLowerCase().includes(search.toLowerCase());

    return matchesTab && matchesSev && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Anomaly Detection Log</h1>
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold font-mono border ${
              isSimulating
                ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-400'
                : 'bg-slate-800/80 border-slate-700 text-slate-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isSimulating ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              {isSimulating ? 'LIVE MONITORING ACTIVE' : 'SIMULATOR IDLE'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Machine-learning classified telemetry anomalies. Exactly 2 anomalous machines detected; all remaining {stats.healthyCount} systems normal.
          </p>
        </div>

        {/* Action & Status segment control */}
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

          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setActiveTab('ACTIVE')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                activeTab === 'ACTIVE'
                  ? 'bg-amber-950/60 text-amber-300 font-semibold border border-amber-800/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Active Incidents ({activeCount})
            </button>
            <button
              onClick={() => setActiveTab('RESOLVED')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                activeTab === 'RESOLVED'
                  ? 'bg-emerald-950/60 text-emerald-300 font-semibold border border-emerald-800/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Resolved History ({resolvedCount})
            </button>
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                activeTab === 'ALL'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({anomalies.length})
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search anomalies by machine, sensor, or fault..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterSeverity}
            onChange={e => setFilterSeverity(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Anomalies Table */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-medium uppercase tracking-wider text-[11px]">
                <th className="py-3 px-5">Time</th>
                <th className="py-3 px-4">Machine</th>
                <th className="py-3 px-4">Sensor Parameter</th>
                <th className="py-3 px-4">Detected Value</th>
                <th className="py-3 px-4">Expected Normal</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono text-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 font-sans">
                    {activeTab === 'ACTIVE' ? (
                      <div className="space-y-1">
                        <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto mb-2 opacity-80" />
                        <div className="text-sm font-semibold text-slate-300">All Connected Machines Operating Nominally</div>
                        <p className="text-xs text-slate-500">No active anomalies detected across connected industrial assets.</p>
                      </div>
                    ) : (
                      'No anomalies match the selected filters.'
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map((anomaly) => {
                  const severityBadgeClass =
                    anomaly.severity === 'CRITICAL'
                      ? 'text-rose-400 border-rose-500/30 bg-rose-500/10'
                      : anomaly.severity === 'HIGH'
                      ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                      : anomaly.severity === 'MEDIUM'
                      ? 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'
                      : 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';

                  const isResolved = anomaly.status === 'RESOLVED';

                  return (
                    <tr
                      key={anomaly.id}
                      onClick={() => setSelectedAnomaly(anomaly)}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-5 text-slate-400 tabular-nums">
                        {anomaly.time}
                      </td>
                      <td className="py-3.5 px-4 font-sans font-medium text-white">
                        <div>{anomaly.machineName}</div>
                        <div className="text-[10px] text-slate-500 font-mono truncate max-w-[180px]">
                          {anomaly.faultCategory}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-sans text-slate-300">
                        {anomaly.parameter}
                      </td>
                      <td className="py-3.5 px-4 tabular-nums font-semibold text-rose-300">
                        {anomaly.detectedValue}
                      </td>
                      <td className="py-3.5 px-4 tabular-nums text-slate-400">
                        {anomaly.expectedRange}
                      </td>
                      <td className="py-3.5 px-4 tabular-nums">
                        <span className="font-bold text-cyan-400">{anomaly.anomalyScore}%</span>
                      </td>
                      <td className="py-3.5 px-4 font-sans">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider border ${severityBadgeClass}`}>
                          {anomaly.severity}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-sans">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                          isResolved ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                          {isResolved ? (
                            <>
                              <CheckCircle className="w-3 h-3" /> Resolved
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> Active
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right font-sans">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAnomaly(anomaly);
                          }}
                          className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                          Inspect Diagnostic →
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
