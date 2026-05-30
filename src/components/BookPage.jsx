import { Suspense } from 'react';
import { Text } from '@react-three/drei';
import { getPageFontSize } from '../utils/paginateText.js';
import { normalizeDisplayText } from '../utils/text.js';
import MemoryHotspot from './MemoryHotspot.jsx';

function BookPage({ page, side, onMemoryOpen }) {
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
