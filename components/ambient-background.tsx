'use client';

import { useEffect, useRef, useCallback } from 'react';

export type BackgroundType = 'none' | 'swirl' | 'aurora' | 'pipeline';

interface AmbientBackgroundProps {
  type: BackgroundType;
}

// Math utilities
const { PI, cos, sin, abs, sqrt, pow, round, random, atan2 } = Math;
const TAU = 2 * PI;
const HALF_PI = 0.5 * PI;
const TO_RAD = PI / 180;
const rand = (n: number) => n * random();
const randIn = (_min: number, max: number) => rand(max - _min) + _min;
const randRange = (n: number) => n - rand(2 * n);
const fadeInOut = (t: number, m: number) => {
  const hm = 0.5 * m;
  return abs((t + hm) % m - hm) / hm;
};
const lerp = (n1: number, n2: number, speed: number) => (1 - speed) * n1 + speed * n2;

// SimplexNoise (minimal implementation)
class SimplexNoise {
  private perm: Uint8Array;
  private permMod12: Uint8Array;
  private grad3 = new Float32Array([
    1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0,
    1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, -1,
    0, 1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1
  ]);

  constructor() {
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [p[i], p[j]] = [p[j], p[i]];
    }
    this.perm = new Uint8Array(512);
    this.permMod12 = new Uint8Array(512);
    for (let i = 0; i < 512; i++) {
      this.perm[i] = p[i & 255];
      this.permMod12[i] = this.perm[i] % 12;
    }
  }

  noise3D(x: number, y: number, z: number): number {
    const F3 = 1 / 3, G3 = 1 / 6;
    const s = (x + y + z) * F3;
    const i = Math.floor(x + s), j = Math.floor(y + s), k = Math.floor(z + s);
    const t = (i + j + k) * G3;
    const X0 = x - (i - t), Y0 = y - (j - t), Z0 = z - (k - t);

    let i1, j1, k1, i2, j2, k2;
    if (X0 >= Y0) {
      if (Y0 >= Z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
      else if (X0 >= Z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1; }
      else { i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1; }
    } else {
      if (Y0 < Z0) { i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1; }
      else if (X0 < Z0) { i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1; }
      else { i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
    }

    const x1 = X0 - i1 + G3, y1 = Y0 - j1 + G3, z1 = Z0 - k1 + G3;
    const x2 = X0 - i2 + 2 * G3, y2 = Y0 - j2 + 2 * G3, z2 = Z0 - k2 + 2 * G3;
    const x3 = X0 - 1 + 3 * G3, y3 = Y0 - 1 + 3 * G3, z3 = Z0 - 1 + 3 * G3;

    const ii = i & 255, jj = j & 255, kk = k & 255;

    const calcContrib = (x: number, y: number, z: number, gi: number) => {
      let t = 0.6 - x * x - y * y - z * z;
      if (t < 0) return 0;
      t *= t;
      return t * t * (this.grad3[gi] * x + this.grad3[gi + 1] * y + this.grad3[gi + 2] * z);
    };

    const n0 = calcContrib(X0, Y0, Z0, this.permMod12[ii + this.perm[jj + this.perm[kk]]] * 3);
    const n1 = calcContrib(x1, y1, z1, this.permMod12[ii + i1 + this.perm[jj + j1 + this.perm[kk + k1]]] * 3);
    const n2 = calcContrib(x2, y2, z2, this.permMod12[ii + i2 + this.perm[jj + j2 + this.perm[kk + k2]]] * 3);
    const n3 = calcContrib(x3, y3, z3, this.permMod12[ii + 1 + this.perm[jj + 1 + this.perm[kk + 1]]] * 3);

    return 32 * (n0 + n1 + n2 + n3);
  }
}

export function AmbientBackground({ type }: AmbientBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const canvasARef = useRef<HTMLCanvasElement | null>(null);
  const canvasBRef = useRef<HTMLCanvasElement | null>(null);

  const runAurora = useCallback((container: HTMLDivElement) => {
    const rayCount = 500;
    const rayPropCount = 8;
    const rayPropsLength = rayCount * rayPropCount;
    const baseLength = 200, rangeLength = 200;
    const baseSpeed = 0.05, rangeSpeed = 0.1;
    const baseWidth = 10, rangeWidth = 20;
    const baseHue = 120, rangeHue = 60;
    const baseTTL = 50, rangeTTL = 100;
    const noiseStrength = 100;
    const xOff = 0.0015, yOff = 0.0015, zOff = 0.0015;
    const backgroundColor = 'hsla(220,60%,3%,0.95)';

    const canvasA = document.createElement('canvas');
    const canvasB = document.createElement('canvas');
    canvasARef.current = canvasA;
    canvasBRef.current = canvasB;

    canvasB.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;';
    container.appendChild(canvasB);

    const ctxA = canvasA.getContext('2d')!;
    const ctxB = canvasB.getContext('2d')!;
    const simplex = new SimplexNoise();
    const rayProps = new Float32Array(rayPropsLength);
    let tick = 0;
    let center = [0, 0];

    const resize = () => {
      const { innerWidth: w, innerHeight: h } = window;
      canvasA.width = canvasB.width = w;
      canvasA.height = canvasB.height = h;
      center = [w * 0.5, h * 0.5];
    };

    const initRay = (i: number) => {
      const length = baseLength + rand(rangeLength);
      const x = rand(canvasA.width);
      let y1 = center[1] + noiseStrength;
      let y2 = center[1] + noiseStrength - length;
      const n = simplex.noise3D(x * xOff, y1 * yOff, tick * zOff) * noiseStrength;
      y1 += n; y2 += n;
      rayProps.set([x, y1, y2, 0, baseTTL + rand(rangeTTL), baseWidth + rand(rangeWidth),
        (baseSpeed + rand(rangeSpeed)) * (round(rand(1)) ? 1 : -1), baseHue + rand(rangeHue)], i);
    };

    const drawRay = (x: number, y1: number, y2: number, life: number, ttl: number, width: number, hue: number) => {
      const gradient = ctxA.createLinearGradient(x, y1, x, y2);
      gradient.addColorStop(0, `hsla(${hue},100%,65%,0)`);
      gradient.addColorStop(0.5, `hsla(${hue},100%,65%,${fadeInOut(life, ttl)})`);
      gradient.addColorStop(1, `hsla(${hue},100%,65%,0)`);
      ctxA.save();
      ctxA.strokeStyle = gradient;
      ctxA.lineWidth = width;
      ctxA.beginPath();
      ctxA.moveTo(x, y1);
      ctxA.lineTo(x, y2);
      ctxA.stroke();
      ctxA.restore();
    };

    resize();
    for (let i = 0; i < rayPropsLength; i += rayPropCount) initRay(i);

    const draw = () => {
      tick++;
      ctxA.clearRect(0, 0, canvasA.width, canvasA.height);
      ctxB.fillStyle = backgroundColor;
      ctxB.fillRect(0, 0, canvasB.width, canvasB.height);

      for (let i = 0; i < rayPropsLength; i += rayPropCount) {
        const x = rayProps[i], y1 = rayProps[i+1], y2 = rayProps[i+2];
        const life = rayProps[i+3], ttl = rayProps[i+4], width = rayProps[i+5];
        const speed = rayProps[i+6], hue = rayProps[i+7];
        drawRay(x, y1, y2, life, ttl, width, hue);
        rayProps[i] += speed;
        rayProps[i+3]++;
        if (rayProps[i] < 0 || rayProps[i] > canvasA.width || rayProps[i+3] > ttl) initRay(i);
      }

      ctxB.save();
      ctxB.filter = 'blur(12px)';
      ctxB.globalCompositeOperation = 'lighter';
      ctxB.drawImage(canvasA, 0, 0);
      ctxB.restore();

      animationRef.current = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    draw();
    return () => window.removeEventListener('resize', resize);
  }, []);

  const runSwirl = useCallback((container: HTMLDivElement) => {
    const particleCount = 700;
    const particlePropCount = 9;
    const particlePropsLength = particleCount * particlePropCount;
    const rangeY = 100;
    const baseTTL = 50, rangeTTL = 150;
    const baseSpeed = 0.1, rangeSpeed = 2;
    const baseRadius = 1, rangeRadius = 4;
    const baseHue = 220, rangeHue = 100;
    const noiseSteps = 8;
    const xOff = 0.00125, yOff = 0.00125, zOff = 0.0005;
    const backgroundColor = 'hsla(260,40%,5%,0.95)';

    const canvasA = document.createElement('canvas');
    const canvasB = document.createElement('canvas');
    canvasARef.current = canvasA;
    canvasBRef.current = canvasB;

    canvasB.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;';
    container.appendChild(canvasB);

    const ctxA = canvasA.getContext('2d')!;
    const ctxB = canvasB.getContext('2d')!;
    const simplex = new SimplexNoise();
    const particleProps = new Float32Array(particlePropsLength);
    let tick = 0;
    let center = [0, 0];

    const resize = () => {
      const { innerWidth: w, innerHeight: h } = window;
      canvasA.width = canvasB.width = w;
      canvasA.height = canvasB.height = h;
      center = [w * 0.5, h * 0.5];
    };

    const initParticle = (i: number) => {
      particleProps.set([
        rand(canvasA.width), center[1] + randRange(rangeY), 0, 0, 0,
        baseTTL + rand(rangeTTL), baseSpeed + rand(rangeSpeed),
        baseRadius + rand(rangeRadius), baseHue + rand(rangeHue)
      ], i);
    };

    resize();
    for (let i = 0; i < particlePropsLength; i += particlePropCount) initParticle(i);

    const draw = () => {
      tick++;
      ctxA.clearRect(0, 0, canvasA.width, canvasA.height);
      ctxB.fillStyle = backgroundColor;
      ctxB.fillRect(0, 0, canvasA.width, canvasA.height);

      for (let i = 0; i < particlePropsLength; i += particlePropCount) {
        const x = particleProps[i], y = particleProps[i+1];
        const n = simplex.noise3D(x * xOff, y * yOff, tick * zOff) * noiseSteps * TAU;
        const vx = lerp(particleProps[i+2], cos(n), 0.5);
        const vy = lerp(particleProps[i+3], sin(n), 0.5);
        const life = particleProps[i+4], ttl = particleProps[i+5];
        const speed = particleProps[i+6], radius = particleProps[i+7], hue = particleProps[i+8];
        const x2 = x + vx * speed, y2 = y + vy * speed;

        ctxA.save();
        ctxA.lineCap = 'round';
        ctxA.lineWidth = radius;
        ctxA.strokeStyle = `hsla(${hue},100%,60%,${fadeInOut(life, ttl)})`;
        ctxA.beginPath();
        ctxA.moveTo(x, y);
        ctxA.lineTo(x2, y2);
        ctxA.stroke();
        ctxA.restore();

        particleProps[i] = x2;
        particleProps[i+1] = y2;
        particleProps[i+2] = vx;
        particleProps[i+3] = vy;
        particleProps[i+4]++;

        if (x2 < 0 || x2 > canvasA.width || y2 < 0 || y2 > canvasA.height || particleProps[i+4] > ttl) {
          initParticle(i);
        }
      }

      ctxB.save();
      ctxB.filter = 'blur(8px) brightness(200%)';
      ctxB.globalCompositeOperation = 'lighter';
      ctxB.drawImage(canvasA, 0, 0);
      ctxB.restore();

      ctxB.save();
      ctxB.globalCompositeOperation = 'lighter';
      ctxB.drawImage(canvasA, 0, 0);
      ctxB.restore();

      animationRef.current = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    draw();
    return () => window.removeEventListener('resize', resize);
  }, []);

  const runPipeline = useCallback((container: HTMLDivElement) => {
    const pipeCount = 30;
    const pipePropCount = 8;
    const pipePropsLength = pipeCount * pipePropCount;
    const turnCount = 8;
    const turnAmount = (360 / turnCount) * TO_RAD;
    const turnChanceRange = 58;
    const baseSpeed = 0.5, rangeSpeed = 1;
    const baseTTL = 100, rangeTTL = 300;
    const baseWidth = 2, rangeWidth = 4;
    const baseHue = 180, rangeHue = 60;
    const backgroundColor = 'hsla(150,80%,1%,0.95)';

    const canvasA = document.createElement('canvas');
    const canvasB = document.createElement('canvas');
    canvasARef.current = canvasA;
    canvasBRef.current = canvasB;

    canvasB.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;';
    container.appendChild(canvasB);

    const ctxA = canvasA.getContext('2d')!;
    const ctxB = canvasB.getContext('2d')!;
    const pipeProps = new Float32Array(pipePropsLength);
    let tick = 0;
    let center = [0, 0];

    const resize = () => {
      const { innerWidth: w, innerHeight: h } = window;
      canvasA.width = canvasB.width = w;
      canvasA.height = canvasB.height = h;
      center = [w * 0.5, h * 0.5];
    };

    const initPipe = (i: number) => {
      pipeProps.set([
        rand(canvasA.width), center[1],
        round(rand(1)) ? HALF_PI : TAU - HALF_PI,
        baseSpeed + rand(rangeSpeed), 0,
        baseTTL + rand(rangeTTL), baseWidth + rand(rangeWidth), baseHue + rand(rangeHue)
      ], i);
    };

    resize();
    for (let i = 0; i < pipePropsLength; i += pipePropCount) initPipe(i);

    const draw = () => {
      tick++;

      for (let i = 0; i < pipePropsLength; i += pipePropCount) {
        let x = pipeProps[i], y = pipeProps[i+1];
        let direction = pipeProps[i+2];
        const speed = pipeProps[i+3], life = pipeProps[i+4];
        const ttl = pipeProps[i+5], width = pipeProps[i+6], hue = pipeProps[i+7];

        ctxA.save();
        ctxA.strokeStyle = `hsla(${hue},75%,50%,${fadeInOut(life, ttl) * 0.125})`;
        ctxA.beginPath();
        ctxA.arc(x, y, width, 0, TAU);
        ctxA.stroke();
        ctxA.restore();

        x += cos(direction) * speed;
        y += sin(direction) * speed;
        const turnChance = !(tick % round(rand(turnChanceRange))) && (!(round(x) % 6) || !(round(y) % 6));
        const turnBias = round(rand(1)) ? -1 : 1;
        direction += turnChance ? turnAmount * turnBias : 0;

        pipeProps[i] = x;
        pipeProps[i+1] = y;
        pipeProps[i+2] = direction;
        pipeProps[i+4]++;

        if (life > ttl) initPipe(i);
      }

      ctxB.fillStyle = backgroundColor;
      ctxB.fillRect(0, 0, canvasB.width, canvasB.height);
      ctxB.save();
      ctxB.filter = 'blur(12px)';
      ctxB.drawImage(canvasA, 0, 0);
      ctxB.restore();
      ctxB.drawImage(canvasA, 0, 0);

      animationRef.current = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    draw();
    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || type === 'none') return;

    let cleanup: (() => void) | undefined;

    switch (type) {
      case 'aurora':
        cleanup = runAurora(container);
        break;
      case 'swirl':
        cleanup = runSwirl(container);
        break;
      case 'pipeline':
        cleanup = runPipeline(container);
        break;
    }

    return () => {
      cancelAnimationFrame(animationRef.current);
      cleanup?.();
      if (canvasBRef.current && container.contains(canvasBRef.current)) {
        container.removeChild(canvasBRef.current);
      }
      canvasARef.current = null;
      canvasBRef.current = null;
    };
  }, [type, runAurora, runSwirl, runPipeline]);

  if (type === 'none') return null;

  return <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none opacity-60 sm:opacity-100" />;
}
