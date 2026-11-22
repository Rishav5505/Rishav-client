import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { playSound } from '../../components/Extras';
import { Spot } from '../../components/ui';
import { tasks } from './tasks';

const grad = { background: 'linear-gradient(135deg, var(--g1), var(--g2) 60%, var(--g3))' };

// Tiny seeded PRNG so a replay is identical every time.
function rng(seed) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

// Per-task vocabulary so each replay reads like real work in that stack.
const VOCAB = {
  migrate: {
    files: ['src/server.js', 'src/routes/users.js', 'src/middleware/auth.js', 'tests/api.test.js', 'package.json', 'src/utils/errors.js', 'src/routes/orders.js'],
    grep: ['app.use', 'next(err)', 'res.status', 'router.param', 'async ('],
    edits: ['update async handler', 'replace deprecated API', 'fix error propagation', 'adjust route params', 'migrate middleware'],
    shell: ['npm ls --depth=0', 'git log --oneline -5', 'cat CHANGELOG.md | head'],
    unit: 'tests',
  },
  multiarch: {
    files: ['Dockerfile', 'setup.py', 'src/_native.c', 'pyproject.toml', '.github/workflows/build.yml', 'tests/test_native.py'],
    grep: ['FROM ', 'manylinux', 'platform', 'gcc', 'wheel'],
    edits: ['add build stage for arm64', 'pin base image digest', 'compile extension from source', 'cache pip wheels', 'set TARGETPLATFORM'],
    shell: ['docker buildx ls', 'docker buildx build --platform linux/arm64 .', 'uname -m', 'pip download --only-binary=:all: pkg'],
    unit: 'checks',
  },
  sqlite: {
    files: ['recover.py', 'events.jsonl', 'schema.sql', 'backup.db', 'tests/test_integrity.py'],
    grep: ['"type": "order', 'FOREIGN KEY', 'seq', 'deleted_at', 'malformed'],
    edits: ['replay events in sequence order', 'validate event payloads', 'apply deletes before upserts', 'rebuild indexes', 'add FK checks'],
    shell: ['sqlite3 backup.db ".tables"', 'wc -l events.jsonl', 'sqlite3 db "PRAGMA integrity_check"'],
    unit: 'checks',
  },
  repro: {
    files: ['train.py', 'requirements.txt', 'models/encoder.py', 'data/loader.py', 'configs/base.yaml', 'eval.py'],
    grep: ['torch.', 'seed', 'lr_scheduler', 'num_workers', 'deprecated'],
    edits: ['pin compatible torch version', 'fix removed API call', 'restore seed handling', 'match paper hyper-params', 'patch data loader'],
    shell: ['pip install -r requirements.txt', 'python -c "import torch;print(torch.__version__)"', 'python train.py --epochs 1'],
    unit: 'checks',
  },
};
const TOOLS = {
  read: { icon: '📂', name: 'read_file' },
  grep: { icon: '🔍', name: 'grep' },
  test: { icon: '▶️', name: 'run_tests' },
  edit: { icon: '✏️', name: 'edit_file' },
  shell: { icon: '💻', name: 'bash' },
  plan: { icon: '🧠', name: 'think' },
  done: { icon: '✅', name: 'submit' },
  fail: { icon: '⏱️', name: 'timeout' },
};

