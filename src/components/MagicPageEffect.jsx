import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending } from 'three';

const COLORS = ['#fff7d2', '#ffd783', '#ff9fbd', '#ffffff'];

const createSeededRandom = (seed) => {
  let value = seed * 9301 + 49297;

  return () => {
    value = (value * 233280 + 49297) % 2147483647;
    return value / 2147483647;
  };
};

const getEffectSettings = (type, reducedMotion) => {
  const base = {
    center: [0, 0.32, 0.04],
    count: reducedMotion ? 8 : 22,
    spread: [1.1, 0.2, 0.55],
    lift: reducedMotion ? 0.16 : 0.58,
    duration: reducedMotion ? 0.8 : 1.45,
    shimmer: false,
  };

  if (type === 'turn-next') {
    return { ...base, center: [1.04, 0.3, 0.1], count: reducedMotion ? 6 : 16, spread: [0.22, 0.14, 0.62] };
  }

  if (type === 'turn-previous') {
    return { ...base, center: [-1.04, 0.3, 0.1], count: reducedMotion ? 6 : 16, spread: [0.22, 0.14, 0.62] };
  }

  if (type === 'unlock') {
    return { ...base, center: [0.74, 0.35, 0.5], count: reducedMotion ? 10 : 32, spread: [0.48, 0.18, 0.46], lift: reducedMotion ? 0.18 : 0.62 };
  }

  if (type === 'secret-reveal') {
    return { ...base, center: [0.18, 0.34, 0.06], count: reducedMotion ? 8 : 24, spread: [1.2, 0.12, 0.52], shimmer: true };
  }

  return { ...base, count: reducedMotion ? 8 : 24, lift: reducedMotion ? 0.18 : 0.56 };
};

function MagicPageEffect({ event, reducedMotion = false }) {
  const groupRef = useRef();
  const shimmerRef = useRef();
  const particleRefs = useRef([]);
  const elapsedRef = useRef(0);
  const [active, setActive] = useState(false);
  const settings = useMemo(
    () => getEffectSettings(event?.type || 'open', reducedMotion),
    [event?.type, reducedMotion],
  );

  const particles = useMemo(() => {
    if (!event) {
      return [];
    }

    const random = createSeededRandom(event.id + event.type.length);

    return Array.from({ length: settings.count }, (_, index) => {
      const angle = random() * Math.PI * 2;
      const radius = 0.1 + random() * 0.9;
      const drift = (random() - 0.5) * 0.34;

      return {
        id: `${event.id}-${index}`,
        start: [
          settings.center[0] + Math.cos(angle) * radius * settings.spread[0] * 0.34,
          settings.center[1] + (random() - 0.5) * settings.spread[1],
          settings.center[2] + Math.sin(angle) * radius * settings.spread[2] * 0.34,
        ],
        velocity: [
          Math.cos(angle) * drift,
          settings.lift * (0.62 + random() * 0.7),
          Math.sin(angle) * drift,
        ],
        scale: 0.004 + random() * 0.009,
        color: COLORS[Math.floor(random() * COLORS.length)],
        delay: random() * 0.24,
      };
    });
  }, [event, settings]);

  useEffect(() => {
    if (!event) {
      return;
    }

    elapsedRef.current = 0;
    setActive(true);
  }, [event]);

  useFrame((_, delta) => {
    if (!active || !event) {
      return;
    }

    elapsedRef.current += delta;
    const duration = settings.duration;

    particleRefs.current.forEach((particle, index) => {
      if (!particle || !particles[index]) {
        return;
      }

      const data = particles[index];
      const progress = Math.max(0, Math.min(1, (elapsedRef.current - data.delay) / duration));
      const ease = 1 - Math.pow(1 - progress, 3);
      particle.position.set(
        data.start[0] + data.velocity[0] * ease,
        data.start[1] + data.velocity[1] * ease,
        data.start[2] + data.velocity[2] * ease,
      );
        particle.scale.setScalar(data.scale * (1 + ease * 0.38));

      if (particle.material) {
        particle.material.opacity = progress <= 0 ? 0 : Math.max(0, Math.sin(progress * Math.PI) * 0.46);
      }
    });

    if (shimmerRef.current) {
      const progress = Math.min(1, elapsedRef.current / Math.max(1, duration));
      shimmerRef.current.position.x = -1.05 + progress * 2.1;
      shimmerRef.current.material.opacity = Math.max(0, Math.sin(progress * Math.PI) * 0.12);
    }

    if (elapsedRef.current > duration + 0.35) {
      setActive(false);
    }
  });

  if (!event || !active) {
    return null;
  }

  return (
    <group ref={groupRef} renderOrder={4}>
      {particles.map((particle, index) => (
        <mesh
          key={particle.id}
          ref={(node) => {
            particleRefs.current[index] = node;
          }}
          position={particle.start}
        >
          <sphereGeometry args={[1, 10, 10]} />
          <meshBasicMaterial
            color={particle.color}
            transparent
            opacity={0}
            depthWrite={false}
            blending={AdditiveBlending}
          />
        </mesh>
      ))}

      {settings.shimmer ? (
        <mesh ref={shimmerRef} position={[-1.05, 0.286, 0.04]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.34, 1.7]} />
          <meshBasicMaterial
            color="#ffe6a7"
            transparent
            opacity={0}
            depthWrite={false}
            blending={AdditiveBlending}
          />
        </mesh>
      ) : null}
    </group>
  );
}

export default MagicPageEffect;
