import * as THREE from 'three';

export class CPUDriver {
  private idx = 0;
  constructor(private readonly waypoints: THREE.Vector3[]) {}

  update(position: THREE.Vector3): { throttle: number; brake: number; steer: number; drift: boolean } {
    const target = this.waypoints[this.idx];
    if (position.distanceTo(target) < 8) this.idx = (this.idx + 1) % this.waypoints.length;

    const toTarget = target.clone().sub(position).normalize();
    const forward = new THREE.Vector3(0, 0, 1);
    const steer = THREE.MathUtils.clamp(forward.cross(toTarget).y * 3, -1, 1);
    const curvature = Math.abs(steer);
    const throttle = curvature > 0.6 ? 0.6 : 1;
    return { throttle, brake: 0, steer, drift: curvature > 0.5 };
  }
}
