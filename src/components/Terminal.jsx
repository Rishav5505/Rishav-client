import { useEffect, useRef, useState } from 'react';
import { certifications, experience, profile, projects, services, stack } from '../data';
import { confetti, copyEmail, scrollToId, toggleTheme } from './Extras';
import { Reveal, SectionHead } from './ui';
import { T, useLang } from '../i18n';

const C = {
  a: 'text-accent',
  m: 'text-bone-muted',
  d: 'text-bone-dim',
  g: 'text-gradient',
  ok: 'text-emerald-400',
  err: 'text-rose-400',
};

const pad = (s, n) => s + ' '.repeat(Math.max(1, n - s.length));

/** Each command returns an array of output lines: string or [className, text] segments. */
const commands = {
  help: {
    desc: 'List all commands',
    run: () => [
      [[C.g, 'Available commands']],
      ...Object.entries(commands)
        .filter(([, c]) => !c.hidden)
        .map(([k, c]) => [[C.a, pad(k, 12)], [C.m, c.desc]]),
      '',
      [[C.d, 'Tip: ↑/↓ for history · Tab to autocomplete · try “sudo hire rishav”']],
    ],
  },
  about: {
    desc: 'Who is Rishav?',
    run: () => [
      [[C.g, profile.name]],
      `${profile.role} @ ${profile.company} · ${profile.location}`,
      '',
      'I work on LLM post-training evaluation, benchmark pipelines and',
      'dataset quality — and build polished full-stack products on the side.',
    ],
  },
  whoami: { desc: 'Print current user', run: () => ['guest — but you could be my next client ✨'] },
  experience: {
    desc: 'Career timeline',
    run: () =>
      experience.flatMap((e) => [[[C.a, `▸ ${e.role}`]], [[C.m, `  ${e.org} · ${e.period}`]]]),
  },
  projects: {
    desc: 'Things I have shipped',
    run: () => [
      ...projects.map((p, i) => [[C.d, `${String(i + 1).padStart(2, '0')} `], [C.a, pad(p.title, 14)], [C.m, p.kicker]]),
      '',
      [[C.d, 'Type “open <number>” to visit a live site, e.g. open 1']],
    ],
  },
  open: {
    desc: 'Open a project: open <n>',
    run: (args) => {
      const p = projects[parseInt(args[0], 10) - 1];
      if (!p) return [[[C.err, 'Usage: open <1-' + projects.length + '>']]];
      window.open(p.url, '_blank', 'noopener');
      return [[[C.ok, `↗ Opening ${p.title}…`]]];
    },
  },
  skills: {
    desc: 'My tech stack',
    run: () => stack.map((g) => [[C.a, pad(g.group, 14)], [C.m, g.items.join(', ')]]),
  },
  services: {
    desc: 'How I can help',
    run: () => services.map((s) => [[C.a, '◆ '], s.title]),
  },
  certs: {
    desc: 'Certifications & awards',
    run: () => certifications.map((c) => [[C.a, '✓ '], c.title, [C.d, ` — ${c.issuer}`]]),
  },
  contact: {
    desc: 'How to reach me',
    run: () => [
      [[C.a, pad('email', 10)], profile.email],
      [[C.a, pad('phone', 10)], profile.phone],
      [[C.a, pad('linkedin', 10)], profile.linkedin],
      [[C.a, pad('github', 10)], profile.github],
    ],
  },
  email: {
    desc: 'Copy my email address',
    run: () => {
      copyEmail();
      return [[[C.ok, `✓ ${profile.email} copied to clipboard`]]];
    },
  },
  resume: {
    desc: 'Download my résumé',
    run: () => {
      const a = document.createElement('a');
      a.href = profile.resume;
      a.download = 'Rishav_Kumar_Resume.pdf';
      a.click();
      return [[[C.ok, '⬇ Downloading Rishav_Kumar_Resume.pdf…']]];
    },
  },
  social: {
    desc: 'Open LinkedIn / GitHub',
    run: (args) => {
      const where = (args[0] || '').toLowerCase();
      if (where === 'github') window.open(profile.github, '_blank', 'noopener');
      else if (where === 'linkedin') window.open(profile.linkedin, '_blank', 'noopener');
      else return [[[C.m, 'Usage: social github | social linkedin']]];
      return [[[C.ok, `↗ Opening ${where}…`]]];
    },
  },
  theme: {
    desc: 'Toggle light / dark mode',
    run: () => {
      toggleTheme();
      return [[[C.ok, '✓ Theme switched']]];
    },
  },
  goto: {
    desc: 'Scroll to a section: goto work',
    run: (args) => {
      const map = { home: '#top', about: '#about', work: '#work', services: '#services', laptop: '#showcase', universe: '#universe', journey: '#experience', credentials: '#credentials', arcade: '#arcade', games: '#/games', resume: '#/resume', lab: '#/lab', contact: '#contact' };
      const id = map[(args[0] || '').toLowerCase()];
      if (!id) return [[[C.m, 'Sections: ' + Object.keys(map).join(', ')]]];
      setTimeout(() => scrollToId(id), 150);
      return [[[C.ok, `→ ${args[0]}`]]];
    },
  },
  date: { desc: 'Current date & time (IST)', run: () => [new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST'] },
  clear: { desc: 'Clear the screen', run: () => null },
  sudo: {
    hidden: true,
    run: (args) => {
      if (args.join(' ').toLowerCase() === 'hire rishav') {
        confetti();
        return [[[C.ok, '[sudo] permission granted 🎉']], 'Excellent decision. Let’s talk →', [[C.a, profile.email]]];
      }
      return [[[C.err, 'Nice try 😄 — try “sudo hire rishav”']]];
    },
  },
  ls: { hidden: true, run: () => [[[C.a, 'about.txt  projects/  skills.json  resume.pdf  contact.md']]] },
  hello: { hidden: true, run: () => ['Hey there 👋 type “help” to get started.'] },
  hi: { hidden: true, run: () => ['Hey there 👋 type “help” to get started.'] },
};

const names = Object.keys(commands);

function Line({ line }) {
  if (typeof line === 'string') return <div className="whitespace-pre-wrap">{line || '\u00A0'}</div>;
  return (
    <div className="whitespace-pre-wrap">
      {line.map((seg, i) => (typeof seg === 'string' ? <span key={i}>{seg}</span> : <span key={i} className={seg[0]}>{seg[1]}</span>))}
    </div>
  );
}

const banner = [
  [[C.g, '  ____  _     _                  ']],
  [[C.g, ' |  _ \\(_)___| |__   __ ___   __ ']],
  [[C.g, " | |_) | / __| '_ \\ / _` \\ \\ / / "]],
  [[C.g, ' |  _ <| \\__ \\ | | | (_| |\\ V /  ']],
  [[C.g, ' |_| \\_\\_|___/_| |_|\\__,_| \\_/   ']],
  '',
  [[C.m, `Welcome to rishav-os v2026 · ${profile.role}`]],
  [[C.m, 'Type '], [C.a, 'help'], [C.m, ' to see what I can do.']],
  '',
];

export default function Terminal() {
  const { t, lang } = useLang();
  const [log, setLog] = useState([{ type: 'out', lines: banner }]);
  const [value, setValue] = useState('');
  const [hist, setHist] = useState([]);
  const [hi, setHi] = useState(-1);
  const body = useRef(null);
  const input = useRef(null);

  useEffect(() => {
    body.current?.scrollTo({ top: body.current.scrollHeight, behavior: 'smooth' });
  }, [log]);

  const exec = (raw) => {
    const text = raw.trim();
    if (!text) return;
    const [cmd, ...args] = text.split(/\s+/);
    const c = commands[cmd.toLowerCase()];
    setHist((h) => [text, ...h].slice(0, 50));
    setHi(-1);
    if (c && cmd.toLowerCase() === 'clear') return setLog([]);
    const out = c ? c.run(args) : [[[C.err, `command not found: ${cmd}`], [C.m, ' — type help']]];
    setLog((l) => [...l, { type: 'in', text }, { type: 'out', lines: out || [] }]);
  };

  const onKey = (e) => {
    if (e.key === 'Enter') {
      exec(value);
      setValue('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const n = Math.min(hi + 1, hist.length - 1);
      if (hist[n] !== undefined) {
        setHi(n);
        setValue(hist[n]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const n = hi - 1;
      setHi(Math.max(n, -1));
      setValue(n >= 0 ? hist[n] : '');
    } else if (e.key === 'Tab' && value.trim()) {
      e.preventDefault();
      const match = names.filter((n) => !commands[n].hidden && n.startsWith(value.toLowerCase()));
      if (match.length === 1) setValue(match[0] + ' ');
      else if (match.length > 1) setLog((l) => [...l, { type: 'out', lines: [[[C.m, match.join('   ')]]] }]);
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLog([]);
    }
  };

  const quick = ['help', 'about', 'projects', 'skills', 'contact', 'sudo hire rishav'];

  return (
    <section id="terminal" className="py-24 md:py-32">
      <div className="container-site">
        <SectionHead
          center
          index="07"
          label="Terminal"
          title={<T k="terminal.title" />}
          aside={t('terminal.aside')}
        />

        <Reveal y={40} className="mx-auto max-w-4xl">
          <div
            className="overflow-hidden rounded-[22px] border border-fg/10 bg-[#0b0a12] text-[#ece9f3] shadow-[0_40px_120px_-30px_rgba(167,139,250,0.45)]"
            onClick={() => input.current?.focus({ preventScroll: true })}
            data-cursor="Type"
          >
            {/* window chrome */}
            <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <span className="h-3 w-3 rounded-full bg-[#28c840]" />
              <p className="flex-1 text-center font-mono text-[12px] text-white/50">rishav@ethara-ai: ~ — zsh</p>
              <span className="w-12" />
            </div>

            <div ref={body} className="h-[380px] overflow-y-auto px-5 py-4 font-mono text-[13px] leading-relaxed sm:h-[420px] sm:text-[13.5px]" data-lenis-prevent>
              {log.map((entry, i) =>
                entry.type === 'in' ? (
                  <div key={i} className="mt-2">
                    <span className="text-emerald-400">➜</span> <span className="text-[#c4b5fd]">~</span> {entry.text}
                  </div>
                ) : (
                  <div key={i} className="[&_.text-bone-muted]:text-white/60 [&_.text-bone-dim]:text-white/40 [&_.text-accent]:text-[#f0abfc]">
                    {entry.lines.map((l, j) => (
                      <Line key={j} line={l} />
                    ))}
                  </div>
                )
              )}
              <label className="mt-2 flex items-center gap-2">
                <span className="text-emerald-400">➜</span>
                <span className="text-[#c4b5fd]">~</span>
                <input
                  ref={input}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={onKey}
                  className="flex-1 bg-transparent text-[#ece9f3] caret-[#f0abfc] outline-none"
                  spellCheck={false}
                  autoCapitalize="off"
                  autoComplete="off"
                  aria-label="Terminal input"
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-white/10 px-4 py-3">
              {quick.map((q) => (
                <button
                  key={q}
                  onClick={(e) => {
                    e.stopPropagation();
                    exec(q);
                  }}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[11px] text-white/70 transition-colors hover:border-[#f0abfc]/50 hover:text-white"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
