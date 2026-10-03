import { AlertRecord, AnomalyRecord, Machine, MachineThresholds, SensorReading } from '../types';

export const BASELINE_THRESHOLDS_MILLING: MachineThresholds = {
  temperature: { min: 45.0, max: 72.0, criticalMax: 82.0, unit: '°C', setpoint: 62.0 },
  vibration: { min: 1.5, max: 4.5, criticalMax: 6.5, unit: 'mm/s', setpoint: 2.8 },
  pressure: { min: 5.5, max: 7.8, criticalMin: 4.0, unit: 'bar', setpoint: 6.8 },
  rpm: { min: 2400, max: 3600, unit: 'RPM', setpoint: 2850 },
  current: { min: 14.0, max: 26.0, criticalMax: 32.0, unit: 'A', setpoint: 19.2 },
};

export const BASELINE_THRESHOLDS_MOTOR: MachineThresholds = {
  temperature: { min: 50.0, max: 75.0, criticalMax: 85.0, unit: '°C', setpoint: 68.0 },
  vibration: { min: 2.0, max: 5.0, criticalMax: 7.0, unit: 'mm/s', setpoint: 3.5 },
  pressure: { min: 5.0, max: 7.5, criticalMin: 3.5, unit: 'bar', setpoint: 6.2 },
  rpm: { min: 1400, max: 1600, unit: 'RPM', setpoint: 1480 },
  current: { min: 18.0, max: 32.0, criticalMax: 40.0, unit: 'A', setpoint: 24.5 },
};

export const BASELINE_THRESHOLDS_PUMP: MachineThresholds = {
  temperature: { min: 40.0, max: 68.0, criticalMax: 78.0, unit: '°C', setpoint: 56.0 },
  vibration: { min: 1.5, max: 4.2, criticalMax: 6.0, unit: 'mm/s', setpoint: 2.5 },
  pressure: { min: 6.0, max: 8.5, criticalMin: 4.5, unit: 'bar', setpoint: 7.4 },
  rpm: { min: 1600, max: 1900, unit: 'RPM', setpoint: 1750 },
  current: { min: 12.0, max: 24.0, criticalMax: 30.0, unit: 'A', setpoint: 16.8 },
};

export const BASELINE_THRESHOLDS_TURBINE: MachineThresholds = {
  temperature: { min: 50.0, max: 70.0, criticalMax: 80.0, unit: '°C', setpoint: 61.0 },
  vibration: { min: 1.2, max: 3.8, criticalMax: 5.5, unit: 'mm/s', setpoint: 2.2 },
  pressure: { min: 6.2, max: 8.2, criticalMin: 4.8, unit: 'bar', setpoint: 7.2 },
  rpm: { min: 2800, max: 3200, unit: 'RPM', setpoint: 3000 },
  current: { min: 22.0, max: 38.0, criticalMax: 46.0, unit: 'A', setpoint: 29.0 },
};

export const BASELINE_THRESHOLDS_COMPRESSOR: MachineThresholds = {
  temperature: { min: 55.0, max: 76.0, criticalMax: 86.0, unit: '°C', setpoint: 66.5 },
  vibration: { min: 2.0, max: 4.8, criticalMax: 6.8, unit: 'mm/s', setpoint: 3.4 },
  pressure: { min: 6.5, max: 8.8, criticalMin: 5.0, unit: 'bar', setpoint: 7.6 },
  rpm: { min: 2000, max: 2400, unit: 'RPM', setpoint: 2200 },
  current: { min: 16.0, max: 30.0, criticalMax: 38.0, unit: 'A', setpoint: 22.0 },
};

export const BASELINE_THRESHOLDS_CONVEYOR: MachineThresholds = {
  temperature: { min: 38.0, max: 62.0, criticalMax: 72.0, unit: '°C', setpoint: 51.0 },
  vibration: { min: 1.0, max: 3.5, criticalMax: 5.0, unit: 'mm/s', setpoint: 2.0 },
  pressure: { min: 4.5, max: 6.5, criticalMin: 3.0, unit: 'bar', setpoint: 5.8 },
  rpm: { min: 1350, max: 1500, unit: 'RPM', setpoint: 1420 },
  current: { min: 8.0, max: 18.0, criticalMax: 24.0, unit: 'A', setpoint: 12.5 },
};

