import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { playSound } from '../components/Extras';
import { Arrow, Reveal, Spot, ease } from '../components/ui';
import LongHorizon from './lab/LongHorizon';
import TaskGallery from './lab/TaskGallery';

const grad = { background: 'linear-gradient(135deg, var(--g1), var(--g2) 60%, var(--g3))' };

function Head({ n, title, accent, sub }) {
  return (
    <Reveal className="mb-8">
      <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-bone-muted">
        <span className="text-gradient font-semibold">{n}</span>
        <span className="h-3 w-px bg-fg/15" /> Experiment
      </span>
      <h2 className="mt-5 text-[clamp(2rem,4.4vw,3.5rem)] font-medium leading-tight tracking-tightest">
        {title} <span className="text-gradient font-serif font-normal italic">{accent}</span>
      </h2>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-bone-muted">{sub}</p>
    </Reveal>
  );
}

/* ---------------------------------------------------- 1. Eval pipeline */

const STAGES = [
  { icon: '🗂️', t: 'Dataset', d: 'Curate tasks and check dataset quality — clear prompts, correct references, no leaks.' },
  { icon: '🐳', t: 'Environment', d: 'Build a reproducible Docker image per repository, for every CPU architecture.' },
  { icon: '🤖', t: 'Model run', d: 'The model attempts each task inside the isolated container.' },
  { icon: '🧪', t: 'Golden patch', d: 'Outputs are verified against a known-good reference solution and its tests.' },
  { icon: '📊', t: 'Report', d: 'Scores, failure modes and regressions roll up into a benchmark report.' },
];
const LOGS = [
  ['$ eval run --suite repo-bench --tasks 50', 0],
  ['✓ dataset validated · 50 tasks · 0 duplicates', 0],
  ['→ pulling eval-env:latest (linux/amd64, linux/arm64)', 1],
  ['✓ image built & smoke-tested on 2 architectures', 1],
  ['→ dispatching tasks to model…', 2],
  ['✓ 50/50 tasks completed', 2],
  ['→ applying golden patches & running test suites', 3],
  ['✓ verification finished', 3],
  ['→ aggregating results', 4],
];

