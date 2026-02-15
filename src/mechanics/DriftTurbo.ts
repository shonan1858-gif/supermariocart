import { GAME_CONSTANTS } from '../game/constants';

export class DriftTurbo {
  charge = 0;
  stage: 0 | 1 | 2 | 3 = 0;
  drifting = false;

  update(dt: number, driftingInput: boolean, speed: number, steer: number, yawRate: number): void {
    this.drifting = driftingInput && speed > GAME_CONSTANTS.drift.minSpeed && Math.abs(steer) > GAME_CONSTANTS.drift.minSteer;
    if (!this.drifting) return;

    this.charge += Math.abs(steer) * speed * dt * GAME_CONSTANTS.drift.chargeK * (1 + Math.abs(yawRate));
    if (this.charge >= GAME_CONSTANTS.drift.stage3) this.stage = 3;
    else if (this.charge >= GAME_CONSTANTS.drift.stage2) this.stage = 2;
    else if (this.charge >= GAME_CONSTANTS.drift.stage1) this.stage = 1;
  }

  releaseBoost(): { duration: number; power: number } | null {
    if (this.stage === 0) {
      this.reset();
      return null;
    }
    const boost = GAME_CONSTANTS.drift.boosts[this.stage];
    this.reset();
    return boost;
  }

  reset(): void {
    this.charge = 0;
    this.stage = 0;
    this.drifting = false;
  }
}