export function generateSyntheticHistory(
  thresholds: MachineThresholds,
  currentTemp: number,
  currentVib: number,
  currentPres: number,
  currentRpm: number,
  currentAmp: number = 20.0
): SensorReading[] {
  const now = Date.now();
  const list: SensorReading[] = [];

  for (let i = 24; i >= 0; i--) {
    const t = new Date(now - i * 15000);
    // Smooth variance around setpoint
    const tempNoise = Math.sin(i * 0.4) * 0.6 + (Math.random() * 0.3 - 0.15);
    const vibNoise = Math.cos(i * 0.3) * 0.12 + (Math.random() * 0.08 - 0.04);
    const presNoise = Math.sin(i * 0.2) * 0.08 + (Math.random() * 0.06 - 0.03);
    const rpmNoise = Math.round(Math.sin(i * 0.5) * 8);

    // If i == 0, use the current readings
    const readingTemp = i === 0 ? currentTemp : parseFloat((thresholds.temperature.setpoint + tempNoise).toFixed(1));
    const readingVib = i === 0 ? currentVib : parseFloat((thresholds.vibration.setpoint + vibNoise).toFixed(2));
    const readingPres = i === 0 ? currentPres : parseFloat((thresholds.pressure.setpoint + presNoise).toFixed(2));
    const readingRpm = i === 0 ? currentRpm : Math.round(thresholds.rpm.setpoint + rpmNoise);
    const readingAmp = parseFloat(((thresholds.current?.setpoint || 20.0) + (Math.random() * 0.8 - 0.4)).toFixed(1));

    list.push({
      timestamp: t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      temperature: readingTemp,
      vibration: readingVib,
      pressure: readingPres,
      rpm: readingRpm,
      current: readingAmp,
    });
  }
  return list;
}

export function getInitialMachines(): Machine[] {
  return [
    {
      id: 'mach_01',
      name: 'CNC Milling Machine 01',
      type: 'Computer Numerical Control (CNC) Milling Machine',
      location: 'Workshop Section A (Metal Machining)',
      status: 'HEALTHY',
      healthScore: 96,
      temperature: 63.8,
      vibration: 2.85,
      pressure: 6.8,
      rpm: 2850,
      current: 19.4,
      lastUpdated: 'Just now',
      anomalyScore: 9,
      thresholds: BASELINE_THRESHOLDS_MILLING,
      history: generateSyntheticHistory(BASELINE_THRESHOLDS_MILLING, 63.8, 2.85, 6.8, 2850, 19.4),
    },
    {
      id: 'mach_02',
      name: 'Electric Motor 02',
      type: 'Three-Phase Electric Induction Motor',
      location: 'Conveyor Line B (Assembly Line)',
      status: 'WARNING',
      healthScore: 78,
      temperature: 71.2,
      vibration: 5.48, // Elevated above 5.0 mm/s threshold (Anomaly 1)
      pressure: 6.2,
      rpm: 1480,
      current: 26.8,
      lastUpdated: 'Just now',
      anomalyScore: 64,
      thresholds: BASELINE_THRESHOLDS_MOTOR,
      activeAnomalyId: 'anom_01',
      history: generateSyntheticHistory(BASELINE_THRESHOLDS_MOTOR, 71.2, 5.48, 6.2, 1480, 26.8),
    },
    {
      id: 'mach_03',
      name: 'Hydraulic Pump 03',
      type: 'High-Pressure Hydraulic Piston Pump',
      location: 'Stamping Press Unit C',
      status: 'HEALTHY',
      healthScore: 95,
      temperature: 56.4,
      vibration: 2.45,
      pressure: 7.4,
      rpm: 1750,
      current: 17.1,
      lastUpdated: 'Just now',
      anomalyScore: 10,
      thresholds: BASELINE_THRESHOLDS_PUMP,
      history: generateSyntheticHistory(BASELINE_THRESHOLDS_PUMP, 56.4, 2.45, 7.4, 1750, 17.1),
    },
    {
      id: 'mach_04',
      name: 'Turbine Generator 04',
      type: 'Industrial Steam Turbine Power Generator',
      location: 'Power Generation Unit 4',
      status: 'HEALTHY',
      healthScore: 97,
      temperature: 61.2,
      vibration: 2.18,
      pressure: 7.2,
      rpm: 3000,
      current: 29.4,
      lastUpdated: 'Just now',
      anomalyScore: 8,
      thresholds: BASELINE_THRESHOLDS_TURBINE,
      history: generateSyntheticHistory(BASELINE_THRESHOLDS_TURBINE, 61.2, 2.18, 7.2, 3000, 29.4),
    },
    {
      id: 'mach_05',
      name: 'Air Compressor 05',
      type: 'Industrial Rotary Screw Air Compressor',
      location: 'Pneumatics & Compressed Air Bay',
      status: 'WARNING',
      healthScore: 76,
      temperature: 78.6, // Elevated above 76.0 °C threshold (Anomaly 2)
      vibration: 3.42,
      pressure: 7.5,
      rpm: 2200,
      current: 24.2,
      lastUpdated: 'Just now',
      anomalyScore: 61,
      thresholds: BASELINE_THRESHOLDS_COMPRESSOR,
      activeAnomalyId: 'anom_02',
      history: generateSyntheticHistory(BASELINE_THRESHOLDS_COMPRESSOR, 78.6, 3.42, 7.5, 2200, 24.2),
    },
    {
      id: 'mach_06',
      name: 'Conveyor Belt 06',
      type: 'Heavy-Duty Packaging Conveyor Belt Drive',
      location: 'Packaging & Warehouse Logistics',
      status: 'HEALTHY',
      healthScore: 96,
      temperature: 51.5,
      vibration: 1.95,
      pressure: 5.8,
      rpm: 1420,
      current: 12.8,
      lastUpdated: 'Just now',
      anomalyScore: 8,
      thresholds: BASELINE_THRESHOLDS_CONVEYOR,
      history: generateSyntheticHistory(BASELINE_THRESHOLDS_CONVEYOR, 51.5, 1.95, 5.8, 1420, 12.8),
    }
  ];
}

