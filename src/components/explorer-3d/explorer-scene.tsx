"use client";

import * as React from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls, RoundedBox } from "@react-three/drei";
import type { Group } from "three";
import { MathUtils } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
  PIN_SIGNAL_COLORS,
  type Explorer3DModel,
  type ExplorerPart,
  type ExplorerPin,
  type ExplorerViewMode,
} from "@/lib/knowledge/explorer-3d";

export type CameraPreset = "isometric" | "top" | "front" | "side";

const CAMERA_POSITIONS: Record<CameraPreset, [number, number, number]> = {
  isometric: [3.2, 2.2, 3.4],
  top: [0.01, 4.4, 0.01],
  front: [0, 0.4, 4.2],
  side: [4.2, 0.5, 0],
};

interface HoverState {
  kind: "part" | "pin";
  id: string;
  label: string;
  sublabel: string;
  x: number;
  y: number;
}

function CameraController({ preset, resetNonce }: { preset: CameraPreset; resetNonce: number }) {
  const { camera } = useThree();
  const controlsRef = React.useRef<OrbitControlsImpl>(null);
  const animating = React.useRef(false);
  const targetPos = React.useRef<[number, number, number]>(CAMERA_POSITIONS[preset]);

  React.useEffect(() => {
    targetPos.current = CAMERA_POSITIONS[preset];
    animating.current = true;
  }, [preset, resetNonce]);

  useFrame((_, dt) => {
    if (!animating.current) return;
    const [tx, ty, tz] = targetPos.current;
    camera.position.x = MathUtils.damp(camera.position.x, tx, 7, dt);
    camera.position.y = MathUtils.damp(camera.position.y, ty, 7, dt);
    camera.position.z = MathUtils.damp(camera.position.z, tz, 7, dt);
    controlsRef.current?.target.set(0, 0, 0);
    controlsRef.current?.update();

    if (
      Math.abs(camera.position.x - tx) < 0.02 &&
      Math.abs(camera.position.y - ty) < 0.02 &&
      Math.abs(camera.position.z - tz) < 0.02
    ) {
      animating.current = false;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan
      enableDamping
      minDistance={1.8}
      maxDistance={9}
      onStart={() => {
        animating.current = false;
      }}
    />
  );
}

function AnimatedPart({
  part,
  modelSlug,
  exploded,
  selected,
  hovered,
  wireframe,
  showLabels,
  onSelect,
  onHover,
}: {
  part: ExplorerPart;
  modelSlug: string;
  exploded: boolean;
  selected: boolean;
  hovered: boolean;
  wireframe: boolean;
  showLabels: boolean;
  onSelect: (id: string) => void;
  onHover: (h: HoverState | null) => void;
}) {
  const ref = React.useRef<Group>(null);
  const [bx, by, bz] = part.basePosition;
  const [ox, oy, oz] = part.explodeOffset;

  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.position.x = MathUtils.damp(ref.current.position.x, bx + (exploded ? ox : 0), 6, dt);
    ref.current.position.y = MathUtils.damp(ref.current.position.y, by + (exploded ? oy : 0), 6, dt);
    ref.current.position.z = MathUtils.damp(ref.current.position.z, bz + (exploded ? oz : 0), 6, dt);
  });

  const color = selected || hovered ? "#13d3f2" : part.color;

  const renderGeometry = () => {
    // Parametric geometries tailored per model + part ID
    if (modelSlug === "esp32-devkit") {
      if (part.id === "pcb") {
        return (
          <RoundedBox args={[2.7, 0.08, 1.35]} radius={0.02} smoothness={2}>
            <meshStandardMaterial color={color} roughness={0.55} wireframe={wireframe} />
          </RoundedBox>
        );
      }
      if (part.id === "rf-shield") {
        return (
          <RoundedBox args={[0.92, 0.18, 0.78]} radius={0.02} smoothness={2}>
            <meshStandardMaterial color={color} metalness={0.85} roughness={0.25} wireframe={wireframe} />
          </RoundedBox>
        );
      }
      if (part.id === "pcb-antenna") {
        return (
          <mesh>
            <boxGeometry args={[0.36, 0.04, 0.85]} />
            <meshStandardMaterial color={color} metalness={0.6} roughness={0.35} wireframe={wireframe} />
          </mesh>
        );
      }
      if (part.id === "usb-port") {
        return (
          <RoundedBox args={[0.32, 0.16, 0.42]} radius={0.02} smoothness={2}>
            <meshStandardMaterial color={color} metalness={0.9} roughness={0.2} wireframe={wireframe} />
          </RoundedBox>
        );
      }
      return (
        <mesh>
          <boxGeometry args={[0.28, 0.1, 0.28]} />
          <meshStandardMaterial color={color} roughness={0.4} wireframe={wireframe} />
        </mesh>
      );
    }

    if (modelSlug === "water-meter-node") {
      if (part.id === "sensor") {
        return (
          <group>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.28, 0.28, 2.8, 28]} />
              <meshStandardMaterial color={color} metalness={0.6} roughness={0.35} wireframe={wireframe} />
            </mesh>
            <mesh position={[0, 0.28, 0]}>
              <boxGeometry args={[0.62, 0.3, 0.5]} />
              <meshStandardMaterial color={color} roughness={0.5} wireframe={wireframe} />
            </mesh>
          </group>
        );
      }
      if (part.id === "enclosure") {
        return (
          <RoundedBox args={[2.5, 0.85, 1.05]} radius={0.1} smoothness={4}>
            <meshPhysicalMaterial
              color={color}
              transparent
              opacity={exploded ? 0.1 : 0.2}
              roughness={0.15}
              depthWrite={false}
              wireframe={wireframe}
            />
          </RoundedBox>
        );
      }
      if (part.id === "pcb") {
        return (
          <mesh>
            <boxGeometry args={[2.2, 0.05, 0.85]} />
            <meshStandardMaterial color={color} roughness={0.6} wireframe={wireframe} />
          </mesh>
        );
      }
      if (part.id === "battery") {
        return (
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.18, 0.18, 0.78, 24]} />
            <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} wireframe={wireframe} />
          </mesh>
        );
      }
      if (part.id === "antenna") {
        return (
          <group>
            <mesh>
              <cylinderGeometry args={[0.045, 0.065, 1.3, 16]} />
              <meshStandardMaterial color={color} roughness={0.5} wireframe={wireframe} />
            </mesh>
            <mesh position={[0, -0.68, 0]}>
              <cylinderGeometry args={[0.09, 0.09, 0.12, 16]} />
              <meshStandardMaterial color="#d4a017" metalness={0.9} roughness={0.2} wireframe={wireframe} />
            </mesh>
          </group>
        );
      }
      return (
        <mesh>
          <boxGeometry args={[0.48, 0.1, 0.45]} />
          <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} wireframe={wireframe} />
        </mesh>
      );
    }

    if (modelSlug === "lm358-ic") {
      if (part.id === "epoxy-body") {
        return (
          <RoundedBox args={[1.95, 0.34, 1.05]} radius={0.04} smoothness={2}>
            <meshStandardMaterial
              color={color}
              roughness={0.45}
              transparent={exploded}
              opacity={exploded ? 0.75 : 1}
              wireframe={wireframe}
            />
          </RoundedBox>
        );
      }
      if (part.id === "silicon-die") {
        return (
          <mesh>
            <boxGeometry args={[0.65, 0.08, 0.55]} />
            <meshStandardMaterial color={color} metalness={0.8} roughness={0.15} wireframe={wireframe} />
          </mesh>
        );
      }
      return (
        <mesh>
          <boxGeometry args={[1.65, 0.06, 0.92]} />
          <meshStandardMaterial color={color} metalness={0.85} roughness={0.25} wireframe={wireframe} />
        </mesh>
      );
    }

    if (modelSlug === "hc-sr04-3d") {
      if (part.id === "pcb") {
        return (
          <RoundedBox args={[2.3, 1.0, 0.08]} radius={0.02} smoothness={2}>
            <meshStandardMaterial color={color} roughness={0.55} wireframe={wireframe} />
          </RoundedBox>
        );
      }
      if (part.id === "tx-transducer" || part.id === "rx-transducer") {
        return (
          <group rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.42, 0.42, 0.58, 32]} />
            <meshStandardMaterial color={color} metalness={0.8} roughness={0.25} wireframe={wireframe} />
          </group>
        );
      }
      return (
        <mesh>
          <boxGeometry args={[0.5, 0.22, 0.16]} />
          <meshStandardMaterial color={color} metalness={0.8} roughness={0.25} wireframe={wireframe} />
        </mesh>
      );
    }

    // Rover chassis
    if (part.id === "chassis") {
      return (
        <RoundedBox args={[2.2, 0.08, 1.4]} radius={0.03} smoothness={2}>
          <meshStandardMaterial color={color} metalness={0.6} roughness={0.35} wireframe={wireframe} />
        </RoundedBox>
      );
    }
    if (part.id === "left-wheel" || part.id === "right-wheel") {
      return (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.22, 28]} />
          <meshStandardMaterial color={color} roughness={0.75} wireframe={wireframe} />
        </mesh>
      );
    }
    return (
      <RoundedBox args={[0.75, 0.22, 0.55]} radius={0.03} smoothness={2}>
        <meshStandardMaterial color={color} roughness={0.45} wireframe={wireframe} />
      </RoundedBox>
    );
  };

  return (
    <group
      ref={ref}
      position={part.basePosition}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover({
          kind: "part",
          id: part.id,
          label: part.name,
          sublabel: part.dimensions,
          x: e.nativeEvent.offsetX,
          y: e.nativeEvent.offsetY,
        });
      }}
      onPointerMove={(e) => {
        e.stopPropagation();
        onHover({
          kind: "part",
          id: part.id,
          label: part.name,
          sublabel: part.dimensions,
          x: e.nativeEvent.offsetX,
          y: e.nativeEvent.offsetY,
        });
      }}
      onPointerOut={() => onHover(null)}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(part.id);
      }}
    >
      {renderGeometry()}
      {showLabels && (
        <Html distanceFactor={6} position={[0, 0.35, 0]} center>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(part.id);
            }}
            className={`whitespace-nowrap rounded border px-1.5 py-0.5 text-[10px] font-medium shadow-md transition-colors ${
              selected
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border bg-background/90 text-foreground hover:border-accent"
            }`}
          >
            {part.name}
          </button>
        </Html>
      )}
    </group>
  );
}

