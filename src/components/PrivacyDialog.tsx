import { useCallback, useEffect, useRef } from "react";
import { X, ShieldCheck } from "lucide-react";
import {
  PRIVACY_INTRO,
  PRIVACY_SECTIONS,
  PRIVACY_UPDATED_AT,
} from "@/constants/privacy";
import { SITE } from "@/constants/site";
import { rich } from "@/utils/rich";

interface PrivacyDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Janela da Política de Privacidade.
 *
 * É uma sobreposição, e não uma página à parte, por um motivo de leitura:
 * quem clica no rodapé está checando uma dúvida pontual, não trocando de
 * assunto. Abrindo por cima, a pessoa fecha e continua exatamente de onde
 * parou — enquanto uma rota nova a obrigaria a voltar e reencontrar o
 * ponto da página em que estava.
 *
 * O documento em si mora em `constants/privacy.ts`; aqui só existe a
 * apresentação.
 */
export function PrivacyDialog({ open, onClose }: PrivacyDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  /** Devolve o foco a quem abriu — normalmente o link do rodapé. */
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    openerRef.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    /**
     * Prende o Tab dentro da janela.
     *
     * Sem isto, seguir tabulando levaria o foco para os links da página
     * atrás do escurecido — invisíveis, mas ainda alcançáveis —, e a
     * pessoa perderia a referência de onde está. É a diferença entre uma
     * sobreposição e uma janela de verdade.
     */
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusable = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      openerRef.current?.focus();
    };
  }, [open, onClose]);

  const stop = useCallback(
    (event: React.MouseEvent) => event.stopPropagation(),
    [],
  );

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-100 flex items-end justify-center bg-ink-900/70 p-0 backdrop-blur-md motion-safe:animate-fade-in-fast sm:items-center sm:p-6"
    >
      {/*
        No celular a janela encosta na base da tela e sobe até 92% dela —
        formato de folha, que é o gesto esperado ali. A partir de sm ela
        recentraliza como caixa.
      */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacidade-titulo"
        onClick={stop}
        className="relative flex max-h-[92svh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-[0_40px_120px_-40px_rgb(48_42_44_/_0.6)] sm:max-h-[86svh] sm:rounded-3xl"
      >
        {/* Cabeçalho fixo: o documento é longo, e sem ele o botão de
            fechar sairia de vista já no primeiro rolar. */}
        <header className="flex items-start gap-4 border-b border-mist-200 bg-blush-50/60 px-6 py-5 sm:px-8">
          <span
            aria-hidden="true"
            className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-blush-100 text-blush-500"
          >
            <ShieldCheck className="size-5" />
          </span>

          <div className="min-w-0 flex-1">
            <h2
              id="privacidade-titulo"
              className="font-display text-lg font-semibold tracking-[-0.012em] text-ink-900 sm:text-xl"
            >
              Política de Privacidade
            </h2>
            <p className="mt-1 font-alt text-xs text-ink-500">
              Atualizada em {PRIVACY_UPDATED_AT}
            </p>
          </div>

          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Fechar a política de privacidade"
            className="-mt-1 -mr-2 inline-flex size-10 shrink-0 items-center justify-center rounded-full text-ink-500 transition-colors duration-300 hover:bg-white hover:text-ink-900"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        {/* `overscroll-contain` impede que, ao chegar ao fim do documento,
            a rolagem continue na página atrás da janela. */}
        <div className="overflow-y-auto overscroll-contain px-6 py-6 sm:px-8 sm:py-7">
          <p className="leading-[1.75] text-ink-700">{PRIVACY_INTRO}</p>

          <div className="mt-7 space-y-7">
            {PRIVACY_SECTIONS.map((section) => (
              <section key={section.title}>
                <h3 className="font-display text-[0.9375rem] font-semibold tracking-[-0.01em] text-ink-900 sm:text-base">
                  {section.title}
                </h3>

                <div className="mt-2.5 space-y-3">
                  {section.body.map((paragraph) => (
                    <p
                      key={paragraph.slice(0, 32)}
                      className="text-sm leading-[1.75] text-ink-700 [--rich-weight:600]"
                    >
                      {rich(paragraph)}
                    </p>
                  ))}
                </div>

                {section.items && (
                  <ul className="mt-3 space-y-2">
                    {section.items.map((item) => (
                      <li
                        key={item.slice(0, 32)}
                        className="flex gap-2.5 text-sm leading-[1.7] text-ink-700"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-[0.55em] size-1.5 shrink-0 rounded-full bg-blush-300"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </div>

        <footer className="border-t border-mist-200 bg-mist-50 px-6 py-4 sm:px-8">
          <p className="font-alt text-xs leading-relaxed text-ink-500">
            Dúvidas sobre esta política?{" "}
            <a
              href={`mailto:${SITE.email}`}
              className="font-semibold text-blush-600 underline decoration-blush-300 underline-offset-4 transition-colors hover:text-blush-700"
            >
              {SITE.email}
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
