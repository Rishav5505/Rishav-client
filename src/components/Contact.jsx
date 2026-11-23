import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { profile } from '../data';
import { Arrow, Magnetic, Reveal, ease } from './ui';
import { SoundToggle, confetti, copyEmail, openShare, playSound } from './Extras';
import ParticleName from './ParticleName';
import { useLang } from '../i18n';
import { openBooking, openInstall, waLink } from './Engage';

const field =
  'w-full border-b bg-transparent py-4 text-[16px] text-bone placeholder:text-bone-dim outline-none transition-colors focus:border-pink-300/70 hairline';

const brief = {
  type: { label: 'What are we building?', multi: true, options: ['AI / LLM solution', 'Web app', 'Dashboard', 'Website', 'E-commerce', 'Mobile app', 'Something else'] },
  budget: { label: 'Budget range', options: ['< ₹50k', '₹50k – 1.5L', '₹1.5L – 5L', '₹5L+', 'Not sure yet'] },
  timeline: { label: 'Timeline', options: ['ASAP', '2 – 4 weeks', '1 – 3 months', 'Flexible'] },
};

/** Rishav's local (IST) time and whether he's likely awake. */
function useAvailability() {
  const read = () => {
    const now = new Date();
    const time = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true });
    const hour = parseInt(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata', hour: 'numeric', hour12: false }), 10) % 24;
    const awake = hour >= 9 && hour < 23;
    return { time, awake };
  };
  const [s, set] = useState(read);
  useEffect(() => {
    const t = setInterval(() => set(read()), 30000);
    return () => clearInterval(t);
  }, []);
  return s;
}

function Chip({ on, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`relative rounded-full border px-3.5 py-2 text-[13px] transition-all duration-300 ${
        on ? 'border-transparent text-white shadow-[0_8px_24px_-8px_rgba(244,114,182,0.7)]' : 'border-fg/10 bg-fg/[0.03] text-bone-muted hover:border-fg/25 hover:text-bone'
      }`}
      style={on ? { background: 'linear-gradient(120deg, var(--g1), var(--g2) 60%, var(--g3))' } : undefined}
    >
      {on && <span className="mr-1">✓</span>}
      {children}
    </button>
  );
}

