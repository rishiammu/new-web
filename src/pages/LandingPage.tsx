import React, { useState } from 'react';
import {
  Activity,
  ArrowRight,
  ShieldAlert,
  Cpu,
  BarChart3,
  Bell,
  CheckCircle2,
  Server,
  Database,
  Terminal,
  Layers,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Play
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useIoT } from '../context/IoTContext';
import { TelemetryChart } from '../components/TelemetryChart';

interface LandingPageProps {
  onNavigateToDashboard: () => void;
  onOpenArchitectureModal?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToDashboard, onOpenArchitectureModal }) => {
  const { openLoginModal, openRegisterModal, isAuthenticated } = useAuth();
  const { machines, alerts, isSimulating, toggleSimulation, startSimulation } = useIoT();

  // Highlight machine for preview (CNC Milling Machine 01)
  const heroMachine = machines[0] || {
    name: 'CNC Milling Machine 01',
    status: 'HEALTHY',
    healthScore: 96,
    temperature: 63.8,
    vibration: 2.85,
    pressure: 6.8,
    history: [],
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      onNavigateToDashboard();
    } else {
      openRegisterModal();
    }
  };

  const handleStartSimulatorCTA = () => {
    if (!isAuthenticated) {
      openLoginModal();
    } else {
      startSimulation();
      onNavigateToDashboard();
    }
  };

  const handleInspectDashboard = () => {
    if (!isAuthenticated) {
      openLoginModal();
    } else {
      onNavigateToDashboard();
    }
  };

  return (
    <div className="w-full">
      {/* Mandatory Candidate Security Clearance Notice Banner */}
      {!isAuthenticated && (
        <div className="w-full bg-gradient-to-r from-cyan-950/90 via-slate-900 to-amber-950/80 border-b border-cyan-800/50 py-2.5 px-4 sticky top-16 z-30 shadow-md">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-cyan-200">
              <span className="flex h-2 w-2 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span>
                <strong className="text-white">Security Clearance Mandatory:</strong> 1st Candidate has to Login or Register with valid security credentials to start simulator, inspect machines, or enter the console.
              </span>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <button
                onClick={openLoginModal}
                className="px-3 py-1 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded text-xs transition-colors shadow-sm"
              >
                Sign In
              </button>
              <button
                onClick={openRegisterModal}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-medium rounded text-xs transition-colors"
              >
                Register
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          SECTION 1: HERO
          ============================================================ */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Value Prop */}
            <div className="lg:col-span-6 space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 text-xs font-semibold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>AI-Powered Industrial Monitoring</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.12]">
                Detect Industrial Anomalies Before They Become Failures.
              </h1>

              {/* Supporting Text */}
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
                Monitor machine sensor data in real time across your entire industrial fleet, detect abnormal behavior with machine learning, and respond to potential equipment issues before they cause costly downtime.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={handleStartSimulatorCTA}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-lg shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{isSimulating ? 'Simulator Running · View Live' : 'Start Simulator'}</span>
                </button>

                <button
                  onClick={handleGetStarted}
                  className="px-5 py-3 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-sm rounded-lg shadow-lg shadow-cyan-400/25 transition-all flex items-center gap-2"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleInspectDashboard}
                  className="px-5 py-3 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white font-medium text-sm rounded-lg border border-slate-700/80 transition-colors flex items-center gap-2"
                >
                  <span>View Dashboard</span>
                </button>
              </div>

              {/* Multi-machine & Anomaly Status Kicker */}
              <div className="pt-2 text-xs font-mono text-slate-400 flex flex-wrap items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                <span className="text-cyan-300 font-semibold">Monitoring {machines.length} Machines</span>
                <span className="text-slate-600">·</span>
                <span className="text-amber-400 font-medium">2 Anomalies Detected</span>
                <span className="text-slate-600">·</span>
                <span className="text-emerald-400 font-medium">{Math.max(0, machines.length - 2)} Systems Normal</span>
              </div>
            </div>

            {/* Right Column: Realistic Industrial Monitoring Dashboard Preview */}
            <div className="lg:col-span-6">
              <div className="relative rounded-2xl bg-gradient-to-b from-slate-900 to-[#0A0F1D] border border-slate-800 p-5 shadow-2xl shadow-cyan-950/40">
                {/* Header bar of the dashboard widget */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${isSimulating ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                    <div>
                      <div className="text-sm font-bold text-white tracking-tight">CNC Milling Machine 01</div>
                      <div className="text-[11px] text-slate-400 font-mono">Workshop A · 5-Axis Metal Machining</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleStartSimulatorCTA}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                        isSimulating
                          ? 'bg-emerald-950/70 border border-emerald-600/70 text-emerald-300 hover:bg-emerald-900/50'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm animate-pulse'
                      }`}
                    >
                      {isSimulating ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          <span>Live Streaming</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-current" />
                          <span>Start Simulator</span>
                        </>
                      )}
                    </button>
                    <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/50 border border-emerald-800/60 px-2 py-0.5 rounded">
                      Healthy
                    </span>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {/* Machine Health */}
                  <div
                    onClick={handleInspectDashboard}
                    className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 cursor-pointer hover:border-cyan-500/40 transition-colors group"
                    title={isAuthenticated ? 'Inspect machine health' : 'Candidate sign in required'}
                  >
                    <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>Health</span>
                      <span className="text-[10px] text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">Inspect →</span>
                    </div>
                    <div className="font-mono text-2xl font-bold text-cyan-300 tabular-nums">{heroMachine.healthScore}%</div>
                    <div className="text-[10px] text-emerald-400 flex items-center gap-0.5 mt-0.5">
                      <TrendingUp className="w-3 h-3" /> Nominal
                    </div>
                  </div>

                  {/* Temperature */}
                  <div
                    onClick={handleInspectDashboard}
                    className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 cursor-pointer hover:border-cyan-500/40 transition-colors group"
                    title={isAuthenticated ? 'Inspect temperature telemetry' : 'Candidate sign in required'}
                  >
                    <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>Temperature</span>
                      <span className="text-[10px] text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">Inspect →</span>
                    </div>
                    <div className="font-mono text-2xl font-bold text-slate-100 tabular-nums">{heroMachine.temperature.toFixed(1)}<span className="text-sm font-normal text-slate-400">°C</span></div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Range 45–72°C</div>
                  </div>

                  {/* Vibration */}
                  <div
                    onClick={handleInspectDashboard}
                    className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 cursor-pointer hover:border-cyan-500/40 transition-colors group"
                    title={isAuthenticated ? 'Inspect vibration spectrum' : 'Candidate sign in required'}
                  >
                    <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>Vibration</span>
                      <span className="text-[10px] text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">Inspect →</span>
                    </div>
                    <div className="font-mono text-2xl font-bold text-slate-100 tabular-nums">{heroMachine.vibration.toFixed(2)} <span className="text-xs font-normal text-slate-400">mm/s</span></div>
                    <div className="text-[10px] text-slate-400 mt-0.5">RMS ISO 10816</div>
                  </div>

                  {/* Pressure */}
                  <div
                    onClick={handleInspectDashboard}
                    className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 cursor-pointer hover:border-cyan-500/40 transition-colors group"
                    title={isAuthenticated ? 'Inspect pressure readings' : 'Candidate sign in required'}
                  >
                    <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>Pressure</span>
                      <span className="text-[10px] text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">Inspect →</span>
                    </div>
                    <div className="font-mono text-2xl font-bold text-slate-100 tabular-nums">{heroMachine.pressure.toFixed(1)} <span className="text-xs font-normal text-slate-400">bar</span></div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Hydraulic line</div>
                  </div>
                </div>

                {/* Real-time Line Chart Preview */}
                <div
                  onClick={handleInspectDashboard}
                  className="mb-4 cursor-pointer"
                  title={isAuthenticated ? 'View telemetry console' : 'Candidate sign in required'}
                >
                  <TelemetryChart
                    data={heroMachine.history}
                    metricKey="vibration"
                    label="Vibration Telemetry Stream (RMS) - Live Feed"
                    unit="mm/s"
                    strokeColor="#22D3EE"
                    warningThreshold={4.5}
                    criticalThreshold={6.5}
                    height={115}
                  />
                </div>

                {/* Subtle Anomaly Notification Banner */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <span className="font-medium text-amber-200">2 Anomalies Detected Across Fleet</span>
                      <span className="text-slate-400 hidden sm:inline ml-2">· Electric Motor 02 (Vibration) & Air Compressor 05 (Thermal)</span>
                    </div>
                  </div>
                  <button
                    onClick={handleInspectDashboard}
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors whitespace-nowrap pl-2"
                  >
                    Inspect Console →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 2: KEY VALUE PROPOSITION (Strictly 4 Cards)
          ============================================================ */}
      <section className="py-12 border-y border-slate-800/80 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="p-5 rounded-xl bg-[#0F172A]/70 border border-slate-800/80 space-y-2 hover:border-slate-700 transition-colors">
              <div className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Real-Time Monitoring
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Continuously monitor machine sensor data.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-5 rounded-xl bg-[#0F172A]/70 border border-slate-800/80 space-y-2 hover:border-slate-700 transition-colors">
              <div className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                AI Anomaly Detection
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Identify abnormal machine behavior automatically.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-5 rounded-xl bg-[#0F172A]/70 border border-slate-800/80 space-y-2 hover:border-slate-700 transition-colors">
              <div className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Instant Alerts
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Get notified when critical anomalies are detected.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-5 rounded-xl bg-[#0F172A]/70 border border-slate-800/80 space-y-2 hover:border-slate-700 transition-colors">
              <div className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Actionable Insights
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Understand machine health through clear analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 3: FEATURES SECTION (Strictly 6 Cards)
          ============================================================ */}
      <section id="features" className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
              Everything You Need to Monitor Industrial Assets
            </h2>
            <p className="text-sm text-slate-400">
              Purpose-built telemetry processing and automated failure prevention for factory machinery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div
              onClick={handleInspectDashboard}
              className="p-6 rounded-2xl bg-[#0F172A]/60 border border-slate-800/80 hover:border-cyan-500/40 transition-colors group cursor-pointer"
              title={isAuthenticated ? 'Inspect Real-Time Monitoring' : 'Candidate sign in required'}
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center mb-4 text-cyan-400 group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5 flex items-center justify-between">
                <span>Real-Time Monitoring</span>
                <span className="text-xs text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">Launch →</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Stream live temperature, vibration, pressure, and RPM telemetry directly from shop-floor sensors.
              </p>
            </div>

            {/* Feature 2 */}
            <div
              onClick={handleInspectDashboard}
              className="p-6 rounded-2xl bg-[#0F172A]/60 border border-slate-800/80 hover:border-cyan-500/40 transition-colors group cursor-pointer"
              title={isAuthenticated ? 'Inspect ML Anomaly Detection' : 'Candidate sign in required'}
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center mb-4 text-cyan-400 group-hover:scale-105 transition-transform">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5 flex items-center justify-between">
                <span>ML-Based Anomaly Detection</span>
                <span className="text-xs text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">Launch →</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Scikit-learn algorithms evaluate multi-sensor vectors to flag micro-deviations before mechanical breakdown.
              </p>
            </div>

            {/* Feature 3 */}
            <div
              onClick={handleInspectDashboard}
              className="p-6 rounded-2xl bg-[#0F172A]/60 border border-slate-800/80 hover:border-cyan-500/40 transition-colors group cursor-pointer"
              title={isAuthenticated ? 'Inspect Machine Health Analytics' : 'Candidate sign in required'}
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center mb-4 text-cyan-400 group-hover:scale-105 transition-transform">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5 flex items-center justify-between">
                <span>Machine Health Analytics</span>
                <span className="text-xs text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">Launch →</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dynamic health scores (0–100%) quantify asset degradation and prioritize scheduled maintenance.
              </p>
            </div>

            {/* Feature 4 */}
            <div
              onClick={handleInspectDashboard}
              className="p-6 rounded-2xl bg-[#0F172A]/60 border border-slate-800/80 hover:border-cyan-500/40 transition-colors group cursor-pointer"
              title={isAuthenticated ? 'Inspect Automated Alerts' : 'Candidate sign in required'}
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center mb-4 text-cyan-400 group-hover:scale-105 transition-transform">
                <Bell className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5 flex items-center justify-between">
                <span>Automated Alerts</span>
                <span className="text-xs text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">Launch →</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Instant classification into Warning and Critical tiers with automated Spring Mail team notification.
              </p>
            </div>

            {/* Feature 5 */}
            <div
              onClick={handleInspectDashboard}
              className="p-6 rounded-2xl bg-[#0F172A]/60 border border-slate-800/80 hover:border-cyan-500/40 transition-colors group cursor-pointer"
              title={isAuthenticated ? 'Inspect Historical Analysis' : 'Candidate sign in required'}
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center mb-4 text-cyan-400 group-hover:scale-105 transition-transform">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5 flex items-center justify-between">
                <span>Historical Analysis</span>
                <span className="text-xs text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">Launch →</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Query past operational cycles to trace degradation trends and verify post-maintenance resolution.
              </p>
            </div>

            {/* Feature 6 */}
            <div
              onClick={handleInspectDashboard}
              className="p-6 rounded-2xl bg-[#0F172A]/60 border border-slate-800/80 hover:border-cyan-500/40 transition-colors group cursor-pointer"
              title={isAuthenticated ? 'Inspect Centralized Dashboard' : 'Candidate sign in required'}
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center mb-4 text-cyan-400 group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5 flex items-center justify-between">
                <span>Centralized Dashboard</span>
                <span className="text-xs text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">Launch →</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Single pane of glass across CNC spindles, motors, hydraulic pumps, compressors, and conveyors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 4: HOW IT WORKS (Simple 4-Step Process)
          ============================================================ */}
      <section id="how-it-works" className="py-20 bg-slate-950/60 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
              How It Works
            </h2>
            <p className="text-sm text-slate-400">
              A 4-step pipeline that transforms sensor telemetry into operational intervention.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-[#0F172A]/70 border border-slate-800 relative">
              <div className="font-mono text-cyan-400 text-sm font-bold mb-3">01</div>
              <h3 className="text-base font-bold text-white mb-1">Collect</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                IoT sensors generate machine data.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-[#0F172A]/70 border border-slate-800 relative">
              <div className="font-mono text-cyan-400 text-sm font-bold mb-3">02</div>
              <h3 className="text-base font-bold text-white mb-1">Process</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sensor data is processed and stored.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-[#0F172A]/70 border border-slate-800 relative">
              <div className="font-mono text-cyan-400 text-sm font-bold mb-3">03</div>
              <h3 className="text-base font-bold text-white mb-1">Detect</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                The ML model identifies abnormal patterns.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl bg-[#0F172A]/70 border border-slate-800 relative">
              <div className="font-mono text-cyan-400 text-sm font-bold mb-3">04</div>
              <h3 className="text-base font-bold text-white mb-1">Alert</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Users receive alerts and can inspect the machine.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 5: SYSTEM ARCHITECTURE
          ============================================================ */}
      <section className="py-20 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
              System Architecture
            </h2>
            <p className="text-sm text-slate-400">
              Clean pipeline from industrial machines to Spring Boot, PostgreSQL, and Python ML.
            </p>
          </div>

          {/* Simple boxes and arrows flow */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#0F172A]/60 border border-slate-800">
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-semibold">
              <div className="px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200">
                Industrial Machines
              </div>
              <span className="text-cyan-400 font-bold">→</span>

              <div className="px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200">
                IoT Sensors
              </div>
              <span className="text-cyan-400 font-bold">→</span>

              <div className="px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200">
                Data Ingestion
              </div>
              <span className="text-cyan-400 font-bold">→</span>

              <div className="px-4 py-2.5 rounded-lg bg-cyan-950/80 border border-cyan-800/80 text-cyan-300">
                Spring Boot Backend
              </div>
              <span className="text-cyan-400 font-bold">→</span>

              <div className="px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200">
                PostgreSQL
              </div>
              <span className="text-cyan-400 font-bold">→</span>

              <div className="px-4 py-2.5 rounded-lg bg-cyan-950/80 border border-cyan-800/80 text-cyan-300">
                Python ML Service
              </div>
              <span className="text-cyan-400 font-bold">→</span>

              <div className="px-4 py-2.5 rounded-lg bg-amber-950/80 border border-amber-800/80 text-amber-300">
                Anomaly Detection
              </div>
              <span className="text-cyan-400 font-bold">→</span>

              <div className="px-4 py-2.5 rounded-lg bg-emerald-950/80 border border-emerald-800/80 text-emerald-300">
                Dashboard + Alerts
              </div>
            </div>

            {/* Architecture code inspector CTA */}
            {onOpenArchitectureModal && (
              <div className="text-center mt-6 pt-4 border-t border-slate-800/80">
                <button
                  onClick={onOpenArchitectureModal}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <Terminal className="w-4 h-4" />
                  <span>Inspect Spring Boot REST Controller & Python Isolation Forest Specs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 6: DASHBOARD PREVIEW
          ============================================================ */}
      <section className="py-20 bg-slate-950/80 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">
                Monitor Every Machine From One Dashboard
              </h2>
              <p className="text-sm text-slate-400">
                Simulated live feed of operating assets with real-time anomaly scores.
              </p>
            </div>
            <button
              onClick={handleInspectDashboard}
              className="self-start md:self-auto px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <span>Launch Live Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Machine Table Preview */}
          <div className="rounded-2xl bg-[#0F172A]/70 border border-slate-800 overflow-hidden shadow-xl">
            <div className="px-5 py-3.5 border-b border-slate-800/80 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">Active Asset Telemetry</span>
              <span className="font-mono text-cyan-400 text-[11px]">Real-Time Feed</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800/60 bg-slate-900/40 text-slate-400 font-medium uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-5">Machine</th>
                    <th className="py-3 px-4">Temperature</th>
                    <th className="py-3 px-4">Vibration</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Anomaly Score</th>
                    <th className="py-3 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-slate-200">
                  {machines.slice(0, 4).map((m) => (
                    <tr
                      key={m.id}
                      onClick={handleInspectDashboard}
                      className="hover:bg-slate-800/30 transition-colors cursor-pointer"
                      title={isAuthenticated ? 'Inspect machine' : 'Candidate sign in required'}
                    >
                      <td className="py-3.5 px-5 font-sans font-medium text-white">
                        <div>{m.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{m.type}</div>
                      </td>
                      <td className="py-3.5 px-4 tabular-nums">
                        {m.temperature.toFixed(1)}°C
                      </td>
                      <td className="py-3.5 px-4 tabular-nums">
                        {m.vibration.toFixed(1)} mm/s
                      </td>
                      <td className="py-3.5 px-4 font-sans">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${
                            m.status === 'HEALTHY'
                              ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                              : m.status === 'WARNING'
                              ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                              : 'text-rose-400 border-rose-500/30 bg-rose-500/10'
                          }`}
                        >
                          {m.status === 'HEALTHY' ? 'Healthy' : m.status === 'WARNING' ? 'Warning' : 'Critical'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 tabular-nums">
                        <span className={`font-semibold ${m.anomalyScore > 50 ? 'text-amber-400' : 'text-slate-300'}`}>
                          {m.anomalyScore}%
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right font-sans">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInspectDashboard();
                          }}
                          className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                          View →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
