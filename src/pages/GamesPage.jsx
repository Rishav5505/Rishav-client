import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { categories, featuredId, games } from '../games/registry';
import { read } from '../games/shared';
import GameModal from '../games/GameModal';
import { Arrow, Magnetic, Reveal, Spot, Tilt, ease } from '../components/ui';
import { profile } from '../data';

const grad = { background: 'linear-gradient(135deg, var(--g1), var(--g2) 60%, var(--g3))' };

const idFromHash = () => {
  const m = window.location.hash.match(/^#\/games\/([\w-]+)/);
  return m ? m[1] : null;
};

function useScores() {
  const snap = () => Object.fromEntries(games.map((g) => [g.id, read(g.best)]));
  const [s, set] = useState(snap);
  useEffect(() => {
    const on = () => set(snap());
    window.addEventListener('app:best', on);
    return () => window.removeEventListener('app:best', on);
  }, []);
  return [s, () => set(snap())];
}

function GameCard({ g, score, onPlay, i }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, ease, delay: Math.min(i * 0.03, 0.4) }}
    >
      <Tilt max={6} className="h-full">
        <Spot as="button" onClick={onPlay} data-cursor="Play" className="group flex h-full w-full flex-col p-5 text-left">
          <div className="flex items-start justify-between gap-3">
            <span
              className="grid h-14 w-14 place-items-center rounded-2xl text-[28px] shadow-[0_14px_40px_-12px_rgba(244,114,182,0.7)] transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110"
              style={grad}
            >
              {g.icon}
            </span>
            <div className="flex flex-col items-end gap-1.5">
              {g.badge && (
                <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white" style={grad}>
                  {g.badge}
                </span>
              )}
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-bone-dim">{categories.find((c) => c.id === g.cat)?.label}</span>
            </div>
          </div>
          <h3 className="mt-5 text-xl font-medium tracking-tight">{g.title}</h3>
          <p className="mt-1.5 line-clamp-2 text-[13.5px] leading-relaxed text-bone-muted">{g.desc}</p>
          <div className="mt-auto flex items-center justify-between gap-2 pt-5">
            <span className="truncate text-[12px] text-bone-dim">
              {score !== null && score !== 0 ? (
                <>
                  🏆 <span className="text-bone">{g.fmt(score)}</span>
                </>
              ) : (
                g.tag
              )}
            </span>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full px-3.5 py-1.5 text-[12px] font-semibold text-white transition-transform group-hover:scale-105" style={grad}>
              ▶ Play
            </span>
          </div>
        </Spot>
      </Tilt>
    </motion.div>
  );
}

