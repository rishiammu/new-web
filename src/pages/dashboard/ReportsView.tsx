import React, { useState } from 'react';
import { BarChart3, Download, FileText, CheckCircle2, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useIoT } from '../../context/IoTContext';

export const ReportsView: React.FC = () => {
  const { machines, anomalies, alerts, stats } = useIoT();
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleExportCSV = () => {
    setDownloading(true);
    setTimeout(() => {
      // Build CSV content
      const headers = ['Machine ID', 'Machine Name', 'Type', 'Status', 'Health Score', 'Temperature (°C)', 'Vibration (mm/s)', 'Pressure (bar)', 'RPM', 'Anomaly Score (%)'];
      const rows = machines.map(m => [
        m.id,
        `"${m.name}"`,
        `"${m.type}"`,
        m.status,
        m.healthScore,
        m.temperature.toFixed(1),
        m.vibration.toFixed(2),
        m.pressure.toFixed(1),
        m.rpm,
        m.anomalyScore,
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `smart_iot_asset_report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloading(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    }, 400);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Operations & Analytics Report</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Aggregated machine health performance, degradation trends, and exportable operational telemetry.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={downloading}
          className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-2"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{downloading ? 'Compiling Report...' : 'Export Asset Telemetry (CSV)'}</span>
        </button>
      </div>

      {downloadSuccess && (
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Report exported successfully to your downloads folder.</span>
        </div>
      )}

      {/* Analytics KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 shadow-sm space-y-1">
          <div className="text-xs text-slate-400 uppercase tracking-wider">Average Fleet Health</div>
          <div className="font-mono text-3xl font-bold text-cyan-300 tabular-nums">
            {stats.averageHealth}%
          </div>
          <p className="text-[11px] text-slate-500">Target baseline: &gt; 85% plant reliability</p>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 shadow-sm space-y-1">
          <div className="text-xs text-slate-400 uppercase tracking-wider">Anomaly Incidents (24h)</div>
          <div className="font-mono text-3xl font-bold text-white tabular-nums">
            {anomalies.length}
          </div>
          <p className="text-[11px] text-slate-500">Evaluated by Scikit-learn ML</p>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 shadow-sm space-y-1">
          <div className="text-xs text-slate-400 uppercase tracking-wider">Mean Time Between Anomaly</div>
          <div className="font-mono text-3xl font-bold text-emerald-400 tabular-nums">
            148.4 <span className="text-sm font-normal text-slate-400 font-sans">hrs</span>
          </div>
          <p className="text-[11px] text-emerald-500/80">Continuous equipment uptime</p>
        </div>
      </div>

      {/* Fleet Health Distribution Matrix */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-white tracking-tight">Machine Asset Reliability Breakdown</h3>

        <div className="space-y-3 font-mono text-xs">
          {machines.map(m => (
            <div key={m.id} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
              <div className="flex items-center justify-between font-sans mb-1.5">
                <span className="font-semibold text-slate-200">{m.name}</span>
                <span className="font-mono text-xs text-cyan-400 tabular-nums">{m.healthScore}% Health</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    m.healthScore > 85 ? 'bg-emerald-400' : m.healthScore > 65 ? 'bg-amber-400' : 'bg-rose-500'
                  }`}
                  style={{ width: `${m.healthScore}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Temp: {m.temperature.toFixed(1)}°C · Vib: {m.vibration.toFixed(2)} mm/s</span>
                <span className="font-sans font-medium text-slate-300">Status: {m.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