/** Builds an illustrative agent trajectory for a task. */
function buildRun(task, success) {
  const T = Math.min(task.horizon, 80);
  const N = 140;
  const r = rng(task.id.length * 97 + (success ? 1 : 7));
  const pick = (a) => a[Math.floor(r() * a.length)];
  const V = VOCAB[task.id] || VOCAB.migrate;
  const steps = [];
  let passing = Math.round(N * 0.58);
  const drift = Math.round(T * 0.55);
  let ctx = 4;

  for (let i = 0; i < T; i++) {
    const p = i / T;
    let kind;
    if (i === T - 1) kind = success ? 'done' : 'fail';
    else if (p < 0.14) kind = pick(['read', 'read', 'grep', 'shell']);
    else if (p < 0.2) kind = i % 2 ? 'test' : 'plan';
    else if (p > 0.9) kind = pick(['test', 'test', 'read']);
    else kind = pick(['edit', 'edit', 'test', 'read', 'grep']);
    if (!success && i === drift) kind = 'edit'; // the fateful edit
    if (!success && i === drift + 1) kind = 'test'; // …and the regression it causes

    let note = '';
    if (kind === 'edit') {
      if (!success && i === drift) {
        passing -= 27;
        note = 'drift';
      } else if (success || i < drift) passing = Math.min(N, passing + Math.round(2 + r() * 6));
      else passing = Math.max(60, Math.min(N - 30, passing + Math.round(r() * 8 - 4)));
    }
    if (success && i >= T - 3) passing = N;

    const f = pick(V.files);
    const text = {
      read: `${f} (${Math.round(40 + r() * 300)} lines)`,
      grep: `"${pick(V.grep)}" → ${Math.round(2 + r() * 30)} matches`,
      test: `${passing}/${N} ${V.unit} passing`,
      edit: note === 'drift' ? `${f} — broad rewrite that drops an earlier constraint` : `${f} — ${pick(V.edits)}`,
      shell: pick(V.shell),
      plan: pick(['List what is broken and where', 'Re-check failures before editing', 'Group fixes by module', 'Write down constraints to keep']),
      done: `All ${N} ${V.unit} passing — solution submitted`,
      fail: `Step budget exhausted at ${passing}/${N} ${V.unit} passing`,
    }[kind];
    ctx = Math.min(98, ctx + 1.1 + r() * 0.8);
    steps.push({ i, kind, text, passing: kind === 'test' || kind === 'done' || kind === 'fail' || kind === 'edit' ? passing : null, ctx: Math.round(ctx), drift: note === 'drift' });
  }
  // carry the last known pass count forward for the chart
  let last = Math.round(N * 0.58);
  steps.forEach((s) => (s.p = s.passing ?? last, (last = s.p)));
  return { steps, N, T, drift: success ? null : drift };
}

