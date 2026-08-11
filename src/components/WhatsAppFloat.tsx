import { WHATSAPP_URL } from "@/constants/site";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { cn } from "@/utils/cn";

/**
 * Botão flutuante do WhatsApp — atalho de conversão sempre à mão,
 * fixo no canto inferior direito em toda a página.
 *
 * Fica em z-70: acima do conteúdo, abaixo do header (z-80) e do
 * preloader (z-100), para não vazar por cima do menu mobile aberto.
 */
export function WhatsAppFloat() {
  return (
    <div
      className={cn(
        "fixed right-5 z-70 motion-safe:animate-fade-in sm:right-7",
        // Respeita a barra de gestos do iOS
        "bottom-[calc(1.25rem+env(safe-area-inset-bottom))]",
        "sm:bottom-[calc(1.75rem+env(safe-area-inset-bottom))]",
      )}
    >
      {/*
        Anéis do pulso. Vêm antes do link no DOM e são posicionados —
        assim o botão é pintado por cima e o que sobra deles aparece
        como halo. A defasagem do segundo cria a pulsação contínua.

        O delay vai inline de propósito: `animate-*` é o shorthand
        `animation`, emitido depois das propriedades arbitrárias no CSS
        do Tailwind, e zeraria um `[animation-delay:…]` em classe.
      */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-full bg-[#25D366] motion-safe:animate-pulse-ring"
      />
      <span
        aria-hidden="true"
        style={{ animationDelay: "1.3s" }}
        className="pointer-events-none absolute inset-0 rounded-full bg-[#25D366] motion-safe:animate-pulse-ring"
      />

      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Conversar pelo WhatsApp"
        className="group relative grid size-12 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_12px_32px_-8px_rgb(37_211_102_/_0.55)] ring-1 ring-white/45 transition-all duration-300 ease-out hover:scale-105 hover:bg-[#1FBE5B] hover:shadow-[0_16px_40px_-8px_rgb(37_211_102_/_0.7)] active:scale-95 sm:size-[3.25rem]"
      >
        <WhatsAppIcon className="size-6 transition-transform duration-300 group-hover:scale-110 sm:size-7" />
      </a>
    </div>
  );
}
