"use client";

import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, RoundedBox } from "@react-three/drei";
import type { Group, Mesh, MeshStandardMaterial } from "three";
import { MathUtils } from "three";
import { DEVICE_PARTS } from "./device-parts";

interface Hover {
  id: string;
  x: number;
  y: number;
}

const BASE: Record<string, [number, number, number]> = {
  sensor: [0, -1.25, 0],
  enclosure: [0, 0.1, 0],
  pcb: [0, -0.05, 0],
  battery: [-0.75, 0.25, 0.15],
  mcu: [0.25, 0.08, 0.1],
  modem: [0.85, 0.12, 0.05],
  antenna: [0.9, 1.15, 0],
};

const EXPLODE: Record<string, number> = { sensor: -0.9, enclosure: 0, pcb: 0.15, battery: 0.6, mcu: 0.75, modem: 0.95, antenna: 1.6 };

function Part({
  id,
  exploded,
  onHover,
  onSelect,
  children,
}: {
  id: string;
  exploded: boolean;
  onHover: (h: Hover | null) => void;
  onSelect: (id: string) => void;
  children: React.ReactNode;
}) {
  const ref = React.useRef<Group>(null);
  const base = BASE[id] ?? [0, 0, 0];
  useFrame((_, dt) => {
    if (!ref.current) return;
    const target = base[1] + (exploded ? (EXPLODE[id] ?? 0) : 0);
    ref.current.position.y = MathUtils.damp(ref.current.position.y, target, 6, dt);
  });
  return (
    <group
      ref={ref}
      position={base}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover({ id, x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
      }}
      onPointerMove={(e) => {
        e.stopPropagation();
        onHover({ id, x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
      }}
      onPointerOut={() => onHover(null)}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(id);
      }}
    >
      {children}
    </group>
  );
}

function StatusLed() {
  const ref = React.useRef<Mesh>(null);
  useFrame(({ clock }) => {
    const m = ref.current?.material as MeshStandardMaterial | undefined;
    if (m) m.emissiveIntensity = 1.2 + Math.sin(clock.elapsedTime * 3) * 0.9;
  });
  return (
    <mesh ref={ref} position={[-0.25, 0.04, 0.42]}>
      <sphereGeometry args={[0.04, 16, 16]} />
      <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={1.5} />
    </mesh>
  );
}

function Scene({
  exploded,
  hovered,
  selected,
  setHovered,
  setSelected,
}: {
  exploded: boolean;
  hovered: string | null;
  selected: string | null;
  setHovered: (h: Hover | null) => void;
  setSelected: (id: string) => void;
}) {
  const p = (id: string) => ({
    id,
    exploded,
    onHover: setHovered,
    onSelect: setSelected,
  });
  const hl = (id: string, color: string) => (hovered === id || selected === id ? "#13d3f2" : color);

  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 6, 5]} intensity={1.4} />
      <directionalLight position={[-5, 2, -4]} intensity={0.5} color="#3b82f6" />
      <pointLight position={[0, -2, 3]} intensity={0.6} color="#8b5cf6" />

      <Part {...p("sensor")}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.32, 0.32, 3.2, 32]} />
          <meshStandardMaterial color={hl("sensor", "#64748b")} metalness={0.6} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[0.7, 0.35, 0.55]} />
          <meshStandardMaterial color={hl("sensor", "#1e293b")} metalness={0.3} roughness={0.5} />
        </mesh>
      </Part>

      <Part {...p("enclosure")}>
        <RoundedBox args={[2.6, 0.9, 1.1]} radius={0.12} smoothness={4}>
          <meshPhysicalMaterial
            color={hl("enclosure", "#1d4ed8")}
            transparent
            opacity={exploded ? 0.08 : 0.18}
            roughness={0.15}
            metalness={0}
            depthWrite={false}
          />
        </RoundedBox>
      </Part>

      <Part {...p("pcb")}>
        <mesh>
          <boxGeometry args={[2.3, 0.05, 0.9]} />
          <meshStandardMaterial color={hl("pcb", "#065f46")} roughness={0.6} />
        </mesh>
        <StatusLed />
      </Part>

      <Part {...p("battery")}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.2, 0.2, 0.8, 32]} />
          <meshStandardMaterial color={hl("battery", "#334155")} metalness={0.4} roughness={0.4} />
        </mesh>
      </Part>

      <Part {...p("mcu")}>
        <mesh>
          <boxGeometry args={[0.42, 0.08, 0.42]} />
          <meshStandardMaterial color={hl("mcu", "#0f172a")} roughness={0.4} />
        </mesh>
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh key={i} position={[-0.17 + i * 0.068, -0.02, 0.23]}>
            <boxGeometry args={[0.025, 0.02, 0.05]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
          </mesh>
        ))}
      </Part>

      <Part {...p("modem")}>
        <mesh>
          <boxGeometry args={[0.6, 0.1, 0.55]} />
          <meshStandardMaterial color={hl("modem", "#94a3b8")} metalness={0.85} roughness={0.25} />
        </mesh>
      </Part>

      <Part {...p("antenna")}>
        <mesh>
          <cylinderGeometry args={[0.05, 0.07, 1.4, 16]} />
          <meshStandardMaterial color={hl("antenna", "#111827")} roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.75, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.12, 16]} />
          <meshStandardMaterial color="#d4a017" metalness={0.9} roughness={0.2} />
        </mesh>
      </Part>

      <gridHelper args={[8, 16, "#1e3a5f", "#132036"]} position={[0, -1.65, 0]} />
    </>
  );
}

export default function TelemetryDeviceScene({
  exploded,
  selected,
  onSelect,
}: {
  exploded: boolean;
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const [hover, setHover] = React.useState<Hover | null>(null);
  const hovered = hover?.id ?? null;
  const hoveredPart = DEVICE_PARTS.find((p) => p.id === hovered);
  const [reduceMotion, setReduceMotion] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
  }, []);

  return (
    <div className="relative h-full w-full">
    <Canvas
      camera={{ position: [3.4, 2.2, 3.6], fov: 40 }}
      dpr={[1, 2]}
      style={{ cursor: hovered ? "pointer" : "grab" }}
      aria-label="Interactive 3D model of an illustrative IoT telemetry device"
    >
      <Scene exploded={exploded} hovered={hovered} selected={selected} setHovered={setHover} setSelected={onSelect} />
      <OrbitControls
        enablePan
        enableDamping
        minDistance={3}
        maxDistance={9}
        autoRotate={!reduceMotion && !hovered && !selected}
        autoRotateSpeed={0.6}
      />
    </Canvas>
      {hover && hoveredPart && (
        <div
          role="tooltip"
          className="pointer-events-none absolute z-10 max-w-56 rounded border border-accent/40 bg-background/95 px-2 py-1 shadow-lg"
          style={{ left: Math.min(hover.x + 12, 9999), top: hover.y + 12 }}
        >
          <div className="text-[11px] font-semibold text-accent">{hoveredPart.name}</div>
          <div className="text-[10px] text-muted-foreground">Click for details</div>
        </div>
      )}
    </div>
  );
}
