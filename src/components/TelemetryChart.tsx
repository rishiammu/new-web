import React, { useState } from 'react';
import { SensorReading } from '../types';

interface TelemetryChartProps {
  data: SensorReading[];
  metricKey: 'temperature' | 'vibration' | 'pressure' | 'rpm';
  label: string;
  unit: string;
  strokeColor?: string;
  fillColor?: string;
  warningThreshold?: number;
  criticalThreshold?: number;
  height?: number;
}

export const TelemetryChart: React.FC<TelemetryChartProps> = ({
  data,
  metricKey,
  label,
  unit,
  strokeColor = '#06B6D4',
  fillColor = 'rgba(6, 182, 212, 0.12)',
  warningThreshold,
  criticalThreshold,
  height = 140,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ height }} className="flex items-center justify-center text-xs text-slate-500 bg-slate-900/40 rounded-lg border border-slate-800">
        No telemetry stream available
      </div>
    );
  }

  const values = data.map(d => d[metricKey]);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const padding = (maxVal - minVal) * 0.18 || 1;
  const domainMin = Math.max(0, minVal - padding);
  const domainMax = maxVal + padding;

  const width = 500;
  const svgHeight = height;
  const paddingX = 12;
  const paddingY = 16;
  const chartW = width - paddingX * 2;
  const chartH = svgHeight - paddingY * 2;

  const getX = (index: number) => paddingX + (index / Math.max(1, data.length - 1)) * chartW;
  const getY = (val: number) => paddingY + chartH - ((val - domainMin) / Math.max(0.01, domainMax - domainMin)) * chartH;

  const points = data.map((d, i) => `${getX(i).toFixed(1)},${getY(d[metricKey]).toFixed(1)}`).join(' ');
  const areaPoints = `${points} ${getX(data.length - 1).toFixed(1)},${(paddingY + chartH).toFixed(1)} ${getX(0).toFixed(1)},${(paddingY + chartH).toFixed(1)}`;

  const latestVal = values[values.length - 1];

  return (
    <div className="relative flex flex-col bg-slate-900/60 rounded-xl border border-slate-800/80 p-3.5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</span>
        <div className="flex items-baseline gap-1">
          <span className="font-mono text-base font-semibold text-slate-100 tabular-nums">
            {metricKey === 'rpm' ? Math.round(latestVal) : latestVal.toFixed(1)}
          </span>
          <span className="text-xs text-slate-400 font-mono">{unit}</span>
        </div>
      </div>

      <div className="relative w-full" style={{ height: svgHeight }}>
        <svg
          viewBox={`0 0 ${width} ${svgHeight}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id={`grad-${metricKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            stroke="#1E293B"
            strokeDasharray="3 3"
          />
          <line
            x1={paddingX}
            y1={paddingY + chartH / 2}
            x2={width - paddingX}
            y2={paddingY + chartH / 2}
            stroke="#1E293B"
            strokeDasharray="3 3"
          />
          <line
            x1={paddingX}
            y1={paddingY + chartH}
            x2={width - paddingX}
            y2={paddingY + chartH}
            stroke="#1E293B"
          />

          {/* Threshold lines if defined */}
          {warningThreshold && warningThreshold >= domainMin && warningThreshold <= domainMax && (
            <line
              x1={paddingX}
              y1={getY(warningThreshold)}
              x2={width - paddingX}
              y2={getY(warningThreshold)}
              stroke="#F59E0B"
              strokeDasharray="4 4"
              strokeWidth="1.2"
              opacity="0.75"
            />
          )}

          {criticalThreshold && criticalThreshold >= domainMin && criticalThreshold <= domainMax && (
            <line
              x1={paddingX}
              y1={getY(criticalThreshold)}
              x2={width - paddingX}
              y2={getY(criticalThreshold)}
              stroke="#EF4444"
              strokeDasharray="4 4"
              strokeWidth="1.2"
              opacity="0.85"
            />
          )}

          {/* Gradient area */}
          <polygon points={areaPoints} fill={`url(#grad-${metricKey})`} />

          {/* Main line */}
          <polyline
            points={points}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive hover guides */}
          {data.map((d, i) => {
            const cx = getX(i);
            const cy = getY(d[metricKey]);
            return (
              <g key={i} onMouseEnter={() => setHoverIndex(i)}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={hoverIndex === i ? 4.5 : i === data.length - 1 ? 3 : 0}
                  fill={strokeColor}
                  className="transition-all duration-150 cursor-pointer"
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoverIndex !== null && data[hoverIndex] && (
          <div
            className="absolute top-1 pointer-events-none transform -translate-x-1/2 bg-slate-950/95 border border-slate-700/80 px-2 py-1 rounded text-xs shadow-lg z-10"
            style={{
              left: `${(hoverIndex / (data.length - 1)) * 100}%`,
            }}
          >
            <div className="font-mono text-cyan-300 font-semibold tabular-nums">
              {metricKey === 'rpm' ? Math.round(data[hoverIndex][metricKey]) : data[hoverIndex][metricKey].toFixed(1)} {unit}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              {data[hoverIndex].timestamp}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[11px] text-slate-500 font-mono">
        <span>Min: {metricKey === 'rpm' ? Math.round(minVal) : minVal.toFixed(1)} {unit}</span>
        <span>Max: {metricKey === 'rpm' ? Math.round(maxVal) : maxVal.toFixed(1)} {unit}</span>
      </div>
    </div>
  );
};
