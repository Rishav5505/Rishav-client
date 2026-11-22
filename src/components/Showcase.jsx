import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { projects } from '../data';
import Lazy3D, { LaptopScene } from '../three/Lazy3D';
import { Arrow, Magnetic, Reveal, SectionHead, ease } from './ui';

const images = projects.map((p) => p.image);

function Fallback({ index }) {
  return (
    <div className="grid h-full place-items-center p-6">
      <img src={images[index]} alt="" className="max-h-full w-full max-w-xl rounded-2xl object-cover shadow-2xl" />
    </div>
  );
}

export default function Showcase() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const p = projects[index];

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % projects.length), 4200);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <section id="showcase" className="relative py-24 md:py-32">
      <div className="container-site">
        <SectionHead
          index="03"
          label="Showcase"
          title={
            <>
              Live on <span className="text-gradient font-serif font-normal italic">every screen</span>
            </>
          }
          aside="A 3D tour of the products I've shipped. Move your mouse to look around — pick any project below."
        />

        <div className="grid items-center gap-10 lg:grid-cols-12" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          {/* 3D laptop */}
          <Reveal y={40} className="relative lg:col-span-8">
            <div
              className="pointer-events-none absolute inset-[10%] -z-10 rounded-full opacity-60 blur-3xl"
              style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.4), rgba(244,114,182,0.2) 50%, transparent 70%)' }}
            />
            <Lazy3D scene={LaptopScene} images={images} index={index} className="h-[340px] w-full sm:h-[460px] lg:h-[560px]" fallback={<Fallback index={index} />} />
          </Reveal>

          {/* Details */}
          <div className="lg:col-span-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
                transition={{ duration: 0.5, ease }}
              >
                <p className="eyebrow">
                  {String(index + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')} · {p.category}
                </p>
                <h3 className="mt-4 text-4xl font-medium tracking-tightest md:text-5xl">{p.title}</h3>
                <p className="text-gradient mt-1 font-serif text-2xl italic">{p.kicker}</p>
                <p className="mt-5 text-[15px] leading-relaxed text-bone-muted">{p.description}</p>
                <ul className="mt-5 flex flex-wrap gap-1.5">
                  {p.tags.map((t) => (
                    <li key={t} className="rounded-full border border-fg/[0.08] bg-fg/[0.03] px-3 py-1 text-xs text-bone-muted">
                      {t}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Magnetic>
                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="btn-primary group">
                      Visit live site
                      <Arrow className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </a>
                  </Magnetic>
                  <a href={`#/work/${p.id}`} className="link-underline text-[14px] text-bone-muted hover:text-bone">
                    Read case study →
                  </a>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Thumbnails */}
            <div className="mt-10 grid grid-cols-5 gap-2 sm:grid-cols-9 lg:grid-cols-5">
              {projects.map((pr, i) => (
                <button
                  key={pr.id}
                  onClick={() => setIndex(i)}
                  className={`relative aspect-square overflow-hidden rounded-xl border transition-all duration-300 ${
                    i === index ? 'scale-105 border-transparent ring-2 ring-accent' : 'border-fg/10 opacity-60 hover:opacity-100'
                  }`}
                  aria-label={`Show ${pr.title}`}
                  aria-pressed={i === index}
                >
                  <img src={pr.image} alt="" loading="lazy" className="h-full w-full object-cover" />
                  {i === index && !paused && (
                    <motion.span
                      key={`bar-${index}`}
                      className="absolute bottom-0 left-0 h-[3px]"
                      style={{ background: 'linear-gradient(90deg, var(--g1), var(--g2))' }}
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 4.2, ease: 'linear' }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
