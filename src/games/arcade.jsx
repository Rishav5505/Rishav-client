import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { playSound } from '../components/Extras';
import { G, GameCanvas, Result, Stat, Stats, btn, canvasPoint, rand, rr, themeColors, useBest, useCanvasLoop, useCountdown } from './shared';

/** Arrow / WASD keys → direction while `active`. Prevents page scrolling. */
function useKeys(active, onKey) {
  const cb = useRef(onKey);
  cb.current = onKey;
  useEffect(() => {
    if (!active) return;
    const map = { arrowup: 'u', w: 'u', arrowdown: 'd', s: 'd', arrowleft: 'l', a: 'l', arrowright: 'r', d: 'r', ' ': 'space' };
    const down = (e) => {
      const k = map[e.key.toLowerCase()];
      if (!k) return;
      e.preventDefault();
      e.stopPropagation();
      cb.current(k, true);
    };
    const up = (e) => {
      const k = map[e.key.toLowerCase()];
      if (k) cb.current(k, false);
    };
    window.addEventListener('keydown', down, true);
    window.addEventListener('keyup', up, true);
    return () => {
      window.removeEventListener('keydown', down, true);
      window.removeEventListener('keyup', up, true);
    };
  }, [active]);
}

function Overlay({ state, onStart, children, hint }) {
  return (
    <AnimatePresence>
      {state !== 'play' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-ink-900/75 p-6 text-center backdrop-blur-sm"
        >
          {state === 'over' && children}
          {hint && state === 'idle' && <p className="mb-4 max-w-[260px] text-[14px] text-bone-muted">{hint}</p>}
          <button className={btn} onClick={onStart}>
            {state === 'over' ? 'Play again' : '▶ Start'}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ----------------------------------------------------------- Data Stream */
// Guide a stream of data around the grid, collecting packets. Don't hit the walls or yourself.

const N = 18;
const CELL = 20;
const DS = N * CELL;

export function DataStream() {
  const [best, submit] = useBest('stream');
  const [state, setState] = useState('idle');
  const [score, setScore] = useState(0);
  const cv = useRef(null);
  const g = useRef(null);
  const swipe = useRef(null);

  const reset = () => {
    g.current = {
      body: [{ x: 8, y: 9 }, { x: 7, y: 9 }, { x: 6, y: 9 }],
      dir: { x: 1, y: 0 },
      next: { x: 1, y: 0 },
      food: { x: 13, y: 9 },
      acc: 0,
      step: 0.13,
      t: 0,
      score: 0,
      c: themeColors(),
    };
    setScore(0);
    setState('play');
  };

  const turn = (k) => {
    const s = g.current;
    if (!s) return;
    const d = { u: { x: 0, y: -1 }, d: { x: 0, y: 1 }, l: { x: -1, y: 0 }, r: { x: 1, y: 0 } }[k];
    if (d && (d.x !== -s.dir.x || d.y !== -s.dir.y)) s.next = d;
  };
  useKeys(state === 'play', (k, down) => down && turn(k));

  const placeFood = (s) => {
    let f;
    do f = { x: Math.floor(Math.random() * N), y: Math.floor(Math.random() * N) };
    while (s.body.some((b) => b.x === f.x && b.y === f.y));
    s.food = f;
  };

  useCanvasLoop(cv, DS, DS, state === 'play', (ctx, dt) => {
    const s = g.current;
    const c = s?.c || themeColors();
    if (s && state === 'play' && !s.dead) {
      s.t += dt;
      s.acc += dt;
      while (s.acc >= s.step) {
        s.acc -= s.step;
        s.dir = s.next;
        const h = { x: s.body[0].x + s.dir.x, y: s.body[0].y + s.dir.y };
        if (h.x < 0 || h.y < 0 || h.x >= N || h.y >= N || s.body.some((b) => b.x === h.x && b.y === h.y)) {
          s.dead = true;
          setState('over');
          submit(s.score);
          playSound('tick');
          break;
        }
        s.body.unshift(h);
        if (h.x === s.food.x && h.y === s.food.y) {
          s.score += 1;
          setScore(s.score);
          s.step = Math.max(0.065, s.step - 0.003);
          placeFood(s);
          playSound('pop');
        } else s.body.pop();
      }
    }
    // draw
    ctx.clearRect(0, 0, DS, DS);
    ctx.fillStyle = c.muted;
    ctx.globalAlpha = 0.12;
    for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) ctx.fillRect(x * CELL + CELL / 2 - 1, y * CELL + CELL / 2 - 1, 2, 2);
    ctx.globalAlpha = 1;
    if (!s) return;
    const pulse = 0.75 + Math.sin(s.t * 6) * 0.25;
    ctx.shadowColor = c.g3;
    ctx.shadowBlur = 14;
    ctx.fillStyle = c.g3;
    ctx.beginPath();
    ctx.arc(s.food.x * CELL + CELL / 2, s.food.y * CELL + CELL / 2, (CELL / 2.6) * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 10;
    s.body.forEach((b, i) => {
      ctx.fillStyle = i === 0 ? c.g2 : i % 2 ? c.g1 : c.g2;
      ctx.shadowColor = ctx.fillStyle;
      ctx.globalAlpha = 1 - (i / s.body.length) * 0.5;
      rr(ctx, b.x * CELL + 2, b.y * CELL + 2, CELL - 4, CELL - 4, 5);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  });

  const pad = (k, label) => (
    <button onPointerDown={() => turn(k)} className="glass grid h-12 w-12 place-items-center rounded-xl text-lg active:scale-90" aria-label={`Move ${label}`}>
      {{ u: '↑', d: '↓', l: '←', r: '→' }[k]}
    </button>
  );

  return (
    <div className="text-center">
      <Stats>
        <Stat label="Packets" value={score} />
        <Stat label="Best" value={best ?? '—'} />
      </Stats>
      <div className="relative mx-auto" style={{ maxWidth: DS }}>
        <GameCanvas
          canvasRef={cv}
          w={DS}
          h={DS}
          onPointerDown={(e) => (swipe.current = { x: e.clientX, y: e.clientY })}
          onPointerUp={(e) => {
            if (!swipe.current) return;
            const dx = e.clientX - swipe.current.x;
            const dy = e.clientY - swipe.current.y;
            if (Math.max(Math.abs(dx), Math.abs(dy)) > 20) turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'r' : 'l') : dy > 0 ? 'd' : 'u');
            swipe.current = null;
          }}
        />
        <Overlay state={state} onStart={reset} hint="Arrow keys / WASD, or swipe. Collect the glowing packets!">
          <Result>
            Stream crashed after <G>{score}</G> packets 💥
          </Result>
        </Overlay>
      </div>
      <div className="mt-4 flex flex-col items-center gap-1.5 sm:hidden">
        {pad('u', 'up')}
        <div className="flex gap-1.5">
          {pad('l', 'left')}
          {pad('d', 'down')}
          {pad('r', 'right')}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------- Packet Catcher */

const PW = 360;
const PH = 480;

export function PacketCatcher() {
  const [best, submit] = useBest('catcher');
  const [state, setState] = useState('idle');
  const [hud, setHud] = useState({ score: 0, lives: 3 });
  const cv = useRef(null);
  const g = useRef(null);
  const keys = useRef({});

  const reset = () => {
    g.current = { x: PW / 2, items: [], spawn: 0, t: 0, score: 0, lives: 3, c: themeColors() };
    setHud({ score: 0, lives: 3 });
    setState('play');
  };
  useKeys(state === 'play', (k, down) => (keys.current[k] = down));

  useCanvasLoop(cv, PW, PH, state === 'play', (ctx, dt) => {
    const s = g.current;
    const c = s?.c || themeColors();
    ctx.clearRect(0, 0, PW, PH);
    if (!s) return;
    if (state === 'play' && !s.dead) {
      s.t += dt;
      if (keys.current.l) s.x -= 380 * dt;
      if (keys.current.r) s.x += 380 * dt;
      s.x = Math.max(45, Math.min(PW - 45, s.x));
      s.spawn -= dt;
      if (s.spawn <= 0) {
        s.spawn = Math.max(0.35, 0.9 - s.t * 0.012);
        s.items.push({ x: rand(20, PW - 20), y: -20, v: rand(140, 200) + s.t * 4, bad: Math.random() < 0.22 });
      }
      for (const it of s.items) it.y += it.v * dt;
      s.items = s.items.filter((it) => {
        if (it.y > PH - 44 && it.y < PH - 14 && Math.abs(it.x - s.x) < 52) {
          if (it.bad) {
            s.lives -= 1;
            playSound('tick');
          } else {
            s.score += 1;
            playSound('pop');
          }
          setHud({ score: s.score, lives: s.lives });
          return false;
        }
        return it.y < PH + 20;
      });
      if (s.lives <= 0) {
        s.dead = true;
        setState('over');
        submit(s.score);
      }
    }
    for (const it of s.items) {
      ctx.font = '24px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (it.bad) ctx.fillText('👾', it.x, it.y);
      else {
        ctx.fillStyle = c.g1;
        ctx.shadowColor = c.g2;
        ctx.shadowBlur = 12;
        rr(ctx, it.x - 11, it.y - 11, 22, 22, 6);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('01', it.x, it.y + 1);
      }
    }
    const grad = ctx.createLinearGradient(s.x - 45, 0, s.x + 45, 0);
    grad.addColorStop(0, c.g1);
    grad.addColorStop(0.5, c.g2);
    grad.addColorStop(1, c.g3);
    ctx.fillStyle = grad;
    ctx.shadowColor = c.g2;
    ctx.shadowBlur = 18;
    rr(ctx, s.x - 45, PH - 30, 90, 14, 7);
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  const move = (e) => {
    if (state !== 'play' || !g.current) return;
    g.current.x = canvasPoint(e, cv.current, PW, PH).x;
  };

  return (
    <div className="text-center">
      <Stats>
        <Stat label="Caught" value={hud.score} />
        <Stat label="Lives" value={'❤️'.repeat(Math.max(0, hud.lives)) || '—'} />
        <Stat label="Best" value={best ?? '—'} />
      </Stats>
      <div className="relative mx-auto" style={{ maxWidth: PW }}>
        <GameCanvas canvasRef={cv} w={PW} h={PH} onPointerMove={move} onPointerDown={move} />
        <Overlay state={state} onStart={reset} hint="Move with mouse, finger or ← →. Catch data packets, dodge the 👾 viruses.">
          <Result>
            You caught <G>{hud.score}</G> packets 📦
          </Result>
        </Overlay>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- Orbit Dodge */

export function OrbitDodge() {
  const [best, submit] = useBest('dodge');
  const [state, setState] = useState('idle');
  const [score, setScore] = useState(0);
  const cv = useRef(null);
  const g = useRef(null);
  const keys = useRef({});

  const reset = () => {
    g.current = {
      x: PW / 2,
      rocks: [],
      stars: Array.from({ length: 50 }, () => ({ x: rand(0, PW), y: rand(0, PH), s: rand(0.5, 2) })),
      spawn: 0,
      t: 0,
      c: themeColors(),
    };
    setScore(0);
    setState('play');
  };
  useKeys(state === 'play', (k, down) => (keys.current[k] = down));

  useCanvasLoop(cv, PW, PH, state === 'play', (ctx, dt) => {
    const s = g.current;
    const c = s?.c || themeColors();
    ctx.clearRect(0, 0, PW, PH);
    if (!s) return;
    if (state === 'play' && !s.dead) {
      s.t += dt;
      if (keys.current.l) s.x -= 320 * dt;
      if (keys.current.r) s.x += 320 * dt;
      s.x = Math.max(16, Math.min(PW - 16, s.x));
      s.spawn -= dt;
      if (s.spawn <= 0) {
        s.spawn = Math.max(0.18, 0.7 - s.t * 0.015);
        s.rocks.push({ x: rand(10, PW - 10), y: -30, r: rand(9, 22), v: rand(150, 230) + s.t * 6, rot: rand(0, 6) });
      }
      for (const r of s.rocks) {
        r.y += r.v * dt;
        r.rot += dt * 2;
        if (!s.dead && Math.hypot(r.x - s.x, r.y - (PH - 50)) < r.r + 11) {
          s.dead = true;
          const pts = Math.floor(s.t * 10);
          setScore(pts);
          setState('over');
          submit(pts);
          playSound('tick');
        }
      }
      s.rocks = s.rocks.filter((r) => r.y < PH + 40);
      if (!s.dead) setScore(Math.floor(s.t * 10));
    }
    for (const st of s.stars) {
      st.y += st.s * 40 * dt;
      if (st.y > PH) st.y = 0;
      ctx.fillStyle = c.muted;
      ctx.globalAlpha = 0.3 + st.s * 0.2;
      ctx.fillRect(st.x, st.y, st.s, st.s);
    }
    ctx.globalAlpha = 1;
    for (const r of s.rocks) {
      ctx.save();
      ctx.translate(r.x, r.y);
      ctx.rotate(r.rot);
      ctx.fillStyle = c.g3;
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2;
        const rad = r.r * (0.75 + ((i * 37) % 10) / 40);
        ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    // ship
    ctx.save();
    ctx.translate(s.x, PH - 50);
    ctx.shadowColor = c.g2;
    ctx.shadowBlur = 20;
    const grad = ctx.createLinearGradient(0, -16, 0, 16);
    grad.addColorStop(0, c.g1);
    grad.addColorStop(1, c.g2);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.lineTo(13, 14);
    ctx.lineTo(0, 7);
    ctx.lineTo(-13, 14);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = c.g3;
    ctx.globalAlpha = 0.6 + Math.random() * 0.4;
    ctx.beginPath();
    ctx.moveTo(-5, 12);
    ctx.lineTo(0, 22 + Math.random() * 6);
    ctx.lineTo(5, 12);
    ctx.fill();
    ctx.restore();
  });

  const move = (e) => {
    if (state !== 'play' || !g.current) return;
    g.current.x = canvasPoint(e, cv.current, PW, PH).x;
  };

  return (
    <div className="text-center">
      <Stats>
        <Stat label="Distance" value={score} />
        <Stat label="Best" value={best ?? '—'} />
      </Stats>
      <div className="relative mx-auto" style={{ maxWidth: PW }}>
        <GameCanvas canvasRef={cv} w={PW} h={PH} onPointerMove={move} onPointerDown={move} />
        <Overlay state={state} onStart={reset} hint="Steer with mouse, finger or ← →. Survive the asteroid field as long as you can.">
          <Result>
            You flew <G>{score}</G> light-units 🚀
          </Result>
        </Overlay>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- Aim Trainer */

export function AimTrainer() {
  const [best, submit] = useBest('aim');
  const [state, setState] = useState('idle');
  const [hits, setHits] = useState(0);
  const [miss, setMiss] = useState(0);
  const [target, setTarget] = useState(null);
  const hitsRef = useRef(0);

  const spawn = useCallback(() => setTarget({ id: Math.random(), x: rand(8, 92), y: rand(10, 90), s: rand(44, 66) }), []);
  const [time, resetTime] = useCountdown(30, state === 'play', () => {
    setState('over');
    setTarget(null);
    submit(hitsRef.current);
  });

  useEffect(() => {
    if (state !== 'play' || !target) return;
    const t = setTimeout(spawn, 1100);
    return () => clearTimeout(t);
  }, [target, state, spawn]);

  const start = () => {
    hitsRef.current = 0;
    setHits(0);
    setMiss(0);
    resetTime();
    setState('play');
    spawn();
  };

  const acc = hits + miss ? Math.round((hits / (hits + miss)) * 100) : 100;

  return (
    <div className="text-center">
      <Stats>
        <Stat label="Hits" value={hits} />
        <Stat label="Accuracy" value={`${acc}%`} />
        <Stat label="Time" value={`${time}s`} />
        <Stat label="Best" value={best ?? '—'} />
      </Stats>
      <div
        className="relative mx-auto h-[360px] max-w-xl touch-none overflow-hidden rounded-2xl border border-fg/10 bg-ink-800"
        onPointerDown={() => state === 'play' && setMiss((m) => m + 1)}
        style={{ backgroundImage: 'radial-gradient(rgb(var(--fg-c) / 0.08) 1px, transparent 1px)', backgroundSize: '22px 22px' }}
      >
        <AnimatePresence>
          {target && state === 'play' && (
            <motion.button
              key={target.id}
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.1, 1, 0.4] }}
              exit={{ scale: 0, opacity: 0, transition: { duration: 0.12 } }}
              transition={{ duration: 1.1, times: [0, 0.15, 0.6, 1] }}
              onPointerDown={(e) => {
                e.stopPropagation();
                hitsRef.current += 1;
                setHits(hitsRef.current);
                playSound('pop');
                spawn();
              }}
              className="absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
              style={{ left: `${target.x}%`, top: `${target.y}%`, width: target.s, height: target.s, background: 'radial-gradient(circle, #fff 0 14%, var(--g2) 15% 38%, #fff 39% 48%, var(--g1) 49% 100%)', boxShadow: '0 0 30px rgba(244,114,182,0.6)' }}
              aria-label="Target"
            />
          )}
        </AnimatePresence>
        {state !== 'play' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-ink-900/70 p-6">
            {state === 'over' ? (
              <Result>
                <G>{hits}</G> hits · {acc}% accuracy 🎯
              </Result>
            ) : (
              <p className="mb-4 text-[14px] text-bone-muted">Click the targets before they shrink away. 30 seconds.</p>
            )}
            <button className={btn} onClick={start}>
              {state === 'over' ? 'Play again' : '▶ Start'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ Ping Rally */

export function PingRally() {
  const [best, submit] = useBest('ping');
  const [state, setState] = useState('idle');
  const [sc, setSc] = useState({ you: 0, ai: 0 });
  const cv = useRef(null);
  const g = useRef(null);
  const keys = useRef({});
  const TO = 5;

  const serve = (s, dir) => {
    s.ball = { x: PW / 2, y: PH / 2, vx: rand(-140, 140), vy: 260 * dir };
  };
  const reset = () => {
    const s = { you: PW / 2, ai: PW / 2, score: { you: 0, ai: 0 }, rally: 0, c: themeColors() };
    serve(s, 1);
    g.current = s;
    setSc({ you: 0, ai: 0 });
    setState('play');
  };
  useKeys(state === 'play', (k, down) => (keys.current[k] = down));

  useCanvasLoop(cv, PW, PH, state === 'play', (ctx, dt) => {
    const s = g.current;
    const c = s?.c || themeColors();
    ctx.clearRect(0, 0, PW, PH);
    ctx.setLineDash([6, 10]);
    ctx.strokeStyle = c.muted;
    ctx.globalAlpha = 0.25;
    ctx.beginPath();
    ctx.moveTo(0, PH / 2);
    ctx.lineTo(PW, PH / 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
    if (!s) return;
    const b = s.ball;
    if (state === 'play' && !s.dead) {
      if (keys.current.l) s.you -= 400 * dt;
      if (keys.current.r) s.you += 400 * dt;
      s.you = Math.max(40, Math.min(PW - 40, s.you));
      // AI tracks the ball with limited speed (beatable)
      const aiSpeed = 210 + s.rally * 6;
      const target = b.vy < 0 ? b.x : PW / 2;
      s.ai += Math.max(-aiSpeed * dt, Math.min(aiSpeed * dt, target - s.ai));
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (b.x < 8 || b.x > PW - 8) {
        b.vx *= -1;
        b.x = Math.max(8, Math.min(PW - 8, b.x));
      }
      const hitPaddle = (py, px, dir) => {
        if (Math.abs(b.y - py) < 10 && Math.abs(b.x - px) < 46 && Math.sign(b.vy) === dir) {
          b.vy = -b.vy * 1.05;
          b.vx = (b.x - px) * 7;
          s.rally += 1;
          playSound('tick');
        }
      };
      hitPaddle(PH - 28, s.you, 1);
      hitPaddle(28, s.ai, -1);
      if (b.y < -10 || b.y > PH + 10) {
        const youScored = b.y < 0;
        s.score[youScored ? 'you' : 'ai'] += 1;
        s.rally = 0;
        setSc({ ...s.score });
        playSound(youScored ? 'pop' : 'tick');
        if (s.score.you >= TO || s.score.ai >= TO) {
          s.dead = true;
          setState('over');
          if (s.score.you >= TO) submit((best ?? 0) + 1);
        } else serve(s, youScored ? -1 : 1);
      }
    }
    const paddle = (x, y, col) => {
      ctx.fillStyle = col;
      ctx.shadowColor = col;
      ctx.shadowBlur = 16;
      rr(ctx, x - 40, y - 6, 80, 12, 6);
      ctx.fill();
    };
    paddle(s.you, PH - 28, c.g2);
    paddle(s.ai, 28, c.g1);
    ctx.fillStyle = c.fg;
    ctx.shadowColor = c.g3;
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(b.x, b.y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  const move = (e) => {
    if (state !== 'play' || !g.current) return;
    g.current.you = canvasPoint(e, cv.current, PW, PH).x;
  };
  const won = sc.you >= TO;

  return (
    <div className="text-center">
      <Stats>
        <Stat label="You" value={sc.you} />
        <Stat label="AI" value={sc.ai} />
        <Stat label="Wins" value={best ?? 0} />
      </Stats>
      <div className="relative mx-auto" style={{ maxWidth: PW }}>
        <GameCanvas canvasRef={cv} w={PW} h={PH} onPointerMove={move} onPointerDown={move} />
        <Overlay state={state} onStart={reset} hint={`Mouse, finger or ← →. First to ${TO} points wins.`}>
          <Result>{won ? <>You beat the AI <G>{sc.you}–{sc.ai}</G> 🏆</> : <>AI wins {sc.ai}–{sc.you}. Rematch? 🤖</>}</Result>
        </Overlay>
      </div>
    </div>
  );
}
