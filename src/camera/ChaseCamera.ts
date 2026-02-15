import * as THREE from 'three';

export class ChaseCamera {
  private readonly desiredPos = new THREE.Vector3();
  private readonly desiredLookAt = new THREE.Vector3();

  constructor(private readonly camera: THREE.PerspectiveCamera) {}

  update(targetPos: THREE.Vector3, targetQuat: THREE.Quaternion, dt: number): void {
    const backOffset = new THREE.Vector3(0, 3.5, -9).applyQuaternion(targetQuat);
    this.desiredPos.copy(targetPos).add(backOffset);
    this.desiredLookAt.copy(targetPos).add(new THREE.Vector3(0, 1.5, 0));

    const alpha = 1 - Math.exp(-8 * dt);
    this.camera.position.lerp(this.desiredPos, alpha);

    const look = new THREE.Vector3().subVectors(this.desiredLookAt, this.camera.position).normalize();
    const lookMat = new THREE.Matrix4().lookAt(this.camera.position, this.camera.position.clone().add(look), new THREE.Vector3(0, 1, 0));
    const q = new THREE.Quaternion().setFromRotationMatrix(lookMat);
    this.camera.quaternion.slerp(q, alpha);
  }
}
