import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { projects } from '../data';
import { Arrow, Magnetic, Reveal, Spot, Tilt, ease } from '../components/ui';

const grad = { background: 'linear-gradient(135deg, var(--g1), var(--g2) 60%, var(--g3))' };
const idFromHash = () => (window.location.hash.match(/^#\/work\/([\w-]+)/) || [])[1];

function BrowserFrame({ url, children }) {
  const host = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  return (
    <div className="overflow-hidden rounded-[22px] border border-fg/10 bg-ink-850 shadow-[0_40px_120px_-30px_rgba(167,139,250,0.5)]">
      <div className="flex items-center gap-2 border-b border-fg/10 bg-fg/[0.03] px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="mx-auto flex max-w-[60%] items-center gap-2 truncate rounded-full bg-fg/[0.06] px-4 py-1 font-mono text-[11px] text-bone-muted">
          🔒 {host}
        </span>
        <span className="w-12" />
      </div>
      {children}
    </div>
  );
}

function LivePreview({ p }) {
  const [on, setOn] = useState(false);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    setOn(false);
    setLoaded(false);
  }, [p.id]);
  return (
    <BrowserFrame url={p.url}>
      <div className="relative aspect-[16/10] w-full bg-ink-900">
        {on ? (
          <>
            {!loaded && <div className="absolute inset-0 grid place-items-center text-sm text-bone-muted">Loading live site…</div>}
            <iframe src={p.url} title={`${p.title} live preview`} className="absolute inset-0 h-full w-full border-0 bg-white" loading="lazy" onLoad={() => setLoaded(true)} data-lenis-prevent />
          </>
        ) : (
          <button onClick={() => setOn(true)} className="group absolute inset-0" data-cursor="Load">
            <img src={p.image} alt="" className="h-full w-full object-cover opacity-40 blur-[2px] transition duration-700 group-hover:opacity-60 group-hover:blur-0" />
            <span className="absolute inset-0 grid place-items-center">
              <span className="btn-primary !px-7 !py-4">▶ Load the live site here</span>
            </span>
          </button>
        )}
      </div>
    </BrowserFrame>
  );
}

