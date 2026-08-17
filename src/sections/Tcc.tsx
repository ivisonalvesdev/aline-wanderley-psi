import { TCC_STEPS } from "@/constants/content";
import { SectionHeading } from "@/components/SectionHeading";
import { useReveal } from "@/hooks/useReveal";
import { rich } from "@/utils/rich";

interface StepProps {
  number: string;
  title: string;
  description: string;
}

/**
 * Etapa da abordagem, em vidro.
 *
 * Já teve inclinação 3D pelo cursor (`useTilt`), retirada por deixar o
 * texto do cartão com um borrão sutil e permanente — mesmo em repouso,
 * sem o mouse por perto. A causa é a combinação, não o vidro sozinho:
 * `backdrop-filter: blur()` sobre um elemento com `transform-style:
 * preserve-3d`/perspectiva ativa é um caso conhecido em que o navegador
 * rasteriza o conteúdo fora da grade de pixels. O `card-glass` (vidro
 * fosco do fundo) continua; o que saiu foi só o contexto 3D que vinha
 * junto com o giro.
 */
function TccStep({ number, title, description }: StepProps) {
  return (
    <li data-reveal>
      {/*
        `onTouchStart` vazio existe só para o Safari do iOS: ele só aplica
        `:active` a elementos "tocáveis" de verdade (links, botões) ou que
        tenham algum listener de toque — sem isto, `max-sm:active:` nunca
        dispararia lá. O `-webkit-tap-highlight-color` zerado evita que o
        retângulo cinza padrão do toque apareça por cima do gradiente.

        Nada disto usa `transform`: é opacidade de uma camada de fundo, o
        mesmo tipo de propriedade que o `backdrop-filter` do vidro já lida
        bem sozinho. Não reabre o problema do brilho antigo (ver comentário
        acima) porque não recria o contexto 3D que o causava.
      */}
      <article
        onTouchStart={() => {}}
        className="card-glass group relative h-full overflow-hidden p-6 [-webkit-tap-highlight-color:transparent] sm:p-8"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blush-200/60 via-cream-100/35 to-cloud-200/60 opacity-0 transition-opacity duration-300 ease-out max-sm:active:opacity-100"
        />
        <span
          aria-hidden="true"
          className="tabular relative block font-display text-4xl font-light tracking-[-0.03em] text-blush-300 transition-colors duration-500 group-hover:text-blush-400 sm:text-5xl"
        >
          {number}
        </span>
        <h3 className="relative mt-4 font-display text-lg font-semibold tracking-[-0.012em] text-ink-900 sm:text-xl">
          {title}
        </h3>
        <p className="relative mt-3 text-sm leading-[1.75] text-ink-700 sm:text-base">
          {rich(description)}
        </p>
      </article>
    </li>
  );
}

export function Tcc() {
  const ref = useReveal<HTMLElement>();

  return (
    <section
      ref={ref}
      id="tcc"
      aria-labelledby="tcc-titulo"
      className="section-y surface-soft relative overflow-hidden"
    >
      {/*
        Manchas de cor atrás dos cartões.

        Não são enfeite: vidro precisa de algo para desfocar. Sobre um
        branco liso, `backdrop-blur` não tem o que borrar e o cartão fica
        indistinguível de um retângulo branco comum. São elas que aparecem
        difusas através das peças e dão o material.
      */}
      <div
        aria-hidden="true"
        data-parallax="0.08"
        className="absolute top-10 -right-40 size-[320px] rounded-full bg-gradient-to-bl from-cloud-200/70 to-transparent blur-3xl sm:size-[480px]"
      />
      <div
        aria-hidden="true"
        data-parallax="-0.06"
        className="absolute bottom-0 -left-32 size-[280px] rounded-full bg-gradient-to-tr from-blush-200/60 to-transparent blur-3xl sm:size-[420px]"
      />
      <div
        aria-hidden="true"
        data-parallax="0.04"
        className="absolute bottom-24 left-1/2 size-[240px] -translate-x-1/2 rounded-full bg-cream-200/50 blur-3xl sm:size-[360px]"
      />

      <div className="container-page relative">
        <SectionHeading
          eyebrow="A abordagem"
          width="wide"
          title={"**Terapia Cognitivo-Comportamental,**\nexplicada com calma"}
          description="Uma abordagem estruturada, colaborativa e validada pela ciência, em que cada passo do processo faz sentido para quem o vive."
        />

        <ol className="mt-12 grid gap-5 sm:mt-14 sm:gap-6 md:grid-cols-3">
          {TCC_STEPS.map((step) => (
            <TccStep
              key={step.number}
              number={step.number}
              title={step.title}
              description={step.description}
            />
          ))}
        </ol>
      </div>
    </section>
  );
}
