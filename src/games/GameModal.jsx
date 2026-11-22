import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { lockScroll } from '../components/Extras';
import { ease } from '../components/ui';

export default function GameModal({ game, onClose, onNext }) {
  useEffect(() => {
    lockScroll(true);
    // Lets global keyboard shortcuts stand down while a game owns the keyboard.
    document.documentElement.classList.add('game-open');
    const k = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => {
      lockScroll(false);
      document.documentElement.classList.remove('game-open');
      window.removeEventListener('keydown', k);
    };
  }, [onClose]);

  const G = game.C;
  return (
    <motion.div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-2 backdrop-blur-md sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={game.title}
        initial={{ y: 40, scale: 0.94, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 30, scale: 0.96, opacity: 0 }}
        transition={{ duration: 0.5, ease }}
        className="spot max-h-[96dvh] w-full max-w-xl overflow-y-auto !bg-ink-850/95 p-4 sm:p-7"
        onClick={(e) => e.stopPropagation()}
        data-lenis-prevent
      >
        <div className="mb-5 flex items-center gap-3 sm:gap-4">
          <span
            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-2xl shadow-[0_10px_30px_-10px_rgba(244,114,182,0.7)]"
            style={{ background: 'linear-gradient(135deg, var(--g1), var(--g2), var(--g3))' }}
          >
            {game.icon}
          </span>
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate text-xl font-medium tracking-tight">{game.title}</p>
            <p className="truncate text-[13px] text-bone-muted">{game.tag}</p>
          </div>
          {onNext && (
            <button onClick={onNext} className="hidden rounded-full border border-fg/15 px-3 py-2 text-[12px] text-bone-muted hover:text-bone sm:block">
              Next game →
            </button>
          )}
          <button onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-fg/15 hover:bg-fg/5" aria-label="Close game">
            ✕
          </button>
        </div>
        <G />
      </motion.div>
    </motion.div>
  );
}
