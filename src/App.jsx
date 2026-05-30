import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import BirthdayBookScene from './components/BirthdayBookScene.jsx';
import UnlockModal from './components/UnlockModal.jsx';
import CelebrationEffects from './components/CelebrationEffects.jsx';
import MusicControl from './components/MusicControl.jsx';
import ImageLightbox from './components/ImageLightbox.jsx';
import SecretRevealScene from './components/SecretRevealScene.jsx';
import { normalizeMessageText, paginateText } from './utils/paginateText.js';
import { normalizeDisplayText } from './utils/text.js';

const GREETING_MESSAGE = `Wishing you happiness, love, health, and many beautiful moments ahead.

May every quiet wish find its way to you, and may this year feel softer, brighter, and full of little reasons to smile.

This book keeps a simple birthday wish first, then a few private pages that only open when the right memories are remembered.`;

const MEMORY_MESSAGE = `A tiny memory page is tucked into the book.

Tap the golden sparkles to open optional photos. You can replace these placeholders with your own images whenever the gift is ready.`;

const createGreetingPages = () =>
  paginateText(normalizeDisplayText(GREETING_MESSAGE), {
    maxChars: 300,
    maxLines: 8,
    maxLineLength: 38,
  }).map((text, index) => ({
    id: `greeting-${index}`,
    type: 'greeting',
    title: index === 0 ? 'Happy Birthday' : 'A wish continued',
    text,
  }));

