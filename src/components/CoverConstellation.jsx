import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, BufferGeometry, Float32BufferAttribute, MathUtils } from 'three';

const FORMATION_DURATION = 4;
const LINE_DURATION = 1.05;
const BURST_DURATION = 1.35;

const crabStars = [
  { id: 'shell-top', target: [0, 0.15], float: [-0.1, 0.74], size: 0.028, delay: 0, pulse: 1.05, anchor: true },
  { id: 'shell-left', target: [-0.17, 0.02], float: [-0.98, 0.38], size: 0.022, delay: 0.06, pulse: 0.74 },
  { id: 'shell-right', target: [0.17, 0.02], float: [0.98, 0.34], size: 0.022, delay: 0.06, pulse: 0.82 },
  { id: 'shell-bottom', target: [0, -0.15], float: [0.08, -0.76], size: 0.026, delay: 0.12, pulse: 0.95, anchor: true },

  { id: 'left-shoulder', target: [-0.34, 0.18], float: [-1.12, 0.02], size: 0.021, delay: 0.28, pulse: 0.68 },
  { id: 'left-claw-upper', target: [-0.66, 0.39], float: [-0.78, 0.68], size: 0.027, delay: 0.44, pulse: 1.16, anchor: true },
  { id: 'left-claw-lower', target: [-0.64, 0.17], float: [-1.08, -0.38], size: 0.02, delay: 0.5, pulse: 0.72 },

  { id: 'right-shoulder', target: [0.34, 0.18], float: [1.12, -0.02], size: 0.021, delay: 0.28, pulse: 0.76 },
  { id: 'right-claw-upper', target: [0.66, 0.39], float: [0.78, 0.7], size: 0.027, delay: 0.44, pulse: 1.22, anchor: true },
  { id: 'right-claw-lower', target: [0.64, 0.17], float: [1.08, -0.38], size: 0.02, delay: 0.5, pulse: 0.7 },

  { id: 'left-front-leg', target: [-0.34, -0.14], float: [-0.88, -0.62], size: 0.018, delay: 0.58, pulse: 0.55 },
  { id: 'left-back-leg', target: [-0.54, -0.35], float: [-0.42, -0.86], size: 0.019, delay: 0.7, pulse: 0.58 },
  { id: 'right-front-leg', target: [0.34, -0.14], float: [0.88, -0.62], size: 0.018, delay: 0.58, pulse: 0.55 },
  { id: 'right-back-leg', target: [0.54, -0.35], float: [0.42, -0.86], size: 0.019, delay: 0.7, pulse: 0.6 },
];

const crabLines = [
  { from: 0, to: 1, delay: 1.05 },
  { from: 0, to: 2, delay: 1.05 },
  { from: 1, to: 3, delay: 1.16 },
  { from: 2, to: 3, delay: 1.16 },
  { from: 1, to: 2, delay: 1.32 },

  { from: 0, to: 4, delay: 1.55 },
  { from: 4, to: 5, delay: 1.7 },
  { from: 4, to: 6, delay: 1.82 },
  { from: 0, to: 7, delay: 1.55 },
  { from: 7, to: 8, delay: 1.7 },
  { from: 7, to: 9, delay: 1.82 },

  { from: 1, to: 10, delay: 2.02 },
  { from: 10, to: 11, delay: 2.16 },
  { from: 2, to: 12, delay: 2.02 },
  { from: 12, to: 13, delay: 2.16 },
];

const driftDust = [
  [-0.74, -0.22, 0.008],
  [-0.7, 0.12, 0.009],
  [-0.5, 0.5, 0.007],
  [-0.22, 0.4, 0.008],
  [0.22, 0.42, 0.008],
  [0.48, 0.5, 0.007],
  [0.7, 0.1, 0.009],
  [0.74, -0.24, 0.008],
  [-0.12, -0.43, 0.007],
  [0.14, -0.44, 0.007],
];

const burstSeeds = Array.from({ length: 26 }, (_, index) => {
  const angle = (index / 26) * Math.PI * 2;
  const radius = 0.08 + (index % 6) * 0.024;

  return {
    id: `cover-burst-${index}`,
    start: [
      Math.cos(angle) * radius,
      Math.sin(angle) * radius * 0.72,
      0.036,
    ],
    velocity: [
      Math.cos(angle) * (0.14 + (index % 4) * 0.024),
      Math.sin(angle) * (0.1 + (index % 3) * 0.018) + 0.22,
      0.07 + (index % 6) * 0.009,
    ],
    size: 0.009 + (index % 4) * 0.003,
  };
});

