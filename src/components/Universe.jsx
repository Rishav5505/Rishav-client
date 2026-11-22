import { stack } from '../data';
import Lazy3D, { SkillsScene } from '../three/Lazy3D';
import { Reveal, SectionHead } from './ui';

const items = stack.flatMap((g) => g.items);

function Fallback() {
  return (
    <div className="flex h-full flex-wrap content-center justify-center gap-2 p-6">
      {items.map((t) => (
        <span key={t} className="rounded-full border border-fg/10 bg-fg/[0.04] px-3 py-1.5 text-[12px] text-bone-muted">
          {t}
        </span>
      ))}
    </div>
  );
}

export default function Universe() {
  return (
    <section id="universe" className="relative py-24 md:py-32">
      <div className="container-site">
        <SectionHead
          index="06"
          label="Tech universe"
          title={
            <>
              My <span className="text-gradient font-serif font-normal italic">tech universe</span>, in 3D
            </>
          }
          aside="Every tool I work with, orbiting one idea: build things that work beautifully. Grab it and give it a spin."
        />

        <div className="grid items-center gap-10 lg:grid-cols-12">
          <Reveal className="order-2 space-y-4 lg:order-1 lg:col-span-4">
            {stack.map((g, i) => (
              <div key={g.group} className="spot flex items-center gap-4 p-4">
                <span className="text-gradient font-mono text-sm font-semibold">0{i + 1}</span>
                <div>
                  <p className="text-[15px] font-medium">{g.group}</p>
                  <p className="text-[13px] text-bone-muted">{g.items.join(' · ')}</p>
                </div>
              </div>
            ))}
          </Reveal>

          <Reveal className="relative order-1 lg:order-2 lg:col-span-8" y={40}>
            <div
              className="pointer-events-none absolute inset-[12%] -z-10 rounded-full opacity-60 blur-3xl"
              style={{ background: 'radial-gradient(circle, rgba(244,114,182,0.35), rgba(167,139,250,0.2) 50%, transparent 70%)' }}
            />
            <Lazy3D scene={SkillsScene} items={items} className="h-[420px] w-full sm:h-[520px] lg:h-[620px]" fallback={<Fallback />} />
            <p className="mt-2 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-bone-dim">← drag to spin →</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
