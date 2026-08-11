import { useEffect, useRef } from "react";
import {
  Color,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
} from "three";

/**
 * Aura orgânica em WebGL — um único plano com fragment shader.
 *
 * Custo de GPU mínimo: sem geometria complexa, sem luzes, sem texturas.
 * O visitante quase não percebe, mas o fundo "respira" suavemente.
 *
 * - DPR limitado a 1.5
 * - Pausa quando a aba está oculta ou o elemento sai do viewport
 * - Contexto descartado no unmount
 */

const vertexShader = /* glsl */ `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision mediump float;

  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec3 uBlush;
  uniform vec3 uCloud;
  uniform vec3 uBase;

  // Blob radial suave em movimento lento
  float blob(vec2 uv, vec2 center, float radius) {
    float d = distance(uv, center);
    return smoothstep(radius, 0.0, d);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    float aspect = uResolution.x / uResolution.y;
    vec2 p = vec2(uv.x * aspect, uv.y);
    float t = uTime * 0.06;

    vec2 c1 = vec2(0.72 * aspect + sin(t * 0.9) * 0.14, 0.68 + cos(t * 0.7) * 0.10);
    vec2 c2 = vec2(0.30 * aspect + cos(t * 0.6) * 0.12, 0.30 + sin(t * 0.8) * 0.12);
    vec2 c3 = vec2(0.55 * aspect + sin(t * 0.5 + 2.1) * 0.16, 0.85 + cos(t * 0.4 + 1.3) * 0.08);

    float b1 = blob(p, c1, 0.55);
    float b2 = blob(p, c2, 0.50);
    float b3 = blob(p, c3, 0.42);

    vec3 color = uBase;
    color = mix(color, uBlush, b1 * 0.55);
    color = mix(color, uCloud, b2 * 0.50);
    color = mix(color, uBlush, b3 * 0.30);

    // Grain sutil evita banding nos gradientes
    float grain = fract(sin(dot(uv * uResolution.xy, vec2(12.9898, 78.233))) * 43758.5453);
    color += (grain - 0.5) * 0.012;

    gl_FragColor = vec4(color, 1.0);
  }
`;

export default function AuraScene() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ antialias: false, alpha: false, powerPreference: "low-power" });
    } catch {
      return; // WebGL indisponível — o gradiente CSS por trás assume
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    const scene = new Scene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new Vector2(1, 1) },
        uBlush: { value: new Color("#f3dbe4") },
        uCloud: { value: new Color("#dcebf6") },
        uBase: { value: new Color("#fdfbfc") },
      },
    });
    scene.add(new Mesh(new PlaneGeometry(2, 2), material));

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = host;
      renderer.setSize(w, h, false);
      material.uniforms.uResolution.value.set(
        w * renderer.getPixelRatio(),
        h * renderer.getPixelRatio(),
      );
    };
    resize();
    host.appendChild(renderer.domElement);

    let raf = 0;
    let inView = true;
    const start = performance.now();

    const loop = () => {
      material.uniforms.uTime.value = (performance.now() - start) / 1000;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };

    const play = () => {
      if (!raf && inView && !document.hidden) raf = requestAnimationFrame(loop);
    };
    const pause = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const io = new IntersectionObserver(([entry]) => {
      inView = entry?.isIntersecting ?? false;
      inView ? play() : pause();
    });
    io.observe(host);

    const onVisibility = () => (document.hidden ? pause() : play());
    document.addEventListener("visibilitychange", onVisibility);

    const ro = new ResizeObserver(resize);
    ro.observe(host);

    play();

    return () => {
      pause();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden [&>canvas]:size-full [&>canvas]:object-cover"
    />
  );
}
