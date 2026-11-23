import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { profile, testimonials } from '../data';
import { T, useLang } from '../i18n';
import { lockScroll, toast } from './Extras';
import { Reveal, SectionHead, Spot, ease } from './ui';

const grad = { background: 'linear-gradient(135deg, var(--g1), var(--g2) 60%, var(--g3))' };
const WA_NUMBER = profile.phoneHref.replace(/\D/g, ''); // 919508287609
export const waLink = (text) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
export const openBooking = () => window.dispatchEvent(new Event('app:book'));
export const openInstall = () => window.dispatchEvent(new Event('app:install'));

function WaIcon({ className = 'h-6 w-6' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a9.9 9.9 0 0 0-8.5 15l-1.4 5 5.1-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" />
    </svg>
  );
}

/* ------------------------------------------------------ floating WhatsApp */

export function WhatsAppButton() {
  const { t } = useLang();
  return (
    <motion.a
      href={waLink(t('wa.msg'))}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 2.4, type: 'spring', stiffness: 260, damping: 18 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      className="group fixed bottom-6 right-6 z-[46] grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_12px_36px_-8px_rgba(37,211,102,0.8)] print:hidden"
      aria-label={t('wa.label')}
      data-cursor="Chat"
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366]/30" />
      <WaIcon className="relative h-7 w-7" />
      <span className="pointer-events-none absolute right-16 hidden whitespace-nowrap rounded-xl bg-ink-850 px-3 py-2 text-[13px] text-bone opacity-0 shadow-xl transition-opacity group-hover:opacity-100 md:block">
        {t('wa.label')}
      </span>
    </motion.a>
  );
}

/* --------------------------------------------------------- book a call */

const SLOTS = ['10:00', '12:00', '15:00', '17:00', '19:00'];

export function BookCall() {
  const { t, lang } = useLang();
  const [open, setOpen] = useState(false);
  const [day, setDay] = useState(null);
  const [slot, setSlot] = useState(null);
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');

  useEffect(() => {
    const on = () => setOpen(true);
    window.addEventListener('app:book', on);
    return () => window.removeEventListener('app:book', on);
  }, []);
  useEffect(() => {
    lockScroll(open);
    if (!open) return;
    const k = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open]);

  // Next 7 working days (Mon–Sat), starting tomorrow.
  const days = useMemo(() => {
    const out = [];
    const d = new Date();
    while (out.length < 7) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0) out.push(new Date(d));
    }
    return out;
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const loc = lang === 'hi' ? 'hi-IN' : 'en-GB';
  const ready = day && slot && name.trim();
  const summary = ready
    ? `📅 Call request\nName: ${name.trim()}\nWhen: ${day.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}, ${slot} IST${topic.trim() ? `\nTopic: ${topic.trim()}` : ''}`
    : '';

  const chip = (on) =>
    `rounded-2xl border px-3 py-2 text-[13px] transition-all ${on ? 'border-transparent text-white shadow-[0_8px_20px_-8px_rgba(244,114,182,0.7)]' : 'border-fg/10 bg-fg/[0.03] text-bone-muted hover:text-bone'}`;

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-3 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={t('book.title')}
            initial={{ y: 40, scale: 0.95, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.45, ease }}
            className="spot max-h-[94dvh] w-full max-w-lg overflow-y-auto !bg-ink-850/95 p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
            data-lenis-prevent
          >
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-2xl" style={grad}>
                📅
              </span>
              <div className="flex-1">
                <h3 className="text-2xl font-medium tracking-tight">{t('book.title')}</h3>
                <p className="mt-1 text-[14px] text-bone-muted">{t('book.sub')}</p>
              </div>
              <button onClick={() => setOpen(false)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-fg/15 hover:bg-fg/5" aria-label="Close">
                ✕
              </button>
            </div>

            <p className="mb-2 mt-6 text-[13px] font-medium">{t('book.day')}</p>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
              {days.map((d) => {
                const on = day && d.toDateString() === day.toDateString();
                return (
                  <button key={d.toDateString()} onClick={() => setDay(d)} className={`${chip(on)} flex flex-col items-center !px-1`} style={on ? grad : undefined}>
                    <span className="text-[11px] opacity-80">{d.toLocaleDateString(loc, { weekday: 'short' })}</span>
                    <span className="text-lg font-semibold leading-tight">{d.getDate()}</span>
                    <span className="text-[10px] opacity-70">{d.toLocaleDateString(loc, { month: 'short' })}</span>
                  </button>
                );
              })}
            </div>

            <p className="mb-2 mt-5 text-[13px] font-medium">{t('book.time')}</p>
            <div className="flex flex-wrap gap-2">
              {SLOTS.map((s) => (
                <button key={s} onClick={() => setSlot(s)} className={chip(slot === s)} style={slot === s ? grad : undefined}>
                  {s}
                </button>
              ))}
            </div>

            <div className="mt-5 grid gap-3">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('book.name')} className="h-12 rounded-2xl border border-fg/10 bg-fg/[0.04] px-4 text-[15px] outline-none focus:border-accent/60" autoComplete="name" />
              <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder={t('book.topic')} className="h-12 rounded-2xl border border-fg/10 bg-fg/[0.04] px-4 text-[15px] outline-none focus:border-accent/60" />
            </div>

            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              <a
                href={ready ? waLink(summary) : undefined}
                target="_blank"
                rel="noopener noreferrer"
                aria-disabled={!ready}
                onClick={(e) => (ready ? toast('✅ Opening WhatsApp…') : e.preventDefault())}
                className={`flex items-center justify-center gap-2 rounded-full px-5 py-3.5 text-[14px] font-medium text-white transition-opacity ${ready ? 'bg-[#25D366] hover:opacity-90' : 'cursor-not-allowed bg-[#25D366]/40'}`}
              >
                <WaIcon className="h-5 w-5" /> {t('book.viaWa')}
              </a>
              <a
                href={ready ? `mailto:${profile.email}?subject=${encodeURIComponent(`Call request — ${name.trim()}`)}&body=${encodeURIComponent(summary)}` : undefined}
                aria-disabled={!ready}
                onClick={(e) => !ready && e.preventDefault()}
                className={`btn-ghost !py-3.5 text-[14px] ${ready ? '' : 'cursor-not-allowed opacity-50'}`}
              >
                ✉️ {t('book.viaMail')}
              </a>
            </div>
            <p className="mt-3 text-center text-[12px] text-bone-dim">{t('book.note')}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------- install as app */

const isStandalone = () => window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
let deferred = null;
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e;
    window.dispatchEvent(new Event('app:installable'));
  });
}