function App() {
  const [isClosed, setIsClosed] = useState(true);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [secretMessage, setSecretMessage] = useState('');
  const [unlockToken, setUnlockToken] = useState('');
  const [activeImage, setActiveImage] = useState(null);
  const [sceneInteracted, setSceneInteracted] = useState(false);
  const [coverAwakened, setCoverAwakened] = useState(false);
  const [revealStage, setRevealStage] = useState('idle');
  const [magicEvent, setMagicEvent] = useState(null);
  const magicEventId = useRef(0);
  const revealReturnPageIndexRef = useRef(0);
  const prefersReducedMotion = useReducedMotion();
  const secretUnlocked = Boolean(secretMessage);
  const isSecretRevealing = revealStage === 'burning';
  const isBookDissolved = revealStage === 'message';

  const triggerMagic = (type) => {
    magicEventId.current += 1;
    setMagicEvent({ id: magicEventId.current, type });
  };

  const pages = useMemo(() => {
    return [
      ...createGreetingPages(),
      {
        id: 'memory-1',
        type: 'memory',
        title: 'Memory Sparks',
        text: normalizeDisplayText(MEMORY_MESSAGE),
        hotspots: [
          {
            id: 'memory-photo-1',
            offset: [-0.34, 0.52],
            image: {
              src: '/images/memories/memory-1.jpg',
              alt: 'Birthday memory one',
              caption: 'Replace this placeholder with a real memory image.',
            },
          },
          {
            id: 'memory-photo-2',
            offset: [0.36, -0.36],
            image: {
              src: '/images/memories/memory-2.jpg',
              alt: 'Birthday memory two',
              caption: 'Optional memory photos live in public/images/memories/.',
            },
          },
        ],
      },
    ];
  }, []);

  const maxPageStartIndex = pages.length <= 1 ? 0 : pages.length % 2 === 0 ? pages.length - 2 : pages.length - 1;
  const clampPageIndex = useCallback(
    (pageIndex) => {
      const evenPageIndex = Math.max(0, pageIndex - (pageIndex % 2));
      return Math.min(evenPageIndex, maxPageStartIndex);
    },
    [maxPageStartIndex],
  );
  const safePageIndex = clampPageIndex(currentPageIndex);
  const leftPage = isClosed ? null : pages[safePageIndex];
  const rightPage = isClosed ? null : pages[safePageIndex + 1] || null;
  const canGoPrevious = !isClosed && safePageIndex > 0;
  const canGoNext = !isClosed && safePageIndex < maxPageStartIndex;

  useEffect(() => {
    if (safePageIndex !== currentPageIndex) {
      setCurrentPageIndex(safePageIndex);
    }
  }, [currentPageIndex, safePageIndex]);

  useEffect(() => {
    if (revealStage !== 'burning') {
      return undefined;
    }

    const revealTimer = window.setTimeout(
      () => setRevealStage('message'),
      prefersReducedMotion ? 950 : 3400,
    );

    return () => window.clearTimeout(revealTimer);
  }, [prefersReducedMotion, revealStage]);

  const openBook = () => {
    setSceneInteracted(true);
    setIsClosed(false);
    triggerMagic('open');
  };

  const awakenCover = () => {
    setSceneInteracted(true);
    setCoverAwakened(true);
  };

  const activateClosedBook = () => {
    if (!isClosed || isSecretRevealing || isBookDissolved) {
      return;
    }

    if (!coverAwakened) {
      awakenCover();
      return;
    }

    openBook();
  };

  const closeBook = () => {
    setSceneInteracted(true);
    setUnlockOpen(false);
    setIsClosed(true);
  };

  const goNext = () => {
    if (!canGoNext || isSecretRevealing || isBookDissolved) {
      return;
    }

    setSceneInteracted(true);
    triggerMagic('turn-next');
    setCurrentPageIndex((pageIndex) => clampPageIndex(pageIndex + 2));
  };

  const goPrevious = () => {
    if (!canGoPrevious || isSecretRevealing || isBookDissolved) {
      return;
    }

    setSceneInteracted(true);
    triggerMagic('turn-previous');
    setCurrentPageIndex((pageIndex) => clampPageIndex(pageIndex - 2));
  };

  const requestUnlock = () => {
    if (isSecretRevealing || isBookDissolved) {
      return;
    }

    setSceneInteracted(true);
    setIsClosed(false);

    if (secretUnlocked) {
      revealReturnPageIndexRef.current = safePageIndex;
      setUnlockOpen(false);
      setRevealStage('burning');
      triggerMagic('unlock');
      return;
    }

    setUnlockOpen(true);
  };

  const revealSecretMessage = (result) => {
    const message = typeof result === 'string' ? result : result?.message;

    setSecretMessage(normalizeMessageText(message));
    setUnlockToken(typeof result === 'object' && result?.unlockToken ? result.unlockToken : '');
    setUnlockOpen(false);
    revealReturnPageIndexRef.current = safePageIndex;
    setIsClosed(false);
    setRevealStage('burning');
    triggerMagic('unlock');
  };

  const closeSecretReveal = useCallback(() => {
    setSceneInteracted(true);
    setUnlockOpen(false);
    setRevealStage('idle');
    setIsClosed(false);
    setCurrentPageIndex(clampPageIndex(revealReturnPageIndexRef.current));
  }, [clampPageIndex]);

  const openMemoryImage = async (fallbackImage) => {
    if (!unlockToken) {
      setActiveImage(fallbackImage);
      return;
    }

    try {
      const response = await fetch(`/api/memory-images?token=${encodeURIComponent(unlockToken)}`);
      const result = await response.json();

      if (!response.ok || !result.success || !result.configured || !result.images?.length) {
        setActiveImage({
          ...fallbackImage,
          caption: result.message || fallbackImage.caption || 'Private memory images are not available yet.',
        });
        return;
      }

      const selectedImage = result.images[0];
      setActiveImage({
        src: `/api/memory-image?token=${encodeURIComponent(unlockToken)}&pathname=${encodeURIComponent(selectedImage.pathname)}`,
        alt: selectedImage.filename || 'Private birthday memory',
        caption: 'Private memory image unlocked for this session.',
      });
    } catch {
      setActiveImage({
        ...fallbackImage,
        caption: 'Private memory images could not be loaded right now.',
      });
    }
  };

  return (
    <main className="app-shell">
      <h1 className="screen-reader-title">3D Birthday Book</h1>
      <CelebrationEffects active={secretUnlocked && revealStage === 'idle'} reducedMotion={prefersReducedMotion} />

      <section className="book-experience" aria-label="Fullscreen 3D birthday book">
        <BirthdayBookScene
          isClosed={isClosed}
          leftPage={leftPage}
          rightPage={rightPage}
          pageIndex={safePageIndex}
          secretUnlocked={secretUnlocked}
          canGoPrevious={canGoPrevious}
          canGoNext={canGoNext}
          coverAwakened={coverAwakened}
          magicEvent={magicEvent}
          reducedMotion={prefersReducedMotion}
          isSecretRevealing={isSecretRevealing}
          isBookDissolved={isBookDissolved}
          onAwakenCover={awakenCover}
          onOpen={openBook}
          onClose={closeBook}
          onNextPage={goNext}
          onPreviousPage={goPrevious}
          onUnlockRequest={requestUnlock}
          onMemoryOpen={openMemoryImage}
          onSceneInteract={() => setSceneInteracted(true)}
        />
        {isClosed && !isSecretRevealing && !isBookDissolved ? (
          <button
            className="closed-book-hit-button"
            type="button"
            aria-label={coverAwakened ? 'Open the birthday book' : 'Awaken the birthday book cover'}
            onClick={activateClosedBook}
          />
        ) : null}
        {!isClosed && revealStage === 'idle' && !unlockOpen ? (
          <>
            <button
              className="book-page-hit-button left"
              type="button"
              aria-label="Turn to the previous page"
              disabled={!canGoPrevious}
              onClick={goPrevious}
            />
            <button
              className="book-page-hit-button right"
              type="button"
              aria-label="Turn to the next page"
              disabled={!canGoNext}
              onClick={goNext}
            />
            <button
              className="book-secret-hit-button"
              type="button"
              aria-label={secretUnlocked ? 'Replay the secret message' : 'Open the hidden secret letter'}
              onClick={requestUnlock}
            />
          </>
        ) : null}
      </section>

      <SecretRevealScene
        stage={revealStage}
        message={secretMessage}
        reducedMotion={prefersReducedMotion}
        onClose={closeSecretReveal}
      />

      <div className="top-controls" aria-label="Scene controls">
        <MusicControl />
      </div>

      <AnimatePresence>
        {!sceneInteracted ? (
          <motion.div
            className="scene-hint compact"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
          >
            <span className="desktop-hint">Tap the book. Drag to view. Scroll to zoom.</span>
            <span className="mobile-hint">Tap the book. Swipe to view. Pinch to zoom.</span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <UnlockModal isOpen={unlockOpen} onClose={() => setUnlockOpen(false)} onUnlocked={revealSecretMessage} />
      <ImageLightbox image={activeImage} onClose={() => setActiveImage(null)} />
    </main>
  );
}

export default App;
