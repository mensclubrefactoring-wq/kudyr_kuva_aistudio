import { Light } from '../types';

export class LightingSystem {
  private lights: Light[] = [];
  private lightCanvas: HTMLCanvasElement;
  private lightCtx: CanvasRenderingContext2D;

  constructor(width: number, height: number) {
    this.lightCanvas = document.createElement("canvas");
    this.lightCanvas.width = width;
    this.lightCanvas.height = height;
    this.lightCtx = this.lightCanvas.getContext("2d")!;
  }

  addLight(x: number, y: number, radius: number, intensity = 1, flicker = false) {
    this.lights.push({
      x,
      y,
      radius,
      baseRadius: radius,
      intensity,
      flicker
    });
  }

  clearLights() {
    this.lights = [];
  }

  update() {
    // flicker effect
    this.lights.forEach(light => {
      if (light.flicker) {
        light.radius = light.baseRadius + (Math.random() * 15 - 7.5);
      }
    });
  }

  render(ctx: CanvasRenderingContext2D, camX: number, camY: number) {
    const lCtx = this.lightCtx;
    const width = this.lightCanvas.width;
    const height = this.lightCanvas.height;

    // clear
    lCtx.clearRect(0, 0, width, height);

    // 1. darken scene
    lCtx.fillStyle = "rgba(0,0,0,0.92)";
    lCtx.fillRect(0, 0, width, height);

    // 2. "cut out" light
    lCtx.globalCompositeOperation = "destination-out";

    this.lights.forEach(light => {
      const gradient = lCtx.createRadialGradient(
        light.x - camX,
        light.y - camY,
        0,
        light.x - camX,
        light.y - camY,
        light.radius
      );

      gradient.addColorStop(0, `rgba(0,0,0,${1 * light.intensity})`);
      gradient.addColorStop(1, "rgba(0,0,0,0)");

      lCtx.fillStyle = gradient;
      lCtx.beginPath();
      lCtx.arc(light.x - camX, light.y - camY, light.radius, 0, Math.PI * 2);
      lCtx.fill();
    });

    // reset
    lCtx.globalCompositeOperation = "source-over";

    // 3. overlay on main canvas
    ctx.drawImage(this.lightCanvas, 0, 0);
  }

  isInLight(x: number, y: number) {
    for (let light of this.lights) {
      const dx = light.x - x;
      const dy = light.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < light.radius * 0.8) { // slightly smaller radius for detection
        return true;
      }
    }
    return false;
  }
}
