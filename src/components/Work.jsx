import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { projectFilters, projects } from '../data';
import { Arrow, Magnetic, Reveal, SectionHead, Spot, Tilt, ease } from './ui';

function ProjectCard({ p, i }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: 20 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.9, ease, delay: (i % 2) * 0.08 }}
    >
      <Tilt max={8} className="[transform-style:preserve-3d]">
        <Spot as="a" href={`#/work/${p.id}`} data-cursor="Case study" className="spot-3d group block p-3" aria-label={`${p.title} — read the case study`}>
          <div className="relative aspect-[16/11] overflow-hidden rounded-[20px] bg-ink-800 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)] [transform:translateZ(40px)]">
            <img
              src={p.image}
              alt={`${p.title} — ${p.kicker}`}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900/60 via-transparent to-transparent" />
            <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/55 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-white backdrop-blur-md">
              {p.category}
            </span>
            <span className="absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full bg-bone text-ink-900 opacity-0 transition-all duration-500 group-hover:rotate-0 group-hover:opacity-100 -rotate-45 scale-90 group-hover:scale-100">
              <Arrow />
            </span>
          </div>

          <div className="px-3 pb-3 pt-6 [transform:translateZ(60px)]">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-2xl font-medium tracking-tight md:text-[26px]">
                {p.title}
                <span className="font-serif text-xl font-normal italic text-bone-muted"> — {p.kicker}</span>
              </h3>
              <span className="font-mono text-xs text-bone-dim">{String(i + 1).padStart(2, '0')}</span>
            </div>
            <p className="mt-3 text-[15px] leading-relaxed text-bone-muted">{p.description}</p>
            <div className="mt-5 flex items-center justify-between gap-4">
              <ul className="flex flex-wrap gap-1.5">
                {p.tags.map((t) => (
                  <li key={t} className="rounded-full border border-fg/[0.08] bg-fg/[0.03] px-3 py-1 text-xs text-bone-muted">
                    {t}
                  </li>
                ))}
              </ul>
              <span
                role="link"
                tabIndex={0}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(p.url, '_blank', 'noopener');
                }}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), e.stopPropagation(), window.open(p.url, '_blank', 'noopener'))}
                className="relative z-10 inline-flex shrink-0 items-center gap-1.5 rounded-full border border-fg/10 px-3 py-1.5 text-[12px] text-bone-muted transition-colors hover:border-accent hover:text-accent"
                data-cursor="Live"
              >
                Live site <Arrow />
              </span>
            </div>
          </div>
        </Spot>
      </Tilt>
    </motion.div>
  );
}

export default function Work() {
  const [all, setAll] = useState(false);
  const [filter, setFilter] = useState('All');
  const filtered = filter === 'All' ? projects : projects.filter((p) => p.filters.includes(filter));
  const list = filter !== 'All' || all ? filtered : filtered.slice(0, 6);

  return (
    <section id="work" className="py-24 md:py-32">
      <div className="container-site">
        <SectionHead
          index="02"
          label="Selected work"
          title={
            <>
              Things I've <span className="text-gradient font-serif font-normal italic">built & shipped</span>
            </>
          }
          aside="Real products, live on the internet. Open any card for the full case study."
        />

        {/* Filter tabs */}
        <Reveal className="-mx-5 mb-10 overflow-x-auto px-5 sm:mx-0 sm:px-0" data-lenis-prevent>
          <div className="glass inline-flex gap-1 rounded-full p-1.5" role="tablist" aria-label="Filter projects">
            {projectFilters.map((f) => {
              const count = f === 'All' ? projects.length : projects.filter((p) => p.filters.includes(f)).length;
              const on = filter === f;
              return (
                <button
                  key={f}
                  role="tab"
                  aria-selected={on}
                  onClick={() => setFilter(f)}
                  className={`relative whitespace-nowrap rounded-full px-4 py-2 text-[13px] transition-colors ${on ? 'text-white' : 'text-bone-muted hover:text-bone'}`}
                >
                  {on && (
                    <motion.span
                      layoutId="filter-pill"
                      className="absolute inset-0 rounded-full"
                      style={{ background: 'linear-gradient(120deg, var(--g1), var(--g2) 60%, var(--g3))' }}
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative">
                    {f} <span className={`ml-1 font-mono text-[10px] ${on ? 'text-white/80' : 'text-bone-dim'}`}>{count}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </Reveal>

        <motion.div layout className="grid gap-6 md:grid-cols-2">
          <AnimatePresence initial={false}>
            {list.map((p, i) => (
              <ProjectCard key={p.id} p={p} i={i} />
            ))}
          </AnimatePresence>
        </motion.div>

        {filter === 'All' && projects.length > 6 && (
          <Reveal className="mt-16 flex justify-center">
            <Magnetic>
              <button onClick={() => setAll((a) => !a)} className="btn-ghost !px-7 !py-4">
                {all ? 'Show fewer' : `View all ${projects.length} projects`}
                <span className={`transition-transform duration-300 ${all ? 'rotate-180' : ''}`}>↓</span>
              </button>
            </Magnetic>
          </Reveal>
        )}
      </div>
    </section>
  );
}
