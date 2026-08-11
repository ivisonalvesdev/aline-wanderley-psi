import { useState } from "react";
import { Plus } from "lucide-react";
import { FAQ_ITEMS } from "@/constants/content";
import { SectionHeading } from "@/components/SectionHeading";
import { useReveal } from "@/hooks/useReveal";
import { cn } from "@/utils/cn";

export function Faq() {
  /*
    Única seção fora do reveal amarrado ao scroll.

    Aqui o conteúdo é operado, não percorrido: abrir uma pergunta muda a
    altura de todas as que estão abaixo, e um progresso preso à rolagem
    ficaria recalculando posições a cada clique — as respostas apareceriam
    e sumiriam enquanto a pessoa lê. O bloco entra de uma vez e fica.
  */
  const ref = useReveal<HTMLElement>({ scrub: false });
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section ref={ref} id="faq" aria-labelledby="faq-titulo" className="section-y surface-cream">
      <div className="container-page">
        <SectionHeading
          eyebrow="Dúvidas frequentes"
          title="Tudo o que você precisa saber **antes de começar**"
          description="Se a sua dúvida não estiver aqui, é só chamar no WhatsApp — respondo pessoalmente."
        />

        <div className="mx-auto mt-12 max-w-3xl space-y-3 sm:mt-14">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = open === index;
            return (
              <div
                key={item.question}
                data-reveal
                className={cn(
                  "card-soft overflow-hidden transition-all duration-500",
                  isOpen && "shadow-[0_24px_56px_-24px_rgb(196_64_95_/_0.25)]",
                )}
              >
                <h3>
                  <button
                    type="button"
                    id={`faq-pergunta-${index}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-resposta-${index}`}
                    onClick={() => setOpen(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left sm:gap-4 sm:px-8 sm:py-5"
                  >
                    <span
                      className={cn(
                        "text-sm font-medium tracking-[-0.008em] transition-colors duration-300 sm:text-lg",
                        isOpen ? "text-blush-700" : "text-ink-900",
                      )}
                    >
                      {item.question}
                    </span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full border border-mist-200 text-ink-500 transition-all duration-500 ease-out",
                        isOpen && "rotate-45 border-blush-300 bg-blush-50 text-blush-600",
                      )}
                    >
                      <Plus className="size-4" />
                    </span>
                  </button>
                </h3>
                <div
                  id={`faq-resposta-${index}`}
                  role="region"
                  aria-labelledby={`faq-pergunta-${index}`}
                  className={cn(
                    "grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                >
                  <div className="min-h-0 overflow-hidden">
                    <p
                      className={cn(
                        "px-5 pb-5 text-sm leading-[1.75] text-ink-500 transition-opacity duration-500 sm:px-8 sm:pb-6 sm:text-base",
                        isOpen ? "opacity-100" : "opacity-0",
                      )}
                    >
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
