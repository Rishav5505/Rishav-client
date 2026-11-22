import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, Lightformer, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

/** Glossy, iridescent material shared by the floating shapes. */
function Glossy({ color }) {
  return (
    <meshPhysicalMaterial
      color={color}
      roughness={0.12}
      metalness={0.25}
      clearcoat={1}
      clearcoatRoughness={0.08}
      iridescence={1}
      iridescenceIOR={1.4}
      iridescenceThicknessRange={[120, 620]}
      envMapIntensity={1.4}
    />
  );
}

function Shapes({ compact }) {
  const group = useRef();
  // Gentle parallax toward the pointer.
  useFrame((state, dt) => {
    if (!group.current) return;
    const { x, y } = state.pointer;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, x * 0.25, 3, dt);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, -y * 0.15, 3, dt);
    group.current.position.x = THREE.MathUtils.damp(group.current.position.x, x * 0.3, 3, dt);
  });


  return (
    <group ref={group}>
      <Float speed={1.6} rotationIntensity={1.2} floatIntensity={1.4}>
        <mesh position={compact ? [0.8, 1.15, -0.5] : [4.9, 1.2, -2.5]} scale={compact ? 0.28 : 0.5}>
          <torusKnotGeometry args={[1, 0.34, 220, 32]} />
          <Glossy color="#c4b5fd" />
        </mesh>
      </Float>

      <Float speed={2} rotationIntensity={2} floatIntensity={1.2}>
        <mesh position={compact ? [0.95, 0.45, -0.5] : [0.35, -2.55, -1]} scale={compact ? 0.17 : 0.48}>
          <icosahedronGeometry args={[1, 0]} />
          <Glossy color="#f9a8d4" />
        </mesh>
      </Float>

      <Float speed={1.3} rotationIntensity={0.6} floatIntensity={2}>
        <mesh position={compact ? [1.0, 2.25, -1] : [1.1, 2.55, -2]} scale={compact ? 0.12 : 0.38}>
          <sphereGeometry args={[1, 64, 64]} />
          <Glossy color="#fdba74" />
        </mesh>
      </Float>

      {!compact && (
        <>
          <Float speed={1.8} rotationIntensity={1.5} floatIntensity={1.6}>
            <mesh position={[-6.2, -3.1, -1.5]} rotation={[0.6, 0.4, 0]} scale={0.45}>
              <torusGeometry args={[1, 0.38, 48, 96]} />
              <Glossy color="#a78bfa" />
            </mesh>
          </Float>
          <Float speed={2.4} rotationIntensity={2} floatIntensity={1}>
            <RoundedBox args={[1, 1, 1]} radius={0.18} smoothness={6} position={[5.2, -2.6, -1.2]} scale={0.5} rotation={[0.5, 0.6, 0]}>
              <Glossy color="#f472b6" />
            </RoundedBox>
          </Float>
          <Float speed={3} floatIntensity={2}>
            <mesh position={[-1.4, 3.4, -3]} scale={0.16}>
              <sphereGeometry args={[1, 32, 32]} />
              <Glossy color="#f0abfc" />
            </mesh>
          </Float>
        </>
      )}
    </group>
  );
}

/** Studio lighting built from light-formers — no external HDR download needed. */
export function Studio() {
  return (
    <Environment resolution={256}>
      <group rotation={[-Math.PI / 3, 0, 1]}>
        <Lightformer form="circle" intensity={4} color="#f0abfc" position={[0, 5, -9]} scale={2} />
        <Lightformer form="circle" intensity={2} color="#a78bfa" position={[-5, 1, -1]} scale={2} />
        <Lightformer form="circle" intensity={2} color="#fdba74" position={[-5, -1, -1]} scale={2} />
        <Lightformer form="ring" intensity={3} color="#ffffff" position={[10, 1, 0]} scale={8} />
        <Lightformer form="rect" intensity={1.5} color="#f472b6" position={[0, -6, 2]} scale={[10, 2, 1]} />
      </group>
    </Environment>
  );
}

export default function HeroScene({ active = true }) {
  const compact = typeof window !== 'undefined' && window.innerWidth < 768;
  return (
    <Canvas
      dpr={compact ? [1, 1.25] : [1, 1.6]}
      camera={{ position: [0, 0, 8], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      frameloop={active ? 'always' : 'never'}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <Shapes compact={compact} />
      <Studio />
    </Canvas>
  );
}
