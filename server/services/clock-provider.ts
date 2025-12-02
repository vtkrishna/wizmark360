export interface ClockProvider {
  now(): Date;
  iso(): string;
  timestamp(): number;
}

export class RealTimeClock implements ClockProvider {
  now(): Date {
    return new Date();
  }

  iso(): string {
    return new Date().toISOString();
  }

  timestamp(): number {
    return Date.now();
  }
}

export class DeterministicClock implements ClockProvider {
  private baseTime: number;
  private stepCounter: number = 0;
  private currentTick: Date | null = null;

  constructor(seed: string) {
    this.baseTime = this.hashToTimestamp(seed);
  }

  now(): Date {
    const offset = this.stepCounter * 1000;
    this.stepCounter++;
    this.currentTick = new Date(this.baseTime + offset);
    return this.currentTick;
  }

  iso(): string {
    if (!this.currentTick) {
      this.now();
    }
    return this.currentTick!.toISOString();
  }

  timestamp(): number {
    if (!this.currentTick) {
      this.now();
    }
    return this.currentTick!.getTime();
  }

  private hashToTimestamp(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    const baseTimestamp = 1704067200000;
    const offset = Math.abs(hash) % (365 * 24 * 60 * 60 * 1000);
    return baseTimestamp + offset;
  }
}

export function createClockProvider(deterministicMode: boolean, seed?: string): ClockProvider {
  if (deterministicMode) {
    if (!seed) {
      throw new Error('Deterministic mode requires a clock seed');
    }
    return new DeterministicClock(seed);
  }
  return new RealTimeClock();
}
