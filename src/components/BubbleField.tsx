import { useCallback, useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";

/**
 * Bolhas de sabão que sobem, estouram e deixam respingo de tinta.
 *
 * Vive apenas no fechamento da página e **só existe enquanto está em
 * quadro**: um `IntersectionObserver` liga e desliga a produção, e ao sair
 * de cena todo o estado é descartado. Quem nunca chega ao fim da página
 * nunca paga por isto; quem passa por ele deixa de pagar assim que passa.
 *
 * Três mudanças de fundo em relação ao protótipo, todas por custo:
 *
 * 1. **Nada de `feTurbulence`/`feDisplacementMap`.** Era o que dava a
 *    silhueta irregular aos respingos, e é dos filtros mais caros do SVG —
 *    aplicado a até quatorze formas por respingo, numa caixa de ~560px,
 *    enquanto a peça inteira era escalada por animação. Aqui a
 *    irregularidade vem de um contorno gerado uma vez, em coordenadas: o
 *    desenho é equivalente e o navegador só preenche um caminho.
 *
 * 2. **Bamboleio em `transform`, não em `margin-left`.** Margem é layout;
 *    mudá-la a cada quadro obriga o navegador a remedir a página inteira.
 *
 * 3. **Sem sorteio durante o render.** O protótipo chamava `Math.random()`
 *    dentro do JSX, então cada re-render mudava a opacidade das gotas e o
 *    respingo tremia. Toda a aleatoriedade acontece na criação e vira
 *    dado.
 */

/* ─── Paleta ─────────────────────────────────────────────────────────── */
const PINKS = [
  "#ffb3c6",
  "#ffc2d4",
  "#ff8fab",
  "#ffd6e0",
  "#ffafc7",
  "#f4a7b9",
  "#ff85a1",
  "#ffccd5",
  "#ff6b9d",
  "#ffc8dd",
  "#ff9ebb",
  "#ffe4ec",
];

/** Bolhas simultâneas. Menos no toque, onde a GPU é mais modesta. */
const MAX_BUBBLES_FINE = 3;
const MAX_BUBBLES_COARSE = 2;

/** Distância horizontal mínima entre bolhas ativas, em % da largura. */
const MIN_GAP = 28;

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

let uid = 0;

/* ─── Tipos ──────────────────────────────────────────────────────────── */
interface BubbleD {
  id: number;
  /** Posição horizontal, em % da largura da seção. */
  x: number;
  size: number;
  /** Duração da subida, em segundos. */
  dur: number;
  color: string;
  /** Quando estoura, em ms desde o nascimento. */
  popAt: number;
}

interface SplatD {
  id: number;
  x: number;
  y: number;
  color: string;
  /** Lado da caixa do SVG. */
  box: number;
  main: string;
  drops: { d: string; opacity: number }[];
  drips: { x: number; y: number; w: number; h: number; delay: number }[];
}

interface RingD {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
}

/* ─── Geometria ──────────────────────────────────────────────────────── */

/**
 * Contorno fechado e irregular, no lugar do filtro de turbulência.
 *
 * Sorteia pontos ao redor de um círculo com raios desiguais e costura
 * curvas quadráticas pelos pontos médios — a passagem pelos médios é o que
 * fecha a forma sem bicos, dando o contorno molhado de tinta em vez de um
 * polígono.
 */
function blobPath(cx: number, cy: number, radius: number, wobble: number): string {
  const steps = 9;
  const points: Array<[number, number]> = [];

  for (let i = 0; i < steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    const r = radius * (1 - wobble + Math.random() * wobble * 2);
    points.push([cx + Math.cos(angle) * r, cy + Math.sin(angle) * r]);
  }

  const mid = (a: [number, number], b: [number, number]): [number, number] => [
    (a[0] + b[0]) / 2,
    (a[1] + b[1]) / 2,
  ];

  const start = mid(points[steps - 1], points[0]);
  let d = `M ${start[0].toFixed(1)} ${start[1].toFixed(1)}`;

  for (let i = 0; i < steps; i++) {
    const current = points[i];
    const next = points[(i + 1) % steps];
    const end = mid(current, next);
    d += ` Q ${current[0].toFixed(1)} ${current[1].toFixed(1)} ${end[0].toFixed(1)} ${end[1].toFixed(1)}`;
  }

  return `${d} Z`;
}

function makeSplat(id: number, x: number, y: number, color: string, bubbleSize: number): SplatD {
  const scale = bubbleSize / 60;
  const mainR = rnd(18, 32) * scale;

  const drops = Array.from({ length: 7 + Math.floor(Math.random() * 7) }, () => ({
    angle: Math.random() * Math.PI * 2,
    dist: rnd(22, 75) * scale,
    r: rnd(5, 18) * scale,
    opacity: 0.7 + Math.random() * 0.3,
  }));

  /* A caixa acompanha a gota que for mais longe, com uma folga curta. Sem
     filtro não há mais o acréscimo fixo de 80px que o protótipo precisava
     reservar para o borrão da turbulência. */
  const reach = drops.reduce((max, d) => Math.max(max, d.dist + d.r), mainR);
  const box = Math.ceil((reach + 12) * 2);
  const c = box / 2;

  const drips =
    Math.random() > 0.35
      ? Array.from({ length: 1 + Math.floor(Math.random() * 4) }, (_, i) => {
          const w = rnd(3, 8) * scale;
          return {
            x: c + rnd(-30, 30) * scale - w / 2,
            y: c + mainR * 0.6,
            w,
            h: rnd(18, 65) * scale,
            delay: 0.15 + i * 0.08,
          };
        })
      : [];

  return {
    id,
    x,
    y,
    color,
    box,
    main: blobPath(c, c, mainR, 0.34),
    drops: drops.map((d) => ({
      d: blobPath(c + Math.cos(d.angle) * d.dist, c + Math.sin(d.angle) * d.dist, d.r, 0.42),
      opacity: d.opacity,
    })),
    drips,
  };
}

/* ─── Peças ──────────────────────────────────────────────────────────── */

function BubbleSvg({ id, color, size }: { id: number; color: string; size: number }) {
  const gradient = `bubble-grad-${id}`;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="block">
      <defs>
        <radialGradient id={gradient} cx="36%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.06" />
          <stop offset="55%" stopColor={color} stopOpacity="0.1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.58" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="47" fill={`url(#${gradient})`} stroke={color} strokeWidth="1.6" />
      {/* Brilho principal e secundário — é o que lê como superfície de sabão */}
      <ellipse cx="33" cy="27" rx="15" ry="9" fill="white" opacity="0.72" transform="rotate(-30 33 27)" />
      <ellipse cx="63" cy="21" rx="6" ry="4" fill="white" opacity="0.48" transform="rotate(-18 63 21)" />
      {/* Reflexos iridescentes */}
      <ellipse cx="74" cy="70" rx="12" ry="7" fill="#e8d5ff" opacity="0.18" transform="rotate(22 74 70)" />
      <ellipse cx="26" cy="68" rx="8" ry="5" fill="#d0f0ff" opacity="0.14" />
    </svg>
  );
}

