import { useEffect, useRef } from 'react';

/**
 * The name drawn in thousands of particles. They fly in when the section
 * scrolls into view, scatter away from the cursor / finger and spring home.
 * Plain 2D canvas — light enough for phones.
 */
export default function ParticleName({ text = 'Rishav Kumar' }) {
  const wrap = useRef(null);
  const canvas = useRef(null);

  useEffect(() => {
    const el = wrap.current;
    const cv = canvas.current;
    const ctx = cv.getContext('2d');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let parts = [];
    let raf = 0;
    let visible = false;
    let W = 0;
    let H = 0;
    const mouse = { x: -9999, y: -9999 };
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const colors = () => {
      const cs = getComputedStyle(document.documentElement);
      return ['--g1', '--g2', '--g3'].map((v) => cs.getPropertyValue(v).trim() || '#f472b6');
    };

    const build = () => {
      W = el.clientWidth;
      H = W < 640 ? Math.round(W * 0.26) : W < 1024 ? 220 : 280;
      cv.width = W * dpr;
      cv.height = H * dpr;
      cv.style.width = `${W}px`;
      cv.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Rasterise the text off-screen, then sample its pixels.
      const off = document.createElement('canvas');
      off.width = W;
      off.height = H;
      const o = off.getContext('2d');
      let size = H * 0.78;
      o.font = `600 ${size}px Geist, Inter, system-ui, sans-serif`;
      const measured = o.measureText(text).width;
      if (measured > W * 0.94) size *= (W * 0.94) / measured;
      o.font = `600 ${size}px Geist, Inter, system-ui, sans-serif`;
      o.textAlign = 'center';
      o.textBaseline = 'middle';
      o.fillStyle = '#fff';
      o.fillText(text, W / 2, H / 2);
      const data = o.getImageData(0, 0, W, H).data;
      const gap = W < 640 ? 3 : 4;
      const [c1, c2, c3] = colors();
      parts = [];
      for (let y = 0; y < H; y += gap) {
        for (let x = 0; x < W; x += gap) {
          if (data[(y * W + x) * 4 + 3] > 128) {
            const t = x / W;
            parts.push({
              hx: x,
              hy: y,
              x: reduced ? x : Math.random() * W,
              y: reduced ? y : H + Math.random() * H,
              vx: 0,
              vy: 0,
              c: t < 0.5 ? c1 : t < 0.8 ? c2 : c3,
              r: gap * 0.42 + Math.random() * 0.5,
            });
          }
        }
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const R = W < 640 ? 50 : 90;
      for (const p of parts) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < R * R) {
          const d = Math.sqrt(d2) || 1;
          const f = (R - d) / R;
          p.vx += (dx / d) * f * 6;
          p.vy += (dy / d) * f * 6;
        }
        p.vx += (p.hx - p.x) * 0.045;
        p.vy += (p.hy - p.y) * 0.045;
        p.vx *= 0.84;
        p.vy *= 0.84;
        p.x += p.vx;
        p.y += p.vy;
        ctx.fillStyle = p.c;
        ctx.fillRect(p.x, p.y, p.r, p.r);
      }
    };

    const loop = () => {
      draw();
      if (visible) raf = requestAnimationFrame(loop);
    };

    build();
    if (reduced) draw();

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting && !reduced;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(loop);
    });
    io.observe(el);

    const pos = (e) => {
      const r = cv.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const leave = () => {
      mouse.x = mouse.y = -9999;
    };
    cv.addEventListener('pointermove', pos);
    cv.addEventListener('pointerdown', pos);
    cv.addEventListener('pointerleave', leave);
    cv.addEventListener('pointerup', (e) => e.pointerType !== 'mouse' && leave());

    // Rebuild on resize, font load and theme change (colours differ per theme).
    let t;
    const rebuild = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        build();
        if (reduced) draw();
      }, 150);
    };
    const ro = new ResizeObserver(rebuild);
    ro.observe(el);
    document.fonts?.ready.then(rebuild);
    window.addEventListener('app:theme', rebuild);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      clearTimeout(t);
      window.removeEventListener('app:theme', rebuild);
    };
  }, [text]);

  return (
    <div ref={wrap} className="relative mt-24 select-none" aria-hidden="true">
      <canvas ref={canvas} className="block w-full touch-pan-y" data-cursor="Play" />
      <p className="mt-2 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-bone-dim">hover or touch my name ✦</p>
    </div>
  );
}
