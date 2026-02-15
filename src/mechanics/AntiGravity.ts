import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { GAME_CONSTANTS } from '../game/constants';

export class AntiGravity {
  active = false;
  readonly up = new THREE.Vector3(0, 1, 0);

  update(dt: number, normal: THREE.Vector3, world: CANNON.World): void {
    this.active = normal.y < 0.9;
    const alpha = 1 - Math.exp(-GAME_CONSTANTS.antiGravity.alignSharpness * dt);
    this.up.lerp(normal, alpha).normalize();

    const gravity = new CANNON.Vec3(
      -this.up.x * GAME_CONSTANTS.physics.gravity,
      -this.up.y * GAME_CONSTANTS.physics.gravity,
      -this.up.z * GAME_CONSTANTS.physics.gravity,
    );
    if (this.active) world.gravity.copy(gravity);
    else world.gravity.set(0, -GAME_CONSTANTS.physics.gravity, 0);
  }
}
