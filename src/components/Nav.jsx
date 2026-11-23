import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { profile } from '../data';
import { ease } from './ui';
import { ThemeToggle, lockScroll, openPalette } from './Extras';
import { LangToggle, useLang } from '../i18n';

const links = [
  { href: '#about', k: 'nav.about', label: 'About', wide: true },
  { href: '#work', k: 'nav.work', label: 'Work' },
  { href: '#services', k: 'nav.services', label: 'Services', wide: true },
  { href: '#experience', k: 'nav.journey', label: 'Journey' },
  { href: '#contact', k: 'nav.contact', label: 'Contact' },
  { href: '#/resume', k: 'nav.resume', label: 'Résumé', route: 'resume' },
  { href: '#/lab', k: 'nav.lab', label: 'Lab', route: 'lab', emoji: '🧪' },
  { href: '#/games', k: 'nav.games', label: 'Games', route: 'games', emoji: '🎮' },
];

export default function Nav({ route = 'home' }) {
  const { t } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      // Scroll-spy: the last section whose top has passed 40% of the viewport is "active".
      const line = window.innerHeight * 0.4;
      let current = '';
      for (const l of links) {
        if (l.route) continue;
        const el = document.querySelector(l.href);
        if (el && el.getBoundingClientRect().top <= line) current = l.href;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [route]);

  const isActive = (l) => (route === 'home' ? active === l.href : route === 'work' ? l.href === '#work' : l.route === route);

  useEffect(() => {
    lockScroll(open);
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        open
          ? 'border-b border-fg/[0.06] bg-ink-900'
          : scrolled
            ? 'border-b border-fg/[0.06] bg-ink-900/75 backdrop-blur-xl'
            : 'border-b border-transparent'
      }`}
    >
      <div className="container-site flex h-[72px] items-center justify-between">
        <a href="#top" className="group flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="grid h-9 w-9 place-items-center rounded-full font-serif text-lg italic leading-none text-white shadow-[0_6px_20px_-6px_rgba(244,114,182,0.8)] transition-transform duration-500 group-hover:rotate-[360deg]" style={{ background: 'linear-gradient(135deg, var(--g1), var(--g2), var(--g3))' }}>
            R
          </span>
          <span className="whitespace-nowrap text-[15px] font-medium tracking-tight">{profile.name}</span>
        </a>

        <nav className="glass hidden items-center gap-1 rounded-full p-1.5 md:flex" aria-label="Primary">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              aria-current={isActive(l) ? 'page' : undefined}
              className={`relative whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] transition-colors ${l.wide ? 'hidden xl:block' : ''} ${isActive(l) ? 'text-white' : 'text-bone-muted hover:text-bone'}`}
            >
              {isActive(l) && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-full"
                  style={{ background: 'linear-gradient(120deg, var(--g1), var(--g2) 60%, var(--g3))' }}
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative">
                {t(l.k)}
                {l.emoji && <span className="ml-1">{l.emoji}</span>}
              </span>
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LangToggle />
          <ThemeToggle />
          <button
            onClick={openPalette}
            className="glass hidden items-center gap-2 whitespace-nowrap rounded-full py-2 pl-3 pr-2 text-[12px] text-bone-muted transition-colors hover:text-bone xl:flex"
            aria-label="Open command palette"
          >
            {t('nav.quick')}
            <kbd className="rounded-md border border-fg/10 bg-fg/5 px-1.5 py-0.5 font-mono text-[10px]">Ctrl K</kbd>
          </button>
          <a href="#contact" className="btn-primary hidden whitespace-nowrap !px-5 !py-2.5 text-[13px] lg:inline-flex">
            {t('nav.talk')}
          </a>
          <button
            className="grid h-10 w-10 place-items-center rounded-full border md:hidden hairline"
            style={{ borderColor: 'var(--line-strong)' }}
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            <span className="relative block h-3 w-4">
              <span className={`absolute left-0 h-px w-4 bg-bone transition-all duration-300 ${open ? 'top-1.5 rotate-45' : 'top-0'}`} />
              <span className={`absolute left-0 h-px w-4 bg-bone transition-all duration-300 ${open ? 'top-1.5 -rotate-45' : 'top-3'}`} />
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: '100dvh' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5, ease }}
            className="overflow-hidden md:hidden"
            aria-label="Mobile"
          >
            <div className="container-site flex flex-col gap-1 pt-6">
              {links.map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.05, duration: 0.5, ease }}
                  className="flex items-baseline justify-between border-b py-4 hairline"
                >
                  <span className="text-4xl font-medium tracking-tightest">{t(l.k)}</span>
                  <span className="font-mono text-xs text-bone-dim">0{i + 1}</span>
                </motion.a>
              ))}
              <a href={`mailto:${profile.email}`} className="mt-8 text-sm text-bone-muted">
                {profile.email}
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
