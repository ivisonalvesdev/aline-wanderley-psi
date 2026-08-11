import { cn } from "@/utils/cn";
import { rich } from "@/utils/rich";

interface SectionHeadingProps {
  eyebrow: string;
  /** Aceita `**destaque**` — ver `utils/rich.tsx`. */
  title: string;
  description?: string;
  align?: "left" | "center";
  /**
   * `wide` alarga a caixa do título.
   *
   * Existe para títulos que contêm uma expressão que não pode quebrar —
   * "Terapia Cognitivo-Comportamental," sozinha já passa de 780px no corpo
   * máximo. Na medida padrão ela partiria no hífen, o que é justamente o
   * que a quebra manual tenta evitar.
   */
  width?: "default" | "wide";
  className?: string;
}

/** Cabeçalho padrão de seção — hierarquia tipográfica consistente. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  width = "default",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        width === "wide" ? "max-w-3xl lg:max-w-5xl" : "max-w-2xl xl:max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      <p data-reveal="fast" className="eyebrow mb-4 text-blush-600">
        {eyebrow}
      </p>
      {/* `text-balance` distribui as linhas por conta própria e brigaria
          com uma quebra escrita à mão — quando o título traz `\n`, quem
          manda é a quebra. */}
      <h2
        data-reveal
        className={cn(
          "heading-section font-display font-medium text-ink-900",
          !title.includes("\n") && "text-balance",
        )}
      >
        {rich(title)}
      </h2>
      {description && (
        <p data-reveal className="lede mt-5 text-ink-700">
          {rich(description)}
        </p>
      )}
    </div>
  );
}
