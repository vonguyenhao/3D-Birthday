import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import BirthdayBookScene from './components/BirthdayBookScene.jsx';
import UnlockModal from './components/UnlockModal.jsx';
import CelebrationEffects from './components/CelebrationEffects.jsx';
import MusicControl from './components/MusicControl.jsx';
import ImageLightbox from './components/ImageLightbox.jsx';
import { normalizeMessageText, paginateText } from './utils/paginateText.js';

const GREETING_MESSAGE = `Wishing you happiness, love, health, and many beautiful moments ahead.

May every quiet wish find its way to you, and may this year feel softer, brighter, and full of little reasons to smile.

This book keeps a simple birthday wish first, then a few private pages that only open when the right memories are remembered.`;

const MEMORY_MESSAGE = `A tiny memory page is tucked into the book.

Tap the golden sparkles to open optional photos. You can replace these placeholders with your own images whenever the gift is ready.`;

const createGreetingPages = () =>
  paginateText(GREETING_MESSAGE, {
    maxChars: 300,
    maxLines: 8,
    maxLineLength: 34,
  }).map((text, index) => ({
    id: `greeting-${index}`,
    type: 'greeting',
    title: index === 0 ? 'Happy Birthday' : 'A wish continued',
    text,
  }));

const createSecretPages = (message) =>
  paginateText(message, {
    maxChars: 330,
    maxLines: 9,
    maxLineLength: 36,
  }).map((text, index) => ({
    id: `secret-${index}`,
    type: 'secret',
    title: index === 0 ? 'Secret Birthday Page' : `Secret Page ${index + 1}`,
    text,
  }));

function App() {
  const [isClosed, setIsClosed] = useState(true);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [secretMessage, setSecretMessage] = useState('');
  const [activeImage, setActiveImage] = useState(null);
  const [sceneInteracted, setSceneInteracted] = useState(false);
  const [magicEvent, setMagicEvent] = useState(null);
  const [secretPageSeen, setSecretPageSeen] = useState(false);
  const magicEventId = useRef(0);
  const prefersReducedMotion = useReducedMotion();
  const secretUnlocked = Boolean(secretMessage);

  const triggerMagic = (type) => {
    magicEventId.current += 1;
    setMagicEvent({ id: magicEventId.current, type });
  };

  const pages = useMemo(() => {
    const basePages = [
      ...createGreetingPages(),
      {
        id: 'memory-1',
        type: 'memory',
        title: 'Memory Sparks',
        text: MEMORY_MESSAGE,
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
      {
        id: 'locked-secret',
        type: 'lockedSecretHint',
        title: secretUnlocked ? 'Hidden pages unlocked' : 'A Hidden Page',
        text: secretUnlocked
          ? 'The lock has opened. The secret birthday pages are ready.'
          : 'A tiny golden lock is glowing on this page. Tap it when you are ready for the private questions.',
      },
    ];

    if (!secretUnlocked) {
      return basePages;
    }

    return [...basePages, ...createSecretPages(normalizeMessageText(secretMessage))];
  }, [secretMessage, secretUnlocked]);

  const safePageIndex = Math.min(currentPageIndex, Math.max(0, pages.length - 1));
  const leftPage = isClosed ? null : pages[safePageIndex];
  const rightPage = isClosed ? null : pages[safePageIndex + 1] || null;
  const canGoPrevious = !isClosed && safePageIndex > 0;
  const canGoNext = !isClosed && safePageIndex + 2 < pages.length;

  useEffect(() => {
    if (safePageIndex !== currentPageIndex) {
      setCurrentPageIndex(safePageIndex - (safePageIndex % 2));
    }
  }, [currentPageIndex, safePageIndex]);

  useEffect(() => {
    const spreadHasSecret = leftPage?.type === 'secret' || rightPage?.type === 'secret';

    if (!isClosed && spreadHasSecret && !secretPageSeen) {
      setSecretPageSeen(true);
      triggerMagic('secret-reveal');
    }
  }, [isClosed, leftPage?.type, rightPage?.type, secretPageSeen]);

  const openBook = () => {
    setSceneInteracted(true);
    setIsClosed(false);
    triggerMagic('open');
  };

  const closeBook = () => {
    setSceneInteracted(true);
    setUnlockOpen(false);
    setIsClosed(true);
  };

  const goNext = () => {
    if (!canGoNext) {
      return;
    }

    setSceneInteracted(true);
    triggerMagic('turn-next');
    setCurrentPageIndex((pageIndex) => Math.min(pageIndex + 2, pages.length - 1));
  };

  const goPrevious = () => {
    if (!canGoPrevious) {
      return;
    }

    setSceneInteracted(true);
    triggerMagic('turn-previous');
    setCurrentPageIndex((pageIndex) => Math.max(pageIndex - 2, 0));
  };

  const requestUnlock = () => {
    setSceneInteracted(true);
    setUnlockOpen(true);
  };

  const revealSecretMessage = (message) => {
    setSecretMessage(normalizeMessageText(message));
    setSecretPageSeen(false);
    setUnlockOpen(false);
    triggerMagic('unlock');
  };

  return (
    <main className="app-shell">
      <h1 className="screen-reader-title">3D Birthday Book</h1>
      <CelebrationEffects active={secretUnlocked} reducedMotion={prefersReducedMotion} />

      <section className="book-experience" aria-label="Fullscreen 3D birthday book">
        <BirthdayBookScene
          isClosed={isClosed}
          leftPage={leftPage}
          rightPage={rightPage}
          pageIndex={safePageIndex}
          secretUnlocked={secretUnlocked}
          canGoPrevious={canGoPrevious}
          canGoNext={canGoNext}
          magicEvent={magicEvent}
          reducedMotion={prefersReducedMotion}
          onOpen={openBook}
          onClose={closeBook}
          onNextPage={goNext}
          onPreviousPage={goPrevious}
          onUnlockRequest={requestUnlock}
          onMemoryOpen={setActiveImage}
          onSceneInteract={() => setSceneInteracted(true)}
        />
      </section>

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
