import React, { useState } from 'react';
import { X, Plus, Cpu, Settings, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { MachineThresholds } from '../types';
import { useIoT, AddMachinePayload } from '../context/IoTContext';

interface AddMachineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMachineCreated?: (machineId: string) => void;
}

const TEMPLATES: Record<string, { type: string; thresholds: MachineThresholds }> = {
  'CNC_MILLING': {
    type: '5-Axis Precision Milling',
    thresholds: {
      temperature: { min: 45, max: 72, criticalMax: 82, unit: '°C', setpoint: 62 },
      vibration: { min: 1.5, max: 4.5, criticalMax: 6.5, unit: 'mm/s', setpoint: 2.8 },
      pressure: { min: 5.5, max: 7.8, criticalMin: 4.0, unit: 'bar', setpoint: 6.8 },
      rpm: { min: 2400, max: 3600, unit: 'RPM', setpoint: 2850 },
      current: { min: 14, max: 26, criticalMax: 32, unit: 'A', setpoint: 19.2 },
    },
  },
  'INDUCTION_MOTOR': {
    type: 'Three-Phase Induction Motor',
    thresholds: {
      temperature: { min: 50, max: 75, criticalMax: 85, unit: '°C', setpoint: 66 },
      vibration: { min: 2.0, max: 5.0, criticalMax: 7.0, unit: 'mm/s', setpoint: 3.4 },
      pressure: { min: 5.0, max: 7.5, criticalMin: 3.5, unit: 'bar', setpoint: 6.2 },
      rpm: { min: 1400, max: 1600, unit: 'RPM', setpoint: 1480 },
      current: { min: 18, max: 32, criticalMax: 40, unit: 'A', setpoint: 24.5 },
    },
  },
  'HYDRAULIC_PRESS': {
    type: 'Variable Axial Hydraulic Press',
    thresholds: {
      temperature: { min: 40, max: 68, criticalMax: 78, unit: '°C', setpoint: 55 },
      vibration: { min: 1.5, max: 4.2, criticalMax: 6.0, unit: 'mm/s', setpoint: 2.5 },
      pressure: { min: 6.0, max: 8.5, criticalMin: 4.5, unit: 'bar', setpoint: 7.4 },
      rpm: { min: 1600, max: 1900, unit: 'RPM', setpoint: 1750 },
      current: { min: 12, max: 24, criticalMax: 30, unit: 'A', setpoint: 16.8 },
    },
  },
  'CHILLER_COMPRESSOR': {
    type: 'Centrifugal Industrial Chiller',
    thresholds: {
      temperature: { min: 42, max: 68, criticalMax: 78, unit: '°C', setpoint: 54 },
      vibration: { min: 1.2, max: 4.0, criticalMax: 5.8, unit: 'mm/s', setpoint: 2.2 },
      pressure: { min: 5.8, max: 8.2, criticalMin: 4.2, unit: 'bar', setpoint: 7.0 },
      rpm: { min: 2800, max: 3600, unit: 'RPM', setpoint: 3200 },
      current: { min: 25, max: 45, criticalMax: 55, unit: 'A', setpoint: 34.0 },
    },
  },
};

