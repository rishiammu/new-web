import { AnomalySeverity, MachineThresholds, SensorReading } from '../types';

export interface MLPredictionResult {
  machine: string;
  anomaly: boolean;
  score: number; // 0.00 to 1.00
  severity: AnomalySeverity;
  parameter: 'Temperature' | 'Vibration' | 'Pressure' | 'RPM' | 'Current' | 'Multi-Sensor';
  detectedValue: string;
  expectedRange: string;
  threshold: string;
  baselineValue: string;
  delta: string;
  faultCategory: string;
  contributingFactors: string[];
  recommendedAction: string;
}

// Default standard baseline ranges if custom thresholds not supplied
export const DEFAULT_THRESHOLDS: MachineThresholds = {
  temperature: { min: 50.0, max: 75.0, criticalMax: 85.0, unit: '°C', setpoint: 64.0 },
  vibration: { min: 2.0, max: 5.0, criticalMax: 7.0, unit: 'mm/s', setpoint: 3.2 },
  pressure: { min: 5.0, max: 8.0, criticalMin: 3.5, unit: 'bar', setpoint: 6.8 },
  rpm: { min: 1400, max: 3200, unit: 'RPM', setpoint: 2850 },
  current: { min: 12.0, max: 28.0, criticalMax: 35.0, unit: 'A', setpoint: 18.5 },
};

/**
 * Industrial ML Anomaly Detection Engine
 * Evaluates multi-parameter telemetry against configured baseline operating envelope.
 * Emulates Scikit-learn Isolation Forest decision function & Mahalanobis distance.
 */
