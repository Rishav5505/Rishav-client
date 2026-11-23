import { useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { experience } from '../data';
import { Reveal, SectionHead, Spot } from './ui';
import { T, useLang } from '../i18n';

export default function Experience() {
  const { t, lang } = useLang();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 60%'] });
  const fill = useSpring(scrollYProgress, { stiffness: 90, damping: 25 });

  return (
    <section id="experience" className="py-24 md:py-32">
      <div className="container-site">
        <SectionHead
          index="08"
          label="Journey"
          title={<T k="experience.title" />}
          aside={t('experience.aside')}
        />

        <div ref={ref} className="relative mx-auto max-w-4xl">
          {/* rail */}
          <div className="absolute bottom-2 left-[11px] top-2 w-px bg-fg/10 md:left-1/2" />
          <motion.div
            className="absolute bottom-2 left-[11px] top-2 w-px origin-top md:left-1/2"
            style={{ scaleY: fill, background: 'linear-gradient(var(--g1), var(--g2), var(--g3))', boxShadow: '0 0 14px rgba(244,114,182,0.7)' }}
          />

          <ol className="space-y-10 md:space-y-16">
            {experience.map((e, i) => {
              const right = i % 2 === 1;
              return (
                <li key={e.role} className="relative grid md:grid-cols-2 md:gap-16">
                  {/* node */}
                  <span className="absolute left-0 top-7 grid h-[23px] w-[23px] place-items-center rounded-full border border-fg/15 bg-ink-900 md:left-1/2 md:-translate-x-1/2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'linear-gradient(135deg, var(--g1), var(--g2))', boxShadow: '0 0 12px var(--g2)' }} />
                  </span>
                  <Reveal className={`pl-10 md:pl-0 ${right ? 'md:col-start-2' : 'md:text-right'}`} y={30}>
                    <Spot className="p-7 text-left">
                      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent">{e.period}</p>
                      <h3 className="mt-3 text-xl font-medium tracking-tight md:text-2xl">{e.role}</h3>
                      <p className="mt-1 text-[15px] text-bone">{e.org}</p>
                      <p className="mt-4 text-[14.5px] leading-relaxed text-bone-muted">{e.body}</p>
                    </Spot>
                  </Reveal>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
