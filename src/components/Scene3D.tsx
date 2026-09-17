import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveDpr, Float, MeshDistortMaterial, PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { useIsMobile, usePrefersReducedMotion } from "@/hooks";

/* ============================================================
   Shared helpers
   ============================================================ */

const ACCENT = "#22d3ee";
const ACCENT_2 = "#8b5cf6";
const ACCENT_3 = "#f472b6";

/**
 * Reads page scroll progress into a ref (no React re-render) so the 3D
 * scenes can react to scrolling at 60fps without triggering reconciliation.
 */
function useScrollRef() {
  const progress = useRef(0);

  useEffect(() => {
    let frame: number | null = null;

    const update = () => {
      frame = null;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.current = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    };

    const onScroll = () => {
      if (frame === null) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  return progress;
}

/** Deterministic pseudo-random so scenes look identical between renders. */
function makeRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

/** Positions scattered through a spherical shell. */
function shellPositions(count: number, min: number, max: number, seed = 7) {
  const rand = makeRandom(seed);
  const array = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const radius = min + rand() * (max - min);
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(2 * rand() - 1);
    array[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    array[i * 3 + 1] = radius * Math.cos(phi) * 0.75;
    array[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
  }
  return array;
}

/** Positions scattered through a box (used by the global background). */
function boxPositions(count: number, spread: number, seed = 21) {
  const rand = makeRandom(seed);
  const array = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    array[i * 3] = (rand() - 0.5) * spread;
    array[i * 3 + 1] = (rand() - 0.5) * spread * 0.7;
    array[i * 3 + 2] = (rand() - 0.5) * spread;
  }
  return array;
}

/* ============================================================
   1. Interactive hero object
   ============================================================ */

interface OrbitRingProps {
  radius: number;
  tube: number;
  color: string;
  tilt: [number, number, number];
  speed: number;
  satelliteColor: string;
  satelliteSize: number;
}

/** A thin glowing orbit ring with one small satellite travelling along it. */
function OrbitRing({
  radius,
  tube,
  color,
  tilt,
  speed,
  satelliteColor,
  satelliteSize,
}: OrbitRingProps) {
  const satellite = useRef<THREE.Mesh>(null);
  const light = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed;
    const x = Math.cos(t) * radius;
    const z = Math.sin(t) * radius;
    if (satellite.current) satellite.current.position.set(x, 0, z);
    if (light.current) light.current.position.set(x, 0, z);
  });

  return (
    <group rotation={tilt}>
      <mesh>
        <torusGeometry args={[radius, tube, 8, 128]} />
        <meshBasicMaterial color={color} transparent opacity={0.42} />
      </mesh>
      <mesh ref={satellite}>
        <sphereGeometry args={[satelliteSize, 20, 20]} />
        <meshStandardMaterial
          color={satelliteColor}
          emissive={satelliteColor}
          emissiveIntensity={2.4}
          roughness={0.25}
        />
      </mesh>
      <pointLight ref={light} color={satelliteColor} intensity={6} distance={6} decay={2} />
    </group>
  );
}

interface FloatingShardProps {
  position: [number, number, number];
  color: string;
  size: number;
  kind: 0 | 1 | 2 | 3;
  reduced: boolean;
}

/** Small geometric objects drifting around the hero core. */
function FloatingShard({ position, color, size, kind, reduced }: FloatingShardProps) {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!mesh.current || reduced) return;
    const t = state.clock.elapsedTime;
    mesh.current.rotation.x = t * 0.32;
    mesh.current.rotation.y = t * 0.42;
  });

  const geometry = useMemo(() => {
    switch (kind) {
      case 0:
        return <icosahedronGeometry args={[size, 0]} />;
      case 1:
        return <octahedronGeometry args={[size, 0]} />;
      case 2:
        return <boxGeometry args={[size, size, size]} />;
      default:
        return <tetrahedronGeometry args={[size, 0]} />;
    }
  }, [kind, size]);

  return (
    <Float
      speed={reduced ? 0 : 1.6}
      rotationIntensity={reduced ? 0 : 0.6}
      floatIntensity={reduced ? 0 : 1.4}
      floatingRange={[-0.18, 0.18]}
    >
      <mesh ref={mesh} position={position}>
        {geometry}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.55}
          metalness={0.85}
          roughness={0.18}
          flatShading
        />
      </mesh>
    </Float>
  );
}

