import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { confetti, playSound, toast } from '../components/Extras';
import { G, Result, Stat, Stats, btn, read, write } from './shared';

const grad = { background: 'linear-gradient(135deg, var(--g1), var(--g2) 60%, var(--g3))' };

/* ------------------------------------------------------------- Line Up 4 */
// Drop discs; get four in a row. The AI searches a few moves ahead (alpha-beta).

const R = 6;
const C = 7;
const at = (b, r, c) => b[r * C + c];

function drop(b, c, p) {
  for (let r = R - 1; r >= 0; r--) {
    if (!at(b, r, c)) {
      const nb = [...b];
      nb[r * C + c] = p;
      return { b: nb, r };
    }
  }
  return null;
}

function fourAt(b) {
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (let r = 0; r < R; r++)
    for (let c = 0; c < C; c++) {
      const p = at(b, r, c);
      if (!p) continue;
      for (const [dr, dc] of dirs) {
        const cells = [0, 1, 2, 3].map((k) => [r + dr * k, c + dc * k]);
        if (cells.every(([y, x]) => y >= 0 && y < R && x >= 0 && x < C && at(b, y, x) === p)) return { p, cells: cells.map(([y, x]) => y * C + x) };
      }
    }
  return null;
}

function scoreWindow(w, p) {
  const o = p === 2 ? 1 : 2;
  const mine = w.filter((v) => v === p).length;
  const theirs = w.filter((v) => v === o).length;
  const empty = w.filter((v) => !v).length;
  if (mine === 4) return 1000;
  if (mine === 3 && empty === 1) return 6;
  if (mine === 2 && empty === 2) return 2;
  if (theirs === 3 && empty === 1) return -8;
  return 0;
}
function evaluate(b) {
  let s = 0;
  for (let r = 0; r < R; r++) if (at(b, r, 3) === 2) s += 3;
  for (let r = 0; r < R; r++)
    for (let c = 0; c < C; c++)
      for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
        const w = [0, 1, 2, 3].map((k) => [r + dr * k, c + dc * k]);
        if (w.every(([y, x]) => y >= 0 && y < R && x >= 0 && x < C)) s += scoreWindow(w.map(([y, x]) => at(b, y, x)), 2);
      }
  return s;
}
const ORDER = [3, 2, 4, 1, 5, 0, 6];
function search(b, depth, alpha, beta, max) {
  const win = fourAt(b);
  if (win) return { s: win.p === 2 ? 100000 + depth : -100000 - depth };
  if (depth === 0 || b.every(Boolean)) return { s: evaluate(b) };
  let best = { s: max ? -Infinity : Infinity, c: ORDER.find((c) => !at(b, 0, c)) };
  for (const c of ORDER) {
    const d = drop(b, c, max ? 2 : 1);
    if (!d) continue;
    const { s } = search(d.b, depth - 1, alpha, beta, !max);
    if (max ? s > best.s : s < best.s) best = { s, c };
    if (max) alpha = Math.max(alpha, s);
    else beta = Math.min(beta, s);
    if (alpha >= beta) break;
  }
  return best;
}

