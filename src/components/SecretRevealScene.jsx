import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { graphemeLength, normalizeDisplayText } from '../utils/text.js';

const CHUNKS_PER_SECTION = 4;
const CHUNK_LENGTH = 118;
const REVEAL_CHUNK_DELAY_MS = 7000;
const SHORT_SECTION_DELAY_MS = 5600;
const LONG_SECTION_DELAY_MS = 8200;
const INTRO_DELAY_MS = 1200;
const LINE_FADE_DURATION_MS = 600;
const LETTER_ONE_CLOSE_WAIT_MS = 2400;
const LETTER_ONE_FOLD_MS = 850;
const SECOND_LETTER_START_DELAY_MS = 650;
const SECOND_LETTER_LINE_DELAY_MS = 1650;
const SECOND_LETTER_AFTER_READ_WAIT_MS = 6800;
const SECOND_LETTER_BURN_MS = 3600;
const SECOND_LETTER_REDUCED_READ_MS = 2600;
const SECOND_LETTER_REDUCED_BURN_MS = 900;

const wrapLongText = (text, limit = CHUNK_LENGTH) => {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let currentLine = '';

  words.forEach((word) => {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;

    if (graphemeLength(nextLine) <= limit || !currentLine) {
      currentLine = nextLine;
      return;
    }

    lines.push(currentLine);
    currentLine = word;
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
};

const splitMessageIntoChunks = (message) => {
  const normalized = normalizeDisplayText(message)
    .replace(/\\n/g, '\n')
    .replace(/\r\n/g, '\n')
    .trim();

  if (!normalized) {
    return [];
  }

  const chunks = [];
  const paragraphs = normalized.split(/\n+/).map((paragraph) => paragraph.trim()).filter(Boolean);

  paragraphs.forEach((paragraph) => {
    const sentences = paragraph.match(/[^.!?]+[.!?]*/g) || [paragraph];
    let buffer = '';

    sentences.forEach((sentence) => {
      const cleanSentence = sentence.trim();

      if (!cleanSentence) {
        return;
      }

      if (graphemeLength(cleanSentence) > CHUNK_LENGTH + 28) {
        if (buffer) {
          chunks.push(buffer);
          buffer = '';
        }

        chunks.push(...wrapLongText(cleanSentence));
        return;
      }

      const nextBuffer = buffer ? `${buffer} ${cleanSentence}` : cleanSentence;

      if (graphemeLength(nextBuffer) <= CHUNK_LENGTH || !buffer) {
        buffer = nextBuffer;
        return;
      }

      chunks.push(buffer);
      buffer = cleanSentence;
    });

    if (buffer) {
      chunks.push(buffer);
    }
  });

  return chunks;
};

const getRevealDelay = (lineCount) => {
  if (lineCount <= 2) {
    return SHORT_SECTION_DELAY_MS;
  }

  if (lineCount >= CHUNKS_PER_SECTION) {
    return LONG_SECTION_DELAY_MS;
  }

  return REVEAL_CHUNK_DELAY_MS;
};

function SecretRevealScene({ stage, message, apologyMessage, reducedMotion = false, onClose }) {
  const messageChunks = useMemo(() => splitMessageIntoChunks(message), [message]);
  const secondLetterChunks = useMemo(() => splitMessageIntoChunks(apologyMessage), [apologyMessage]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [secondVisibleCount, setSecondVisibleCount] = useState(0);
  const [letterPhase, setLetterPhase] = useState('letterOne');
  const [replayKey, setReplayKey] = useState(0);
  const [manualSection, setManualSection] = useState(null);
  const revealTimers = useRef({ startTimer: null, interval: null });
  const letterTimers = useRef([]);
  const isMessageStage = stage === 'message' && messageChunks.length > 0;
  const isBurningStage = stage === 'burning';
  const isComplete = visibleCount >= messageChunks.length;
  const isLetterOneVisible = isMessageStage && (letterPhase === 'letterOne' || letterPhase === 'letterOneClosing');
  const isSecondLetterVisible =
    isMessageStage &&
    (letterPhase === 'letterTwoOpening' || letterPhase === 'letterTwoReading' || letterPhase === 'letterTwoBurning');
  const secondVisibleLines = secondLetterChunks.slice(0, Math.min(secondVisibleCount, secondLetterChunks.length));
  const sectionCount = Math.max(1, Math.ceil(messageChunks.length / CHUNKS_PER_SECTION));
  const animatedSection = Math.max(0, Math.ceil(Math.max(visibleCount, 1) / CHUNKS_PER_SECTION) - 1);
  const activeSection = manualSection ?? animatedSection;
  const sectionStart = activeSection * CHUNKS_PER_SECTION;
  const sectionEnd = sectionStart + CHUNKS_PER_SECTION;
  const visibleLineLimit = isComplete || manualSection !== null ? sectionEnd : Math.min(visibleCount, sectionEnd);
  const visibleLines = messageChunks.slice(sectionStart, Math.min(visibleLineLimit, messageChunks.length));

  const clearRevealTimers = useCallback(() => {
    window.clearTimeout(revealTimers.current.startTimer);
    window.clearInterval(revealTimers.current.interval);
    revealTimers.current = { startTimer: null, interval: null };
  }, []);

  const clearLetterTimers = useCallback(() => {
    letterTimers.current.forEach((timer) => window.clearTimeout(timer));
    letterTimers.current = [];
  }, []);

  const addLetterTimer = useCallback((callback, delay) => {
    const timer = window.setTimeout(callback, delay);
    letterTimers.current.push(timer);
    return timer;
  }, []);

  useEffect(() => {
    if (!isMessageStage) {
      clearRevealTimers();
      clearLetterTimers();
      setVisibleCount(0);
      setSecondVisibleCount(0);
      setManualSection(null);
      setLetterPhase('letterOne');
      return undefined;
    }

    clearLetterTimers();
    setLetterPhase('letterOne');
    setSecondVisibleCount(0);

    if (reducedMotion) {
      setVisibleCount(messageChunks.length);
      setManualSection(0);
      return undefined;
    }

    let sectionIndex = 0;
    clearRevealTimers();
    setVisibleCount(0);
    setManualSection(null);

    revealTimers.current.startTimer = window.setTimeout(() => {
      const revealSection = () => {
        const nextSectionStart = sectionIndex * CHUNKS_PER_SECTION;
        const nextVisibleCount = Math.min(nextSectionStart + CHUNKS_PER_SECTION, messageChunks.length);
        const visibleLineCount = nextVisibleCount - nextSectionStart;

        setVisibleCount(nextVisibleCount);

        if (nextVisibleCount >= messageChunks.length) {
          revealTimers.current.startTimer = null;
          return;
        }

        sectionIndex += 1;
        revealTimers.current.startTimer = window.setTimeout(revealSection, getRevealDelay(visibleLineCount));
      };

      revealSection();
    }, INTRO_DELAY_MS);

    return clearRevealTimers;
  }, [clearLetterTimers, clearRevealTimers, isMessageStage, messageChunks, reducedMotion, replayKey]);

  useEffect(() => {
    if (!isMessageStage || letterPhase !== 'letterOne' || !isComplete || !secondLetterChunks.length) {
      return undefined;
    }

    clearLetterTimers();
    addLetterTimer(() => setLetterPhase('letterOneClosing'), reducedMotion ? 650 : LETTER_ONE_CLOSE_WAIT_MS);

    return clearLetterTimers;
  }, [
    addLetterTimer,
    clearLetterTimers,
    isComplete,
    isMessageStage,
    letterPhase,
    reducedMotion,
    secondLetterChunks.length,
  ]);

  useEffect(() => {
    if (!isMessageStage || letterPhase !== 'letterOneClosing') {
      return undefined;
    }

    clearLetterTimers();
    addLetterTimer(() => setLetterPhase('letterTwoOpening'), reducedMotion ? 250 : LETTER_ONE_FOLD_MS);

    return clearLetterTimers;
  }, [addLetterTimer, clearLetterTimers, isMessageStage, letterPhase, reducedMotion]);

  useEffect(() => {
    if (!isMessageStage || letterPhase !== 'letterTwoOpening') {
      return undefined;
    }

    clearLetterTimers();
    addLetterTimer(() => setLetterPhase('letterTwoReading'), reducedMotion ? 150 : SECOND_LETTER_START_DELAY_MS);

    return clearLetterTimers;
  }, [addLetterTimer, clearLetterTimers, isMessageStage, letterPhase, reducedMotion]);

  useEffect(() => {
    if (!isMessageStage || letterPhase !== 'letterTwoReading' || !secondLetterChunks.length) {
      return undefined;
    }

    clearLetterTimers();

    if (reducedMotion) {
      setSecondVisibleCount(secondLetterChunks.length);
      addLetterTimer(() => setLetterPhase('letterTwoBurning'), SECOND_LETTER_REDUCED_READ_MS);
      return clearLetterTimers;
    }

    let nextVisibleCount = 0;

    const revealNextLine = () => {
      nextVisibleCount += 1;
      setSecondVisibleCount(Math.min(nextVisibleCount, secondLetterChunks.length));

      if (nextVisibleCount < secondLetterChunks.length) {
        addLetterTimer(revealNextLine, SECOND_LETTER_LINE_DELAY_MS);
        return;
      }

      addLetterTimer(() => setLetterPhase('letterTwoBurning'), SECOND_LETTER_AFTER_READ_WAIT_MS);
    };

    setSecondVisibleCount(0);
    addLetterTimer(revealNextLine, SECOND_LETTER_START_DELAY_MS);

    return clearLetterTimers;
  }, [
    addLetterTimer,
    clearLetterTimers,
    isMessageStage,
    letterPhase,
    reducedMotion,
    secondLetterChunks.length,
  ]);

  useEffect(() => {
    if (!isMessageStage || letterPhase !== 'letterTwoBurning') {
      return undefined;
    }

    clearLetterTimers();
    addLetterTimer(() => {
      setLetterPhase('lettersComplete');
      onClose?.();
    }, reducedMotion ? SECOND_LETTER_REDUCED_BURN_MS : SECOND_LETTER_BURN_MS);

    return clearLetterTimers;
  }, [addLetterTimer, clearLetterTimers, isMessageStage, letterPhase, onClose, reducedMotion]);

  useEffect(() => {
    if ((!isBurningStage && !isMessageStage) || !onClose) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBurningStage, isMessageStage, onClose]);

  const showFullMessage = () => {
    if (isMessageStage) {
      clearRevealTimers();
      setVisibleCount(messageChunks.length);
      setManualSection(0);
    }
  };

  const replay = () => {
    if (isMessageStage) {
      clearRevealTimers();
      clearLetterTimers();
      setManualSection(null);
      setLetterPhase('letterOne');
      setSecondVisibleCount(0);
      setReplayKey((key) => key + 1);
    }
  };

  const goToEarlierSection = () => {
    setManualSection((section) => Math.max((section ?? activeSection) - 1, 0));
  };

  const goToLaterSection = () => {
    setManualSection((section) => Math.min((section ?? activeSection) + 1, sectionCount - 1));
  };

  return (
    <AnimatePresence>
      {isBurningStage || isMessageStage ? (
        <motion.section
          className={`secret-reveal-layer ${isMessageStage ? 'message-visible' : ''}`}
          aria-live="polite"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.01 : 0.45 }}
        >
          <div className="secret-reveal-stars" aria-hidden="true">
            {Array.from({ length: 34 }, (_, index) => (
              <span
                key={index}
                style={{
                  '--i': index,
                  '--s': `${3 + (index % 4)}px`,
                  left: `${(index * 29) % 100}%`,
                  top: `${14 + ((index * 47) % 72)}%`,
                }}
              />
            ))}
          </div>

          <div className="secret-reveal-controls" onClick={(event) => event.stopPropagation()}>
            {isMessageStage ? (
              <>
                <button className="secret-reveal-button" type="button" onClick={replay}>
                  Replay
                </button>
                {isLetterOneVisible && !isComplete ? (
                  <button className="secret-reveal-button" type="button" onClick={showFullMessage}>
                    Show full message
                  </button>
                ) : null}
              </>
            ) : null}
            <button className="secret-reveal-button primary" type="button" onClick={onClose}>
              Back to book
            </button>
          </div>

          {isBurningStage ? (
            <motion.p
              className="release-kicker"
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              A message is being released from the book...
            </motion.p>
          ) : null}

          {isLetterOneVisible ? (
            <motion.div
              className={`secret-air-panel ${letterPhase === 'letterOneClosing' ? 'letter-one-closing' : ''}`}
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: reducedMotion ? 0.01 : 0.55, ease: 'easeOut' }}
            >
              <p className="release-kicker">A message released from the book...</p>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${replayKey}-${activeSection}`}
                  className="secret-message-section"
                  initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
                  transition={{ duration: reducedMotion ? 0.01 : LINE_FADE_DURATION_MS / 1000, ease: 'easeOut' }}
                >
                  {visibleLines.length ? (
                    visibleLines.map((line, index) => {
                      const absoluteIndex = sectionStart + index;
                      const isActiveLine = absoluteIndex === visibleCount - 1 && !isComplete;

                      return (
                        <motion.p
                          className={`secret-message-line ${isActiveLine ? 'active' : ''}`}
                          key={`${replayKey}-${absoluteIndex}-${line}`}
                          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: reducedMotion ? 0.01 : LINE_FADE_DURATION_MS / 1000,
                            delay: reducedMotion ? 0 : index * 0.08,
                            ease: 'easeOut',
                          }}
                        >
                          {line}
                        </motion.p>
                      );
                    })
                  ) : (
                    <span className="secret-message-loading" aria-hidden="true" />
                  )}
                </motion.div>
              </AnimatePresence>

              <p className="secret-section-count">
                {isComplete ? 'Message complete' : `Part ${activeSection + 1} of ${sectionCount}`}
              </p>

              {isComplete && sectionCount > 1 ? (
                <div className="secret-section-nav" aria-label="Completed message sections">
                  <button
                    className="secret-reveal-button"
                    type="button"
                    disabled={activeSection === 0}
                    onClick={goToEarlierSection}
                  >
                    Earlier
                  </button>
                  <span>
                    {activeSection + 1} / {sectionCount}
                  </span>
                  <button
                    className="secret-reveal-button"
                    type="button"
                    disabled={activeSection >= sectionCount - 1}
                    onClick={goToLaterSection}
                  >
                    Later
                  </button>
                </div>
              ) : null}
            </motion.div>
          ) : null}

          {isSecondLetterVisible ? (
            <motion.div
              className="second-letter-stage"
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: reducedMotion ? 0.01 : 0.72, ease: 'easeOut' }}
            >
              <motion.article
                className={`second-letter-panel ${letterPhase === 'letterTwoBurning' ? 'burning' : ''}`}
                initial={reducedMotion ? { opacity: 0 } : { opacity: 0, rotateX: -8, y: 18 }}
                animate={{ opacity: 1, rotateX: 0, y: 0 }}
                transition={{ duration: reducedMotion ? 0.01 : 0.82, ease: 'easeOut' }}
              >
                <span className="second-letter-seal" aria-hidden="true">II</span>
                <p className="second-letter-kicker">One more letter...</p>
                <h2>I owe you this apology</h2>
                <div className="second-letter-rule" aria-hidden="true" />
                <div className="second-letter-copy">
                  {secondVisibleLines.length ? (
                    secondVisibleLines.map((line, index) => (
                      <motion.p
                        key={`${replayKey}-second-${index}-${line}`}
                        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: reducedMotion ? 0.01 : LINE_FADE_DURATION_MS / 1000,
                          ease: 'easeOut',
                        }}
                      >
                        {line}
                      </motion.p>
                    ))
                  ) : (
                    <span className="second-letter-loading" aria-hidden="true" />
                  )}
                </div>
                <div className="second-letter-embers" aria-hidden="true">
                  {Array.from({ length: 18 }, (_, index) => (
                    <span key={index} style={{ '--i': index }} />
                  ))}
                </div>
              </motion.article>
            </motion.div>
          ) : null}
        </motion.section>
      ) : null}
    </AnimatePresence>
  );
}

export default SecretRevealScene;
