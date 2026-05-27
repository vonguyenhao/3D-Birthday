import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  ContactShadows,
  Environment,
  Float,
  OrbitControls,
  Sparkles,
  Stars,
  Text,
  useCursor,
} from '@react-three/drei';
import { MathUtils, Vector3 } from 'three';
import BookPage from './BookPage.jsx';
import PageTurnControls from './PageTurnControls.jsx';
import MagicPageEffect from './MagicPageEffect.jsx';

function PageTurnSheet({ pageIndex, isClosed }) {
  const sheetRef = useRef();
  const previousIndexRef = useRef(pageIndex);
  const progressRef = useRef(1);
  const directionRef = useRef(1);

  useEffect(() => {
    if (pageIndex === previousIndexRef.current || isClosed) {
      previousIndexRef.current = pageIndex;
      progressRef.current = 1;
      return;
    }

    directionRef.current = pageIndex > previousIndexRef.current ? 1 : -1;
    previousIndexRef.current = pageIndex;
    progressRef.current = 0;
  }, [isClosed, pageIndex]);

  useFrame((_, delta) => {
    if (!sheetRef.current) {
      return;
    }

    progressRef.current = Math.min(1, progressRef.current + delta * 1.8);
    const eased = 1 - Math.pow(1 - progressRef.current, 3);
    const direction = directionRef.current;
    sheetRef.current.visible = !isClosed && progressRef.current < 0.98;
    sheetRef.current.rotation.z = direction > 0 ? eased * Math.PI : Math.PI - eased * Math.PI;
    sheetRef.current.position.y = 0.245 + Math.sin(eased * Math.PI) * 0.18;
  });

  return (
    <group ref={sheetRef} position={[0, 0.245, 0]} visible={false}>
      <mesh position={[0.72, 0, 0.01]} castShadow receiveShadow>
        <boxGeometry args={[1.42, 0.018, 1.94]} />
        <meshStandardMaterial color="#fff0cf" roughness={0.82} metalness={0} />
      </mesh>
    </group>
  );
}

function PageStack({ side }) {
  const x = side === 'left' ? -0.74 : 0.74;
  const rotationZ = side === 'left' ? -0.018 : 0.018;

  return (
    <>
      {[0, 1, 2].map((layer) => (
        <mesh key={layer} position={[x, 0.108 - layer * 0.018, 0.016 - layer * 0.006]} rotation={[0, 0, rotationZ]} receiveShadow>
          <boxGeometry args={[1.44 - layer * 0.014, 0.03, 1.92 - layer * 0.012]} />
          <meshStandardMaterial color={layer === 0 ? '#fff4d8' : '#ead7b0'} roughness={0.88} metalness={0} />
        </mesh>
      ))}
    </>
  );
}

