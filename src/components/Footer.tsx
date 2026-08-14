import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { MapPin, Mail, Link as LinkIcon } from "lucide-react";
import { PrivacyDialog } from "@/components/PrivacyDialog";
import { NAV_LINKS, SITE, WHATSAPP_URL, FULL_ADDRESS, MAP_LINK_URL } from "@/constants/site";
import { CTA_LABEL_SHORT } from "@/constants/content";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { gsap, MOTION_OK } from "@/utils/gsap";
import { SignatureText } from "@/components/SignatureText";
import { typewriterTarget } from "@/utils/typewriter";
import logoAline from "@assets/logo-maior.webp";

/** Corpo de referência da assinatura, só para medir — ver `fit`. */
const BASE_SIGNATURE_REM = 6;

/**
 * Teto do corpo da assinatura.
 *
 * Sem ele, "encaixar na largura" vira uma conta sem limite: num monitor de
 * 1920px a assinatura chegava a ~230px de corpo e passava a dominar o
 * rodapé inteiro, competindo com o conteúdo em vez de assiná-lo. A partir
 * deste teto ela para de crescer e apenas centraliza.
 */
const MAX_SIGNATURE_REM = 9.5;

export function Footer() {
  const year = new Date().getFullYear();
  const [privacyOpen, setPrivacyOpen] = useState(false);
  /* Estável entre renders: o `useEffect` da janela depende de `onClose` e
     remontaria a cada render do rodapé com uma função recriada. */
  const closePrivacy = useCallback(() => setPrivacyOpen(false), []);
  const footerRef = useRef<HTMLElement>(null);
  const signatureBoxRef = useRef<HTMLDivElement>(null);
  /** A caixa que recorta a largura para o efeito de "digitação". */
  const signatureClipRef = useRef<HTMLSpanElement>(null);
  /** O texto em si, cujo `font-size` é ajustado por `fit`. */
  const signatureRef = useRef<HTMLSpanElement>(null);

  /**
   * Dimensiona a assinatura para ocupar a largura do rodapé.
   *
   * Um `font-size` em `vw` não resolve: a proporção entre altura e largura
   * de uma fonte manuscrita não é a de uma sans-serif, e o valor que
   * encaixa em 1920px sobra em 768px. Aqui o texto é desenhado num corpo
   * de referência, medido, e o corpo final sai da razão entre a largura
   * que ocupou e a que deveria ocupar.
   *
   * O reajuste em `fonts.ready` é obrigatório: até a fonte de assinatura
   * chegar, a medida é a da fonte de fallback, que tem outra largura por
   * completo.
   */
  useLayoutEffect(() => {
    const el = signatureRef.current;
    const box = signatureBoxRef.current;
    const footer = footerRef.current;
    if (!el || !box || !footer) return;

    const fit = () => {
      el.style.fontSize = `${BASE_SIGNATURE_REM}rem`;
      // Medido depois de repor o corpo de referência, senão a leitura já
      // viria com o fator anterior e a assinatura encolheria a cada chamada.
      const natural = el.getBoundingClientRect().width;
      if (!natural) return;
      const ratio = (box.clientWidth * 0.92) / natural;
      el.style.fontSize = `${Math.min(BASE_SIGNATURE_REM * ratio, MAX_SIGNATURE_REM)}rem`;
    };

    fit();
    document.fonts.ready.then(fit);

    const observer = new ResizeObserver(fit);
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  /**
   * A marca d'água é digitada quando o rodapé chega.
   *
   * Diferente da assinatura da seção Sobre, esta não é percorrida pela
   * rolagem: aqui é o fim da página, não há mais percurso para gastar — se
   * dependesse do scroll, ficaria pela metade para quem parasse no rodapé,
   * que é exatamente onde todo mundo para. Então ela roda no próprio
   * tempo, devagar, e só depois de o rodapé estar de fato em cena.
   *
   * A largura só pode ser medida depois de `fit` já ter rodado com a fonte
   * final (senão o alvo da animação sai do tamanho errado, da fonte de
   * fallback) — por isso espera o mesmo `document.fonts.ready` que `fit`
   * usa. Os dois `useLayoutEffect` do componente rodam em ordem de
   * declaração, então o `.then(fit)` do efeito acima sempre é registrado,
   * e portanto resolvido, antes do `.then` daqui.
   */
  useLayoutEffect(() => {
    const clip = signatureClipRef.current;
    if (!clip) return;

    const mm = gsap.matchMedia();

    mm.add(MOTION_OK, () => {
      gsap.set(clip, { width: 0 });

      let cancelled = false;
      let tween: gsap.core.Tween | undefined;

      document.fonts.ready.then(() => {
        if (cancelled || !clip.isConnected) return;

        const { width, ease } = typewriterTarget(clip, SITE.name.length);

        tween = gsap.fromTo(
          clip,
          { width: 0 },
          {
            width,
            ease,
            // Bem mais lenta que a da seção Sobre: é o último gesto da
            // página, e quem chegou aqui não está mais com pressa de avançar.
            duration: 3.4,
            // Devolve a largura livre ao terminar — sem isto, um resize
            // depois da digitação (fonte reajustada por `fit`) deixaria a
            // caixa presa no valor antigo, cortando ou sobrando espaço.
            onComplete: () => {
              clip.style.width = "auto";
            },
            scrollTrigger: {
              trigger: footerRef.current,
              // O rodapé é alto; `top 70%` deixa a assinatura já dentro da
              // tela quando a digitação começa, em vez de correr fora de
              // quadro.
              start: "top 70%",
              once: true,
            },
          },
        );
      });

      return () => {
        cancelled = true;
        tween?.kill();
      };
    });

    return () => mm.revert();
  }, []);

  /* Sem borda no topo: o CTA final já termina exatamente neste mist-50,
     então as duas seções se encontram na mesma cor. Um filete ali só
     marcaria uma emenda que, sem ele, ninguém percebe. */
  return (
    <footer
      ref={footerRef}
      className="relative isolate overflow-hidden bg-gradient-to-b from-mist-50 via-mist-50 to-white"
    >
      <div className="container-page relative pt-12 pb-8 sm:pt-14 sm:pb-9">
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

        {/*
          Faixa reservada para a assinatura em marca d'água.

          A altura é fixa e pequena de propósito — bem menor que a caixa
          natural da fonte de assinatura no tamanho máximo. Isso só é
          seguro porque a assinatura em si é uma camada `absolute` com
          `-z-10` (abaixo): o que sobra do traço além desta faixa
          simplesmente continua atrás das colunas, em vez de empurrá-las.
          Sem o z-index próprio, a caixa precisaria ser alta o bastante
          para conter a fonte inteira, que era o "espaço gigante" no
          rodapé em telas largas.
        */}
        <div className="relative h-14 sm:h-20 lg:h-28">
          <div
            ref={signatureBoxRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -bottom-1 -z-10 flex justify-center select-none"
          >
            {/* A caixa de fora recorta a largura para o efeito de
                digitação; a de dentro (`signatureRef`) é quem tem o
                `font-size` ajustado por `fit`, medida por dentro do
                recorte. */}
            <span ref={signatureClipRef} className="inline-block overflow-hidden align-bottom whitespace-nowrap">
              <SignatureText
                ref={signatureRef}
                className="font-signature leading-[1.22] text-blush-400/35"
                style={{ fontSize: `${BASE_SIGNATURE_REM}rem` }}
              />
            </span>
          </div>
        </div>

        <div className="border-soft-t relative flex flex-col items-start justify-between gap-3 pt-5 font-alt text-xs tracking-[0.01em] text-ink-500 sm:flex-row sm:items-center">
          <p>
            © {year} {SITE.name}, {SITE.role}. Todos os direitos reservados.
          </p>

          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4">
            <p>
              {SITE.crp} · Atendimento conforme as diretrizes do Conselho Federal de Psicologia
            </p>

            {/* `<button>`, e não `<a href="#">`: isto abre uma janela na
                própria página, não navega para lugar nenhum. Um link falso
                seria anunciado como destino por um leitor de tela. */}
            <button
              type="button"
              onClick={() => setPrivacyOpen(true)}
              className="shrink-0 font-semibold text-blush-600 underline decoration-blush-300 underline-offset-4 transition-colors hover:text-blush-700"
            >
              Política de Privacidade
            </button>
          </div>
        </div>
      </div>

      {/* Fora do `container-page` e do fluxo do rodapé: a janela é
          `fixed` e cobre a tela inteira, então não pertence a nenhuma
          coluna daqui. */}
      <PrivacyDialog open={privacyOpen} onClose={closePrivacy} />
    </footer>
  );
}