function HeroCore({ isMobile, reduced }: { isMobile: boolean; reduced: boolean }) {
  const root = useRef<THREE.Group>(null);
  const shell = useRef<THREE.Points>(null);
  const shellInner = useRef<THREE.Points>(null);
  const scroll = useScrollRef();
  const { pointer } = useThree();

  const particles = useMemo(() => shellPositions(isMobile ? 420 : 1100, 1.9, 4.6, 11), [isMobile]);
  const dust = useMemo(() => shellPositions(isMobile ? 160 : 380, 1.5, 2.1, 3), [isMobile]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const damp = 1 - Math.pow(0.001, delta); // frame-rate independent smoothing

    if (root.current) {
      // Mouse parallax — subtle, never flipping the object away.
      const targetY = pointer.x * 0.55;
      const targetX = -pointer.y * 0.35;
      // Scroll pushes the object back and rotates it slowly like a reel.
      const scrollPush = scroll.current * 2.2;

      root.current.rotation.y += (targetY + t * 0.08 + scroll.current * 1.4 - root.current.rotation.y) * damp * 0.12;
      root.current.rotation.x += (targetX - root.current.rotation.x) * damp * 0.12;
      root.current.position.z += (-scrollPush - root.current.position.z) * damp * 0.1;
      root.current.position.y = Math.sin(t * 0.6) * 0.09;
    }

    if (shell.current) {
      shell.current.rotation.y -= delta * 0.045;
      shell.current.rotation.x = Math.sin(t * 0.12) * 0.12;
    }
    if (shellInner.current) shellInner.current.rotation.y += delta * 0.12;
  });

  return (
    <group ref={root}>
      {/* Distorted liquid core */}
      <mesh>
        <sphereGeometry args={[1.32, isMobile ? 48 : 96, isMobile ? 48 : 96]} />
        <MeshDistortMaterial
          color="#0a1224"
          distort={reduced ? 0.12 : 0.34}
          speed={reduced ? 0.4 : 1.7}
          roughness={0.22}
          metalness={0.95}
        />
      </mesh>

      {/* Additive glow core */}
      <mesh scale={1.02}>
        <sphereGeometry args={[1.3, 48, 48]} />
        <meshBasicMaterial
          color={ACCENT}
          transparent
          opacity={0.07}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Wireframe cage */}
      <mesh scale={1.5}>
        <icosahedronGeometry args={[1, 2]} />
        <meshBasicMaterial color={ACCENT} wireframe transparent opacity={0.16} />
      </mesh>

      {/* Inner dust cloud */}
      <points ref={shellInner}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dust, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.035}
          color={ACCENT_2}
          transparent
          opacity={0.9}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Outer halo of particles */}
      <points ref={shell}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particles, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.028}
          color="#bfe9ff"
          transparent
          opacity={0.75}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Orbits */}
      <OrbitRing
        radius={2.05}
        tube={0.008}
        color={ACCENT}
        tilt={[Math.PI / 2.4, 0.2, 0]}
        speed={0.55}
        satelliteColor={ACCENT}
        satelliteSize={0.075}
      />
      <OrbitRing
        radius={2.5}
        tube={0.006}
        color={ACCENT_2}
        tilt={[Math.PI / 1.8, -0.5, 0.35]}
        speed={-0.38}
        satelliteColor={ACCENT_2}
        satelliteSize={0.06}
      />
      <OrbitRing
        radius={2.95}
        tube={0.005}
        color={ACCENT_3}
        tilt={[Math.PI / 2.9, 0.9, -0.4]}
        speed={0.26}
        satelliteColor={ACCENT_3}
        satelliteSize={0.05}
      />

      {/* Floating shards */}
      <FloatingShard position={[-2.35, 1.15, 0.6]} color={ACCENT} size={0.19} kind={0} reduced={reduced} />
      <FloatingShard position={[2.25, -0.95, 0.2]} color={ACCENT_2} size={0.17} kind={1} reduced={reduced} />
      <FloatingShard position={[1.55, 1.6, -1.1]} color={ACCENT_3} size={0.14} kind={2} reduced={reduced} />
      <FloatingShard position={[-1.85, -1.35, 0.9]} color="#7dd3fc" size={0.15} kind={3} reduced={reduced} />
      {!isMobile && (
        <FloatingShard position={[0.4, 2.1, -1.6]} color="#c4b5fd" size={0.13} kind={1} reduced={reduced} />
      )}
    </group>
  );
}

