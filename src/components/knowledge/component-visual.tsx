"use client";

import * as React from "react";
import { ImageOff } from "lucide-react";
import type { AzComponentRecord } from "@/lib/components/az-types";

export function ComponentVisual({
  component,
  role = "main",
  className = "",
}: {
  component: AzComponentRecord;
  role?: "main" | "alternative" | "pinout" | "circuit" | "package" | "manufacturer";
  className?: string;
}) {
  if (role === "manufacturer") {
    return (
      <div
        className={`flex flex-col items-center justify-center rounded-md border border-dashed border-border bg-surface-raised/30 p-6 text-center ${className}`}
      >
        <ImageOff className="mb-2 size-7 text-muted-foreground" />
        <div className="text-xs font-semibold text-foreground">
          Manufacturer Product Photo Unavailable
        </div>
        <p className="mt-1 max-w-xs text-[11px] text-muted-foreground">
          No verified manufacturer photograph is stored in Supabase Storage yet for{" "}
          <span className="font-mono text-foreground">{component.partNumber}</span>. Unverified hotlinks are not used.
        </p>
      </div>
    );
  }

  if (role === "pinout") {
    const pins = component.pinout.slice(0, 8);
    return (
      <svg
        viewBox="0 0 320 190"
        className={`w-full rounded-md border bg-[#060b16] ${className}`}
        role="img"
        aria-label={`${component.name} pinout diagram`}
      >
        <rect x="95" y="25" width="130" height="140" rx="6" fill="#0f172a" stroke="#3b82f6" strokeWidth="1.5" />
        <circle cx="110" cy="40" r="4" fill="#f59e0b" />
        <text x="160" y="90" textAnchor="middle" className="fill-slate-100 font-mono text-[11px] font-bold">
          {component.partNumber.slice(0, 14)}
        </text>
        <text x="160" y="108" textAnchor="middle" className="fill-cyan-400 font-mono text-[9px]">
          {component.packageType.slice(0, 18)}
        </text>
        {pins.map((p, i) => {
          const isLeft = i % 2 === 0;
          const row = Math.floor(i / 2);
          const y = 46 + row * 30;
          const xLine = isLeft ? 70 : 225;
          const xText = isLeft ? 64 : 256;
          return (
            <g key={p.pin}>
              <line x1={xLine} y1={y} x2={isLeft ? 95 : 225} y2={y} stroke="#eab308" strokeWidth="3" />
              <text
                x={xText}
                y={y + 3}
                textAnchor={isLeft ? "end" : "start"}
                className="fill-slate-200 font-mono text-[9px]"
              >
                {p.pin}:{p.name}
              </text>
            </g>
          );
        })}
      </svg>
    );
  }

  if (role === "circuit") {
    return (
      <svg
        viewBox="0 0 320 190"
        className={`w-full rounded-md border bg-[#060b16] ${className}`}
        role="img"
        aria-label={`${component.name} example circuit diagram`}
      >
        <text x="16" y="22" className="fill-cyan-400 font-mono text-[10px]">
          VCC ({component.operatingVoltage})
        </text>
        <line x1="16" y1="30" x2="304" y2="30" stroke="#ef4444" strokeWidth="1.5" />
        <rect x="105" y="55" width="110" height="75" rx="4" fill="#0d1426" stroke="#13d3f2" strokeWidth="1.5" />
        <text x="160" y="88" textAnchor="middle" className="fill-slate-100 font-mono text-[10px] font-bold">
          {component.name.slice(0, 16)}
        </text>
        <text x="160" y="105" textAnchor="middle" className="fill-slate-400 font-mono text-[8px]">
          {component.protocols[0] ?? component.ioDetails.slice(0, 16)}
        </text>
        <line x1="140" y1="30" x2="140" y2="55" stroke="#ef4444" strokeWidth="1.5" />
        <line x1="140" y1="130" x2="140" y2="162" stroke="#64748b" strokeWidth="1.5" />
        <line x1="215" y1="92" x2="290" y2="92" stroke="#22c55e" strokeWidth="1.5" />
        <text x="255" y="85" textAnchor="middle" className="fill-emerald-400 font-mono text-[8px]">
          MCU I/O
        </text>
        <line x1="16" y1="162" x2="304" y2="162" stroke="#64748b" strokeWidth="1.5" />
        <text x="16" y="176" className="fill-slate-400 font-mono text-[10px]">GND (0V Reference)</text>
      </svg>
    );
  }

  // Main / Package / Alternative shape-specific technical illustration
  const shape = component.visualShape;
  return (
    <svg
      viewBox="0 0 320 190"
      className={`w-full rounded-md border bg-[#060b16] ${className}`}
      role="img"
      aria-label={`${component.name} illustrative technical diagram`}
    >
      <defs>
        <pattern id={`grid-${component.slug}`} width="16" height="16" patternUnits="userSpaceOnUse">
          <path d="M 16 0 L 0 0 0 16" fill="none" stroke="#132036" strokeWidth="0.6" />
        </pattern>
      </defs>
      <rect width="320" height="190" fill={`url(#grid-${component.slug})`} />

      {shape === "board_mcu" && (
        <g>
          <rect x="65" y="38" width="190" height="108" rx="6" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" />
          <rect x="52" y="70" width="24" height="44" rx="2" fill="#94a3b8" />
          <rect x="132" y="64" width="56" height="56" rx="3" fill="#0f172a" stroke="#64748b" />
          {Array.from({ length: 10 }).map((_, i) => (
            <circle key={i} cx={82 + i * 17} cy="48" r="2.5" fill="#eab308" />
          ))}
          {Array.from({ length: 10 }).map((_, i) => (
            <circle key={i} cx={82 + i * 17} cy="136" r="2.5" fill="#eab308" />
          ))}
        </g>
      )}

      {(shape === "ic_dip" || shape === "ic_smd") && (
        <g>
          <rect x="95" y="45" width="130" height="90" rx="5" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.5" />
          <circle cx="110" cy="60" r="4" fill="#13d3f2" />
          {Array.from({ length: 4 }).map((_, i) => (
            <g key={i}>
              <rect x={108 + i * 32} y="32" width="10" height="13" fill="#cbd5e1" />
              <rect x={108 + i * 32} y="135" width="10" height="13" fill="#cbd5e1" />
            </g>
          ))}
        </g>
      )}

      {shape === "sensor_ultrasonic" && (
        <g>
          <rect x="60" y="42" width="200" height="96" rx="6" fill="#1d4ed8" stroke="#60a5fa" strokeWidth="1.5" />
          <circle cx="112" cy="90" r="32" fill="#0f172a" stroke="#cbd5e1" strokeWidth="3" />
          <circle cx="208" cy="90" r="32" fill="#0f172a" stroke="#cbd5e1" strokeWidth="3" />
        </g>
      )}

      {shape === "sensor_module" && (
        <g>
          <rect x="85" y="40" width="150" height="100" rx="6" fill="#1e3a8a" stroke="#38bdf8" strokeWidth="1.5" />
          <rect x="135" y="68" width="50" height="44" rx="3" fill="#e2e8f0" stroke="#64748b" />
          <circle cx="96" cy="51" r="4" fill="#eab308" />
          <circle cx="224" cy="51" r="4" fill="#eab308" />
        </g>
      )}

      {shape === "passive_axial" && (
        <g>
          <line x1="40" y1="90" x2="280" y2="90" stroke="#cbd5e1" strokeWidth="4" />
          <rect x="100" y="66" width="120" height="48" rx="12" fill="#d97706" stroke="#fbbf24" />
          <rect x="122" y="66" width="10" height="48" fill="#7c2d12" />
          <rect x="148" y="66" width="10" height="48" fill="#0f172a" />
          <rect x="174" y="66" width="10" height="48" fill="#ef4444" />
        </g>
      )}

      {shape === "passive_cap" && (
        <g>
          <rect x="105" y="62" width="110" height="56" rx="4" fill="#b45309" stroke="#f59e0b" strokeWidth="1.5" />
          <rect x="95" y="62" width="18" height="56" fill="#cbd5e1" />
          <rect x="207" y="62" width="18" height="56" fill="#cbd5e1" />
        </g>
      )}

      {shape === "transistor_to220" && (
        <g>
          <rect x="120" y="34" width="80" height="32" fill="#94a3b8" />
          <circle cx="160" cy="48" r="8" fill="#060b16" />
          <rect x="120" y="64" width="80" height="55" fill="#1e293b" stroke="#475569" />
          <line x1="136" y1="119" x2="136" y2="152" stroke="#cbd5e1" strokeWidth="5" />
          <line x1="160" y1="119" x2="160" y2="152" stroke="#cbd5e1" strokeWidth="5" />
          <line x1="184" y1="119" x2="184" y2="152" stroke="#cbd5e1" strokeWidth="5" />
        </g>
      )}

      {(shape === "diode" || shape === "led") && (
        <g>
          <line x1="55" y1="90" x2="265" y2="90" stroke="#cbd5e1" strokeWidth="3.5" />
          {shape === "led" ? (
            <circle cx="160" cy="90" r="30" fill="#ef4444" fillOpacity="0.85" stroke="#fca5a5" strokeWidth="2" />
          ) : (
            <g>
              <rect x="115" y="68" width="90" height="44" rx="4" fill="#1e293b" stroke="#64748b" />
              <rect x="182" y="68" width="12" height="44" fill="#e2e8f0" />
            </g>
          )}
        </g>
      )}

      {shape === "antenna" && (
        <g>
          <line x1="80" y1="90" x2="245" y2="90" stroke="#94a3b8" strokeWidth="4" />
          {[110, 140, 170, 200, 230].map((x, idx) => (
            <line key={x} x1={x} y1={52 + idx * 4} x2={x} y2={128 - idx * 4} stroke="#13d3f2" strokeWidth="3.5" />
          ))}
        </g>
      )}

      {shape === "motor" && (
        <g>
          <rect x="95" y="54" width="110" height="72" rx="6" fill="#334155" stroke="#94a3b8" strokeWidth="1.5" />
          <rect x="205" y="82" width="42" height="16" rx="2" fill="#cbd5e1" />
        </g>
      )}

      {shape === "display" && (
        <g>
          <rect x="75" y="38" width="170" height="104" rx="6" fill="#0f172a" stroke="#3b82f6" strokeWidth="2" />
          <rect x="88" y="50" width="144" height="76" fill="#082f49" stroke="#13d3f2" />
          <text x="160" y="92" textAnchor="middle" className="fill-cyan-300 font-mono text-[11px]">
            128×64 / TFT
          </text>
        </g>
      )}

      {shape === "battery" && (
        <g>
          <rect x="85" y="60" width="145" height="60" rx="8" fill="#1d4ed8" stroke="#60a5fa" strokeWidth="1.5" />
          <rect x="230" y="76" width="10" height="28" rx="2" fill="#cbd5e1" />
        </g>
      )}

      {!["board_mcu", "ic_dip", "ic_smd", "sensor_ultrasonic", "sensor_module", "passive_axial", "passive_cap", "transistor_to220", "diode", "led", "antenna", "motor", "display", "battery"].includes(shape) && (
        <g>
          <rect x="90" y="45" width="140" height="90" rx="6" fill="#1e293b" stroke="#3b82f6" strokeWidth="1.5" />
          <circle cx="105" cy="60" r="4" fill="#13d3f2" />
          <circle cx="215" cy="120" r="4" fill="#eab308" />
        </g>
      )}

      {/* Label footer */}
      <rect x="0" y="156" width="320" height="34" fill="#080d1a" fillOpacity="0.92" />
      <text x="12" y="171" className="fill-slate-100 font-mono text-[10px] font-bold">
        {component.name} ({component.partNumber})
      </text>
      <text x="12" y="183" className="fill-cyan-400 font-mono text-[8.5px]">
        Illustrative Technical Diagram · {component.packageType} · {component.operatingVoltage}
      </text>
    </svg>
  );
}