export default function CaseStudy() {
  const [id, setId] = useState(idFromHash);
  useEffect(() => {
    const on = () => setId(idFromHash());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);

  const index = Math.max(0, projects.findIndex((p) => p.id === id));
  const p = projects[index];
  const next = projects[(index + 1) % projects.length];
  const prev = projects[(index - 1 + projects.length) % projects.length];

  useEffect(() => {
    document.title = `${p.title} — case study | Rishav Kumar`;
  }, [p]);

  return (
    <main className="relative pb-24 pt-[104px] md:pt-[124px]">
      <AnimatePresence mode="wait">
        <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.5, ease }}>
          <div className="container-site">
            {/* breadcrumbs */}
            <div className="flex flex-wrap items-center justify-between gap-4 text-[13px]">
              <a href="#work" className="link-underline text-bone-muted hover:text-bone">
                ← All projects
              </a>
              <div className="flex gap-2">
                <a href={`#/work/${prev.id}`} className="glass rounded-full px-3 py-1.5 text-bone-muted hover:text-bone" aria-label={`Previous: ${prev.title}`}>
                  ← {prev.title}
                </a>
                <a href={`#/work/${next.id}`} className="glass rounded-full px-3 py-1.5 text-bone-muted hover:text-bone" aria-label={`Next: ${next.title}`}>
                  {next.title} →
                </a>
              </div>
            </div>

            {/* title */}
            <div className="mt-10 grid items-end gap-8 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-bone-muted">
                  <span className="text-gradient font-semibold">{String(index + 1).padStart(2, '0')}</span>
                  <span className="h-3 w-px bg-fg/15" /> Case study · {p.category}
                </span>
                <h1 className="mt-6 text-[clamp(3rem,8vw,7rem)] font-medium leading-[0.92] tracking-tightest">{p.title}</h1>
                <p className="text-gradient mt-2 font-serif text-[clamp(1.6rem,3.5vw,2.75rem)] italic">{p.kicker}</p>
              </div>
              <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
                <Magnetic>
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="btn-primary !px-7 !py-4">
                    Visit live site <Arrow />
                  </a>
                </Magnetic>
              </div>
            </div>

            {/* hero shot */}
            <Reveal y={40} className="mt-12">
              <Tilt max={4}>
                <BrowserFrame url={p.url}>
                  <img src={p.image} alt={`${p.title} screenshot`} className="max-h-[78vh] w-full object-cover object-top" />
                </BrowserFrame>
              </Tilt>
            </Reveal>

            {/* meta + overview */}
            <div className="mt-20 grid gap-12 lg:grid-cols-12">
              <Reveal className="space-y-6 lg:col-span-4">
                {[
                  ['Category', p.category],
                  ['Role', 'Design & development'],
                  ['Status', 'Live in production'],
                ].map(([k, v]) => (
                  <div key={k} className="border-b border-fg/10 pb-4">
                    <p className="eyebrow">{k}</p>
                    <p className="mt-1.5 text-[16px]">{v}</p>
                  </div>
                ))}
                <div>
                  <p className="eyebrow">Stack</p>
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {p.tags.map((t) => (
                      <li key={t} className="rounded-full border border-fg/10 bg-fg/[0.04] px-3 py-1 text-[13px]">
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
              <Reveal delay={0.05} className="lg:col-span-8">
                <p className="eyebrow">Overview</p>
                <p className="mt-4 text-[clamp(1.35rem,2.4vw,2rem)] font-medium leading-snug tracking-tight">{p.overview}</p>
              </Reveal>
            </div>

            {/* features */}
            <div className="mt-20">
              <Reveal>
                <p className="eyebrow">Key features</p>
              </Reveal>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {p.features.map((f, i) => (
                  <Reveal key={f.t} delay={i * 0.06}>
                    <Spot className="h-full p-7">
                      <span className="grid h-12 w-12 place-items-center rounded-2xl font-serif text-xl italic text-white" style={grad}>
                        {i + 1}
                      </span>
                      <h3 className="mt-6 text-xl font-medium tracking-tight">{f.t}</h3>
                      <p className="mt-2 text-[15px] leading-relaxed text-bone-muted">{f.d}</p>
                    </Spot>
                  </Reveal>
                ))}
              </div>
            </div>

            {/* live preview */}
            <div className="mt-20">
              <Reveal className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="eyebrow">Try it</p>
                  <h2 className="mt-3 text-3xl font-medium tracking-tight md:text-4xl">
                    Live, <span className="text-gradient font-serif font-normal italic">right here</span>
                  </h2>
                </div>
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="link-underline text-[14px] text-bone-muted hover:text-bone">
                  Open in a new tab ↗
                </a>
              </Reveal>
              <Reveal>
                <LivePreview p={p} />
              </Reveal>
              <p className="mt-3 text-center text-[12px] text-bone-dim">If the preview stays blank, the site blocks embedding — use “Open in a new tab”.</p>
            </div>

            {/* next */}
            <Reveal className="mt-24">
              <a href={`#/work/${next.id}`} className="group block" data-cursor="Next">
                <Spot className="grid items-center gap-8 overflow-hidden p-7 md:grid-cols-12 md:p-10">
                  <div className="md:col-span-6">
                    <p className="eyebrow">Next case study</p>
                    <h2 className="mt-4 text-[clamp(2.5rem,6vw,5rem)] font-medium leading-none tracking-tightest transition-transform duration-500 group-hover:translate-x-2">{next.title}</h2>
                    <p className="text-gradient mt-2 font-serif text-2xl italic">{next.kicker}</p>
                    <span className="mt-6 inline-flex items-center gap-2 text-[14px] text-bone-muted group-hover:text-bone">
                      Read case study <Arrow />
                    </span>
                  </div>
                  <div className="overflow-hidden rounded-2xl md:col-span-6">
                    <img src={next.image} alt="" loading="lazy" className="aspect-[16/10] w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105" />
                  </div>
                </Spot>
              </a>
            </Reveal>
          </div>
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
