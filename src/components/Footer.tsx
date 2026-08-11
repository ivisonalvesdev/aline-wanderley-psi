import { useLayoutEffect, useRef } from "react";
import { MapPin, Mail, Link as LinkIcon } from "lucide-react";
import { NAV_LINKS, SITE, WHATSAPP_URL, FULL_ADDRESS, MAP_LINK_URL } from "@/constants/site";
import { CTA_LABEL_SHORT } from "@/constants/content";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import logoAline from "@assets/logo-maior.webp";

export function Footer() {
  const year = new Date().getFullYear();
  const footerRef = useRef<HTMLElement>(null);
  const signatureBoxRef = useRef<HTMLDivElement>(null);
  const signatureRef = useRef<HTMLSpanElement>(null);
  const closingRef = useRef<HTMLDivElement>(null);

  /**
   * Dimensiona e posiciona a assinatura em marca d'água.
   *
   * **Largura.** Um `font-size` em `vw` não resolve: a proporção entre
   * altura e largura de uma fonte manuscrita não é a de uma sans-serif, e
   * o valor que encaixa em 1920px sobra em 768px. Aqui o texto é desenhado
   * no tamanho base e depois escalado pela razão entre a largura que
   * ocupou e a que deveria ocupar — encaixe exato em qualquer tela.
   *
   * **Altura.** A assinatura tem que terminar acima do filete que separa o
   * copyright: passando por baixo dele, o traço da fonte cruza a linha e o
   * texto pequeno, e o conjunto lê como sobreposição acidental. A posição
   * sai da medida real do bloco de fechamento, não de um valor chutado —
   * ele muda de altura entre desktop (uma linha) e mobile (duas).
   *
   * O reajuste em `fonts.ready` é obrigatório: até a Halimun chegar, a
   * medida é a da fonte de fallback, que tem outra largura por completo.
   */
  useLayoutEffect(() => {
    const el = signatureRef.current;
    const box = signatureBoxRef.current;
    const footer = footerRef.current;
    const closing = closingRef.current;
    if (!el || !box || !footer || !closing) return;

    const fit = () => {
      el.style.transform = "scale(1)";
      // Medido depois de zerar a escala, senão a leitura já viria com o
      // fator anterior aplicado e a assinatura encolheria a cada chamada.
      const natural = el.getBoundingClientRect().width;
      if (!natural) return;
      el.style.transform = `scale(${(box.clientWidth * 0.96) / natural})`;

      const footerBottom = footer.getBoundingClientRect().bottom;
      const closingTop = closing.getBoundingClientRect().top;
      box.style.bottom = `${Math.max(0, footerBottom - closingTop) + 12}px`;
    };

    fit();
    document.fonts.ready.then(fit);

    const observer = new ResizeObserver(fit);
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  /* Sem borda no topo: o CTA final já termina exatamente neste mist-50,
     então as duas seções se encontram na mesma cor. Um filete ali só
     marcaria uma emenda que, sem ele, ninguém percebe. */
  return (
    <footer
      ref={footerRef}
      className="relative isolate overflow-hidden bg-gradient-to-b from-mist-50 via-mist-50 to-white"
    >
      {/*
        Assinatura em marca d'água.

        Fica atrás de tudo, em rosa translúcido: grande o bastante para dar
        personalidade ao fim da página, apagada o bastante para o contraste
        dos textos por cima não mudar. Decorativa — o nome já é lido, com
        todas as letras, na linha de copyright.

        O `bottom` é calculado no efeito acima; o valor aqui é só o ponto
        de partida antes da primeira medição.
      */}
      <div
        ref={signatureBoxRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-24 -z-10 flex justify-center select-none"
      >
        <span
          ref={signatureRef}
          className="inline-block origin-bottom font-signature text-[6rem] leading-[0.78] whitespace-nowrap text-blush-400/22"
        >
          {SITE.name}
        </span>
      </div>

      <div className="container-page relative py-12 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {/* Identidade */}
          <div className="lg:col-span-2">
            {/* Recorte da margem transparente do PNG — ver comentário no Hero.
                Uso a arte grande mesmo em tamanho pequeno: 175px de desenho
                reduzidos para ~128px ficam nítidos, ao contrário da logo.png,
                que seria ampliada. */}
            <div className="relative aspect-[175/114] w-32 overflow-hidden">
              <img
                src={logoAline}
                alt={SITE.name}
                loading="lazy"
                className="absolute top-[-57.02%] left-[-25.14%] w-[142.86%] max-w-none"
              />
            </div>
            <p className="mt-3 text-sm text-ink-500">
              {SITE.role} · {SITE.crp}
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-500">
              Psicoterapia com base na Terapia Cognitivo-Comportamental para
              crianças, adolescentes e adultos. Presencial no Recife e online
              para todo o Brasil.
            </p>
          </div>

          {/* Navegação */}
          <nav aria-label="Links do rodapé">
            <p className="eyebrow text-ink-500">
              Navegação
            </p>
            <ul className="mt-4 space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-ink-700 transition-colors hover:text-blush-600"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contato */}
          <div>
            <p className="eyebrow text-ink-500">
              Contato
            </p>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 text-sm text-ink-700 transition-colors hover:text-blush-600"
                >
                  <WhatsAppIcon className="size-4 shrink-0" />
                  {CTA_LABEL_SHORT}
                </a>
              </li>
              <li>
                <a
                  href={SITE.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 text-sm text-ink-700 transition-colors hover:text-blush-600"
                >
                  <InstagramIcon className="size-4 shrink-0" />
                  {SITE.instagramHandle}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${SITE.email}`}
                  className="inline-flex items-center gap-2.5 text-sm break-all text-ink-700 transition-colors hover:text-blush-600"
                >
                  <Mail className="size-4 shrink-0" aria-hidden="true" />
                  {SITE.email}
                </a>
              </li>
              <li>
                <a
                  href={SITE.linktreeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 text-sm text-ink-700 transition-colors hover:text-blush-600"
                >
                  <LinkIcon className="size-4 shrink-0" aria-hidden="true" />
                  Todos os links
                </a>
              </li>
              <li className="inline-flex items-start gap-2.5 text-sm text-ink-700">
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>
                  <a
                    href={MAP_LINK_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-blush-600"
                  >
                    {FULL_ADDRESS}
                  </a>
                  <br />
                  <span className="text-ink-500">Atendimento online para todo o Brasil</span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div
          ref={closingRef}
          className="border-soft-t relative mt-10 flex flex-col items-start justify-between gap-3 pt-6 font-alt text-xs tracking-[0.01em] text-ink-500 sm:mt-12 sm:flex-row sm:items-center"
        >
          <p>
            © {year} {SITE.name} — {SITE.role}. Todos os direitos reservados.
          </p>
          <p>
            {SITE.crp} · Atendimento conforme as diretrizes do Conselho Federal de Psicologia
          </p>
        </div>
      </div>
    </footer>
  );
}
