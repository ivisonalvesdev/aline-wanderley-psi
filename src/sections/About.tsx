import { useLayoutEffect, useRef } from "react";
import { ABOUT } from "@/constants/content";
import { SITE } from "@/constants/site";
import { useReveal } from "@/hooks/useReveal";
import { useMagnetic } from "@/hooks/useMagnetic";
import { gsap, MOTION_OK } from "@/utils/gsap";
import { rich } from "@/utils/rich";
import { cn } from "@/utils/cn";
import aboutImage from "@assets/img/aline-sobre.webp";
import aboutImageAlt from "@assets/img/sobre-2.webp";
import aboutImage3 from "@assets/img/sobre-3.webp";
import aboutImage5 from "@assets/img/sobre-5.webp";
import aboutImage6 from "@assets/img/sobre-6.webp";
import aboutImage7 from "@assets/img/sobre-7.webp";
import lego1 from "@assets/img/lego-1.webp";
import lego2 from "@assets/img/lego-2.webp";

/**
 * Sequência de retratos do carrossel da figura.
 *
 * Só o primeiro leva `alt` descritivo — é o que a seção mostra em repouso,
 * antes de qualquer rolagem, e por isso é o único que um leitor de tela
 * chega a anunciar como imagem própria. Os demais são a mesma pessoa no
 * mesmo contexto (fotos de trabalho da Aline), decorativos como já era a
 * segunda foto antes desta lista crescer.
 *
 * As duas primeiras são 1080×1350; as quatro novas vieram 1000×1500 — a
 * `width`/`height` de cada `<img>` usa a proporção real do arquivo (só
 * evita o salto de layout antes do CSS carregar); quem decide o
 * enquadramento exibido é sempre o `object-cover` do quadro 4:5 do figure.
 */
const ABOUT_PHOTOS = [
  {
    src: aboutImage,
    alt: "Aline Wanderley sentada no chão do consultório, sorrindo entre peças de montar",
    width: 1080,
    height: 1350,
  },
  { src: aboutImageAlt, alt: "", width: 1080, height: 1350 },
  { src: aboutImage3, alt: "", width: 1000, height: 1500 },
  { src: aboutImage5, alt: "", width: 1000, height: 1500 },
  { src: aboutImage6, alt: "", width: 1000, height: 1500 },
  { src: aboutImage7, alt: "", width: 1000, height: 1500 },
] as const;

/**
 * Inércia do traço da assinatura — bem acima do `SCRUB` padrão do site
 * (0.7, usado nos demais reveals) porque este traço pediu suavidade
 * própria. Quanto maior, mais o elemento "persegue" a rolagem em vez de
 * segui-la colado; ver o comentário junto ao `ScrollTrigger` da
 * assinatura, mais abaixo, para o valor em contexto.
 */