export function LineUp4() {
  const [board, setBoard] = useState(Array(R * C).fill(0));
  const [last, setLast] = useState(-1);
  const [hover, setHover] = useState(-1);
  const [busy, setBusy] = useState(false);
  const [level, setLevel] = useState(4);
  const [tally, setTally] = useState(() => ({ w: read('c4-w') || 0, l: read('c4-l') || 0 }));
  const win = fourAt(board);
  const full = board.every(Boolean);

  const record = (k) =>
    setTally((t) => {
      const n = { ...t, [k]: t[k] + 1 };
      write(`c4-${k}`, n[k]);
      window.dispatchEvent(new Event('app:best'));
      return n;
    });

  const play = (c) => {
    if (busy || win || full) return;
    const d = drop(board, c, 1);
    if (!d) return;
    setBoard(d.b);
    setLast(d.r * C + c);
    playSound('tick');
    const w = fourAt(d.b);
    if (w) {
      record('w');
      confetti();
      toast('You out-thought the AI! 🧠');
      return;
    }
    setBusy(true);
    setTimeout(() => {
      const { c: ac } = search(d.b, level, -Infinity, Infinity, true);
      const a = drop(d.b, ac, 2);
      if (a) {
        setBoard(a.b);
        setLast(a.r * C + ac);
        playSound('pop');
        if (fourAt(a.b)) record('l');
      }
      setBusy(false);
    }, 350);
  };

  return (
    <div className="text-center">
      <Stats>
        <Stat label="Wins" value={tally.w} />
        <Stat label="Losses" value={tally.l} />
      </Stats>
      <div className="glass mx-auto mb-4 inline-flex rounded-full p-1">
        {[[2, 'Chill'], [4, 'Smart'], [5, 'Genius']].map(([d, l]) => (
          <button
            key={d}
            onClick={() => {
              setLevel(d);
              setBoard(Array(R * C).fill(0));
              setLast(-1);
            }}
            className={`rounded-full px-4 py-1.5 text-[13px] ${level === d ? 'text-white' : 'text-bone-muted'}`}
            style={level === d ? grad : undefined}
          >
            {l}
          </button>
        ))}
      </div>
      <div className="mx-auto max-w-[400px] rounded-3xl border border-fg/10 bg-fg/[0.04] p-2.5" onPointerLeave={() => setHover(-1)}>
        <div className="grid grid-cols-7 gap-1.5">
          {board.map((v, i) => {
            const c = i % C;
            const inWin = win?.cells.includes(i);
            return (
              <button
                key={i}
                onClick={() => play(c)}
                onPointerEnter={() => setHover(c)}
                className={`relative aspect-square rounded-full ${hover === c && !v ? 'bg-fg/[0.12]' : 'bg-ink-900/60'}`}
                aria-label={`Column ${c + 1}`}
              >
                {v !== 0 && (
                  <motion.span
                    initial={i === last ? { y: -((Math.floor(i / C) + 1) * 52), opacity: 0.6 } : false}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                    className={`absolute inset-[6%] rounded-full ${inWin ? 'ring-4 ring-white/80' : ''}`}
                    style={v === 1 ? grad : { background: 'rgb(var(--bone-muted))' }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
      <p className="mt-4 text-[15px]">
        {win ? (win.p === 1 ? 'You win! 🎉' : 'The AI connects four 🤖') : full ? 'Board full — draw 🤝' : busy ? 'AI is thinking…' : 'Your turn — tap a column'}
      </p>
      {(win || full) && (
        <button className={`${btn} mt-3`} onClick={() => (setBoard(Array(R * C).fill(0)), setLast(-1))}>
          Play again
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------- Rock Paper Scissors AI */
// The AI learns which move you tend to play after each of your moves (a tiny Markov model).

const MOVES = [
  { id: 'r', icon: '✊', name: 'Rock' },
  { id: 'p', icon: '✋', name: 'Paper' },
  { id: 's', icon: '✌️', name: 'Scissors' },
];
const beats = { r: 's', p: 'r', s: 'p' };
const counter = { r: 'p', p: 's', s: 'r' };

export function RPSAI() {
  const model = useRef({});
  const prev = useRef(null);
  const [round, setRound] = useState(null);
  const [score, setScore] = useState({ you: 0, ai: 0, tie: 0 });
  const [confidence, setConfidence] = useState(0);
  const [best, setBest] = useState(() => read('rps') || 0);

  const predict = () => {
    const row = model.current[prev.current] || {};
    const total = Object.values(row).reduce((a, b) => a + b, 0);
    if (total < 2) return { move: ['r', 'p', 's'][Math.floor(Math.random() * 3)], conf: 0 };
    const [likely, n] = Object.entries(row).sort((a, b) => b[1] - a[1])[0];
    return { move: counter[likely], conf: Math.round((n / total) * 100) };
  };

  const play = (m) => {
    const { move: ai, conf } = predict();
    if (prev.current) {
      const row = (model.current[prev.current] = model.current[prev.current] || {});
      row[m] = (row[m] || 0) + 1;
    }
    prev.current = m;
    const res = m === ai ? 'tie' : beats[m] === ai ? 'you' : 'ai';
    const next = { ...score, [res]: score[res] + 1 };
    setScore(next);
    setRound({ you: m, ai, res, key: Math.random() });
    setConfidence(conf);
    playSound(res === 'you' ? 'pop' : 'tick');
    if (next.you - next.ai > best) {
      setBest(next.you - next.ai);
      write('rps', next.you - next.ai);
      window.dispatchEvent(new Event('app:best'));
    }
  };
  const icon = (id) => MOVES.find((m) => m.id === id).icon;

  return (
    <div className="text-center">
      <Stats>
        <Stat label="You" value={score.you} />
        <Stat label="AI" value={score.ai} />
        <Stat label="Ties" value={score.tie} />
        <Stat label="Best lead" value={best} />
      </Stats>
      <div className="mx-auto mb-6 flex max-w-sm items-center justify-around rounded-3xl border border-fg/10 bg-fg/[0.03] py-8">
        <AnimatePresence mode="wait">
          {round ? (
            <motion.div key={round.key} className="flex w-full items-center justify-around" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <div>
                <p className="text-6xl">{icon(round.you)}</p>
                <p className="mt-2 text-[12px] text-bone-muted">You</p>
              </div>
              <p className={`text-lg font-semibold ${round.res === 'you' ? 'text-emerald-400' : round.res === 'ai' ? 'text-rose-400' : 'text-bone-muted'}`}>
                {round.res === 'you' ? 'WIN' : round.res === 'ai' ? 'LOSE' : 'TIE'}
              </p>
              <div>
                <p className="text-6xl">{icon(round.ai)}</p>
                <p className="mt-2 text-[12px] text-bone-muted">AI</p>
              </div>
            </motion.div>
          ) : (
            <motion.p key="intro" className="px-6 text-[14px] text-bone-muted">
              Play as many rounds as you like. The AI studies your habits and starts predicting you. Can you stay unpredictable?
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      <div className="flex justify-center gap-3">
        {MOVES.map((m) => (
          <motion.button
            key={m.id}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => play(m.id)}
            className="glass flex h-24 w-24 flex-col items-center justify-center rounded-3xl"
          >
            <span className="text-4xl">{m.icon}</span>
            <span className="mt-1 text-[12px] text-bone-muted">{m.name}</span>
          </motion.button>
        ))}
      </div>
      {round && (
        <p className="mt-5 text-[13px] text-bone-muted">
          🧠 AI prediction confidence: <G>{confidence}%</G>
        </p>
      )}
      {score.you + score.ai + score.tie >= 10 && <Result>{score.you > score.ai ? 'You’re out-smarting the model 😎' : 'The model is learning you… 👀'}</Result>}
    </div>
  );
}
