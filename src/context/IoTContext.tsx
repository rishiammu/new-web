import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { AlertRecord, AnomalyRecord, Machine, MachineThresholds, SensorReading, SimulationFaultType } from '../types';
import {
  getInitialAlerts,
  getInitialAnomalies,
  getInitialMachines,
  generateSyntheticHistory,
  BASELINE_THRESHOLDS_MOTOR,
} from '../services/iotService';
import { evaluateAnomaly } from '../services/mlAnomalyEngine';
import { useAuth } from './AuthContext';

export interface EmailDispatchLog {
  id: string;
  timestamp: string;
  recipient: string;
  subject: string;
  body: string;
  status: 'SENT' | 'QUEUED';
}

export interface AddMachinePayload {
  name: string;
  type: string;
  location: string;
  thresholds: MachineThresholds;
}

interface IoTContextType {
  machines: Machine[];
  selectedMachineId: string | null;
  setSelectedMachineId: (id: string | null) => void;
  selectedMachine: Machine | undefined;
  anomalies: AnomalyRecord[];
  alerts: AlertRecord[];
  selectedAnomaly: AnomalyRecord | null;
  setSelectedAnomaly: (anomaly: AnomalyRecord | null) => void;
  resolveAlert: (id: string, notes?: string) => void;
  resolveAnomaly: (id: string, notes?: string) => void;
  simulationFault: SimulationFaultType;
  faultTargetMachineId: string;
  setFaultTargetMachineId: (id: string) => void;
  faultSecondsRemaining: number;
  triggerFaultNow: (fault: SimulationFaultType, targetMachineId?: string, durationSeconds?: number) => void;
  clearActiveFault: () => void;
  isSimulating: boolean;
  startSimulation: () => void;
  stopSimulation: () => void;
  toggleSimulation: () => void;
  addMachine: (payload: AddMachinePayload) => Machine;
  deleteMachine: (id: string) => void;
  emailDispatches: EmailDispatchLog[];
  stats: {
    totalMachines: number;
    healthyCount: number;
    warningCount: number;
    criticalCount: number;
    averageHealth: number;
    openAnomaliesCount: number;
    criticalAlertsCount: number;
  };
}

const IoTContext = createContext<IoTContextType | undefined>(undefined);