function PinMarker({
  pin,
  selected,
  showLabels,
  onSelect,
  onHover,
}: {
  pin: ExplorerPin;
  selected: boolean;
  showLabels: boolean;
  onSelect: (pinNum: string) => void;
  onHover: (h: HoverState | null) => void;
}) {
  const signalColor = PIN_SIGNAL_COLORS[pin.signalType].hex;

  return (
    <group position={pin.position}>
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover({
            kind: "pin",
            id: pin.pin,
            label: `Pin ${pin.pin}: ${pin.name}`,
            sublabel: `${pin.voltage} · ${PIN_SIGNAL_COLORS[pin.signalType].label}`,
            x: e.nativeEvent.offsetX,
            y: e.nativeEvent.offsetY,
          });
        }}
        onPointerOut={() => onHover(null)}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(pin.pin);
        }}
      >
        <sphereGeometry args={[selected ? 0.085 : 0.06, 16, 16]} />
        <meshStandardMaterial
          color={selected ? "#ffffff" : signalColor}
          emissive={signalColor}
          emissiveIntensity={selected ? 1.8 : 0.7}
        />
      </mesh>
      {(showLabels || selected) && (
        <Html distanceFactor={5} position={[0, 0.14, 0]} center>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(pin.pin);
            }}
            className={`whitespace-nowrap rounded border px-1 py-0.5 font-mono text-[9px] font-semibold shadow ${
              selected
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border/80 bg-background/95 text-foreground"
            }`}
          >
            {pin.pin}·{pin.name}
          </button>
        </Html>
      )}
    </group>
  );
}

