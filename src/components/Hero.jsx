import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useAnimationFrame, useMotionValue, useScroll, useSpring, useTransform, useVelocity, wrap } from 'framer-motion';
import Lazy3D, { HeroScene } from '../three/Lazy3D';
import portrait from '../assets/w_rishav_profile.webp';
import { marquee, profile } from '../data';
import { Arrow, Download, Icon, Magnetic, ease } from './ui';

const D = 1.55; // wait for the intro curtain
const words = ['RL environments', 'agent evals', 'AI systems', 'web products'];

const up = (delay) => ({
  initial: { opacity: 0, y: 24, filter: 'blur(8px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration: 1, ease, delay: D + delay },
});

function Rotator() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % words.length), 2600);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="relative inline-grid overflow-hidden pb-[0.08em] align-bottom">
      {/* invisible sizer keeps the box as wide as the longest word, so nothing jumps or clips */}
      <span aria-hidden="true" className="invisible col-start-1 row-start-1 whitespace-nowrap font-serif font-normal italic">
        {words.reduce((a, b) => (b.length > a.length ? b : a))}
      </span>
      <AnimatePresence initial={false}>
        <motion.span
          key={words[i]}
          className="text-gradient col-start-1 row-start-1 whitespace-nowrap font-serif font-normal italic"
          initial={{ y: '100%', opacity: 0, filter: 'blur(6px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: '-100%', opacity: 0, filter: 'blur(6px)' }}
          transition={{ duration: 0.7, ease }}
        >
          {words[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function Chip({ icon, children, className, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, ease, delay: D + delay }}
      className={`absolute z-20 ${className}`}
    >
      <div className="float glass flex items-center gap-2.5 rounded-2xl !bg-ink-900/75 px-3.5 py-2.5 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.7)]" style={{ animationDelay: `${delay * 2}s` }}>
        <span
          className="grid h-8 w-8 place-items-center rounded-xl text-white"
          style={{ background: 'linear-gradient(135deg, var(--g1), var(--g2))' }}
        >
          <Icon name={icon} className="h-4 w-4" />
        </span>
        <span className="whitespace-nowrap text-[13px] font-medium">{children}</span>
      </div>
    </motion.div>
  );
}

/** Marquee whose speed and skew react to how fast you scroll. */
function VelocityMarquee() {
  const base = useMotionValue(0);
  const { scrollY } = useScroll();
  const vel = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const factor = useTransform(vel, [-2000, 0, 2000], [-4, 0, 4], { clamp: false });
  const skew = useTransform(vel, [-2000, 2000], [8, -8]);
  const dir = useRef(1);
  const x = useTransform(base, (v) => `${wrap(-50, 0, v)}%`);
  useAnimationFrame((_, delta) => {
    let move = dir.current * -1.2 * (delta / 1000);
    const f = factor.get();
    if (f < 0) dir.current = -1;
    else if (f > 0) dir.current = 1;
    move += dir.current * -1.2 * Math.abs(f) * (delta / 1000) * 2;
    base.set(base.get() + move);
  });
  const row = [...marquee, ...marquee];
  return (
    <motion.div style={{ x, skewX: skew }} className="flex w-max gap-10">
      {[...row, ...row].map((t, i) => (
        <span key={i} className="flex items-center gap-10 whitespace-nowrap text-lg tracking-tight text-bone-muted md:text-xl">
          {t}
          <span className="text-gradient">✦</span>
        </span>
      ))}
    </motion.div>
  );
}

export default function Hero() {
  return (
    <section id="top" className="relative overflow-x-clip pt-[112px] md:pt-[140px]">
      {/* Floating 3D glass shapes */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: D + 0.2 }}
        className="pointer-events-none absolute inset-x-0 top-0 h-[100svh] max-h-[1000px]"
        aria-hidden="true"
      >
        <Lazy3D scene={HeroScene} className="h-full w-full" />
      </motion.div>

      <div className="container-site relative z-10">
        <div className="grid items-center gap-16 lg:grid-cols-12 lg:gap-8">
          {/* Copy */}
          <div className="lg:col-span-7">
            <motion.div {...up(0)} className="glass mb-8 inline-flex items-center gap-3 rounded-full py-1.5 pl-2 pr-4">
              <span className="flex items-center gap-2 rounded-full bg-fg/[0.06] px-2.5 py-1 text-[12px]">
                <span className="live-dot" /> Available
              </span>
              <span className="text-[13px] text-bone-muted">
                Currently at <span className="text-bone">{profile.company}</span>
              </span>
            </motion.div>

            <motion.p {...up(0.08)} className="mb-4 font-serif text-2xl italic text-bone-muted md:text-3xl">
              Hi, I'm Rishav <span className="wave not-italic">👋</span>
            </motion.p>

            <motion.h1 {...up(0.16)} className="text-[clamp(2.75rem,6.6vw,6rem)] font-medium leading-[1.02] tracking-tightest">
              <span className="sr-only">Rishav Kumar, AI Research Engineer — </span>I build <br />
              <Rotator /> <br />
              that <span className="font-serif font-normal italic">perform.</span>
            </motion.h1>

            <motion.p {...up(0.3)} className="mt-8 max-w-xl text-[17px] leading-relaxed text-bone-muted md:text-lg">
              AI research engineer at {profile.company} — LLM post-training evaluation, benchmark pipelines and
              model analysis, plus polished full-stack products shipped to production.
            </motion.p>

            <motion.div {...up(0.42)} className="mt-10 flex flex-wrap items-center gap-3">
              <Magnetic>
                <a href="#work" className="btn-primary group !px-7 !py-4">
                  See my work
                  <Arrow className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </Magnetic>
              <Magnetic>
                <a href="#/resume" className="btn-ghost !px-7 !py-4">
                  <Download /> Résumé
                </a>
              </Magnetic>
            </motion.div>
          </div>

          {/* Portrait */}
          <div className="relative mx-auto w-full max-w-[400px] lg:col-span-5 lg:max-w-[440px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1.3, ease, delay: D + 0.1 }}
              className="relative"
            >
              {/* glow */}
              <div
                className="absolute -inset-10 -z-10 rounded-full opacity-70 blur-3xl"
                style={{ background: 'radial-gradient(circle, rgba(244,114,182,0.45), rgba(167,139,250,0.25) 45%, transparent 70%)' }}
              />
              <div className="relative rounded-[44px] p-[2px]">
                <div className="ring-spin" />
                <div className="relative aspect-[4/5] overflow-hidden rounded-[42px] bg-ink-800">
                  <img src={portrait} alt="Rishav Kumar at Ethara AI" className="h-full w-full object-cover object-top" fetchpriority="high" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-transparent to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <p className="text-lg font-medium">{profile.name}</p>
                    <p className="text-sm text-bone-muted">
                      {profile.role} · {profile.company}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <Chip icon="brain" delay={0.5} className="-left-3 top-10 sm:-left-14">
              RL Environments
            </Chip>
            <Chip icon="bolt" delay={0.65} className="-right-3 top-[58%] sm:-right-12">
              Agent Evals
            </Chip>
            <Chip icon="code" delay={0.8} className="-left-3 bottom-[22%] sm:-left-16">
              Frontier Model Eval
            </Chip>
          </div>
        </div>
      </div>

      {/* Tech marquee */}
      <motion.div {...up(0.6)} className="glass marquee-mask relative z-10 mt-24 overflow-hidden border-x-0 py-5 md:mt-32" aria-label="Technologies">
        <VelocityMarquee />
      </motion.div>
    </section>
  );
}