function Splat({ splat }: { splat: SplatD }) {
  const half = splat.box / 2;
  return (
    <svg
      width={splat.box}
      height={splat.box}
      viewBox={`0 0 ${splat.box} ${splat.box}`}
      className="pointer-events-none absolute overflow-visible"
      style={{
        left: splat.x - half,
        top: splat.y - half,
        animation: "bubble-splat 2.8s cubic-bezier(0.22,1,0.36,1) forwards",
      }}
    >
      <path d={splat.main} fill={splat.color} />
      {splat.drops.map((drop, i) => (
        <path key={i} d={drop.d} fill={splat.color} opacity={drop.opacity} />
      ))}
      {splat.drips.map((drip, i) => (
        <rect
          key={i}
          x={drip.x}
          y={drip.y}
          width={drip.w}
          height={drip.h}
          rx={drip.w / 2}
          fill={splat.color}
          opacity="0.85"
          style={{ animation: `bubble-drip 0.5s ease-in ${drip.delay}s both` }}
        />
      ))}
    </svg>
  );
}

function Bubble({
  data,
  rise,
  onPop,
}: {
  data: BubbleD;
  rise: number;
  onPop: (bubble: BubbleD, element: HTMLElement) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  /* O campo recria `onPop` a cada render; guardar em ref permite agendar o
     estouro uma única vez, na montagem, sem capturar uma versão velha. */
  const popRef = useRef(onPop);
  popRef.current = onPop;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const element = ref.current;
      if (!element) return;
      popRef.current(data, element);
      // Some no mesmo quadro em que o respingo nasce: sem isto a bolha
      // seguiria subindo por trás da tinta até o React removê-la.
      element.style.display = "none";
    }, data.popAt);

    return () => window.clearTimeout(timer);
  }, [data]);

  return (
    <div
      ref={ref}
      className="absolute"
      style={{
        left: `${data.x}%`,
        bottom: -data.size,
        width: data.size,
        height: data.size,
        // Lido pela keyframe `bubble-rise`.
        ["--rise" as string]: `${rise + data.size}px`,
        animation: `bubble-rise ${data.dur}s ease-in forwards`,
      }}
    >
      {/* O bamboleio mora num elemento próprio: subida e vaivém são dois
          `transform`, e no mesmo nó um apagaria o outro. */}
      <div style={{ animation: `bubble-wobble ${data.dur * 0.6}s ease-in-out infinite` }}>
        <BubbleSvg id={data.id} color={data.color} size={data.size} />
      </div>
    </div>
  );
}

