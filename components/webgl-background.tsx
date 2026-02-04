'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export type WebGLBackgroundType = 'blob' | 'cube' | 'sphere';

interface WebGLBackgroundProps {
  type: WebGLBackgroundType;
}

// Simplex noise for morphing
class SimplexNoise {
  private perm: Uint8Array;
  private grad3 = [
    [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
    [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
    [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
  ];

  constructor() {
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [p[i], p[j]] = [p[j], p[i]];
    }
    this.perm = new Uint8Array(512);
    for (let i = 0; i < 512; i++) this.perm[i] = p[i & 255];
  }

  noise3D(x: number, y: number, z: number): number {
    const F3 = 1/3, G3 = 1/6;
    const s = (x + y + z) * F3;
    const i = Math.floor(x + s), j = Math.floor(y + s), k = Math.floor(z + s);
    const t = (i + j + k) * G3;
    const X0 = x - (i - t), Y0 = y - (j - t), Z0 = z - (k - t);

    let i1, j1, k1, i2, j2, k2;
    if (X0 >= Y0) {
      if (Y0 >= Z0) { i1=1; j1=0; k1=0; i2=1; j2=1; k2=0; }
      else if (X0 >= Z0) { i1=1; j1=0; k1=0; i2=1; j2=0; k2=1; }
      else { i1=0; j1=0; k1=1; i2=1; j2=0; k2=1; }
    } else {
      if (Y0 < Z0) { i1=0; j1=0; k1=1; i2=0; j2=1; k2=1; }
      else if (X0 < Z0) { i1=0; j1=1; k1=0; i2=0; j2=1; k2=1; }
      else { i1=0; j1=1; k1=0; i2=1; j2=1; k2=0; }
    }

    const dot = (g: number[], x: number, y: number, z: number) => g[0]*x + g[1]*y + g[2]*z;
    const contrib = (x: number, y: number, z: number, gi: number) => {
      let t = 0.6 - x*x - y*y - z*z;
      if (t < 0) return 0;
      t *= t;
      return t * t * dot(this.grad3[gi % 12], x, y, z);
    };

    const ii = i & 255, jj = j & 255, kk = k & 255;
    const n0 = contrib(X0, Y0, Z0, this.perm[ii + this.perm[jj + this.perm[kk]]]);
    const n1 = contrib(X0-i1+G3, Y0-j1+G3, Z0-k1+G3, this.perm[ii+i1 + this.perm[jj+j1 + this.perm[kk+k1]]]);
    const n2 = contrib(X0-i2+2*G3, Y0-j2+2*G3, Z0-k2+2*G3, this.perm[ii+i2 + this.perm[jj+j2 + this.perm[kk+k2]]]);
    const n3 = contrib(X0-1+3*G3, Y0-1+3*G3, Z0-1+3*G3, this.perm[ii+1 + this.perm[jj+1 + this.perm[kk+1]]]);

    return 32 * (n0 + n1 + n2 + n3);
  }
}

export function WebGLBackground({ type }: WebGLBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x0A0A0B, 0.95);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

    // Noise
    const noise = new SimplexNoise();
    let time = 0;

    // Store original vertices for morphing
    let geometry: THREE.IcosahedronGeometry | THREE.BoxGeometry;
    let mesh: THREE.Mesh;
    const originalPositions: Float32Array[] = [];

    if (type === 'blob') {
      // Morphing blob (like demo3)
      camera.position.set(0, 0, 200);

      geometry = new THREE.IcosahedronGeometry(80, 4);
      const positions = geometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        originalPositions.push(new Float32Array([
          positions.getX(i),
          positions.getY(i),
          positions.getZ(i)
        ]));
      }

      const material = new THREE.MeshPhongMaterial({
        color: 0x22C55E,
        emissive: 0x22C55E,
        emissiveIntensity: 0.3,
        shininess: 50,
        flatShading: true,
      });
      mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      // Lights
      const light1 = new THREE.DirectionalLight(0xffffff, 0.8);
      light1.position.set(200, 300, 400);
      scene.add(light1);

      const light2 = new THREE.DirectionalLight(0x22C55E, 0.5);
      light2.position.set(-200, -300, -400);
      scene.add(light2);

      scene.add(new THREE.AmbientLight(0x111113, 0.5));

    } else if (type === 'cube') {
      // Wireframe cube (like demo5)
      camera.position.set(0, 0, 100);

      geometry = new THREE.BoxGeometry(40, 40, 40, 6, 6, 6);
      const positions = geometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        originalPositions.push(new Float32Array([
          positions.getX(i),
          positions.getY(i),
          positions.getZ(i)
        ]));
      }

      const material = new THREE.MeshBasicMaterial({
        color: 0xFF5C00,
        wireframe: true,
        transparent: true,
        opacity: 0.6,
      });
      mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

    } else {
      // Sphere particles
      camera.position.set(0, 0, 150);

      const pointsGeometry = new THREE.BufferGeometry();
      const count = 2000;
      const positions = new Float32Array(count * 3);

      for (let i = 0; i < count; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 50 + Math.random() * 10;

        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);

        originalPositions.push(new Float32Array([
          positions[i * 3],
          positions[i * 3 + 1],
          positions[i * 3 + 2]
        ]));
      }

      pointsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const pointsMaterial = new THREE.PointsMaterial({
        color: 0x8B5CF6,
        size: 1.5,
        transparent: true,
        opacity: 0.8,
      });

      mesh = new THREE.Points(pointsGeometry, pointsMaterial) as unknown as THREE.Mesh;
      scene.add(mesh);
    }

    // Animation
    const animate = () => {
      time += 0.01;

      if (type === 'blob' && geometry) {
        const positions = geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
          const orig = originalPositions[i];
          const perlin = noise.noise3D(
            orig[0] * 0.01 + time * 0.5,
            orig[1] * 0.01 + time * 0.3,
            orig[2] * 0.01
          );
          const scale = 1 + perlin * 0.15;
          positions.setXYZ(i, orig[0] * scale, orig[1] * scale, orig[2] * scale);
        }
        positions.needsUpdate = true;
        mesh.rotation.y += 0.002;
        mesh.rotation.x += 0.001;
      } else if (type === 'cube' && geometry) {
        const positions = geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
          const orig = originalPositions[i];
          const perlin = noise.noise3D(
            orig[0] * 0.02 + time,
            orig[1] * 0.02,
            orig[2] * 0.02
          );
          const scale = 1 + perlin * 0.1;
          positions.setXYZ(i, orig[0] * scale, orig[1] * scale, orig[2] * scale);
        }
        positions.needsUpdate = true;
        mesh.rotation.y += 0.003;
        mesh.rotation.x += 0.002;
      } else if (type === 'sphere') {
        mesh.rotation.y += 0.001;
        mesh.rotation.x += 0.0005;
      }

      renderer.render(scene, camera);
      animationRef.current = requestAnimationFrame(animate);
    };

    // Resize handler
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);
    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [type]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: '#0A0A0B' }}
    />
  );
}
