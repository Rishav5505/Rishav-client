import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { confetti, playSound } from '../components/Extras';
import { G, Result, Stat, Stats, btn, ghost, randInt, shuffle, useBest, useCountdown } from './shared';

const grad = { background: 'linear-gradient(135deg, var(--g1), var(--g2) 60%, var(--g3))' };

function useTimer(running) {
  const [s, setS] = useState(0);
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setS((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, [running]);
  return [s, () => setS(0)];
}
const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/* ---------------------------------------------------------- Slide Puzzle */

function scramble(n) {
  // Random legal moves from the solved state → always solvable.
  const b = [...Array(n * n - 1).keys()].map((i) => i + 1).concat(0);
  let e = n * n - 1;
  let prev = -1;
  for (let k = 0; k < n * n * 25; k++) {
    const r = Math.floor(e / n);
    const c = e % n;
    const opts = [];
    if (r > 0) opts.push(e - n);
    if (r < n - 1) opts.push(e + n);
    if (c > 0) opts.push(e - 1);
    if (c < n - 1) opts.push(e + 1);
    const nxt = shuffle(opts.filter((o) => o !== prev))[0];
    [b[e], b[nxt]] = [b[nxt], b[e]];
    prev = e;
    e = nxt;
  }
  return b;
}

export function SlidePuzzle() {
  const [n, setN] = useState(3);
  const [best, submit] = useBest(`slide${n}`, true);
  const [board, setBoard] = useState(() => scramble(3));
  const [moves, setMoves] = useState(0);
  const solved = board.every((v, i) => v === (i === board.length - 1 ? 0 : i + 1));
  const [time, resetTime] = useTimer(moves > 0 && !solved);

  useEffect(() => {
    if (solved && moves > 0) {
      const prev = best;
      const better = submit(moves);
      if (!(better && prev !== null)) confetti();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solved]);

  const newGame = (size = n) => {
    setN(size);
    setBoard(scramble(size));
    setMoves(0);
    resetTime();
  };

  const tap = (i) => {
    if (solved) return;
    const e = board.indexOf(0);
    const adj = (Math.abs(i - e) === 1 && Math.floor(i / n) === Math.floor(e / n)) || Math.abs(i - e) === n;
    if (!adj) return;
    const b = [...board];
    [b[i], b[e]] = [b[e], b[i]];
    setBoard(b);
    setMoves((m) => m + 1);
    playSound('tick');
  };

  return (
    <div className="text-center">
      <Stats>
        <Stat label="Moves" value={moves} />
        <Stat label="Time" value={mmss(time)} />
        <Stat label="Best" value={best ?? '—'} />
      </Stats>
      <div className="glass mx-auto mb-5 inline-flex rounded-full p-1">
        {[3, 4].map((s) => (
          <button key={s} onClick={() => newGame(s)} className={`rounded-full px-4 py-1.5 text-[13px] ${n === s ? 'text-white' : 'text-bone-muted'}`} style={n === s ? grad : undefined}>
            {s}×{s}
          </button>
        ))}
      </div>
      <div className="mx-auto grid max-w-[320px] gap-2" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>
        {board.map((v, i) =>
          v === 0 ? (
            <div key="empty" className="aspect-square rounded-xl border border-dashed border-fg/15" />
          ) : (
            <motion.button
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              key={v}
              onClick={() => tap(i)}
              className="grid aspect-square place-items-center rounded-xl text-2xl font-semibold text-white shadow-[0_8px_20px_-8px_rgba(244,114,182,0.6)]"
              style={{ ...grad, opacity: v === i + 1 ? 1 : 0.82 }}
            >
              {v}
            </motion.button>
          )
        )}
      </div>
      <div className="mt-5">
        {solved && moves > 0 && (
          <Result>
            Solved in <G>{moves}</G> moves · {mmss(time)} 🧩
          </Result>
        )}
        <button className={solved && moves > 0 ? btn : ghost} onClick={() => newGame()}>
          {solved && moves > 0 ? 'Play again' : 'Shuffle'}
        </button>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- Neon Toggle */

const NT = 5;
const press = (b, i) => {
  const r = Math.floor(i / NT);
  const c = i % NT;
  const out = [...b];
  [[r, c], [r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].forEach(([y, x]) => {
    if (y >= 0 && y < NT && x >= 0 && x < NT) out[y * NT + x] = !out[y * NT + x];
  });
  return out;
};
const makeLevel = (lvl) => {
  let b = Array(NT * NT).fill(false);
  const taps = shuffle([...Array(NT * NT).keys()]).slice(0, Math.min(3 + lvl, 15));
  taps.forEach((t) => (b = press(b, t)));
  return b.some(Boolean) ? b : makeLevel(lvl);
};

export function NeonToggle() {
  const [best, submit] = useBest('neon');
  const [lvl, setLvl] = useState(1);
  const [board, setBoard] = useState(() => makeLevel(1));
  const [moves, setMoves] = useState(0);
  const clear = board.every((v) => !v);

  useEffect(() => {
    if (!clear) return;
    submit(lvl);
    playSound('chime');
  }, [clear]); // eslint-disable-line react-hooks/exhaustive-deps

  const tap = (i) => {
    if (clear) return;
    setBoard((b) => press(b, i));
    setMoves((m) => m + 1);
    playSound('tick');
  };
  const next = () => {
    setLvl(lvl + 1);
    setBoard(makeLevel(lvl + 1));
    setMoves(0);
  };

  return (
    <div className="text-center">
      <Stats>
        <Stat label="Level" value={lvl} />
        <Stat label="Moves" value={moves} />
        <Stat label="Best lvl" value={best ?? '—'} />
      </Stats>
      <div className="mx-auto grid max-w-[300px] grid-cols-5 gap-2">
        {board.map((on, i) => (
          <button
            key={i}
            onClick={() => tap(i)}
            className={`aspect-square rounded-xl border transition-all duration-200 ${on ? 'border-transparent shadow-[0_0_24px_rgba(244,114,182,0.7)]' : 'border-fg/10 bg-fg/[0.04]'}`}
            style={on ? grad : undefined}
            aria-label={on ? 'Light on' : 'Light off'}
          />
        ))}
      </div>
      <p className="mt-4 text-[13px] text-bone-muted">Tapping a tile flips it and its neighbours. Turn every light off.</p>
      <div className="mt-4 flex justify-center gap-2">
        {clear ? (
          <button className={btn} onClick={next}>
            Level {lvl + 1} →
          </button>
        ) : (
          <button className={ghost} onClick={() => (setBoard(makeLevel(lvl)), setMoves(0))}>
            New board
          </button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ Bug Finder */

const BW = 9;
const BUGS = 10;

function makeField(safe) {
  const cells = Array.from({ length: BW * BW }, () => ({ bug: false, open: false, flag: false, n: 0 }));
  const forbidden = new Set(neighbors(safe).concat(safe));
  const spots = shuffle([...Array(BW * BW).keys()].filter((i) => !forbidden.has(i))).slice(0, BUGS);
  spots.forEach((i) => (cells[i].bug = true));
  cells.forEach((c, i) => (c.n = neighbors(i).filter((j) => cells[j].bug).length));
  return cells;
}
function neighbors(i) {
  const r = Math.floor(i / BW);
  const c = i % BW;
  const out = [];
  for (let dy = -1; dy <= 1; dy++)
    for (let dx = -1; dx <= 1; dx++) {
      if (!dy && !dx) continue;
      const y = r + dy;
      const x = c + dx;
      if (y >= 0 && y < BW && x >= 0 && x < BW) out.push(y * BW + x);
    }
  return out;
}
const numColor = ['', 'text-violet-400', 'text-pink-400', 'text-orange-400', 'text-sky-400', 'text-rose-400', 'text-emerald-400', 'text-amber-300', 'text-bone'];

export function BugFinder() {
  const [best, submit] = useBest('finder', true);
  const [cells, setCells] = useState(null);
  const [state, setState] = useState('play'); // play | won | lost
  const [flagMode, setFlagMode] = useState(false);
  const [time, resetTime] = useTimer(!!cells && state === 'play');
  const flags = cells ? cells.filter((c) => c.flag).length : 0;

  const open = (i) => {
    if (state !== 'play') return;
    let f = cells || makeField(i);
    if (f[i].open) return;
    if (flagMode && cells) {
      f = f.map((c, j) => (j === i ? { ...c, flag: !c.flag } : c));
      setCells(f);
      playSound('tick');
      return;
    }
    if (f[i].flag) return;
    f = f.map((c) => ({ ...c }));
    if (f[i].bug) {
      f.forEach((c) => c.bug && (c.open = true));
      setCells(f);
      setState('lost');
      playSound('tick');
      return;
    }
    const stack = [i];
    while (stack.length) {
      const k = stack.pop();
      if (f[k].open) continue;
      f[k].open = true;
      f[k].flag = false;
      if (f[k].n === 0) neighbors(k).forEach((j) => !f[j].open && !f[j].bug && stack.push(j));
    }
    setCells(f);
    playSound('pop');
    if (f.filter((c) => !c.bug).every((c) => c.open)) {
      setState('won');
      const prev = best;
      const better = submit(time);
      if (!(better && prev !== null)) confetti();
    }
  };

  const flag = (e, i) => {
    e.preventDefault();
    if (!cells || state !== 'play' || cells[i].open) return;
    setCells(cells.map((c, j) => (j === i ? { ...c, flag: !c.flag } : c)));
  };

  const reset = () => {
    setCells(null);
    setState('play');
    resetTime();
  };

  return (
    <div className="text-center">
      <Stats>
        <Stat label="Bugs" value={BUGS - flags} />
        <Stat label="Time" value={mmss(time)} />
        <Stat label="Best" value={best !== null ? mmss(best) : '—'} />
      </Stats>
      <div className="mx-auto grid max-w-[360px] grid-cols-9 gap-1">
        {Array.from({ length: BW * BW }, (_, i) => {
          const c = cells?.[i];
          return (
            <button
              key={i}
              onClick={() => open(i)}
              onContextMenu={(e) => flag(e, i)}
              className={`grid aspect-square place-items-center rounded-md text-[13px] font-bold transition-colors ${
                c?.open ? (c.bug ? 'bg-rose-500/30' : 'bg-fg/[0.03]') : 'border border-fg/10 bg-fg/[0.09] hover:bg-fg/[0.14]'
              }`}
              aria-label={c?.open ? (c.bug ? 'Bug' : `${c.n} nearby`) : c?.flag ? 'Flagged' : 'Hidden'}
            >
              {c?.open ? (c.bug ? '🐛' : c.n ? <span className={numColor[c.n]}>{c.n}</span> : '') : c?.flag ? '🚩' : ''}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <button onClick={() => setFlagMode((f) => !f)} className={flagMode ? btn : ghost}>
          {flagMode ? '🚩 Flag mode ON' : '🚩 Flag mode'}
        </button>
        <button onClick={reset} className={ghost}>
          New field
        </button>
      </div>
      <p className="mt-3 text-[12px] text-bone-dim">Find all 10 bugs. Numbers count bugs nearby. Right-click or flag mode to mark.</p>
      {state !== 'play' && (
        <Result>{state === 'won' ? <>Codebase clean in <G>{mmss(time)}</G> ✅</> : <>A bug got you 🐛 — try again!</>}</Result>
      )}
    </div>
  );
}

/* ----------------------------------------------------------- Mini Sudoku */

function makeSudoku() {
  const base = [
    [1, 2, 3, 4],
    [3, 4, 1, 2],
    [2, 1, 4, 3],
    [4, 3, 2, 1],
  ];
  const map = shuffle([1, 2, 3, 4]);
  let g = base.map((r) => r.map((v) => map[v - 1]));
  if (Math.random() < 0.5) g = [g[1], g[0], g[2], g[3]];
  if (Math.random() < 0.5) g = [g[0], g[1], g[3], g[2]];
  if (Math.random() < 0.5) g = g.map((r) => [r[1], r[0], r[2], r[3]]);
  if (Math.random() < 0.5) g = g.map((r) => [r[0], r[1], r[3], r[2]]);
  if (Math.random() < 0.5) g = [g[2], g[3], g[0], g[1]];
  const flat = g.flat();
  const holes = new Set(shuffle([...Array(16).keys()]).slice(0, 10));
  return flat.map((v, i) => ({ v: holes.has(i) ? 0 : v, fixed: !holes.has(i) }));
}
const sudokuOk = (cells) => {
  const v = cells.map((c) => c.v);
  if (v.includes(0)) return false;
  const groups = [];
  for (let i = 0; i < 4; i++) {
    groups.push([0, 1, 2, 3].map((k) => v[i * 4 + k]));
    groups.push([0, 1, 2, 3].map((k) => v[k * 4 + i]));
    const br = Math.floor(i / 2) * 2;
    const bc = (i % 2) * 2;
    groups.push([v[br * 4 + bc], v[br * 4 + bc + 1], v[(br + 1) * 4 + bc], v[(br + 1) * 4 + bc + 1]]);
  }
  return groups.every((g) => new Set(g).size === 4);
};
const conflict = (cells, i) => {
  const v = cells[i].v;
  if (!v) return false;
  const r = Math.floor(i / 4);
  const c = i % 4;
  return cells.some((o, j) => {
    if (j === i || o.v !== v) return false;
    const r2 = Math.floor(j / 4);
    const c2 = j % 4;
    return r2 === r || c2 === c || (Math.floor(r2 / 2) === Math.floor(r / 2) && Math.floor(c2 / 2) === Math.floor(c / 2));
  });
};

export function MiniSudoku() {
  const [best, submit] = useBest('sudoku', true);
  const [cells, setCells] = useState(makeSudoku);
  const [sel, setSel] = useState(null);
  const solved = useMemo(() => sudokuOk(cells), [cells]);
  const [time, resetTime] = useTimer(!solved);

  useEffect(() => {
    if (!solved) return;
    const prev = best;
    const better = submit(time);
    if (!(better && prev !== null)) confetti();
  }, [solved]); // eslint-disable-line react-hooks/exhaustive-deps

  const put = (n) => {
    if (sel === null || cells[sel].fixed || solved) return;
    setCells(cells.map((c, i) => (i === sel ? { ...c, v: n } : c)));
    playSound('tick');
  };

  return (
    <div className="text-center">
      <Stats>
        <Stat label="Time" value={mmss(time)} />
        <Stat label="Best" value={best !== null ? mmss(best) : '—'} />
      </Stats>
      <div className="mx-auto grid max-w-[260px] grid-cols-4 overflow-hidden rounded-2xl border-2 border-fg/20">
        {cells.map((c, i) => {
          const r = Math.floor(i / 4);
          const col = i % 4;
          return (
            <button
              key={i}
              onClick={() => setSel(i)}
              className={`grid aspect-square place-items-center text-2xl transition-colors ${col === 1 ? 'border-r-2 border-fg/20' : col !== 3 ? 'border-r border-fg/10' : ''} ${
                r === 1 ? 'border-b-2 border-b-fg/20' : r !== 3 ? 'border-b border-b-fg/10' : ''
              } ${sel === i ? 'bg-pink-400/20' : c.fixed ? 'bg-fg/[0.06]' : ''}`}
            >
              <span className={c.fixed ? 'font-semibold' : conflict(cells, i) ? 'text-rose-400' : 'text-gradient font-semibold'}>{c.v || ''}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-5 flex justify-center gap-2">
        {[1, 2, 3, 4].map((n) => (
          <button key={n} onClick={() => put(n)} className="glass h-12 w-12 rounded-xl text-xl font-semibold active:scale-90">
            {n}
          </button>
        ))}
        <button onClick={() => put(0)} className="glass h-12 w-12 rounded-xl text-sm text-bone-muted" aria-label="Erase">
          ⌫
        </button>
      </div>
      <p className="mt-3 text-[12px] text-bone-dim">Fill 1–4 so each row, column and 2×2 box has every number once.</p>
      <div className="mt-4">
        {solved && (
          <Result>
            Solved in <G>{mmss(time)}</G> 🔢
          </Result>
        )}
        <button className={solved ? btn : ghost} onClick={() => (setCells(makeSudoku()), setSel(null), resetTime())}>
          {solved ? 'Next puzzle' : 'New puzzle'}
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------- Spot the Shade */

export function SpotShade() {
  const [best, submit] = useBest('shade');
  const [state, setState] = useState('idle');
  const [lvl, setLvl] = useState(1);
  const [round, setRound] = useState(null);
  const lvlRef = useMemo(() => ({ v: 1 }), []);

  const make = (l) => {
    const n = Math.min(2 + Math.floor((l + 1) / 2), 8);
    const hue = randInt(0, 360);
    const diff = Math.max(4, 28 - l * 1.6);
    return { n, odd: randInt(0, n * n - 1), base: `hsl(${hue} 70% 62%)`, alt: `hsl(${hue} 70% ${62 + diff}%)` };
  };
  const [time, resetTime] = useCountdown(45, state === 'play', () => {
    setState('over');
    submit(lvlRef.v - 1);
  });

  const start = () => {
    lvlRef.v = 1;
    setLvl(1);
    setRound(make(1));
    resetTime();
    setState('play');
  };
  const pick = (i) => {
    if (state !== 'play') return;
    if (i === round.odd) {
      lvlRef.v += 1;
      setLvl(lvlRef.v);
      setRound(make(lvlRef.v));
      playSound('pop');
    } else playSound('tick');
  };

  return (
    <div className="text-center">
      <Stats>
        <Stat label="Level" value={lvl} />
        <Stat label="Time" value={`${time}s`} />
        <Stat label="Best" value={best ?? '—'} />
      </Stats>
      {state === 'play' && round ? (
        <div className="mx-auto grid aspect-square max-w-[340px] gap-1.5" style={{ gridTemplateColumns: `repeat(${round.n}, 1fr)` }}>
          {Array.from({ length: round.n * round.n }, (_, i) => (
            <button key={`${lvl}-${i}`} onClick={() => pick(i)} className="rounded-lg transition-transform active:scale-90" style={{ background: i === round.odd ? round.alt : round.base }} aria-label="Colour tile" />
          ))}
        </div>
      ) : (
        <div className="mx-auto flex aspect-square max-w-[340px] flex-col items-center justify-center rounded-2xl border border-fg/10 bg-fg/[0.03] p-6">
          {state === 'over' ? (
            <Result>
              You reached level <G>{lvl}</G> 👁️
            </Result>
          ) : (
            <p className="mb-4 text-[14px] text-bone-muted">One tile is a slightly different shade. Find it — it gets harder every level. 45 seconds.</p>
          )}
          <button className={btn} onClick={start}>
            {state === 'over' ? 'Play again' : '▶ Start'}
          </button>
        </div>
      )}
    </div>
  );
}