const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3);

const createLineGeometry = (start, end) => {
  const geometry = new BufferGeometry();
  geometry.setAttribute(
    'position',
    new Float32BufferAttribute([start[0], start[1], 0.014, end[0], end[1], 0.014], 3),
  );
  return geometry;
};

function CoverConstellation({
  awakened = false,
  hovered = false,
  openBurstKey = 0,
  reducedMotion = false,
  onFormed,
}) {
  const starRefs = useRef([]);
  const haloRefs = useRef([]);
  const lineRefs = useRef([]);
  const dustRefs = useRef([]);
  const burstRefs = useRef([]);
  const shimmerRef = useRef();
  const elapsedRef = useRef(0);
  const formationElapsedRef = useRef(0);
  const burstRef = useRef({ key: openBurstKey, time: BURST_DURATION + 1 });
  const [formed, setFormed] = useState(false);

  useEffect(() => {
    formationElapsedRef.current = awakened && reducedMotion ? FORMATION_DURATION : 0;
    setFormed(awakened && reducedMotion);
    if (awakened && reducedMotion) {
      onFormed?.();
    }
  }, [awakened, reducedMotion, onFormed]);

  useEffect(() => {
    if (openBurstKey !== burstRef.current.key) {
      burstRef.current = { key: openBurstKey, time: 0 };
    }
  }, [openBurstKey]);

  useFrame((_, delta) => {
    elapsedRef.current += reducedMotion ? delta * 0.6 : delta;
    const elapsed = elapsedRef.current;
    if (awakened) {
      formationElapsedRef.current = Math.min(
        FORMATION_DURATION,
        formationElapsedRef.current + (reducedMotion ? delta * 8 : delta),
      );
    }

    const formationElapsed = formationElapsedRef.current;
    const globalFormation = awakened
      ? MathUtils.clamp(formationElapsed / FORMATION_DURATION, 0, 1)
      : 0;

    if (awakened && globalFormation >= 1 && !formed) {
      setFormed(true);
      onFormed?.();
    }

    crabStars.forEach((star, index) => {
      const starMesh = starRefs.current[index];
      const haloMesh = haloRefs.current[index];

      if (!starMesh || !haloMesh) {
        return;
      }

      const localProgress = reducedMotion
        ? 1
        : MathUtils.clamp((globalFormation - star.delay) / 0.52, 0, 1);
      const eased = easeOutCubic(localProgress);
      const floatRadius = awakened ? 0.045 : 0.075;
      const floatX = star.float[0] + Math.sin(elapsed * (0.46 + index * 0.018) + index * 0.9) * floatRadius;
      const floatY = star.float[1] + Math.cos(elapsed * (0.4 + index * 0.02) + index * 1.4) * floatRadius * 0.74;
      const x = MathUtils.lerp(floatX, star.target[0], eased);
      const y = MathUtils.lerp(floatY, star.target[1], eased);
      const twinkle = 0.68 + Math.sin(elapsed * (1.15 + star.pulse) + index * 1.23) * 0.32;
      const hoverLift = hovered ? 1.18 : 1;
      const anchorLift = star.anchor ? 1.18 : 1;
      const searchingLift = awakened ? 1 : 1.42;
      const settlingScale = awakened ? 0.82 + eased * 0.18 : 1;
      const scale = star.size * hoverLift * anchorLift * searchingLift * settlingScale * (0.92 + twinkle * 0.18);

      starMesh.position.set(x, y, 0.037);
      starMesh.scale.setScalar(scale);
      starMesh.material.opacity = (awakened ? 0.7 + twinkle * 0.22 : 0.58 + twinkle * 0.32) * hoverLift;

      haloMesh.position.set(x, y, 0.029);
      haloMesh.scale.setScalar(scale * (awakened ? (star.anchor ? 3.35 : 2.8) : 4.1));
      haloMesh.material.opacity =
        (awakened ? (star.anchor ? 0.07 : 0.045) : 0.12) * hoverLift * (0.8 + twinkle * 0.28);
    });

    crabLines.forEach((line, index) => {
      const lineMaterial = lineRefs.current[index];

      if (!lineMaterial) {
        return;
      }

      const progress = awakened
        ? MathUtils.clamp((formationElapsed - line.delay) / LINE_DURATION, 0, 1)
        : 0;
      const shimmer = 0.82 + Math.sin(elapsed * 1.8 + index * 0.72) * 0.18;
      lineMaterial.opacity = easeOutCubic(progress) * (hovered ? 0.52 : 0.34) * shimmer;
    });

    dustRefs.current.forEach((dust, index) => {
      if (!dust) {
        return;
      }

      const [x, y, size] = driftDust[index];
      const drift = reducedMotion ? 0 : Math.sin(elapsed * 0.38 + index * 1.27) * 0.013;
      dust.position.set(x + drift, y + Math.cos(elapsed * 0.34 + index) * 0.01, 0.026);
      dust.scale.setScalar(size * (hovered ? 1.18 : 1));
      dust.material.opacity = hovered ? 0.24 : 0.14;
    });

    if (shimmerRef.current) {
      const shimmerCycle = (elapsed * (hovered ? 0.82 : 0.24)) % 4;
      const shimmerOpacity = formed
        ? Math.max(0, Math.sin((shimmerCycle / 4) * Math.PI)) * (hovered ? 0.16 : 0.045)
        : 0;

      shimmerRef.current.position.x = -0.86 + shimmerCycle * 0.43;
      shimmerRef.current.material.opacity = shimmerOpacity;
    }

    if (burstRef.current.time <= BURST_DURATION) {
      burstRef.current.time += delta;
    }

    const burstProgress = MathUtils.clamp(burstRef.current.time / BURST_DURATION, 0, 1);
    const burstEase = easeOutCubic(burstProgress);
    burstRefs.current.forEach((particle, index) => {
      if (!particle) {
        return;
      }

      const seed = burstSeeds[index];
      const opacity = burstProgress < 1 ? Math.sin(burstProgress * Math.PI) * 0.42 : 0;
      particle.visible = opacity > 0.002;
      particle.position.set(
        seed.start[0] + seed.velocity[0] * burstEase,
        seed.start[1] + seed.velocity[1] * burstEase,
        seed.start[2] + seed.velocity[2] * burstEase,
      );
      particle.scale.setScalar(seed.size * (1 + burstEase * 0.55));
      particle.material.opacity = opacity;
    });
  });

  return (
    <group position={[1.62, 0.124, -0.015]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.06, 1.06, 1]} renderOrder={5}>
      <mesh position={[0, 0, -0.006]}>
        <planeGeometry args={[1.72, 1.14]} />
        <meshBasicMaterial color="#ffd783" transparent opacity={awakened ? (hovered ? 0.018 : 0.011) : 0} depthWrite={false} />
      </mesh>

      {crabLines.map((line, index) => {
        const start = crabStars[line.from].target;
        const end = crabStars[line.to].target;

        return (
          <line key={`${line.from}-${line.to}`} geometry={createLineGeometry(start, end)}>
            <lineBasicMaterial
              ref={(node) => { lineRefs.current[index] = node; }}
              color="#ffe8a6"
              transparent
              opacity={0}
              blending={AdditiveBlending}
              depthWrite={false}
            />
          </line>
        );
      })}

      <mesh ref={shimmerRef} position={[-0.86, 0, 0.022]} rotation={[0, 0, -0.18]}>
        <planeGeometry args={[0.1, 1.06]} />
        <meshBasicMaterial
          color="#fff3c8"
          transparent
          opacity={0}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {crabStars.map((star, index) => (
        <group key={star.id}>
          <mesh ref={(node) => { haloRefs.current[index] = node; }}>
            <sphereGeometry args={[1, 12, 12]} />
            <meshBasicMaterial
              color={star.anchor ? '#fff0b8' : '#ffd783'}
              transparent
              opacity={0.05}
              blending={AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          <mesh ref={(node) => { starRefs.current[index] = node; }}>
            <sphereGeometry args={[1, 18, 18]} />
            <meshBasicMaterial
              color={star.anchor ? '#fff8db' : '#ffe2a1'}
              transparent
              opacity={0.9}
              blending={AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}

      {driftDust.map((dust, index) => (
        <mesh key={`${dust[0]}-${dust[1]}`} ref={(node) => { dustRefs.current[index] = node; }}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial color="#fff4c8" transparent opacity={0.12} blending={AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}

      {burstSeeds.map((seed, index) => (
        <mesh key={seed.id} ref={(node) => { burstRefs.current[index] = node; }} visible={false}>
          <sphereGeometry args={[1, 10, 10]} />
          <meshBasicMaterial color="#ffe7a6" transparent opacity={0} blending={AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

export default CoverConstellation;
