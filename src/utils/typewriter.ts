import { gsap } from "@/utils/gsap";

/**
 * Fecha um texto para largura zero e mede o natural por trás do clipe —
 * o mesmo truque do `width` + `steps()` do CSS, só que resolvido pelo GSAP
 * para poder entrar em qualquer timeline ou `scrollTrigger` do chamador.
 *
 * A medida só é confiável com a fonte final já carregada (métricas de
 * fallback dão outra largura) — cabe a quem chama medir depois de
 * `document.fonts.ready`, como já se faz para o resto do texto do site.
 *
 * `chars` vira o número de degraus: um por letra, para o movimento saltar
 * de posição em posição em vez de esticar suave — é o que lê como "sendo
 * digitado" e não como "abrindo uma cortina".
 */
export function typewriterTarget(el: HTMLElement, chars: number) {
  gsap.set(el, { width: 0 });
  return { width: el.scrollWidth, ease: `steps(${Math.max(1, chars)})` };
}
