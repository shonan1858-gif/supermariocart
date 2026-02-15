import * as THREE from 'three';
import type { Track, SurfaceType } from './Track';

export class SurfaceQuery {
  constructor(private readonly track: Track) {}

  sampleSurface(position: THREE.Vector3): { type: SurfaceType; normal: THREE.Vector3 } {
    const type = this.track.getSurfaceType(position);
    if (type === 'antiGravity') {
      return { type, normal: new THREE.Vector3(1, 0, 0) };
    }
    return { type, normal: new THREE.Vector3(0, 1, 0) };
  }
}
