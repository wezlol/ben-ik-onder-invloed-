/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';

interface ChartPoint {
  time: number;
  bac: number;
  absorbedGrams: number;
  bloodGrams: number;
}

interface BACChartProps {
  data: ChartPoint[];
  limit: number;
  activeTime: number; // slider time offset
  onTimeChange?: (time: number) => void;
}

export default function BACChart({ data, limit, activeTime, onTimeChange }: BACChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 500, height: 220 });
  const [hoveredPoint, setHoveredPoint] = useState<ChartPoint | null>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);

  // Measure size dynamically to support fluid responsive layout
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({
          width: width || 500,
          height: height || 220,
        });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = dimensions.width - paddingLeft - paddingRight;
  const chartHeight = dimensions.height - paddingTop - paddingBottom;

  // Filter data to only show from -4h of first drink up to the end
  const filteredData = data;
  const times = filteredData.map((d) => d.time);
  const bacs = filteredData.map((d) => d.bac);

  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const maxBac = Math.max(1.0, Math.max(...bacs), limit + 0.2); // make sure it scales nicely

  // Coordinate projection helper functions
  const getX = (t: number) => {
    return paddingLeft + ((t - minTime) / (maxTime - minTime)) * chartWidth;
  };

  const getY = (bacValue: number) => {
    return paddingTop + chartHeight - (bacValue / maxBac) * chartHeight;
  };

  // Convert points into an SVG path string
  let pathD = '';
  if (filteredData.length > 0) {
    pathD = `M ${getX(filteredData[0].time)} ${getY(filteredData[0].bac)}`;
    for (let i = 1; i < filteredData.length; i++) {
      pathD += ` L ${getX(filteredData[i].time)} ${getY(filteredData[i].bac)}`;
    }
  }

  // Create SVG path for area fill under the curve
  let areaD = '';
  if (filteredData.length > 0) {
    areaD = `${pathD} L ${getX(filteredData[filteredData.length - 1].time)} ${getY(0)} L ${getX(filteredData[0].time)} ${getY(0)} Z`;
  }

  // Find the point closest to mouse location
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!containerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - paddingLeft;
    
    // Calculate targeted time in simulation coordinates
    const pxRatio = mouseX / chartWidth;
    if (pxRatio < 0 || pxRatio > 1) {
      setHoveredPoint(null);
      setHoverX(null);
      return;
    }
    const targetSimTime = minTime + pxRatio * (maxTime - minTime);
    
    // Find closest item
    let closest = filteredData[0];
    let minDiff = Math.abs(filteredData[0].time - targetSimTime);
    for (const point of filteredData) {
      const diff = Math.abs(point.time - targetSimTime);
      if (diff < minDiff) {
        minDiff = diff;
        closest = point;
      }
    }
    setHoveredPoint(closest);
    setHoverX(getX(closest.time));
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
    setHoverX(null);
  };

  const handleSvgClick = () => {
    if (hoveredPoint && onTimeChange && hoveredPoint.time >= 0) {
      onTimeChange(hoveredPoint.time);
    }
  };

  // Format time labels for X axis (e.g. -2u, Nu, +1u, etc.)
  const xTicks = [];
  const tickInterval = 2; // tick every 2 hours
  for (let t = Math.ceil(minTime); t <= maxTime; t++) {
    if (t % tickInterval === 0 || t === 0) {
      xTicks.push(t);
    }
  }

  // Y axis ticks (0.2, 0.5, 1.0, etc.)
  const yTicks = [0, 0.2, 0.5];
  if (maxBac > 0.8) yTicks.push(1.0);
  if (maxBac > 1.5) yTicks.push(2.0);

  return (
    <div ref={containerRef} className="w-full h-[220px] select-none" id="bac-chart-container">
      <svg
        width="100%"
        height="100%"
        className="overflow-visible"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleSvgClick}
        style={{ cursor: onTimeChange ? 'pointer' : 'default' }}
        id="bac-chart-svg"
      >
        <defs>
          <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Draw horizontal grid lines and Y axis labels */}
        {yTicks.map((val) => (
          <g key={`y-grid-${val}`}>
            <line
              x1={paddingLeft}
              y1={getY(val)}
              x2={dimensions.width - paddingRight}
              y2={getY(val)}
              stroke="#e2e8f0"
              strokeDasharray="4,4"
            />
            <text
              x={paddingLeft - 8}
              y={getY(val) + 4}
              textAnchor="end"
              className="text-[10px] font-mono text-gray-400 font-semibold"
            >
              {val.toFixed(1)}‰
            </text>
          </g>
        ))}

        {/* Draw X-axis ticks & labels */}
        {xTicks.map((val) => {
          const x = getX(val);
          let label = `${val > 0 ? '+' : ''}${val}u`;
          if (val === 0) label = 'NU';
          return (
            <g key={`x-tick-${val}`}>
              <line
                x1={x}
                y1={paddingTop}
                x2={x}
                y2={paddingTop + chartHeight}
                stroke="#f1f5f9"
              />
              <text
                x={x}
                y={paddingTop + chartHeight + 16}
                textAnchor="middle"
                className={`text-[9px] font-sans font-bold ${
                  val === 0 ? 'text-amber-500 text-[10px]' : 'text-gray-400'
                }`}
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* Draw user-specific legal driving limit line */}
        <g>
          <line
            x1={paddingLeft}
            y1={getY(limit)}
            x2={dimensions.width - paddingRight}
            y2={getY(limit)}
            stroke="#ef4444"
            strokeWidth="1.5"
            strokeDasharray="5,3"
          />
          <rect
            x={dimensions.width - paddingRight - 85}
            y={getY(limit) - 18}
            width="85"
            height="14"
            rx="4"
            fill="#fee2e2"
            id="legal-limit-label-bg"
          />
          <text
            x={dimensions.width - paddingRight - 42}
            y={getY(limit) - 8}
            textAnchor="middle"
            className="text-[8px] font-sans font-bold text-red-600 uppercase tracking-widest"
          >
            Limiethg ({limit}‰)
          </text>
        </g>

        {/* Draw the area and trend path */}
        {pathD && (
          <>
            <path d={areaD} fill="url(#chart-glow)" />
            <path
              d={pathD}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </>
        )}

        {/* Draw line showing CURRENT position indicator (0.0 or timeline selection) */}
        <g>
          <line
            x1={getX(activeTime)}
            y1={paddingTop}
            x2={getX(activeTime)}
            y2={paddingTop + chartHeight}
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeDasharray="2,2"
          />
          <circle
            cx={getX(activeTime)}
            cy={getY(data.find((p) => Math.abs(p.time - activeTime) < 0.06)?.bac || 0)}
            r="5"
            fill="#f59e0b"
            stroke="white"
            strokeWidth="1.5"
          />
        </g>

        {/* Draw Hover interaction lines & tracker */}
        {hoverX !== null && hoveredPoint && (
          <g>
            <line
              x1={hoverX}
              y1={paddingTop}
              x2={hoverX}
              y2={paddingTop + chartHeight}
              stroke="#94a3b8"
              strokeWidth="1"
            />
            <circle
              cx={hoverX}
              cy={getY(hoveredPoint.bac)}
              r="6"
              fill="white"
              stroke="#f59e0b"
              strokeWidth="3"
            />

            {/* Hover tooltip */}
            <foreignObject
              x={hoverX > dimensions.width / 2 ? hoverX - 120 : hoverX + 8}
              y={Math.min(dimensions.height - 110, Math.max(10, getY(hoveredPoint.bac) - 40))}
              width="110"
              height="75"
              className="pointer-events-none"
            >
              <div className="bg-slate-900/90 text-white p-2 rounded-xl text-[10px] space-y-0.5 shadow-md border border-slate-700 font-sans">
                <div className="font-bold border-b border-white/20 pb-0.5">
                  Tijd: {hoveredPoint.time === 0 ? 'Nu' : `${hoveredPoint.time > 0 ? '+' : ''}${hoveredPoint.time}u`}
                </div>
                <div>Promillage: <span className="font-mono font-bold text-amber-400">{hoveredPoint.bac.toFixed(3)}‰</span></div>
                <div>In bloed: <span className="font-mono">{hoveredPoint.bloodGrams.toFixed(1)}g alc</span></div>
                {hoveredPoint.time >= 0 && (
                  <div className="text-[8px] text-gray-300 italic">Klik om tijd te kiezen</div>
                )}
              </div>
            </foreignObject>
          </g>
        )}
      </svg>
    </div>
  );
}
