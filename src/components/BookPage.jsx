import { Suspense, useState } from 'react';
import { Sparkles, Text, useCursor } from '@react-three/drei';
import { getPageFontSize } from '../utils/paginateText.js';
import MemoryHotspot from './MemoryHotspot.jsx';

function LockedSecretMark({ x, rotationZ, unlocked, onUnlockRequest }) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered, 'pointer', 'auto');

  if (unlocked) {
    return (
      <group position={[x, 0.276, 0.5]} rotation={[-Math.PI / 2, 0, rotationZ]}>
        <Sparkles count={16} scale={[0.54, 0.18, 0.54]} size={1.8} speed={0.22} color="#ffe6a7" />
      </group>
    );
  }

  return (
    <group
      position={[x, 0.276, 0.5]}
      rotation={[-Math.PI / 2, 0, rotationZ]}
      onClick={(event) => {
        event.stopPropagation();
        onUnlockRequest();
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <mesh>
        <circleGeometry args={[hovered ? 0.22 : 0.18, 40]} />
        <meshStandardMaterial
          color="#ffd783"
          emissive="#f0a35b"
          emissiveIntensity={hovered ? 1 : 0.55}
          transparent
          opacity={0.74}
        />
      </mesh>
      <mesh position={[0, 0, 0.006]}>
        <circleGeometry args={[0.3, 40]} />
        <meshBasicMaterial color="#ffd783" transparent opacity={0.04} depthWrite={false} />
      </mesh>
      <Sparkles count={hovered ? 26 : 14} scale={[0.62, 0.2, 0.62]} size={1.7} speed={0.28} color="#ffe6a7" />
      <Suspense fallback={null}>
        <Text position={[0, 0.01, 0.014]} fontSize={0.12} color="#7c2f45" anchorX="center" anchorY="middle">
          locked
        </Text>
      </Suspense>
    </group>
  );
}

function BookPage({ page, side, secretUnlocked, onUnlockRequest, onMemoryOpen }) {
  const x = side === 'left' ? -0.74 : 0.74;
  const rotationZ = side === 'left' ? -0.02 : 0.02;
  const color = page?.type === 'lockedSecretHint' ? '#7c2f45' : '#42202a';
  const titleColor = page?.type === 'secret' ? '#7c2f45' : '#8b3150';
  const fontSize = page?.fontSize || getPageFontSize(page?.text || '');

  if (!page) {
    return null;
  }

  return (
    <group>
      <Suspense fallback={null}>
        {page.title ? (
          <Text
            position={[x, 0.214, -0.68]}
            rotation={[-Math.PI / 2, 0, rotationZ]}
            fontSize={0.104}
            maxWidth={1.1}
            lineHeight={1.12}
            textAlign="center"
            color={titleColor}
            anchorX="center"
            anchorY="middle"
          >
            {page.title}
          </Text>
        ) : null}
        <Text
          position={[x, 0.212, page.title ? 0.12 : -0.02]}
          rotation={[-Math.PI / 2, 0, rotationZ]}
          fontSize={page.title ? Math.min(fontSize, 0.092) : fontSize}
          maxWidth={1.16}
          lineHeight={1.22}
          textAlign="center"
          color={color}
          anchorX="center"
          anchorY="middle"
        >
          {page.text || ''}
        </Text>
      </Suspense>

      {page.type === 'lockedSecretHint' ? (
        <LockedSecretMark x={x} rotationZ={rotationZ} unlocked={secretUnlocked} onUnlockRequest={onUnlockRequest} />
      ) : null}

      {page.hotspots?.map((hotspot) => (
        <MemoryHotspot
          key={hotspot.id}
          position={[x + hotspot.offset[0], 0.278, hotspot.offset[1]]}
          label={hotspot.image?.alt}
          onOpen={() => onMemoryOpen(hotspot.image)}
        />
      ))}
    </group>
  );
}

export default BookPage;
