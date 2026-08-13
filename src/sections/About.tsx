import { useLayoutEffect, useRef } from "react";
import { ABOUT } from "@/constants/content";
import { SITE } from "@/constants/site";
import { useReveal } from "@/hooks/useReveal";
import { useMagnetic } from "@/hooks/useMagnetic";
import { gsap, ScrollTrigger, SplitText, MOTION_OK, SCRUB } from "@/utils/gsap";
import { rich } from "@/utils/rich";
import { cn } from "@/utils/cn";
import aboutImage from "@assets/aline-sobre.webp";
import aboutImageAlt from "@assets/sobre-2.webp";
import lego1 from "@assets/lego-1.webp";
import lego2 from "@assets/lego-2.webp";

interface LegoProps {
  src: string;
  /** Inclinação estática, em classe do Tailwind (`rotate-6`, `-rotate-6`). */
  tilt: string;
  className?: string;
  strength?: number;
}

/**
 * Peça de montar decorativa com atração pelo cursor.
 *
 * A inclinação fica no `<img>` e o magnetismo no wrapper de propósito: o
 * GSAP escreve `transform` inline no elemento que anima, o que apagaria
 * um `rotate-*` de classe aplicado no mesmo nó.
 */
function MagneticLego({ src, tilt, className, strength = 0.32 }: LegoProps) {
  const magnetRef = useMagnetic<HTMLDivElement>({ strength, reach: 180, tilt: 7 });

  return (
    <div ref={magnetRef} className={className}>
      <img
        src={src}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className={cn("w-full drop-shadow-[0_10px_24px_rgb(48_42_44_/_0.18)]", tilt)}
      />
    </div>
  );
}