/** Soft studio lighting shared by the hero + about scenes. */
function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 5, 4]} intensity={2.1} color="#e0f6ff" />
      <pointLight position={[-5, -2, -3]} intensity={45} color={ACCENT} distance={22} decay={2} />
      <pointLight position={[5, 3, -4]} intensity={38} color={ACCENT_2} distance={22} decay={2} />
      <pointLight position={[0, -4, 4]} intensity={18} color={ACCENT_3} distance={18} decay={2} />
    </>
  );
}

/**
 * The interactive 3D object shown in the hero section.
 * Mounted lazily by <Hero /> and paused while scrolled out of view.
 */
export function HeroObject3D({ active = true }: { active?: boolean }) {
  const isMobile = useIsMobile();
  const reduced = usePrefersReducedMotion();
  const [dpr, setDpr] = useState(isMobile ? 1.25 : 1.75);

  return (
    <Canvas
      frameloop={active && !reduced ? "always" : "demand"}
      dpr={dpr}
      camera={{ position: [0, 0, 7.2], fov: 42 }}
      gl={{ antialias: !isMobile, alpha: true, powerPreference: "high-performance" }}
    >
      <PerformanceMonitor
        onDecline={() => setDpr((current) => Math.max(0.85, current - 0.35))}
        onIncline={() => setDpr(isMobile ? 1.25 : 1.75)}
      />
      <AdaptiveDpr pixelated={false} />
      <SceneLights />
      <HeroCore isMobile={isMobile} reduced={reduced} />
    </Canvas>
  );
}

/* ============================================================
   2. Global ambient background
   ============================================================ */

function BackgroundField({ isMobile, reduced }: { isMobile: boolean; reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const points = useRef<THREE.Points>(null);
  const scroll = useScrollRef();
  const { camera, pointer } = useThree();

  const positions = useMemo(
    () => boxPositions(isMobile ? 320 : 900, isMobile ? 26 : 34, 91),
    [isMobile],
  );

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const damp = 1 - Math.pow(0.002, delta);

    if (points.current) {
      points.current.rotation.y += delta * 0.012;
      points.current.position.y = Math.sin(t * 0.06) * 0.5 + scroll.current * 3.2;
    }

    if (group.current) {
      group.current.rotation.y += delta * 0.02;
      group.current.position.y = -scroll.current * 2.4;
    }

    // Slow, drifting camera — keeps the background alive but never distracting.
    const targetX = Math.sin(t * 0.07) * 0.5 + pointer.x * 0.35;
    const targetY = Math.sin(t * 0.05) * 0.3 + pointer.y * 0.25 - scroll.current * 1.6;
    camera.position.x += (targetX - camera.position.x) * damp * 0.5;
    camera.position.y += (targetY - camera.position.y) * damp * 0.5;
    camera.lookAt(0, 0, 0);
  });

  return (
    <group ref={group}>
      <points ref={points}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={isMobile ? 0.055 : 0.045}
          color="#8fd8ff"
          transparent
          opacity={0.5}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Very faint distant geometry for depth */}
      {!isMobile &&
        [
          { pos: [-9, 2.4, -12] as [number, number, number], color: ACCENT, s: 2.6 },
          { pos: [9.5, -3.2, -16] as [number, number, number], color: ACCENT_2, s: 3.4 },
          { pos: [2, -6.5, -20] as [number, number, number], color: ACCENT_3, s: 4.2 },
        ].map((shape, index) => (
          <Float
            key={index}
            speed={reduced ? 0 : 0.35}
            rotationIntensity={reduced ? 0 : 0.2}
            floatIntensity={reduced ? 0 : 0.5}
          >
            <mesh position={shape.pos}>
              <icosahedronGeometry args={[shape.s, 1]} />
              <meshBasicMaterial color={shape.color} wireframe transparent opacity={0.075} />
            </mesh>
          </Float>
        ))}

      <mesh position={[0, 0, -14]}>
        <torusGeometry args={[7.5, 0.012, 6, 128]} />
        <meshBasicMaterial color={ACCENT_2} transparent opacity={0.12} />
      </mesh>
    </group>
  );
}

