export class HUD {
  readonly root = document.createElement('div');
  private readonly lines = new Map<string, HTMLDivElement>();

  constructor(container: HTMLElement) {
    Object.assign(this.root.style, {
      position: 'fixed',
      left: '12px',
      top: '12px',
      color: 'white',
      fontFamily: 'monospace',
      textShadow: '0 1px 3px black',
      zIndex: '20',
    });
    container.appendChild(this.root);
  }

  set(key: string, value: string): void {
    let line = this.lines.get(key);
    if (!line) {
      line = document.createElement('div');
      this.lines.set(key, line);
      this.root.appendChild(line);
    }
    line.textContent = `${key}: ${value}`;
  }
}