export default function LongHorizon() {
  const long = tasks.filter((t) => t.horizon >= 55);
  const [taskId, setTaskId] = useState(long[0].id);
  const [success, setSuccess] = useState(false);
  const [at, setAt] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(2);
  const task = tasks.find((t) => t.id === taskId);
  const run = useMemo(() => buildRun(task, success), [task, success]);
  const logRef = useRef(null);

  useEffect(() => {
    setAt(0);
    setPlaying(false);
  }, [taskId, success]);

  useEffect(() => {
    if (!playing) return;
    if (at >= run.T - 1) {
      setPlaying(false);
      playSound(success ? 'chime' : 'tick');
      return;
    }
    const t = setTimeout(() => setAt((a) => a + 1), 360 / speed);
    return () => clearTimeout(t);
  }, [playing, at, speed, run.T, success]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [at]);

  const cur = run.steps[at];
  const W = 600;
  const H = 180;
  const x = (i) => (i / (run.T - 1)) * W;
  const y = (p) => H - (p / run.N) * (H - 10) - 5;
  const path = run.steps.slice(0, at + 1).map((s, i) => `${i ? 'L' : 'M'}${x(s.i).toFixed(1)},${y(s.p).toFixed(1)}`).join(' ');
  const finished = at === run.T - 1;
  const toolCalls = at + 1;

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <Spot className="p-6 md:p-8 lg:col-span-7">
        {/* controls */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={taskId}
            onChange={(e) => setTaskId(e.target.value)}
            className="max-w-full flex-1 rounded-full border border-fg/10 bg-ink-850 px-4 py-2.5 text-[13px] outline-none focus:border-accent/60"
            aria-label="Choose a long-horizon task"
          >
            {long.map((t) => (
              <option key={t.id} value={t.id}>
                {t.icon} {t.title}
              </option>
            ))}
          </select>
          <div className="glass inline-flex rounded-full p-1">
            {[
              [true, '✅ Successful run'],
              [false, '⚠️ Failed run'],
            ].map(([v, l]) => (
              <button key={l} onClick={() => setSuccess(v)} className={`rounded-full px-3 py-1.5 text-[12px] ${success === v ? 'text-white' : 'text-bone-muted'}`} style={success === v ? grad : undefined}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* chart */}
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-[12px] text-bone-muted">
            <span>Verification checks passing over the trajectory</span>
            <span className="font-mono">
              {cur.p}/{run.N}
            </span>
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} className="h-44 w-full overflow-visible rounded-2xl border border-fg/10 bg-ink-900/40">
            <defs>
              <linearGradient id="lhg" x1="0" x2="1">
                <stop offset="0" stopColor="var(--g1)" />
                <stop offset="0.6" stopColor="var(--g2)" />
                <stop offset="1" stopColor="var(--g3)" />
              </linearGradient>
            </defs>
            {[0.25, 0.5, 0.75, 1].map((g) => (
              <line key={g} x1="0" x2={W} y1={y(run.N * g)} y2={y(run.N * g)} stroke="rgb(var(--fg-c) / 0.07)" strokeDasharray="4 6" />
            ))}
            {run.drift !== null && (
              <g opacity={at >= run.drift ? 1 : 0.35}>
                <line x1={x(run.drift)} x2={x(run.drift)} y1="0" y2={H} stroke="#fb7185" strokeDasharray="3 4" />
                <text x={x(run.drift) + 6} y="16" fill="#fb7185" fontSize="11">
                  context drift
                </text>
              </g>
            )}
            <path d={path} fill="none" stroke="url(#lhg)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
            <circle cx={x(cur.i)} cy={y(cur.p)} r="5" fill="var(--g2)" />
          </svg>
        </div>

        {/* scrubber */}
        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={() => (finished ? (setAt(0), setPlaying(true)) : setPlaying((p) => !p))}
            className="btn-primary shrink-0 !px-5 !py-2.5 text-[13px]"
          >
            {playing ? '❚❚ Pause' : finished ? '↻ Replay' : '▶ Play'}
          </button>
          <input type="range" min={0} max={run.T - 1} value={at} onChange={(e) => (setPlaying(false), setAt(Number(e.target.value)))} className="w-full accent-pink-400" aria-label="Scrub through steps" />
          <div className="glass inline-flex shrink-0 rounded-full p-0.5">
            {[1, 2, 4].map((s) => (
              <button key={s} onClick={() => setSpeed(s)} className={`rounded-full px-2.5 py-1 font-mono text-[11px] ${speed === s ? 'text-white' : 'text-bone-muted'}`} style={speed === s ? grad : undefined}>
                {s}×
              </button>
            ))}
          </div>
        </div>

        {/* stats */}
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            ['Step', `${at + 1}/${run.T}`],
            ['Tool calls', toolCalls],
            ['Context used', `${cur.ctx}%`],
            ['Status', finished ? (success ? 'Solved' : 'Failed') : playing ? 'Running' : 'Paused'],
          ].map(([k, v]) => (
            <div key={k} className="glass rounded-2xl px-3 py-2.5">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone-dim">{k}</p>
              <p className={`text-lg font-medium ${k === 'Status' && finished ? (success ? 'text-emerald-400' : 'text-rose-400') : ''}`}>{v}</p>
            </div>
          ))}
        </div>
      </Spot>

      {/* step log */}
      <div className="flex flex-col gap-4 lg:col-span-5">
        <div className="flex h-[440px] flex-col overflow-hidden rounded-[22px] border border-fg/10 bg-[#0b0a12] text-white/85">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5 font-mono text-[11px] text-white/50">
            <span>agent trajectory · {task.icon} {task.domain}</span>
            <span>horizon {task.horizon} steps</span>
          </div>
          <div ref={logRef} className="flex-1 space-y-1.5 overflow-y-auto p-3 font-mono text-[12px]" data-lenis-prevent>
            {run.steps.slice(0, at + 1).map((s) => (
              <motion.div
                key={s.i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex gap-2 rounded-lg px-2 py-1.5 ${s.drift ? 'bg-rose-500/15 text-rose-200' : s.kind === 'done' ? 'bg-emerald-500/15 text-emerald-200' : s.kind === 'fail' ? 'bg-rose-500/15 text-rose-200' : ''}`}
              >
                <span className="w-7 shrink-0 text-white/35">{String(s.i + 1).padStart(2, '0')}</span>
                <span>{TOOLS[s.kind].icon}</span>
                <span className="shrink-0 text-[#f0abfc]">{TOOLS[s.kind].name}</span>
                <span className="truncate text-white/70">{s.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
        <AnimatePresence>
          {finished && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Spot className="p-5">
                <p className="text-[15px] font-medium">{success ? '✅ What the successful run did right' : '⚠️ Why this run failed'}</p>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-bone-muted">
                  {success
                    ? 'It reproduced the problem first, planned the changes module by module and re-ran the full suite after every group of edits — staying coherent for the whole horizon.'
                    : `At step ${run.drift + 1}, deep into the task, the agent made a broad edit to a shared file and dropped a constraint it had discovered back in the exploration phase. Checks regressed and it never fully recovered before the step budget ran out — the classic long-horizon failure mode.`}
                </p>
              </Spot>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
