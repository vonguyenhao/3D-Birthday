import { useMemo } from 'react';

function CelebrationEffects({ active, reducedMotion }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 34 }, (_, index) => ({
        id: index,
        left: `${(index * 29) % 100}%`,
        delay: `${(index % 12) * 0.13}s`,
        duration: `${2.7 + (index % 7) * 0.18}s`,
        size: `${8 + (index % 5) * 3}px`,
        hue: index % 2 === 0 ? '#ffd479' : '#ff8ca0',
      })),
    [],
  );

  if (!active || reducedMotion) {
    return null;
  }

  return (
    <div className="celebration-layer" aria-hidden="true">
      {particles.map((particle) => (
        <span
          className="celebration-particle"
          key={particle.id}
          style={{
            '--particle-left': particle.left,
            '--particle-delay': particle.delay,
            '--particle-duration': particle.duration,
            '--particle-size': particle.size,
            '--particle-color': particle.hue,
          }}
        />
      ))}
    </div>
  );
}

export default CelebrationEffects;
