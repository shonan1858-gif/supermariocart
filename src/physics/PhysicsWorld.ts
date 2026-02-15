import * as CANNON from 'cannon-es';
import { GAME_CONSTANTS } from '../game/constants';

export class PhysicsWorld {
  readonly world: CANNON.World;

  constructor() {
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -GAME_CONSTANTS.physics.gravity, 0),
    });
    this.world.broadphase = new CANNON.SAPBroadphase(this.world);
    this.world.allowSleep = true;
  }

  setGravity(direction: CANNON.Vec3): void {
    this.world.gravity.copy(direction);
  }

  step(dt: number): void {
    this.world.step(GAME_CONSTANTS.physics.fixedTimeStep, dt, GAME_CONSTANTS.physics.maxSubSteps);
  }
}