/**
 * Fixed, non-interactive 3D environment layered behind the whole page.
 * Pauses automatically when the tab is hidden to save battery.
 */
export function GlobalBackground3D() {
  const isMobile = useIsMobile();
  const reduced = usePrefersReducedMotion();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onVisibility = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
      <Canvas
        frameloop={visible && !reduced ? "always" : "demand"}
        dpr={isMobile ? [0.8, 1] : [0.9, 1.4]}
        camera={{ position: [0, 0, 8], fov: 55 }}
        gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
      >
        <ambientLight intensity={0.4} />
        <BackgroundField isMobile={isMobile} reduced={reduced} />
      </Canvas>
    </div>
  );
}

/* ============================================================
   3. About section visual
   ============================================================ */

function AboutCluster({ reduced }: { reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const { pointer } = useThree();
  const ring = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const damp = 1 - Math.pow(0.0015, delta);
    if (group.current) {
      group.current.rotation.y += delta * (reduced ? 0.05 : 0.22);
      group.current.rotation.x +=
        (-pointer.y * 0.3 + Math.sin(t * 0.4) * 0.08 - group.current.rotation.x) * damp * 0.2;
      group.current.rotation.z += (pointer.x * 0.16 - group.current.rotation.z) * damp * 0.2;
    }
    if (ring.current) ring.current.rotation.z -= delta * 0.35;
  });

  return (
    <group ref={group}>
      <Float speed={reduced ? 0 : 1.2} rotationIntensity={0.3} floatIntensity={0.8}>
        <mesh>
          <torusKnotGeometry args={[1.05, 0.34, 180, 32]} />
          <meshStandardMaterial
            color="#101a30"
            emissive={ACCENT}
            emissiveIntensity={0.22}
            metalness={0.95}
            roughness={0.16}
          />
        </mesh>
      </Float>

      <mesh ref={ring} scale={1.9} rotation={[Math.PI / 2.2, 0, 0]}>
        <torusGeometry args={[1, 0.006, 6, 128]} />
        <meshBasicMaterial color={ACCENT_2} transparent opacity={0.5} />
      </mesh>
      <mesh scale={2.35} rotation={[Math.PI / 1.6, 0.7, 0]}>
        <torusGeometry args={[1, 0.004, 6, 128]} />
        <meshBasicMaterial color={ACCENT_3} transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

/** Compact 3D visual for the About section. */
export function AboutObject3D({ active = true }: { active?: boolean }) {
  const isMobile = useIsMobile();
  const reduced = usePrefersReducedMotion();

  return (
    <Canvas
      frameloop={active && !reduced ? "always" : "demand"}
      dpr={isMobile ? [0.9, 1.2] : [1, 1.6]}
      camera={{ position: [0, 0, 5.4], fov: 42 }}
      gl={{ antialias: !isMobile, alpha: true }}
    >
      <SceneLights />
      <AboutCluster reduced={reduced} />
    </Canvas>
  );
}
