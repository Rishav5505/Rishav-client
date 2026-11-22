import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import portrait from '../assets/w_rishav_profile.webp';
import { certifications, experience, profile, projects, services, stack } from '../data';
import { copyEmail, lockScroll, scrollToId } from './Extras';
import { ease } from './ui';

/**
 * A friendly, offline Q&A bot. It matches keywords against a small set of
 * intents and answers from the portfolio data — no API, no cost, instant.
 */
const intents = [
  {
    id: 'hi',
    keys: ['hi', 'hello', 'hey', 'namaste', 'hii', 'yo'],
    answer: () => ({ text: `Hey there 👋 I'm Rishav's assistant. Ask me about his work, skills, experience or how to hire him!` }),
  },
  {
    id: 'about',
    keys: ['who', 'about', 'introduce', 'yourself', 'rishav', 'tell me'],
    answer: () => ({
      text: `${profile.name} is an ${profile.role} at ${profile.company} (${profile.location}). He works on LLM post-training evaluation, benchmark pipelines and dataset quality — and builds polished full-stack products.`,
    }),
  },
  {
    id: 'role',
    keys: ['current', 'job', 'role', 'designation', 'working', 'company', 'ethara', 'position'],
    answer: () => ({
      text: `Right now he's an AI Research Engineer at ${profile.company} — promoted from Software Engineer, a role he joined through a Pre-Placement Offer (PPO) after his LLM Post-Training internship.`,
    }),
  },
  {
    id: 'experience',
    keys: ['experience', 'career', 'journey', 'worked', 'internship', 'xebia', 'background'],
    answer: () => ({
      text: 'Here’s his journey so far:',
      list: experience.map((e) => `${e.role} — ${e.org.split(' · ')[0]} (${e.period})`),
      action: { label: 'See full journey', run: () => scrollToId('#experience') },
    }),
  },
  {
    id: 'skills',
    keys: ['skill', 'stack', 'tech', 'technology', 'language', 'react', 'python', 'node', 'know', 'tools'],
    answer: () => ({
      text: 'His toolkit:',
      list: stack.map((g) => `${g.group}: ${g.items.join(', ')}`),
      action: { label: 'Open 3D tech universe', run: () => scrollToId('#universe') },
    }),
  },
  {
    id: 'projects',
    keys: ['project', 'work', 'portfolio', 'built', 'build', 'app', 'website', 'example', 'demo'],
    answer: () => ({
      text: `He has shipped ${projects.length} live products, including:`,
      list: projects.slice(0, 5).map((p) => `${p.title} — ${p.kicker}`),
      action: { label: 'Browse all projects', run: () => scrollToId('#work') },
    }),
  },
  {
    id: 'ai',
    keys: ['ai', 'ml', 'llm', 'rl', 'agent', 'eval', 'model', 'research', 'benchmark', 'frontier', 'ai work', 'artificial'],
    answer: () => ({
      text: 'On the AI side he works on post-training evaluation of LLMs — benchmark pipelines, model performance analysis and dataset quality validation. He has built and validated 100+ multi-architecture Docker images for large-scale evaluation.',
    }),
  },
  {
    id: 'services',
    keys: ['service', 'help', 'offer', 'can you', 'do you'],
    answer: () => ({ text: 'He can help you with:', list: services.map((s) => s.title), action: { label: 'View services', run: () => scrollToId('#services') } }),
  },
  {
    id: 'hire',
    keys: ['hire', 'hiring', 'available', 'availability', 'freelance', 'freelancing', 'cost', 'price', 'rate', 'budget', 'quote', 'charge', 'how much', 'build my', 'my website', 'my app', 'my project'],
    answer: () => ({
      text: 'He’s open to select projects. Share your idea, timeline and budget and he’ll get back to you — usually within 24 hours.',
      action: { label: 'Start a project', run: () => scrollToId('#contact') },
    }),
  },
  {
    id: 'contact',
    keys: ['contact', 'email', 'mail', 'phone', 'call', 'reach', 'whatsapp', 'number', 'linkedin'],
    answer: () => ({
      text: `📧 ${profile.email}\n📞 ${profile.phone}\n💼 linkedin.com/in/rishav5505`,
      action: { label: 'Copy email', run: copyEmail },
    }),
  },
  {
    id: 'resume',
    keys: ['resume', 'cv', 'résumé', 'pdf'],
    answer: () => ({
      text: 'Here’s his résumé 📄',
      action: {
        label: 'Download résumé',
        run: () => {
          const a = document.createElement('a');
          a.href = profile.resume;
          a.download = 'Rishav_Kumar_Resume.pdf';
          a.click();
        },
      },
    }),
  },
  {
    id: 'education',
    keys: ['education', 'degree', 'college', 'university', 'study', 'btech', 'b.tech'],
    answer: () => ({ text: 'He did his B.Tech in Computer Science (Full Stack specialisation) at K.R. Mangalam University, 2022 — 2026.' }),
  },
  {
    id: 'certs',
    keys: ['certificate', 'certification', 'award', 'achievement'],
    answer: () => ({ text: 'Some of his credentials:', list: certifications.map((c) => `${c.title} — ${c.issuer}`), action: { label: 'View certificates', run: () => scrollToId('#credentials') } }),
  },
  {
    id: 'location',
    keys: ['where', 'location', 'city', 'based', 'remote', 'relocate'],
    answer: () => ({ text: `He’s based in ${profile.location} and works with clients remotely too.` }),
  },
  {
    id: 'thanks',
    keys: ['thanks', 'thank', 'great', 'awesome', 'cool', 'nice', 'ok', 'okay'],
    answer: () => ({ text: 'Happy to help! 😊 Anything else you’d like to know?' }),
  },
];

