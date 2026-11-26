export interface ScalingConfig {
  scale: number;
  offset: number;
  unit: string;
  registerAddress: number;
  byteOffset: number;
}

export function applyEngineeringScaling(rawValue: number | null, config: ScalingConfig): {
  engineeringValue: number | null;
  formatted: string;
} {
  if (rawValue === null || !Number.isFinite(rawValue)) {
    return { engineeringValue: null, formatted: "—" };
  }
  const scaled = Number((rawValue * config.scale + config.offset).toFixed(6));
  return {
    engineeringValue: scaled,
    formatted: config.unit ? `${scaled} ${config.unit}` : String(scaled),
  };
}

