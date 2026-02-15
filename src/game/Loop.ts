export class Loop {
  private last = performance.now();
  private running = false;

  constructor(private readonly tick: (dt: number) => void) {}

  start(): void {
    this.running = true;
    const step = (now: number) => {
      if (!this.running) return;
      const dt = Math.min((now - this.last) / 1000, 0.05);
      this.last = now;
      this.tick(dt);
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
}
