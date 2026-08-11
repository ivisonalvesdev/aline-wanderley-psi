import { useLayoutEffect, useRef } from "react";
import { ArrowDown, BadgeCheck } from "lucide-react";
import { HERO, CTA_LABEL } from "@/constants/content";
import { WhatsAppCta } from "@/components/WhatsAppCta";
import { rich } from "@/utils/rich";
import { gsap, SplitText, EASE, MOTION_OK } from "@/utils/gsap";
import heroImage from "@assets/img-principal-hero.webp";
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
      className="relative isolate flex min-h-svh items-center overflow-hidden pt-28 pb-24 sm:pt-32 sm:pb-32 lg:pb-40 short:pt-24 short:pb-16"
    >
      {/*
        Fundo de capa: a foto já traz o cenário e a Aline à direita.
        Os véus ficam nesta camada (-z-10), portanto sempre atrás do
        conteúdo — escurecem a foto, nunca o texto.
      */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <img
          data-hero-visual
          src={heroImage}
          alt=""
          fetchPriority="high"
          decoding="async"
          className="size-full object-cover object-[70%_28%] sm:object-[68%_30%] lg:object-[60%_center] xl:object-center"
        />

        {/* Véu base — assenta a foto e mantém o conjunto coeso */}
        <div className="absolute inset-0 bg-ink-900/45 lg:bg-ink-900/15" />

        {/* Reforço de contraste atrás do texto (ver `hero-veil` no CSS):
            vertical no mobile, lateral a partir de lg. */}
        <div className="hero-veil absolute inset-0" />

        {/* Dissolve a foto no branco da próxima seção — evita o corte seco.
            Faixa alta com curva atrasada: a emenda some por completo sem
            que o claro suba até os CTAs (texto branco) em telas baixas. */}
        <div className="hero-fade-bottom absolute inset-x-0 bottom-0 h-36 sm:h-44 lg:h-56 short:h-24" />
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
          <div
            data-hero-item
            className="relative mb-6 aspect-[175/114] w-44 overflow-hidden drop-shadow-[0_2px_12px_rgb(48_42_44_/_0.4)] sm:w-52 lg:w-56 xl:w-60 short:mb-4 short:w-40"
          >
            <img
              src={logoAline}
              alt="Aline Wanderley — Psicóloga"
              fetchPriority="high"
              className="absolute top-[-57.02%] left-[-25.14%] w-[142.86%] max-w-none"
            />
          </div>

          <h1
            data-hero-title
            className="heading-hero invisible font-display font-medium text-white text-balance"
          >
            {rich(HERO.headline)}
          </h1>

          <p
            data-hero-item
            className="mt-6 max-w-lg text-base leading-[1.7] text-white/90 [--rich-accent:var(--color-blush-200)] [--rich-weight:500] sm:text-lg xl:max-w-xl short:mt-4 short:text-base"
          >
            {rich(HERO.subheadline)}
          </p>

          {/* Badges de credibilidade */}
          <ul
            data-hero-item
            className="mt-7 flex flex-wrap gap-2 sm:gap-2.5 short:mt-5"
            aria-label="Credenciais"
          >
            {HERO.badges.map((badge) => (
              <li
                key={badge}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1.5 font-alt text-[11px] font-medium tracking-[0.02em] text-white ring-1 ring-white/25 backdrop-blur-md sm:px-3.5 sm:text-xs"
              >
                <BadgeCheck className="size-3.5 shrink-0 text-blush-200" aria-hidden="true" />
                {badge}
              </li>
            ))}
          </ul>

          {/* CTAs */}
          <div
            data-hero-item
            className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center short:mt-6"
          >
            <WhatsAppCta size="lg" ariaLabel="Agendar pelo WhatsApp (principal)">
              {CTA_LABEL}
            </WhatsAppCta>
            <a
              href="#especialidades"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 px-6 py-3.5 font-alt text-[0.9375rem] font-semibold tracking-[0.012em] text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/70 hover:bg-white/20 sm:px-8 sm:py-4 sm:text-base"
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
