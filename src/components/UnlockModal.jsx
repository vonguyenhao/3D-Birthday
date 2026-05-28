import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { KeyRound, Loader2, X } from 'lucide-react';

const QUESTIONS = [
  {
    name: 'answer1',
    label: 'Question one',
    prompt: 'Tráng miệng anh thích ăn gì nhất?',
  },
  {
    name: 'answer2',
    label: 'Question two',
    prompt: 'Trái cây gì anh ghét nhất?',
  },
];

function UnlockModal({ isOpen, onClose, onUnlocked }) {
  const titleId = useId();
  const descriptionId = useId();
  const firstInputRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const [answers, setAnswers] = useState({ answer1: '', answer2: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const focusTimer = window.setTimeout(() => firstInputRef.current?.focus(), 80);
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isSubmitting, onClose]);

  useEffect(() => {
    if (isOpen) {
      setError('');
    }
  }, [isOpen]);

  const updateAnswer = (event) => {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [event.target.name]: event.target.value,
    }));
  };

  const submitAnswers = async (event) => {
    event.preventDefault();
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
        setError(result.message || 'Sai rồi, thử lại lần nữa nha em :)))');
        return;
      }

      onUnlocked(result);
      setAnswers({ answer1: '', answer2: '' });
    } catch {
      setError('The secret lock could not be reached. Please try again in a moment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0.01 : 0.2 }}
          role="presentation"
        >
          <motion.form
            className="unlock-modal"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            role="dialog"
            aria-modal="true"
            onSubmit={submitAnswers}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: prefersReducedMotion ? 0.01 : 0.25, ease: 'easeOut' }}
          >
            <div className="modal-heading">
              <div>
                <span className="modal-kicker">
                  <KeyRound size={16} aria-hidden="true" />
                  Private birthday message
                </span>
                <h2 id={titleId}>Unlock the secret message</h2>
              </div>

              <button
                className="icon-button"
                type="button"
                aria-label="Close unlock form"
                onClick={onClose}
                disabled={isSubmitting}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <p id={descriptionId} className="modal-copy">
              Để mở được trang bí mật này, em cần trả lời đúng 2 câu hỏi dưới đây. Vì đây là trang bí mật anh gửi em nên câu hỏi sẽ xoay quanh anh nha!
            </p>

            <div className="question-stack">
              {QUESTIONS.map((question, index) => (
                <label className="question-field" key={question.name}>
                  <span>{question.label}</span>
                  <strong>{question.prompt}</strong>
                  <input
                    ref={index === 0 ? firstInputRef : undefined}
                    name={question.name}
                    type="text"
                    value={answers[question.name]}
                    onChange={updateAnswer}
                    autoComplete="off"
                    required
                  />
                </label>
              ))}
            </div>

            <div className="modal-footer">
              {error ? (
                <p className="form-error" role="alert">
                  {error}
                </p>
              ) : (
                <p className="form-note">Có thể viết hoa hoặc thường, không có dấu nha em</p>
              )}

              <button className="submit-button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="spin" size={18} aria-hidden="true" /> : <KeyRound size={18} aria-hidden="true" />}
                {isSubmitting ? 'Checking answers' : 'Reveal message'}
              </button>
            </div>
          </motion.form>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default UnlockModal;
