import { Suspense, lazy, useEffect, useState } from 'react';
import { MotionConfig, motion, useScroll, useSpring } from 'framer-motion';
import Nav from './components/Nav';
import Hero from './components/Hero';
import About from './components/About';
import { Backdrop, Intro } from './components/Backdrop';
import Work from './components/Work';
import Services from './components/Services';
import Experience from './components/Experience';
import Credentials from './components/Credentials';
import Contact from './components/Contact';
import Universe from './components/Universe';
import Showcase from './components/Showcase';
import Terminal from './components/Terminal';
import ChatBot from './components/ChatBot';
import { BackToTop, CommandPalette, Cursor, ShareModal, Shortcuts, SmoothScroll, Toaster, UISounds } from './components/Extras';
import Process from './components/Process';
import Games from './components/Games';
import { BookCall, InstallApp, Testimonials, WhatsAppButton } from './components/Engage';

const GamesPage = lazy(() => import('./pages/GamesPage'));
const CaseStudy = lazy(() => import('./pages/CaseStudy'));
const ResumePage = lazy(() => import('./pages/ResumePage'));
const LabPage = lazy(() => import('./pages/LabPage'));
const PAGES = { games: GamesPage, work: CaseStudy, resume: ResumePage, lab: LabPage };
const TITLES = { games: 'The Arcade — 25 mini-games | Rishav Kumar', resume: 'Résumé — Rishav Kumar', lab: 'AI Lab — Rishav Kumar' };
// '#/games', '#/work/<id>', '#/resume', '#/lab' are pages; everything else is the home page.
const getRoute = () => {
  const m = window.location.hash.match(/^#\/(\w+)/);
  return m && PAGES[m[1]] ? m[1] : 'home';
};
const HOME_TITLE = document.title;

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  return <motion.div aria-hidden="true" style={{ scaleX, background: 'linear-gradient(90deg, var(--g1), var(--g2), var(--g3))' }} className="fixed inset-x-0 top-0 z-[55] h-[2px] origin-left" />;
}

/** Swap the tab title for a friendly nudge while the visitor is on another tab. */
function TabTitle() {
  useEffect(() => {
    const msgs = ['👋 Come back — the code misses you!', '✨ Still here when you are ready', '💌 Let’s build something lovely'];
    let i = 0;
    let saved = null;
    const on = () => {
      if (document.hidden) {
        saved = document.title;
        document.title = msgs[i++ % msgs.length];
      } else if (saved) document.title = saved;
    };
    document.addEventListener('visibilitychange', on);
    return () => document.removeEventListener('visibilitychange', on);
  }, []);
  return null;
}

export default function App() {
  const [route, setRoute] = useState(getRoute);

  useEffect(() => {
    const on = () => {
      const next = getRoute();
      setRoute((prev) => {
        // Entering or leaving the games page starts at the top.
        // Any page change (incl. one case study to the next) starts at the top.
        if (prev !== next || (next !== 'home' && next !== 'games') || window.location.hash === '#/') {
          window.__lenis ? (window.__lenis.resize(), window.__lenis.scrollTo(0, { immediate: true, force: true })) : window.scrollTo(0, 0);
        }
        return next;
      });
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);

  useEffect(() => {
    if (route !== 'work') document.title = TITLES[route] || HOME_TITLE;
  }, [route]);

  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll />
      <Cursor />
      <CommandPalette />
      <Toaster />
      <BackToTop />
      <ChatBot />
      <UISounds />
      <WhatsAppButton />
      <BookCall />
      <InstallApp />
      <TabTitle />
      <ShareModal />
      <Shortcuts />
      <Intro />
      <Backdrop />
      <ScrollProgress />
      <Nav route={route} />
      {route !== 'home' ? (
        <Suspense fallback={<div className="grid min-h-screen place-items-center text-bone-muted">Loading… ✨</div>}>
          {(() => {
            const Page = PAGES[route];
            return <Page />;
          })()}
        </Suspense>
      ) : (
      <main>
        <Hero />
        <About />
        <Work />
        <Showcase />
        <Services />
        <Process />
        <Universe />
        <Terminal />
        <Experience />
        <Credentials />
        <Games />
        <Testimonials />
        <Contact />
      </main>
      )}
    </MotionConfig>
  );
}
