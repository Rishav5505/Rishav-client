import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useSpring, useMotionValue } from 'framer-motion';
import Lenis from 'lenis';
import { profile } from '../data';
import { Icon, ease } from './ui';

/* ------------------------------------------------------------------ helpers */

export const toast = (msg) => window.dispatchEvent(new CustomEvent('app:toast', { detail: msg }));

export const lockScroll = (on) => {
  document.body.style.overflow = on ? 'hidden' : '';
  if (window.__lenis) on ? window.__lenis.stop() : window.__lenis.start();
};

export const onGamesPage = () => /^#\/(games|work|resume|lab)/.test(window.location.hash); // any sub-page

export const scrollToId = (id) => {
  if (id.startsWith('#/')) {
    window.location.hash = id;
    return;
  }
  const el = document.querySelector(id);
  if (!el) {
    // Section lives on the home page — switch route first, then scroll.
    if (onGamesPage()) {
      window.location.hash = id;
      setTimeout(() => scrollToId(id), 350);
    }
    return;
  }
  if (window.__lenis) {
    window.__lenis.resize(); // page height may have just changed (route switch)
    window.__lenis.scrollTo(el, { offset: id === '#top' ? 0 : -80, duration: 1.4 });
  }
  else el.scrollIntoView({ behavior: 'smooth' });
};

export async function copyEmail() {
  try {
    await navigator.clipboard.writeText(profile.email);
    toast('Email copied to clipboard ✨');
  } catch {
    window.location.href = `mailto:${profile.email}`;
  }
}

/** Lightweight confetti burst in the site's gradient colours. */
export function confetti() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c = document.createElement('canvas');
  Object.assign(c.style, { position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 120 });
  document.body.appendChild(c);
  const ctx = c.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  c.width = innerWidth * dpr;
  c.height = innerHeight * dpr;
  ctx.scale(dpr, dpr);
  const colors = ['#a78bfa', '#f472b6', '#fdba74', '#f0abfc', '#ffffff'];
  const parts = Array.from({ length: 160 }, () => ({
    x: innerWidth / 2,
    y: innerHeight * 0.7,
    vx: (Math.random() - 0.5) * 16,
    vy: -Math.random() * 18 - 6,
    r: Math.random() * 6 + 3,
    rot: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.3,
    c: colors[(Math.random() * colors.length) | 0],
    round: Math.random() > 0.5,
  }));
  const start = performance.now();
  const tick = (t) => {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    parts.forEach((p) => {
      p.vy += 0.45;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.c;
      if (p.round) {
        ctx.beginPath();
        ctx.arc(0, 0, p.r / 2, 0, Math.PI * 2);
        ctx.fill();
      } else ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2);
      ctx.restore();
    });
    if (t - start < 3200) requestAnimationFrame(tick);
    else c.remove();
  };
  requestAnimationFrame(tick);
}

/* ------------------------------------------------------------ smooth scroll */

export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    window.__lenis = lenis;
    let id;
    const raf = (t) => {
      lenis.raf(t);
      id = requestAnimationFrame(raf);
    };
    id = requestAnimationFrame(raf);

    const onClick = (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const href = a.getAttribute('href');
      if (href.length < 2 || href.startsWith('#/')) return; // route links change the hash natively
      e.preventDefault();
      scrollToId(href);
    };
    document.addEventListener('click', onClick);
    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener('click', onClick);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);
  return null;
}

/* ------------------------------------------------------------------- cursor */