export function InstallApp() {
  const { t } = useLang();
  const [banner, setBanner] = useState(false);
  const [ios, setIos] = useState(false);

  const install = async () => {
    setBanner(false);
    if (deferred) {
      deferred.prompt();
      const { outcome } = await deferred.userChoice;
      deferred = null;
      if (outcome === 'accepted') toast('🎉 Installed!');
    } else if (isIOS()) setIos(true);
    else toast('Use your browser menu → “Install app” / “Add to Home screen”.');
  };

  useEffect(() => {
    if (isStandalone()) return;
    const onManual = () => install();
    window.addEventListener('app:install', onManual);
    let dismissed = false;
    try {
      dismissed = localStorage.getItem('rk-install-dismissed') === '1';
    } catch {}
    const timer = !dismissed && setTimeout(() => (deferred || isIOS()) && setBanner(true), 30000);
    const onReady = () => !dismissed && setTimeout(() => setBanner(true), 30000);
    window.addEventListener('app:installable', onReady);
    return () => {
      window.removeEventListener('app:install', onManual);
      window.removeEventListener('app:installable', onReady);
      clearTimeout(timer);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const later = () => {
    setBanner(false);
    try {
      localStorage.setItem('rk-install-dismissed', '1');
    } catch {}
  };

  return (
    <>
      <AnimatePresence>
        {banner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.5, ease }}
            className="fixed inset-x-3 bottom-24 z-[47] mx-auto max-w-md print:hidden"
          >
            <div className="glass flex items-center gap-3 rounded-3xl !bg-ink-850/95 p-3 pr-4 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]">
              <img src={`${import.meta.env.BASE_URL}icon-192.png`} alt="" className="h-12 w-12 rounded-2xl" />
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-medium">{t('install.title')}</p>
                <p className="truncate text-[12px] text-bone-muted">{t('install.sub')}</p>
              </div>
              <button onClick={later} className="text-[12px] text-bone-dim hover:text-bone">
                {t('install.later')}
              </button>
              <button onClick={install} className="rounded-full px-4 py-2 text-[13px] font-semibold text-white" style={grad}>
                {t('install.btn')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {ios && (
          <motion.div className="fixed inset-0 z-[110] grid place-items-center bg-black/70 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIos(false)}>
            <Spot className="max-w-sm !bg-ink-850 p-6 text-center">
              <p className="text-4xl">📲</p>
              <p className="mt-3 text-lg font-medium">{t('install.title')}</p>
              <p className="mt-2 text-[14px] text-bone-muted">{t('install.ios')}</p>
            </Spot>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* --------------------------------------------------------- testimonials */
// Renders only when real quotes exist in data.js → `testimonials`.

export function Testimonials() {
  const { t } = useLang();
  if (!testimonials.length) return null;
  return (
    <section id="testimonials" className="py-24 md:py-32">
      <div className="container-site">
        <SectionHead center index="★" label="Testimonials" title={<T k="testimonials.title" />} aside={t('testimonials.aside')} />
        <div className="columns-1 gap-4 md:columns-2 lg:columns-3">
          {testimonials.map((q, i) => (
            <Reveal key={q.name} delay={i * 0.05} className="mb-4 break-inside-avoid">
              <Spot className="p-7">
                <p className="text-gradient font-serif text-6xl leading-none">“</p>
                <p className="-mt-4 text-[16px] leading-relaxed">{q.quote}</p>
                <div className="mt-6 flex items-center gap-3">
                  {q.photo ? (
                    <img src={q.photo} alt="" className="h-11 w-11 rounded-full object-cover" />
                  ) : (
                    <span className="grid h-11 w-11 place-items-center rounded-full text-[15px] font-semibold text-white" style={grad}>
                      {q.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="text-[15px] font-medium">{q.name}</p>
                    <p className="truncate text-[13px] text-bone-muted">{q.role}</p>
                  </div>
                  {q.link && (
                    <a href={q.link} target="_blank" rel="noopener noreferrer" className="ml-auto text-[12px] text-bone-dim hover:text-accent">
                      Verify ↗
                    </a>
                  )}
                </div>
              </Spot>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
