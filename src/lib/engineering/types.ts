export interface CalcStep {
  label: string;
  expression: string;
  result: string;
}

export type CalcResult<T> =
  | { ok: true; value: T; steps: CalcStep[]; assumptions: string[]; limitations: string[] }
  | { ok: false; error: string };

export const fmt = (n: number, digits = 4) => {
  if (!Number.isFinite(n)) return String(n);
  const abs = Math.abs(n);
  if (abs !== 0 && (abs < 1e-3 || abs >= 1e6)) return n.toExponential(3);
  return Number(n.toPrecision(digits)).toString();
};
