import { Component, Suspense, lazy, useEffect, useRef, useState } from 'react';

export const HeroScene = lazy(() => import('./HeroScene'));
export const SkillsScene = lazy(() => import('./SkillsScene'));
export const LaptopScene = lazy(() => import('./LaptopScene'));

const hasWebGL = () => {
  try {
    const c = document.createElement('canvas');
    // Skip 3D on software-rendered / very weak GPUs so the page never stutters.
    const opts = { failIfMajorPerformanceCaveat: true };
    const gl = window.WebGLRenderingContext && (c.getContext('webgl2', opts) || c.getContext('webgl', opts));
    if (!gl) return false;
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : '';
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return !/swiftshader|llvmpipe|software|basic render/i.test(renderer);
  } catch {
    return false;
  }
};

class Boundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback ?? null : this.props.children;
  }
}

/**
 * Mounts a 3D scene only once it nears the viewport, pauses rendering when it
 * scrolls away, and degrades silently if WebGL is unavailable.
 */
export default function Lazy3D({ scene: Scene, className = '', fallback = null, ...props }) {
  const ref = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const [ok] = useState(hasWebGL);

  useEffect(() => {
    const el = ref.current;
    if (!el || !ok) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setActive(e.isIntersecting);
        if (e.isIntersecting) setMounted(true);
      },
      { rootMargin: '200px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ok]);

  return (
    <div ref={ref} className={className}>
      {ok && mounted ? (
        <Boundary fallback={fallback}>
          <Suspense fallback={fallback}>
            <Scene active={active} {...props} />
          </Suspense>
        </Boundary>
      ) : (
        fallback
      )}
    </div>
  );
}
