import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { lockScroll } from '../../components/Extras';
import { Spot, Tilt, ease } from '../../components/ui';
import { MODEL_NAME, RESULTS_ARE_REAL, tasks } from './tasks';

const grad = { background: 'linear-gradient(135deg, var(--g1), var(--g2) 60%, var(--g3))' };
const hard = (p) => p < 50;

function PassBar({ value }) {
  return (
    <div>
      <div className="flex items-baseline justify-between text-[12px]">
        <span className="text-bone-muted">{MODEL_NAME} pass rate</span>
        <span className={`font-mono font-semibold ${hard(value) ? 'text-rose-400' : 'text-emerald-400'}`}>{value}%</span>
      </div>
      <div className="relative mt-1.5 h-2 overflow-hidden rounded-full bg-fg/10">
        <motion.div className="h-full rounded-full" style={hard(value) ? { background: 'linear-gradient(90deg, #fb7185, #f472b6)' } : grad} initial={{ width: 0 }} whileInView={{ width: `${value}%` }} viewport={{ once: true }} transition={{ duration: 1, ease }} />
        <span className="absolute inset-y-0 left-1/2 w-px bg-fg/40" title="50% line" />
      </div>
    </div>
  );
}

function TaskModal({ t, onClose }) {
  useEffect(() => {
    lockScroll(true);
    const k = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => {
      lockScroll(false);
      window.removeEventListener('keydown', k);
    };
  }, [onClose]);
  return (
    <motion.div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-3 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={t.title}
        initial={{ y: 40, scale: 0.95, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
        transition={{ duration: 0.45, ease }}
        className="spot max-h-[92dvh] w-full max-w-2xl overflow-y-auto !bg-ink-850/95 p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
        data-lenis-prevent
      >
        <div className="flex items-start gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-3xl" style={grad}>
            {t.icon}
          </span>
          <div className="flex-1">
            <p className="eyebrow">Task spec · {t.domain}</p>
            <h3 className="mt-1.5 text-2xl font-medium leading-tight tracking-tight">{t.title}</h3>
          </div>
          <button onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-fg/15 hover:bg-fg/5" aria-label="Close">
            ✕
          </button>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-2">
          {[
            ['Horizon', `${t.horizon} steps`],
            ['Human expert', t.human],
            [`${MODEL_NAME}`, `${t.pass}% pass`],
          ].map(([k, v]) => (
            <div key={k} className="glass rounded-2xl px-3 py-2.5">
              <p className="truncate font-mono text-[10px] uppercase tracking-[0.12em] text-bone-dim">{k}</p>
              <p className={`text-[15px] font-medium ${k === MODEL_NAME && hard(t.pass) ? 'text-rose-400' : ''}`}>{v}</p>
            </div>
          ))}
        </div>
        {[
          ['🎯 The brief', t.brief],
          ['🐳 Environment', t.env],
          ['🧪 How it is graded', t.grading],
        ].map(([k, v]) => (
          <div key={k} className="mt-5">
            <p className="text-[13px] font-semibold">{k}</p>
            <p className="mt-1 text-[14.5px] leading-relaxed text-bone-muted">{v}</p>
          </div>
        ))}
        <div className="mt-5 rounded-2xl border border-rose-400/25 bg-rose-400/[0.06] p-4">
          <p className="text-[13px] font-semibold text-rose-300">⚠️ Why models struggle</p>
          <ul className="mt-2 space-y-1.5">
            {t.why.map((w) => (
              <li key={w} className="flex gap-2 text-[14px] leading-relaxed text-bone-muted">
                <span className="text-rose-300">•</span>
                {w}
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-5 flex flex-wrap gap-1.5">
          {t.stack.map((s) => (
            <span key={s} className="rounded-full border border-fg/10 bg-fg/[0.04] px-3 py-1 text-[12px]">
              {s}
            </span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

function Scatter({ list, onPick }) {
  const W = 520;
  const H = 240;
  const maxH = 130;
  const x = (h) => 34 + (h / maxH) * (W - 50);
  const y = (p) => H - 26 - (p / 100) * (H - 46);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible">
      {[0, 25, 50, 75, 100].map((p) => (
        <g key={p}>
          <line x1="34" x2={W - 10} y1={y(p)} y2={y(p)} stroke={p === 50 ? 'rgba(251,113,133,0.55)' : 'rgb(var(--fg-c) / 0.07)'} strokeDasharray={p === 50 ? '5 5' : '3 6'} />
          <text x="0" y={y(p) + 4} fontSize="10" fill="rgb(var(--bone-dim))">
            {p}%
          </text>
        </g>
      ))}
      <text x={W - 10} y={y(50) - 6} fontSize="10" fill="#fb7185" textAnchor="end">
        50% line
      </text>
      {[0, 40, 80, 120].map((h) => (
        <text key={h} x={x(h)} y={H - 6} fontSize="10" fill="rgb(var(--bone-dim))" textAnchor="middle">
          {h} steps
        </text>
      ))}
      {/* trend: longer tasks → lower pass rate */}
      <line x1={x(20)} y1={y(52)} x2={x(125)} y2={y(10)} stroke="url(#tg)" strokeWidth="2" strokeDasharray="2 5" opacity="0.7" />
      <defs>
        <linearGradient id="tg" x1="0" x2="1">
          <stop offset="0" stopColor="var(--g1)" />
          <stop offset="1" stopColor="var(--g2)" />
        </linearGradient>
      </defs>
      {list.map((t) => (
        <g key={t.id} className="cursor-pointer" onClick={() => onPick(t)}>
          <motion.circle cx={x(t.horizon)} cy={y(t.pass)} r="16" fill={hard(t.pass) ? 'rgba(251,113,133,0.18)' : 'rgba(167,139,250,0.2)'} initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} />
          <text x={x(t.horizon)} y={y(t.pass) + 5} fontSize="15" textAnchor="middle">
            {t.icon}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function TaskGallery() {
  const [filter, setFilter] = useState('all');
  const [open, setOpen] = useState(null);
  const domains = useMemo(() => [...new Set(tasks.map((t) => t.domain))], []);
  const list = tasks.filter((t) => (filter === 'all' ? true : filter === 'hard' ? hard(t.pass) : t.domain === filter)).sort((a, b) => a.pass - b.pass);
  const under = tasks.filter((t) => hard(t.pass)).length;
  const avg = Math.round(tasks.reduce((a, t) => a + t.pass, 0) / tasks.length);
  const avgH = Math.round(tasks.reduce((a, t) => a + t.horizon, 0) / tasks.length);

  return (
    <div>
      {!RESULTS_ARE_REAL && (
        <p className="mb-6 rounded-2xl border border-amber-300/25 bg-amber-300/[0.06] px-4 py-3 text-[13px] leading-relaxed text-bone-muted">
          <span className="font-semibold text-amber-300">Illustrative examples.</span> These tasks represent the kind of long-horizon, verifiable work I design; pass rates are example figures, not published benchmark results.
        </p>
      )}

      {/* summary + chart */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="grid grid-cols-2 gap-3 lg:col-span-4 lg:grid-cols-1">
          {[
            [`${under}/${tasks.length}`, `tasks under 50% for ${MODEL_NAME.toLowerCase()}`],
            [`${avg}%`, 'average pass rate'],
            [`${avgH}`, 'average steps per task'],
            ['100%', 'verified by hidden tests'],
          ].map(([v, l]) => (
            <Spot key={l} className="p-5">
              <p className="text-gradient text-4xl font-semibold tracking-tightest">{v}</p>
              <p className="mt-1 text-[13px] text-bone-muted">{l}</p>
            </Spot>
          ))}
        </div>
        <Spot className="p-6 lg:col-span-8">
          <p className="eyebrow">Longer horizon → lower pass rate</p>
          <p className="mt-1 text-[13px] text-bone-muted">Each dot is a task — tap one to open its spec.</p>
          <div className="mt-4">
            <Scatter list={tasks} onPick={setOpen} />
          </div>
        </Spot>
      </div>

      {/* filters */}
      <div className="mt-8 flex gap-1.5 overflow-x-auto pb-1" data-lenis-prevent>
        {[['all', 'All tasks'], ['hard', `🔥 Under 50%`], ...domains.map((d) => [d, d])].map(([k, l]) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`relative shrink-0 rounded-full px-4 py-2 text-[13px] transition-colors ${filter === k ? 'text-white' : 'glass text-bone-muted hover:text-bone'}`}
          >
            {filter === k && <motion.span layoutId="task-filter" className="absolute inset-0 rounded-full" style={grad} />}
            <span className="relative">{l}</span>
          </button>
        ))}
      </div>

      {/* cards */}
      <motion.div layout className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AnimatePresence>
          {list.map((t) => (
            <motion.div key={t.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.4, ease }}>
              <Tilt max={5} className="h-full">
                <Spot as="button" onClick={() => setOpen(t)} data-cursor="Spec" className="group flex h-full w-full flex-col p-5 text-left">
                  <div className="flex items-start justify-between gap-2">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl text-2xl transition-transform duration-500 group-hover:scale-110" style={grad}>
                      {t.icon}
                    </span>
                    {hard(t.pass) && <span className="rounded-full border border-rose-400/40 bg-rose-400/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-rose-300">Under 50%</span>}
                  </div>
                  <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-bone-dim">{t.domain}</p>
                  <h4 className="mt-1 text-[16px] font-medium leading-snug">{t.title}</h4>
                  <div className="mt-3 flex gap-3 text-[12px] text-bone-muted">
                    <span>⏱ {t.horizon} steps</span>
                    <span>👤 {t.human}</span>
                  </div>
                  <div className="mt-auto pt-5">
                    <PassBar value={t.pass} />
                  </div>
                </Spot>
              </Tilt>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>{open && <TaskModal t={open} onClose={() => setOpen(null)} />}</AnimatePresence>
    </div>
  );
}
