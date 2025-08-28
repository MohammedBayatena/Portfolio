import {Injectable, NgZone} from '@angular/core';

export interface Pipe {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  color: string;
  direction: string;
  speed: number;
  cornerType: string;
  cornerDirection: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class PipesService {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private pipes: Pipe[] = [];
  private maxPipes: number = 20;
  private lastPipeTime: number = 0;
  private pipeInterval: number = 1000; // Add new pipe every second
  private animationFrameId?: number | null;

  constructor(private ngZone: NgZone) {
  }

  initCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;

    // Set canvas size to window size
    this.resizeCanvas();

    // Handle window resize
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  private resizeCanvas() {
    if (!this.canvas) return;

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  startAnimation() {
    this.pipes = [];
    this.lastPipeTime = 0;

    this.ngZone.runOutsideAngular(() => {
      this.animate();
    });
  }

  stopAnimation() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private animate(timestamp: number = 0) {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    // Add new pipes periodically
    if (this.pipes.length < this.maxPipes && timestamp - this.lastPipeTime > this.pipeInterval) {
      this.pipes.push(this.createRandomPipe());
      this.lastPipeTime = timestamp;
    }

    // Update and draw pipes
    this.updatePipes();
    this.drawPipes();

    // Continue animation loop
    this.animationFrameId = requestAnimationFrame((ts) => this.animate(ts));
  }

  private createRandomPipe(): Pipe {
    // Random position at edge of screen
    const edge = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
    let x, y, direction;

    switch (edge) {
      case 0: // top
        x = Math.random() * this.ctx.canvas.width;
        y = -30;
        direction = 'down';
        break;
      case 1: // right
        x = this.ctx.canvas.width + 30;
        y = Math.random() * this.ctx.canvas.height;
        direction = 'left';
        break;
      case 2: // bottom
        x = Math.random() * this.ctx.canvas.width;
        y = this.ctx.canvas.height + 30;
        direction = 'up';
        break;
      case 3: // left
        x = -30;
        y = Math.random() * this.ctx.canvas.height;
        direction = 'right';
        break;
      default:
        x = Math.random() * this.ctx.canvas.width;
        y = Math.random() * this.ctx.canvas.height;
        direction = 'down';
    }

    // Random size
    const width = 50 + Math.random() * 200;
    const height = 10 + Math.random() * 30;

    // Random rotation (0, 90, 180, or 270 degrees for straight pipes)
    const rotations = [0, 90, 180, 270];
    const rotation = rotations[Math.floor(Math.random() * rotations.length)];

    // Random color (pastel colors for a softer look)
    const hue = Math.floor(Math.random() * 360);
    const color = `hsl(${hue}, 70%, 60%)`;

    // Random speed
    const speed = 1 + Math.random() * 3;

    // Random corner type (for future enhancement)
    const cornerType = Math.random() < 0.3 ? 'corner' : 'straight';

    return {
      x,
      y,
      width,
      height,
      rotation,
      color,
      direction,
      speed,
      cornerType,
      cornerDirection: cornerType === 'corner' ? this.getRandomCornerDirection(direction) : null
    };
  }

  private getRandomCornerDirection(currentDirection: string): string {
    // Return a direction perpendicular to the current one
    switch (currentDirection) {
      case 'up':
      case 'down':
        return Math.random() < 0.5 ? 'left' : 'right';
      case 'left':
      case 'right':
        return Math.random() < 0.5 ? 'up' : 'down';
      default:
        return 'down';
    }
  }

  private updatePipes() {
    // Update each pipe's position based on its direction
    this.pipes.forEach(pipe => {
      switch (pipe.direction) {
        case 'up':
          pipe.y -= pipe.speed;
          break;
        case 'down':
          pipe.y += pipe.speed;
          break;
        case 'left':
          pipe.x -= pipe.speed;
          break;
        case 'right':
          pipe.x += pipe.speed;
          break;
      }

      // Occasionally change direction (5% chance each update)
      if (Math.random() < 0.05) {
        const directions = ['up', 'down', 'left', 'right'];
        pipe.direction = directions[Math.floor(Math.random() * directions.length)];
      }
    });

    // Remove pipes that are off-screen
    this.pipes = this.pipes.filter(pipe => {
      return pipe.x > -pipe.width &&
        pipe.x < this.ctx.canvas.width + pipe.width &&
        pipe.y > -pipe.height &&
        pipe.y < this.ctx.canvas.height + pipe.height;
    });
  }

  private drawPipes() {
    this.pipes.forEach(pipe => {
      this.ctx.save();

      // Move to pipe position
      this.ctx.translate(pipe.x, pipe.y);

      // Rotate
      this.ctx.rotate(pipe.rotation * Math.PI / 180);

      // Draw pipe
      this.ctx.fillStyle = pipe.color;
      this.ctx.strokeStyle = this.darkenColor(pipe.color);
      this.ctx.lineWidth = 2;

      // Draw pipe body
      this.ctx.fillRect(-pipe.width / 2, -pipe.height / 2, pipe.width, pipe.height);
      this.ctx.strokeRect(-pipe.width / 2, -pipe.height / 2, pipe.width, pipe.height);

      // Draw pipe ends
      this.ctx.fillStyle = this.darkenColor(pipe.color);
      this.ctx.fillRect(-pipe.width / 2, -pipe.height / 2, pipe.width, 4);
      this.ctx.fillRect(-pipe.width / 2, pipe.height / 2 - 4, pipe.width, 4);

      // Draw highlights for 3D effect
      this.ctx.fillStyle = this.lightenColor(pipe.color);
      this.ctx.fillRect(-pipe.width / 2 + 2, -pipe.height / 2 + 2, pipe.width - 4, 2);

      this.ctx.restore();
    });
  }

  private darkenColor(color: string): string {
    // Simple color darkening - in a real implementation you'd use a proper color manipulation library
    return color.replace('60%', '40%');
  }

  private lightenColor(color: string): string {
    // Simple color lightening
    return color.replace('60%', '80%');
  }
}
