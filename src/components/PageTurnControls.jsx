import { useState } from 'react';
import { useCursor } from '@react-three/drei';
import { DoubleSide } from 'three';

function PageClickArea({ side, enabled }) {
  const [hovered, setHovered] = useState(false);
  const isLeft = side === 'left';
  useCursor(enabled && hovered, 'pointer', 'auto');

  return (
    <group
      position={[isLeft ? -0.74 : 0.74, 0.246, 0.02]}
      rotation={[-Math.PI / 2, 0, isLeft ? -0.02 : 0.02]}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <mesh>
        <planeGeometry args={[1.5, 1.94]} />
        <meshBasicMaterial color="#ffd783" transparent opacity={0.001} depthWrite={false} side={DoubleSide} />
      </mesh>

      {enabled && hovered ? (
        <mesh position={[isLeft ? -0.56 : 0.56, 0, 0.012]}>
          <planeGeometry args={[0.08, 1.54]} />
          <meshBasicMaterial color="#ffd783" transparent opacity={0.18} depthWrite={false} side={DoubleSide} />
        </mesh>
      ) : null}
    </group>
  );
}

function PageTurnControls({ canGoPrevious, canGoNext, onPreviousPage, onNextPage }) {
  return (
    <>
      <PageClickArea side="left" enabled={canGoPrevious} onClick={onPreviousPage} />
      <PageClickArea side="right" enabled={canGoNext} onClick={onNextPage} />
    </>
  );
}

export default PageTurnControls;
