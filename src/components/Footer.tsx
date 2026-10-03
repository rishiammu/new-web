import React from 'react';
import { Activity } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-[#080C14] border-t border-slate-800/80 py-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-800/60">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-md bg-cyan-500 flex items-center justify-center">
                <Activity className="w-4 h-4 text-slate-950 font-bold" />
              </div>
              <span className="text-sm font-bold text-white tracking-tight">SMART IoT</span>
            </div>
            <p className="text-slate-400 text-xs max-w-sm">
              Real-time industrial machine sensor monitoring powered by machine learning.
            </p>
            <p className="text-cyan-400/80 text-[11px] font-mono mt-1">
              "Monitor machines. Detect anomalies early. Act before failures."
            </p>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-2 text-xs">
            <button
              onClick={() => onNavigate('landing')}
              className="text-slate-400 hover:text-cyan-400 transition-colors"
            >
              Product
            </button>
            <a
              href="#features"
              onClick={() => onNavigate('landing')}
              className="text-slate-400 hover:text-cyan-400 transition-colors"
            >
              Features
            </a>
            <button
              onClick={() => onNavigate('dashboard')}
              className="text-slate-400 hover:text-cyan-400 transition-colors"
            >
              Dashboard
            </button>
            <a
              href="mailto:contact@smartiot.industrial"
              className="text-slate-400 hover:text-cyan-400 transition-colors"
            >
              Contact
            </a>
            <button
              onClick={() => alert('SMART IoT is built for enterprise privacy with zero external telemetry leakage.')}
              className="text-slate-400 hover:text-cyan-400 transition-colors"
            >
              Privacy
            </button>
            <button
              onClick={() => alert('Terms of Service: Industrial Operations & SLA 99.9% uptime compliance.')}
              className="text-slate-400 hover:text-cyan-400 transition-colors"
            >
              Terms
            </button>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <div>
            © {new Date().getFullYear()} SMART IoT Industrial Systems. All rights reserved.
          </div>
          <div className="font-mono text-[10px] text-slate-600">
            Engineered for High-Reliability Operational Technology
          </div>
        </div>
      </div>
    </footer>
  );
};
