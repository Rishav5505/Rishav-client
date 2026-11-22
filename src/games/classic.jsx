import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { confetti, playSound, toast } from '../components/Extras';
import { ease } from '../components/ui';
import { Stat, btn, ghost, read, shuffle, useBest, write } from './shared';

/* --------------------------------------------------------- 1. Bug Smash */

export function BugSmash() {
  const [best, submit] = useBest('bugs');
  const [state, setState] = useState('idle'); // idle | play | over
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(30);
  const [holes, setHoles] = useState(Array(9).fill(null)); // null | 'bug' | 'feature'
  const [hit, setHit] = useState(-1);
  const scoreRef = useRef(0);

  useEffect(() => {
    if (state !== 'play') return;
    const tick = setInterval(() => setTime((t) => t - 1), 1000);
    let alive = true;
    const startedAt = performance.now();
    const spawn = () => {
      if (!alive) return;
      const elapsed = (performance.now() - startedAt) / 1000;
      const speed = Math.max(420, 900 - elapsed * 16); // gets faster as time runs out
      const i = Math.floor(Math.random() * 9);
      const kind = Math.random() < 0.2 ? 'feature' : 'bug';
      setHoles((h) => h.map((v, j) => (j === i ? kind : v)));
      setTimeout(() => setHoles((h) => h.map((v, j) => (j === i && v === kind ? null : v))), speed);
      setTimeout(spawn, speed * 0.75);
    };
    spawn();
    return () => {
      alive = false;
      clearInterval(tick);
    };
  }, [state]);

  useEffect(() => {
    if (state === 'play' && time <= 0) {
      setState('over');
      setHoles(Array(9).fill(null));
      submit(scoreRef.current);
    }
  }, [time, state, submit]);

  const start = () => {
    scoreRef.current = 0;
    setScore(0);
    setTime(30);
    setHoles(Array(9).fill(null));
    setState('play');
  };

  const smash = (i) => {
    const v = holes[i];
    if (state !== 'play' || !v) return;
    const delta = v === 'bug' ? 1 : -2;
    scoreRef.current = Math.max(0, scoreRef.current + delta);
    setScore(scoreRef.current);
    setHit(i);
    setTimeout(() => setHit(-1), 180);
    playSound(v === 'bug' ? 'pop' : 'tick');
    setHoles((h) => h.map((x, j) => (j === i ? null : x)));
  };

  return (
    <div className="text-center">
      <div className="mb-5 flex justify-center gap-3">
        <Stat label="Score" value={score} />
        <Stat label="Time" value={`${Math.max(0, time)}s`} />
        <Stat label="Best" value={best ?? '—'} />
      </div>
      <div className="mx-auto grid max-w-sm grid-cols-3 gap-3">
        {holes.map((v, i) => (
          <button
            key={i}
            onPointerDown={() => smash(i)}
            className={`relative grid aspect-square place-items-center overflow-hidden rounded-2xl border border-fg/10 bg-fg/[0.04] font-mono text-[10px] text-bone-dim transition-transform ${hit === i ? 'scale-90' : ''}`}
            aria-label={v ? (v === 'bug' ? 'Bug — smash it' : 'Feature — leave it') : 'Empty'}
          >
            <span className="absolute left-2 top-1.5 opacity-50">{`{${i}}`}</span>
            <AnimatePresence>
              {v && (
                <motion.span
                  key={v}
                  initial={{ y: 40, scale: 0.4, opacity: 0 }}
                  animate={{ y: 0, scale: 1, opacity: 1 }}
                  exit={{ y: 30, scale: 0.5, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                  className="text-4xl sm:text-5xl"
                >
                  {v === 'bug' ? '🐛' : '☕'}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        ))}
      </div>
      <p className="mt-5 text-[13px] text-bone-muted">Smash 🐛 bugs (+1). Don’t touch ☕ features (−2)!</p>
      {state !== 'play' && (
        <div className="mt-5">
          {state === 'over' && <p className="mb-3 text-lg">You squashed <span className="text-gradient font-semibold">{score}</span> bugs 🎉</p>}
          <button className={btn} onClick={start}>{state === 'over' ? 'Play again' : 'Start'}</button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------- 2. Tech Memory */

const techs = [
  ['⚛️', 'React'], ['🐍', 'Python'], ['🐳', 'Docker'], ['🌿', 'Git'],
  ['🟢', 'Node'], ['☁️', 'AWS'], ['🍃', 'Mongo'], ['🧠', 'LLMs'],
];


export function Memory() {
  const [best, submit] = useBest('memory', true);
  const deal = () => shuffle([...techs, ...techs]).map((t, i) => ({ id: i, icon: t[0], name: t[1] }));
  const [cards, setCards] = useState(deal);
  const [open, setOpen] = useState([]);
  const [done, setDone] = useState([]);
  const [moves, setMoves] = useState(0);
  const [lock, setLock] = useState(false);
  const won = done.length === cards.length;

  useEffect(() => {
    if (!won) return;
    const t = setTimeout(() => {
      const prev = read('memory');
      const isBest = submit(moves);
      // submit() already celebrates a beaten record; celebrate every other finish here
      if (!(isBest && prev !== null)) confetti();
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [won]);

  const flip = (c) => {
    if (lock || open.includes(c.id) || done.includes(c.id)) return;
    playSound('tick');
    const next = [...open, c.id];
    setOpen(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = next.map((id) => cards.find((x) => x.id === id));
      if (a.name === b.name) {
        setDone((d) => [...d, a.id, b.id]);
        playSound('pop');
        setOpen([]);
      } else {
        setLock(true);
        setTimeout(() => {
          setOpen([]);
          setLock(false);
        }, 750);
      }
    }
  };

  const reset = () => {
    setCards(deal());
    setOpen([]);
    setDone([]);
    setMoves(0);
  };

  return (
    <div className="text-center">
      <div className="mb-5 flex justify-center gap-3">
        <Stat label="Moves" value={moves} />
        <Stat label="Pairs" value={`${done.length / 2}/8`} />
        <Stat label="Best" value={best ?? '—'} />
      </div>
      <div className="mx-auto grid max-w-sm grid-cols-4 gap-2.5 [perspective:800px]">
        {cards.map((c) => {
          const up = open.includes(c.id) || done.includes(c.id);
          return (
            <button key={c.id} onClick={() => flip(c)} className="relative aspect-square" aria-label={up ? c.name : 'Hidden card'}>
              <motion.div
                className="absolute inset-0 [transform-style:preserve-3d]"
                animate={{ rotateY: up ? 180 : 0 }}
                transition={{ duration: 0.45, ease }}
              >
                <span
                  className="absolute inset-0 grid place-items-center rounded-xl text-lg font-serif italic text-white [backface-visibility:hidden]"
                  style={{ background: 'linear-gradient(135deg, var(--g1), var(--g2), var(--g3))' }}
                >
                  R
                </span>
                <span
                  className={`absolute inset-0 flex flex-col items-center justify-center rounded-xl border [backface-visibility:hidden] [transform:rotateY(180deg)] ${
                    done.includes(c.id) ? 'border-emerald-400/50 bg-emerald-400/10' : 'border-fg/15 bg-ink-800'
                  }`}
                >
                  <span className="text-2xl sm:text-3xl">{c.icon}</span>
                  <span className="mt-0.5 text-[9px] text-bone-muted sm:text-[10px]">{c.name}</span>
                </span>
              </motion.div>
            </button>
          );
        })}
      </div>
      <div className="mt-6">
        {won && <p className="mb-3 text-lg">Solved in <span className="text-gradient font-semibold">{moves}</span> moves 🧠✨</p>}
        <button className={won ? btn : ghost} onClick={reset}>{won ? 'Play again' : 'Shuffle'}</button>
      </div>
    </div>
  );
}

/* --------------------------------------------------------- 3. Code Typer */

const WORDS = 'react python docker deploy async await commit merge branch tensor model agent prompt token vector cache query render state props hook lambda kernel cluster schema router fetch build ship debug linter pixel shader neural eval train infer docker yaml json api node mongo redis queue stream socket'.split(' ');

export function Typer() {
  const [best, submit] = useBest('typer');
  const [words, setWords] = useState(() => shuffle(WORDS).concat(shuffle(WORDS)));
  const [idx, setIdx] = useState(0);
  const [val, setVal] = useState('');
  const [correct, setCorrect] = useState(0);
  const [chars, setChars] = useState(0);
  const [time, setTime] = useState(30);
  const [state, setState] = useState('idle');
  const input = useRef(null);

  useEffect(() => {
    if (state !== 'play') return;
    const t = setInterval(() => setTime((x) => x - 1), 1000);
    return () => clearInterval(t);
  }, [state]);

  const wpm = Math.round(chars / 5 / 0.5);

  useEffect(() => {
    if (state === 'play' && time <= 0) {
      setState('over');
      submit(wpm);
    }
  }, [time, state, wpm, submit]);

  const onChange = (e) => {
    const v = e.target.value;
    if (state === 'idle') setState('play');
    if (state === 'over') return;
    if (v.endsWith(' ')) {
      const typed = v.trim();
      if (typed === words[idx]) {
        setCorrect((c) => c + 1);
        setChars((c) => c + typed.length + 1);
        playSound('tick');
      }
      setIdx((i) => i + 1);
      setVal('');
    } else setVal(v);
  };

  const reset = () => {
    setWords(shuffle(WORDS).concat(shuffle(WORDS)));
    setIdx(0);
    setVal('');
    setCorrect(0);
    setChars(0);
    setTime(30);
    setState('idle');
    setTimeout(() => input.current?.focus(), 50);
  };

  const view = words.slice(idx, idx + 14);

  return (
    <div className="text-center">
      <div className="mb-5 flex justify-center gap-3">
        <Stat label="WPM" value={state === 'idle' ? 0 : wpm} />
        <Stat label="Time" value={`${Math.max(0, time)}s`} />
        <Stat label="Best" value={best ?? '—'} />
      </div>
      <div className="mx-auto max-w-lg rounded-2xl border border-fg/10 bg-[#0b0a12] p-5 text-left font-mono text-[15px] leading-loose text-white/50 sm:text-[17px]">
        {view.map((w, i) => {
          const cur = i === 0;
          const ok = cur && w.startsWith(val);
          return (
            <span key={`${idx + i}`} className={`mr-2.5 ${cur ? (ok ? 'rounded bg-white/10 px-1 text-[#f0abfc]' : 'rounded bg-rose-500/20 px-1 text-rose-300') : ''}`}>
              {w}
            </span>
          );
        })}
      </div>
      <input
        ref={input}
        value={val}
        onChange={onChange}
        disabled={state === 'over'}
        placeholder={state === 'idle' ? 'Start typing to begin…' : ''}
        className="mx-auto mt-4 block w-full max-w-lg rounded-full border border-fg/15 bg-fg/[0.04] px-5 py-3 text-center font-mono text-[15px] outline-none focus:border-accent"
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        aria-label="Type the highlighted word"
        autoFocus
      />
      <div className="mt-5">
        {state === 'over' && (
          <p className="mb-3 text-lg">
            <span className="text-gradient font-semibold">{wpm} WPM</span> · {correct} words correct ⌨️
          </p>
        )}
        <button className={state === 'over' ? btn : ghost} onClick={reset}>{state === 'over' ? 'Try again' : 'Restart'}</button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------- 4. Reaction Lab */

export function Reaction() {
  const [best, submit] = useBest('reaction', true);
  const [state, setState] = useState('idle'); // idle | wait | go | result | early
  const [ms, setMs] = useState(0);
  const t0 = useRef(0);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const press = () => {
    if (state === 'idle' || state === 'result' || state === 'early') {
      setState('wait');
      timer.current = setTimeout(() => {
        t0.current = performance.now();
        setState('go');
        playSound('pop');
      }, 1200 + Math.random() * 2800);
    } else if (state === 'wait') {
      clearTimeout(timer.current);
      setState('early');
    } else if (state === 'go') {
      const r = Math.round(performance.now() - t0.current);
      setMs(r);
      setState('result');
      submit(r);
    }
  };

  const look = {
    idle: ['bg-fg/[0.05]', '⚡', 'Tap to start', 'Wait for green, then tap as fast as you can.'],
    wait: ['bg-rose-500/80', '⏳', 'Wait for green…', 'Don’t tap yet!'],
    go: ['bg-emerald-500', '👆', 'TAP!', 'Now now now!'],
    result: ['bg-fg/[0.05]', '🏁', `${ms} ms`, ms < 220 ? 'Lightning reflexes! ⚡' : ms < 320 ? 'Nice and quick 👌' : 'Tap to try again'],
    early: ['bg-amber-500/80', '😅', 'Too soon!', 'Tap to try again'],
  }[state];

  return (
    <div className="text-center">
      <div className="mb-5 flex justify-center gap-3">
        <Stat label="Last" value={ms ? `${ms}ms` : '—'} />
        <Stat label="Best" value={best ? `${best}ms` : '—'} />
      </div>
      <button
        onPointerDown={press}
        className={`mx-auto flex h-64 w-full max-w-lg flex-col items-center justify-center rounded-3xl border border-fg/10 text-white transition-colors duration-150 ${look[0]}`}
      >
        <span className="text-5xl">{look[1]}</span>
        <span className={`mt-3 text-3xl font-semibold tracking-tight ${state === 'idle' || state === 'result' ? 'text-bone' : ''}`}>{look[2]}</span>
        <span className={`mt-2 text-sm ${state === 'idle' || state === 'result' ? 'text-bone-muted' : 'text-white/85'}`}>{look[3]}</span>
      </button>
      <p className="mt-4 text-[12px] text-bone-dim">Average human reaction time is around 250 ms.</p>
    </div>
  );
}

/* ------------------------------------------------------- 5. Beat My AI */

const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
const winner = (b) => {
  for (const [a, c, d] of LINES) if (b[a] && b[a] === b[c] && b[a] === b[d]) return { who: b[a], line: [a, c, d] };
  return b.every(Boolean) ? { who: 'draw', line: [] } : null;
};
function minimax(b, ai) {
  const w = winner(b);
  if (w) return { score: w.who === 'O' ? 10 : w.who === 'X' ? -10 : 0 };
  const moves = [];
  b.forEach((v, i) => {
    if (v) return;
    const nb = [...b];
    nb[i] = ai ? 'O' : 'X';
    moves.push({ i, score: minimax(nb, !ai).score });
  });
  return moves.reduce((best, m) => ((ai ? m.score > best.score : m.score < best.score) ? m : best));
}

export function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [mode, setMode] = useState('hard');
  const [tally, setTally] = useState(() => ({ w: read('ttt-w') || 0, l: read('ttt-l') || 0, d: read('ttt-d') || 0 }));
  const [thinking, setThinking] = useState(false);
  const result = winner(board);

  const record = (k) =>
    setTally((t) => {
      const n = { ...t, [k]: t[k] + 1 };
      write(`ttt-${k}`, n[k]);
      return n;
    });

  const play = (i) => {
    if (board[i] || result || thinking) return;
    const nb = [...board];
    nb[i] = 'X';
    setBoard(nb);
    playSound('tick');
    const r = winner(nb);
    if (r) return finish(r);
    setThinking(true);
    setTimeout(() => {
      const free = nb.map((v, j) => (v ? null : j)).filter((v) => v !== null);
      const pick = mode === 'easy' && Math.random() < 0.6 ? free[Math.floor(Math.random() * free.length)] : minimax(nb, true).i;
      const ab = [...nb];
      ab[pick] = 'O';
      setBoard(ab);
      setThinking(false);
      playSound('pop');
      const r2 = winner(ab);
      if (r2) finish(r2);
    }, 420);
  };

  const finish = (r) => {
    if (r.who === 'X') {
      record('w');
      confetti();
      toast('You beat the AI! 🏆');
    } else if (r.who === 'O') record('l');
    else {
      record('d');
      if (mode === 'hard') toast('A draw vs Unbeatable = a win 😄');
    }
  };

  const msg = result
    ? result.who === 'X'
      ? 'You won! 🎉'
      : result.who === 'O'
        ? 'The AI wins this one 🤖'
        : mode === 'hard'
          ? 'Draw — that’s a win against this AI 😄'
          : 'It’s a draw 🤝'
    : thinking
      ? 'AI is thinking…'
      : 'Your move — you are ✕';

  return (
    <div className="text-center">
      <div className="mb-4 flex justify-center gap-3">
        <Stat label="Wins" value={tally.w} />
        <Stat label="Draws" value={tally.d} />
        <Stat label="Losses" value={tally.l} />
      </div>
      <div className="glass mx-auto mb-5 inline-flex rounded-full p-1">
        {[['easy', 'Easy'], ['hard', 'Unbeatable']].map(([k, l]) => (
          <button
            key={k}
            onClick={() => {
              setMode(k);
              setBoard(Array(9).fill(null));
            }}
            className={`rounded-full px-4 py-1.5 text-[13px] transition-colors ${mode === k ? 'text-white' : 'text-bone-muted'}`}
            style={mode === k ? { background: 'linear-gradient(120deg, var(--g1), var(--g2))' } : undefined}
          >
            {l}
          </button>
        ))}
      </div>
      <div className="mx-auto grid w-full max-w-[300px] grid-cols-3 gap-2.5">
        {board.map((v, i) => (
          <button
            key={i}
            onClick={() => play(i)}
            className={`grid aspect-square place-items-center rounded-2xl border text-5xl font-light transition-colors ${
              result?.line.includes(i) ? 'border-transparent bg-gradient-to-br from-violet-400/40 to-pink-400/40' : 'border-fg/10 bg-fg/[0.04] hover:bg-fg/[0.08]'
            }`}
            aria-label={v ? `Cell ${i + 1}: ${v}` : `Cell ${i + 1}: empty`}
          >
            <AnimatePresence>
              {v && (
                <motion.span initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} className={v === 'X' ? 'text-gradient' : 'text-bone-muted'}>
                  {v === 'X' ? '✕' : '○'}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        ))}
      </div>
      <p className="mt-5 text-[15px]">{msg}</p>
      {result && (
        <button className={`${btn} mt-4`} onClick={() => setBoard(Array(9).fill(null))}>
          Play again
        </button>
      )}
    </div>
  );
}

