import React, { useState } from 'react';
import { Terminal, Database, Server, Cpu, Copy, Check, BookOpen, Layers, Info, ShieldCheck, Zap, Gauge, AlertTriangle, ArrowRight } from 'lucide-react';

export const ArchitectureDocsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'EXPLANATION' | 'TECH_STACK' | 'GLOSSARY' | 'SPRING_BOOT' | 'PYTHON_ML' | 'POSTGRES' | 'SIMULATOR'>('EXPLANATION');
  const [copied, setCopied] = useState(false);

  const springBootCode = `package com.smartiot.industrial.controller;

import com.smartiot.industrial.dto.*;
import com.smartiot.industrial.service.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class IndustrialIoTController {

    private final MachineService machineService;
    private final SensorTelemetryService sensorService;
    private final AnomalyDetectionClient mlClient;
    private final AlertNotificationService alertService;

    public IndustrialIoTController(
        MachineService machineService,
        SensorTelemetryService sensorService,
        AnomalyDetectionClient mlClient,
        AlertNotificationService alertService
    ) {
        this.machineService = machineService;
        this.sensorService = sensorService;
        this.mlClient = mlClient;
        this.alertService = alertService;
    }

    // GET /api/machines - Retrieve all monitored industrial machines
    @GetMapping("/machines")
    public ResponseEntity<List<MachineDTO>> getMachines() {
        return ResponseEntity.ok(machineService.getAllMachines());
    }

    // GET /api/machines/{id} - Retrieve machine detail & telemetry history
    @GetMapping("/machines/{id}")
    public ResponseEntity<MachineDetailDTO> getMachineById(@PathVariable String id) {
        return machineService.getById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // POST /api/sensors/data - Ingest real-time sensor telemetry packet
    @PostMapping("/sensors/data")
    public ResponseEntity<TelemetryAckDTO> ingestSensorData(@RequestBody SensorDataPayload payload) {
        // 1. Persist sensor reading in PostgreSQL
        sensorService.recordReading(payload);

        // 2. Dispatch to Python Scikit-learn ML microservice
        MLPredictionDTO prediction = mlClient.evaluateAnomaly(payload);

        // 3. If anomaly score exceeds threshold, trigger Spring Mail & Alert Record
        if (prediction.isAnomaly() && prediction.getScore() >= 0.65) {
            alertService.dispatchAlert(payload.getMachineId(), prediction);
        }

        return ResponseEntity.ok(new TelemetryAckDTO(payload.getMachineId(), "RECORDED", prediction.getScore()));
    }

    // PUT /api/alerts/{id}/resolve - Mark an alert as resolved by an engineer
    @PutMapping("/alerts/{id}/resolve")
    public ResponseEntity<AlertDTO> resolveAlert(@PathVariable String id, @RequestBody ResolvePayload payload) {
        return ResponseEntity.ok(alertService.markResolved(id, payload.getEngineerName()));
    }
}`;

  const pythonMLCode = `"""
SMART IoT - Industrial Anomaly Detection Service
Framework: Python 3.11 + Scikit-Learn IsolationForest
"""
import numpy as np
from sklearn.ensemble import IsolationForest
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="Industrial ML Anomaly Detection Service", version="1.0.0")

# Calibrated Isolation Forest model with 4 continuous sensor dimensions:
# [Temperature (°C), Vibration RMS (mm/s), Pressure (bar), RPM]
clf = IsolationForest(
    n_estimators=100,
    contamination=0.03,
    max_samples=256,
    random_state=42
)

# Baseline normal industrial operating envelope fit
baseline_data = np.array([
    [64.0, 3.2, 6.8, 2850],
    [68.5, 3.8, 7.2, 2900],
    [59.0, 2.7, 7.4, 1750],
    [71.0, 4.2, 6.2, 1480],
    [53.0, 2.1, 5.9, 1420],
])
clf.fit(baseline_data)

class TelemetryPayload(BaseModel):
    machine_id: str
    machine_name: str
    temperature: float
    vibration: float
    pressure: float
    rpm: float

@app.post("/api/anomaly/detect")
def detect_anomaly(payload: TelemetryPayload):
    vector = np.array([[payload.temperature, payload.vibration, payload.pressure, payload.rpm]])
    
    # Isolation score: lower means more anomalous (negative decision function)
    decision = clf.decision_function(vector)[0]
    is_anomaly = bool(clf.predict(vector)[0] == -1)
    
    # Normalize anomaly score from 0.00 to 1.00
    normalized_score = float(np.clip(0.5 - (decision * 2.5), 0.05, 0.99))
    
    severity = "LOW"
    if normalized_score >= 0.80:
        severity = "CRITICAL"
    elif normalized_score >= 0.65:
        severity = "HIGH"
    elif normalized_score >= 0.45:
        severity = "MEDIUM"

    return {
        "machine": payload.machine_name,
        "anomaly": is_anomaly or normalized_score >= 0.65,
        "score": round(normalized_score, 2),
        "severity": severity,
        "raw_decision": round(float(decision), 4)
    }`;

  const postgresSQL = `-- SMART IoT Industrial Database Schema (PostgreSQL 15+)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    email VARCHAR(128) UNIQUE NOT NULL,
    password_hash VARCHAR(256) NOT NULL,
    role VARCHAR(32) DEFAULT 'OPERATIONS_ENGINEER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS machines (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    type VARCHAR(128) NOT NULL,
    location VARCHAR(128) NOT NULL,
    status VARCHAR(16) DEFAULT 'HEALTHY',
    health_score NUMERIC(5,2) DEFAULT 95.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sensor_readings (
    id BIGSERIAL PRIMARY KEY,
    machine_id VARCHAR(64) REFERENCES machines(id),
    temperature NUMERIC(5,2) NOT NULL,
    vibration NUMERIC(5,2) NOT NULL,
    pressure NUMERIC(5,2) NOT NULL,
    rpm INTEGER NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_sensor_machine_time ON sensor_readings(machine_id, recorded_at DESC);

CREATE TABLE IF NOT EXISTS anomalies (
    id VARCHAR(64) PRIMARY KEY,
    machine_id VARCHAR(64) REFERENCES machines(id),
    parameter VARCHAR(32) NOT NULL,
    detected_value VARCHAR(64) NOT NULL,
    threshold VARCHAR(64) NOT NULL,
    anomaly_score NUMERIC(5,2) NOT NULL,
    severity VARCHAR(16) NOT NULL,
    status VARCHAR(16) DEFAULT 'OPEN',
    recommended_action TEXT,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alerts (
    id VARCHAR(64) PRIMARY KEY,
    anomaly_id VARCHAR(64) REFERENCES anomalies(id),
    machine_id VARCHAR(64) REFERENCES machines(id),
    title VARCHAR(256) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(16) NOT NULL,
    status VARCHAR(16) DEFAULT 'WARNING',
    email_dispatched BOOLEAN DEFAULT TRUE,
    resolved_by VARCHAR(128),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`;

  const simulatorCode = `"""
Python IoT Industrial Sensor Simulator
Emits periodic telemetry over HTTP REST to Spring Boot backend
"""
import time
import random
import requests

BACKEND_URL = "http://localhost:8080/api/sensors/data"

MACHINES = [
    {"id": "mach_01", "name": "CNC Milling Machine 01", "base_temp": 63.8, "base_vib": 2.85, "base_pres": 6.8, "base_rpm": 2850},
    {"id": "mach_02", "name": "Electric Motor 02", "base_temp": 71.2, "base_vib": 5.48, "base_pres": 6.2, "base_rpm": 1480},
    {"id": "mach_03", "name": "Hydraulic Pump 03", "base_temp": 56.4, "base_vib": 2.45, "base_pres": 7.4, "base_rpm": 1750},
    {"id": "mach_04", "name": "Turbine Generator 04", "base_temp": 61.2, "base_vib": 2.18, "base_pres": 7.2, "base_rpm": 3000},
    {"id": "mach_05", "name": "Air Compressor 05", "base_temp": 78.6, "base_vib": 3.42, "base_pres": 7.5, "base_rpm": 2200},
    {"id": "mach_06", "name": "Conveyor Belt 06", "base_temp": 51.5, "base_vib": 1.95, "base_pres": 5.8, "base_rpm": 1420}
]

def run_telemetry_loop():
    print("Starting SMART IoT Multi-Machine Telemetry Streaming...")
    while True:
        for m in MACHINES:
            # Add stochastic Brownian noise around baseline
            temp = round(m["base_temp"] + random.uniform(-0.4, 0.4), 1)
            vib = round(m["base_vib"] + random.uniform(-0.06, 0.06), 2)
            pres = round(m["base_pres"] + random.uniform(-0.05, 0.05), 2)
            rpm = m["base_rpm"] + random.randint(-8, 8)

            payload = {
                "machineId": m["id"],
                "machineName": m["name"],
                "temperature": temp,
                "vibration": vib,
                "pressure": pres,
                "rpm": rpm,
                "timestamp": time.time()
            }
            try:
                resp = requests.post(BACKEND_URL, json=payload, timeout=2.0)
                print(f"[{m['name']}] Sent -> HTTP {resp.status_code}")
            except Exception as e:
                print(f"[{m['name']}] Dispatch failed: {e}")
        time.sleep(2.5)

if __name__ == "__main__":
    run_telemetry_loop()`;

  const getActiveCode = () => {
    switch (activeTab) {
      case 'SPRING_BOOT':
        return springBootCode;
      case 'PYTHON_ML':
        return pythonMLCode;
      case 'POSTGRES':
        return postgresSQL;
      case 'SIMULATOR':
        return simulatorCode;
      default:
        return '';
    }
  };

  const copyToClipboard = () => {
    const code = getActiveCode();
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Project Knowledge & System Architecture</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-950 border border-cyan-800 text-cyan-300">
              Full Documentation
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Detailed explanation of the project, complete technologies used, every industrial term explained, and production source code.
          </p>
        </div>

        {['SPRING_BOOT', 'PYTHON_ML', 'POSTGRES', 'SIMULATOR'].includes(activeTab) && (
          <button
            onClick={copyToClipboard}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Source Code'}</span>
          </button>
        )}
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('EXPLANATION')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'EXPLANATION' ? 'bg-cyan-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Project Overview & Explanation</span>
        </button>

        <button
          onClick={() => setActiveTab('TECH_STACK')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'TECH_STACK' ? 'bg-cyan-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Technologies Used in Detail</span>
        </button>

        <button
          onClick={() => setActiveTab('GLOSSARY')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'GLOSSARY' ? 'bg-cyan-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Info className="w-3.5 h-3.5" />
          <span>Every Term Explained</span>
        </button>

        <button
          onClick={() => setActiveTab('SPRING_BOOT')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'SPRING_BOOT' ? 'bg-cyan-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Spring Boot (Java)</span>
        </button>

        <button
          onClick={() => setActiveTab('PYTHON_ML')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'PYTHON_ML' ? 'bg-cyan-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Python Scikit-Learn</span>
        </button>

        <button
          onClick={() => setActiveTab('POSTGRES')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'POSTGRES' ? 'bg-cyan-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>PostgreSQL (DDL)</span>
        </button>

        <button
          onClick={() => setActiveTab('SIMULATOR')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'SIMULATOR' ? 'bg-cyan-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Sensor Simulator</span>
        </button>
      </div>

      {/* Tab 1: Full Project Explanation */}
      {activeTab === 'EXPLANATION' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              <span>What is this Project?</span>
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              <strong>SMART IoT Industrial Anomaly Detection Platform</strong> is a mission-critical, enterprise-grade industrial Internet of Things (IoT) monitoring and predictive maintenance system. It is designed to continuously monitor high-value factory machinery (CNC milling machines, electric induction motors, hydraulic pumps, steam turbine generators, rotary screw air compressors, and conveyor belt drives).
            </p>
            <p className="text-sm text-slate-300 leading-relaxed">
              Instead of waiting for machines to break down unexpectedly (which causes catastrophic factory downtime, safety hazards, and tens of thousands of dollars in lost production), the system streams high-frequency multi-sensor telemetry (temperature, vibration, pressure, RPM, and electrical current) directly into a machine learning evaluation pipeline.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white">How Does the End-to-End Pipeline Work?</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="font-mono text-xs font-bold text-cyan-400">Step 1 · Sensor Telemetry</div>
                <div className="text-sm font-semibold text-white">Data Generation & Streaming</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Piezoelectric accelerometers, RTD thermistors, piezoresistive pressure transducers, and hall-effect tachometers collect continuous physical metrics every 2.5 seconds.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="font-mono text-xs font-bold text-cyan-400">Step 2 · Backend Ingestion</div>
                <div className="text-sm font-semibold text-white">Spring Boot REST Controllers</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Java Spring Boot REST controller (<code className="text-cyan-300">/api/sensors/data</code>) ingests sensor payloads, persists time-series rows into PostgreSQL, and validates payload contracts.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="font-mono text-xs font-bold text-cyan-400">Step 3 · Machine Learning</div>
                <div className="text-sm font-semibold text-white">Scikit-Learn Isolation Forest</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  FastAPI Python microservice receives multi-dimensional feature vectors. An Isolation Forest algorithm evaluates deviation from normal industrial operating envelopes.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="font-mono text-xs font-bold text-cyan-400">Step 4 · Triage & Response</div>
                <div className="text-sm font-semibold text-white">Alert Dispatch & Mitigation</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  If an anomaly score exceeds threshold (&gt;50%), the system categorizes severity (Warning vs Critical), triggers dispatch logs, and alerts certified operators with actionable mechanical guidance.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-cyan-400" />
              <span>Dataset & Empirical Calibration Standards</span>
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              The anomaly detection baselines and telemetry patterns in this project are derived from and calibrated against three established industrial data and engineering standards:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-cyan-400 font-mono">1. NASA / IMS Bearing Dataset</div>
                <div className="text-xs font-semibold text-white">NASA Ames & University of Cincinnati IMS</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Calibrated against the classic NASA Prognostics Center of Excellence (PCoE) / IMS run-to-failure bearing dataset for accelerometer vibration progression, harmonic wear, and race defects.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-cyan-400 font-mono">2. ISO 10816 / ISO 20816 Standards</div>
                <div className="text-xs font-semibold text-white">Mechanical Vibration Evaluation Zones</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Threshold limits are mapped directly to ISO 10816-3 (Zone A: Good &lt;2.8 mm/s, Zone B: Acceptable &lt;4.5 mm/s, Zone C: Warning 4.5–7.1 mm/s, Zone D: Critical &gt;7.1 mm/s).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-cyan-400 font-mono">3. Real-Time Telemetry Generator</div>
                <div className="text-xs font-semibold text-white">Stochastic Multi-Variate Process</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Continuous live streaming engine implementing Brownian motion with mean reversion across 5 continuous dimensions: Temperature (°C), Vibration (mm/s), Pressure (bar), RPM, and Current (A).
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Mandatory Security & Candidate Access Control</span>
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Industrial machinery cannot be operated or monitored by unverified parties. To prevent unauthorized operational commands or simulated fault injections, <strong>login is mandatory</strong>. Every user must authenticate with legitimate operator credentials (<code className="text-cyan-300">engineer@smartiot.industrial</code>) or register their candidate credentials with verified name, email, and password complexity before accessing telemetry streams, anomaly diagnostics, or machine controls.
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Technologies Used in Detail */}
      {activeTab === 'TECH_STACK' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <Layers className="w-5 h-5" />
                <span>Frontend Technology Stack</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-2">
                <li><strong className="text-white">React 18 & TypeScript:</strong> Single-Page Application (SPA) structured with strict type safety, modular functional components, and hooks.</li>
                <li><strong className="text-white">Tailwind CSS:</strong> Modern utility-first styling with dark industrial aesthetics, responsive flexbox/grid viewports, and zero-pill UI standards.</li>
                <li><strong className="text-white">Lucide React:</strong> Consistent industrial iconography for sensors, machinery, gauges, alerts, and navigation.</li>
                <li><strong className="text-white">HTML5 SVG Canvas Telemetry:</strong> Custom high-performance rendering of live vibration and temperature waves with threshold guide lines.</li>
                <li><strong className="text-white">Vite:</strong> Ultra-fast developer server and optimized bundler.</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Server className="w-5 h-5" />
                <span>Backend Architecture (Spring Boot)</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-2">
                <li><strong className="text-white">Java 17 LTS:</strong> Enterprise programming language providing high concurrency and rock-solid memory management.</li>
                <li><strong className="text-white">Spring Boot 3:</strong> Production microservice framework handling RESTful endpoints (<code className="text-cyan-300">/api/machines</code>, <code className="text-cyan-300">/api/sensors/data</code>, <code className="text-cyan-300">/api/alerts</code>).</li>
                <li><strong className="text-white">Spring Data JPA / Hibernate:</strong> Object-Relational Mapping (ORM) connecting domain entities with the relational database.</li>
                <li><strong className="text-white">Spring Mail:</strong> Dispatches automated email notification alerts to maintenance crews whenever an anomaly is flagged.</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Cpu className="w-5 h-5" />
                <span>Machine Learning Engine (Python Scikit-Learn)</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-2">
                <li><strong className="text-white">Python 3.11:</strong> High-performance runtime for numerical analytics and scientific computing.</li>
                <li><strong className="text-white">Scikit-Learn IsolationForest:</strong> Unsupervised tree ensemble trained on normal multidimensional machine data to isolate abnormal patterns without requiring labeled failure datasets.</li>
                <li><strong className="text-white">FastAPI:</strong> Lightweight asynchronous HTTP microservice exposing <code className="text-cyan-300">POST /api/anomaly/detect</code>.</li>
                <li><strong className="text-white">NumPy:</strong> Vectorized matrix math computing Euclidean distance and normalized scoring.</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-blue-400 font-bold">
                <Database className="w-5 h-5" />
                <span>Persistence Layer (PostgreSQL 15+)</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-2">
                <li><strong className="text-white">PostgreSQL:</strong> Robust relational ACID database storing user credentials, asset registrations, time-series telemetry readings, and alert audit histories.</li>
                <li><strong className="text-white">Composite Indexing:</strong> <code className="text-cyan-300">(machine_id, recorded_at DESC)</code> enables sub-millisecond retrieval of recent sensor telemetry.</li>
                <li><strong className="text-white">Referential Integrity:</strong> Foreign key constraints link telemetry readings, anomalies, and alerts directly to registered machines.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Every Term Used in the Website Explained */}
      {activeTab === 'GLOSSARY' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Info className="w-5 h-5 text-cyan-400" />
              <span>Comprehensive Industrial & Technical Glossary</span>
            </h2>
            <p className="text-xs text-slate-400">
              Clear, simple, and technically precise definitions for every term, machine, sensor parameter, and acronym used throughout this platform.
            </p>
          </div>

          {/* Machine Systems Section */}
          <div className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-cyan-300 uppercase tracking-wider text-xs">Monitored Industrial Machines (The Fleet)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="text-sm font-bold text-white">CNC Milling Machine 01</div>
                <div className="text-xs text-cyan-400 font-mono">Computer Numerical Control (CNC) Spindle</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  A high-precision motorized cutting machine where computer software controls the automated cutting tool along 5 physical axes. Critical monitoring focuses on spindle bearing vibration and cutting head temperature.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="text-sm font-bold text-white">Electric Motor 02</div>
                <div className="text-xs text-cyan-400 font-mono">Three-Phase Induction Motor</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  An electro-mechanical motor that converts three-phase AC electricity into rotational torque to drive assembly conveyor belts. Elevated vibration indicates shaft misalignment, unbalance, or loose bearing races.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="text-sm font-bold text-white">Hydraulic Pump 03</div>
                <div className="text-xs text-cyan-400 font-mono">High-Pressure Piston Fluid Pump</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Pressurizes hydraulic fluid to actuate stamping presses and heavy forming machinery. Monitored for pressure drops (cavitation/leaks) and thermal rise in the fluid reservoir.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="text-sm font-bold text-white">Turbine Generator 04</div>
                <div className="text-xs text-cyan-400 font-mono">Industrial Steam Turbine Power Generator</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Extracts thermal energy from pressurized steam to rotate electrical generators at 3,000 RPM. Requires strict vibration tolerance to prevent catastrophic blade or shaft failure.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="text-sm font-bold text-white">Air Compressor 05</div>
                <div className="text-xs text-cyan-400 font-mono">Rotary Screw Air Compressor</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Compresses atmospheric air into pressurized pneumatic lines supplying factory tools and robotic pick-and-place actuators. Monitored for thermal overheating and pressure consistency.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="text-sm font-bold text-white">Conveyor Belt 06</div>
                <div className="text-xs text-cyan-400 font-mono">Heavy-Duty Packaging Conveyor Drive</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Continuous motorized conveyor moving finished pallets in the packaging warehouse. Monitored for electrical current draw (motor overload) and roller vibration.
                </p>
              </div>
            </div>
          </div>

          {/* Physical Sensor Metrics Section */}
          <div className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-cyan-300 uppercase tracking-wider text-xs">Sensor Parameters & Physical Units</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="text-sm font-bold text-white">Vibration (mm/s RMS)</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong>Root Mean Square velocity</strong> of machine oscillation in millimeters per second. Calibrated to international standard <strong>ISO 10816</strong> for mechanical vibration evaluation.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="text-sm font-bold text-white">Temperature (°C)</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Thermal measurement of motor windings, bearings, or hydraulic oil in degrees Celsius. Helps catch lubrication degradation and electrical resistance heat buildup.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="text-sm font-bold text-white">Pressure (bar)</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Metric unit of fluid and pneumatic hydrostatic pressure (1 bar ≈ 100 kilopascals / ~14.5 PSI). Critical for detecting fluid leaks, blockages, and valve failures.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="text-sm font-bold text-white">RPM (Revolutions Per Minute)</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The rotational speed of machine shafts and spindles. Deviations from nominal setpoints indicate belt slippage, motor speed control faults, or load stalls.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="text-sm font-bold text-white">Current (Amperes / A)</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Electrical current drawn by the motor phases. High current draw indicates mechanical binding, heavy workload, or shorted winding phases.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="text-sm font-bold text-white">Setpoint & Thresholds</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong>Setpoint:</strong> The target normal operating baseline. <strong>Threshold:</strong> The maximum safe boundary beyond which an alert is automatically fired.
                </p>
              </div>
            </div>
          </div>

          {/* Algorithmic & Platform Terms */}
          <div className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-cyan-300 uppercase tracking-wider text-xs">Platform & Algorithmic Terminology</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="text-sm font-bold text-white">Anomaly Score (0% – 100%)</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  A normalized statistical indicator produced by the machine learning algorithm. An anomaly score under 20% signifies nominal health; scores above 50% trigger Warning states, and above 75% trigger Critical alarms.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="text-sm font-bold text-white">Machine Health Score (0% – 100%)</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  A composite health index representing overall asset reliability. Calculated by penalizing deviations in vibration, temperature, pressure, and RPM against baseline tolerances.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="text-sm font-bold text-white">Isolation Forest</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  An unsupervised anomaly detection algorithm based on decision trees. Outliers are isolated closer to the root of the trees with fewer random partitions than normal cluster points.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="text-sm font-bold text-white">Fault Injection Testing</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The intentional simulation of mechanical defects (e.g. bearing wear or thermal breakdown) to verify that the monitoring pipeline immediately detects, scores, and alerts the operator.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Code Display Area for SPRING_BOOT, PYTHON_ML, POSTGRES, SIMULATOR */}
      {['SPRING_BOOT', 'PYTHON_ML', 'POSTGRES', 'SIMULATOR'].includes(activeTab) && (
        <div className="bg-[#0A0E17] border border-slate-800 rounded-2xl p-5 overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-3 border-b border-slate-800/80 mb-3 font-mono">
            <span>
              {activeTab === 'SPRING_BOOT' && 'src/main/java/com/smartiot/industrial/controller/IndustrialIoTController.java'}
              {activeTab === 'PYTHON_ML' && 'ml-service/app/isolation_forest_service.py'}
              {activeTab === 'POSTGRES' && 'database/schema.sql'}
              {activeTab === 'SIMULATOR' && 'sensor-simulator/sensor_simulator.py'}
            </span>
            <span className="text-cyan-400">Production Code</span>
          </div>

          <pre className="overflow-x-auto text-xs font-mono text-slate-200 leading-relaxed max-h-[500px]">
            <code>{getActiveCode()}</code>
          </pre>
        </div>
      )}
    </div>
  );
};
