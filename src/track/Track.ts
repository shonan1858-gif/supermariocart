import * as THREE from 'three';

export type SurfaceType = 'road' | 'offroad' | 'antiGravity';

type Zone = { center: THREE.Vector3; halfExtents: THREE.Vector3; type: SurfaceType };

export class Track {
  readonly group = new THREE.Group();
  readonly checkpoints: THREE.Vector3[] = [];
  readonly itemBoxes: THREE.Vector3[] = [];
  private readonly zones: Zone[] = [];

  constructor() {
    const road = new THREE.Mesh(
      new THREE.BoxGeometry(160, 2, 50),
      new THREE.MeshStandardMaterial({ color: '#555' }),
    );
    road.position.set(0, -1, 0);
    this.group.add(road);
    this.zones.push({ center: road.position.clone(), halfExtents: new THREE.Vector3(80, 2, 25), type: 'road' });

    const offroad = new THREE.Mesh(
      new THREE.BoxGeometry(220, 1, 120),
      new THREE.MeshStandardMaterial({ color: '#2f8f2f' }),
    );
    offroad.position.set(0, -2, 0);
    this.group.add(offroad);
    this.zones.push({ center: offroad.position.clone(), halfExtents: new THREE.Vector3(110, 1.5, 60), type: 'offroad' });

    const antiWall = new THREE.Mesh(
      new THREE.BoxGeometry(30, 20, 2),
      new THREE.MeshStandardMaterial({ color: '#2aa9ff' }),
    );
    antiWall.position.set(40, 8, -24);
    this.group.add(antiWall);
    this.zones.push({ center: antiWall.position.clone(), halfExtents: new THREE.Vector3(15, 10, 2), type: 'antiGravity' });

    this.checkpoints.push(new THREE.Vector3(-70, 0, 0), new THREE.Vector3(0, 0, 20), new THREE.Vector3(70, 0, -20));
    this.itemBoxes.push(new THREE.Vector3(-30, 1.5, 0), new THREE.Vector3(30, 1.5, 0));
    this.itemBoxes.forEach((v) => {
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(2, 2, 2),
        new THREE.MeshStandardMaterial({ color: '#ffd54f', emissive: '#775500' }),
      );
      box.position.copy(v);
      this.group.add(box);
    });
  }

  getSurfaceType(position: THREE.Vector3): SurfaceType {
    for (const zone of this.zones) {
      const d = position.clone().sub(zone.center);
      if (Math.abs(d.x) < zone.halfExtents.x && Math.abs(d.y) < zone.halfExtents.y && Math.abs(d.z) < zone.halfExtents.z) {
        return zone.type;
      }
    }
    return 'offroad';
  }
}
