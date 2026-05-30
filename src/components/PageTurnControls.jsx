import { useState } from 'react';
import { useCursor } from '@react-three/drei';

function PageClickArea({ side, enabled, onTurn }) {
  const [hovered, setHovered] = useState(false);
  const isLeft = side === 'left';
  useCursor(enabled && hovered, 'pointer', 'auto');

  if (!enabled) {
    return null;
  }

  return (
    <group
      position={[isLeft ? -0.74 : 0.74, 0.254, 0.02]}
      rotation={[0, 0, isLeft ? -0.02 : 0.02]}
      onClick={(event) => {
        event.stopPropagation();
        onTurn();
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <mesh>
        <boxGeometry args={[1.52, 0.028, 1.96]} />
        <meshBasicMaterial color="#ffd783" transparent opacity={0.002} depthWrite={false} />
      </mesh>

      {enabled && hovered ? (
        <mesh position={[isLeft ? -0.56 : 0.56, 0.018, 0]}>
          <boxGeometry args={[0.08, 0.012, 1.54]} />
          <meshBasicMaterial color="#ffd783" transparent opacity={0.18} depthWrite={false} />
        </mesh>
      ) : null}
    </group>
  );
}

function PageTurnControls({ canGoPrevious, canGoNext, onPreviousPage, onNextPage }) {
  return (
    <>
      <PageClickArea side="left" enabled={canGoPrevious} onTurn={onPreviousPage} />
      <PageClickArea side="right" enabled={canGoNext} onTurn={onNextPage} />
    </>
  );
}

export default PageTurnControls;