function BookModel({
  isClosed,
  leftPage,
  rightPage,
  pageIndex,
  secretUnlocked,
  canGoPrevious,
  canGoNext,
  magicEvent,
  reducedMotion,
  onOpen,
  onClose,
  onNextPage,
  onPreviousPage,
  onUnlockRequest,
  onMemoryOpen,
  onSceneInteract,
}) {
  const rootRef = useRef();
  const coverPivotRef = useRef();
  const { size } = useThree();
  const [bookHovered, setBookHovered] = useState(false);
  const [coverHovered, setCoverHovered] = useState(false);
  const actionableHover = bookHovered || coverHovered;
  const baseScale = size.width < 720 ? 0.68 : 1.18;
  const targetScale = bookHovered && isClosed ? baseScale * 1.035 : baseScale;
  const targetCoverRotation = isClosed ? 0 : Math.PI * 0.84;

  useCursor(actionableHover, 'pointer', 'auto');

  useFrame((_, delta) => {
    if (rootRef.current) {
      const scale = MathUtils.damp(rootRef.current.scale.x, targetScale, 6, delta);
      rootRef.current.scale.setScalar(scale);
      rootRef.current.position.y = MathUtils.damp(rootRef.current.position.y, bookHovered && isClosed ? 0.045 : 0, 5, delta);
    }

    if (coverPivotRef.current) {
      coverPivotRef.current.rotation.z = MathUtils.damp(coverPivotRef.current.rotation.z, targetCoverRotation, 4.3, delta);
    }
  });

  const handleBookClick = (event) => {
    event.stopPropagation();
    onSceneInteract?.();

    if (isClosed) {
      onOpen();
      return;
    }

    if (event.point.x < -0.08 && canGoPrevious) {
      onPreviousPage();
      return;
    }

    if (event.point.x > 0.08 && canGoNext) {
      onNextPage();
    }
  };

  return (
    <Float speed={0.45} rotationIntensity={0.015} floatIntensity={0.035}>
      <group
        ref={rootRef}
        rotation={[-0.085, -0.012, 0.004]}
        onClick={handleBookClick}
        onPointerOver={(event) => {
          event.stopPropagation();
          setBookHovered(true);
        }}
        onPointerOut={() => setBookHovered(false)}
        onPointerDown={() => onSceneInteract?.()}
      >
        <mesh position={[0, -0.24, 0]} receiveShadow>
          <cylinderGeometry args={[2.28, 2.28, 0.035, 112]} />
          <meshStandardMaterial color="#100c1d" roughness={0.96} metalness={0} transparent opacity={0.5} />
        </mesh>

        <mesh position={[0, -0.085, 0]} receiveShadow castShadow>
          <boxGeometry args={[3.48, 0.12, 2.36]} />
          <meshStandardMaterial color="#6e2b42" roughness={0.68} metalness={0.05} />
        </mesh>

        <mesh position={[-1.62, 0.09, 0]} castShadow>
          <boxGeometry args={[0.09, 0.28, 2.4]} />
          <meshStandardMaterial color="#4f1e32" roughness={0.58} metalness={0.08} />
        </mesh>

        <PageStack side="left" />
        <PageStack side="right" />

        <mesh position={[0, 0.18, -0.005]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.045, 1.9]} />
          <meshStandardMaterial color="#d6bd83" roughness={0.88} />
        </mesh>

        {!isClosed ? (
          <>
            <mesh
              position={[-1.63, 0.34, 0]}
              onClick={(event) => {
                event.stopPropagation();
                onSceneInteract?.();
                onClose();
              }}
              onPointerOver={(event) => {
                event.stopPropagation();
                setCoverHovered(true);
              }}
              onPointerOut={() => setCoverHovered(false)}
            >
              <boxGeometry args={[1.2, 0.36, 2.42]} />
              <meshBasicMaterial color="#ff8baa" transparent opacity={0.01} depthWrite={false} />
            </mesh>

            <BookPage
              page={leftPage}
              side="left"
              secretUnlocked={secretUnlocked}
              onUnlockRequest={onUnlockRequest}
              onMemoryOpen={onMemoryOpen}
            />
            <BookPage
              page={rightPage}
              side="right"
              secretUnlocked={secretUnlocked}
              onUnlockRequest={onUnlockRequest}
              onMemoryOpen={onMemoryOpen}
            />
            <PageTurnSheet pageIndex={pageIndex} isClosed={isClosed} />
            <PageTurnControls
              canGoPrevious={canGoPrevious}
              canGoNext={canGoNext}
              onPreviousPage={() => {
                onSceneInteract?.();
                onPreviousPage();
              }}
              onNextPage={() => {
                onSceneInteract?.();
                onNextPage();
              }}
            />
            <MagicPageEffect event={magicEvent} reducedMotion={reducedMotion} />
          </>
        ) : null}

        <group
          ref={coverPivotRef}
          position={[-1.62, 0.19, 0]}
          onClick={(event) => {
            if (!isClosed) {
              event.stopPropagation();
              onSceneInteract?.();
              onClose();
            }
          }}
          onPointerOver={(event) => {
            event.stopPropagation();
            setCoverHovered(true);
          }}
          onPointerOut={() => setCoverHovered(false)}
        >
          <mesh position={[1.62, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[3.24, 0.17, 2.34]} />
            <meshStandardMaterial color={coverHovered ? '#c95775' : '#b33f5c'} roughness={0.5} metalness={0.1} />
          </mesh>

          <mesh position={[1.62, 0.091, 0]} castShadow>
            <boxGeometry args={[2.78, 0.026, 1.88]} />
            <meshStandardMaterial color={coverHovered ? '#e49caf' : '#cd7d98'} roughness={0.55} metalness={0.04} />
          </mesh>

          <mesh position={[1.62, 0.114, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.35, 0.405, 80]} />
            <meshStandardMaterial color="#f1ce7a" metalness={0.38} roughness={0.28} />
          </mesh>

          <Suspense fallback={null}>
            <Text
              position={[1.62, 0.145, -0.17]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={0.16}
              maxWidth={1.72}
              lineHeight={1.1}
              textAlign="center"
              color="#ffecc0"
              anchorX="center"
              anchorY="middle"
            >
              Birthday Book
            </Text>
          </Suspense>
        </group>

        {bookHovered && isClosed ? (
          <Sparkles count={48} scale={[3.4, 0.7, 2.38]} size={2.7} speed={0.32} color="#ffe6a7" />
        ) : null}

        {secretUnlocked ? (
          <Sparkles count={76} scale={[3.4, 1.1, 2.4]} size={3.2} speed={0.33} color="#ffe6a7" />
        ) : null}
      </group>
    </Float>
  );
}

function MagicalBackground() {
  return (
    <>
      <Stars radius={56} depth={32} count={1200} factor={3.2} saturation={0.12} fade speed={0.22} />
      <Sparkles count={58} scale={[9, 4.5, 5.4]} size={2.3} speed={0.14} color="#f8dca0" opacity={0.32} />
      <Sparkles count={28} scale={[6, 2.2, 4]} size={3.6} speed={0.1} color="#f7b5c8" opacity={0.2} />
    </>
  );
}

function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.58} />
      <directionalLight
        position={[3.5, 5.2, 3.7]}
        intensity={1.04}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[-2.6, 2.6, 3.2]} intensity={0.82} color="#ffc4a0" />
      <pointLight position={[2.4, 1.5, -2.9]} intensity={0.42} color="#bfc6ff" />
      <spotLight position={[0, 4.9, 2.9]} intensity={0.74} angle={0.6} penumbra={0.98} color="#fff2cf" />
    </>
  );
}

