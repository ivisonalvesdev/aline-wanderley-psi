import { useEffect, useRef, useState } from "react";
import { gsap } from "@/utils/gsap";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { SITE } from "@/constants/site";
import { SignatureText } from "@/components/SignatureText";
import { typewriterTarget } from "@/utils/typewriter";
import logoAline from "@assets/img/logo-maior.webp";

interface PreloaderProps {
  onComplete: () => void;
}

/** Tempo mínimo em tela: abaixo disso o preloader lê como um piscar. */
const MIN_VISIBLE_MS = 1200;

/** Teto de espera — uma imagem travada não pode prender a página. */
const MAX_WAIT_MS = 6000;

/**
 * Cortina de entrada: assinatura da marca, contador até 100 e a saída.
 *
 * O contador não é decorativo — ele acompanha o carregamento de verdade:
 * sobe sozinho até 88% enquanto fontes e imagens chegam e só fecha os
 * últimos pontos quando `document.fonts.ready` e o `load` da janela
 * resolvem. A página só é liberada em 100.
 *
 * Duas salvaguardas evitam que isso vire uma armadilha: um teto de 6s
 * (se algum recurso travar, entra assim mesmo) e o desvio imediato para
 * quem usa `prefers-reduced-motion`.
 */
export function Preloader({ onComplete }: PreloaderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (reducedMotion) {
      setDone(true);
      onComplete();
      return;
    }

    const root = rootRef.current;
    if (!root) return;

    // Sem isto, dá para rolar a página inteira por trás da cortina.
    document.body.dataset.loading = "true";

    const startedAt = performance.now();
    const pieces = root.querySelectorAll<HTMLElement>("[data-preloader-fade]");
    const signature = root.querySelector<HTMLElement>("[data-signature]");
    const progress = { value: 0 };
    const tweens: gsap.core.Tween[] = [];
    const timers: number[] = [];

    // Fecha já, antes da entrada: sem isto o nome apareceria inteiro por
    // um quadro, antes de "digitar".
    if (signature) gsap.set(signature, { width: 0 });

    /* As promessas abaixo continuam vivas depois de um cleanup — e no
       StrictMode do desenvolvimento o efeito monta, desmonta e monta de
       novo. Sem esta trava, a cortina da primeira montagem subiria por
       cima da segunda. */
    let cancelled = false;

    const paint = () => {
      const value = Math.round(progress.value);
      // Zeros à esquerda + tabular-nums: a largura não dança a cada dígito.
      if (countRef.current) countRef.current.textContent = String(value).padStart(3, "0");
      if (barRef.current) gsap.set(barRef.current, { scaleX: value / 100 });
    };

    const intro = gsap.timeline();
    intro.fromTo(
      pieces,
      { autoAlpha: 0, y: 16 },
      { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.1 },
    );

    /*
      O nome "digita" logo depois de aparecer — não junto, porque o
      `fromTo` acima ainda está subindo e desfocando o traço fino da
      assinatura no mesmo instante em que ele tentaria ser lido letra a
      letra.

      A medida da largura espera `fonts.ready`, e por isso fica fora do
      `intro`: em acesso frio, sem a fonte em cache, ela ainda não tinha
      chegado quando este efeito rodava — a largura saía medida na fonte
      de fallback (métrica bem diferente da Dancing Script), e quando a
      fonte certa entrava por cima via `font-display: swap`, o texto não
      preenchia mais a caixa que fora animada para o tamanho errado. Lia
      como a assinatura "torta"/deslocada, só no primeiro carregamento —
      exatamente porque só ali a fonte não estava em cache. Em recarregar
      a fonte já chegava a tempo, e por isso o defeito sumia.
    */
    let signatureTween: gsap.core.Tween | undefined;
    if (signature) {
      document.fonts.ready.then(() => {
        if (cancelled || !signature.isConnected) return;
        const { width, ease } = typewriterTarget(signature, SITE.name.length);
        signatureTween = gsap.fromTo(signature, { width: 0 }, { width, ease, duration: 0.7, delay: 0.2 });
      });
    }

    /* Avanço otimista. Desacelera de propósito perto do fim: o salto para
       100 tem que vir do carregamento real, não do relógio. */
    const crawl = gsap.to(progress, {
      value: 88,
      duration: 2.2,
      ease: "power2.out",
      onUpdate: paint,
    });
    tweens.push(crawl);

    const leave = () => {
      const exit = gsap.timeline({
        onComplete: () => {
          delete document.body.dataset.loading;
          setDone(true);
        },
      });

      exit
        .to(pieces, {
          autoAlpha: 0,
          y: -14,
          duration: 0.45,
          ease: "power2.in",
          stagger: 0.07,
        })
        // A cortina sobe e revela o hero, que começa a própria intro no
        // mesmo instante (`onStart`) — os dois movimentos se cruzam em vez
        // de acontecer em sequência, que é o que faria a espera parecer longa.
        .to(
          root,
          {
            yPercent: -100,
            duration: 1.1,
            ease: "expo.inOut",
            onStart: onComplete,
          },
          "-=0.15",
        );
    };

    const finish = () => {
      crawl.kill();
      const closing = gsap.to(progress, {
        value: 100,
        duration: 0.6,
        ease: "power2.inOut",
        onUpdate: paint,
        onComplete: leave,
      });
      tweens.push(closing);
    };

    const windowLoaded =
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            window.addEventListener("load", () => resolve(), { once: true });
          });

    const ceiling = new Promise<void>((resolve) => {
      timers.push(window.setTimeout(resolve, MAX_WAIT_MS));
    });

    Promise.race([
      Promise.all([document.fonts.ready, windowLoaded]).then(() => undefined),
      ceiling,
    ]).then(() => {
      if (cancelled || !root.isConnected) return;
      const remaining = Math.max(0, MIN_VISIBLE_MS - (performance.now() - startedAt));
      timers.push(window.setTimeout(finish, remaining));
    });

    return () => {
      cancelled = true;
      intro.kill();
      signatureTween?.kill();
      tweens.forEach((tween) => tween.kill());
      timers.forEach((timer) => window.clearTimeout(timer));
      delete document.body.dataset.loading;
    };
  }, [reducedMotion, onComplete]);

  if (done) return null;

  return (
    <div
      ref={rootRef}
      role="status"
      aria-label="Carregando o site"
      className="fixed inset-0 z-100 flex flex-col items-center justify-center gap-7 bg-white"
    >
      {/*
        Ladrilho da logo cobrindo a cortina inteira.

        O PNG da marca já tem margem transparente própria, então repetir o
        arquivo cru: o espaçamento entre uma logo e outra sai do próprio
        desenho, sem precisar de moldura.

        Fica fora do `data-preloader-fade` de propósito. Aquela animação
        leva `autoAlpha` até 1, e a graça aqui é justamente a opacidade
        baixíssima — entrar no grupo apagaria o efeito ao acender a marca
        d'água em cima do conteúdo.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage: `url(${logoAline})`,
          backgroundSize: "150px auto",
          backgroundRepeat: "repeat",
        }}
      />

      <div className="relative flex flex-col items-center gap-3">
        {/* A assinatura é a identidade da marca — o lugar certo para ela é
            este: uma aparição só, em corpo grande, antes do site, digitada
            como se estivesse sendo assinada na hora. */}
        <p
          data-preloader-fade
          className="font-signature text-5xl leading-none text-blush-500 opacity-0 sm:text-6xl"
        >
          <SignatureText data-signature />
        </p>
        <p data-preloader-fade className="eyebrow text-ink-500 opacity-0">
          {SITE.role} · {SITE.crp}
        </p>
      </div>

      <div data-preloader-fade className="relative flex w-44 flex-col gap-2.5 opacity-0 sm:w-56">
        <div className="h-px w-full overflow-hidden bg-mist-200">
          <div
            ref={barRef}
            className="h-full w-full origin-left scale-x-0 bg-gradient-to-r from-blush-300 to-blush-500"
          />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="eyebrow text-[9px] text-ink-500/70">Carregando</span>
          <span
            ref={countRef}
            aria-hidden="true"
            className="tabular font-alt text-[10px] font-medium tracking-[0.16em] text-ink-500"
          >
            000
          </span>
        </div>
      </div>
    </div>
  );
}