export const IoTProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  const [machines, setMachines] = useState<Machine[]>(() => {
    try {
      const saved = localStorage.getItem('smart_iot_machines_v4');
      if (saved) return JSON.parse(saved);
    } catch {}
    return getInitialMachines();
  });

  const [anomalies, setAnomalies] = useState<AnomalyRecord[]>(() => {
    try {
      const saved = localStorage.getItem('smart_iot_anomalies_v4');
      if (saved) return JSON.parse(saved);
    } catch {}
    return getInitialAnomalies();
  });

  const [alerts, setAlerts] = useState<AlertRecord[]>(() => {
    try {
      const saved = localStorage.getItem('smart_iot_alerts_v4');
      if (saved) return JSON.parse(saved);
    } catch {}
    return getInitialAlerts();
  });

  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null);
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyRecord | null>(null);

  // Fault injection state
  const [simulationFault, setSimulationFault] = useState<SimulationFaultType>('NONE');
  const [faultTargetMachineId, setFaultTargetMachineId] = useState<string>('mach_02');
  const [faultSecondsRemaining, setFaultSecondsRemaining] = useState<number>(0);

  // The simulator is idle until user explicitly clicks "Start Simulator"
  const [isSimulating, setIsSimulating] = useState<boolean>(() => {
    try {
      const stored = sessionStorage.getItem('smart_iot_simulator_active');
      return stored === 'true';
    } catch {
      return false;
    }
  });

  const startSimulation = useCallback(() => {
    setIsSimulating(true);
    try {
      sessionStorage.setItem('smart_iot_simulator_active', 'true');
    } catch {}
  }, []);

  const stopSimulation = useCallback(() => {
    setIsSimulating(false);
    try {
      sessionStorage.setItem('smart_iot_simulator_active', 'false');
    } catch {}
  }, []);

  const toggleSimulation = useCallback(() => {
    setIsSimulating(prev => {
      const next = !prev;
      try {
        sessionStorage.setItem('smart_iot_simulator_active', String(next));
      } catch {}
      return next;
    });
  }, []);

  const [emailDispatches, setEmailDispatches] = useState<EmailDispatchLog[]>([
    {
      id: 'mail_01',
      timestamp: '18 min ago',
      recipient: 'maintenance-shift@smartiot.industrial',
      subject: '[ALERT] High Bearing Vibration Threshold Exceeded - Electric Motor 02',
      body: 'Machine: Electric Motor 02 (Conveyor Line B)\nParameter: Vibration (5.48 mm/s)\nAnomaly Score: 64%\nRecommended Action: Inspect bearing condition and schedule vibration harmonic spectrum analysis.',
      status: 'SENT',
    },
    {
      id: 'mail_02',
      timestamp: '15 min ago',
      recipient: 'maintenance-shift@smartiot.industrial',
      subject: '[ALERT] Thermal Discharge Overheat Detected - Air Compressor 05',
      body: 'Machine: Air Compressor 05 (Pneumatics Bay)\nParameter: Temperature (78.6 °C)\nAnomaly Score: 61%\nRecommended Action: Inspect cooling jacket airflow and verify intake filter condition.',
      status: 'SENT',
    }
  ]);

  // Persist state snapshots
  useEffect(() => {
    try {
      localStorage.setItem('smart_iot_machines_v4', JSON.stringify(machines));
    } catch {}
  }, [machines]);

  useEffect(() => {
    try {
      localStorage.setItem('smart_iot_anomalies_v4', JSON.stringify(anomalies));
    } catch {}
  }, [anomalies]);

  useEffect(() => {
    try {
      localStorage.setItem('smart_iot_alerts_v4', JSON.stringify(alerts));
    } catch {}
  }, [alerts]);

  // Countdown timer for active fault
  useEffect(() => {
    if (simulationFault === 'NONE' || faultSecondsRemaining <= 0) return;

    const timer = setInterval(() => {
      setFaultSecondsRemaining(prev => {
        if (prev <= 1) {
          setSimulationFault('NONE');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [simulationFault, faultSecondsRemaining]);

  // Clear active fault manually
  const clearActiveFault = useCallback(() => {
    setSimulationFault('NONE');
    setFaultSecondsRemaining(0);
  }, []);

  // Trigger targeted fault with realistic persistence
  const triggerFaultNow = useCallback((fault: SimulationFaultType, targetId?: string, durationSeconds: number = 25) => {
    const target = targetId || faultTargetMachineId || machines[0]?.id || 'mach_02';
    setFaultTargetMachineId(target);
    setSimulationFault(fault);
    setFaultSecondsRemaining(durationSeconds);
  }, [faultTargetMachineId, machines]);

  // Real-time Simulation Engine with Smooth Multi-Machine Telemetry
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const nowMs = Date.now();

      setMachines(prevMachines => {
        return prevMachines.map(m => {
          const t = m.thresholds;
          const isAnomalyMachine1 = m.id === 'mach_02'; // Motor 02 (Bearing Vibration Anomaly)
          const isAnomalyMachine2 = m.id === 'mach_05'; // Rotary Compressor 05 (Discharge Temperature Anomaly)
          const isFaultTarget = simulationFault !== 'NONE' && m.id === faultTargetMachineId;

          let newTemp: number;
          let newVib: number;
          let newPres: number;
          let newRpm: number;
          let newCurrent: number;

          let prediction: ReturnType<typeof evaluateAnomaly>;
          let anomalyScorePct: number;
          let newStatus: Machine['status'];
          let healthScore: number;

          if (isFaultTarget) {
            // Simulated user-injected fault on selected asset
            let targetTemp = t.temperature.setpoint;
            let targetVib = t.vibration.setpoint;
            let targetPres = t.pressure.setpoint;
            let targetRpm = t.rpm.setpoint;
            let targetCurrent = t.current?.setpoint || 20.0;

            if (simulationFault === 'VIBRATION_SPIKE') {
              targetVib = t.vibration.criticalMax ? t.vibration.criticalMax + 0.9 : t.vibration.max * 1.5;
            } else if (simulationFault === 'THERMAL_RUNAWAY') {
              targetTemp = t.temperature.criticalMax ? t.temperature.criticalMax + 4.5 : t.temperature.max + 12;
            } else if (simulationFault === 'PRESSURE_DROP') {
              targetPres = t.pressure.criticalMin ? t.pressure.criticalMin - 0.9 : t.pressure.min * 0.6;
            } else if (simulationFault === 'CAVITATION_RPM') {
              targetRpm = t.rpm.max + 320;
              targetVib = t.vibration.max + 1.2;
            } else if (simulationFault === 'OVERCURRENT' && t.current) {
              targetCurrent = (t.current.criticalMax || 35.0) + 4.0;
            }

            const tempDrift = (targetTemp - m.temperature) * 0.22 + (Math.random() * 0.16 - 0.08);
            const vibDrift = (targetVib - m.vibration) * 0.25 + (Math.random() * 0.04 - 0.02);
            const presDrift = (targetPres - m.pressure) * 0.20 + (Math.random() * 0.03 - 0.015);
            const rpmDrift = Math.round((targetRpm - m.rpm) * 0.22 + (Math.random() * 4 - 2));
            const currentDrift = ((targetCurrent - (m.current || 20.0)) * 0.20 + (Math.random() * 0.2 - 0.1));

            newTemp = parseFloat(Math.max(20, m.temperature + tempDrift).toFixed(1));
            newVib = parseFloat(Math.max(0.4, m.vibration + vibDrift).toFixed(2));
            newPres = parseFloat(Math.max(0.5, m.pressure + presDrift).toFixed(2));
            newRpm = Math.max(0, m.rpm + rpmDrift);
            newCurrent = parseFloat(Math.max(1.0, (m.current || 20.0) + currentDrift).toFixed(1));

            prediction = evaluateAnomaly({
              timestamp: nowStr,
              temperature: newTemp,
              vibration: newVib,
              pressure: newPres,
              rpm: newRpm,
              current: newCurrent,
            }, m.name, m.thresholds);

            anomalyScorePct = Math.round(prediction.score * 100);
            newStatus = prediction.severity === 'CRITICAL' ? 'CRITICAL' : 'WARNING';
            healthScore = prediction.severity === 'CRITICAL' ? 38 : 74;

          } else if (isAnomalyMachine1) {
            // Anomaly Machine 1: Motor 02 (Elevated Vibration above 5.0 mm/s)
            const vibSine = Math.sin(nowMs / 4500) * 0.08 + (Math.random() * 0.04 - 0.02);
            newVib = parseFloat((5.48 + vibSine).toFixed(2));
            newTemp = parseFloat((71.2 + (Math.random() * 0.4 - 0.2)).toFixed(1));
            newPres = parseFloat((6.2 + (Math.random() * 0.04 - 0.02)).toFixed(2));
            newRpm = Math.round(1480 + (Math.random() * 4 - 2));
            newCurrent = parseFloat((26.8 + (Math.random() * 0.3 - 0.15)).toFixed(1));

            prediction = evaluateAnomaly({
              timestamp: nowStr,
              temperature: newTemp,
              vibration: newVib,
              pressure: newPres,
              rpm: newRpm,
              current: newCurrent,
            }, m.name, m.thresholds);

            anomalyScorePct = Math.round(prediction.score * 100);
            newStatus = 'WARNING';
            healthScore = Math.min(80, Math.max(76, 100 - anomalyScorePct));

          } else if (isAnomalyMachine2) {
            // Anomaly Machine 2: Rotary Compressor 05 (Elevated Temperature above 76.0 °C)
            const tempSine = Math.sin(nowMs / 5500) * 0.6 + (Math.random() * 0.2 - 0.1);
            newTemp = parseFloat((78.6 + tempSine).toFixed(1));
            newVib = parseFloat((3.42 + (Math.random() * 0.04 - 0.02)).toFixed(2));
            newPres = parseFloat((7.5 + (Math.random() * 0.04 - 0.02)).toFixed(2));
            newRpm = Math.round(2200 + (Math.random() * 4 - 2));
            newCurrent = parseFloat((24.2 + (Math.random() * 0.3 - 0.15)).toFixed(1));

            prediction = evaluateAnomaly({
              timestamp: nowStr,
              temperature: newTemp,
              vibration: newVib,
              pressure: newPres,
              rpm: newRpm,
              current: newCurrent,
            }, m.name, m.thresholds);

            anomalyScorePct = Math.round(prediction.score * 100);
            newStatus = 'WARNING';
            healthScore = Math.min(79, Math.max(75, 100 - anomalyScorePct));

          } else {
            // ALL REMAINING MACHINES: STRICTLY NORMAL (HEALTHY) TELEMETRY
            // All sensor channels monitored and fluctuating realistically around nominal setpoint
            const phase = m.name.length * 2.3;
            newTemp = parseFloat((t.temperature.setpoint + Math.sin(nowMs / 9000 + phase) * 0.4 + (Math.random() * 0.16 - 0.08)).toFixed(1));
            newVib = parseFloat((t.vibration.setpoint + Math.cos(nowMs / 7000 + phase) * 0.08 + (Math.random() * 0.03 - 0.015)).toFixed(2));
            newPres = parseFloat((t.pressure.setpoint + Math.sin(nowMs / 11000 + phase) * 0.06 + (Math.random() * 0.02 - 0.01)).toFixed(2));
            newRpm = Math.round(t.rpm.setpoint + Math.cos(nowMs / 5000 + phase) * 5 + (Math.random() * 3 - 1.5));
            newCurrent = parseFloat(((t.current?.setpoint || 20.0) + Math.sin(nowMs / 8000 + phase) * 0.3 + (Math.random() * 0.15 - 0.07)).toFixed(1));

            prediction = {
              machine: m.name,
              anomaly: false,
              score: 0.08,
              severity: 'LOW',
              parameter: 'Temperature',
              detectedValue: `${newTemp.toFixed(1)} ${t.temperature.unit}`,
              expectedRange: `${t.temperature.min.toFixed(1)} – ${t.temperature.max.toFixed(1)} ${t.temperature.unit}`,
              threshold: `≤ ${t.temperature.max.toFixed(1)} ${t.temperature.unit}`,
              baselineValue: `${t.temperature.setpoint.toFixed(1)} ${t.temperature.unit}`,
              delta: 'Within normal envelope',
              faultCategory: 'Normal Operation',
              contributingFactors: ['Sensor variables in nominal equilibrium.'],
              recommendedAction: 'All sensor telemetry within nominal tolerances.',
            };

            anomalyScorePct = Math.round(7 + Math.sin(nowMs / 12000 + phase) * 3);
            newStatus = 'HEALTHY';
            healthScore = Math.round(95 + Math.cos(nowMs / 10000 + phase) * 2);
          }

          const newReading: SensorReading = {
            timestamp: nowStr,
            temperature: newTemp,
            vibration: newVib,
            pressure: newPres,
            rpm: newRpm,
            current: newCurrent,
          };

          // DEDUPLICATION LOGIC:
          // Only the 2 designated anomalous machines (or active fault target) register open incidents
          if (prediction.anomaly && (prediction.severity === 'CRITICAL' || prediction.severity === 'HIGH')) {
            setAnomalies(prevAnomalies => {
              const existingOpenIdx = prevAnomalies.findIndex(
                a => a.machineId === m.id && a.status !== 'RESOLVED'
              );

              if (existingOpenIdx >= 0) {
                // Update existing record rather than creating duplicates
                const updated = [...prevAnomalies];
                updated[existingOpenIdx] = {
                  ...updated[existingOpenIdx],
                  detectedValue: prediction.detectedValue,
                  delta: prediction.delta,
                  anomalyScore: anomalyScorePct,
                  severity: prediction.severity,
                  contributingFactors: prediction.contributingFactors,
                };
                return updated;
              } else {
                // Create single new open incident
                const newAnomaly: AnomalyRecord = {
                  id: `anom_${nowMs}_${m.id}`,
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  timestamp: nowMs,
                  machineId: m.id,
                  machineName: m.name,
                  parameter: prediction.parameter,
                  detectedValue: prediction.detectedValue,
                  expectedRange: prediction.expectedRange,
                  threshold: prediction.threshold,
                  baselineValue: prediction.baselineValue,
                  delta: prediction.delta,
                  anomalyScore: anomalyScorePct,
                  severity: prediction.severity,
                  status: 'OPEN',
                  faultCategory: prediction.faultCategory,
                  contributingFactors: prediction.contributingFactors,
                  recommendedAction: prediction.recommendedAction,
                };

                // Also update or add alert
                const newAlert: AlertRecord = {
                  id: `alt_${nowMs}_${m.id}`,
                  anomalyId: newAnomaly.id,
                  machineId: m.id,
                  machineName: m.name,
                  title: `${prediction.severity} Anomaly: ${prediction.parameter} Out of Bounds`,
                  message: `${m.name} registered ${prediction.detectedValue}, exceeding normal operating threshold (${prediction.threshold}).`,
                  severity: prediction.severity,
                  anomalyScore: anomalyScorePct,
                  timestamp: 'Just now',
                  status: prediction.severity === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
                  recommendedAction: prediction.recommendedAction,
                  emailDispatched: true,
                  emailRecipient: 'maintenance-shift@smartiot.industrial',
                };

                setAlerts(prev => [newAlert, ...prev.slice(0, 49)]);

                setEmailDispatches(prev => [
                  {
                    id: `mail_${nowMs}`,
                    timestamp: 'Just now',
                    recipient: 'maintenance-shift@smartiot.industrial',
                    subject: `[SMART IoT ALERT] ${prediction.severity} Anomaly on ${m.name}`,
                    body: `Machine: ${m.name} (${m.location})\nSensor: ${prediction.parameter} -> ${prediction.detectedValue}\nRange: ${prediction.expectedRange}\nSeverity: ${prediction.severity}\nScore: ${anomalyScorePct}%\nAction: ${prediction.recommendedAction}`,
                    status: 'SENT',
                  },
                  ...prev.slice(0, 19),
                ]);

                return [newAnomaly, ...prevAnomalies.slice(0, 49)];
              }
            });
          }

          const updatedHistory = [...(m.history || []).slice(-23), newReading];

          return {
            ...m,
            temperature: newTemp,
            vibration: newVib,
            pressure: newPres,
            rpm: newRpm,
            current: newCurrent,
            anomalyScore: anomalyScorePct,
            healthScore,
            status: newStatus,
            lastUpdated: 'Just now',
            history: updatedHistory,
          };
        });
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [isSimulating, simulationFault, faultTargetMachineId]);

  // Add Machine / System
  const addMachine = useCallback((payload: AddMachinePayload): Machine => {
    const newId = `mach_${Date.now().toString(36)}`;
    const initialTemp = payload.thresholds.temperature.setpoint;
    const initialVib = payload.thresholds.vibration.setpoint;
    const initialPres = payload.thresholds.pressure.setpoint;
    const initialRpm = payload.thresholds.rpm.setpoint;
    const initialAmp = payload.thresholds.current?.setpoint || 18.0;

    const newMachine: Machine = {
      id: newId,
      name: payload.name.trim(),
      type: payload.type.trim(),
      location: payload.location.trim() || 'Plant Floor',
      status: 'HEALTHY',
      healthScore: 98,
      temperature: initialTemp,
      vibration: initialVib,
      pressure: initialPres,
      rpm: initialRpm,
      current: initialAmp,
      lastUpdated: 'Just now',
      anomalyScore: 8,
      thresholds: payload.thresholds,
      createdManually: true,
      history: generateSyntheticHistory(
        payload.thresholds,
        initialTemp,
        initialVib,
        initialPres,
        initialRpm,
        initialAmp
      ),
    };

    setMachines(prev => [newMachine, ...prev]);
    return newMachine;
  }, []);

  const deleteMachine = useCallback((id: string) => {
    setMachines(prev => prev.filter(m => m.id !== id));
    if (selectedMachineId === id) setSelectedMachineId(null);
  }, [selectedMachineId]);

  // Resolve Alert
  const resolveAlert = useCallback((id: string, notes?: string) => {
    const resolverName = currentUser?.name || 'Operations Lead';
    let targetMachineId: string | undefined;

    setAlerts(prev => prev.map(a => {
      if (a.id === id) {
        targetMachineId = a.machineId;
        return {
          ...a,
          status: 'RESOLVED',
          resolvedAt: 'Just now',
          resolvedBy: resolverName,
          resolutionNotes: notes || 'Verified operational parameters within baseline.',
        };
      }
      return a;
    }));

    // If an associated anomaly exists, mark it resolved too
    setAnomalies(prev => prev.map(a => {
      if (a.machineId === targetMachineId && a.status !== 'RESOLVED') {
        return {
          ...a,
          status: 'RESOLVED',
          resolvedAt: 'Just now',
          resolvedBy: resolverName,
          resolutionNotes: notes || 'Resolved via alert center confirmation.',
        };
      }
      return a;
    }));

    // Reset machine state back to healthy
    if (targetMachineId) {
      setMachines(prev => prev.map(m => {
        if (m.id === targetMachineId) {
          const t = m.thresholds;
          return {
            ...m,
            status: 'HEALTHY',
            anomalyScore: 12,
            healthScore: 94,
            vibration: t.vibration.setpoint,
            temperature: t.temperature.setpoint,
            pressure: t.pressure.setpoint,
            activeAnomalyId: undefined,
          };
        }
        return m;
      }));
    }

    if (simulationFault !== 'NONE') {
      clearActiveFault();
    }
  }, [currentUser, simulationFault, clearActiveFault]);

  // Resolve Anomaly
  const resolveAnomaly = useCallback((id: string, notes?: string) => {
    const resolverName = currentUser?.name || 'Operations Lead';
    let targetMachineId: string | undefined;

    setAnomalies(prev => prev.map(a => {
      if (a.id === id) {
        targetMachineId = a.machineId;
        return {
          ...a,
          status: 'RESOLVED',
          resolvedAt: 'Just now',
          resolvedBy: resolverName,
          resolutionNotes: notes || 'Routine inspection completed. Sensor verified nominal.',
        };
      }
      return a;
    }));

    // Also mark related alert as resolved
    setAlerts(prev => prev.map(alt => {
      if (alt.machineId === targetMachineId && alt.status !== 'RESOLVED') {
        return {
          ...alt,
          status: 'RESOLVED',
          resolvedAt: 'Just now',
          resolvedBy: resolverName,
          resolutionNotes: notes || 'Resolved via anomaly investigation inspection.',
        };
      }
      return alt;
    }));

    // Return machine to healthy baseline
    if (targetMachineId) {
      setMachines(prev => prev.map(m => {
        if (m.id === targetMachineId) {
          const t = m.thresholds;
          return {
            ...m,
            status: 'HEALTHY',
            anomalyScore: 11,
            healthScore: 95,
            vibration: t.vibration.setpoint,
            temperature: t.temperature.setpoint,
            pressure: t.pressure.setpoint,
            activeAnomalyId: undefined,
          };
        }
        return m;
      }));
    }

    if (simulationFault !== 'NONE') {
      clearActiveFault();
    }
  }, [currentUser, simulationFault, clearActiveFault]);

  const selectedMachine = machines.find(m => m.id === selectedMachineId);

  // Compute stats
  const totalMachines = machines.length;
  const healthyCount = machines.filter(m => m.status === 'HEALTHY').length;
  const warningCount = machines.filter(m => m.status === 'WARNING').length;
  const criticalCount = machines.filter(m => m.status === 'CRITICAL').length;
  const averageHealth = totalMachines > 0
    ? Math.round(machines.reduce((acc, m) => acc + m.healthScore, 0) / totalMachines)
    : 0;
  const openAnomaliesCount = anomalies.filter(a => a.status === 'OPEN').length;
  const criticalAlertsCount = alerts.filter(a => a.status === 'CRITICAL').length;

  return (
    <IoTContext.Provider
      value={{
        machines,
        selectedMachineId,
        setSelectedMachineId,
        selectedMachine,
        anomalies,
        alerts,
        selectedAnomaly,
        setSelectedAnomaly,
        resolveAlert,
        resolveAnomaly,
        simulationFault,
        faultTargetMachineId,
        setFaultTargetMachineId,
        faultSecondsRemaining,
        triggerFaultNow,
        clearActiveFault,
        isSimulating,
        startSimulation,
        stopSimulation,
        toggleSimulation,
        addMachine,
        deleteMachine,
        emailDispatches,
        stats: {
          totalMachines,
          healthyCount,
          warningCount,
          criticalCount,
          averageHealth,
          openAnomaliesCount,
          criticalAlertsCount,
        },
      }}
    >
      {children}
    </IoTContext.Provider>
  );
};

export function useIoT() {
  const ctx = useContext(IoTContext);
  if (!ctx) throw new Error('useIoT must be used inside IoTProvider');
  return ctx;
}
