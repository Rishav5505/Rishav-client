import { services } from '../data';
import { Icon, Reveal, SectionHead, Spot } from './ui';
import { T, listHi, useLang } from '../i18n';

const icons = ['brain', 'layers', 'bolt', 'server', 'shield'];

export default function Services() {
  const { t, lang } = useLang();
  return (
    <section id="services" className="py-24 md:py-32">
      <div className="container-site">
        <SectionHead
          center
          index="04"
          label="Services"
          title={<T k="services.title" />}
          aside={t('services.aside')}
        />

        <div className="grid gap-4 md:grid-cols-6">
          {services.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.06} className={i < 2 ? 'md:col-span-3' : 'md:col-span-2'}>
              <Spot className="group flex h-full flex-col p-8">
                <div className="relative mb-10 h-14 w-14">
                  <div
                    className="absolute inset-0 rounded-2xl opacity-60 blur-xl transition-opacity duration-500 group-hover:opacity-100"
                    style={{ background: 'linear-gradient(135deg, var(--g1), var(--g2))' }}
                  />
                  <div
                    className="relative grid h-14 w-14 place-items-center rounded-2xl text-white"
                    style={{ background: 'linear-gradient(135deg, var(--g1), var(--g2) 60%, var(--g3))' }}
                  >
                    <Icon name={icons[i]} className="h-6 w-6" />
                  </div>
                </div>
                <h3 className="text-2xl font-medium tracking-tight">{lang === 'hi' ? listHi.services[i][0] : s.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-bone-muted">{lang === 'hi' ? listHi.services[i][1] : s.body}</p>
                <span className="mt-auto pt-8 font-mono text-xs text-bone-dim">0{i + 1}</span>
              </Spot>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
