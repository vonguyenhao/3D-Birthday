import { Suspense } from 'react';
import { Image, Text } from '@react-three/drei';
import { getPageFontSize } from '../utils/paginateText.js';
import { normalizeDisplayText } from '../utils/text.js';

const photoRotations = [-0.045, 0.038, 0.026, -0.032];

function MemoryPhotoFrame({ photo, index, total }) {
  const slots =
    total === 1
      ? [{ x: 0, y: -0.02, width: 0.92, height: 0.72 }]
      : [
          { x: -0.03, y: 0.32, width: 0.82, height: 0.54 },
          { x: 0.04, y: -0.42, width: 0.82, height: 0.54 },
        ];
  const slot = slots[index] || slots[0];
  const caption = normalizeDisplayText(photo?.caption || '');

  return (
    <group position={[slot.x, slot.y, 0.035]} rotation={[0, 0, photoRotations[index % photoRotations.length]]}>
      <mesh position={[0, 0, -0.008]} raycast={() => null}>
        <planeGeometry args={[slot.width + 0.16, slot.height + 0.2]} />
        <meshStandardMaterial color="#fff9ec" roughness={0.72} metalness={0} />
      </mesh>
      <mesh position={[0, 0, -0.014]} raycast={() => null}>
        <planeGeometry args={[slot.width + 0.22, slot.height + 0.26]} />
        <meshBasicMaterial color="#5a2434" transparent opacity={0.08} depthWrite={false} />
      </mesh>
      <Image
        url={photo.src}
        position={[0, 0.025, 0.008]}
        scale={[slot.width, slot.height, 1]}
        raycast={() => null}
        toneMapped={false}
      />
      {[
        [-slot.width / 2 - 0.01, slot.height / 2 + 0.035, -0.08],
        [slot.width / 2 + 0.01, slot.height / 2 + 0.035, 0.08],
      ].map(([x, y, rotation], tapeIndex) => (
        <mesh key={tapeIndex} position={[x, y, 0.018]} rotation={[0, 0, rotation]} raycast={() => null}>
          <planeGeometry args={[0.24, 0.065]} />
          <meshStandardMaterial color="#f0d7a6" transparent opacity={0.82} roughness={0.95} />
        </mesh>
      ))}
      {caption ? (
        <Text
          position={[0, -slot.height / 2 - 0.082, 0.018]}
          fontSize={0.043}
          maxWidth={slot.width + 0.1}
          lineHeight={1.1}
          textAlign="center"
          color="#6b4050"
          anchorX="center"
          anchorY="middle"
          raycast={() => null}
        >
          {caption}
        </Text>
      ) : null}
    </group>
  );
}

function MemoryPhotoAlbum({ page, x, rotationZ, titleColor }) {
  const photos = page.photos || [];

  return (
    <Suspense fallback={null}>
      <Text
        position={[x, 0.214, -0.72]}
        rotation={[-Math.PI / 2, 0, rotationZ]}
        fontSize={0.092}
        maxWidth={1.1}
        lineHeight={1.12}
        textAlign="center"
        color={titleColor}
        anchorX="center"
        anchorY="middle"
        raycast={() => null}
      >
        {normalizeDisplayText(page.title || 'Little Memories')}
      </Text>
      <group position={[x, 0.292, 0.12]} rotation={[-Math.PI / 2, 0, rotationZ]}>
        <mesh position={[0, 0, -0.025]} raycast={() => null}>
          <planeGeometry args={[1.18, 1.34]} />
          <meshStandardMaterial color="#f8e9c6" roughness={0.92} metalness={0} />
        </mesh>
        <mesh position={[0, 0, -0.02]} raycast={() => null}>
          <planeGeometry args={[1.1, 1.26]} />
          <meshBasicMaterial color="#8b3150" transparent opacity={0.035} depthWrite={false} />
        </mesh>
        {photos.slice(0, 2).map((photo, index) => (
          <MemoryPhotoFrame key={photo.id || photo.src} photo={photo} index={index} total={photos.length} />
        ))}
      </group>
    </Suspense>
  );
}

function BookPage({ page, side }) {
  const x = side === 'left' ? -0.74 : 0.74;
  const rotationZ = side === 'left' ? -0.02 : 0.02;
  const color = '#42202a';
  const titleColor = '#8b3150';
  const pageTitle = normalizeDisplayText(page?.title || '');
  const pageText = normalizeDisplayText(page?.text || '');
  const fontSize = page?.fontSize || getPageFontSize(pageText);

  if (!page) {
    return null;
  }

  if (page.layout === 'memory-photos') {
    return (
      <group>
        <MemoryPhotoAlbum page={page} x={x} rotationZ={rotationZ} titleColor={titleColor} />
      </group>
    );
  }

  return (
    <group>
      <Suspense fallback={null}>
        {pageTitle ? (
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
            raycast={() => null}
          >
            {pageTitle}
          </Text>
        ) : null}
        <Text
          position={[x, 0.212, pageTitle ? 0.12 : -0.02]}
          rotation={[-Math.PI / 2, 0, rotationZ]}
          fontSize={pageTitle ? Math.min(fontSize, 0.092) : fontSize}
          maxWidth={1.24}
          lineHeight={1.24}
          textAlign="center"
          color={color}
          anchorX="center"
          anchorY="middle"
          raycast={() => null}
        >
          {pageText}
        </Text>
      </Suspense>
    </group>
  );
}

export default BookPage;