export default function Contact() {
  const { t } = useLang();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [pick, setPick] = useState({ type: [], budget: '', timeline: '' });
  const [sent, setSent] = useState(false);
  const { time, awake } = useAvailability();

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const toggle = (key, opt) =>
    setPick((p) =>
      brief[key].multi
        ? { ...p, [key]: p[key].includes(opt) ? p[key].filter((o) => o !== opt) : [...p[key], opt] }
        : { ...p, [key]: p[key] === opt ? '' : opt }
    );

  const submit = (e) => {
    e.preventDefault();
    const lines = [
      form.message,
      '',
      '— Project brief —',
      `Type: ${pick.type.join(', ') || 'Not specified'}`,
      `Budget: ${pick.budget || 'Not specified'}`,
      `Timeline: ${pick.timeline || 'Not specified'}`,
      '',
      `— ${form.name}`,
      form.email,
    ];
    const subject = encodeURIComponent(`New project enquiry — ${form.name}${pick.type.length ? ` (${pick.type.join(', ')})` : ''}`);
    const body = encodeURIComponent(lines.join('\n'));
    confetti();
    playSound('chime');
    setSent(true);
    setTimeout(() => {
      window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
    }, 700);
  };

  const details = [
    { label: 'Email', value: profile.email, href: `mailto:${profile.email}` },
    { label: 'Phone', value: profile.phone, href: profile.phoneHref },
    { label: 'LinkedIn', value: 'rishav5505', href: profile.linkedin },
    { label: 'GitHub', value: profile.githubUser, href: profile.github },
  ];

  const filled = [pick.type.length > 0, !!pick.budget, !!pick.timeline, !!form.name, !!form.email, form.message.length > 10].filter(Boolean).length;

  return (
    <section id="contact" className="relative overflow-hidden pb-16 pt-24 md:pt-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/2 h-[600px] w-[1000px] -translate-x-1/2 translate-y-1/3 rounded-full"
        style={{ background: 'radial-gradient(closest-side, rgba(244,114,182,0.14), transparent)' }}
      />
      <div className="container-site relative">
        <Reveal className="text-center">
          <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-bone-muted">
            <span className="text-gradient font-semibold">11</span>
            <span className="h-3 w-px bg-fg/15" />
            Contact
          </span>
          <h2 className="mt-8 text-[clamp(3rem,9vw,8rem)] font-medium leading-[0.95] tracking-tightest">
            {t('contact.title')[0]}
            <br />
            <span className="text-gradient font-serif font-normal italic">{t('contact.title')[1]}</span>
          </h2>
        </Reveal>

        <div className="spot mt-20 grid gap-14 p-7 md:p-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            {/* Live availability */}
            <div className="glass mb-8 flex items-center gap-4 rounded-2xl p-4">
              <span className={`relative grid h-11 w-11 shrink-0 place-items-center rounded-full text-xl ${awake ? 'bg-emerald-400/15' : 'bg-indigo-400/15'}`}>
                {awake ? '🟢' : '🌙'}
              </span>
              <div>
                <p className="text-[15px] font-medium">{awake ? t('contact.online') : t('contact.night')}</p>
                <p className="text-[13px] text-bone-muted">
                  {awake ? `${t('contact.local')} ${time} IST` : `${time} IST · ${t('contact.morning')}`}
                </p>
              </div>
            </div>

            <p className="max-w-sm text-lg leading-relaxed text-bone-muted">
              {t('contact.intro')}
            </p>
            <button type="button" onClick={copyEmail} className="btn-ghost group mt-6 !py-3" data-cursor="Copy">
              <span className="font-mono text-[13px]">{profile.email}</span>
              <span className="rounded-md bg-fg/10 px-2 py-0.5 text-[11px] text-bone-muted transition-colors group-hover:text-bone">{t('contact.copy')}</span>
            </button>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href={waLink(t('wa.msg'))} target="_blank" rel="noopener noreferrer" className="btn !py-3 bg-[#25D366] text-white hover:opacity-90">
                💬 {t('contact.whatsapp')}
              </a>
              <button type="button" onClick={openBooking} className="btn-primary !py-3">
                📅 {t('contact.book')}
              </button>
            </div>
            <dl className="mt-10 border-t hairline">
              {details.map((d) => (
                <div key={d.label} className="flex items-center justify-between gap-4 border-b py-4 hairline">
                  <dt className="eyebrow">{d.label}</dt>
                  <dd>
                    <a
                      href={d.href}
                      target={d.href.startsWith('http') ? '_blank' : undefined}
                      rel="noopener noreferrer"
                      className="link-underline text-[15px] transition-colors hover:text-accent"
                    >
                      {d.value}
                    </a>
                  </dd>
                </div>
              ))}
              <div className="flex items-center justify-between gap-4 border-b py-4 hairline">
                <dt className="eyebrow">{t('contact.based')}</dt>
                <dd className="text-[15px]">{profile.location}</dd>
              </div>
            </dl>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-7 lg:pl-6">
            <form onSubmit={submit} className="space-y-2">
              {/* Project brief */}
              <div className="mb-6 flex items-center justify-between">
                <p className="eyebrow">{t('contact.brief')}</p>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-24 overflow-hidden rounded-full bg-fg/10">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, var(--g1), var(--g2), var(--g3))' }}
                      animate={{ width: `${(filled / 6) * 100}%` }}
                      transition={{ duration: 0.5, ease }}
                    />
                  </div>
                  <span className="font-mono text-[11px] text-bone-dim">{filled}/6</span>
                </div>
              </div>
              {Object.entries(brief).map(([key, b]) => (
                <fieldset key={key} className="mb-6">
                  <legend className="mb-3 text-[14px] font-medium">
                    {t(`contact.q.${key}`)} {b.multi && <span className="text-[12px] font-normal text-bone-dim">{t('contact.pick')}</span>}
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {b.options.map((o) => (
                      <Chip key={o} on={b.multi ? pick[key].includes(o) : pick[key] === o} onClick={() => toggle(key, o)}>
                        {o}
                      </Chip>
                    ))}
                  </div>
                </fieldset>
              ))}

              <div className="grid gap-2 sm:grid-cols-2 sm:gap-8">
                <label className="block">
                  <span className="sr-only">Your name</span>
                  <input name="name" required value={form.name} onChange={update} placeholder={t('contact.name')} className={field} autoComplete="name" />
                </label>
                <label className="block">
                  <span className="sr-only">Your email</span>
                  <input name="email" type="email" required value={form.email} onChange={update} placeholder={t('contact.email')} className={field} autoComplete="email" />
                </label>
              </div>
              <label className="block">
                <span className="sr-only">Project details</span>
                <textarea
                  name="message"
                  required
                  rows={4}
                  value={form.message}
                  onChange={update}
                  placeholder={t('contact.msg')}
                  className={`${field} resize-none`}
                />
              </label>
              <div className="flex flex-wrap items-center gap-6 pt-8">
                <Magnetic>
                  <button type="submit" className="btn-primary group !px-8 !py-4">
                    {t('contact.send')}
                    <Arrow className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </button>
                </Magnetic>
                <a href={profile.form} target="_blank" rel="noopener noreferrer" className="link-underline text-sm text-bone-muted hover:text-bone">
                  {t('contact.form')}
                </a>
              </div>
              <AnimatePresence>
                {sent && (
                  <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="pt-4 text-sm text-accent" role="status">
                    {t('contact.sent')}
                  </motion.p>
                )}
              </AnimatePresence>
            </form>
          </Reveal>
        </div>

        <ParticleName />

        <footer className="mt-16 flex pb-24 md:pb-0 flex-col gap-6 border-t pt-8 text-[13px] text-bone-dim hairline md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {profile.name}. {t('footer.made')}</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <button onClick={openShare} className="link-underline hover:text-bone">{t('footer.share')}</button>
            <button onClick={openInstall} className="link-underline hover:text-bone">📲 {t('footer.install')}</button>
            <SoundToggle className="hover:text-bone" />
            <button onClick={() => window.dispatchEvent(new Event('app:shortcuts'))} className="link-underline hidden hover:text-bone md:inline">
              {t('footer.shortcuts')} <kbd className="ml-1 rounded border border-fg/15 px-1 font-mono text-[10px]">?</kbd>
            </button>
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="link-underline hover:text-bone">LinkedIn</a>
            <a href={profile.github} target="_blank" rel="noopener noreferrer" className="link-underline hover:text-bone">GitHub</a>
            <a href="#top" className="link-underline hover:text-bone">{t('footer.top')}</a>
          </div>
        </footer>
      </div>
    </section>
  );
}
