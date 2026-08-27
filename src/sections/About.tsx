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
import aboutImage4 from "@assets/img/sobre-4.webp";
import aboutImage5 from "@assets/img/sobre-5.webp";
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
 * As duas primeiras são 1080×1350; das demais, a maioria veio 1000×1500 e
 * uma (sobre-4) veio 1280×1600 — a `width`/`height` de cada `<img>` usa a
 * proporção real do arquivo (só evita o salto de layout antes do CSS
 * carregar); quem decide o enquadramento exibido é sempre o `object-cover`
 * do quadro 4:5 do figure.
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
  { src: aboutImage4, alt: "", width: 1280, height: 1600 },
  { src: aboutImage5, alt: "", width: 1000, height: 1500 },
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
     * Troca de retrato em loop automático — não depende mais da rolagem.
     *
     * Antes a seção travava (`pin`) e as trocas eram scrubadas pelo scroll;
     * com mais fotos adicionadas, isso esticava a página por várias telas
     * (uma faixa de rolagem por foto), deixando o scroll da seção muito
     * longo. Agora cada foto fica 3s em tela e cruza para a próxima
     * sozinha, num timeline que se repete para sempre — a seção não ganha
     * altura extra nenhuma, só as fotos entram em loop.
     */
    const AUTOPLAY_HOLD = 2.2; // segundos com a foto parada, em tela cheia
    const AUTOPLAY_CROSS = 0.8; // segundos do cruzamento até a próxima
    // HOLD + CROSS = 3s: é o intervalo entre uma foto virar a "atual" e a
    // seguinte tomar o lugar dela.

    mm.add(MOTION_OK, () => {
      const figure = figureRef.current;
      const photos = figure ? [...figure.querySelectorAll<HTMLElement>("[data-photo]")] : [];
      if (!figure || photos.length < 2) return;

      /*
        `immediateRender: false` é o que impede o próprio `fromTo` de
        estragar o repouso inicial: sem ele, o GSAP aplica o valor "from"
        de cada tween assim que ela é criada — não quando o timeline
        chega nela. Como a última volta do loop usa a foto 0 como
        "próxima" (fechando o ciclo), essa foto acabaria herdando
        `autoAlpha: 0` no instante em que o efeito monta, antes mesmo do
        timeline tocar — apagando a foto que devia aparecer em repouso.
      */
      const tl = gsap.timeline({ repeat: -1, paused: true });
      for (let i = 0; i < photos.length; i++) {
        const next = photos[(i + 1) % photos.length];
        tl.to({}, { duration: AUTOPLAY_HOLD })
          .fromTo(
            next,
            { autoAlpha: 0, scale: 1.07 },
            { autoAlpha: 1, scale: 1, duration: AUTOPLAY_CROSS, ease: "power1.inOut", immediateRender: false },
            ">",
          )
          .to(photos[i], { autoAlpha: 0, scale: 1.03, duration: AUTOPLAY_CROSS, ease: "power1.inOut" }, "<");
      }

      /*
        O loop só roda com a foto à vista — mesmo motivo do vídeo da seção
        Pais (ver o comentário lá): rodar fora de quadro é gasto à toa. O
        `will-change` também só fica ligado enquanto anima, para não
        segurar as seis fotos em memória de vídeo o tempo todo.
      */
      const visibility = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            gsap.set(photos, { willChange: "opacity, transform" });
            tl.play();
          } else {
            tl.pause();
            gsap.set(photos, { willChange: "auto" });
          }
        },
        { rootMargin: "0px" },
      );
      visibility.observe(figure);

      return () => {
        visibility.disconnect();
        tl.kill();
      };
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

          Lado a lado, o percurso é o da própria seção passando pela tela —
          as fotos, agora em loop automático (ver mais acima), não ditam
          mais esse ritmo. Empilhado, esse trecho não serve, porque a
          assinatura já subiu para fora da tela nesse ponto; ali ela volta
          a ser percorrida pela própria entrada em cena.

          `SIGNATURE_SCRUB`, bem mais alto que o `SCRUB` padrão do site
          (0.7), é o que dá a suavidade extra pedida pela Aline: o traço
          "persegue" a rolagem com bem mais atraso, em vez de segui-la
          quase colado.

          No desktop a janela termina cedo (`top 55%`) de propósito: o
          nome precisa estar pronto assim que a seção fica bem enquadrada
          na tela, não ainda sendo escrito enquanto a pessoa já está lendo
          o resto — o que ficou visível agora que as fotos não seguram
          mais a rolagem no mesmo ritmo.
        */
        const tween = gsap.fromTo(signature, CLOSED, {
          ...OPEN,
          ease: "none",
          scrollTrigger: sideBySide
            ? {
                trigger: signature,
                start: "top 85%",
                end: "top 55%",
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
              (as duas originais e a sobre-4 são 4:5, as demais vieram
              2:3), e é por isso que o corte fica a cargo do CSS, não do
              arquivo. */}
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