export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState('');
  const [hover, setHover] = useState(false);
  const [down, setDown] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 350, damping: 30, mass: 0.6 });
  const ry = useSpring(y, { stiffness: 350, damping: 30, mass: 0.6 });

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    if (!fine) return;
    setEnabled(true);
    document.documentElement.classList.add('has-cursor');
    const move = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target instanceof Element ? e.target : null;
      const tagged = t?.closest('[data-cursor]');
      setLabel(tagged ? tagged.getAttribute('data-cursor') : '');
      setHover(!!t?.closest('a, button, input, textarea, [role="button"]'));
    };
    const d = () => setDown(true);
    const u = () => setDown(false);
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerdown', d);
    window.addEventListener('pointerup', u);
    return () => {
      document.documentElement.classList.remove('has-cursor');
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', d);
      window.removeEventListener('pointerup', u);
    };
  }, [x, y]);

  if (!enabled) return null;
  const size = label ? 84 : hover ? 52 : 34;

  return (
    <>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[130] grid place-items-center rounded-full"
        style={{
          x: rx,
          y: ry,
          translateX: '-50%',
          translateY: '-50%',
          background: label ? 'linear-gradient(135deg, var(--g1), var(--g2), var(--g3))' : 'transparent',
          border: label ? 'none' : '1px solid rgb(var(--fg-c) / 0.45)',
          mixBlendMode: label ? 'normal' : 'difference',
        }}
        animate={{ width: size, height: size, scale: down ? 0.85 : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <AnimatePresence>
          {label && (
            <motion.span
              key={label}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              className="text-[12px] font-semibold text-white"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[131] h-1.5 w-1.5 rounded-full bg-white"
        style={{ x, y, translateX: '-50%', translateY: '-50%', opacity: label ? 0 : 1 }}
      />
    </>
  );
}

/* ------------------------------------------------------------------- toasts */

export function Toaster() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    const on = (e) => {
      const id = Math.random();
      setItems((l) => [...l, { id, msg: e.detail }]);
      setTimeout(() => setItems((l) => l.filter((i) => i.id !== id)), 2600);
    };
    window.addEventListener('app:toast', on);
    return () => window.removeEventListener('app:toast', on);
  }, []);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[140] flex flex-col items-center gap-2" role="status" aria-live="polite">
      <AnimatePresence>
        {items.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.4, ease }}
            className="glass rounded-full !bg-ink-850/90 px-5 py-3 text-sm shadow-[0_20px_50px_-12px_rgba(244,114,182,0.5)]"
          >
            {t.msg}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------- back to top */

export function BackToTop() {
  const { scrollYProgress, scrollY } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 25 });
  const [show, setShow] = useState(false);
  useEffect(() => scrollY.on('change', (v) => setShow(v > 700)), [scrollY]);
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          onClick={() => scrollToId('#top')}
          className="glass fixed bottom-6 right-6 z-[45] grid h-14 w-14 place-items-center rounded-full !bg-ink-900/70"
          aria-label="Back to top"
          data-cursor="Top"
        >
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 56 56" aria-hidden="true">
            <defs>
              <linearGradient id="btt" x1="0" x2="1">
                <stop offset="0" stopColor="#a78bfa" />
                <stop offset="0.5" stopColor="#f472b6" />
                <stop offset="1" stopColor="#fdba74" />
              </linearGradient>
            </defs>
            <motion.circle cx="28" cy="28" r="26" fill="none" stroke="url(#btt)" strokeWidth="2" strokeLinecap="round" style={{ pathLength: progress }} />
          </svg>
          <span className="text-lg leading-none">↑</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/* ---------------------------------------------------------- command palette */

