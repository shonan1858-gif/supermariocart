export class Input {
  throttle = 0;
  brake = 0;
  steer = 0;
  drift = false;
  useItem = false;
  respawn = false;
  debugToggle = false;
  wireToggle = false;

  constructor(target: Window = window) {
    target.addEventListener('keydown', (e) => this.onKey(e.code, true));
    target.addEventListener('keyup', (e) => this.onKey(e.code, false));
  }

  private onKey(code: string, down: boolean): void {
    if (code === 'KeyW' || code === 'ArrowUp') this.throttle = down ? 1 : 0;
    if (code === 'KeyS' || code === 'ArrowDown') this.brake = down ? 1 : 0;
    if (code === 'KeyA' || code === 'ArrowLeft') this.steer = down ? -1 : this.steer === -1 ? 0 : this.steer;
    if (code === 'KeyD' || code === 'ArrowRight') this.steer = down ? 1 : this.steer === 1 ? 0 : this.steer;
    if (code === 'ShiftLeft' || code === 'ShiftRight') this.drift = down;
    if (down && code === 'Space') this.useItem = true;
    if (down && code === 'KeyR') this.respawn = true;
    if (down && code === 'F1') this.debugToggle = true;
    if (down && code === 'F2') this.wireToggle = true;
  }

  consumeFrameActions(): void {
    this.useItem = false;
    this.respawn = false;
    this.debugToggle = false;
    this.wireToggle = false;
  }
}