export default function ExplorerScene({
  model,
  viewMode,
  selectedPartId,
  selectedPin,
  showLabels,
  showPins,
  wireframe,
  cameraPreset,
  resetNonce,
  onSelectPart,
  onSelectPin,
}: {
  model: Explorer3DModel;
  viewMode: ExplorerViewMode;
  selectedPartId: string | null;
  selectedPin: string | null;
  showLabels: boolean;
  showPins: boolean;
  wireframe: boolean;
  cameraPreset: CameraPreset;
  resetNonce: number;
  onSelectPart: (id: string) => void;
  onSelectPin: (pin: string) => void;
}) {
  const [hover, setHover] = React.useState<HoverState | null>(null);
  const exploded = viewMode === "exploded";
  const displayPins = showPins || viewMode === "pinout";

  return (
    <div className="relative h-full w-full">
      <Canvas
        camera={{ position: CAMERA_POSITIONS[cameraPreset], fov: 40 }}
        dpr={[1, 2]}
        style={{ cursor: hover ? "pointer" : "grab" }}
        aria-label={`Interactive 3D explorer for ${model.name}`}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[4, 6, 5]} intensity={1.4} />
        <directionalLight position={[-5, 3, -4]} intensity={0.55} color="#3b82f6" />
        <pointLight position={[0, -2, 3]} intensity={0.5} color="#8b5cf6" />

        {model.parts.map((part) => (
          <AnimatedPart
            key={`${model.slug}-${part.id}`}
            part={part}
            modelSlug={model.slug}
            exploded={exploded}
            selected={selectedPartId === part.id}
            hovered={hover?.kind === "part" && hover.id === part.id}
            wireframe={wireframe}
            showLabels={showLabels}
            onSelect={onSelectPart}
            onHover={setHover}
          />
        ))}

        {displayPins &&
          model.pins.map((pin) => (
            <PinMarker
              key={`${model.slug}-pin-${pin.pin}`}
              pin={pin}
              selected={selectedPin === pin.pin}
              showLabels={showLabels}
              onSelect={onSelectPin}
              onHover={setHover}
            />
          ))}

        <gridHelper args={[10, 20, "#1e3a5f", "#132036"]} position={[0, -1.6, 0]} />
        <CameraController preset={cameraPreset} resetNonce={resetNonce} />
      </Canvas>

      {hover && (
        <div
          role="tooltip"
          className="pointer-events-none absolute z-20 max-w-60 rounded border border-accent/40 bg-background/95 px-2.5 py-1.5 shadow-lg"
          style={{ left: Math.min(hover.x + 14, 9999), top: hover.y + 14 }}
        >
          <div className="text-[11px] font-semibold text-accent">{hover.label}</div>
          <div className="text-[10px] text-muted-foreground">{hover.sublabel}</div>
        </div>
      )}
    </div>
  );
}

