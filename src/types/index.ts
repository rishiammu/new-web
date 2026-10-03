export type MachineStatus = 'HEALTHY' | 'WARNING' | 'CRITICAL';

export type AnomalySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface SensorThresholdConfig {
  min: number;
  max: number;
  criticalMin?: number;
  criticalMax?: number;
  unit: string;
  setpoint: number;
}

export interface MachineThresholds {
  temperature: SensorThresholdConfig;
  vibration: SensorThresholdConfig;
  pressure: SensorThresholdConfig;
  rpm: SensorThresholdConfig;
  current?: SensorThresholdConfig;
}

export interface SensorReading {
  timestamp: string;
  temperature: number; // °C
  vibration: number;   // mm/s
  pressure: number;    // bar
  rpm: number;         // RPM
  current?: number;    // A (Amperes)
}

export interface Machine {
  id: string;
  name: string;
  type: string;
  location: string;
  status: MachineStatus;
  healthScore: number; // 0-100%
  temperature: number;
  vibration: number;
  pressure: number;
  rpm: number;
  current?: number;
  lastUpdated: string;
  anomalyScore: number; // 0-100%
  thresholds: MachineThresholds;
  activeAnomalyId?: string;
  history: SensorReading[];
  createdManually?: boolean;
}

export interface AnomalyRecord {
  id: string;
  time: string;
  timestamp: number;
  machineId: string;
  machineName: string;
  parameter: 'Temperature' | 'Vibration' | 'Pressure' | 'RPM' | 'Current' | 'Multi-Sensor';
  detectedValue: string;
  expectedRange: string;
  threshold: string;
  baselineValue: string;
  delta: string;
  anomalyScore: number; // 0-100%
  severity: AnomalySeverity;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
  faultCategory: string;
  contributingFactors: string[];
  recommendedAction: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
}

export interface AlertRecord {
  id: string;
  anomalyId?: string;
  machineId: string;
  machineName: string;
  title: string;
  message: string;
  severity: AnomalySeverity;
  anomalyScore: number;
  timestamp: string;
  status: 'CRITICAL' | 'WARNING' | 'RESOLVED';
  recommendedAction: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
  emailDispatched: boolean;
  emailRecipient?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'OPERATIONS_ENGINEER' | 'PLANT_MANAGER' | 'MAINTENANCE_LEAD';
}

export type SimulationFaultType = 'NONE' | 'VIBRATION_SPIKE' | 'THERMAL_RUNAWAY' | 'PRESSURE_DROP' | 'CAVITATION_RPM' | 'OVERCURRENT';
