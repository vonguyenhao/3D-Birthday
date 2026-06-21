import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import BirthdayBookScene from './components/BirthdayBookScene.jsx';
import UnlockModal from './components/UnlockModal.jsx';
import CelebrationEffects from './components/CelebrationEffects.jsx';
import MusicControl from './components/MusicControl.jsx';
import SecretRevealScene from './components/SecretRevealScene.jsx';
import { normalizeMessageText, paginateText } from './utils/paginateText.js';
import { normalizeDisplayText } from './utils/text.js';

const GREETING_MESSAGE = `Wishing you happiness, love, health, and many beautiful moments ahead.

May every quiet wish find its way to you, and may this year feel softer, brighter, and full of little reasons to smile.

Cuốn sách này có một ngăn bí mật, nhưng anh chưa biết được làm sao để mở nó. Em giúp anh nhé! `;

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

const getMemoryPageText = (status) => {
  if (status === 'loading') {
    return 'Bình tĩnh đang load xíu, đợi tí nhen...';
  }

  if (status === 'no-token') {
    return 'Oi thoi chét';
  }

  if (status === 'error') {
    return 'The memories could not be loaded right now.';
  }

  if (status === 'ready') {
    return 'Mindil Beach Sunset Markets - 10/05/2026';
  }

  return 'No private memories added yet.';
};

const createMemoryPages = (images, status) => {
  const memoryIntro = {
    id: 'memory-intro',
    type: 'memory',
    layout: 'memory-note',
    title: 'Memory Sparks',
    text: getMemoryPageText(status),
  };

  if (status === 'loading') {
    return [memoryIntro];
  }

  if (status !== 'ready' || !images.length) {
    return [memoryIntro];
  }

  const photoPages = [];

  for (let index = 0; index < images.length; index += 2) {
    photoPages.push({
      id: `memory-photos-${index / 2}`,
      type: 'memory',
      layout: 'memory-photos',
      title: index === 0 ? 'Memory Sparks' : 'More Little Memories',
      photos: images.slice(index, index + 2),
    });
  }

  return [memoryIntro, ...photoPages];
};

function App() {
  const [isClosed, setIsClosed] = useState(true);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [secretMessage, setSecretMessage] = useState('');
  const [apologyMessage, setApologyMessage] = useState('');
  const [unlockToken, setUnlockToken] = useState('');
  const [memoryImages, setMemoryImages] = useState([]);
  const [memoryImagesStatus, setMemoryImagesStatus] = useState('locked');
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
    const greetingPages = createGreetingPages();

    if (!secretUnlocked) {
      return greetingPages;
    }

    return [...greetingPages, ...createMemoryPages(memoryImages, memoryImagesStatus)];
  }, [memoryImages, memoryImagesStatus, secretUnlocked]);

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

  useEffect(() => {
    if (!secretUnlocked) {
      setMemoryImages([]);
      setMemoryImagesStatus('locked');
      return undefined;
    }

    if (!unlockToken) {
      setMemoryImages([]);
      setMemoryImagesStatus('no-token');
      return undefined;
    }

    const controller = new AbortController();

    const loadMemoryImages = async () => {
      setMemoryImagesStatus('loading');
      setMemoryImages([]);

      try {
        const response = await fetch(`/api/memory-images?token=${encodeURIComponent(unlockToken)}`, {
          signal: controller.signal,
        });
        const result = await response.json();

        if (controller.signal.aborted) {
          return;
        }

        if (!response.ok || !result.success) {
          setMemoryImagesStatus('error');
          return;
        }

        if (!result.configured || !result.images?.length) {
          setMemoryImagesStatus('empty');
          return;
        }

        const images = result.images.map((image, index) => ({
          id: image.id || image.pathname || `memory-${index}`,
          src: `/api/memory-image?token=${encodeURIComponent(unlockToken)}&pathname=${encodeURIComponent(image.pathname)}`,
          alt: image.filename ? `Private memory ${index + 1}` : 'Private birthday memory',
          caption: image.filename ? `Memory ${index + 1}` : '',
        }));

        setMemoryImages(images);
        setMemoryImagesStatus(images.length ? 'ready' : 'empty');
      } catch (error) {
        if (error.name !== 'AbortError') {
          setMemoryImagesStatus('error');
        }
      }
    };

    loadMemoryImages();

    return () => controller.abort();
  }, [secretUnlocked, unlockToken]);

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
    const nextApologyMessage =
      typeof result === 'object' && result?.apologyMessage ? result.apologyMessage : '';

    setSecretMessage(normalizeMessageText(message));
    setApologyMessage(normalizeMessageText(nextApologyMessage));
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
        apologyMessage={apologyMessage}
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
    </main>
  );
}

export default App;
