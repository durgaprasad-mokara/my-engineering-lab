"use client";

import { useState } from "react";
import type { RadiationPatternPoint } from "@/lib/data/types";

interface Props {
  patternData: RadiationPatternPoint[];
  peakGainDbi: number;
  patternType: "omnidirectional" | "directional" | "hemispherical";
}

export function RadiationPattern({ patternData, peakGainDbi, patternType }: Props) {
  const [showEPlane, setShowEPlane] = useState(true);
  const [showHPlane, setShowHPlane] = useState(true);
  const [hoverAngle, setHoverAngle] = useState<number | null>(null);

  const size = 320;
  const center = size / 2;
  const maxRadius = center - 30; // 130px radius

  // Map gain (typically -30 dBi to +15 dBi) to radius (0 to maxRadius)
  const minGain = -30;
  const maxGain = Math.max(10, Math.ceil(peakGainDbi / 5) * 5);
  const gainRange = maxGain - minGain;

  const gainToRadius = (gainDbi: number) => {
    const clamped = Math.max(minGain, Math.min(maxGain, gainDbi));
    return ((clamped - minGain) / gainRange) * maxRadius;
  };

  // Convert polar (angle in deg, radius in px) to SVG Cartesian coordinates (x, y)
  // Standard RF polar plot: 0 deg is TOP (0, -r) or RIGHT. Let's make 0 deg Top (forward axis).
  const polarToXy = (angleDeg: number, radiusPx: number) => {
    // 0 deg = North (top), 90 deg = East (right), 180 deg = South (bottom), 270 deg = West (left)
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    const x = center + radiusPx * Math.cos(rad);
    const y = center + radiusPx * Math.sin(rad);
    return { x, y };
  };

  // Generate SVG path strings for E-plane and H-plane
  const generatePath = (plane: "ePlaneDbi" | "hPlaneDbi") => {
    if (!patternData || patternData.length === 0) return "";
    return (
      patternData.reduce((path, pt, idx) => {
        const r = gainToRadius(pt[plane]);
        const { x, y } = polarToXy(pt.angle, r);
        return `${path} ${idx === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      }, "") + " Z"
    );
  };

  // Concentric dB level circles
  const dbSteps = [-30, -20, -10, 0, maxGain];
  const angleSteps = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

  const currentHoverPoint = hoverAngle !== null
    ? patternData.find((p) => Math.abs(p.angle - hoverAngle) <= 3) ?? patternData[0]
    : null;

  return (
    <div className="flex flex-col items-center rounded-lg border bg-surface p-4">
      <div className="flex w-full items-center justify-between pb-3 text-xs">
        <div>
          <span className="font-semibold text-foreground">2D Polar Radiation Pattern</span>
          <div className="text-[11px] text-muted-foreground capitalize">
            {patternType} Pattern (Peak: {peakGainDbi} dBi)
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowEPlane(!showEPlane)}
            className={`flex items-center gap-1.5 rounded px-2 py-1 text-[11px] font-medium transition-colors ${showEPlane ? "bg-accent/20 text-accent border border-accent/30" : "text-muted-foreground hover:bg-surface-raised"
              }`}
          >
            <span className="size-2 rounded-full bg-accent inline-block" />
            E-Plane (Elev)
          </button>
          <button
            type="button"
            onClick={() => setShowHPlane(!showHPlane)}
            className={`flex items-center gap-1.5 rounded px-2 py-1 text-[11px] font-medium transition-colors ${showHPlane ? "bg-violet/20 text-violet border border-violet/30" : "text-muted-foreground hover:bg-surface-raised"
              }`}
          >
            <span className="size-2 rounded-full bg-violet inline-block" />
            H-Plane (Azim)
          </button>
        </div>
      </div>

      {/* SVG Polar Canvas */}
      <div className="relative">
        <svg
          width={size}
          height={size}
          className="overflow-visible select-none"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const relX = e.clientX - rect.left - center;
            const relY = e.clientY - rect.top - center;
            let deg = (Math.atan2(relY, relX) * 180) / Math.PI + 90;
            if (deg < 0) deg += 360;
            setHoverAngle(Math.round(deg));
          }}
          onMouseLeave={() => setHoverAngle(null)}
        >
          {/* Concentric gain level circles */}
          {dbSteps.map((db) => {
            const r = gainToRadius(db);
            return (
              <g key={db}>
                <circle
                  cx={center}
                  cy={center}
                  r={r}
                  fill="none"
                  stroke="currentColor"
                  className="stroke-border"
                  strokeDasharray={db === 0 ? "none" : "2 3"}
                  strokeWidth={db === 0 ? "1.5" : "0.75"}
                />
                <text
                  x={center + 3}
                  y={center - r + 10}
                  className="fill-muted-foreground text-[8px] font-mono select-none"
                >
                  {db} dB
                </text>
              </g>
            );
          })}

          {/* Radial Angle lines (every 30 deg) */}
          {angleSteps.map((deg) => {
            const { x, y } = polarToXy(deg, maxRadius);
            const textPos = polarToXy(deg, maxRadius + 14);
            return (
              <g key={deg}>
                <line
                  x1={center}
                  y1={center}
                  x2={x}
                  y2={y}
                  stroke="currentColor"
                  className="stroke-border/70"
                  strokeWidth="0.75"
                />
                <text
                  x={textPos.x}
                  y={textPos.y + 3}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[9px] font-mono select-none"
                >
                  {deg}°
                </text>
              </g>
            );
          })}

          {/* E-Plane Path (Elevation, cyan) */}
          {showEPlane && (
            <path
              d={generatePath("ePlaneDbi")}
              fill="rgba(19, 211, 242, 0.12)"
              stroke="#13D3F2"
              strokeWidth="2"
              className="transition-all"
            />
          )}

          {/* H-Plane Path (Azimuth, violet) */}
          {showHPlane && (
            <path
              d={generatePath("hPlaneDbi")}
              fill="rgba(168, 85, 247, 0.12)"
              stroke="#A855F7"
              strokeWidth="2"
              className="transition-all"
            />
          )}

          {/* Hover Angle Crosshair Line */}
          {hoverAngle !== null && (
            <>
              {(() => {
                const { x, y } = polarToXy(hoverAngle, maxRadius);
                return (
                  <line
                    x1={center}
                    y1={center}
                    x2={x}
                    y2={y}
                    stroke="#F59E0B"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                );
              })()}
            </>
          )}

          {/* Center Origin Dot */}
          <circle cx={center} cy={center} r={2.5} className="fill-muted-foreground" />
        </svg>
      </div>

      {/* Hover Readout Tooltip */}
      <div className="mt-3 flex h-6 items-center gap-3 text-xs font-mono">
        {currentHoverPoint ? (
          <>
            <span className="text-warning font-semibold">{currentHoverPoint.angle}°</span>
            <span className="text-accent">E: {currentHoverPoint.ePlaneDbi} dBi</span>
            <span className="text-violet">H: {currentHoverPoint.hPlaneDbi} dBi</span>
          </>
        ) : (
          <span className="text-[11px] text-muted-foreground font-sans">
            Hover over the polar plot to inspect gain at any azimuth angle
          </span>
        )}
      </div>
    </div>
  );
}

