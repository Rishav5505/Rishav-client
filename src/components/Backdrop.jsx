import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ease } from './ui';

/** Aurora blobs, fading grid and a soft light that follows the cursor. */
export function Backdrop() {
  useEffect(() => {
    let raf = 0;
    const onMove = (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--mx', `${e.clientX}px`);
        document.documentElement.style.setProperty('--my', `${e.clientY}px`);
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div className="aurora" aria-hidden="true">
        <span className="a1" />
        <span className="a2" />
        <span className="a3" />
      </div>
      <div className="grid-bg" aria-hidden="true" />
      <div className="cursor-light" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
    </>
  );
}

/** A short, sweet intro: the name writes itself in, then the curtain lifts. */
export function Intro() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShow(false), 1700);
    return () => clearTimeout(t);
  }, []);

  const name = 'Rishav Kumar';
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] grid place-items-center bg-ink-900"
          exit={{ y: '-100%' }}
          transition={{ duration: 0.9, ease }}
          aria-hidden="true"
        >
          <div className="text-center">
            <p className="text-[clamp(2.5rem,8vw,5rem)] font-medium tracking-tightest">
              {name.split('').map((c, i) => (
                <motion.span
                  key={i}
                  className="inline-block"
                  initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.6, ease, delay: 0.05 + i * 0.045 }}
                >
                  {c === ' ' ? ' ' : c}
                </motion.span>
              ))}
            </p>
            <motion.div
              className="mx-auto mt-5 h-[2px] w-40 origin-left rounded-full"
              style={{ background: 'linear-gradient(90deg, var(--g1), var(--g2), var(--g3))' }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.1, ease, delay: 0.3 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
