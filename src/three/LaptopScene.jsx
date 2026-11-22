import { useLayoutEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Float, RoundedBox, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { Studio } from './HeroScene';

const SCREEN_W = 2.96;
const SCREEN_H = 1.86;

/** Crop a texture like CSS `object-fit: cover` for the laptop screen. */
function cover(tex) {
  const img = tex.image;
  if (!img) return;
  const ia = img.width / img.height;
  const sa = SCREEN_W / SCREEN_H;
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  if (ia > sa) {
    tex.repeat.set(sa / ia, 1);
    tex.offset.set((1 - sa / ia) / 2, 0);
  } else {
    tex.repeat.set(1, ia / sa);
    tex.offset.set(0, 1 - ia / sa); // keep the top of the page visible
  }
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
}

function Laptop({ images, index, open }) {
  const textures = useTexture(images);
  const group = useRef();
  const lid = useRef();
  const screen = useRef();
  const fade = useRef(1);
  const shown = useRef(index);

  useLayoutEffect(() => {
    textures.forEach(cover);
  }, [textures]);

  useFrame((state, dt) => {
    // open / close the lid
    const target = open ? -0.22 : Math.PI / 2;
    lid.current.rotation.x = THREE.MathUtils.damp(lid.current.rotation.x, target, 2.6, dt);
    // follow the pointer
    const { x, y } = state.pointer;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, -0.35 + x * 0.45, 3, dt);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, 0.18 - y * 0.12, 3, dt);
    // cross-fade the screen between projects (dip to dark, swap, fade back up)
    const m = screen.current.material;
    if (shown.current !== index) {
      fade.current = Math.max(0, fade.current - dt * 4);
      if (fade.current === 0) {
        shown.current = index;
        m.map = textures[index];
        m.needsUpdate = true;
      }
    } else fade.current = Math.min(1, fade.current + dt * 3);
    m.color.setScalar(0.15 + fade.current * 0.85);
  });

  return (
    <group ref={group} position={[0, -0.55, 0]}>
      {/* base */}
      <RoundedBox args={[3.3, 0.12, 2.25]} radius={0.06} smoothness={4} position={[0, 0, 0]}>
        <meshPhysicalMaterial color="#cfc9d8" metalness={0.75} roughness={0.32} clearcoat={0.6} envMapIntensity={1.2} />
      </RoundedBox>
      {/* keyboard well */}
      <mesh position={[0, 0.062, -0.22]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.85, 1.05]} />
        <meshStandardMaterial color="#1b1824" roughness={0.8} />
      </mesh>
      {/* keys */}
      {Array.from({ length: 5 }).map((_, r) =>
        Array.from({ length: 14 }).map((__, c) => (
          <mesh key={`${r}-${c}`} position={[-1.3 + c * 0.2, 0.068, -0.66 + r * 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.16, 0.16]} />
            <meshStandardMaterial color="#2a2634" roughness={0.6} />
          </mesh>
        ))
      )}
      {/* trackpad */}
      <mesh position={[0, 0.063, 0.68]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.1, 0.62]} />
        <meshPhysicalMaterial color="#bdb6c8" metalness={0.6} roughness={0.25} />
      </mesh>

      {/* lid, hinged at the back edge */}
      <group ref={lid} position={[0, 0.06, -1.1]} rotation={[Math.PI / 2, 0, 0]}>
        <RoundedBox args={[3.3, 2.12, 0.07]} radius={0.05} smoothness={4} position={[0, 1.06, -0.035]}>
          <meshPhysicalMaterial color="#cfc9d8" metalness={0.75} roughness={0.32} clearcoat={0.6} envMapIntensity={1.2} />
        </RoundedBox>
        {/* bezel */}
        <mesh position={[0, 1.06, 0.002]}>
          <planeGeometry args={[3.18, 2.02]} />
          <meshStandardMaterial color="#0a0910" roughness={0.4} />
        </mesh>
        {/* screen */}
        <mesh ref={screen} position={[0, 1.08, 0.004]}>
          <planeGeometry args={[SCREEN_W, SCREEN_H]} />
          <meshBasicMaterial map={textures[0]} toneMapped={false} />
        </mesh>
        {/* screen glow */}
        <pointLight position={[0, 1.1, 0.8]} intensity={4} distance={4} color="#f0abfc" />
      </group>
    </group>
  );
}

function Fit() {
  const { camera, size } = useThree();
  const aspect = size.width / size.height;
  camera.position.z = aspect < 1 ? 7.4 / Math.max(aspect, 0.6) : 6.2;
  camera.updateProjectionMatrix();
  return null;
}

export default function LaptopScene({ images, index = 0, active = true }) {
  return (
    <Canvas dpr={[1, 1.6]} camera={{ position: [0, 1.1, 6.2], fov: 38 }} gl={{ alpha: true, antialias: true }} frameloop={active ? 'always' : 'never'}>
      <Fit />
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 4]} intensity={1.4} />
      <Float speed={1.4} rotationIntensity={0.15} floatIntensity={0.5}>
        <Laptop images={images} index={index} open={active} />
      </Float>
      <ContactShadows position={[0, -1.25, 0]} opacity={0.55} scale={9} blur={2.6} far={3} color="#2a1640" />
      <Studio />
    </Canvas>
  );
}
