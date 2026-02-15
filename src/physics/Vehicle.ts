import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { GAME_CONSTANTS } from '../game/constants';

export class Vehicle {
  readonly chassisBody: CANNON.Body;
  readonly vehicle: CANNON.RaycastVehicle;
  readonly mesh: THREE.Mesh;
  boostTimer = 0;
  boostPower = 1;
  spinBoostTimer = 0;

  constructor(private readonly world: CANNON.World, scene: THREE.Scene, color = '#ff3333') {
    this.chassisBody = new CANNON.Body({
      mass: 180,
      shape: new CANNON.Box(new CANNON.Vec3(1, 0.5, 2)),
      position: new CANNON.Vec3(0, 2, 0),
    });
    this.world.addBody(this.chassisBody);

    this.vehicle = new CANNON.RaycastVehicle({ chassisBody: this.chassisBody, indexRightAxis: 0, indexUpAxis: 1, indexForwardAxis: 2 });

    const wheelPositions: CANNON.Vec3[] = [
      new CANNON.Vec3(-1, 0, 1.3),
      new CANNON.Vec3(1, 0, 1.3),
      new CANNON.Vec3(-1, 0, -1.3),
      new CANNON.Vec3(1, 0, -1.3),
    ];
    wheelPositions.forEach((p, i) => {
      this.vehicle.addWheel({
        chassisConnectionPointLocal: p,
        radius: 0.42,
        isFrontWheel: i < 2,
        suspensionStiffness: 30,
        frictionSlip: 3.5,
        dampingCompression: 4.4,
        dampingRelaxation: 2.3,
      });
    });
    this.vehicle.addToWorld(this.world);

    this.mesh = new THREE.Mesh(new THREE.BoxGeometry(2, 1, 4), new THREE.MeshStandardMaterial({ color }));
    scene.add(this.mesh);
  }

  get speed(): number {
    return this.chassisBody.velocity.length();
  }

  updateVisual(): void {
    this.mesh.position.set(this.chassisBody.position.x, this.chassisBody.position.y, this.chassisBody.position.z);
    this.mesh.quaternion.set(this.chassisBody.quaternion.x, this.chassisBody.quaternion.y, this.chassisBody.quaternion.z, this.chassisBody.quaternion.w);
  }

  applyControls(throttle: number, brake: number, steerInput: number, dt: number, isOffroad: boolean): void {
    const speed = this.speed;
    const steerMax = THREE.MathUtils.lerp(
      GAME_CONSTANTS.vehicle.steerLow,
      GAME_CONSTANTS.vehicle.steerHigh,
      Math.min(speed / GAME_CONSTANTS.vehicle.maxSpeed, 1),
    );
    const steer = steerMax * steerInput;
    this.vehicle.setSteeringValue(steer, 0);
    this.vehicle.setSteeringValue(steer, 1);

    const engineScale = isOffroad ? GAME_CONSTANTS.vehicle.offroadEngineFactor : 1;
    const maxSpeed = GAME_CONSTANTS.vehicle.maxSpeed * (isOffroad ? GAME_CONSTANTS.vehicle.offroadMaxSpeedFactor : 1);
    const boost = this.boostTimer > 0 || this.spinBoostTimer > 0 ? this.boostPower : 1;

    const engineForce = speed < maxSpeed ? -GAME_CONSTANTS.vehicle.engineForceMax * throttle * engineScale * boost : 0;
    this.vehicle.applyEngineForce(engineForce, 2);
    this.vehicle.applyEngineForce(engineForce, 3);

    const brakeForce = GAME_CONSTANTS.vehicle.brakeForce * brake;
    for (let i = 0; i < 4; i++) this.vehicle.setBrake(brakeForce, i);

    const forward = new CANNON.Vec3(0, 0, 1);
    this.chassisBody.quaternion.vmult(forward, forward);
    const lateral = this.chassisBody.velocity.vsub(forward.scale(this.chassisBody.velocity.dot(forward)));
    this.chassisBody.velocity.vsub(lateral.scale(0.12), this.chassisBody.velocity);

    this.boostTimer = Math.max(0, this.boostTimer - dt);
    this.spinBoostTimer = Math.max(0, this.spinBoostTimer - dt);
    if (this.boostTimer <= 0 && this.spinBoostTimer <= 0) this.boostPower = 1;
  }

  triggerBoost(duration: number, power: number): void {
    this.boostTimer = Math.max(this.boostTimer, duration);
    this.boostPower = Math.max(this.boostPower, power);
  }

  triggerSpinBoost(duration: number): void {
    this.spinBoostTimer = Math.max(this.spinBoostTimer, duration);
    this.boostPower = Math.max(this.boostPower, 1.2);
  }

  respawn(pos: CANNON.Vec3): void {
    this.chassisBody.position.copy(pos);
    this.chassisBody.velocity.set(0, 0, 0);
    this.chassisBody.angularVelocity.set(0, 0, 0);
    this.chassisBody.quaternion.set(0, 0, 0, 1);
  }
}