export function openPalette() {
  window.dispatchEvent(new Event('app:palette'));
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const input = useRef(null);

  const actions = useMemo(
    () => [
      { group: 'Navigate', label: 'Home', icon: 'spark', run: () => scrollToId('#top') },
      { group: 'Navigate', label: 'About me', icon: 'heart', run: () => scrollToId('#about') },
      { group: 'Navigate', label: 'Selected work', icon: 'layers', run: () => scrollToId('#work') },
      { group: 'Navigate', label: 'Services', icon: 'bolt', run: () => scrollToId('#services') },
      { group: 'Navigate', label: '3D project showcase', icon: 'layers', run: () => scrollToId('#showcase') },
      { group: 'Navigate', label: 'How I work', icon: 'server', run: () => scrollToId('#process') },
      { group: 'Navigate', label: 'Tech universe (3D)', icon: 'brain', run: () => scrollToId('#universe') },
      { group: 'Navigate', label: 'Journey', icon: 'server', run: () => scrollToId('#experience') },
      { group: 'Navigate', label: 'Credentials', icon: 'shield', run: () => scrollToId('#credentials') },
      { group: 'Pages', label: 'Online résumé', icon: 'layers', run: () => scrollToId('#/resume') },
      { group: 'Pages', label: 'AI Lab — interactive demos 🧪', icon: 'brain', run: () => scrollToId('#/lab') },
      { group: 'Pages', label: 'Games page — 25 games 🎮', icon: 'spark', run: () => scrollToId('#/games') },
      { group: 'Pages', label: 'Case study: CyberVigil', icon: 'layers', run: () => scrollToId('#/work/cybervigil') },
      { group: 'Navigate', label: 'Arcade (home section)', icon: 'spark', run: () => scrollToId('#arcade') },
      { group: 'Navigate', label: 'Contact', icon: 'pin', run: () => scrollToId('#contact') },
      { group: 'Actions', label: 'Toggle light / dark theme', icon: 'spark', run: () => toggleTheme() },
      { group: 'Actions', label: 'Open the terminal', icon: 'code', run: () => scrollToId('#terminal') },
      { group: 'Actions', label: 'Chat with Rishav-bot', icon: 'heart', run: () => window.dispatchEvent(new Event('app:chat')) },
      { group: 'Actions', label: 'Share portfolio / QR code', icon: 'spark', run: () => openShare() },
      { group: 'Actions', label: 'Toggle sound effects', icon: 'bolt', run: () => toggleSound() },
      { group: 'Actions', label: 'Keyboard shortcuts', icon: 'code', run: () => window.dispatchEvent(new Event('app:shortcuts')) },
      { group: 'Actions', label: 'Copy email address', icon: 'code', run: copyEmail },
      { group: 'Actions', label: 'Download résumé', icon: 'layers', run: () => { const a = document.createElement('a'); a.href = profile.resume; a.download = 'Rishav_Kumar_Resume.pdf'; a.click(); toast('Downloading résumé…'); } },
      { group: 'Actions', label: 'Send an email', icon: 'heart', run: () => (window.location.href = `mailto:${profile.email}`) },
      { group: 'Links', label: 'GitHub profile', icon: 'code', run: () => window.open(profile.github, '_blank', 'noopener') },
      { group: 'Links', label: 'LinkedIn profile', icon: 'spark', run: () => window.open(profile.linkedin, '_blank', 'noopener') },
    ],
    []
  );

  const list = actions.filter((a) => a.label.toLowerCase().includes(q.toLowerCase()));

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === 'Escape') setOpen(false);
    };
    const onOpen = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('app:palette', onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('app:palette', onOpen);
    };
  }, []);

  useEffect(() => {
    lockScroll(open);
    if (open) {
      setQ('');
      setSel(0);
      setTimeout(() => input.current?.focus(), 50);
    }
  }, [open]);

  const run = (a) => {
    setOpen(false);
    setTimeout(a.run, 120);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSel((s) => Math.min(s + 1, list.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSel((s) => Math.max(s - 1, 0));
    } else if (e.key === 'Enter' && list[sel]) run(list[sel]);
  };

  let lastGroup = '';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[110] flex items-start justify-center bg-black/60 px-4 pt-[14vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.35, ease }}
            className="spot w-full max-w-lg !bg-ink-850/95 shadow-[0_40px_120px_-20px_rgba(167,139,250,0.45)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-fg/10 px-5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-bone-muted" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                ref={input}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setSel(0);
                }}
                onKeyDown={onKeyDown}
                placeholder="Type a command or search…"
                className="h-14 flex-1 bg-transparent text-[15px] outline-none placeholder:text-bone-dim"
              />
              <kbd className="rounded-md border border-fg/10 px-1.5 py-0.5 font-mono text-[10px] text-bone-dim">ESC</kbd>
            </div>
            <ul className="max-h-[50vh] overflow-y-auto p-2" data-lenis-prevent>
              {list.length === 0 && <li className="px-3 py-8 text-center text-sm text-bone-muted">No results for “{q}”</li>}
              {list.map((a, i) => {
                const header = a.group !== lastGroup ? (lastGroup = a.group) : null;
                return (
                  <li key={a.label}>
                    {header && <p className="px-3 pb-1 pt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-bone-dim">{header}</p>}
                    <button
                      onMouseEnter={() => setSel(i)}
                      onClick={() => run(a)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                        sel === i ? 'bg-fg/[0.07] text-bone' : 'text-bone-muted'
                      }`}
                    >
                      <span
                        className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${sel === i ? 'text-white' : 'bg-fg/[0.04]'}`}
                        style={sel === i ? { background: 'linear-gradient(135deg, var(--g1), var(--g2))' } : undefined}
                      >
                        <Icon name={a.icon} className="h-4 w-4" />
                      </span>
                      <span className="flex-1">{a.label}</span>
                      {sel === i && <span className="font-mono text-[11px] text-bone-dim">↵</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="flex items-center justify-between border-t border-fg/10 px-5 py-3 font-mono text-[10px] text-bone-dim">
              <span>↑↓ navigate · ↵ select</span>
              <span className="text-gradient">Rishav Kumar</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


/* -------------------------------------------------------------------- theme */

export const isLight = () => document.documentElement.classList.contains('light');

export function setTheme(mode) {
  const root = document.documentElement;
  root.classList.add('theme-switching');
  root.classList.toggle('light', mode === 'light');
  try {
    localStorage.setItem('rk-theme', mode);
  } catch {}
  window.dispatchEvent(new CustomEvent('app:theme', { detail: mode }));
  setTimeout(() => root.classList.remove('theme-switching'), 600);
}

export const toggleTheme = () => setTheme(isLight() ? 'dark' : 'light');

export function useThemeMode() {
  const [mode, setMode] = useState(() => (typeof document !== 'undefined' && isLight() ? 'light' : 'dark'));
  useEffect(() => {
    const on = (e) => setMode(e.detail);
    window.addEventListener('app:theme', on);
    return () => window.removeEventListener('app:theme', on);
  }, []);
  return mode;
}

export function ThemeToggle({ className = '' }) {
  const mode = useThemeMode();
  const light = mode === 'light';
  return (
    <button
      onClick={toggleTheme}
      className={`glass relative grid h-10 w-10 place-items-center overflow-hidden rounded-full ${className}`}
      aria-label={light ? 'Switch to dark theme' : 'Switch to light theme'}
      data-cursor={light ? 'Dark' : 'Light'}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.svg
          key={mode}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          initial={{ y: 20, rotate: -90, opacity: 0 }}
          animate={{ y: 0, rotate: 0, opacity: 1 }}
          exit={{ y: -20, rotate: 90, opacity: 0 }}
          transition={{ duration: 0.35, ease }}
          aria-hidden="true"
        >
          {light ? (
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
          ) : (
            <>
              <circle cx="12" cy="12" r="4.5" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </>
          )}
        </motion.svg>
      </AnimatePresence>
    </button>
  );
}

/* -------------------------------------------------------------------- sound */
// Tiny synthesized UI sounds (no audio files). Off by default; the choice is remembered.

let audioCtx = null;
const soundOn = () => {
  try {
    return localStorage.getItem('rk-sound') === 'on';
  } catch {
    return false;
  }
};

export function playSound(kind = 'tick') {
  if (!soundOn()) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const t = audioCtx.currentTime;
    const notes = { tick: [[880, 0]], pop: [[660, 0], [990, 0.06]], chime: [[784, 0], [988, 0.08], [1319, 0.16]] }[kind] || [[880, 0]];
    notes.forEach(([f, d]) => {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(f, t + d);
      o.frequency.exponentialRampToValueAtTime(f * 0.7, t + d + 0.12);
      g.gain.setValueAtTime(0.0001, t + d);
      g.gain.exponentialRampToValueAtTime(kind === 'tick' ? 0.035 : 0.05, t + d + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.18);
      o.connect(g).connect(audioCtx.destination);
      o.start(t + d);
      o.stop(t + d + 0.2);
    });
  } catch {}
}

export function setSound(on) {
  try {
    localStorage.setItem('rk-sound', on ? 'on' : 'off');
  } catch {}
  window.dispatchEvent(new CustomEvent('app:sound', { detail: on }));
  if (on) playSound('chime');
  toast(on ? 'Sound on 🔊' : 'Sound off 🔇');
}
export const toggleSound = () => setSound(!soundOn());

export function useSoundOn() {
  const [on, setOn] = useState(soundOn);
  useEffect(() => {
    const h = (e) => setOn(e.detail);
    window.addEventListener('app:sound', h);
    return () => window.removeEventListener('app:sound', h);
  }, []);
  return on;
}

/** Plays a soft tick on every button / link / tab click when sound is on. */
export function UISounds() {
  useEffect(() => {
    const on = (e) => {
      if (e.target instanceof Element && e.target.closest('button, a, [role="tab"]')) playSound('tick');
    };
    document.addEventListener('pointerdown', on);
    return () => document.removeEventListener('pointerdown', on);
  }, []);
  return null;
}

export function SoundToggle({ className = '' }) {
  const on = useSoundOn();
  return (
    <button onClick={toggleSound} className={`inline-flex items-center gap-2 ${className}`} aria-pressed={on} aria-label={on ? 'Turn sound off' : 'Turn sound on'}>
      <span className="flex h-3 items-end gap-[2px]" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <motion.span
            key={i}
            className="w-[2px] rounded-full bg-current"
            animate={on ? { height: ['30%', '100%', '45%', '80%', '30%'] } : { height: '30%' }}
            transition={on ? { duration: 1, repeat: Infinity, delay: i * 0.12 } : { duration: 0.3 }}
          />
        ))}
      </span>
      Sound {on ? 'on' : 'off'}
    </button>
  );
}