export function About() {
  const ref = useReveal<HTMLElement>();
  const figureRef = useRef<HTMLElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();

    /**
     * Troca de retrato conduzida pelo scroll.
     *
     * A montagem do crossfade é a mesma nos dois casos abaixo; o que muda
     * é o percurso em que ela acontece. O `scale` mínimo de cada foto
     * existe para o cruzamento não parecer um corte: uma recua enquanto a
     * outra se assenta.
     */
    /**
     * Onde a seção trava para a troca de retrato.
     *
     * Vive fora do `buildSwap` porque a assinatura precisa do mesmo ponto:
     * ela é escrita enquanto a foto está trocando, e para isso os dois
     * gatilhos têm de concordar sobre onde esse instante começa.
     */
    const swapStart = () => {
      const section = ref.current;
      return section && section.offsetHeight > window.innerHeight * 0.96
        ? "bottom bottom"
        : "center center";
    };

    const buildSwap = (scrollTrigger: gsap.TimelineVars["scrollTrigger"]) => {
      const figure = figureRef.current;
      const first = figure?.querySelector<HTMLElement>("[data-photo='first']");
      const second = figure?.querySelector<HTMLElement>("[data-photo='second']");
      if (!figure || !first || !second) return;

      /*
        As duas fotos sobem para camada própria da GPU antes do cruzamento
        e voltam ao normal depois.

        Sem isto, cada quadro do crossfade obriga o navegador a repintar a
        área inteira da figura — duas imagens de 1080×1350 com opacidade e
        escala mudando ao mesmo tempo, dentro de uma seção presa. Era o que
        se sentia como travadinha no momento exato da troca. Declarar o
        `will-change` antes permite promover a camada uma vez, com folga,
        em vez de no primeiro quadro da animação.

        A limpeza no fim importa tanto quanto: `will-change` permanente
        segura as duas imagens em memória de vídeo pelo resto da visita.
      */
      const layerUp = () => gsap.set([first, second], { willChange: "opacity, transform" });
      const layerDown = () => gsap.set([first, second], { willChange: "auto" });

      const tl = gsap.timeline({
        scrollTrigger: {
          ...(scrollTrigger as ScrollTrigger.Vars),
          onEnter: layerUp,
          onEnterBack: layerUp,
          onLeave: layerDown,
          onLeaveBack: layerDown,
        },
      });

      // Os respiros de 0.12 no começo e no fim são o que dá tempo de ver o
      // que aconteceu: a seção trava, segura um instante, troca, segura de
      // novo e só então libera a página.
      tl.to({}, { duration: 0.12 })
        .fromTo(
          second,
          { autoAlpha: 0, scale: 1.07 },
          { autoAlpha: 1, scale: 1, duration: 0.76, ease: "power1.inOut" },
          ">",
        )
        .fromTo(
          first,
          { autoAlpha: 1 },
          { autoAlpha: 0, scale: 1.03, duration: 0.76, ease: "power1.inOut" },
          "<",
        )
        .to({}, { duration: 0.12 });
    };

    /**
     * A seção trava em qualquer tela — a troca precisa acontecer à vista.
     *
     * Sem o pin, quem rola em ritmo normal já passou da foto quando o
     * crossfade começa. Com ele, a página segura por pouco menos de uma
     * tela de rolagem: a seção para, a foto troca, e a rolagem retoma.
     *
     * O ponto de travamento é decidido na hora, pela medida real:
     *
     * - Se a seção cabe na tela, ela para centralizada.
     * - Se não cabe (mobile e notebooks baixos, onde texto e foto ficam
     *   empilhados), o travamento alinha o **fim** da seção ao fim da
     *   tela. É o que garante a foto em quadro durante a pausa — no
     *   empilhamento ela é o último elemento. Centralizar aqui deixaria
     *   justamente a foto para fora, que era o defeito relatado.
     */
    mm.add(MOTION_OK, () => {
      buildSwap({
        trigger: ref.current,
        start: swapStart,
        // Pausa mais curta no celular: a mesma distância de rolagem custa
        // muito mais gestos com o dedo do que com a roda do mouse.
        end: () => `+=${window.innerHeight * (window.innerWidth < 640 ? 0.7 : 0.9)}`,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        scrub: 1,
        /*
          `invalidateOnRefresh` foi retirado de propósito.

          Ele manda o GSAP reler os valores de origem de cada tween a cada
          recálculo — e recálculo acontece quando qualquer pin da página
          entra ou sai, inclusive o da seção Formação. Aqui os valores são
          fixos (`autoAlpha` e `scale` escritos à mão), então essa releitura
          não corrigia nada e ainda punha trabalho extra justamente no
          quadro em que a seção trava. Era parte da travadinha na troca.
        */
        // Um pin altera a posição de tudo o que vem abaixo dele. A
        // prioridade maior faz o GSAP recalcular este gatilho antes dos
        // demais, para que as outras seções sejam medidas já com o espaço
        // extra do pin no lugar.
        refreshPriority: 1,
      });
    });

    /**
     * Traço de escrita nos textos.
     *
     * Cada linha é revelada da esquerda para a direita por um `clip-path`
     * que abre, como tinta saindo da caneta. É a leitura de "escrevendo"
     * que funciona com fonte de texto: uma máquina de escrever, letra a
     * letra, atrasaria a leitura de três parágrafos, e o traço real de
     * caligrafia exigiria SVG com contorno — nenhum dos dois se aplica a
     * texto corrido que precisa ser lido.
     *
     * A escrita roda no **próprio tempo**, disparada uma vez ao entrar na
     * tela — deliberadamente sem `scrub`. Amarrada à rolagem, a mão que
     * escrevia era a da pessoa: parava quando ela parava e voltava atrás
     * quando ela subia, que é justamente o que desfazia a ilusão.
     *
     * O `SplitText` só corta as linhas depois de `fonts.ready`: enquanto a
     * Poppins não chegou, o texto está na fonte de fallback, com métrica
     * diferente, e as quebras medidas ali seriam as erradas.
     */
    mm.add(
      {
        /* `lg` é onde o layout passa a ter foto e texto lado a lado — e
           é só aí que faz sentido amarrar a assinatura à troca do
           retrato, porque só aí os dois estão em quadro ao mesmo tempo. */
        sideBySide: "(width >= 64rem) and (prefers-reduced-motion: no-preference)",
        stacked: "(width < 64rem) and (prefers-reduced-motion: no-preference)",
      },
      (ctx) => {
        const sideBySide = Boolean(ctx.conditions?.sideBySide);
        const section = ref.current;
        if (!section) return;

        const texts = section.querySelectorAll<HTMLElement>("[data-handwrite]");
        const signature = section.querySelector<HTMLElement>("[data-handwrite-signature]");
        const closed = [...texts, ...(signature ? [signature] : [])];

        const splits: SplitText[] = [];
        const triggers: ScrollTrigger[] = [];

        /* Fecha tudo já, antes de qualquer medida: sem isto o texto
           apareceria escrito durante a espera pelas fontes e só então
           sumiria para ser escrito de novo. */
        gsap.set(closed, { clipPath: "inset(-30% 100% -30% 0)" });

        /** Corta o elemento em linhas e devolve os alvos da animação. */
        const linesOf = (el: HTMLElement) => {
          const split = SplitText.create(el, { type: "lines" });
          splits.push(split);
          return split.lines;
        };

        /*
          As folgas verticais negativas evitam que o recorte decepe o que
          passa da caixa da linha: acentos no topo, caudas de "g" e "p"
          embaixo e, na assinatura, as hastes altas da Halimun. Só o eixo
          horizontal é recortado — é ele que desenha o traço.
        */
        const CLOSED = { clipPath: "inset(-30% 100% -30% 0)" };
        const OPEN = { clipPath: "inset(-30% 0% -30% 0)" };

        const write = () => {
          /*
            O corpo do texto é escrito pela rolagem.

            A caneta anda enquanto a pessoa desce e recua se ela sobe —
            comportamento do `useReveal` do resto do site, e o que mantém
            a seção coerente com as demais.
          */
          for (const el of texts) {
            gsap.fromTo(linesOf(el), CLOSED, {
              ...OPEN,
              ease: "none",
              /*
                `stagger` maior que `duration` é o que faz a escrita ser
                lida como linha a linha: cada linha termina antes de a
                seguinte começar. Com os dois próximos elas se sobrepõem e
                o bloco parece surgir de uma vez, que era o efeito
                anterior.
              */
              duration: 0.6,
              stagger: 0.85,
              /*
                A janela começa assim que o bloco aparece e fecha bem antes
                de ele chegar ao meio da tela.

                Terminava em 40%, e o bloco de texto é alto: as últimas
                linhas só completavam quando o parágrafo já estava subindo,
                e num percurso curto — a seção trava logo adiante para a
                troca do retrato — a escrita ficava pela metade. Fechar em
                62% dá à última linha a mesma folga que a primeira tem.
              */
              scrollTrigger: {
                trigger: el,
                start: "top 95%",
                end: "top 62%",
                scrub: SCRUB,
              },
            });
          }

          /*
            A assinatura também é preenchida pela rolagem, como o corpo do
            texto — a diferença é onde ela começa.

            Lado a lado, o percurso é o da própria seção presa: a mão
            assina no mesmo trecho em que o retrato troca. Empilhado, esse
            trecho não serve, porque quando a foto troca a assinatura já
            subiu para fora da tela; ali ela volta a ser percorrida pela
            própria entrada em cena.
          */
          if (signature) {
            gsap.fromTo(linesOf(signature), CLOSED, {
              ...OPEN,
              ease: "none",
              scrollTrigger: sideBySide
                ? {
                    trigger: section,
                    start: swapStart,
                    /*
                      Menos da metade do trecho preso: a seção fica travada
                      por ~0,9 tela, e gastar tudo isso na assinatura a
                      deixaria terminando junto com a liberação do pin. Em
                      0,4 ela fecha com o retrato ainda trocando.
                    */
                    end: () => `+=${window.innerHeight * 0.4}`,
                    scrub: SCRUB,
                  }
                : {
                    trigger: signature,
                    start: "top 92%",
                    end: "top 66%",
                    scrub: SCRUB,
                  },
            });
          }

          /* Só agora os pais são liberados: as linhas já nasceram fechadas
             pelos `fromTo` acima, então a troca acontece sem um quadro
             exposto. */
          gsap.set(closed, { clipPath: "none" });
        };

        document.fonts.ready.then(() => {
          if (section.isConnected) write();
        });

        return () => {
          for (const trigger of triggers) trigger.kill();
          for (const split of splits) split.revert();
        };
      },
    );

    /* Respiração do selo: um vaivém de poucos pixels, lento o bastante
       para ser percebido como flutuação e não como tremor. */
    mm.add(MOTION_OK, () => {
      if (!badgeRef.current) return;
      gsap.to(badgeRef.current, {
        x: 7,
        y: -4,
        rotation: -0.9,
        duration: 3.8,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    });

    return () => mm.revert();
  }, [ref]);

  return (
    <section
      ref={ref}
      id="sobre"
      aria-labelledby="sobre-titulo"
      className="section-y surface-soft relative overflow-hidden"
    >
      {/*
        Peças de montar na margem direita da seção — a partir de lg, que é
        quando o texto ganha coluna própria à direita e sobra o respiro do
        container para elas ocuparem. Abaixo desse ponto o texto usa a
        largura inteira e as peças voltam para junto da foto (mais adiante).

        O parallax fica no wrapper externo e o magnetismo no interno:
        os dois escrevem `transform`, e no mesmo elemento um zeraria o outro.
        Intensidades opostas (0.5 / -0.5) fazem as duas se afastarem e se
        reaproximarem ao longo da passagem da seção pela tela.
      */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block">
        <div
          data-parallax="0.34"
          className="absolute top-[12%] right-3 w-24 xl:right-8 xl:w-28 2xl:right-12 2xl:w-32"
        >
          <MagneticLego src={lego2} tilt="rotate-6" strength={0.34} />
        </div>
        <div
          data-parallax="-0.34"
          className="absolute right-12 bottom-[14%] w-24 xl:right-20 xl:w-28 2xl:right-28 2xl:w-32"
        >
          <MagneticLego src={lego1} tilt="-rotate-6" strength={0.28} />
        </div>
      </div>

      {/*
        No mobile o texto vem primeiro (título antes da foto);
        a partir de lg, a ordem visual inverte: foto à esquerda, texto à direita.
      */}
      <div className="container-page relative grid items-center gap-12 sm:gap-14 lg:grid-cols-[25rem_minmax(0,1fr)] lg:gap-14 xl:grid-cols-[28rem_minmax(0,1fr)] xl:gap-20 2xl:grid-cols-[31rem_minmax(0,1fr)] 3xl:grid-cols-[35rem_minmax(0,1fr)]">
        {/* Texto */}
        <div className="lg:order-2">
          <p data-reveal="fast" className="eyebrow mb-4 text-blush-600">
            {ABOUT.eyebrow}
          </p>
          {/* `data-handwrite` no lugar de `data-reveal`: aqui o texto é
              escrito linha a linha em vez de surgir por opacidade — os
              dois efeitos no mesmo elemento se anulariam. */}
          <h2
            id="sobre-titulo"
            data-handwrite
            className="heading-section font-display font-medium text-ink-900 text-balance"
          >
            {rich(ABOUT.title)}
          </h2>

          <div className="mt-6 space-y-5 lg:max-w-xl xl:max-w-2xl 2xl:max-w-3xl">
            {ABOUT.paragraphs.map((paragraph) => (
              <p
                key={paragraph.slice(0, 24)}
                data-handwrite
                className="leading-[1.75] text-ink-700 [--rich-weight:500]"
              >
                {rich(paragraph)}
              </p>
            ))}
          </div>

          {/* Assinatura — uso previsto para a Halimun no manual da marca.
              É a única linha em que o traço da esquerda para a direita é
              literal: a assinatura sendo feita. Atributo próprio porque
              ela não dispara ao entrar na tela como os demais textos, e
              sim quando o retrato ao lado começa a trocar. */}
          <p
            data-handwrite-signature
            aria-hidden="true"
            className="mt-8 font-signature text-4xl leading-none text-blush-500 sm:text-5xl"
          >
            {SITE.name}
          </p>

          {/* Destaques */}
          <dl
            data-reveal
            className="border-soft-t mt-9 grid grid-cols-2 gap-5 pt-7 sm:grid-cols-3 sm:gap-4 lg:max-w-xl xl:max-w-2xl 2xl:max-w-3xl"
          >
            {ABOUT.highlights.map((item) => (
              <div key={item.label} className="flex flex-col-reverse gap-1.5">
                <dt className="eyebrow text-[10px] text-ink-500">{item.label}</dt>
                <dd className="tabular font-display text-base font-semibold text-ink-900 sm:text-lg xl:text-xl">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Visual */}
        <div
          data-reveal-scale
          className="relative mx-auto w-full max-w-xs sm:max-w-sm md:max-w-md lg:order-1 lg:mx-0 lg:max-w-none"
        >
          <div
            aria-hidden="true"
            data-parallax="0.05"
            className="absolute -inset-2.5 -rotate-2 rounded-[2.25rem] bg-gradient-to-tl from-cloud-200/70 to-blush-100/70 sm:-inset-3 sm:rounded-[2.75rem]"
          />
          {/* As duas fotos são 1080×1350 (4:5) — mesma proporção do quadro,
              sem corte, e empilháveis para a troca sem salto de layout. */}
          <figure
            ref={figureRef}
            className="relative aspect-4/5 overflow-hidden rounded-[2rem] shadow-[0_32px_80px_-32px_rgb(48_42_44_/_0.22)] ring-1 ring-white/60 sm:rounded-[2.5rem]"
          >
            <img
              data-photo="first"
              src={aboutImage}
              alt="Aline Wanderley sentada no chão do consultório, sorrindo entre peças de montar"
              loading="lazy"
              decoding="async"
              width={1080}
              height={1350}
              className="size-full object-cover"
            />
            {/* Decorativa: mesma pessoa, mesmo contexto — o texto
                alternativo da primeira já descreve a cena para quem
                usa leitor de tela. */}
            <img
              data-photo="second"
              src={aboutImageAlt}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              width={1080}
              height={1350}
              className="absolute inset-0 size-full object-cover opacity-0"
            />
          </figure>

          {/* Peças de montar da versão compacta (abaixo de lg), ancoradas
              nos cantos da foto — ver a nota no bloco flutuante acima. */}
          <div
            aria-hidden="true"
            data-parallax="0.6"
            className="pointer-events-none absolute -top-6 -right-6 w-20 sm:-top-8 sm:-right-8 sm:w-24 lg:hidden"
          >
            <MagneticLego src={lego2} tilt="rotate-6" />
          </div>
          <div
            aria-hidden="true"
            data-parallax="-0.6"
            className="pointer-events-none absolute -right-8 -bottom-6 w-20 sm:-right-10 sm:-bottom-8 sm:w-24 lg:hidden"
          >
            <MagneticLego src={lego1} tilt="-rotate-6" />
          </div>

          {/*
            Selo CRP.

            Compacto de propósito: as duas linhas quase encostam (leading
            zerado, 2px entre elas) para o conjunto ler como um carimbo, e
            não como duas frases empilhadas. O número em rosa escuro puxa
            a credencial — que é a informação que importa — e mantém 4,95:1
            de contraste sobre o branco translúcido.
          */}
          <div
            ref={badgeRef}
            aria-hidden="true"
            className="absolute -top-3.5 left-3 rounded-2xl border border-white/70 bg-white/88 px-3.5 py-2 text-center shadow-[0_20px_48px_-20px_rgb(48_42_44_/_0.28)] backdrop-blur-xl sm:-top-4 sm:left-6 sm:px-4 sm:py-2.5"
          >
            <span className="block font-display text-sm leading-none font-semibold tracking-[-0.01em] text-blush-600 sm:text-[0.9375rem]">
              {SITE.crp}
            </span>
            <span className="eyebrow mt-[3px] block text-[8.5px] leading-none text-ink-500">
              Registro ativo
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
