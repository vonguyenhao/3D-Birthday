import { useState } from 'react';
import { Html, Sparkles, useCursor } from '@react-three/drei';

function MemoryHotspot({ position, onOpen }) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered, 'pointer', 'auto');

  return (
    <group position={position}>
      <mesh
        onClick={(event) => {
          event.stopPropagation();
          onOpen();
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[hovered ? 0.073 : 0.056, 18, 18]} />
        <meshStandardMaterial color="#ffd783" emissive="#f0a35b" emissiveIntensity={hovered ? 1 : 0.7} roughness={0.35} />
      </mesh>
      <mesh
        onClick={(event) => {
          event.stopPropagation();
          onOpen();
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.16, 18, 18]} />
        <meshBasicMaterial color="#ffd783" transparent opacity={0.035} depthWrite={false} />
      </mesh>
      <Sparkles count={hovered ? 16 : 9} scale={[0.38, 0.18, 0.38]} size={1.35} speed={0.22} color="#ffe6a7" />
      <Html transform center position={[0, 0.012, 0]} scale={0.12} className="memory-hotspot-html">
        <button
          className="memory-hotspot-button"
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onOpen();
          }}
          aria-label="Open memory image"
        >
          ...
        </button>
      </Html>
    </group>
  );
}

export default MemoryHotspot;