const suggestions = ['Who is Rishav?', 'Current role', 'Show projects', 'Tech stack', 'Is he available?', 'Contact details'];

function reply(q) {
  const t = ` ${q.toLowerCase().replace(/[^a-z0-9.é ]/g, ' ')} `;
  let best = null;
  let score = 0;
  for (const it of intents) {
    const s = it.keys.reduce((n, k) => n + (t.includes(` ${k}`) ? k.length : 0), 0);
    if (s > score) {
      score = s;
      best = it;
    }
  }
  if (!best)
    return {
      text: 'Hmm, I’m not sure about that one 🤔 — but Rishav would love to answer it personally!',
      action: { label: 'Send him a message', run: () => scrollToId('#contact') },
    };
  return best.answer();
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{ from: 'bot', text: `Hi! 👋 I'm Rishav's assistant. What would you like to know?` }]);
  const [typing, setTyping] = useState(false);
  const [value, setValue] = useState('');
  const [nudge, setNudge] = useState(false);
  const body = useRef(null);

  useEffect(() => {
    const on = () => setOpen(true);
    window.addEventListener('app:chat', on);
    const t = setTimeout(() => setNudge(true), 9000);
    return () => {
      window.removeEventListener('app:chat', on);
      clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    if (open) setNudge(false);
    if (window.innerWidth < 640) lockScroll(open);
  }, [open]);

  useEffect(() => {
    body.current?.scrollTo({ top: body.current.scrollHeight, behavior: 'smooth' });
  }, [msgs, typing]);

  const ask = (q) => {
    if (!q.trim() || typing) return;
    setMsgs((m) => [...m, { from: 'me', text: q }]);
    setValue('');
    setTyping(true);
    setTimeout(() => {
      setMsgs((m) => [...m, { from: 'bot', ...reply(q) }]);
      setTyping(false);
    }, 650 + Math.random() * 450);
  };

  return (
    <>
      {/* Launcher */}
      <div className="fixed bottom-6 left-6 z-[46]">
        <AnimatePresence>
          {nudge && !open && (
            <motion.button
              initial={{ opacity: 0, x: -10, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => setOpen(true)}
              className="glass absolute bottom-[68px] left-0 w-max max-w-[220px] rounded-2xl rounded-bl-sm !bg-ink-850/90 px-4 py-2.5 text-left text-[13px] shadow-xl"
            >
              Got a question? Ask me anything about Rishav 💬
            </motion.button>
          )}
        </AnimatePresence>
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setOpen((o) => !o)}
          className="relative grid h-14 w-14 place-items-center rounded-full text-white shadow-[0_12px_40px_-8px_rgba(244,114,182,0.7)]"
          style={{ background: 'linear-gradient(135deg, var(--g1), var(--g2), var(--g3))' }}
          aria-label={open ? 'Close chat' : 'Chat with Rishav’s assistant'}
          data-cursor="Chat"
        >
          {!open && <span className="absolute inset-0 animate-ping rounded-full bg-pink-400/30" />}
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={open ? 'x' : 'c'} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} className="relative">
              {open ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true"><path d="M4 5h16v11H9l-5 4V5Z" /><path d="M8 10h.01M12 10h.01M16 10h.01" strokeWidth="2.6" strokeLinecap="round" /></svg>
              )}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.4, ease }}
            style={{ transformOrigin: 'bottom left' }}
            className="spot !fixed inset-x-3 bottom-24 z-[46] flex h-[min(560px,calc(100dvh-140px))] flex-col !bg-ink-850/95 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:inset-x-auto sm:left-6 sm:w-[380px]"
            role="dialog"
            aria-label="Chat with Rishav’s assistant"
          >
            <div className="flex items-center gap-3 border-b border-fg/10 px-5 py-4">
              <div className="relative">
                <img src={portrait} alt="" className="h-10 w-10 rounded-full object-cover object-top" />
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-ink-850 bg-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-medium leading-tight">Ask about Rishav</p>
                <p className="text-[12px] text-bone-muted">Instant answers · usually right 😄</p>
              </div>
            </div>

            <div ref={body} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" data-lenis-prevent>
              {msgs.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed ${
                      m.from === 'me' ? 'rounded-br-sm text-white' : 'rounded-bl-sm border border-fg/[0.08] bg-fg/[0.05]'
                    }`}
                    style={m.from === 'me' ? { background: 'linear-gradient(135deg, var(--g1), var(--g2))' } : undefined}
                  >
                    {m.text}
                    {m.list && (
                      <ul className="mt-2 space-y-1">
                        {m.list.map((l) => (
                          <li key={l} className="flex gap-2 text-[13px] text-bone-muted">
                            <span className="text-accent">•</span>
                            {l}
                          </li>
                        ))}
                      </ul>
                    )}
                    {m.action && (
                      <button
                        onClick={() => {
                          m.action.run();
                          if (window.innerWidth < 640) setOpen(false);
                        }}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-fg/15 px-3 py-1.5 text-[12px] font-medium transition-colors hover:border-accent hover:text-accent"
                      >
                        {m.action.label} →
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
              {typing && (
                <div className="flex gap-1 rounded-2xl rounded-bl-sm border border-fg/[0.08] bg-fg/[0.05] px-4 py-3.5" style={{ width: 'fit-content' }}>
                  {[0, 1, 2].map((d) => (
                    <motion.span
                      key={d}
                      className="h-1.5 w-1.5 rounded-full bg-bone-muted"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: d * 0.12 }}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto px-4 pb-3" data-lenis-prevent>
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => ask(s)}
                  className="shrink-0 rounded-full border border-fg/10 bg-fg/[0.03] px-3 py-1.5 text-[12px] text-bone-muted transition-colors hover:border-accent/50 hover:text-bone"
                >
                  {s}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                ask(value);
              }}
              className="flex items-center gap-2 border-t border-fg/10 p-3"
            >
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Ask anything…"
                className="h-11 flex-1 rounded-full border border-fg/10 bg-fg/[0.04] px-4 text-[14px] outline-none placeholder:text-bone-dim focus:border-accent/60"
                aria-label="Your question"
              />
              <button
                type="submit"
                className="grid h-11 w-11 place-items-center rounded-full text-white disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, var(--g1), var(--g2))' }}
                disabled={!value.trim()}
                aria-label="Send"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