const SIGNATURE_SCRUB = 1.5;

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
      if (!section || section.offsetHeight <= window.innerHeight * 0.96) {
        return "center center";
      }

      /*
        Alinhar o fim da seção ao fim da tela deixa o começo dela para fora,
        acima. Em notebook isso é sensível: a tela é larga o bastante para o
        layout lado a lado, mas baixa, e o corte comia o topo da seção — era
        a sensação de enquadramento "puxado para cima".

        O `+=` desce o ponto de travamento: a seção prende com o fim um
        pouco abaixo da borda inferior, o que devolve a mesma medida de
        volta no topo. Não abre folga nenhuma, porque aqui a seção já é mais
        alta que a tela — só troca o que fica de fora embaixo pelo que
        estava faltando em cima.

        A condição é a mesma da variante `short` do CSS (largura de lg com
        tela baixa), que é onde o problema aparece. Em monitor grande a
        seção cabe inteira e nem chega neste ramo.
      */
      const notebook = window.innerWidth >= 1024 && window.innerHeight <= 864;
      return notebook ? "bottom bottom+=44" : "bottom bottom";
    };

    /*
      Ritmo de cada troca: pausa, cruzamento, pausa — a mesma proporção da
      versão original de duas fotos (0.12 + 0.76 + 0.12 = 1 "unidade").
      Encadeadas, as fotos de `ABOUT_PHOTOS` (topo do arquivo) rendem N-1
      trocas; `swapUnits`, logo abaixo, soma tudo isso para saber quanto de
      rolagem a sequência inteira precisa.
    */
    const SWAP_PAUSE = 0.12;
    const SWAP_CROSS = 0.76;

    const buildSwap = (scrollTrigger: gsap.TimelineVars["scrollTrigger"]) => {
      const figure = figureRef.current;
      const photos = figure ? [...figure.querySelectorAll<HTMLElement>("[data-photo]")] : [];
      if (!figure || photos.length < 2) return;

      /*
        As fotos sobem para camada própria da GPU antes do cruzamento e
        voltam ao normal depois.

        Sem isto, cada quadro do crossfade obriga o navegador a repintar a
        área inteira da figura — duas imagens em ~1080px de largura com
        opacidade e escala mudando ao mesmo tempo, dentro de uma seção
        presa. Era o que se sentia como travadinha no momento exato da
        troca. Declarar o `will-change` antes permite promover a camada
        uma vez, com folga, em vez de no primeiro quadro da animação.

        A limpeza no fim importa tanto quanto: `will-change` permanente
        seguraria todas as fotos em memória de vídeo pelo resto da visita.
      */
      const layerUp = () => gsap.set(photos, { willChange: "opacity, transform" });
      const layerDown = () => gsap.set(photos, { willChange: "auto" });

      const tl = gsap.timeline({
        scrollTrigger: {
          ...(scrollTrigger as ScrollTrigger.Vars),
          onEnter: layerUp,
          onEnterBack: layerUp,
          onLeave: layerDown,
          onLeaveBack: layerDown,
        },
      });

      // Os respiros de 0.12 são o que dá tempo de ver o que aconteceu: a
      // seção trava, segura um instante, troca, segura de novo — e só
      // depois da última foto a página é liberada.
      tl.to({}, { duration: SWAP_PAUSE });
      for (let i = 1; i < photos.length; i++) {
        tl.fromTo(
          photos[i],
          { autoAlpha: 0, scale: 1.07 },
          { autoAlpha: 1, scale: 1, duration: SWAP_CROSS, ease: "power1.inOut" },
          ">",
        )
          .fromTo(
            photos[i - 1],
            { autoAlpha: 1 },
            { autoAlpha: 0, scale: 1.03, duration: SWAP_CROSS, ease: "power1.inOut" },
            "<",
          )
          .to({}, { duration: SWAP_PAUSE });
      }
    };

    // Soma das "unidades" acima para as N-1 trocas de ABOUT_PHOTOS. Para
    // duas fotos dá exatamente 1.0 — a mesma conta de antes desta lista
    // crescer, então o multiplicador de tela cheia abaixo continua valendo.
    const swapUnits =
      SWAP_PAUSE + (ABOUT_PHOTOS.length - 1) * (SWAP_CROSS + SWAP_PAUSE);

    /**
     * A seção trava em qualquer tela — as trocas precisam acontecer à vista.
     *
     * Sem o pin, quem rola em ritmo normal já passou a foto quando o
     * crossfade começa. Com ele, a página segura pelo tempo de todas as
     * trocas em sequência: a seção para, as fotos se revezam uma a uma, e
     * só então a rolagem retoma.
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
        // muito mais gestos com o dedo do que com a roda do mouse. O
        // `swapUnits` é quem estica essa distância conforme o número de
        // fotos — mais retratos, mais tela de rolagem para vê-los todos.
        end: () => `+=${window.innerHeight * (window.innerWidth < 640 ? 0.7 : 0.9) * swapUnits}`,
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
     * Traço de escrita da assinatura.
     *
     * É a única linha da seção em que o traço da esquerda para a direita é
     * literal: a assinatura sendo feita, revelada por um `clip-path` que
     * abre como tinta saindo da caneta. Os parágrafos ao lado entram com o
     * fade padrão do site (`data-reveal`) — texto corrido precisa ser
     * lido, e qualquer revelação linha a linha atrasa essa leitura.
     *
     * Não espera mais `fonts.ready`, como esperava antes — e a espera
     * nunca fez falta para esta técnica de recorte.
     *
     * O recorte é feito em porcentagem (`inset(-30% 100% -30% 0)` fechado,
     * `inset(-30% 0% -30% 0)` aberto), relativa à própria caixa do
     * elemento, não à largura em pixels da fonte. 100% é "tudo escondido"
     * e 0% é "tudo à vista" — não importa a métrica de qual fonte está
     * desenhada no momento.
     *
     * O que ela causava: este `ScrollTrigger` nascia num instante
     * imprevisível (o que fosse que `fonts.ready` levasse para resolver),
     * quase sempre depois de o da troca de retrato já existir. Criar um
     * `ScrollTrigger` novo faz o GSAP re-medir todos os outros da página —
     * e, se a pessoa já tivesse rolado para longe (de volta ao Hero, por
     * exemplo) quando essa remedida chegasse, o intervalo recém-calculado
     * podia colocar a posição atual do scroll *dentro* da faixa da
     * assinatura, escrevendo-a de um salto só. Era o bug relatado. Criar o
     * gatilho já na primeira passagem do efeito, junto com o da foto,
     * evita essa segunda remedida tardia.
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

        const signature = section.querySelector<HTMLElement>("[data-handwrite-signature]");
        if (!signature) return;

        /*
          As folgas verticais negativas evitam que o recorte decepe o que
          passa da caixa da linha: na assinatura, as hastes altas e as
          caudas descendentes ficam bem fora dela. Só o eixo horizontal é
          recortado — é ele que desenha o traço.
        */
        const CLOSED = { clipPath: "inset(-30% 100% -30% 0)" };
        const OPEN = { clipPath: "inset(-30% 0% -30% 0)" };

        gsap.set(signature, CLOSED);

        /*
          A assinatura é preenchida pela rolagem, como era antes.

          Lado a lado, o percurso é o da própria seção presa: a mão assina
          enquanto os retratos trocam. Empilhado, esse trecho não serve,
          porque quando as fotos trocam a assinatura já subiu para fora da
          tela; ali ela volta a ser percorrida pela própria entrada em
          cena.

          `SIGNATURE_SCRUB`, bem mais alto que o `SCRUB` padrão do site
          (0.7), é o que dá a suavidade extra pedida pela Aline: o traço
          "persegue" a rolagem com bem mais atraso, em vez de segui-la
          quase colado. As janelas de scroll também alargaram — 0.6 tela
          virou 1.1 no desktop, e a faixa do celular quase dobrou —, então
          a mesma distância de dedo/roda agora rende bem menos progresso
          por vez.
        */
        const tween = gsap.fromTo(signature, CLOSED, {
          ...OPEN,
          ease: "none",
          scrollTrigger: sideBySide
            ? {
                trigger: section,
                start: swapStart,
                // A seção agora fica travada por várias telas (uma por
                // foto do carrossel); 1.1 tela de escrita ainda deixa
                // folga de sobra antes da liberação do pin.
                end: () => `+=${window.innerHeight * 1.1}`,
                scrub: SIGNATURE_SCRUB,
              }
            : {
                trigger: signature,
                start: "top 96%",
                end: "top 40%",
                scrub: SIGNATURE_SCRUB,
              },
        });

        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
        };
      },
    );

    /*
      Respiração do selo: um vaivém lento o bastante para ser percebido
      como flutuação e não como tremor.

      O percurso lateral é o dobro do vertical, e a duração cresceu junto.
      É a razão entre as duas que decide se o movimento lê como suave: mais
      distância no mesmo tempo viraria deslize apressado, então o curso
      maior anda mais devagar e a velocidade de pico continua a mesma. O
      `sine.inOut` completa o efeito ao tirar a partida e a chegada bruscas
      de cada ida e volta.
    */
    mm.add(MOTION_OK, () => {
      if (!badgeRef.current) return;
      gsap.to(badgeRef.current, {
        x: 14,
        y: -5,
        rotation: -1.1,
        duration: 5,
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
                data-reveal
                className="leading-[1.75] text-ink-700 [--rich-weight:500]"
              >
                {rich(paragraph)}
              </p>
            ))}
          </div>

          {/* Assinatura — a única linha em que o traço da esquerda para a
              direita é literal: a assinatura sendo feita. Atributo próprio
              porque ela não dispara ao entrar na tela como os demais
              textos, e sim quando o retrato ao lado começa a trocar. */}
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
          {/* O quadro é 4:5 e recorta (`object-cover`) qualquer fonte —
              as seis fotos de `ABOUT_PHOTOS` não compartilham proporção
              (as duas originais são 4:5, as quatro novas vieram 2:3), e é
              por isso que o corte fica a cargo do CSS, não do arquivo. */}
          <figure
            ref={figureRef}
            className="relative aspect-4/5 overflow-hidden rounded-[2rem] shadow-[0_32px_80px_-32px_rgb(48_42_44_/_0.22)] ring-1 ring-white/60 sm:rounded-[2.5rem]"
          >
            {ABOUT_PHOTOS.map((photo, index) => (
              <img
                key={photo.src}
                data-photo
                src={photo.src}
                alt={photo.alt}
                aria-hidden={photo.alt ? undefined : "true"}
                loading="lazy"
                decoding="async"
                width={photo.width}
                height={photo.height}
                className={cn(
                  "size-full object-cover",
                  // A primeira fica no fluxo normal — é ela quem dá a
                  // dimensão da figura via `aspect-4/5`. As demais ficam
                  // empilhadas por cima, prontas para o crossfade.
                  index === 0 ? "" : "absolute inset-0 opacity-0",
                )}
              />
            ))}
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
            className="absolute -bottom-3.5 left-3 rounded-2xl border border-white/70 bg-white/88 px-3.5 py-2 text-center shadow-[0_20px_48px_-20px_rgb(48_42_44_/_0.28)] backdrop-blur-xl sm:-bottom-4 sm:left-6 sm:px-4 sm:py-2.5"
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