export function getInitialAnomalies(): AnomalyRecord[] {
  return [
    {
      id: 'anom_01',
      time: '10:42 AM',
      timestamp: Date.now() - 18 * 60 * 1000,
      machineId: 'mach_02',
      machineName: 'Electric Motor 02',
      parameter: 'Vibration',
      detectedValue: '5.48 mm/s',
      expectedRange: '2.0 – 5.0 mm/s',
      threshold: '> 5.0 mm/s',
      baselineValue: '3.5 mm/s',
      delta: '+0.48 mm/s above safe threshold',
      anomalyScore: 64,
      severity: 'HIGH',
      status: 'OPEN',
      faultCategory: 'Motor Shaft Misalignment & Bearing Wear',
      contributingFactors: [
        'Vibration amplitude exceeded standard ISO 10816 operating ceiling (5.0 mm/s)',
        'Drive shaft axial vibration trending upward across telemetry cycles'
      ],
      recommendedAction: 'Inspect drive bearing race condition and schedule vibration harmonic spectrum analysis.',
    },
    {
      id: 'anom_02',
      time: '10:44 AM',
      timestamp: Date.now() - 15 * 60 * 1000,
      machineId: 'mach_05',
      machineName: 'Air Compressor 05',
      parameter: 'Temperature',
      detectedValue: '78.6 °C',
      expectedRange: '55.0 – 76.0 °C',
      threshold: '> 76.0 °C',
      baselineValue: '66.5 °C',
      delta: '+2.6 °C thermal rise above threshold',
      anomalyScore: 61,
      severity: 'HIGH',
      status: 'OPEN',
      faultCategory: 'Discharge Overheat & Air Filter Blockage',
      contributingFactors: [
        'Discharge temperature exceeded continuous safe threshold (76.0 °C)',
        'Heat exchanger differential pressure indicates minor airflow restriction'
      ],
      recommendedAction: 'Inspect cooling jacket airflow and verify intake filter condition.',
    }
  ];
}

export function getInitialAlerts(): AlertRecord[] {
  return [
    {
      id: 'alt_01',
      anomalyId: 'anom_01',
      machineId: 'mach_02',
      machineName: 'Electric Motor 02',
      title: 'Elevated Bearing Vibration Detected on Electric Motor 02',
      message: 'Drive rotor vibration reached 5.48 mm/s, exceeding normal operational envelope (5.0 mm/s).',
      severity: 'HIGH',
      anomalyScore: 64,
      timestamp: '18 minutes ago',
      status: 'WARNING',
      recommendedAction: 'Inspect drive bearing race condition and schedule vibration harmonic spectrum analysis.',
      emailDispatched: true,
      emailRecipient: 'maintenance-shift@smartiot.industrial',
    },
    {
      id: 'alt_02',
      anomalyId: 'anom_02',
      machineId: 'mach_05',
      machineName: 'Air Compressor 05',
      title: 'Thermal Overheat Threshold Exceeded on Air Compressor 05',
      message: 'Compressor thermal discharge reached 78.6 °C, exceeding upper threshold (76.0 °C).',
      severity: 'HIGH',
      anomalyScore: 61,
      timestamp: '15 minutes ago',
      status: 'WARNING',
      recommendedAction: 'Inspect cooling jacket airflow and verify intake filter condition.',
      emailDispatched: true,
      emailRecipient: 'maintenance-shift@smartiot.industrial',
    }
  ];
}
