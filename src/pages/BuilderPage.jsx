import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { confetti, playSound, toast } from '../components/Extras';
import { Arrow, Magnetic, Reveal, Spot, ease } from '../components/ui';
import { EXAMPLES, applyEdit, describe, parsePrompt, renderSite } from './builder/engine';

const grad = { background: 'linear-gradient(135deg, var(--g1), var(--g2) 60%, var(--g3))' };
const DEVICES = { desktop: { w: 1280, label: '🖥️ Desktop' }, tablet: { w: 820, label: '📲 Tablet' }, mobile: { w: 390, label: '📱 Mobile' } };
const STEPS = ['Reading your prompt', 'Choosing layout & sections', 'Picking colours & fonts', 'Writing the copy', 'Assembling the page'];
const EDIT_IDEAS = ['make it blue', 'dark karo', 'add FAQ', 'gallery hatao', 'luxury style', 'rounded corners'];

function Preview({ html, device, building, step }) {
  const box = useRef(null);
  const [cw, setCw] = useState(900);
  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setCw(e.contentRect.width));
    if (box.current) ro.observe(box.current);
    return () => ro.disconnect();
  }, []);
  const vw = DEVICES[device].w;
  const scale = Math.min(1, cw / vw);
  const H = 640;

  return (
    <div ref={box} className="relative overflow-hidden rounded-b-[22px] bg-ink-900" style={{ height: H }}>
      {html ? (
        <div className="mx-auto h-full origin-top transition-[width] duration-500" style={{ width: vw * scale }}>
          <iframe
            title="Website preview"
            srcDoc={html}
            sandbox="allow-scripts allow-forms"
            className="origin-top-left rounded-b-[22px] border-0 bg-white"
            style={{ width: vw, height: H / scale, transform: `scale(${scale})` }}
            data-lenis-prevent
          />
        </div>
      ) : (
        <div className="grid h-full place-items-center p-8 text-center">
          <div>
            <p className="text-6xl">✨</p>
            <p className="mt-4 text-xl font-medium">Your website will appear here</p>
            <p className="mx-auto mt-2 max-w-sm text-[14px] text-bone-muted">Describe a business on the left — or tap one of the ideas — and press Build.</p>
          </div>
        </div>
      )}
      <AnimatePresence>
        {building && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 grid place-items-center bg-ink-900/85 backdrop-blur-md">
            <div className="w-72">
              <motion.div className="mx-auto mb-6 h-16 w-16 rounded-2xl" style={grad} animate={{ rotate: [0, 90, 180, 270, 360], borderRadius: ['16px', '32px', '16px'] }} transition={{ duration: 1.6, repeat: Infinity }} />
              {STEPS.map((s, i) => (
                <p key={s} className={`flex items-center gap-2 py-1 text-[14px] transition-colors ${i < step ? 'text-bone' : i === step ? 'text-accent' : 'text-bone-dim'}`}>
                  <span className="w-5">{i < step ? '✓' : i === step ? '•' : ''}</span>
                  {s}
                </p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function BuilderPage() {
  const [prompt, setPrompt] = useState('');
  const [cfg, setCfg] = useState(null);
  const [html, setHtml] = useState('');
  const [device, setDevice] = useState('desktop');
  const [building, setBuilding] = useState(false);
  const [step, setStep] = useState(0);
  const [log, setLog] = useState([]);
  const [edit, setEdit] = useState('');
  const logRef = useRef(null);

  useEffect(() => {
    document.title = 'Site Builder — Rishav Kumar';
  }, []);
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [log]);

  // Short staged animation so the steps are readable; the work itself is instant.
  const run = (nextCfg, entry) => {
    setBuilding(true);
    setStep(0);
    STEPS.forEach((_, i) => setTimeout(() => setStep(i + 1), 260 * (i + 1)));
    setTimeout(() => {
      setCfg(nextCfg);
      setHtml(renderSite(nextCfg));
      setBuilding(false);
      setLog((l) => [...l, entry]);
      playSound('chime');
    }, 260 * (STEPS.length + 1));
  };

  const build = (text = prompt) => {
    const p = text.trim();
    if (!p || building) return;
    setPrompt(p);
    const c = parsePrompt(p);
    setLog([]);
    run(c, { you: p, bot: `Built a ${describe(c)}.` });
    setTimeout(() => confetti(), 260 * (STEPS.length + 1) + 50);
  };

  const applyChange = (text = edit) => {
    const t = text.trim();
    if (!t || !cfg || building) return;
    const { cfg: next, note } = applyEdit(cfg, t);
    setEdit('');
    if (!note) {
      setLog((l) => [...l, { you: t, bot: 'Hmm, I didn’t catch that. Try: “make it green”, “dark karo”, “add pricing”, “remove gallery”, “rename to …”, “luxury style”.' }]);
      return;
    }
    run(next, { you: t, bot: `Done — ${note}.` });
  };

  const fileName = `${(cfg?.name || 'website').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.html`;
  const download = () => {
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    toast(`⬇ ${fileName} downloaded`);
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(html);
      toast('HTML copied to clipboard ✨');
    } catch {
      toast('Copy failed — use Download instead');
    }
  };
  const openTab = () => {
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    window.open(url, '_blank', 'noopener');
  };

  return (
    <main className="relative pb-24 pt-[104px] md:pt-[124px]">
      <div className="container-site">
        <a href="#/" className="link-underline text-[13px] text-bone-muted hover:text-bone">
          ← Back to portfolio
        </a>

        <div className="mt-10 grid items-end gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <Reveal>
              <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-bone-muted">
                ✨ Site Builder · free · runs in your browser
              </span>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="mt-6 text-[clamp(2.8rem,7.5vw,6.5rem)] font-medium leading-[0.95] tracking-tightest">
                Describe it. <span className="text-gradient font-serif font-normal italic">See it live.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-bone-muted">
                Type what you want — a bakery, a gym, a startup — and get a complete, responsive website in seconds. Tweak it in plain words (English or Hinglish), preview on any device, and download the code.
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="lg:col-span-4">
            <p className="rounded-2xl border border-fg/10 bg-fg/[0.03] p-4 text-[12.5px] leading-relaxed text-bone-muted">
              <span className="font-semibold text-bone">How it works:</span> a rule-based smart template engine I wrote — it reads keywords (business type, name, city, colour, style, sections) and assembles a site from hand-designed templates. No AI model, no data leaves your browser.
            </p>
          </Reveal>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-12">
          {/* ---------------- left: prompt + edits */}
          <div className="flex flex-col gap-4 lg:col-span-4">
            <Spot className="p-5">
              <label className="eyebrow" htmlFor="site-prompt">
                1 · Describe your website
              </label>
              <textarea
                id="site-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.ctrlKey || e.metaKey) && build()}
                rows={4}
                placeholder="e.g. A cute bakery called “Sweet Crumbs” in Delhi with a pink theme and a menu"
                className="mt-3 w-full resize-none rounded-2xl border border-fg/10 bg-fg/[0.04] p-4 text-[15px] outline-none placeholder:text-bone-dim focus:border-accent/60"
              />
              <Magnetic className="mt-3 w-full">
                <button onClick={() => build()} disabled={!prompt.trim() || building} className="btn-primary w-full !py-3.5 disabled:opacity-50">
                  {building ? 'Building…' : cfg ? '↻ Rebuild from prompt' : '✨ Build my website'}
                </button>
              </Magnetic>
              <p className="mb-2 mt-5 text-[12px] text-bone-dim">Or try an idea:</p>
              <div className="flex flex-wrap gap-1.5">
                {EXAMPLES.map(([label, text]) => (
                  <button key={label} onClick={() => build(text)} disabled={building} className="rounded-full border border-fg/10 bg-fg/[0.03] px-3 py-1.5 text-[12.5px] text-bone-muted transition-colors hover:border-accent/50 hover:text-bone">
                    {label}
                  </button>
                ))}
              </div>
            </Spot>

            <Spot className={`flex flex-1 flex-col p-5 transition-opacity ${cfg ? '' : 'pointer-events-none opacity-50'}`}>
              <p className="eyebrow">2 · Edit with a prompt</p>
              <div ref={logRef} className="mt-3 max-h-[260px] min-h-[120px] flex-1 space-y-3 overflow-y-auto pr-1" data-lenis-prevent>
                {log.length === 0 && <p className="text-[13px] text-bone-dim">Build a site first — then ask for changes here.</p>}
                {log.map((m, i) => (
                  <div key={i} className="space-y-1.5">
                    <p className="ml-auto w-fit max-w-[90%] rounded-2xl rounded-br-sm px-3.5 py-2 text-[13px] text-white" style={grad}>
                      {m.you}
                    </p>
                    <p className="w-fit max-w-[90%] rounded-2xl rounded-bl-sm border border-fg/10 bg-fg/[0.04] px-3.5 py-2 text-[13px]">{m.bot}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {EDIT_IDEAS.map((x) => (
                  <button key={x} onClick={() => applyChange(x)} className="rounded-full border border-fg/10 px-2.5 py-1 text-[11.5px] text-bone-muted hover:border-accent/50 hover:text-bone">
                    {x}
                  </button>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  applyChange();
                }}
                className="mt-3 flex gap-2"
              >
                <input
                  value={edit}
                  onChange={(e) => setEdit(e.target.value)}
                  placeholder="e.g. make it green, add pricing…"
                  className="h-11 min-w-0 flex-1 rounded-full border border-fg/10 bg-fg/[0.04] px-4 text-[14px] outline-none focus:border-accent/60"
                  aria-label="Describe a change"
                />
                <button type="submit" className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-white" style={grad} aria-label="Apply change">
                  <Arrow />
                </button>
              </form>
            </Spot>
          </div>

          {/* ---------------- right: preview */}
          <div className="lg:col-span-8">
            <div className="overflow-hidden rounded-[22px] border border-fg/10 bg-ink-850 shadow-[0_40px_120px_-30px_rgba(167,139,250,0.45)]">
              <div className="flex flex-wrap items-center gap-2 border-b border-fg/10 bg-fg/[0.03] px-3 py-2.5">
                <span className="ml-1 h-3 w-3 rounded-full bg-[#ff5f57]" />
                <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                <div className="glass ml-2 inline-flex rounded-full p-0.5">
                  {Object.entries(DEVICES).map(([k, d]) => (
                    <button key={k} onClick={() => setDevice(k)} className={`rounded-full px-3 py-1 text-[12px] ${device === k ? 'text-white' : 'text-bone-muted'}`} style={device === k ? grad : undefined}>
                      {d.label}
                    </button>
                  ))}
                </div>
                <div className="ml-auto flex gap-1.5">
                  <button onClick={copy} disabled={!html} className="glass rounded-full px-3 py-1.5 text-[12px] text-bone-muted hover:text-bone disabled:opacity-40">
                    ⧉ Copy code
                  </button>
                  <button onClick={download} disabled={!html} className="glass rounded-full px-3 py-1.5 text-[12px] text-bone-muted hover:text-bone disabled:opacity-40">
                    ⬇ Download
                  </button>
                  <button onClick={openTab} disabled={!html} className="rounded-full px-3 py-1.5 text-[12px] font-semibold text-white disabled:opacity-40" style={grad}>
                    ↗ Open
                  </button>
                </div>
              </div>
              <Preview html={html} device={device} building={building} step={step} />
            </div>
            {cfg && <p className="mt-3 text-center font-mono text-[11.5px] text-bone-dim">{describe(cfg)} · {(html.length / 1024).toFixed(1)} KB · single HTML file</p>}
          </div>
        </div>

        <Reveal className="mt-20">
          <Spot className="relative overflow-hidden p-8 text-center md:p-12">
            <div className="pointer-events-none absolute -bottom-32 left-1/2 h-72 w-[600px] -translate-x-1/2 rounded-full opacity-40 blur-3xl" style={grad} />
            <h2 className="relative text-[clamp(1.8rem,4.5vw,3.25rem)] font-medium leading-tight tracking-tightest">
              Want the real thing, <span className="text-gradient font-serif font-normal italic">built just for you?</span>
            </h2>
            <p className="relative mx-auto mt-3 max-w-lg text-[15px] text-bone-muted">This builder makes a quick start. I build complete, custom products — designed, coded and launched end-to-end.</p>
            <div className="relative mt-7 flex flex-wrap justify-center gap-3">
              <a href="#contact" className="btn-primary !px-8 !py-4">
                Start a project <Arrow />
              </a>
              <a href="#work" className="btn-ghost !px-8 !py-4">
                See my work
              </a>
            </div>
          </Spot>
        </Reveal>
      </div>
    </main>
  );
}