function CameraFocus({ isClosed, pageIndex, controlsRef }) {
  const { camera, size } = useThree();
  const focusTimeRef = useRef(1);
  const closedPosition = useMemo(
    () => new Vector3(0, size.width < 720 ? 3.96 : 3.72, size.width < 720 ? 8.85 : 6.35),
    [size.width],
  );
  const openPosition = useMemo(
    () => new Vector3(0.02, size.width < 720 ? 3.55 : 3.16, size.width < 720 ? 8.15 : 5.36),
    [size.width],
  );
  const closedTarget = useMemo(() => new Vector3(0, 0.1, 0), []);
  const openTarget = useMemo(() => new Vector3(0.02, 0.16, -0.02), []);

  useEffect(() => {
    focusTimeRef.current = 1.15;
  }, [isClosed, pageIndex, size.width]);

  useFrame((_, delta) => {
    if (focusTimeRef.current <= 0) {
      return;
    }

    const nextPosition = isClosed ? closedPosition : openPosition;
    const nextTarget = isClosed ? closedTarget : openTarget;

    focusTimeRef.current = Math.max(0, focusTimeRef.current - delta);
    camera.position.lerp(nextPosition, 1 - Math.exp(-delta * 2.15));

    if (controlsRef.current) {
      controlsRef.current.target.lerp(nextTarget, 1 - Math.exp(-delta * 2));
      controlsRef.current.update();
    } else {
      camera.lookAt(nextTarget);
    }
  });

  return null;
}

function BirthdayBookScene({
  isClosed,
  leftPage,
  rightPage,
  pageIndex,
  secretUnlocked,
  canGoPrevious,
  canGoNext,
  magicEvent,
  reducedMotion,
  onOpen,
  onClose,
  onNextPage,
  onPreviousPage,
  onUnlockRequest,
  onMemoryOpen,
  onSceneInteract,
}) {
  const controlsRef = useRef();

  return (
    <Canvas
      shadows
      camera={{ position: [0, 3.72, 6.35], fov: 31, near: 0.1, far: 100 }}
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      aria-hidden="true"
      onPointerDown={() => onSceneInteract?.()}
      onWheel={() => onSceneInteract?.()}
    >
      <color attach="background" args={['#02030a']} />
      <MagicalBackground />
      <SceneLights />
      <CameraFocus isClosed={isClosed} pageIndex={pageIndex} controlsRef={controlsRef} />
      <BookModel
        isClosed={isClosed}
        leftPage={leftPage}
        rightPage={rightPage}
        pageIndex={pageIndex}
        secretUnlocked={secretUnlocked}
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
        magicEvent={magicEvent}
        reducedMotion={reducedMotion}
        onOpen={onOpen}
        onClose={onClose}
        onNextPage={onNextPage}
        onPreviousPage={onPreviousPage}
        onUnlockRequest={onUnlockRequest}
        onMemoryOpen={onMemoryOpen}
        onSceneInteract={onSceneInteract}
      />
      <ContactShadows position={[0, -0.24, 0]} opacity={0.18} scale={5.2} blur={3.8} far={1.4} />
      <OrbitControls
        ref={controlsRef}
        enableRotate
        enableZoom
        enablePan={false}
        minDistance={4.8}
        maxDistance={8.1}
        minPolarAngle={0.5}
        maxPolarAngle={1.12}
        minAzimuthAngle={-0.5}
        maxAzimuthAngle={0.5}
        rotateSpeed={0.34}
        zoomSpeed={0.42}
        dampingFactor={0.08}
        enableDamping
        target={[0, 0.12, 0]}
        onStart={() => onSceneInteract?.()}
      />
      <Environment preset="night" />
    </Canvas>
  );
}

export default BirthdayBookScene;
