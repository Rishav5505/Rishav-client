import { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Html, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { Studio } from './HeroScene';

/** Evenly distributes n points on a sphere (Fibonacci lattice). */
function fibonacci(n, r) {
  const pts = [];
  const g = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const t = g * i;
    pts.push(new THREE.Vector3(Math.cos(t) * rad * r, y * r, Math.sin(t) * rad * r));
  }
  return pts;
}

function Labels({ items, drag }) {
  const group = useRef();
  const refs = useRef([]);
  const pts = useMemo(() => fibonacci(items.length, 2.55), [items.length]);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    // inertia from dragging + slow auto-spin
    drag.current.vy *= 0.94;
    drag.current.vx *= 0.94;
    g.rotation.y += dt * 0.18 + drag.current.vy;
    g.rotation.x = THREE.MathUtils.clamp(g.rotation.x + drag.current.vx, -0.8, 0.8);
    g.updateMatrixWorld();
    // fade + shrink labels on the far side
    pts.forEach((p, i) => {
      const el = refs.current[i];
      if (!el) return;
      tmp.copy(p).applyMatrix4(g.matrixWorld);
      const k = (tmp.z + 2.55) / 5.1; // 0 (back) → 1 (front)
      el.style.opacity = String(0.15 + k * 0.85);
      el.style.transform = `scale(${0.7 + k * 0.4})`;
      el.style.filter = k < 0.35 ? 'blur(1.5px)' : 'none';
    });
  });

  return (
    <group ref={group}>
      {pts.map((p, i) => (
        <Html key={items[i]} position={p} center zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
          <span
            ref={(el) => (refs.current[i] = el)}
            className="block whitespace-nowrap rounded-full border border-fg/15 bg-[#0e0c15]/70 px-3 py-1.5 text-[12px] font-medium text-white shadow-[0_8px_24px_-8px_rgba(244,114,182,0.6)] backdrop-blur-md transition-[filter]"
          >
            {items[i]}
          </span>
        </Html>
      ))}
    </group>
  );
}

function Core() {
  const ring1 = useRef();
  const ring2 = useRef();
  const cage = useRef();
  useFrame((_, dt) => {
    ring1.current.rotation.z += dt * 0.4;
    ring2.current.rotation.z -= dt * 0.3;
    cage.current.rotation.y += dt * 0.15;
    cage.current.rotation.x += dt * 0.08;
  });
  return (
    <group>
      <Float speed={2} floatIntensity={0.6} rotationIntensity={0.4}>
        <mesh scale={1.15}>
          <sphereGeometry args={[1, 96, 96]} />
          <MeshDistortMaterial
            color="#e879f9"
            distort={0.38}
            speed={1.8}
            roughness={0.1}
            metalness={0.3}
            clearcoat={1}
            iridescence={1}
            iridescenceThicknessRange={[100, 500]}
            envMapIntensity={1.5}
          />
        </mesh>
      </Float>
      <mesh ref={cage} scale={1.75}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color="#c4b5fd" wireframe transparent opacity={0.18} />
      </mesh>
      <mesh ref={ring1} rotation={[1.2, 0.3, 0]}>
        <torusGeometry args={[2.05, 0.012, 16, 160]} />
        <meshBasicMaterial color="#f472b6" transparent opacity={0.7} />
      </mesh>
      <mesh ref={ring2} rotation={[1.9, -0.5, 0]}>
        <torusGeometry args={[2.3, 0.01, 16, 160]} />
        <meshBasicMaterial color="#fdba74" transparent opacity={0.55} />
      </mesh>
    </group>
  );
}

/** Pull the camera back on narrow screens so the whole orbit fits. */
function FitCamera() {
  const { camera, size } = useThree();
  const aspect = size.width / size.height;
  camera.position.z = aspect < 1.2 ? 7.2 * (1.2 / Math.max(aspect, 0.55)) * 1.08 : 7.2;
  camera.updateProjectionMatrix();
  return null;
}

export default function SkillsScene({ items, active = true }) {
  const drag = useRef({ vx: 0, vy: 0, down: false, x: 0, y: 0 });

  const onDown = (e) => {
    drag.current.down = true;
    drag.current.x = e.clientX;
    drag.current.y = e.clientY;
  };
  const onMove = (e) => {
    const d = drag.current;
    if (!d.down) return;
    d.vy = (e.clientX - d.x) * 0.004;
    d.vx = (e.clientY - d.y) * 0.003;
    d.x = e.clientX;
    d.y = e.clientY;
  };
  const onUp = () => (drag.current.down = false);

  return (
    <div
      className="h-full w-full cursor-grab active:cursor-grabbing"
      style={{ touchAction: 'pan-y' }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerLeave={onUp}
      data-cursor="Drag"
    >
      <Canvas dpr={[1, 1.6]} camera={{ position: [0, 0, 7.2], fov: 45 }} gl={{ alpha: true, antialias: true }} frameloop={active ? 'always' : 'never'}>
        <ambientLight intensity={0.5} />
        <pointLight position={[4, 3, 4]} intensity={30} color="#f0abfc" />
        <pointLight position={[-4, -2, 3]} intensity={20} color="#a78bfa" />
        <FitCamera />
        <Core />
        <Labels items={items} drag={drag} />
        <Studio />
      </Canvas>
    </div>
  );
}
