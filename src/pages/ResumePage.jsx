import { useEffect } from 'react';
import portrait from '../assets/w_rishav_profile.webp';
import { profile, resumeData as R } from '../data';
import { Arrow, Download, Magnetic, Reveal } from '../components/ui';

function H({ children }) {
  return (
    <h2 className="mb-4 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-bone-muted print:text-neutral-500">
      <span className="h-px w-6" style={{ background: 'linear-gradient(90deg, var(--g1), var(--g2))' }} />
      {children}
    </h2>
  );
}

export default function ResumePage() {
  useEffect(() => {
    document.title = 'Résumé — Rishav Kumar';
  }, []);

  return (
    <main className="relative pb-24 pt-[104px] md:pt-[124px] print:p-0">
      <div className="container-site print:max-w-none print:p-0">
        {/* toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
          <a href="#/" className="link-underline text-[13px] text-bone-muted hover:text-bone">
            ← Back to portfolio
          </a>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => window.print()} className="btn-ghost !px-5 !py-2.5 text-[13px]">
              🖨️ Print
            </button>
            <Magnetic>
              <a href={profile.resume} download="Rishav_Kumar_Resume.pdf" className="btn-primary !px-5 !py-2.5 text-[13px]">
                <Download /> Download PDF
              </a>
            </Magnetic>
          </div>
        </div>

        <Reveal y={30} className="mt-8 print:mt-0">
          <article className="spot resume-sheet mx-auto max-w-4xl !bg-ink-850 p-7 sm:p-12 print:max-w-none print:rounded-none print:border-0 print:p-0">
            {/* header */}
            <header className="flex flex-col gap-6 border-b border-fg/10 pb-8 sm:flex-row sm:items-center">
              <img src={portrait} alt="" className="h-24 w-24 shrink-0 rounded-3xl object-cover object-top ring-2 ring-pink-400/40 print:h-20 print:w-20" />
              <div className="flex-1">
                <h1 className="text-4xl font-medium tracking-tightest sm:text-5xl">{profile.name}</h1>
                <p className="text-gradient mt-1 font-serif text-xl italic sm:text-2xl print:text-neutral-700">Full Stack Developer · AI & LLM Systems Engineer</p>
                <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-bone-muted">
                  <a href={`mailto:${profile.email}`} className="hover:text-bone">{profile.email}</a>
                  <a href={profile.phoneHref} className="hover:text-bone">{profile.phone}</a>
                  <span>{profile.location}</span>
                  <a href={profile.github} target="_blank" rel="noopener noreferrer" className="hover:text-bone">GitHub</a>
                  <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-bone">LinkedIn</a>
                </p>
              </div>
            </header>

            <section className="mt-8">
              <H>Professional summary</H>
              <p className="text-[15px] leading-relaxed text-bone-muted">{R.summary}</p>
            </section>

            <div className="mt-10 grid gap-10 md:grid-cols-12">
              {/* left: experience + projects */}
              <div className="md:col-span-8">
                <section>
                  <H>Experience</H>
                  <ol className="relative space-y-7 border-l border-fg/10 pl-6">
                    {R.roles.map((r, i) => (
                      <li key={r.role} className="relative break-inside-avoid">
                        <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full ring-4 ring-ink-850" style={{ background: i === 0 ? 'linear-gradient(135deg, var(--g1), var(--g2))' : 'rgb(var(--bone-dim))' }} />
                        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                          <h3 className="text-lg font-medium tracking-tight">{r.role}</h3>
                          <span className="font-mono text-[11px] text-bone-muted">{r.period}</span>
                        </div>
                        <p className="text-[13px] text-accent print:text-neutral-600">
                          {r.org} · <span className="text-bone-dim">{r.note}</span>
                        </p>
                        <ul className="mt-2 space-y-1.5">
                          {r.bullets.map((b) => (
                            <li key={b} className="flex gap-2 text-[14px] leading-relaxed text-bone-muted">
                              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-bone-dim" />
                              {b}
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ol>
                </section>

                <section className="mt-10">
                  <H>Projects</H>
                  <div className="space-y-5">
                    {R.projects.map((p) => (
                      <div key={p.name} className="break-inside-avoid">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                          <h3 className="text-[16px] font-medium">{p.name}</h3>
                          <span className="font-mono text-[11px] text-bone-muted">{p.period}</span>
                        </div>
                        <ul className="mt-1.5 space-y-1">
                          {p.bullets.map((b) => (
                            <li key={b} className="flex gap-2 text-[14px] leading-relaxed text-bone-muted">
                              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-bone-dim" />
                              {b}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* right: skills, education, extras */}
              <aside className="space-y-10 md:col-span-4">
                <section>
                  <H>Skills</H>
                  <dl className="space-y-3">
                    {R.skills.map(([k, v]) => (
                      <div key={k}>
                        <dt className="text-[13px] font-medium">{k}</dt>
                        <dd className="mt-1 flex flex-wrap gap-1">
                          {v.split(', ').map((s) => (
                            <span key={s} className="rounded-md border border-fg/10 bg-fg/[0.04] px-1.5 py-0.5 text-[11.5px] text-bone-muted">
                              {s}
                            </span>
                          ))}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
                <section>
                  <H>Education</H>
                  <div className="space-y-4">
                    {R.education.map((e) => (
                      <div key={e.name}>
                        <p className="text-[14px] font-medium leading-snug">{e.name}</p>
                        <p className="text-[13px] text-bone-muted">{e.place}</p>
                        <p className="font-mono text-[11px] text-bone-dim">
                          {e.period}
                          {e.note && ` · ${e.note}`}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
                <section>
                  <H>Achievements</H>
                  <ul className="space-y-2">
                    {R.achievements.map((a) => (
                      <li key={a} className="flex gap-2 text-[13.5px] leading-relaxed text-bone-muted">
                        <span>🏆</span>
                        {a}
                      </li>
                    ))}
                  </ul>
                </section>
                <section>
                  <H>Certifications</H>
                  <ul className="space-y-2">
                    {R.certifications.map(([n, by]) => (
                      <li key={n} className="text-[13.5px]">
                        <span className="font-medium">{n}</span> <span className="text-bone-muted">— {by}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </aside>
            </div>
          </article>
        </Reveal>

        <Reveal className="mt-10 flex flex-wrap justify-center gap-3 print:hidden">
          <a href="#contact" className="btn-primary !px-7 !py-4">
            Let’s work together <Arrow />
          </a>
          <a href="#work" className="btn-ghost !px-7 !py-4">
            See my projects
          </a>
        </Reveal>
      </div>
    </main>
  );
}