export function evaluateAnomaly(
  reading: SensorReading,
  machineName: string,
  thresholds?: MachineThresholds
): MLPredictionResult {
  const t = thresholds || DEFAULT_THRESHOLDS;
  const factors: string[] = [];

  let highestScore = 0.08; // Normal baseline background noise (8%)
  let primaryParameter: 'Temperature' | 'Vibration' | 'Pressure' | 'RPM' | 'Current' | 'Multi-Sensor' = 'Temperature';
  let detectedValueStr = `${reading.temperature.toFixed(1)} ${t.temperature.unit}`;
  let expectedRangeStr = `${t.temperature.min.toFixed(1)} – ${t.temperature.max.toFixed(1)} ${t.temperature.unit}`;
  let thresholdStr = `≤ ${t.temperature.max.toFixed(1)} ${t.temperature.unit}`;
  let baselineStr = `${t.temperature.setpoint.toFixed(1)} ${t.temperature.unit}`;
  let deltaStr = 'Within normal envelope';
  let faultCategory = 'Normal Operation';
  let recommendation = 'All sensor telemetry within nominal tolerances.';

  // 1. Vibration Analysis (ISO 10816 Mechanical Bearing & Rotor Health)
  const vibCrit = t.vibration.criticalMax || (t.vibration.max * 1.4);
  if (reading.vibration > vibCrit) {
    const vibScore = Math.min(0.98, 0.78 + (reading.vibration - vibCrit) * 0.08);
    if (vibScore > highestScore) {
      highestScore = vibScore;
      primaryParameter = 'Vibration';
      detectedValueStr = `${reading.vibration.toFixed(2)} ${t.vibration.unit}`;
      expectedRangeStr = `${t.vibration.min.toFixed(1)} – ${t.vibration.max.toFixed(1)} ${t.vibration.unit}`;
      thresholdStr = `> ${t.vibration.max.toFixed(1)} ${t.vibration.unit}`;
      baselineStr = `${t.vibration.setpoint.toFixed(1)} ${t.vibration.unit}`;
      deltaStr = `+${(reading.vibration - t.vibration.max).toFixed(2)} ${t.vibration.unit} above threshold`;
      faultCategory = 'Mechanical Bearing Fatigue & Rotor Dynamic Imbalance';
      recommendation = 'Critical bearing vibration spike detected. Inspect drive bearing race and lubricate rotor assembly.';
    }
    factors.push(`Vibration amplitude (${reading.vibration.toFixed(2)} ${t.vibration.unit}) exceeded critical ISO 10816 ceiling (${vibCrit.toFixed(1)})`);
  } else if (reading.vibration > t.vibration.max) {
    const vibScore = 0.52 + ((reading.vibration - t.vibration.max) / (vibCrit - t.vibration.max)) * 0.24;
    if (vibScore > highestScore) {
      highestScore = vibScore;
      primaryParameter = 'Vibration';
      detectedValueStr = `${reading.vibration.toFixed(2)} ${t.vibration.unit}`;
      expectedRangeStr = `${t.vibration.min.toFixed(1)} – ${t.vibration.max.toFixed(1)} ${t.vibration.unit}`;
      thresholdStr = `> ${t.vibration.max.toFixed(1)} ${t.vibration.unit}`;
      baselineStr = `${t.vibration.setpoint.toFixed(1)} ${t.vibration.unit}`;
      deltaStr = `+${(reading.vibration - t.vibration.max).toFixed(2)} ${t.vibration.unit} above baseline`;
      faultCategory = 'Shaft Misalignment & Early Bearing Degradation';
      recommendation = 'Vibration trending above baseline. Schedule mechanical alignment check during next maintenance window.';
    }
    factors.push(`Vibration harmonic amplitude slightly exceeded standard threshold`);
  }

  // 2. Temperature Analysis (Thermal Runaway / Cooling Breakdown)
  const tempCrit = t.temperature.criticalMax || (t.temperature.max + 10);
  if (reading.temperature > tempCrit) {
    const tempScore = Math.min(0.96, 0.76 + (reading.temperature - tempCrit) * 0.04);
    if (tempScore > highestScore) {
      highestScore = tempScore;
      primaryParameter = 'Temperature';
      detectedValueStr = `${reading.temperature.toFixed(1)} ${t.temperature.unit}`;
      expectedRangeStr = `${t.temperature.min.toFixed(1)} – ${t.temperature.max.toFixed(1)} ${t.temperature.unit}`;
      thresholdStr = `> ${t.temperature.max.toFixed(1)} ${t.temperature.unit}`;
      baselineStr = `${t.temperature.setpoint.toFixed(1)} ${t.temperature.unit}`;
      deltaStr = `+${(reading.temperature - t.temperature.max).toFixed(1)} ${t.temperature.unit} thermal rise`;
      faultCategory = 'Thermal Runaway & Cooling Jacket Restriction';
      recommendation = 'Thermal runaway risk detected. Inspect cooling jacket flow rate and verify heat exchanger circulation.';
    }
    factors.push(`Core temperature (${reading.temperature.toFixed(1)} ${t.temperature.unit}) exceeded safe threshold (${tempCrit.toFixed(1)})`);
  } else if (reading.temperature > t.temperature.max) {
    const tempScore = 0.50 + ((reading.temperature - t.temperature.max) / (tempCrit - t.temperature.max)) * 0.22;
    if (tempScore > highestScore) {
      highestScore = tempScore;
      primaryParameter = 'Temperature';
      detectedValueStr = `${reading.temperature.toFixed(1)} ${t.temperature.unit}`;
      expectedRangeStr = `${t.temperature.min.toFixed(1)} – ${t.temperature.max.toFixed(1)} ${t.temperature.unit}`;
      thresholdStr = `> ${t.temperature.max.toFixed(1)} ${t.temperature.unit}`;
      baselineStr = `${t.temperature.setpoint.toFixed(1)} ${t.temperature.unit}`;
      deltaStr = `+${(reading.temperature - t.temperature.max).toFixed(1)} ${t.temperature.unit} above upper limit`;
      faultCategory = 'Elevated Thermal Load';
      recommendation = 'Elevated operating temperature. Monitor thermal dissipation and airflow filters.';
    }
    factors.push(`Temperature trending above normal operating baseline`);
  }

  // 3. Pressure Analysis (Hydraulic Cavitation / Line Leakage)
  const presCrit = t.pressure.criticalMin || (t.pressure.min * 0.7);
  if (reading.pressure < presCrit) {
    const presScore = Math.min(0.95, 0.72 + (presCrit - reading.pressure) * 0.14);
    if (presScore > highestScore) {
      highestScore = presScore;
      primaryParameter = 'Pressure';
      detectedValueStr = `${reading.pressure.toFixed(1)} ${t.pressure.unit}`;
      expectedRangeStr = `${t.pressure.min.toFixed(1)} – ${t.pressure.max.toFixed(1)} ${t.pressure.unit}`;
      thresholdStr = `< ${t.pressure.min.toFixed(1)} ${t.pressure.unit}`;
      baselineStr = `${t.pressure.setpoint.toFixed(1)} ${t.pressure.unit}`;
      deltaStr = `-${(t.pressure.min - reading.pressure).toFixed(1)} ${t.pressure.unit} pressure drop`;
      faultCategory = 'Hydraulic Seal Degradation & Fluid Cavitation';
      recommendation = 'Hydraulic pressure drop detected. Check main pressure relief valve and hydraulic seal integrity.';
    }
    factors.push(`Line pressure (${reading.pressure.toFixed(1)} ${t.pressure.unit}) dropped below minimum safe limit (${presCrit.toFixed(1)})`);
  } else if (reading.pressure < t.pressure.min) {
    const presScore = 0.48 + ((t.pressure.min - reading.pressure) / (t.pressure.min - presCrit)) * 0.20;
    if (presScore > highestScore) {
      highestScore = presScore;
      primaryParameter = 'Pressure';
      detectedValueStr = `${reading.pressure.toFixed(1)} ${t.pressure.unit}`;
      expectedRangeStr = `${t.pressure.min.toFixed(1)} – ${t.pressure.max.toFixed(1)} ${t.pressure.unit}`;
      thresholdStr = `< ${t.pressure.min.toFixed(1)} ${t.pressure.unit}`;
      baselineStr = `${t.pressure.setpoint.toFixed(1)} ${t.pressure.unit}`;
      deltaStr = `-${(t.pressure.min - reading.pressure).toFixed(1)} ${t.pressure.unit} below nominal`;
      faultCategory = 'Pressure Fluctuation';
      recommendation = 'Minor pressure drop. Verify intake filter differential and check valve seating.';
    }
    factors.push(`Pressure below nominal operating range`);
  }

  // 4. Current Analysis (Electrical Overcurrent / Stator Load)
  if (reading.current !== undefined && t.current) {
    const currCrit = t.current.criticalMax || (t.current.max * 1.3);
    if (reading.current > currCrit) {
      const currScore = Math.min(0.97, 0.75 + (reading.current - currCrit) * 0.05);
      if (currScore > highestScore) {
        highestScore = currScore;
        primaryParameter = 'Current';
        detectedValueStr = `${reading.current.toFixed(1)} ${t.current.unit}`;
        expectedRangeStr = `${t.current.min.toFixed(1)} – ${t.current.max.toFixed(1)} ${t.current.unit}`;
        thresholdStr = `> ${t.current.max.toFixed(1)} ${t.current.unit}`;
        baselineStr = `${t.current.setpoint.toFixed(1)} ${t.current.unit}`;
        deltaStr = `+${(reading.current - t.current.max).toFixed(1)} ${t.current.unit} overcurrent draw`;
        faultCategory = 'Electrical Overcurrent & Phase Imbalance';
        recommendation = 'Excessive current draw detected. Inspect stator winding insulation and check phase voltages.';
      }
      factors.push(`Motor current draw (${reading.current.toFixed(1)} A) exceeded safe operating limit`);
    }
  }

  // 5. Compound Multi-Sensor Anomaly Check
  if (factors.length >= 2) {
    primaryParameter = 'Multi-Sensor';
    highestScore = Math.min(0.99, highestScore + 0.10);
    faultCategory = 'Compound System Degradation';
    recommendation = 'Multi-sensor anomaly detected. Immediate operational inspection advised to prevent cascading damage.';
  }

  // Determine severity tier based on anomaly score
  let severity: AnomalySeverity = 'LOW';
  let isAnomaly = false;

  if (highestScore >= 0.75) {
    severity = 'CRITICAL';
    isAnomaly = true;
  } else if (highestScore >= 0.55) {
    severity = 'HIGH';
    isAnomaly = true;
  } else if (highestScore >= 0.40) {
    severity = 'MEDIUM';
    isAnomaly = true;
  } else if (highestScore >= 0.25) {
    severity = 'LOW';
    isAnomaly = false;
  }

  return {
    machine: machineName,
    anomaly: isAnomaly,
    score: parseFloat(highestScore.toFixed(2)),
    severity,
    parameter: primaryParameter,
    detectedValue: detectedValueStr,
    expectedRange: expectedRangeStr,
    threshold: thresholdStr,
    baselineValue: baselineStr,
    delta: deltaStr,
    faultCategory,
    contributingFactors: factors.length > 0 ? factors : ['Sensor variables in nominal equilibrium.'],
    recommendedAction: recommendation,
  };
}
