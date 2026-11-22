import { useCallback, useEffect, useRef, useState } from 'react';
import { confetti, playSound, toast } from '../components/Extras';

/* Scores live in localStorage; every access is guarded (private mode etc.). */
export const read = (k) => {
  try {
    const v = localStorage.getItem(`rk-game-${k}`);
    return v === null ? null : Number(v);
  } catch {
    return null;
  }
};
export const write = (k, v) => {
  try {
    localStorage.setItem(`rk-game-${k}`, String(v));
  } catch {}
};

/** Best score per game. `lower` = lower is better (e.g. reaction time). */
export function useBest(key, lower = false) {
  const [best, setBest] = useState(() => read(key));
  useEffect(() => setBest(read(key)), [key]);
  const submit = useCallback(
    (score) => {
      const prev = read(key);
      const better = prev === null || (lower ? score < prev : score > prev);
      if (better) {
        write(key, score);
        setBest(score);
        window.dispatchEvent(new Event('app:best'));
        if (prev !== null) {
          confetti();
          playSound('chime');
          toast('🏆 New personal best!');
        }
      }
      return better;
    },
    [key, lower]
  );
  return [best, submit];
}

export const btn = 'btn-primary !px-6 !py-3 text-[14px]';
export const ghost = 'btn-ghost !px-5 !py-2.5 text-[13px]';

export function Stat({ label, value }) {
  return (
    <div className="glass min-w-[76px] rounded-2xl px-4 py-2.5 text-center">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone-dim">{label}</p>
      <p className="text-xl font-medium tabular-nums">{value}</p>
    </div>
  );
}

export function Stats({ children }) {
  return <div className="mb-5 flex flex-wrap justify-center gap-2.5">{children}</div>;
}

export function Result({ children }) {
  return <p className="mb-3 text-lg">{children}</p>;
}

export const G = ({ children }) => <span className="text-gradient font-semibold">{children}</span>;

export const shuffle = (a) => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};

export const rand = (a, b) => a + Math.random() * (b - a);
export const randInt = (a, b) => Math.floor(rand(a, b + 1));

/** Countdown that calls onEnd once when it reaches zero. */
export function useCountdown(seconds, running, onEnd) {
  const [t, setT] = useState(seconds);
  const end = useRef(onEnd);
  end.current = onEnd;
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setT((x) => x - 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  useEffect(() => {
    if (running && t <= 0) end.current();
  }, [t, running]);
  return [Math.max(0, t), () => setT(seconds)];
}

/** Gradient colours of the active theme, for canvas games. */
export const themeColors = () => {
  const cs = getComputedStyle(document.documentElement);
  const g = (v, f) => cs.getPropertyValue(v).trim() || f;
  const rgb = (v, f) => {
    const raw = cs.getPropertyValue(v).trim();
    return raw ? `rgb(${raw.split(' ').join(',')})` : f;
  };
  return {
    g1: g('--g1', '#a78bfa'),
    g2: g('--g2', '#f472b6'),
    g3: g('--g3', '#fdba74'),
    fg: rgb('--bone', '#f1eef6'),
    muted: rgb('--bone-muted', '#a19cae'),
    bg: rgb('--ink-800', '#15121e'),
  };
};

/** Canvas helper: sets up DPR scaling and runs `frame(ctx, dt)` while `running`. */
export function useCanvasLoop(ref, w, h, running, frame) {
  const f = useRef(frame);
  f.current = frame;
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = w * dpr;
    cv.height = h * dpr;
    const ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    let raf;
    let last = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      f.current(ctx, dt);
      if (running) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [ref, w, h, running]);
}

export function GameCanvas({ canvasRef, w, h, ...rest }) {
  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', maxWidth: w, aspectRatio: `${w} / ${h}` }}
      className="mx-auto block touch-none rounded-2xl border border-fg/10 bg-ink-800"
      {...rest}
    />
  );
}

/** Pointer x (0..w) inside a canvas regardless of its CSS size. */
export const canvasPoint = (e, cv, w, h) => {
  const r = cv.getBoundingClientRect();
  return { x: ((e.clientX - r.left) / r.width) * w, y: ((e.clientY - r.top) / r.height) * h };
};

export const rr = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h);
};
