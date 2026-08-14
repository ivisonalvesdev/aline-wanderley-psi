import type { ComponentPropsWithRef } from "react";
import { SITE } from "@/constants/site";
import { cn } from "@/utils/cn";

/**
 * O nome da Aline pronto para ser revelado como se estivesse sendo
 * digitado — usado no Preloader e na marca d'água do rodapé (a assinatura
 * da seção Sobre voltou a ser texto simples, com o reveal padrão do
 * site — ver `About.tsx`).
 *
 * Só a marcação mora aqui. A largura começa livre (`auto`); quem chama é
 * quem fecha para `0` e anima até o natural, porque o gatilho e o tempo
 * da revelação mudam de um lugar para o outro. O que precisa ser igual
 * nos dois — a caixa sem quebra de linha e com overflow escondido para a
 * largura ter o que recortar — está aqui para não repetir duas vezes.
 */
export function SignatureText({ className, ...props }: ComponentPropsWithRef<"span">) {
  return (
    <span
      {...props}
      className={cn("inline-block overflow-hidden align-bottom whitespace-nowrap", className)}
    >
      {SITE.name}
    </span>
  );
}
