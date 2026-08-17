import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV_LINKS, SITE } from "@/constants/site";
import { WhatsAppCta } from "@/components/WhatsAppCta";
import { CTA_LABEL, CTA_LABEL_SHORT } from "@/constants/content";
import { cn } from "@/utils/cn";
import logoAline from "@assets/img/logo-maior.webp";

/**
 * Header sticky com glassmorphism leve e scroll inteligente:
 * esconde ao rolar para baixo, reaparece ao rolar para cima.
 *
 * Dentro do hero ele não existe: quem assina a marca ali é a logo grande,
 * e o cabeçalho por cima da foto competia com ela. Só a partir do fim do
 * hero é que ele passa a aparecer.
 */
export function Header() {
  const [pastHero, setPastHero] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;

        /*
          O hero é `min-h-svh`, então sua altura é a da janela — medir pelo
          elemento em vez de fixar um número mantém o limiar certo em
          telas baixas, onde um valor cravado cairia dentro ou muito depois
          do hero. A folga de 88px antecipa a troca para que o cabeçalho já
          esteja posto quando a seção seguinte encosta no topo.
         */
        const hero = document.getElementById("inicio");
        const heroEnd = (hero?.offsetHeight ?? window.innerHeight) - 88;

        setPastHero(y > heroEnd);
        // Depois do hero, esconde ao descer e devolve ao subir.
        setHidden(y > heroEnd && y > lastY.current);
        lastY.current = y;
        ticking = false;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Trava o scroll do body com o menu mobile aberto
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Fecha o menu com Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  /**
   * Sobre o hero o cabeçalho não tem fundo: a foto é a capa da marca, e
   * qualquer faixa ali corta a imagem em duas. Só a navegação fica, em
   * tinta clara. Passado o hero, o vidro branco entra e a tinta escurece.
   *
   * De quebra, não pintar nada sobre o hero também poupa o desfoque no
   * trecho mais pesado da página.
   */
  const onDark = !pastHero && !menuOpen;

  /**
   * Sai de cena só ao descer, e nunca dentro do hero.
   *
   * O `focus-within` do JSX abaixo é o que impede isto de virar uma
   * armadilha de teclado: sem ele, quem navega por Tab alcançaria os links
   * do menu enquanto o cabeçalho está deslocado para fora da tela, e o
   * foco sumiria de vista.
   */
  const offscreen = hidden && !menuOpen;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-80 transition-all duration-500 ease-out",
        /*
          Fora do hero o desfoque é `md` (12px), não `xl` (24px), e o branco
          vai a 85%.

          Esta barra é fixa: a cada quadro de rolagem o navegador refaz o
          `backdrop-filter` sobre o que passa atrás — e na seção Formação o
          que passa atrás é vídeo em reprodução, ou seja, conteúdo novo a
          cada quadro. O custo do desfoque cresce com o raio, então metade
          do raio é aproximadamente metade do trabalho por quadro. O branco
          mais opaco compensa a perda de leitura do vidro.
        */
        onDark
          ? "bg-transparent"
          : "border-b border-white/40 bg-white/85 shadow-[0_8px_32px_-16px_rgb(48_42_44_/_0.12)] backdrop-blur-md",
        menuOpen && "bg-white/95",
        offscreen ? "-translate-y-full focus-within:translate-y-0" : "translate-y-0",
      )}
    >
      {/* Barra enxuta: a logo é o elemento mais alto aqui dentro, então a
          altura da faixa é ditada por ela — 64px deixam ~6px de respiro
          acima e abaixo do desenho, o mínimo antes de a marca começar a
          parecer espremida contra as bordas. */}
      <div className="container-page flex h-16 items-center justify-between gap-4 sm:h-[4.5rem] short:h-16">
        {/* Dentro do hero a logo some: a capa já traz a marca em corpo
            grande — no desktop ao lado do título, no celular no canto
            superior esquerdo —, e repeti-la aqui a duplicaria na mesma
            tela. O elemento continua ocupando espaço, apenas invisível,
            para não desalinhar o `justify-between` do cabeçalho. */}
        <a
          href="#inicio"
          aria-label={`${SITE.name} — voltar ao início`}
          aria-hidden={onDark}
          tabIndex={onDark ? -1 : undefined}
          className={cn(
            "shrink-0 transition-opacity duration-500 ease-out",
            onDark ? "pointer-events-none opacity-0" : "opacity-100",
          )}
        >
          {/* Recorte da margem transparente do PNG — ver comentário no Hero */}
          <div className="relative aspect-[175/114] w-20 overflow-hidden sm:w-24 short:w-20">
            <img
              src={logoAline}
              alt="Aline Wanderley, Psicóloga"
              className="absolute top-[-57.02%] left-[-25.14%] w-[142.86%] max-w-none"
            />
          </div>
        </a>

        {/* Navegação desktop */}
        <nav aria-label="Navegação principal" className="hidden lg:block">
          <ul className="flex items-center gap-6 xl:gap-8">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={cn(
                    // Montserrat no menu, Poppins no conteúdo: o rótulo de
                    // navegação não é texto para ler, é para localizar — e
                    // a troca de família marca essa diferença de função.
                    "group relative font-alt text-[0.8125rem] font-medium tracking-[0.04em] transition-colors duration-300",
                    onDark
                      ? // A sombra é o que garante a leitura sobre a foto:
                        // o hero tem trechos claros, e texto branco puro
                        // sumiria neles.
                        "text-white/90 [text-shadow:0_1px_10px_rgb(48_42_44_/_0.55)] hover:text-white"
                      : "text-ink-700 hover:text-ink-900",
                  )}
                >
                  {link.label}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute -bottom-1 left-0 h-px w-full origin-right scale-x-0 transition-transform duration-300 ease-out group-hover:origin-left group-hover:scale-x-100",
                      onDark ? "bg-white" : "bg-blush-500",
                    )}
                  />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          {/* Container controla a visibilidade — o CTA já define display próprio */}
          <div className="hidden sm:block">
            <WhatsAppCta ariaLabel="Agendar pelo WhatsApp (cabeçalho)">
              {CTA_LABEL_SHORT}
            </WhatsAppCta>
          </div>

          {/* Toggle menu mobile */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="menu-mobile"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            className={cn(
              "inline-flex size-10 items-center justify-center rounded-full backdrop-blur-md transition-colors lg:hidden",
              onDark
                ? "border border-white/40 bg-white/10 text-white hover:bg-white/20"
                : "border border-mist-200 bg-white/70 text-ink-900 hover:bg-blush-50",
            )}
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      <div
        id="menu-mobile"
        className={cn(
          "grid overflow-hidden transition-[grid-template-rows] duration-500 ease-out lg:hidden",
          menuOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="min-h-0">
          {/* Rola internamente quando a viewport é baixa (mobile em paisagem) */}
          <nav
            aria-label="Navegação móvel"
            /* Os descontos acompanham a altura da barra (4rem / 4.5rem):
               é o que sobra de tela para a lista rolar por dentro. */
            className="container-page max-h-[calc(100svh-4rem)] overflow-y-auto overscroll-contain pb-6 sm:max-h-[calc(100svh-4.5rem)]"
          >
            <ul className="border-soft-t flex flex-col gap-1 pt-4">
              {NAV_LINKS.map((link, i) => (
                <li
                  key={link.href}
                  className={cn(
                    "transition-all duration-500 ease-out",
                    menuOpen ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
                  )}
                  style={{ transitionDelay: menuOpen ? `${80 + i * 50}ms` : "0ms" }}
                >
                  <a
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-xl px-3 py-3 font-display text-xl tracking-[-0.018em] text-ink-900 transition-colors hover:bg-blush-50 sm:text-2xl"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li className="mt-3 px-3">
                <WhatsAppCta size="lg" className="w-full" ariaLabel="Agendar pelo WhatsApp (menu)">
                  {CTA_LABEL}
                </WhatsAppCta>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
