import type { ReactNode } from "react";
import { whatsappUrl } from "@/constants/site";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { cn } from "@/utils/cn";

interface WhatsAppCtaProps {
  children: ReactNode;
  variant?: "primary" | "outline";
  size?: "md" | "lg";
  className?: string;
  /** Contexto para analytics/acessibilidade, ex.: "hero", "header". */
  ariaLabel?: string;
  /** Mensagem já preenchida na conversa. Omitir usa a padrão do site. */
  message?: string;
}

/**
 * CTA principal do site — abre conversa no WhatsApp.
 * Único ponto de conversão; qualquer ajuste de estilo acontece aqui.
 */
export function WhatsAppCta({
  children,
  variant = "primary",
  size = "md",
  className,
  ariaLabel = "Agendar atendimento pelo WhatsApp",
  message,
}: WhatsAppCtaProps) {
  return (
    <a
      href={whatsappUrl(message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className={cn(
        // Montserrat com tracking positivo: em botão, a letra ligeiramente
        // aberta lê como convite; apertada, como aviso.
        "group inline-flex items-center justify-center gap-2.5 rounded-full font-alt font-semibold tracking-[0.012em]",
        "transition-all duration-300 ease-out will-change-transform",
        "hover:-translate-y-0.5 active:translate-y-0",
        variant === "primary" &&
          "bg-blush-600 text-white shadow-[0_12px_32px_-12px_rgb(196_64_95_/_0.55)] hover:bg-blush-700 hover:shadow-[0_16px_40px_-12px_rgb(196_64_95_/_0.65)]",
        variant === "outline" &&
          "border border-mist-300 bg-white/70 text-ink-900 backdrop-blur-sm hover:border-blush-300 hover:bg-blush-50",
        size === "md" && "px-5 py-3 text-sm sm:px-6",
        size === "lg" && "px-6 py-3.5 text-[0.9375rem] sm:px-8 sm:py-4 sm:text-base",
        className,
      )}
    >
      <WhatsAppIcon
        className={cn(
          "shrink-0 transition-transform duration-300 group-hover:scale-110",
          size === "md" ? "size-4" : "size-5",
        )}
      />
      {children}
    </a>
  );
}
