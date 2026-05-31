import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { KeyRound, Loader2, Sparkles, X } from 'lucide-react';
import { normalizeDisplayText } from '../utils/text.js';

const QUESTIONS = [
  {
    name: 'answer1',
    label: 'Câu hỏi một',
    prompt: 'Tráng miệng anh thích ăn gì nhất?',
  },
  {
    name: 'answer2',
    label: 'Câu hỏi hai',
    prompt: 'Trái cây gì anh ghét nhất?',
  },
];

const t = (value) => normalizeDisplayText(value);

function UnlockModal({ isOpen, onClose, onUnlocked }) {
  const titleId = useId();
  const descriptionId = useId();
  const firstInputRef = useRef(null);
  const phaseTimerRef = useRef(null);
  const successTimerRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const [answers, setAnswers] = useState({ answer1: '', answer2: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [letterPhase, setLetterPhase] = useState('sealed');
  const isLetterOpen = letterPhase === 'opened' || letterPhase === 'success';

  useEffect(() => {
    window.clearTimeout(phaseTimerRef.current);
    window.clearTimeout(successTimerRef.current);

    if (isOpen) {
      setLetterPhase('sealed');
      setError('');
      setIsSubmitting(false);
    }

    return () => {
      window.clearTimeout(phaseTimerRef.current);
      window.clearTimeout(successTimerRef.current);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isSubmitting && letterPhase !== 'success') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, letterPhase, onClose]);

  useEffect(() => {
    if (!isOpen || letterPhase !== 'opened') {
      return undefined;
    }

    const focusTimer = window.setTimeout(() => firstInputRef.current?.focus(), prefersReducedMotion ? 20 : 180);
    return () => window.clearTimeout(focusTimer);
  }, [isOpen, letterPhase, prefersReducedMotion]);

  const openEnvelope = () => {
    if (letterPhase !== 'sealed') {
      return;
    }

    setError('');
    setLetterPhase('opening');
    window.clearTimeout(phaseTimerRef.current);
    phaseTimerRef.current = window.setTimeout(() => {
      setLetterPhase('opened');
    }, prefersReducedMotion ? 40 : 950);
  };

  const updateAnswer = (event) => {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [event.target.name]: event.target.value,
    }));
  };

  const submitAnswers = async (event) => {
    event.preventDefault();

    if (letterPhase !== 'opened') {
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/unlock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(answers),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(t(result.message || 'Sai rồi, thử lại lần nữa nha em :)))'));
        return;
      }

      setLetterPhase('success');
      setAnswers({ answer1: '', answer2: '' });
      window.clearTimeout(successTimerRef.current);
      successTimerRef.current = window.setTimeout(() => {
        onUnlocked(result);
      }, prefersReducedMotion ? 80 : 720);
    } catch {
      setError(t('The secret lock could not be reached. Please try again in a moment.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="modal-backdrop secret-letter-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0.01 : 0.24 }}
          role="presentation"
        >
          <motion.div
            className={`secret-letter-stage ${letterPhase}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.96 }}
            transition={{ duration: prefersReducedMotion ? 0.01 : 0.32, ease: 'easeOut' }}
          >
            <button
              className="secret-letter-close"
              type="button"
              aria-label="Close secret letter"
              onClick={onClose}
              disabled={isSubmitting || letterPhase === 'success'}
            >
              <X size={18} aria-hidden="true" />
            </button>

            <AnimatePresence mode="wait">
              {!isLetterOpen ? (
                <motion.button
                  key="sealed-envelope"
                  className={`sealed-envelope ${letterPhase}`}
                  type="button"
                  onClick={openEnvelope}
                  disabled={letterPhase === 'opening'}
                  initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, rotateX: -6, y: 12 }}
                  animate={{ opacity: 1, rotateX: 0, y: 0 }}
                  exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -16, scale: 0.98 }}
                  transition={{ duration: prefersReducedMotion ? 0.01 : 0.42, ease: 'easeOut' }}
                  aria-labelledby={titleId}
                >
                  <span className="envelope-glow" aria-hidden="true" />
                  <span className="envelope-body" aria-hidden="true">
                    <span className="envelope-ornament top-left" />
                    <span className="envelope-ornament top-right" />
                    <span className="envelope-ornament bottom-left" />
                    <span className="envelope-ornament bottom-right" />
                    <span className="envelope-flap upper" />
                    <span className="envelope-flap lower" />
                    <span className="envelope-belt" />
                    <span className="wax-seal">
                      <Sparkles size={22} aria-hidden="true" />
                    </span>
                  </span>
                  <span className="envelope-copy">
                    <span id={titleId}>{t('Lá thư bí mật')}</span>
                    <small>{letterPhase === 'opening' ? t('Đang mở phong ấn...') : t('Chạm vào dấu sáp để mở')}</small>
                  </span>
                </motion.button>
              ) : (
                <motion.form
                  key="opened-letter"
                  className={`opened-secret-letter ${letterPhase}`}
                  onSubmit={submitAnswers}
                  initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 40, scaleY: 0.7 }}
                  animate={{ opacity: 1, y: 0, scaleY: 1 }}
                  exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -24, scale: 0.94 }}
                  transition={{ duration: prefersReducedMotion ? 0.01 : 0.58, ease: 'easeOut' }}
                >
                  <div className="opened-letter-seal" aria-hidden="true">
                    <Sparkles size={16} />
                  </div>
                  <div className="letter-fold top" aria-hidden="true" />
                  <div className="letter-fold bottom" aria-hidden="true" />

                  <div className="modal-heading">
                    <div>
                      <span className="modal-kicker">
                        <KeyRound size={16} aria-hidden="true" />
                        {t('Private birthday letter')}
                      </span>
                      <h2 id={titleId}>{t('Lá thư bí mật')}</h2>
                    </div>
                  </div>

                  <p id={descriptionId} className="modal-copy">
                    {t('Để mở lời nhắn được giấu trong quyển sách, em trả lời đúng 2 câu hỏi nhỏ này nha.')}
                  </p>
                  <div className="letter-rule" aria-hidden="true" />

                  <div className="question-stack">
                    {QUESTIONS.map((question, index) => (
                      <label className="question-field" key={question.name}>
                        <span>{t(question.label)}</span>
                        <strong>{t(question.prompt)}</strong>
                        <input
                          ref={index === 0 ? firstInputRef : undefined}
                          name={question.name}
                          type="text"
                          value={answers[question.name]}
                          onChange={updateAnswer}
                          autoComplete="off"
                          placeholder={t('Điền vào đây giúp tôi nha cô...')}
                          disabled={isSubmitting || letterPhase === 'success'}
                          required
                        />
                      </label>
                    ))}
                  </div>

                  <div className="modal-footer">
                    {error ? (
                      <p className="form-error ink-warning" role="alert">
                        {t(error)}
                      </p>
                    ) : (
                      <p className="form-note">{t('Có thể viết hoa hoặc thường, không có dấu nha em :)')}</p>
                    )}

                    <button className="submit-button letter-action" type="submit" disabled={isSubmitting || letterPhase === 'success'}>
                      {isSubmitting ? <Loader2 className="spin" size={18} aria-hidden="true" /> : <KeyRound size={18} aria-hidden="true" />}
                      {isSubmitting ? t('Đang kiểm tra') : letterPhase === 'success' ? t('Đã mở phong ấn') : t('Mở lời nhắn')}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default UnlockModal;
