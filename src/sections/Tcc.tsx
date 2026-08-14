import { TCC_STEPS } from "@/constants/content";
import { SectionHeading } from "@/components/SectionHeading";
import { useReveal } from "@/hooks/useReveal";
import { useTilt } from "@/hooks/useTilt";
import { rich } from "@/utils/rich";

interface StepProps {
  number: string;
  title: string;
  description: string;
}

/**
 * Etapa da abordagem, em vidro e com inclinação 3D.
 *
 * A perspectiva fica no `<li>` e a rotação no `<article>`: se as duas
 * vivessem no mesmo elemento, cada cartão giraria em torno do ponto de
 * fuga do próprio centro e os três se moveriam como se estivessem em
 * telas separadas. Com o pai definindo a perspectiva, eles compartilham
 * um único observador — que é o que faz a fila parecer um objeto só.
 *
 * O `translateZ` dos filhos os ergue do plano do cartão: no giro, número
 * e título flutuam alguns pixels à frente do vidro. É esse deslocamento
 * relativo que o olho lê como profundidade real.
 */
function TccStep({ number, title, description }: StepProps) {
  const tiltRef = useTilt<HTMLElement>({ max: 7, perspective: 1100, scale: 1.025 });

  return (
    <li data-reveal className="[perspective:1200px]">
      <article
        ref={tiltRef}
        className="card-glass group relative h-full p-6 will-change-transform [transform-style:preserve-3d] sm:p-8"
      >
        <span
          aria-hidden="true"
          className="depth-3 tabular block font-display text-4xl font-light tracking-[-0.03em] text-blush-300 transition-colors duration-500 group-hover:text-blush-400 sm:text-5xl"
        >
          {number}
        </span>
        <h3 className="depth-2 mt-4 font-display text-lg font-semibold tracking-[-0.012em] text-ink-900 sm:text-xl">
          {title}
        </h3>
        <p className="depth-1 mt-3 text-sm leading-[1.75] text-ink-700 sm:text-base">
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
