import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { confetti, playSound } from '../components/Extras';
import { G, Result, Stat, Stats, btn, ghost, randInt, shuffle, useBest, useCountdown } from './shared';

const grad = { background: 'linear-gradient(135deg, var(--g1), var(--g2) 60%, var(--g3))' };

/** Plays a pitched tone (independent of the UI sound setting, games need it). */
let ctx;
function tone(freq, dur = 0.25) {
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'triangle';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + dur + 0.05);
  } catch {}
}

/* ---------------------------------------------------------- Echo Pattern */

const PADS = [
  { c: '#a78bfa', f: 329.6 },
  { c: '#f472b6', f: 392.0 },
  { c: '#fdba74', f: 523.3 },
  { c: '#67e8f9', f: 659.3 },
];

export function EchoPattern() {
  const [best, submit] = useBest('echo');
  const [seq, setSeq] = useState([]);
  const [input, setInput] = useState([]);
  const [lit, setLit] = useState(-1);
  const [state, setState] = useState('idle'); // idle | show | input | over
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const show = (s) => {
    setState('show');
    s.forEach((p, i) => {
      timers.current.push(setTimeout(() => (setLit(p), tone(PADS[p].f)), 600 + i * 560));
      timers.current.push(setTimeout(() => setLit(-1), 600 + i * 560 + 330));
    });
    timers.current.push(setTimeout(() => setState('input'), 600 + s.length * 560));
  };
  const start = () => {
    const s = [randInt(0, 3)];
    setSeq(s);
    setInput([]);
    show(s);
  };
  const tap = (p) => {
    if (state !== 'input') return;
    tone(PADS[p].f, 0.18);
    setLit(p);
    setTimeout(() => setLit(-1), 160);
    const next = [...input, p];
    if (seq[next.length - 1] !== p) {
      setState('over');
      submit(seq.length - 1);
      return;
    }
    if (next.length === seq.length) {
      const s = [...seq, randInt(0, 3)];
      setSeq(s);
      setInput([]);
      show(s);
    } else setInput(next);
  };

  return (
    <div className="text-center">
      <Stats>
        <Stat label="Round" value={seq.length || '—'} />
        <Stat label="Best" value={best ?? '—'} />
      </Stats>
      <div className="mx-auto grid max-w-[300px] grid-cols-2 gap-3">
        {PADS.map((p, i) => (
          <button
            key={i}
            onPointerDown={() => tap(i)}
            className="aspect-square rounded-3xl transition-all duration-150"
            style={{ background: p.c, opacity: lit === i ? 1 : 0.32, boxShadow: lit === i ? `0 0 40px ${p.c}` : 'none', transform: lit === i ? 'scale(0.96)' : 'none' }}
            aria-label={`Pad ${i + 1}`}
          />
        ))}
      </div>
      <p className="mt-4 h-5 text-[14px] text-bone-muted">
        {state === 'show' ? 'Watch & listen…' : state === 'input' ? `Your turn — ${input.length}/${seq.length}` : ''}
      </p>
      {(state === 'idle' || state === 'over') && (
        <div className="mt-2">
          {state === 'over' && (
            <Result>
              You remembered <G>{seq.length - 1}</G> steps 🎵
            </Result>
          )}
          <button className={btn} onClick={start}>
            {state === 'over' ? 'Play again' : '▶ Start'}
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------ Math Sprint */

function problem(level) {
  const ops = level < 5 ? ['+', '-'] : ['+', '-', '×'];
  const op = ops[randInt(0, ops.length - 1)];
  const max = 10 + level * 4;
  let a = randInt(2, max);
  let b = randInt(2, op === '×' ? 12 : max);
  if (op === '-' && b > a) [a, b] = [b, a];
  const ans = op === '+' ? a + b : op === '-' ? a - b : a * b;
  const opts = shuffle([ans, ans + randInt(1, 5), ans - randInt(1, 5), ans + randInt(6, 12)].filter((v, i, s) => s.indexOf(v) === i)).slice(0, 4);
  return { q: `${a} ${op} ${b}`, ans, opts: opts.includes(ans) ? opts : shuffle([ans, ...opts.slice(0, 3)]) };
}

export function MathSprint() {
  const [best, submit] = useBest('math');
  const [state, setState] = useState('idle');
  const [score, setScore] = useState(0);
  const [p, setP] = useState(() => problem(0));
  const [flash, setFlash] = useState('');
  const sRef = useRef(0);
  const [time, resetTime] = useCountdown(30, state === 'play', () => {
    setState('over');
    submit(sRef.current);
  });
  const start = () => {
    sRef.current = 0;
    setScore(0);
    setP(problem(0));
    resetTime();
    setState('play');
  };
  const answer = (v) => {
    if (state !== 'play') return;
    const ok = v === p.ans;
    if (ok) {
      sRef.current += 1;
      setScore(sRef.current);
      playSound('pop');
    } else playSound('tick');
    setFlash(ok ? 'ok' : 'bad');
    setTimeout(() => setFlash(''), 220);
    setP(problem(sRef.current));
  };

  return (
    <div className="text-center">
      <Stats>
        <Stat label="Score" value={score} />
        <Stat label="Time" value={`${time}s`} />
        <Stat label="Best" value={best ?? '—'} />
      </Stats>
      {state === 'play' ? (
        <>
          <motion.div
            key={p.q}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`mx-auto mb-5 max-w-sm rounded-3xl border py-10 text-5xl font-semibold tabular-nums transition-colors ${flash === 'ok' ? 'border-emerald-400/60' : flash === 'bad' ? 'border-rose-400/60' : 'border-fg/10'}`}
          >
            {p.q} = ?
          </motion.div>
          <div className="mx-auto grid max-w-sm grid-cols-2 gap-2.5">
            {p.opts.map((o) => (
              <button key={o} onClick={() => answer(o)} className="glass rounded-2xl py-4 text-2xl font-semibold tabular-nums active:scale-95">
                {o}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="mx-auto max-w-sm rounded-3xl border border-fg/10 p-8">
          {state === 'over' ? (
            <Result>
              <G>{score}</G> correct in 30s 🧮
            </Result>
          ) : (
            <p className="mb-4 text-[14px] text-bone-muted">Answer as many as you can in 30 seconds. It gets harder as you go.</p>
          )}
          <button className={btn} onClick={start}>
            {state === 'over' ? 'Play again' : '▶ Start'}
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------ Color Clash */

const COLORS = [
  ['RED', '#f87171'],
  ['BLUE', '#60a5fa'],
  ['GREEN', '#4ade80'],
  ['PINK', '#f472b6'],
  ['YELLOW', '#facc15'],
  ['PURPLE', '#a78bfa'],
];

export function ColorClash() {
  const [best, submit] = useBest('clash');
  const [state, setState] = useState('idle');
  const [score, setScore] = useState(0);
  const [card, setCard] = useState(null);
  const sRef = useRef(0);
  const make = () => {
    const word = randInt(0, 5);
    const ink = Math.random() < 0.5 ? word : randInt(0, 5);
    return { word, ink };
  };
  const [time, resetTime] = useCountdown(30, state === 'play', () => {
    setState('over');
    submit(sRef.current);
  });
  const start = () => {
    sRef.current = 0;
    setScore(0);
    setCard(make());
    resetTime();
    setState('play');
  };
  const answer = (yes) => {
    if (state !== 'play') return;
    const match = card.word === card.ink;
    if (yes === match) {
      sRef.current += 1;
      setScore(sRef.current);
      playSound('pop');
    } else {
      sRef.current = Math.max(0, sRef.current - 1);
      setScore(sRef.current);
      playSound('tick');
    }
    setCard(make());
  };

  return (
    <div className="text-center">
      <Stats>
        <Stat label="Score" value={score} />
        <Stat label="Time" value={`${time}s`} />
        <Stat label="Best" value={best ?? '—'} />
      </Stats>
      {state === 'play' && card ? (
        <>
          <p className="mb-3 text-[13px] text-bone-muted">Does the word match its ink colour?</p>
          <motion.div key={`${card.word}-${card.ink}-${score}`} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mx-auto mb-6 max-w-sm rounded-3xl border border-fg/10 py-12 text-6xl font-black tracking-tight" style={{ color: COLORS[card.ink][1] }}>
            {COLORS[card.word][0]}
          </motion.div>
          <div className="mx-auto flex max-w-sm gap-3">
            <button onClick={() => answer(false)} className="flex-1 rounded-2xl border border-rose-400/40 bg-rose-400/10 py-4 text-lg font-semibold text-rose-300 active:scale-95">
              ✕ No
            </button>
            <button onClick={() => answer(true)} className="flex-1 rounded-2xl border border-emerald-400/40 bg-emerald-400/10 py-4 text-lg font-semibold text-emerald-300 active:scale-95">
              ✓ Yes
            </button>
          </div>
        </>
      ) : (
        <div className="mx-auto max-w-sm rounded-3xl border border-fg/10 p-8">
          {state === 'over' ? (
            <Result>
              Brain score: <G>{score}</G> 🎨
            </Result>
          ) : (
            <p className="mb-4 text-[14px] text-bone-muted">Your brain reads the word — but does it match the ink? +1 right, −1 wrong. 30 seconds.</p>
          )}
          <button className={btn} onClick={start}>
            {state === 'over' ? 'Play again' : '▶ Start'}
          </button>
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------------------- Tech Quiz */

const QUIZ = [
  ['What does “API” stand for?', 'Application Programming Interface', ['Advanced Program Integration', 'Automated Process Interface', 'Application Protocol Index']],
  ['Which language runs natively in the browser?', 'JavaScript', ['Python', 'Java', 'C#']],
  ['What does “LLM” stand for?', 'Large Language Model', ['Linear Learning Machine', 'Logical Language Module', 'Long Latency Memory']],
  ['Which tool packages apps into containers?', 'Docker', ['Webpack', 'Jenkins', 'Nginx']],
  ['What does “HTTP 404” mean?', 'Not Found', ['Server Error', 'Unauthorized', 'Moved Permanently']],
  ['React is primarily a…', 'UI library', ['Database', 'Backend framework', 'CSS preprocessor']],
  ['Which is a NoSQL database?', 'MongoDB', ['PostgreSQL', 'MySQL', 'SQLite']],
  ['What does “CSS” stand for?', 'Cascading Style Sheets', ['Computer Style System', 'Creative Styling Syntax', 'Coded Sheet Styles']],
  ['Git command to create a new branch and switch to it?', 'git checkout -b', ['git branch -m', 'git merge -b', 'git push -b']],
  ['In ML, “overfitting” means the model…', 'memorises training data, generalises poorly', ['trains too slowly', 'has too few parameters', 'ignores the training data']],
  ['What does RL stand for in AI?', 'Reinforcement Learning', ['Recursive Logic', 'Random Layers', 'Regression Loss']],
  ['Which HTTP method is typically used to create a resource?', 'POST', ['GET', 'DELETE', 'HEAD']],
  ['JSON stands for…', 'JavaScript Object Notation', ['Java Serial Object Network', 'JavaScript Online Node', 'Joint Structured Object Notation']],
  ['Which company created TypeScript?', 'Microsoft', ['Google', 'Meta', 'Mozilla']],
  ['What is a “token” for an LLM?', 'A chunk of text the model processes', ['A login password', 'A GPU core', 'A database row']],
  ['Big-O of binary search?', 'O(log n)', ['O(n)', 'O(n²)', 'O(1)']],
  ['Which port does HTTPS use by default?', '443', ['80', '22', '8080']],
  ['What does “CI/CD” stand for?', 'Continuous Integration / Continuous Delivery', ['Code Inspection / Code Deploy', 'Central Index / Central Data', 'Cloud Instance / Cloud Domain']],
  ['Node.js is built on which engine?', 'V8', ['SpiderMonkey', 'Chakra', 'JavaScriptCore']],
  ['Which data structure is FIFO?', 'Queue', ['Stack', 'Tree', 'Graph']],
  ['“Agent evals” measure how well an AI agent…', 'completes multi-step tasks', ['renders web pages', 'compresses images', 'stores data']],
  ['Tailwind CSS is a…', 'utility-first CSS framework', ['JavaScript bundler', 'database ORM', 'testing library']],
  ['What does “SQL” stand for?', 'Structured Query Language', ['Simple Query Logic', 'Sequential Query List', 'Server Quick Language']],
  ['Which keyword declares a constant in JavaScript?', 'const', ['let', 'var', 'static']],
  ['What does a load balancer do?', 'Distributes traffic across servers', ['Encrypts passwords', 'Compiles code', 'Stores backups']],
];

export function TechQuiz() {
  const [best, submit] = useBest('quiz');
  const [qs, setQs] = useState(null);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState(null);
  const start = () => {
    setQs(shuffle(QUIZ).slice(0, 10).map(([q, a, w]) => ({ q, a, opts: shuffle([a, ...w]) })));
    setI(0);
    setScore(0);
    setPicked(null);
  };
  const done = qs && i >= qs.length;
  useEffect(() => {
    if (!done) return;
    const prev = best;
    const better = submit(score);
    if (score >= 8 && !(better && prev !== null)) confetti();
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  const pick = (o) => {
    if (picked) return;
    setPicked(o);
    const ok = o === qs[i].a;
    if (ok) setScore((s) => s + 1);
    playSound(ok ? 'pop' : 'tick');
    setTimeout(() => {
      setPicked(null);
      setI((x) => x + 1);
    }, 900);
  };

  if (!qs || done)
    return (
      <div className="text-center">
        <Stats>
          <Stat label="Best" value={best !== null ? `${best}/10` : '—'} />
        </Stats>
        <div className="mx-auto max-w-sm rounded-3xl border border-fg/10 p-8">
          {done ? (
            <Result>
              You scored <G>{score}/10</G> {score >= 8 ? '🏆' : score >= 5 ? '👏' : '📚'}
            </Result>
          ) : (
            <p className="mb-4 text-[14px] text-bone-muted">10 random questions on web, dev and AI. How much do you know?</p>
          )}
          <button className={btn} onClick={start}>
            {done ? 'New quiz' : '▶ Start quiz'}
          </button>
        </div>
      </div>
    );

  const q = qs[i];
  return (
    <div className="text-center">
      <Stats>
        <Stat label="Question" value={`${i + 1}/10`} />
        <Stat label="Score" value={score} />
      </Stats>
      <div className="mx-auto mb-4 h-1.5 max-w-md overflow-hidden rounded-full bg-fg/10">
        <motion.div className="h-full rounded-full" style={grad} animate={{ width: `${(i / 10) * 100}%` }} />
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={i} initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }}>
          <p className="mx-auto mb-5 max-w-md text-xl font-medium leading-snug">{q.q}</p>
          <div className="mx-auto grid max-w-md gap-2">
            {q.opts.map((o) => {
              const state = picked ? (o === q.a ? 'ok' : o === picked ? 'bad' : '') : '';
              return (
                <button
                  key={o}
                  onClick={() => pick(o)}
                  className={`rounded-2xl border px-4 py-3.5 text-left text-[15px] transition-colors ${
                    state === 'ok' ? 'border-emerald-400 bg-emerald-400/15' : state === 'bad' ? 'border-rose-400 bg-rose-400/15' : 'border-fg/10 bg-fg/[0.03] hover:border-fg/30'
                  }`}
                >
                  {o}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------- Unscramble */

const WORDS = ['REACT', 'PYTHON', 'DOCKER', 'KERNEL', 'TENSOR', 'BINARY', 'SERVER', 'CACHE', 'AGENT', 'PROMPT', 'VECTOR', 'GITHUB', 'DEPLOY', 'SCHEMA', 'ROUTER', 'NEURAL', 'MODEL', 'TOKEN', 'LAMBDA', 'CLOUD', 'DEBUG', 'BACKEND', 'NETWORK', 'COMPILER', 'DATABASE', 'FRONTEND', 'JAVASCRIPT', 'ALGORITHM'];
const scrambleWord = (w) => {
  let s;
  do s = shuffle(w.split('')).join('');
  while (s === w);
  return s;
};

export function Unscramble() {
  const [best, submit] = useBest('unscramble');
  const [state, setState] = useState('idle');
  const [word, setWord] = useState('');
  const [mixed, setMixed] = useState('');
  const [val, setVal] = useState('');
  const [score, setScore] = useState(0);
  const [shake, setShake] = useState(false);
  const sRef = useRef(0);
  const next = () => {
    const w = WORDS[randInt(0, WORDS.length - 1)];
    setWord(w);
    setMixed(scrambleWord(w));
    setVal('');
  };
  const [time, resetTime] = useCountdown(60, state === 'play', () => {
    setState('over');
    submit(sRef.current);
  });
  const start = () => {
    sRef.current = 0;
    setScore(0);
    next();
    resetTime();
    setState('play');
  };
  const check = (e) => {
    e.preventDefault();
    if (val.trim().toUpperCase() === word) {
      sRef.current += 1;
      setScore(sRef.current);
      playSound('pop');
      next();
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      playSound('tick');
    }
  };

  return (
    <div className="text-center">
      <Stats>
        <Stat label="Solved" value={score} />
        <Stat label="Time" value={`${time}s`} />
        <Stat label="Best" value={best ?? '—'} />
      </Stats>
      {state === 'play' ? (
        <form onSubmit={check}>
          <motion.div animate={shake ? { x: [0, -10, 10, -6, 6, 0] } : {}} className="mb-5 flex flex-wrap justify-center gap-1.5">
            {mixed.split('').map((ch, i) => (
              <span key={i} className="grid h-12 w-10 place-items-center rounded-xl font-mono text-2xl font-bold text-white sm:h-14 sm:w-12" style={grad}>
                {ch}
              </span>
            ))}
          </motion.div>
          <input
            autoFocus
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder="Type the tech word…"
            className="mx-auto block w-full max-w-xs rounded-full border border-fg/15 bg-fg/[0.04] px-5 py-3 text-center font-mono text-lg uppercase outline-none focus:border-accent"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
          />
          <div className="mt-4 flex justify-center gap-2">
            <button type="submit" className={btn}>
              Check
            </button>
            <button type="button" className={ghost} onClick={next}>
              Skip
            </button>
          </div>
        </form>
      ) : (
        <div className="mx-auto max-w-sm rounded-3xl border border-fg/10 p-8">
          {state === 'over' ? (
            <Result>
              <G>{score}</G> words unscrambled 🔤
            </Result>
          ) : (
            <p className="mb-4 text-[14px] text-bone-muted">Unscramble as many tech words as you can in 60 seconds.</p>
          )}
          <button className={btn} onClick={start}>
            {state === 'over' ? 'Play again' : '▶ Start'}
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------- Word Rescue */
// Guess the hidden tech word letter by letter before the robot's battery runs out.

export function WordRescue() {
  const [best, submit] = useBest('rescue');
  const [word, setWord] = useState(() => WORDS[randInt(0, WORDS.length - 1)]);
  const [guessed, setGuessed] = useState([]);
  const [streak, setStreak] = useState(0);
  const lives = 6;
  const wrong = guessed.filter((g) => !word.includes(g)).length;
  const won = word.split('').every((c) => guessed.includes(c));
  const lost = wrong >= lives;

  useEffect(() => {
    if (won) {
      const s = streak + 1;
      setStreak(s);
      submit(s);
      playSound('chime');
    }
    if (lost) setStreak(0);
  }, [won, lost]); // eslint-disable-line react-hooks/exhaustive-deps

  const guess = (l) => {
    if (won || lost || guessed.includes(l)) return;
    setGuessed([...guessed, l]);
    playSound(word.includes(l) ? 'pop' : 'tick');
  };
  const next = () => {
    setWord(WORDS[randInt(0, WORDS.length - 1)]);
    setGuessed([]);
  };

  useEffect(() => {
    const k = (e) => {
      if (/^[a-z]$/i.test(e.key) && !(e.target instanceof HTMLInputElement)) {
        e.stopPropagation();
        guess(e.key.toUpperCase());
      }
    };
    window.addEventListener('keydown', k, true);
    return () => window.removeEventListener('keydown', k, true);
  });

  const battery = Math.max(0, lives - wrong);

  return (
    <div className="text-center">
      <Stats>
        <Stat label="Streak" value={streak} />
        <Stat label="Best" value={best ?? '—'} />
      </Stats>
      <div className="mb-4 flex items-center justify-center gap-3">
        <span className="text-4xl">{lost ? '🪫' : won ? '🤖' : '🔋'}</span>
        <div className="flex gap-1">
          {Array.from({ length: lives }, (_, i) => (
            <span key={i} className={`h-6 w-3 rounded-sm transition-colors ${i < battery ? '' : 'bg-fg/10'}`} style={i < battery ? grad : undefined} />
          ))}
        </div>
      </div>
      <div className="mb-6 flex flex-wrap justify-center gap-1.5">
        {word.split('').map((c, i) => (
          <span key={i} className={`grid h-12 w-9 place-items-center border-b-2 font-mono text-2xl font-bold ${guessed.includes(c) || lost ? '' : 'text-transparent'} ${lost && !guessed.includes(c) ? 'text-rose-400' : ''} border-fg/30`}>
            {c}
          </span>
        ))}
      </div>
      <div className="mx-auto grid max-w-md grid-cols-9 gap-1.5">
        {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((l) => {
          const used = guessed.includes(l);
          const hit = used && word.includes(l);
          return (
            <button
              key={l}
              onClick={() => guess(l)}
              disabled={used || won || lost}
              className={`aspect-square rounded-lg text-[13px] font-semibold transition-colors ${hit ? 'text-white' : used ? 'bg-fg/[0.03] text-bone-dim line-through' : 'bg-fg/[0.07] hover:bg-fg/[0.14]'}`}
              style={hit ? grad : undefined}
            >
              {l}
            </button>
          );
        })}
      </div>
      {(won || lost) && (
        <div className="mt-5">
          <Result>{won ? <>Robot rescued! Streak <G>{streak}</G> 🤖</> : <>Battery dead — it was <G>{word}</G></>}</Result>
          <button className={btn} onClick={next}>
            Next word →
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------ Binary Blitz */

export function BinaryBlitz() {
  const [best, submit] = useBest('binary');
  const [state, setState] = useState('idle');
  const [target, setTarget] = useState(0);
  const [bits, setBits] = useState(Array(8).fill(0));
  const [score, setScore] = useState(0);
  const sRef = useRef(0);
  const value = bits.reduce((a, b, i) => a + b * 2 ** (7 - i), 0);
  const [time, resetTime] = useCountdown(60, state === 'play', () => {
    setState('over');
    submit(sRef.current);
  });
  const next = (lvl) => {
    setTarget(randInt(1, Math.min(255, 15 + lvl * 24)));
    setBits(Array(8).fill(0));
  };
  const start = () => {
    sRef.current = 0;
    setScore(0);
    next(0);
    resetTime();
    setState('play');
  };
  useEffect(() => {
    if (state === 'play' && value === target) {
      sRef.current += 1;
      setScore(sRef.current);
      playSound('pop');
      const t = setTimeout(() => next(sRef.current), 250);
      return () => clearTimeout(t);
    }
  }, [value, target, state]);

  return (
    <div className="text-center">
      <Stats>
        <Stat label="Solved" value={score} />
        <Stat label="Time" value={`${time}s`} />
        <Stat label="Best" value={best ?? '—'} />
      </Stats>
      {state === 'play' ? (
        <>
          <p className="text-[13px] text-bone-muted">Flip the bits to make</p>
          <p className="text-gradient mb-1 text-6xl font-bold tabular-nums">{target}</p>
          <p className="mb-5 font-mono text-[13px] text-bone-dim">current: {value}</p>
          <div className="mx-auto grid max-w-md grid-cols-8 gap-1.5">
            {bits.map((b, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <button
                  onClick={() => {
                    setBits(bits.map((x, j) => (j === i ? 1 - x : x)));
                    playSound('tick');
                  }}
                  className={`aspect-[3/4] w-full rounded-xl font-mono text-2xl font-bold transition-all ${b ? 'text-white shadow-[0_0_20px_rgba(244,114,182,0.6)]' : 'border border-fg/10 bg-fg/[0.04] text-bone-dim'}`}
                  style={b ? grad : undefined}
                >
                  {b}
                </button>
                <span className="font-mono text-[10px] text-bone-dim">{2 ** (7 - i)}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="mx-auto max-w-sm rounded-3xl border border-fg/10 p-8">
          {state === 'over' ? (
            <Result>
              <G>{score}</G> numbers in binary 💾
            </Result>
          ) : (
            <p className="mb-4 text-[14px] text-bone-muted">Toggle 8 bits to build each number. Speak the language of machines — 60 seconds.</p>
          )}
          <button className={btn} onClick={start}>
            {state === 'over' ? 'Play again' : '▶ Start'}
          </button>
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------------- Guess My Number */

export function GuessNumber() {
  const [best, submit] = useBest('guess', true);
  const [secret, setSecret] = useState(() => randInt(1, 100));
  const [val, setVal] = useState('');
  const [log, setLog] = useState([]);
  const [lo, setLo] = useState(1);
  const [hi, setHi] = useState(100);
  const won = log.length && log[log.length - 1].n === secret;

  const guess = (e) => {
    e.preventDefault();
    const n = parseInt(val, 10);
    if (!n || n < 1 || n > 100 || won) return;
    const entry = { n, hint: n === secret ? '🎯' : n < secret ? 'Higher ↑' : 'Lower ↓' };
    const next = [...log, entry];
    setLog(next);
    setVal('');
    if (n < secret) setLo(Math.max(lo, n + 1));
    if (n > secret) setHi(Math.min(hi, n - 1));
    playSound(n === secret ? 'chime' : 'tick');
    if (n === secret) {
      const prev = best;
      const better = submit(next.length);
      if (!(better && prev !== null)) confetti();
    }
  };
  const reset = () => {
    setSecret(randInt(1, 100));
    setLog([]);
    setLo(1);
    setHi(100);
  };

  return (
    <div className="text-center">
      <Stats>
        <Stat label="Guesses" value={log.length} />
        <Stat label="Range" value={`${lo}–${hi}`} />
        <Stat label="Best" value={best ?? '—'} />
      </Stats>
      <div className="mx-auto mb-5 h-3 max-w-md overflow-hidden rounded-full bg-fg/10">
        <motion.div className="h-full rounded-full" style={grad} animate={{ marginLeft: `${lo - 1}%`, width: `${hi - lo + 1}%` }} />
      </div>
      {won ? (
        <div>
          <Result>
            It was <G>{secret}</G> — found in {log.length} guesses 🎯
          </Result>
          <button className={btn} onClick={reset}>
            Play again
          </button>
        </div>
      ) : (
        <form onSubmit={guess} className="flex justify-center gap-2">
          <input
            autoFocus
            type="number"
            min={1}
            max={100}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder="1 – 100"
            className="w-36 rounded-full border border-fg/15 bg-fg/[0.04] px-5 py-3 text-center text-lg outline-none focus:border-accent"
          />
          <button type="submit" className={btn}>
            Guess
          </button>
        </form>
      )}
      <div className="mx-auto mt-5 flex max-w-md flex-wrap justify-center gap-1.5">
        {log.map((l, i) => (
          <span key={i} className="rounded-full border border-fg/10 bg-fg/[0.04] px-3 py-1 text-[13px]">
            {l.n} <span className="text-bone-muted">{l.hint}</span>
          </span>
        ))}
      </div>
      <p className="mt-4 text-[12px] text-bone-dim">Tip: a binary search finds any number in 7 guesses or fewer.</p>
    </div>
  );
}
