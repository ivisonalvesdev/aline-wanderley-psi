import { useLayoutEffect, useRef } from "react";
import { ArrowDown, BadgeCheck } from "lucide-react";
import { HERO, CTA_LABEL } from "@/constants/content";
import { WhatsAppCta } from "@/components/WhatsAppCta";
import { rich } from "@/utils/rich";
import { gsap, SplitText, EASE, MOTION_OK } from "@/utils/gsap";
import heroImage from "@assets/img-principal-hero.webp";
import heroImageMobile from "@assets/hero-mobile.webp";
import logoAline from "@assets/logo-maior.webp";

interface HeroProps {
  /** Dispara a intro somente após o preloader sair de cena. */
  introReady: boolean;
}

export function Hero({ introReady }: HeroProps) {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (!introReady) return;
    const root = rootRef.current;
    if (!root) return;

    const mm = gsap.matchMedia();

    mm.add(MOTION_OK, () => {
      const title = root.querySelector<HTMLElement>("[data-hero-title]");
      const items = root.querySelectorAll<HTMLElement>("[data-hero-item]");
      const visual = root.querySelector<HTMLElement>("[data-hero-visual]");
      if (!title) return;

      let split: SplitText | null = null;
      const tl = gsap.timeline({ defaults: { ease: EASE } });

      // Zoom-out sutil da foto de capa. Fica fora do timeline do texto para
      // que o fundo apareça mesmo se document.fonts.ready demorar.
      const visualTween = visual
        ? gsap.from(visual, { autoAlpha: 0, scale: 1.08, duration: 1.6, ease: EASE })
        : null;

      // Espera as fontes para o SplitText quebrar as linhas corretas
      document.fonts.ready.then(() => {
        if (!root.isConnected) return;

        split = SplitText.create(title, { type: "lines", mask: "lines" });

        gsap.set(title, { autoAlpha: 1 });
        tl.from(split.lines, {
          yPercent: 110,
          duration: 1.1,
          stagger: 0.09,
        }).from(items, { autoAlpha: 0, y: 28, duration: 0.9, stagger: 0.1 }, "-=0.6");
      });

      return () => {
        tl.kill();
        visualTween?.kill();
        split?.revert();
      };
    });

    // Sem animação: garante tudo visível
    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(
        root.querySelectorAll("[data-hero-title], [data-hero-item], [data-hero-visual]"),
        { autoAlpha: 1 },
      );
    });

    return () => mm.revert();
  }, [introReady]);

  return (
    /*
      O padding inferior é maior que o superior de propósito: com
      `items-center`, essa diferença é o que ergue o bloco de texto acima
      do meio da tela sem encostar no header fixo.
    */
    <section
      ref={rootRef}
      id="inicio"
      aria-label="Apresentação"
      /*
        Dois enquadramentos distintos.

        No celular a foto é vertical e já foi composta para isto: a Aline
        ocupa o topo e a bancada rosa fica livre embaixo. O conteúdo, então,
        desce para o rodapé (`items-end`) e a logo sobe sozinha para o canto
        superior esquerdo — texto sobre o vazio da foto, sem cobrir ninguém.

        De `lg` para cima volta a foto horizontal, com a Aline à direita, e
        o bloco inteiro recentraliza como antes.
      */
      className="relative isolate flex min-h-svh items-end overflow-hidden pt-20 pb-28 sm:pb-32 lg:items-center lg:pt-32 lg:pb-40 short:pt-24 short:pb-16"
    >
      {/*
        Fundo de capa: a foto já traz o cenário e a Aline à direita.
        Os véus ficam nesta camada (-z-10), portanto sempre atrás do
        conteúdo — escurecem a foto, nunca o texto.
      */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        {/* `<picture>` em vez de duas `<img>` alternadas por classe: com
            `hidden` o navegador ainda baixaria as duas. Aqui só a que
            corresponde à largura é buscada. */}
        <picture>
          <source media="(min-width: 64rem)" srcSet={heroImage} />
          <img
            data-hero-visual
            src={heroImageMobile}
            alt=""
            fetchPriority="high"
            decoding="async"
            className="size-full object-cover object-[center_top] lg:object-[60%_center] xl:object-center"
          />
        </picture>

        {/* Véu base — assenta a foto e mantém o conjunto coeso.
            No celular caiu de 45% para 10%: ele é uniforme, então tudo o
            que tirava de brilho do rodapé tirava também do rosto. Quem
            escurece a base do enquadramento agora é só o `hero-veil`, que
            tem curva e sabe onde há foto a preservar. */}
        <div className="absolute inset-0 bg-ink-900/10 lg:bg-ink-900/15" />

        {/* Reforço de contraste atrás do texto (ver `hero-veil` no CSS):
            vertical no mobile, lateral a partir de lg. */}
        <div className="hero-veil absolute inset-0" />

        {/* Dissolve a foto no branco da próxima seção — evita o corte seco.
            Faixa alta com curva atrasada: a emenda some por completo sem
            que o claro suba até os CTAs (texto branco) em telas baixas. */}
        <div className="hero-fade-bottom absolute inset-x-0 bottom-0 h-36 sm:h-44 lg:h-56 short:h-24" />
      </div>

      {/*
        Logo do celular, ancorada no topo.

        Fica num `container-page` próprio, e não posicionada contra a
        seção, para herdar exatamente o mesmo recuo lateral do texto lá
        embaixo — cravar um `left` em pixels desalinharia os dois assim
        que a margem do container mudasse de faixa.
      */}
      <div
        aria-hidden="true"
        className="container-page absolute inset-x-0 top-0 pt-6 lg:hidden"
      >
        <div
          data-hero-item
          className="relative aspect-[175/114] w-32 overflow-hidden drop-shadow-[0_2px_12px_rgb(48_42_44_/_0.4)] sm:w-36"
        >
          {/* O arquivo é o de 250px, exibido pequeno. A `logo.webp` tem
              100px e seria ampliada neste tamanho; reduzir a maior sai
              mais nítido, com o mesmo resultado visual. O recorte da
              margem transparente é o mesmo do bloco de lg. */}
          <img
            src={logoAline}
            alt=""
            fetchPriority="high"
            className="absolute top-[-57.02%] left-[-25.14%] w-[142.86%] max-w-none"
          />
        </div>
      </div>

      <div className="container-page">
        {/* Aqui o destaque das palavras usa o rosa claro da marca: o
            #C4405F padrão foi feito para texto escuro sobre branco e
            sumiria contra a foto. */}
        <div className="max-w-xl [--rich-accent:var(--color-blush-300)] xl:max-w-2xl 2xl:max-w-3xl">
          {/*
            Logo da marca.

            O PNG tem margem transparente própria (250×250 com o desenho
            em x 44–218, y 65–178). O wrapper recorta essa sobra para que
            a tinta da logo alinhe exatamente com a margem esquerda do
            título — por isso as porcentagens quebradas abaixo:
              largura da arte : 250/175 = 142.86%
              recuo horizontal:  44/175 = 25.14%
              recuo vertical  :  65/114 = 57.02%
            Mexer só na largura do wrapper redimensiona tudo junto.

            A sombra fica no wrapper, não no <img>: o overflow-hidden recorta
            os filhos, mas não o filtro do próprio elemento — assim ela segue
            o contorno da logo e transborda a caixa em vez de ser cortada.
          */}
          {/* Só a partir de lg — no celular a logo é a do canto superior
              esquerdo, fora deste bloco. */}
          {/*
            O par `-mt` / `mb` é o que sobe a logo sem arrastar o título
            junto. A margem negativa sozinha encurtaria o bloco, e como ele
            é centralizado na vertical, a página devolveria metade da subida
            empurrando tudo para baixo. Somando ao `mb` o mesmo tanto que se
            tirou do topo, a altura total fica igual e só a logo se move.

            As margens vão sem prefixo porque este bloco é `hidden lg:block`
            — abaixo de lg ele não existe, e quem responde pela logo é o do
            canto superior esquerdo. Só o `short` (notebook) é reafirmado,
            que já vinha com o intervalo mais curto.
          */}
          <div
            data-hero-item
            className="relative -mt-4 mb-10 hidden aspect-[175/114] w-44 overflow-hidden drop-shadow-[0_2px_12px_rgb(48_42_44_/_0.4)] lg:block lg:w-56 xl:w-60 short:mb-8 short:w-40"
          >
            <img
              src={logoAline}
              alt="Aline Wanderley — Psicóloga"
              fetchPriority="high"
              className="absolute top-[-57.02%] left-[-25.14%] w-[142.86%] max-w-none"
            />
          </div>

          {/* O piso do `clamp` no `heading-hero` é 2rem; abaixo de sm o
              título desce para 1.75rem, porque no rodapé da foto ele
              divide a altura útil com subtítulo, selos e dois botões. */}
          <h1
            data-hero-title
            className="heading-hero invisible max-sm:text-[1.75rem] font-display font-medium text-white text-balance"
          >
            {rich(HERO.headline)}
          </h1>

          <p
            data-hero-item
            className="mt-4 max-w-lg text-[0.9375rem] leading-[1.65] text-white/90 [--rich-accent:var(--color-blush-200)] [--rich-weight:500] sm:mt-6 sm:text-lg sm:leading-[1.7] xl:max-w-xl short:mt-4 short:text-base"
          >
            {rich(HERO.subheadline)}
          </p>

          {/* Badges de credibilidade */}
          <ul
            data-hero-item
            className="mt-5 flex flex-wrap gap-2 sm:mt-7 sm:gap-2.5 short:mt-5"
            aria-label="Credenciais"
          >
            {HERO.badges.map((badge) => (
              <li
                key={badge}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-2.5 py-1 font-alt text-[10px] font-medium tracking-[0.02em] text-white ring-1 ring-white/25 backdrop-blur-md sm:px-3.5 sm:py-1.5 sm:text-xs"
              >
                <BadgeCheck className="size-3 shrink-0 text-blush-200 sm:size-3.5" aria-hidden="true" />
                {badge}
              </li>
            ))}
          </ul>

          {/* CTAs */}
          {/* No celular os dois botões encolhem: no tamanho cheio o par
              transbordava a faixa escura do rodapé da foto.

              O encolhimento vem por `max-sm:` em vez de `size="md"` para
              não duplicar o componente. O `cn` do projeto só concatena —
              não resolve conflito de classe —, mas variantes com media
              query são emitidas depois das utilities sem prefixo, então
              dentro da faixa a última declarada prevalece. */}
          <div
            data-hero-item
            className="mt-6 flex flex-col gap-2.5 sm:mt-9 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 short:mt-6"
          >
            <WhatsAppCta
              size="lg"
              className="max-sm:px-5 max-sm:py-3 max-sm:text-sm"
              ariaLabel="Agendar pelo WhatsApp (principal)"
            >
              {CTA_LABEL}
            </WhatsAppCta>
            <a
              href="#especialidades"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 px-5 py-3 font-alt text-sm font-semibold tracking-[0.012em] text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/70 hover:bg-white/20 sm:px-8 sm:py-4 sm:text-base"
            >
              Conheça meu trabalho
            </a>
          </div>
        </div>
      </div>

      {/* Indicador de scroll — escondido em telas baixas, onde o espaço é curto.
          Fica sobre o degradê claro do rodapé do hero, por isso usa tinta escura. */}
      <a
        href="#especialidades"
        aria-label="Rolar para a próxima seção"
        className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-ink-500 transition-colors hover:text-ink-900 lg:flex short:hidden"
      >
        <span className="eyebrow text-[10px] tracking-[0.28em]">Role</span>
        <ArrowDown className="size-4 motion-safe:animate-bounce" aria-hidden="true" />
      </a>
    </section>
  );
}
