import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Renderer } from '../render/Renderer';
import { PhysicsWorld } from '../physics/PhysicsWorld';
import { Vehicle } from '../physics/Vehicle';
import { Input } from '../input/Input';
import { ChaseCamera } from '../camera/ChaseCamera';
import { Track } from '../track/Track';
import { SurfaceQuery } from '../track/SurfaceQuery';
import { DriftTurbo } from '../mechanics/DriftTurbo';
import { AntiGravity } from '../mechanics/AntiGravity';
import { Items } from '../mechanics/Items';
import { CPUDriver } from '../ai/CPUDriver';
import { HUD } from '../ui/HUD';
import { Loop } from './Loop';
import { GAME_CONSTANTS } from './constants';

export class Game {
  private readonly renderer: Renderer;
  private readonly physics = new PhysicsWorld();
  private readonly input = new Input();
  private readonly track = new Track();
  private readonly surface = new SurfaceQuery(this.track);
  private readonly player: Vehicle;
  private readonly cpu: Vehicle;
  private readonly drift = new DriftTurbo();
  private readonly antiGravity = new AntiGravity();
  private readonly items = new Items();
  private readonly cpuAi = new CPUDriver(this.track.checkpoints);
  private readonly chase: ChaseCamera;
  private readonly hud: HUD;
  private readonly loop: Loop;

  private lap = 1;
  private checkpointIndex = 0;
  private elapsed = 0;
  private debug = true;
  private lastDrift = false;

  constructor(container: HTMLElement) {
    this.renderer = new Renderer(container);
    this.renderer.scene.add(this.track.group);
    this.player = new Vehicle(this.physics.world, this.renderer.scene, '#ff3333');
    this.cpu = new Vehicle(this.physics.world, this.renderer.scene, '#3399ff');
    this.cpu.respawn(new CANNON.Vec3(0, 2, -6));

    const ground = new CANNON.Body({ mass: 0, shape: new CANNON.Box(new CANNON.Vec3(200, 1, 200)), position: new CANNON.Vec3(0, -2.5, 0) });
    this.physics.world.addBody(ground);
    const wall = new CANNON.Body({ mass: 0, shape: new CANNON.Box(new CANNON.Vec3(1, 15, 20)), position: new CANNON.Vec3(55, 8, -24), quaternion: new CANNON.Quaternion().setFromEuler(0, 0, Math.PI / 2) });
    this.physics.world.addBody(wall);

    this.chase = new ChaseCamera(this.renderer.camera);
    this.hud = new HUD(container);
    this.loop = new Loop((dt) => this.update(dt));
  }

  start(): void {
    this.loop.start();
  }

  private update(dt: number): void {
    this.elapsed += dt;

    const playerPos = this.player.mesh.position.clone();
    const sample = this.surface.sampleSurface(playerPos);
    this.antiGravity.update(dt, sample.normal, this.physics.world);

    this.drift.update(dt, this.input.drift, this.player.speed, this.input.steer, this.player.chassisBody.angularVelocity.y);
    if (this.lastDrift && !this.input.drift) {
      const boost = this.drift.releaseBoost();
      if (boost) this.player.triggerBoost(boost.duration, boost.power);
    }
    this.lastDrift = this.input.drift;

    if (this.input.respawn) this.player.respawn(new CANNON.Vec3(0, 2, 0));

    const offroad = sample.type === 'offroad';
    this.player.applyControls(this.input.throttle, this.input.brake, this.input.steer, dt, offroad);

    const cpuPos = this.cpu.mesh.position.clone();
    const cpuCmd = this.cpuAi.update(cpuPos);
    this.cpu.applyControls(cpuCmd.throttle, cpuCmd.brake, cpuCmd.steer, dt, false);

    this.physics.step(dt);
    this.player.updateVisual();
    this.cpu.updateVisual();

    this.chase.update(this.player.mesh.position, this.player.mesh.quaternion, dt);

    if (this.input.useItem) this.items.use(this.player);
    this.items.update(dt);
    this.tryPickupItem();
    this.checkLap();
    this.spinBoostCheck();

    if (this.input.debugToggle) this.debug = !this.debug;

    this.updateHud(1 / Math.max(dt, 0.0001));
    this.renderer.render();
    this.input.consumeFrameActions();
  }

  private tryPickupItem(): void {
    const myPos = this.player.mesh.position;
    for (const boxPos of this.track.itemBoxes) {
      if (myPos.distanceTo(boxPos) < 2.4) {
        const d = Math.max(0, this.computeProgress(this.cpu.mesh.position) - this.computeProgress(this.player.mesh.position));
        this.items.roll(d);
      }
    }
  }

  private checkLap(): void {
    const cp = this.track.checkpoints[this.checkpointIndex];
    if (this.player.mesh.position.distanceTo(cp) < 10) {
      this.checkpointIndex++;
      if (this.checkpointIndex >= this.track.checkpoints.length) {
        this.checkpointIndex = 0;
        this.lap++;
      }
    }
  }

  private computeProgress(pos: THREE.Vector3): number {
    let nearest = 0;
    let best = Number.POSITIVE_INFINITY;
    this.track.checkpoints.forEach((cp, i) => {
      const d = cp.distanceToSquared(pos);
      if (d < best) {
        best = d;
        nearest = i;
      }
    });
    return nearest / this.track.checkpoints.length;
  }

  private spinBoostCheck(): void {
    if (this.antiGravity.active && this.player.mesh.position.distanceTo(this.cpu.mesh.position) < 3) {
      this.player.triggerSpinBoost(GAME_CONSTANTS.antiGravity.spinBoostDuration);
    }
  }

  private updateHud(fps: number): void {
    const p = this.computeProgress(this.player.mesh.position);
    const c = this.computeProgress(this.cpu.mesh.position);
    const rank = p >= c ? 1 : 2;
    this.hud.set('Speed', `${(this.player.speed * 3.6).toFixed(1)} km/h`);
    this.hud.set('Lap', `${this.lap}`);
    this.hud.set('Rank', `${rank}/2`);
    this.hud.set('Item', this.items.held ?? '-');
    this.hud.set('Coins', `${this.items.coins}`);
    this.hud.set('Drift', `stage ${this.drift.stage} (${this.drift.charge.toFixed(1)})`);
    this.hud.set('AntiGravity', this.antiGravity.active ? 'ON' : 'OFF');
    this.hud.set('Time', `${this.elapsed.toFixed(2)}s`);
    if (this.debug) {
      this.hud.set('FPS', fps.toFixed(0));
      this.hud.set('Physics dt', `${GAME_CONSTANTS.physics.fixedTimeStep.toFixed(3)} / substeps ${GAME_CONSTANTS.physics.maxSubSteps}`);
    }
  }
}