/* ─── Campo ──────────────────────────────────────────────────────────── */

interface BubbleFieldProps {
  /** Elemento que delimita o campo — normalmente a própria seção. */
  containerRef: React.RefObject<HTMLElement | null>;
}

export function BubbleField({ containerRef }: BubbleFieldProps) {
  const reducedMotion = usePrefersReducedMotion();
  const fieldRef = useRef<HTMLDivElement>(null);

  const [live, setLive] = useState(false);
  const [bubbles, setBubbles] = useState<BubbleD[]>([]);
  const [splats, setSplats] = useState<SplatD[]>([]);
  const [rings, setRings] = useState<RingD[]>([]);
  const [rise, setRise] = useState(0);

  /** Temporizadores em aberto, para nenhum sobreviver ao desligamento. */
  const timers = useRef(new Set<number>());

  const after = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timers.current.delete(id);
      fn();
    }, ms);
    timers.current.add(id);
  }, []);

  /* Contagem corrente sem recriar o laço de produção a cada bolha. */
  const bubblesRef = useRef<BubbleD[]>([]);
  useEffect(() => {
    bubblesRef.current = bubbles;
  }, [bubbles]);

  const pop = useCallback(
    (bubble: BubbleD, element: HTMLElement) => {
      const field = fieldRef.current;
      if (!field) return;

      // Coordenadas relativas ao campo, e não à janela: o respingo é
      // `absolute` dentro dele e precisa da mesma referência.
      const box = element.getBoundingClientRect();
      const origin = field.getBoundingClientRect();
      const x = box.left + box.width / 2 - origin.left;
      const y = box.top + box.height / 2 - origin.top;

      const ringId = ++uid;
      setRings((r) => [...r, { id: ringId, x, y, size: bubble.size, color: bubble.color }]);
      after(() => setRings((r) => r.filter((item) => item.id !== ringId)), 500);

      const splatId = ++uid;
      setSplats((s) => [...s, makeSplat(splatId, x, y, bubble.color, bubble.size)]);
      after(() => setSplats((s) => s.filter((item) => item.id !== splatId)), 2900);

      // O protótipo procurava a bolha por proximidade horizontal e podia
      // remover a errada quando duas subiam perto. Aqui a identidade é o
      // próprio id.
      setBubbles((b) => b.filter((item) => item.id !== bubble.id));
    },
    [after],
  );

  /**
   * Liga e desliga conforme a seção entra e sai de quadro.
   *
   * `document.hidden` entra na mesma conta: numa aba em segundo plano o
   * navegador mantém as animações vivas e não há ninguém olhando.
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container || reducedMotion) return;

    let onScreen = false;
    const sync = () => setLive(onScreen && !document.hidden);

    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      // Começa um pouco antes de a seção encostar na tela, para a primeira
      // bolha já estar subindo quando ela aparece.
      { rootMargin: "10% 0px" },
    );

    observer.observe(container);
    document.addEventListener("visibilitychange", sync);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [containerRef, reducedMotion]);

  /**
   * Altura que a bolha percorre.
   *
   * Medida da seção, não da janela: é o que mantém o efeito preso ao
   * fechamento da página. Com `115vh`, como no protótipo, a bolha subiria
   * uma tela inteira e vazaria para fora da seção.
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const measure = () => setRise(container.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef]);

  /* Produção. Ao desligar, o encerramento zera temporizadores e estado —
     nada continua animando fora de quadro. */
  useEffect(() => {
    if (!live) return;

    const maxBubbles = window.matchMedia("(pointer: fine)").matches
      ? MAX_BUBBLES_FINE
      : MAX_BUBBLES_COARSE;

    const spawn = () => {
      const active = bubblesRef.current;
      if (active.length >= maxBubbles) return;

      let x = rnd(4, 93);
      for (let attempt = 0; attempt < 15; attempt++) {
        const candidate = rnd(4, 93);
        if (!active.some((b) => Math.abs(b.x - candidate) < MIN_GAP)) {
          x = candidate;
          break;
        }
      }

      const dur = rnd(6, 12);
      const bubble: BubbleD = {
        id: ++uid,
        x,
        size: Math.round(rnd(40, 85)),
        dur,
        color: pick(PINKS),
        // Estoura em qualquer ponto entre 20% e 90% do trajeto, para as
        // explosões se espalharem pela altura em vez de se alinharem.
        popAt: rnd(dur * 0.2, dur * 0.9) * 1000,
      };

      setBubbles((b) => [...b, bubble]);
      // Rede de segurança: se a bolha chegar ao topo sem estourar, sai de
      // cena mesmo assim.
      after(() => setBubbles((b) => b.filter((item) => item.id !== bubble.id)), dur * 1000 + 500);
    };

    after(spawn, 200);
    after(spawn, rnd(1200, 2200));

    const loop = () =>
      after(() => {
        spawn();
        loop();
      }, rnd(2000, 4500));
    loop();

    const pending = timers.current;
    return () => {
      for (const id of pending) window.clearTimeout(id);
      pending.clear();
      setBubbles([]);
      setSplats([]);
      setRings([]);
    };
  }, [live, after]);

  if (reducedMotion) return null;

  return (
    <div
      ref={fieldRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {splats.map((splat) => (
        <Splat key={splat.id} splat={splat} />
      ))}

      {rings.map((ring) => (
        <div
          key={ring.id}
          className="absolute rounded-full"
          style={{
            left: ring.x - ring.size / 2,
            top: ring.y - ring.size / 2,
            width: ring.size,
            height: ring.size,
            border: `3px solid ${ring.color}`,
            animation: "bubble-pop-ring 0.4s ease-out forwards",
          }}
        />
      ))}

      {bubbles.map((bubble) => (
        <Bubble key={bubble.id} data={bubble} rise={rise} onPop={pop} />
      ))}
    </div>
  );
}
