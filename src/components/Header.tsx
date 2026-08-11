import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV_LINKS, SITE } from "@/constants/site";
import { WhatsAppCta } from "@/components/WhatsAppCta";
import { CTA_LABEL, CTA_LABEL_SHORT } from "@/constants/content";
import { cn } from "@/utils/cn";
import logoAline from "@assets/logo-maior.webp";

/**
 * Header sticky com glassmorphism leve e scroll inteligente:
 * esconde ao rolar para baixo, reaparece ao rolar para cima.
 */
export function Header() {
  const [scrolled, setScrolled] = useState(false);
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
        setScrolled(y > 24);
        // Só esconde depois de passar do hero e rolando para baixo
        setHidden(y > 480 && y > lastY.current);
        lastY.current = y;
        ticking = false;
      });
    };

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
   * No topo o header flutua sobre a foto escura do hero — texto claro.
   * Ao rolar (ou com o menu aberto) o fundo vira vidro branco — texto escuro.
   */
  const onDark = !scrolled && !menuOpen;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-80 transition-all duration-500 ease-out",
        hidden && !menuOpen ? "-translate-y-full" : "translate-y-0",
        menuOpen
          ? "border-b border-white/40 bg-white/90 shadow-[0_8px_32px_-16px_rgb(48_42_44_/_0.12)] backdrop-blur-xl"
          : scrolled
            ? "border-b border-white/40 bg-white/70 shadow-[0_8px_32px_-16px_rgb(48_42_44_/_0.12)] backdrop-blur-xl"
            : "bg-transparent",
      )}
    >
      <div className="container-page flex h-20 items-center justify-between gap-4 sm:h-24 short:h-20">
        {/*
          Logo — só entra depois que o hero sai de cena. No topo da página
          quem assina a marca é a logo grande do hero; repeti-la aqui seria
          redundante. O elemento continua ocupando espaço (apenas invisível)
          para não desalinhar o `justify-between` do cabeçalho.
        */}
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
          <div className="relative aspect-[175/114] w-24 overflow-hidden sm:w-28 short:w-24">
            <img
              src={logoAline}
              alt="Aline Wanderley — Psicóloga"
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
                      ? "text-white/85 hover:text-white"
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
            className="container-page max-h-[calc(100svh-5rem)] overflow-y-auto overscroll-contain pb-6 sm:max-h-[calc(100svh-6rem)]"
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
