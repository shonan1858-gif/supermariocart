import type { Vehicle } from '../physics/Vehicle';
import { GAME_CONSTANTS } from '../game/constants';

export type ItemType = 'coin' | 'banana' | 'greenShell' | 'redShell' | 'mushroom' | 'star';

export class Items {
  held: ItemType | null = null;
  coins = 0;
  starTimer = 0;

  roll(distanceBehindLeader: number): void {
    if (this.held) return;
    const pool: ItemType[] = distanceBehindLeader < 0.15
      ? ['coin', 'banana', 'greenShell']
      : distanceBehindLeader < 0.45
      ? ['redShell', 'mushroom', 'greenShell']
      : ['star', 'mushroom', 'redShell'];
    this.held = pool[Math.floor(Math.random() * pool.length)];
  }

  use(vehicle: Vehicle): string {
    if (!this.held) return 'none';
    const used = this.held;
    this.held = null;
    if (used === 'coin') this.coins += 2;
    if (used === 'mushroom') vehicle.triggerBoost(0.8, 1.3);
    if (used === 'star') {
      this.starTimer = GAME_CONSTANTS.item.starDuration;
      vehicle.triggerBoost(2, 1.45);
    }
    if (used === 'redShell') return 'homing shell launched';
    return used;
  }

  update(dt: number): void {
    this.starTimer = Math.max(0, this.starTimer - dt);
  }
}