export default function GamesPage() {
  const [cat, setCat] = useState('all');
  const [q, setQ] = useState('');
  const [active, setActive] = useState(() => games.find((g) => g.id === idFromHash()) || null);
  const [scores, refresh] = useScores();
  const featured = games.find((g) => g.id === featuredId);

  // Deep links: #/games/<id> opens that game.
  useEffect(() => {
    const on = () => {
      const g = games.find((x) => x.id === idFromHash());
      setActive(g || null);
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);

  const open = (g) => {
    setActive(g);
    history.replaceState(null, '', `#/games/${g.id}`);
  };
  const close = useCallback(() => {
    setActive(null);
    history.replaceState(null, '', '#/games');
    refresh();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return games.filter((g) => (cat === 'all' || g.cat === cat) && (!term || `${g.title} ${g.desc} ${g.tag}`.toLowerCase().includes(term)));
  }, [cat, q]);

  const played = games.filter((g) => scores[g.id] !== null && scores[g.id] !== 0).length;
  const surprise = () => open(games[Math.floor(Math.random() * games.length)]);

  return (
    <main className="relative pb-24 pt-[104px] md:pt-[124px]">
      <div className="container-site">
        {/* Back */}
        <Reveal>
          <a href="#/" className="link-underline inline-flex items-center gap-2 text-[13px] text-bone-muted hover:text-bone">
            ← Back to portfolio
          </a>
        </Reveal>

        {/* Hero */}
        <div className="mt-10 grid items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal>
              <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-bone-muted">
                <span className="live-dot" /> {games.length} games · free to play
              </span>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="mt-7 text-[clamp(3.2rem,9vw,8rem)] font-medium leading-[0.9] tracking-tightest">
                The <span className="text-gradient font-serif font-normal italic">Arcade</span>
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-bone-muted">
                {games.length} handcrafted mini-games — arcade, puzzles, brain-teasers and AI opponents. All built from scratch by {profile.name.split(' ')[0]}, all playable right here on desktop or mobile.
              </p>
            </Reveal>
            <Reveal delay={0.15} className="mt-8 flex flex-wrap gap-3">
              <Magnetic>
                <button onClick={surprise} className="btn-primary !px-7 !py-4">
                  🎲 Surprise me
                </button>
              </Magnetic>
              <a href="#contact" className="btn-ghost !px-7 !py-4">
                Hire the developer <Arrow />
              </a>
            </Reveal>
          </div>

          <Reveal delay={0.1} className="grid grid-cols-2 gap-3 lg:col-span-5">
            {[
              [games.length, 'Games'],
              [played, 'You’ve played'],
              [categories.length - 1, 'Categories'],
              ['0 ₹', 'Cost · no ads'],
            ].map(([v, l]) => (
              <Spot key={l} className="p-5">
                <p className="text-gradient text-4xl font-medium tracking-tightest">{v}</p>
                <p className="mt-1 text-[13px] text-bone-muted">{l}</p>
              </Spot>
            ))}
          </Reveal>
        </div>

        {/* Featured */}
        {featured && (
          <Reveal delay={0.1} className="mt-14">
            <Spot className="relative grid items-center gap-8 overflow-hidden p-7 md:grid-cols-12 md:p-10">
              <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full opacity-50 blur-3xl" style={grad} />
              <div className="relative md:col-span-7">
                <p className="eyebrow flex items-center gap-2">
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={grad}>
                    FEATURED
                  </span>
                  Game of the week
                </p>
                <h2 className="mt-4 text-4xl font-medium tracking-tightest md:text-6xl">{featured.title}</h2>
                <p className="mt-3 max-w-md text-[15px] leading-relaxed text-bone-muted">{featured.desc}</p>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <Magnetic>
                    <button onClick={() => open(featured)} className="btn-primary !px-8 !py-4">
                      ▶ Play now
                    </button>
                  </Magnetic>
                  {scores[featured.id] ? <span className="text-[13px] text-bone-muted">🏆 Your best: {featured.fmt(scores[featured.id])}</span> : null}
                </div>
              </div>
              <div className="relative grid place-items-center md:col-span-5">
                <motion.div
                  animate={{ y: [0, -14, 0], rotate: [0, 4, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  className="grid h-44 w-44 place-items-center rounded-[40px] text-[88px] shadow-[0_30px_80px_-20px_rgba(244,114,182,0.8)] md:h-56 md:w-56 md:text-[110px]"
                  style={grad}
                >
                  {featured.icon}
                </motion.div>
                {['☄️', '✨', '🪐'].map((e, i) => (
                  <motion.span
                    key={e}
                    className="absolute text-3xl"
                    style={{ left: `${[8, 80, 70][i]}%`, top: `${[15, 10, 78][i]}%` }}
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.4 }}
                  >
                    {e}
                  </motion.span>
                ))}
              </div>
            </Spot>
          </Reveal>
        )}

        {/* Controls */}
        <div className="sticky top-[76px] z-30 -mx-5 mt-14 px-5 py-3 sm:mx-0 sm:px-0">
          <div className="glass flex flex-col gap-3 rounded-[22px] !bg-ink-900/80 p-2 md:flex-row md:items-center">
            <div className="flex gap-1 overflow-x-auto" role="tablist" aria-label="Game categories" data-lenis-prevent>
              {categories.map((c) => {
                const n = c.id === 'all' ? games.length : games.filter((g) => g.cat === c.id).length;
                const on = cat === c.id;
                return (
                  <button
                    key={c.id}
                    role="tab"
                    aria-selected={on}
                    onClick={() => setCat(c.id)}
                    className={`relative shrink-0 rounded-full px-4 py-2 text-[13px] transition-colors ${on ? 'text-white' : 'text-bone-muted hover:text-bone'}`}
                  >
                    {on && <motion.span layoutId="game-cat" className="absolute inset-0 rounded-full" style={grad} transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
                    <span className="relative">
                      {c.icon} {c.label} <span className={`ml-0.5 font-mono text-[10px] ${on ? 'text-white/80' : 'text-bone-dim'}`}>{n}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            <label className="relative md:ml-auto md:w-64">
              <span className="sr-only">Search games</span>
              <svg className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-bone-dim" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search games…"
                className="h-10 w-full rounded-full border border-fg/10 bg-fg/[0.04] pl-10 pr-4 text-[14px] outline-none placeholder:text-bone-dim focus:border-accent/60"
              />
            </label>
          </div>
        </div>

        {/* Grid */}
        <motion.div layout className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence>
            {list.map((g, i) => (
              <GameCard key={g.id} g={g} i={i} score={scores[g.id]} onPlay={() => open(g)} />
            ))}
          </AnimatePresence>
        </motion.div>
        {list.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-5xl">🕹️</p>
            <p className="mt-4 text-bone-muted">No games match “{q}”.</p>
            <button onClick={() => (setQ(''), setCat('all'))} className="btn-ghost mt-5 !py-2.5">
              Show all games
            </button>
          </div>
        )}

        {/* CTA */}
        <Reveal className="mt-24">
          <Spot className="relative overflow-hidden p-8 text-center md:p-14">
            <div className="pointer-events-none absolute -bottom-32 left-1/2 h-72 w-[600px] -translate-x-1/2 rounded-full opacity-40 blur-3xl" style={grad} />
            <p className="relative text-5xl">🎮</p>
            <h2 className="relative mt-5 text-[clamp(2rem,5vw,3.75rem)] font-medium leading-tight tracking-tightest">
              Liked the games? Imagine what <span className="text-gradient font-serif font-normal italic">I can build for you.</span>
            </h2>
            <p className="relative mx-auto mt-4 max-w-lg text-[15px] text-bone-muted">The same care goes into every product I ship — fast, polished and delightful to use.</p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-3">
              <a href="#contact" className="btn-primary !px-8 !py-4">
                Start a project <Arrow />
              </a>
              <a href="#work" className="btn-ghost !px-8 !py-4">
                See my work
              </a>
            </div>
          </Spot>
        </Reveal>
      </div>

      <AnimatePresence>
        {active && (
          <GameModal
            key={active.id}
            game={active}
            onClose={close}
            onNext={() => {
              const idx = games.findIndex((g) => g.id === active.id);
              open(games[(idx + 1) % games.length]);
            }}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
