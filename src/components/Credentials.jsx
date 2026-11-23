import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { certifications, profile } from '../data';
import { Arrow, CountUp, Download, Icon, Reveal, SectionHead, Spot, ease } from './ui';
import { lockScroll } from './Extras';
import { T, useLang } from '../i18n';

function CertModal({ cert, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    lockScroll(true);
    return () => {
      window.removeEventListener('keydown', onKey);
      lockScroll(false);
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={cert.title}
    >
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ duration: 0.5, ease }}
        className="flex h-[86vh] w-full max-w-5xl flex-col overflow-hidden rounded-[24px] border bg-ink-850 hairline"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b px-6 py-4 hairline">
          <div className="min-w-0">
            <p className="truncate font-medium">{cert.title}</p>
            <p className="text-sm text-bone-muted">{cert.issuer}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <a href={cert.file} download className="btn-ghost !px-4 !py-2 text-[13px]">
              <Download /> <span className="hidden sm:inline">Download</span>
            </a>
            <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full border hairline hover:bg-fg/5" aria-label="Close">
              ✕
            </button>
          </div>
        </div>
        <div className="flex-1 bg-ink-950 p-2" data-lenis-prevent>
          {cert.type === 'image' ? (
            <img src={cert.file} alt={cert.title} className="mx-auto h-full max-h-full w-auto object-contain" />
          ) : (
            <iframe src={cert.file} title={cert.title} className="h-full w-full rounded-lg border-0" />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

const LANG_COLORS = ['#a78bfa', '#f472b6', '#fdba74', '#67e8f9', '#86efac', '#fcd34d'];

/** Live numbers pulled from the GitHub API. */
function GitHubStats({ user, all }) {
  if (!user || !all) return null;
  const own = all.filter((r) => !r.fork);
  const stars = own.reduce((n, r) => n + r.stargazers_count, 0);
  const counts = {};
  own.forEach((r) => r.language && (counts[r.language] = (counts[r.language] || 0) + 1));
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  const langs = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, n], i) => ({ name, pct: (n / total) * 100, color: LANG_COLORS[i] }));
  const since = new Date(user.created_at).getFullYear();
  const lastPush = own.reduce((d, r) => (new Date(r.pushed_at) > d ? new Date(r.pushed_at) : d), new Date(0));
  const days = Math.max(0, Math.round((Date.now() - lastPush) / 86400000));

  const tiles = [
    { v: `${user.public_repos}`, l: 'Public repositories' },
    { v: `${stars}`, l: 'Stars earned' },
    { v: `${Object.keys(counts).length}`, l: 'Languages used' },
    { v: `${new Date().getFullYear() - since}+`, l: `Years on GitHub (since ${since})` },
  ];

  return (
    <div className="mb-6 grid gap-4 lg:grid-cols-12">
      <div className="grid grid-cols-2 gap-4 lg:col-span-7">
        {tiles.map((t) => (
          <Spot key={t.l} className="p-5">
            <p className="text-4xl font-medium tracking-tightest">
              <CountUp value={t.v} className="text-gradient" />
            </p>
            <p className="mt-2 text-[13px] text-bone-muted">{t.l}</p>
          </Spot>
        ))}
      </div>
      <Spot className="flex flex-col p-6 lg:col-span-5">
        <div className="flex items-center justify-between">
          <p className="eyebrow">Top languages</p>
          <p className="flex items-center gap-2 font-mono text-[11px] text-bone-muted">
            <span className="live-dot" /> {days === 0 ? 'pushed today' : `last push ${days}d ago`}
          </p>
        </div>
        <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-fg/[0.06]">
          {langs.map((l, i) => (
            <motion.span
              key={l.name}
              initial={{ width: 0 }}
              whileInView={{ width: `${l.pct}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease, delay: 0.1 * i }}
              style={{ background: l.color }}
              className="h-full"
            />
          ))}
        </div>
        <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2.5">
          {langs.map((l) => (
            <li key={l.name} className="flex items-center gap-2 text-[13px]">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: l.color }} />
              <span className="flex-1 truncate">{l.name}</span>
              <span className="font-mono text-[11px] text-bone-dim">{l.pct.toFixed(0)}%</span>
            </li>
          ))}
        </ul>
      </Spot>
    </div>
  );
}

function Repos() {
  const [repos, setRepos] = useState(null);
  const [all, setAll] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let alive = true;
    fetch(`https://api.github.com/users/${profile.githubUser}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((u) => alive && setUser(u))
      .catch(() => {});
    fetch(`https://api.github.com/users/${profile.githubUser}/repos?sort=updated&per_page=100`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (!alive) return;
        setAll(data);
        const own = data
          .filter((r) => !r.fork && r.name.toLowerCase() !== profile.githubUser.toLowerCase())
          .sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.pushed_at) - new Date(a.pushed_at));
        // Lead with documented repositories; fall back to the rest only if needed.
        const top = [...own.filter((r) => r.description), ...own.filter((r) => !r.description)].slice(0, 6);
        setRepos(top);
      })
      .catch(() => alive && setRepos([]));
    return () => {
      alive = false;
    };
  }, []);

  if (repos && repos.length === 0) return null;

  return (
    <div className="mt-24">
      <div className="mb-8 flex items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Open source</p>
          <h3 className="mt-3 text-3xl font-medium tracking-tight">Live from GitHub</h3>
        </div>
        <a href={profile.github} target="_blank" rel="noopener noreferrer" className="link-underline inline-flex items-center gap-2 text-sm text-bone-muted hover:text-bone">
          github.com/{profile.githubUser} <Arrow />
        </a>
      </div>

      <GitHubStats user={user} all={all} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(repos || Array.from({ length: 6 })).map((r, i) =>
          r ? (
            <Spot
              as="a"
              key={r.id}
              href={r.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex min-h-[170px] flex-col p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <p className="font-medium tracking-tight">{r.name}</p>
                <Arrow className="text-bone-dim transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
              </div>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-bone-muted">{r.description || 'No description provided.'}</p>
              <div className="mt-auto flex gap-4 pt-5 font-mono text-[11px] text-bone-dim">
                {r.language && <span>{r.language}</span>}
                {r.stargazers_count > 0 && <span>★ {r.stargazers_count}</span>}
                <span>{new Date(r.pushed_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</span>
              </div>
            </Spot>
          ) : (
            <div key={i} className="spot min-h-[170px] animate-pulse p-6">
              <div className="h-4 w-1/2 rounded bg-fg/5" />
              <div className="mt-4 h-3 w-4/5 rounded bg-fg/5" />
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default function Credentials() {
  const { t, lang } = useLang();
  const [active, setActive] = useState(null);

  return (
    <section id="credentials" className="py-24 md:py-32">
      <div className="container-site">
        <SectionHead
          index="09"
          label="Credentials"
          title={<T k="credentials.title" />}
          aside={t('credentials.aside')}
        />

        <div className="grid gap-16 lg:grid-cols-12">
          {/* Certifications */}
          <ul className="grid gap-3 sm:grid-cols-2 lg:col-span-8">
            {certifications.map((c, i) => (
              <Reveal as="li" key={c.title} delay={(i % 2) * 0.05}>
                <Spot as={c.file ? 'button' : 'div'} data-cursor={c.file ? 'Open' : undefined} onClick={c.file ? () => setActive(c) : undefined} className="group flex h-full w-full items-start gap-4 p-5 text-left">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-fg/10 bg-fg/[0.04] text-accent transition-colors group-hover:border-transparent group-hover:bg-gradient-to-br group-hover:from-violet-400 group-hover:to-pink-400 group-hover:text-white">
                    <Icon name="shield" className="h-[18px] w-[18px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium leading-snug tracking-tight">{c.title}</span>
                    <span className="mt-1 block text-sm text-bone-muted">{c.issuer}</span>
                  </span>
                  {c.file ? (
                    <Arrow className="mt-1 shrink-0 text-bone-dim transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
                  ) : (
                    <span className="mt-0.5 shrink-0 rounded-full border border-fg/10 px-2 py-0.5 text-[10px] text-bone-dim">on résumé</span>
                  )}
                </Spot>
              </Reveal>
            ))}
          </ul>

          {/* Résumé */}
          <Reveal className="lg:col-span-4">
            <div className="spot !sticky top-28 p-8">
              <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full opacity-50 blur-3xl" style={{ background: 'radial-gradient(circle, var(--g2), transparent 70%)' }} />
              <p className="eyebrow">Résumé</p>
              <h3 className="mt-4 text-3xl font-medium leading-tight tracking-tight">
                The full story, <span className="text-gradient font-serif font-normal italic">on one page.</span>
              </h3>
              <p className="mt-4 text-[15px] leading-relaxed text-bone-muted">
                AI research, LLM evaluation and full-stack development — one page.
              </p>
              <div className="mt-8 space-y-3">
                {[
                  { label: 'Latest résumé · Nov 2026', file: profile.resume, name: 'Rishav_Kumar_Resume.pdf' },
                ].map((r) => (
                  <div key={r.label} className="relative flex items-center justify-between gap-3 rounded-2xl border border-fg/10 bg-fg/[0.03] px-4 py-3.5">
                    <span className="text-sm">{r.label}</span>
                    <span className="flex gap-1">
                      <a href={r.file} target="_blank" rel="noopener noreferrer" className="grid h-9 w-9 place-items-center rounded-full text-bone-muted transition-colors hover:bg-fg/5 hover:text-bone" aria-label={`View ${r.label}`}>
                        <Arrow />
                      </a>
                      <a href={r.file} download={r.name} className="grid h-9 w-9 place-items-center rounded-full text-white transition-transform hover:scale-110" style={{ background: 'linear-gradient(135deg, var(--g1), var(--g2))' }} aria-label={`Download ${r.label}`}>
                        <Download />
                      </a>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        <Repos />
      </div>

      <AnimatePresence>{active && <CertModal cert={active} onClose={() => setActive(null)} />}</AnimatePresence>
    </section>
  );
}
