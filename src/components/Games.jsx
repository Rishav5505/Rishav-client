import { useEffect, useState } from 'react';
import { read } from '../games/shared';
import { Arrow, Magnetic, Reveal, SectionHead, Spot } from './ui';
import { T, useLang } from '../i18n';

const grad = { background: 'linear-gradient(135deg, var(--g1), var(--g2), var(--g3))' };

// Kept tiny on purpose: the game code itself only loads on the Games page.
const picks = [
  { id: 'stream', icon: '🐍', title: 'Data Stream', tag: 'Arcade', desc: 'Steer the data stream, grab packets, don’t bite your tail.', best: 'stream', fmt: (v) => `${v} packets` },
  { id: 'dodge', icon: '🚀', title: 'Orbit Dodge', tag: 'Arcade', desc: 'Fly through an endless asteroid field.', best: 'dodge', fmt: (v) => `${v} units` },
  { id: 'line4', icon: '🟣', title: 'Line Up 4', tag: 'vs AI', desc: 'Connect four before the look-ahead AI does.', best: 'c4-w', fmt: (v) => `${v} wins` },
  { id: 'typer', icon: '⌨️', title: 'Code Typer', tag: 'Brain', desc: 'Type dev words against the clock — how many WPM?', best: 'typer', fmt: (v) => `${v} WPM` },
  { id: 'memory', icon: '🃏', title: 'Tech Memory', tag: 'Puzzle', desc: 'Flip & match my tech stack in the fewest moves.', best: 'memory', fmt: (v) => `${v} moves` },
];
const spans = ['md:col-span-2', 'md:col-span-2', 'md:col-span-2', 'md:col-span-3', 'md:col-span-3'];

export default function Games() {
  const { t, lang } = useLang();
  const [, force] = useState(0);
  useEffect(() => {
    const on = () => force((n) => n + 1);
    window.addEventListener('app:best', on);
    window.addEventListener('hashchange', on);
    return () => {
      window.removeEventListener('app:best', on);
      window.removeEventListener('hashchange', on);
    };
  }, []);

  return (
    <section id="arcade" className="py-24 md:py-32">
      <div className="container-site">
        <SectionHead
          center
          index="10"
          label="Arcade"
          title={<T k="games.title" />}
          aside={t('games.aside')}
        />

        <div className="grid gap-4 md:grid-cols-6">
          {picks.map((g, i) => {
            const b = read(g.best);
            return (
              <Reveal key={g.id} delay={i * 0.06} className={spans[i]}>
                <Spot as="a" href={`#/games/${g.id}`} data-cursor="Play" className="group flex h-full w-full flex-col p-6 text-left transition-transform duration-500 hover:-translate-y-1">
                  <div className="flex items-start justify-between">
                    <span className="grid h-16 w-16 place-items-center rounded-2xl text-3xl shadow-[0_14px_40px_-12px_rgba(244,114,182,0.7)] transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110" style={grad}>
                      {g.icon}
                    </span>
                    <span className="rounded-full border border-fg/10 bg-fg/[0.04] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-bone-muted">{g.tag}</span>
                  </div>
                  <h3 className="mt-6 text-2xl font-medium tracking-tight">{g.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-bone-muted">{g.desc}</p>
                  <div className="mt-auto flex items-center justify-between pt-6">
                    <span className="text-[13px] text-bone-dim">
                      {b !== null && b !== 0 ? (
                        <>
                          🏆 Best: <span className="text-bone">{g.fmt(b)}</span>
                        </>
                      ) : (
                        'No score yet'
                      )}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium text-white transition-transform duration-300 group-hover:scale-105" style={grad}>
                      ▶ Play
                    </span>
                  </div>
                </Spot>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="mt-10 flex justify-center">
          <Magnetic>
            <a href="#/games" className="btn-primary group !px-9 !py-4 text-[15px]">
              🎮 Explore all 25 games
              <Arrow className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </Magnetic>
        </Reveal>
      </div>
    </section>
  );
}
