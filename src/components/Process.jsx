import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Icon, SectionHead } from './ui';

const steps = [
  {
    title: 'Discover',
    icon: 'spark',
    body: 'We talk through your goals, users and constraints. I map the scope, the risks and a clear plan before a single line of code.',
    out: ['Kick-off call', 'Scope & goals', 'Timeline'],
  },
  {
    title: 'Design',
    icon: 'layers',
    body: 'From wireframes to a polished interface — while the architecture, data model and APIs are planned alongside.',
    out: ['Wireframes', 'UI design', 'Tech plan'],
  },
  {
    title: 'Build',
    icon: 'code',
    body: 'Focused iterations with regular demos, so you always see progress. Clean, tested and documented code.',
    out: ['Regular demos', 'Code reviews', 'Testing'],
  },
  {
    title: 'Ship & grow',
    icon: 'bolt',
    body: 'Deployed, monitored and handed over properly — and I stay reachable for fixes and the next round of improvements.',
    out: ['Deployment', 'Handover docs', 'Ongoing support'],
  },
];

function Card({ step, i, total, progress }) {
  // Cards that have been scrolled past shrink slightly and dim, creating a stacked deck.
  const start = i / total;
  const scale = useTransform(progress, [start, 1], [1, 1 - (total - 1 - i) * 0.05]);
  const shade = useTransform(progress, [start, start + 0.35], [0, i === total - 1 ? 0 : 0.5]);

  return (
    <div className="sticky h-[78vh] min-h-[420px] md:h-[70vh]" style={{ top: `calc(96px + ${i * 26}px)` }}>
      <motion.div style={{ scale, transformOrigin: 'top center' }} className="h-[min(440px,60vh)]">
        <div className="spot relative h-full overflow-hidden !bg-ink-850 p-7 shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.6)] md:p-12">
          {/* darkens cards that have been stacked over */}
          <motion.div aria-hidden="true" style={{ opacity: shade }} className="pointer-events-none absolute inset-0 z-10 bg-ink-950" />
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full opacity-40 blur-3xl"
            style={{ background: `radial-gradient(circle, ${['var(--g1)', 'var(--g2)', 'var(--g3)', 'var(--g1)'][i]}, transparent 70%)` }}
          />
          <div className="relative grid h-full gap-8 md:grid-cols-12">
            <div className="flex flex-col md:col-span-7">
              <span className="text-gradient font-serif text-6xl italic leading-none md:text-8xl">0{i + 1}</span>
              <h3 className="mt-6 text-3xl font-medium tracking-tightest md:text-5xl">{step.title}</h3>
              <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-bone-muted md:text-[17px]">{step.body}</p>
            </div>
            <div className="flex flex-col justify-between md:col-span-5 md:items-end">
              <div
                className="hidden h-24 w-24 place-items-center rounded-3xl text-white shadow-[0_20px_50px_-12px_rgba(244,114,182,0.6)] md:grid"
                style={{ background: 'linear-gradient(135deg, var(--g1), var(--g2), var(--g3))' }}
              >
                <Icon name={step.icon} className="h-10 w-10" />
              </div>
              <div className="md:text-right">
                <p className="eyebrow mb-3">You get</p>
                <ul className="flex flex-wrap gap-2 md:justify-end">
                  {step.out.map((o) => (
                    <li key={o} className="rounded-full border border-fg/10 bg-fg/[0.04] px-3 py-1.5 text-[13px]">
                      {o}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function Process() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  return (
    <section id="process" className="pt-24 md:pt-32">
      <div className="container-site">
        <SectionHead
          index="05"
          label="Process"
          title={
            <>
              How we'll <span className="text-gradient font-serif font-normal italic">work together</span>
            </>
          }
          aside="A simple, transparent process — so you always know what's happening and what comes next."
        />
        <div ref={ref} className="relative">
          {steps.map((s, i) => (
            <Card key={s.title} step={s} i={i} total={steps.length} progress={scrollYProgress} />
          ))}
        </div>
      </div>
    </section>
  );
}
