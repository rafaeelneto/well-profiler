import type { HydrodynamicEvent, LevelReading } from '@welldot/core';

export function lastReading(event: HydrodynamicEvent): LevelReading | null {
  const ev = event as Record<string, unknown>;
  const steps = ev.steps as Array<{ readings?: LevelReading[] }> | undefined;
  if (!steps?.length) return null;
  for (let i = steps.length - 1; i >= 0; i--) {
    const r = steps[i]!.readings;
    if (r?.length) return r[r.length - 1]!;
  }
  return null;
}

export function allStepReadings(event: HydrodynamicEvent): LevelReading[] {
  const ev = event as Record<string, unknown>;
  const steps = ev.steps as Array<{ readings?: LevelReading[] }> | undefined;
  if (!steps?.length) return [];
  const out: LevelReading[] = [];
  for (const s of steps) if (s.readings) out.push(...s.readings);
  return out;
}

export function hasSparkline(event: HydrodynamicEvent): boolean {
  return allStepReadings(event).length >= 2;
}

export function sparklinePoints(event: HydrodynamicEvent): string {
  const readings = allStepReadings(event);
  if (readings.length < 2) return '';
  const minE = Math.min(...readings.map(r => r.elapsed));
  const maxE = Math.max(...readings.map(r => r.elapsed));
  const minD = Math.min(...readings.map(r => r.depth));
  const maxD = Math.max(...readings.map(r => r.depth));
  const W = 200,
    H = 40,
    P = 3;
  const rX = maxE - minE || 1;
  const rY = maxD - minD || 1;
  return readings
    .map(r => {
      const x = P + ((r.elapsed - minE) / rX) * (W - P * 2);
      const y = P + ((r.depth - minD) / rY) * (H - P * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

export function recoveryReadingsCount(event: HydrodynamicEvent): number {
  return (
    (
      (event as Record<string, unknown>).recovery as
        | { readings?: unknown[] }
        | undefined
    )?.readings?.length ?? 0
  );
}

export function stepRate(event: HydrodynamicEvent, index = 0): number | null {
  const steps = (event as Record<string, unknown>).steps as
    | Array<{ rate: number }>
    | undefined;
  return steps?.[index]?.rate ?? null;
}

type MaybeReading = { elapsed?: number | null; depth?: number | null };

export function stepHasReadings(readings: MaybeReading[]): boolean {
  return readings.some(r => r.elapsed != null && r.depth != null);
}

export function derivedStepDuration(readings: MaybeReading[]): number | null {
  const elapsedValues = readings
    .filter(r => r.elapsed != null && r.depth != null)
    .map(r => r.elapsed as number);
  return elapsedValues.length > 0 ? Math.max(...elapsedValues) : null;
}
