import { useEffect, useState } from 'react';
import { profile, stack, stats } from '../data';
import { CountUp, Icon, Reveal, SectionHead, Spot } from './ui';

function Clock() {
  const fmt = () =>
    new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true });
  const [t, setT] = useState(fmt);
  useEffect(() => {
    const id = setInterval(() => setT(fmt()), 15000);
    return () => clearInterval(id);
  }, []);
  return <span>{t}</span>;
}

const cell = 'p-5 sm:p-7 md:p-8 h-full';

export default function About() {
  return (
    <section id="about" className="py-24 md:py-32">
      <div className="container-site">
        <SectionHead
          index="01"
          label="About"
          title={
            <>
              A little <span className="text-gradient font-serif font-normal italic">about me</span>
            </>
          }
          aside="Engineer by trade, perfectionist by habit. I care about the details that make software feel effortless."
        />

        <div className="grid auto-rows-[minmax(150px,auto)] grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {/* Bio */}
          <Reveal className="col-span-2 lg:row-span-2">
            <Spot className={`${cell} flex flex-col justify-between`}>
              <div
                className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-40 blur-3xl"
                style={{ background: 'radial-gradient(circle, var(--g2), transparent 70%)' }}
              />
              <div>
                <p className="eyebrow">Hello there</p>
                <p className="mt-5 text-[22px] font-medium leading-snug tracking-tight md:text-[26px]">
                  I'm an AI research engineer at <span className="text-gradient">{profile.company}</span>, working on
                  LLM post-training evaluation, benchmark pipelines and dataset quality — and I build full-stack products too.
                </p>
              </div>
              <p className="mt-8 text-[15px] leading-relaxed text-bone-muted">
                From React interfaces to Node &amp; Python services and Dockerised pipelines, I love taking an idea all the
                way to production — clean, fast and genuinely delightful to use.
              </p>
            </Spot>
          </Reveal>

          {/* Stats */}
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={0.05 * i}>
              <Spot className={`${cell} flex flex-col justify-between`}>
                <span className="text-[clamp(2.75rem,4vw,3.75rem)] font-medium leading-none tracking-tightest">
                  <CountUp value={s.value} className="text-gradient" />
                </span>
                <span className="mt-6 text-[13px] leading-snug text-bone-muted sm:text-sm">{s.label}</span>
              </Spot>
            </Reveal>
          ))}

          {/* Currently */}
          <Reveal className="col-span-2">
            <Spot className={`${cell} flex items-center gap-6`}>
              <div
                className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-white shadow-[0_10px_30px_-8px_rgba(244,114,182,0.6)]"
                style={{ background: 'linear-gradient(135deg, var(--g1), var(--g2), var(--g3))' }}
              >
                <Icon name="spark" className="h-7 w-7" />
              </div>
              <div>
                <p className="eyebrow flex items-center gap-2">
                  <span className="live-dot" /> Currently
                </p>
                <p className="mt-2 text-xl font-medium tracking-tight">AI Research Engineer @ {profile.company}</p>
                <p className="mt-1 text-sm text-bone-muted">Promoted from Software Engineer · LLM evaluation & benchmarks</p>
              </div>
            </Spot>
          </Reveal>

          {/* Location */}
          <Reveal delay={0.05}>
            <Spot className={`${cell} flex flex-col justify-between`}>
              <Icon name="pin" className="h-6 w-6 text-accent" />
              <div>
                <p className="text-xl font-medium tracking-tight">{profile.location}</p>
                <p className="mt-1 font-mono text-xs text-bone-muted">
                  IST · <Clock />
                </p>
              </div>
            </Spot>
          </Reveal>

          {/* Values */}
          <Reveal delay={0.1}>
            <Spot className={`${cell} flex flex-col justify-between`}>
              <Icon name="heart" className="h-6 w-6 text-accent" />
              <p className="text-[15px] leading-relaxed text-bone-muted">
                <span className="text-bone">Clean code, kind UX,</span> and shipping on time — every time.
              </p>
            </Spot>
          </Reveal>

          {/* Toolkit */}
          <Reveal className="col-span-2 lg:col-span-4">
            <Spot className={cell}>
              <p className="eyebrow">Toolkit</p>
              <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
                {stack.map((g) => (
                  <div key={g.group}>
                    <p className="mb-3 text-sm font-medium">{g.group}</p>
                    <ul className="flex flex-wrap gap-1.5">
                      {g.items.map((it) => (
                        <li key={it} className="rounded-full border border-fg/[0.08] bg-fg/[0.03] px-2.5 py-1 text-[12px] text-bone-muted">
                          {it}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Spot>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