/* ------------------------------------------------------------- share + QR */

export const openShare = () => window.dispatchEvent(new Event('app:share'));

export function ShareModal() {
  const [open, setOpen] = useState(false);
  const [svg, setSvg] = useState('');
  const url = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';

  useEffect(() => {
    const on = () => setOpen(true);
    window.addEventListener('app:share', on);
    return () => window.removeEventListener('app:share', on);
  }, []);

  useEffect(() => {
    lockScroll(open);
    if (!open || svg) return;
    import('qrcode-generator').then(({ default: qrcode }) => {
      const qr = qrcode(0, 'M');
      qr.addData(url);
      qr.make();
      setSvg(qr.createSvgTag({ cellSize: 6, margin: 2, scalable: true }));
    });
  }, [open, svg, url]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast('Link copied ✨');
    } catch {}
  };
  const nativeShare = async () => {
    try {
      await navigator.share({ title: `${profile.name} — ${profile.role}`, text: 'Have a look at my portfolio', url });
    } catch {}
  };
  const wa = `https://wa.me/?text=${encodeURIComponent(`${profile.name} — ${profile.role}\n${url}`)}`;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[110] grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Share this portfolio"
            initial={{ y: 30, scale: 0.95, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.45, ease }}
            className="spot w-full max-w-sm !bg-ink-850/95 p-7 text-center"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
          >
            <p className="eyebrow">Share</p>
            <h3 className="mt-3 text-2xl font-medium tracking-tight">
              Scan to open on <span className="text-gradient font-serif italic">your phone</span>
            </h3>
            <div className="relative mx-auto mt-6 w-56 rounded-3xl p-[2px]">
              <div className="ring-spin !rounded-3xl" />
              <div className="relative rounded-[22px] bg-white p-3">
                {svg ? (
                  <div className="aspect-square w-full [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} />
                ) : (
                  <div className="aspect-square w-full animate-pulse rounded-xl bg-neutral-200" />
                )}
              </div>
            </div>
            <p className="mt-4 truncate font-mono text-[12px] text-bone-muted">{url}</p>
            <div className="mt-6 grid grid-cols-3 gap-2">
              <button onClick={copy} className="btn-ghost !px-3 !py-2.5 text-[13px]">Copy link</button>
              <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-ghost !px-3 !py-2.5 text-[13px]">WhatsApp</a>
              {typeof navigator !== 'undefined' && navigator.share ? (
                <button onClick={nativeShare} className="btn-primary !px-3 !py-2.5 text-[13px]">Share…</button>
              ) : (
                <button onClick={() => setOpen(false)} className="btn-primary !px-3 !py-2.5 text-[13px]">Done</button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------ shortcuts + easter egg */

const shortcuts = [
  ['Ctrl / ⌘ + K', 'Open quick menu'],
  ['T', 'Toggle light / dark theme'],
  ['S', 'Toggle sound'],
  ['C', 'Chat with Rishav-bot'],
  ['/', 'Jump to the terminal'],
  ['Q', 'Share / QR code'],
  ['?', 'Show this help'],
  ['↑↑↓↓←→←→ B A', 'Secret… 🎮'],
];

export function Shortcuts() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const konami = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
    let pos = 0;
    const onKey = (e) => {
      if (document.documentElement.classList.contains('game-open')) return; // a game owns the keyboard
      const typing = e.target instanceof Element && e.target.closest('input, textarea, [contenteditable="true"]');
      const key = e.key.toLowerCase();
      // Konami code works anywhere except while typing
      if (!typing) {
        pos = key === konami[pos] ? pos + 1 : key === konami[0] ? 1 : 0;
        if (pos === konami.length) {
          pos = 0;
          confetti();
          setTimeout(confetti, 450);
          playSound('chime');
          document.documentElement.classList.add('party');
          setTimeout(() => document.documentElement.classList.remove('party'), 6000);
          toast('🎮 Konami unlocked — party mode!');
          return;
        }
      }
      if (typing || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === '?') setOpen((o) => !o);
      else if (e.key === 'Escape') setOpen(false);
      else if (key === 't') toggleTheme();
      else if (key === 's') toggleSound();
      else if (key === 'c') window.dispatchEvent(new Event('app:chat'));
      else if (key === 'q') openShare();
      else if (e.key === '/') {
        e.preventDefault();
        scrollToId('#terminal');
        setTimeout(() => document.querySelector('[aria-label="Terminal input"]')?.focus({ preventScroll: true }), 900);
      }
    };
    window.addEventListener('keydown', onKey);
    const onOpen = () => setOpen(true);
    window.addEventListener('app:shortcuts', onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('app:shortcuts', onOpen);
    };
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[110] grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Keyboard shortcuts"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ duration: 0.4, ease }}
            className="spot w-full max-w-md !bg-ink-850/95 p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="eyebrow">Keyboard</p>
            <h3 className="mt-3 text-2xl font-medium tracking-tight">
              Shortcuts <span className="text-gradient font-serif italic">for power users</span>
            </h3>
            <ul className="mt-6 divide-y divide-fg/[0.08]">
              {shortcuts.map(([k, d]) => (
                <li key={k} className="flex items-center justify-between gap-4 py-3 text-[14px]">
                  <span className="text-bone-muted">{d}</span>
                  <kbd className="rounded-lg border border-fg/15 bg-fg/[0.05] px-2.5 py-1 font-mono text-[12px]">{k}</kbd>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-center text-[12px] text-bone-dim">Press ? anytime · Esc to close</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