function Pipeline() {
  const [stage, setStage] = useState(-1);
  const [logs, setLogs] = useState([]);
  const [report, setReport] = useState(null);
  const [focus, setFocus] = useState(0);
  const timers = useRef([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const run = () => {
    timers.current.forEach(clearTimeout);
    setLogs([]);
    setReport(null);
    LOGS.forEach(([line, s], i) => {
      timers.current.push(
        setTimeout(() => {
          setStage(s);
          setFocus(s);
          setLogs((l) => [...l, line]);
          playSound('tick');
        }, 450 + i * 620)
      );
    });
    timers.current.push(
      setTimeout(() => {
        const pass = 30 + Math.floor(Math.random() * 15);
        setReport({ pass, fail: 50 - pass - 2, err: 2, score: Math.round((pass / 50) * 100) });
        setStage(5);
        playSound('chime');
      }, 450 + LOGS.length * 620)
    );
  };

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <Spot className="p-6 md:p-8 lg:col-span-7">
        <div className="relative grid grid-cols-5 gap-2">
          <div className="absolute left-[10%] right-[10%] top-7 h-0.5 bg-fg/10" />
          <motion.div className="absolute left-[10%] top-7 h-0.5" style={grad} animate={{ width: `${(Math.min(Math.max(stage, 0), 4) / 4) * 80}%` }} transition={{ duration: 0.5, ease }} />
          {STAGES.map((s, i) => {
            const done = stage > i;
            const now = stage === i;
            return (
              <button key={s.t} onClick={() => setFocus(i)} className="relative z-10 flex flex-col items-center gap-2 text-center">
                <motion.span
                  animate={now ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                  transition={{ duration: 0.6, repeat: now ? Infinity : 0 }}
                  className={`grid h-14 w-14 place-items-center rounded-2xl border text-2xl ${done || now ? 'border-transparent shadow-[0_10px_30px_-8px_rgba(244,114,182,0.7)]' : 'border-fg/10 bg-ink-850'} ${focus === i ? 'ring-2 ring-accent/60' : ''}`}
                  style={done || now ? grad : undefined}
                >
                  {done ? '✓' : s.icon}
                </motion.span>
                <span className="text-[11px] font-medium sm:text-[12px]">{s.t}</span>
              </button>
            );
          })}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={focus} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-8 rounded-2xl border border-fg/10 bg-fg/[0.03] p-5">
            <p className="text-[15px] font-medium">
              {STAGES[focus].icon} {STAGES[focus].t}
            </p>
            <p className="mt-1.5 text-[14px] leading-relaxed text-bone-muted">{STAGES[focus].d}</p>
          </motion.div>
        </AnimatePresence>
        <button onClick={run} className="btn-primary mt-6 !px-6 !py-3">
          {stage === -1 ? '▶ Run an evaluation' : '↻ Run again'}
        </button>
      </Spot>

      <div className="flex flex-col gap-4 lg:col-span-5">
        <div className="flex-1 overflow-hidden rounded-[22px] border border-fg/10 bg-[#0b0a12] font-mono text-[12.5px] text-white/80">
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5 text-[11px] text-white/50">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            <span className="ml-2">eval.log</span>
          </div>
          <div className="min-h-[220px] space-y-1 p-4">
            {logs.length === 0 && <p className="text-white/40">Press “Run an evaluation” to start the simulation…</p>}
            {logs.map((l, i) => (
              <motion.p key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className={l.startsWith('✓') ? 'text-emerald-300' : l.startsWith('$') ? 'text-[#f0abfc]' : ''}>
                {l}
              </motion.p>
            ))}
          </div>
        </div>
        <AnimatePresence>
          {report && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <Spot className="p-5">
                <p className="eyebrow">Benchmark report · simulated</p>
                <div className="mt-3 flex items-end gap-4">
                  <p className="text-gradient text-5xl font-semibold">{report.score}%</p>
                  <p className="pb-1.5 text-[13px] text-bone-muted">resolved</p>
                </div>
                <div className="mt-4 flex h-2.5 overflow-hidden rounded-full">
                  <span className="bg-emerald-400" style={{ width: `${(report.pass / 50) * 100}%` }} />
                  <span className="bg-rose-400" style={{ width: `${(report.fail / 50) * 100}%` }} />
                  <span className="bg-amber-300" style={{ width: `${(report.err / 50) * 100}%` }} />
                </div>
                <p className="mt-2 text-[12px] text-bone-muted">
                  ✅ {report.pass} passed · ❌ {report.fail} failed · ⚠️ {report.err} env errors
                </p>
              </Spot>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ------------------------------------------------- 2. Token visualizer */

const TINTS = ['rgba(167,139,250,0.28)', 'rgba(244,114,182,0.28)', 'rgba(253,186,116,0.28)', 'rgba(103,232,249,0.25)'];

// Rough BPE-like split: words ≤ 4 chars stay whole, longer words break into ~4-char pieces.
function tokenize(text) {
  const out = [];
  (text.match(/\s?[A-Za-z]+|\s?\d{1,3}|\s?[^\sA-Za-z\d]|\s+/g) || []).forEach((piece) => {
    const lead = piece.startsWith(' ') ? ' ' : '';
    const core = piece.trimStart();
    if (/^[A-Za-z]+$/.test(core) && core.length > 6) {
      for (let i = 0; i < core.length; i += 4) out.push((i === 0 ? lead : '') + core.slice(i, i + 4));
    } else out.push(piece);
  });
  return out;
}

function Tokens() {
  const [text, setText] = useState('Evaluating large language models means measuring what they actually do — not what we hope they do. 🤖');
  const toks = useMemo(() => tokenize(text), [text]);
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return (
    <Spot className="p-6 md:p-8">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        className="w-full resize-none rounded-2xl border border-fg/10 bg-fg/[0.03] p-4 text-[15px] outline-none focus:border-accent/60"
        aria-label="Text to tokenize"
        placeholder="Type anything…"
      />
      <div className="mt-4 flex flex-wrap gap-2">
        {[
          ['Tokens (approx.)', toks.length],
          ['Words', words],
          ['Characters', text.length],
          ['Chars / token', toks.length ? (text.length / toks.length).toFixed(1) : '—'],
        ].map(([k, v]) => (
          <div key={k} className="glass rounded-2xl px-4 py-2.5">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone-dim">{k}</p>
            <p className="text-xl font-medium tabular-nums">{v}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 flex min-h-[80px] flex-wrap gap-y-1.5 rounded-2xl border border-fg/10 bg-ink-900/40 p-4 font-mono text-[14px] leading-relaxed">
        {toks.map((t, i) => (
          <span key={i} className="whitespace-pre rounded-[5px] px-[1px]" style={{ background: TINTS[i % TINTS.length] }} title={`token ${i + 1}`}>
            {t}
          </span>
        ))}
      </div>
      <p className="mt-3 text-[12px] text-bone-dim">An approximation for illustration — real tokenizers (BPE) learn their splits from data, so exact counts differ by model.</p>
    </Spot>
  );
}

/* ---------------------------------------------- 3. Be the evaluator */

const ROUNDS = [
  {
    prompt: 'What is the capital of Australia?',
    a: 'The capital of Australia is Canberra.',
    b: 'Sydney is the capital — it’s Australia’s largest and most famous city, home to the Opera House.',
    best: 'a',
    why: 'Factual accuracy beats confidence. B sounds fluent and detailed, but it’s wrong — a classic failure mode evaluators must catch.',
  },
  {
    prompt: 'Write a Python function that returns the square of a number.',
    a: 'def square(n):\n    return n * n',
    b: 'Squaring means multiplying a number by itself. In Python you can use the ** operator, for example 4 ** 2 equals 16. Functions are defined with def.',
    best: 'a',
    why: 'Helpfulness = doing what was asked. A delivers working code; B explains concepts but never writes the function.',
  },
  {
    prompt: 'Summarise in one sentence: “The meeting moved from Monday to Wednesday because the client was travelling.”',
    a: 'The meeting was rescheduled to Wednesday since the client was travelling on Monday.',
    b: 'The meeting was cancelled because the client is unavailable.',
    best: 'a',
    why: 'Faithfulness — a summary must not change facts. B says “cancelled”, which the source never stated (a hallucination).',
  },
  {
    prompt: 'How many r’s are in the word “strawberry”?',
    a: 'There are 2 r’s in “strawberry”.',
    b: 'Let’s spell it: s-t-r-a-w-b-e-r-r-y. The r’s are at positions 3, 8 and 9 — so there are 3.',
    best: 'b',
    why: 'Reasoning you can verify. B shows its work and gets it right; A is short but wrong. Character-counting is a known tricky case for LLMs because of tokenization.',
  },
];

function Evaluator() {
  const [i, setI] = useState(0);
  const [pick, setPick] = useState(null);
  const [score, setScore] = useState(0);
  const done = i >= ROUNDS.length;
  const r = ROUNDS[i];

  const choose = (k) => {
    if (pick) return;
    setPick(k);
    if (k === r.best) setScore((s) => s + 1);
    playSound(k === r.best ? 'pop' : 'tick');
  };

  if (done)
    return (
      <Spot className="p-8 text-center">
        <p className="text-5xl">{score === ROUNDS.length ? '🏆' : '🧠'}</p>
        <p className="mt-4 text-2xl font-medium">
          You agreed with the rubric on <span className="text-gradient font-semibold">{score}/{ROUNDS.length}</span>
        </p>
        <p className="mx-auto mt-2 max-w-md text-[14px] text-bone-muted">That’s the core of model evaluation: clear criteria — accuracy, helpfulness, faithfulness and verifiable reasoning — applied consistently at scale.</p>
        <button onClick={() => (setI(0), setPick(null), setScore(0))} className="btn-primary mt-6 !px-6 !py-3">
          Play again
        </button>
      </Spot>
    );

  return (
    <Spot className="p-6 md:p-8">
      <div className="flex items-center justify-between">
        <p className="eyebrow">
          Round {i + 1} / {ROUNDS.length}
        </p>
        <p className="text-[13px] text-bone-muted">Score: {score}</p>
      </div>
      <p className="mt-4 rounded-2xl border border-fg/10 bg-fg/[0.03] p-4 text-[15px]">
        <span className="mr-2 font-mono text-[11px] uppercase text-bone-dim">Prompt</span>
        {r.prompt}
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {['a', 'b'].map((k) => {
          const state = pick ? (k === r.best ? 'ok' : k === pick ? 'bad' : '') : '';
          return (
            <button
              key={k}
              onClick={() => choose(k)}
              className={`rounded-2xl border p-5 text-left transition-colors ${
                state === 'ok' ? 'border-emerald-400 bg-emerald-400/10' : state === 'bad' ? 'border-rose-400 bg-rose-400/10' : 'border-fg/10 bg-fg/[0.02] hover:border-fg/30'
              }`}
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-bone-dim">Model {k.toUpperCase()}</p>
              <p className="mt-2 whitespace-pre-wrap text-[14.5px] leading-relaxed">{r[k]}</p>
            </button>
          );
        })}
      </div>
      <AnimatePresence>
        {pick && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex flex-col gap-3 rounded-2xl border border-fg/10 bg-fg/[0.03] p-4 sm:flex-row sm:items-center">
            <p className="flex-1 text-[14px] leading-relaxed">
              <span className="font-semibold">{pick === r.best ? '✓ Agreed. ' : '✗ The rubric prefers Model ' + r.best.toUpperCase() + '. '}</span>
              <span className="text-bone-muted">{r.why}</span>
            </p>
            <button onClick={() => (setI(i + 1), setPick(null))} className="btn-primary shrink-0 !px-5 !py-2.5 text-[13px]">
              {i + 1 < ROUNDS.length ? 'Next →' : 'See result'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </Spot>
  );
}

/* ------------------------------------------------------ 4. pass@k */

// Unbiased estimator: pass@k = 1 − C(n−c, k) / C(n, k), computed as a stable product.
function passAtK(n, c, k) {
  if (n - c < k) return 1;
  let prod = 1;
  for (let i = n - c + 1; i <= n; i++) prod *= 1 - k / i;
  return 1 - prod;
}

function Slider({ label, value, min, max, onChange }) {
  return (
    <label className="block">
      <span className="flex justify-between text-[13px]">
        <span className="text-bone-muted">{label}</span>
        <span className="font-mono font-semibold">{value}</span>
      </span>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-2 w-full accent-pink-400" />
    </label>
  );
}

function PassAtK() {
  const [n, setN] = useState(20);
  const [c, setC] = useState(4);
  const [k, setK] = useState(5);
  const cc = Math.min(c, n);
  const kk = Math.min(k, n);
  const val = passAtK(n, cc, kk);
  const curve = Array.from({ length: Math.min(n, 20) }, (_, i) => passAtK(n, cc, i + 1));

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <Spot className="space-y-6 p-6 md:p-8 lg:col-span-5">
        <Slider label="n — samples generated per problem" value={n} min={1} max={100} onChange={setN} />
        <Slider label="c — samples that passed the tests" value={cc} min={0} max={n} onChange={setC} />
        <Slider label="k — attempts you allow" value={kk} min={1} max={n} onChange={setK} />
        <div className="rounded-2xl border border-fg/10 bg-fg/[0.03] p-4 font-mono text-[13px]">
          pass@k = 1 − C(n−c, k) / C(n, k)
        </div>
      </Spot>
      <Spot className="p-6 md:p-8 lg:col-span-7">
        <p className="eyebrow">Probability that at least one of k samples passes</p>
        <p className="text-gradient mt-3 text-6xl font-semibold tabular-nums">{(val * 100).toFixed(1)}%</p>
        <p className="mt-1 text-[13px] text-bone-muted">
          pass@{kk} with {cc} of {n} samples correct
        </p>
        <div className="mt-6 flex h-40 items-end gap-1">
          {curve.map((v, i) => (
            <div key={i} className="group relative flex-1">
              <motion.div
                className={`w-full rounded-t-md ${i + 1 === kk ? '' : 'opacity-40'}`}
                style={grad}
                animate={{ height: `${Math.max(2, v * 160)}px` }}
                transition={{ duration: 0.4, ease }}
              />
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 font-mono text-[9px] text-bone-dim">{i + 1}</span>
            </div>
          ))}
        </div>
        <p className="mt-8 text-[13px] leading-relaxed text-bone-muted">
          The standard metric for code-generation benchmarks: sample many solutions, count how many pass the unit tests, and estimate how likely a model is to succeed within <i>k</i> tries.
        </p>
      </Spot>
    </div>
  );
}

/* ---------------------------------------------------------------- page */

export default function LabPage() {
  useEffect(() => {
    document.title = 'AI Lab — Rishav Kumar';
  }, []);

  return (
    <main className="relative pb-24 pt-[104px] md:pt-[124px]">
      <div className="container-site">
        <a href="#/" className="link-underline text-[13px] text-bone-muted hover:text-bone">
          ← Back to portfolio
        </a>

        <div className="mt-10 max-w-4xl">
          <Reveal>
            <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-bone-muted">
              🧪 AI Lab · interactive
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mt-7 text-[clamp(3rem,8vw,7rem)] font-medium leading-[0.92] tracking-tightest">
              How I <span className="text-gradient font-serif font-normal italic">evaluate</span> AI
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-bone-muted">
              My day job is measuring what large language models can really do — and designing long-horizon, hard technical tasks that push frontier models below a 50% pass rate. These six experiments show the ideas behind that work. (Simulations and illustrative examples; no real models, client data or confidential tasks.)
            </p>
          </Reveal>
        </div>

        <section className="mt-24">
          <Head n="01" title="Anatomy of an" accent="eval pipeline" sub="From a curated dataset to a benchmark report — every step has to be reproducible. Click a stage to learn what happens there, then run a simulated evaluation." />
          <Pipeline />
        </section>

        <section className="mt-28">
          <Head n="02" title="How models" accent="read text" sub="LLMs don’t see words — they see tokens. Type below and watch your text split into the pieces a model would process." />
          <Tokens />
        </section>

        <section className="mt-28">
          <Head n="03" title="You be" accent="the evaluator" sub="Two models answered the same prompt. Which response is better? This is exactly the judgement evaluation pipelines encode as rubrics." />
          <Evaluator />
        </section>

        <section className="mt-28">
          <Head n="04" title="The maths of" accent="pass@k" sub="How do we score a model that writes code? Move the sliders to see the standard pass@k metric in action." />
          <PassAtK />
        </section>

        <section className="mt-28">
          <Head n="05" title="Long-horizon" accent="agent tasks" sub="Real engineering work takes dozens of steps. Replay an agent working through a long task — and watch where a failed run loses the thread." />
          <LongHorizon />
        </section>

        <section className="mt-28">
          <Head n="06" title="Tasks that beat" accent="frontier models" sub="Hard, verifiable technical tasks across debugging, DevOps, security and ML research — designed so that even frontier models pass less than half the time." />
          <TaskGallery />
        </section>

        <Reveal className="mt-28">
          <Spot className="relative overflow-hidden p-8 text-center md:p-14">
            <div className="pointer-events-none absolute -bottom-32 left-1/2 h-72 w-[600px] -translate-x-1/2 rounded-full opacity-40 blur-3xl" style={grad} />
            <h2 className="relative text-[clamp(2rem,5vw,3.75rem)] font-medium leading-tight tracking-tightest">
              Need AI that’s <span className="text-gradient font-serif font-normal italic">measured, not guessed?</span>
            </h2>
            <p className="relative mx-auto mt-4 max-w-lg text-[15px] text-bone-muted">From evaluation pipelines to AI-powered product features — let’s talk about what you’re building.</p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-3">
              <a href="#contact" className="btn-primary !px-8 !py-4">
                Start a conversation <Arrow />
              </a>
              <a href="#/resume" className="btn-ghost !px-8 !py-4">
                View my résumé
              </a>
            </div>
          </Spot>
        </Reveal>
      </div>
    </main>
  );
}