export const AddMachineModal: React.FC<AddMachineModalProps> = ({ isOpen, onClose, onMachineCreated }) => {
  const { addMachine } = useIoT();

  const [name, setName] = useState('');
  const [type, setType] = useState('5-Axis Precision Milling');
  const [location, setLocation] = useState('Cell D - Secondary Bay');
  const [selectedTemplate, setSelectedTemplate] = useState('CNC_MILLING');

  // Sensor threshold parameters
  const [tempMin, setTempMin] = useState(45);
  const [tempMax, setTempMax] = useState(72);
  const [tempSetpoint, setTempSetpoint] = useState(62);
  const [tempUnit, setTempUnit] = useState('°C');

  const [vibMin, setVibMin] = useState(1.5);
  const [vibMax, setVibMax] = useState(4.5);
  const [vibSetpoint, setVibSetpoint] = useState(2.8);
  const [vibUnit, setVibUnit] = useState('mm/s');

  const [presMin, setPresMin] = useState(5.5);
  const [presMax, setPresMax] = useState(7.8);
  const [presSetpoint, setPresSetpoint] = useState(6.8);
  const [presUnit, setPresUnit] = useState('bar');

  const [rpmMin, setRpmMin] = useState(2400);
  const [rpmMax, setRpmMax] = useState(3600);
  const [rpmSetpoint, setRpmSetpoint] = useState(2850);

  const [currentMin, setCurrentMin] = useState(14);
  const [currentMax, setCurrentMax] = useState(26);
  const [currentSetpoint, setCurrentSetpoint] = useState(19.2);

  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleApplyTemplate = (key: string) => {
    setSelectedTemplate(key);
    const tmpl = TEMPLATES[key];
    if (tmpl) {
      setType(tmpl.type);
      setTempMin(tmpl.thresholds.temperature.min);
      setTempMax(tmpl.thresholds.temperature.max);
      setTempSetpoint(tmpl.thresholds.temperature.setpoint);
      setTempUnit(tmpl.thresholds.temperature.unit);

      setVibMin(tmpl.thresholds.vibration.min);
      setVibMax(tmpl.thresholds.vibration.max);
      setVibSetpoint(tmpl.thresholds.vibration.setpoint);
      setVibUnit(tmpl.thresholds.vibration.unit);

      setPresMin(tmpl.thresholds.pressure.min);
      setPresMax(tmpl.thresholds.pressure.max);
      setPresSetpoint(tmpl.thresholds.pressure.setpoint);
      setPresUnit(tmpl.thresholds.pressure.unit);

      setRpmMin(tmpl.thresholds.rpm.min);
      setRpmMax(tmpl.thresholds.rpm.max);
      setRpmSetpoint(tmpl.thresholds.rpm.setpoint);

      if (tmpl.thresholds.current) {
        setCurrentMin(tmpl.thresholds.current.min);
        setCurrentMax(tmpl.thresholds.current.max);
        setCurrentSetpoint(tmpl.thresholds.current.setpoint);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide a machine name (e.g. Centrifugal Chiller 07).');
      return;
    }

    if (tempMin >= tempMax) {
      setError('Temperature minimum must be less than maximum.');
      return;
    }
    if (vibMin >= vibMax) {
      setError('Vibration minimum must be less than maximum.');
      return;
    }
    if (presMin >= presMax) {
      setError('Pressure minimum must be less than maximum.');
      return;
    }
    if (rpmMin >= rpmMax) {
      setError('RPM minimum must be less than maximum.');
      return;
    }

    const payload: AddMachinePayload = {
      name: name.trim(),
      type: type.trim(),
      location: location.trim(),
      thresholds: {
        temperature: {
          min: tempMin,
          max: tempMax,
          criticalMax: tempMax + 10,
          unit: tempUnit,
          setpoint: tempSetpoint,
        },
        vibration: {
          min: vibMin,
          max: vibMax,
          criticalMax: vibMax * 1.4,
          unit: vibUnit,
          setpoint: vibSetpoint,
        },
        pressure: {
          min: presMin,
          max: presMax,
          criticalMin: presMin * 0.7,
          unit: presUnit,
          setpoint: presSetpoint,
        },
        rpm: {
          min: rpmMin,
          max: rpmMax,
          unit: 'RPM',
          setpoint: rpmSetpoint,
        },
        current: {
          min: currentMin,
          max: currentMax,
          criticalMax: currentMax * 1.3,
          unit: 'A',
          setpoint: currentSetpoint,
        },
      },
    };

    const newMachine = addMachine(payload);
    setIsSuccess(true);

    setTimeout(() => {
      setIsSuccess(false);
      onClose();
      if (onMachineCreated) {
        onMachineCreated(newMachine.id);
      }
    }, 600);
  };

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

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-800/80 text-cyan-400">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">Add New Industrial Machine / System</h2>
            <p className="text-xs text-slate-400">Configure asset parameters, sensors, and baseline thresholds for live anomaly detection.</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 text-xs text-rose-300 bg-rose-950/40 border border-rose-800/60 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {isSuccess && (
          <div className="mb-4 flex items-center gap-2 p-3 text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-800/60 rounded-lg">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Machine created successfully. Live synthetic telemetry stream initiated!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Preset Template Selector */}
          <div>
            <label className="block text-slate-400 font-medium mb-1.5 uppercase tracking-wider text-[11px]">
              Equipment Specification Template
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'CNC_MILLING', label: 'CNC Spindle' },
                { id: 'INDUCTION_MOTOR', label: 'Induction Motor' },
                { id: 'HYDRAULIC_PRESS', label: 'Hydraulic Press' },
                { id: 'CHILLER_COMPRESSOR', label: 'Chiller / Screw' },
              ].map(tmpl => (
                <button
                  type="button"
                  key={tmpl.id}
                  onClick={() => handleApplyTemplate(tmpl.id)}
                  className={`px-2.5 py-2 rounded-lg border text-xs font-medium text-left transition-colors ${
                    selectedTemplate === tmpl.id
                      ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300 font-semibold'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tmpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Asset Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Machine Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Centrifugal Chiller 07"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Equipment Type *</label>
              <input
                type="text"
                required
                value={type}
                onChange={e => setType(e.target.value)}
                placeholder="e.g. Precision CNC Milling"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Plant Location</label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. Cell D - Cooling Bay"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Sensor Normal Operating Ranges */}
          <div className="border-t border-slate-800 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
                Normal Operating Sensor Thresholds & Baselines
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                ML Anomaly boundaries
              </span>
            </div>

            {/* Temperature */}
            <div className="grid grid-cols-4 gap-2 items-center bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/80">
              <div className="font-medium text-slate-300">Temperature</div>
              <div>
                <span className="text-[10px] text-slate-500 block">Min ({tempUnit})</span>
                <input
                  type="number"
                  step="0.5"
                  value={tempMin}
                  onChange={e => setTempMin(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-mono"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Max ({tempUnit})</span>
                <input
                  type="number"
                  step="0.5"
                  value={tempMax}
                  onChange={e => setTempMax(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-mono"
                />
              </div>
              <div>
                <span className="text-[10px] text-cyan-400 block">Baseline Setpoint</span>
                <input
                  type="number"
                  step="0.5"
                  value={tempSetpoint}
                  onChange={e => setTempSetpoint(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 bg-slate-900 border border-cyan-800 rounded text-xs font-mono text-cyan-300"
                />
              </div>
            </div>

            {/* Vibration */}
            <div className="grid grid-cols-4 gap-2 items-center bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/80">
              <div className="font-medium text-slate-300">Vibration (RMS)</div>
              <div>
                <span className="text-[10px] text-slate-500 block">Min ({vibUnit})</span>
                <input
                  type="number"
                  step="0.1"
                  value={vibMin}
                  onChange={e => setVibMin(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-mono"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Max ({vibUnit})</span>
                <input
                  type="number"
                  step="0.1"
                  value={vibMax}
                  onChange={e => setVibMax(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-mono"
                />
              </div>
              <div>
                <span className="text-[10px] text-cyan-400 block">Baseline Setpoint</span>
                <input
                  type="number"
                  step="0.1"
                  value={vibSetpoint}
                  onChange={e => setVibSetpoint(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 bg-slate-900 border border-cyan-800 rounded text-xs font-mono text-cyan-300"
                />
              </div>
            </div>

            {/* Pressure */}
            <div className="grid grid-cols-4 gap-2 items-center bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/80">
              <div className="font-medium text-slate-300">Hydraulic Pressure</div>
              <div>
                <span className="text-[10px] text-slate-500 block">Min ({presUnit})</span>
                <input
                  type="number"
                  step="0.1"
                  value={presMin}
                  onChange={e => setPresMin(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-mono"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Max ({presUnit})</span>
                <input
                  type="number"
                  step="0.1"
                  value={presMax}
                  onChange={e => setPresMax(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-mono"
                />
              </div>
              <div>
                <span className="text-[10px] text-cyan-400 block">Baseline Setpoint</span>
                <input
                  type="number"
                  step="0.1"
                  value={presSetpoint}
                  onChange={e => setPresSetpoint(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 bg-slate-900 border border-cyan-800 rounded text-xs font-mono text-cyan-300"
                />
              </div>
            </div>

            {/* RPM */}
            <div className="grid grid-cols-4 gap-2 items-center bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/80">
              <div className="font-medium text-slate-300">Rotor / Spindle RPM</div>
              <div>
                <span className="text-[10px] text-slate-500 block">Min (RPM)</span>
                <input
                  type="number"
                  step="50"
                  value={rpmMin}
                  onChange={e => setRpmMin(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-mono"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Max (RPM)</span>
                <input
                  type="number"
                  step="50"
                  value={rpmMax}
                  onChange={e => setRpmMax(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-mono"
                />
              </div>
              <div>
                <span className="text-[10px] text-cyan-400 block">Baseline Setpoint</span>
                <input
                  type="number"
                  step="50"
                  value={rpmSetpoint}
                  onChange={e => setRpmSetpoint(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-2 py-1 bg-slate-900 border border-cyan-800 rounded text-xs font-mono text-cyan-300"
                />
              </div>
            </div>

            {/* Current */}
            <div className="grid grid-cols-4 gap-2 items-center bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/80">
              <div className="font-medium text-slate-300">Current (Amps)</div>
              <div>
                <span className="text-[10px] text-slate-500 block">Min (A)</span>
                <input
                  type="number"
                  step="0.5"
                  value={currentMin}
                  onChange={e => setCurrentMin(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-mono"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Max (A)</span>
                <input
                  type="number"
                  step="0.5"
                  value={currentMax}
                  onChange={e => setCurrentMax(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-mono"
                />
              </div>
              <div>
                <span className="text-[10px] text-cyan-400 block">Baseline Setpoint</span>
                <input
                  type="number"
                  step="0.5"
                  value={currentSetpoint}
                  onChange={e => setCurrentSetpoint(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 bg-slate-900 border border-cyan-800 rounded text-xs font-mono text-cyan-300"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Machine & Start Live Streaming</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
