import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

/**
 * No celular, a barra de endereço recolhe e reaparece durante a rolagem, e
 * cada mudança altera a altura da viewport. Por padrão o ScrollTrigger
 * trata isso como redimensionamento e recalcula tudo — no meio de uma
 * seção travada, o recálculo aparece como um solavanco.
 *
 * Com isto ele passa a ignorar variações de altura em toque, refazendo as
 * medidas só quando a largura muda de fato (rotação da tela).
 */
ScrollTrigger.config({ ignoreMobileResize: true });

/** Media query única para respeitar usuários que preferem menos movimento. */
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";

/** Movimento reservado a quem tem mouse: nada disso faz sentido no toque. */
export const POINTER_FINE = "(pointer: fine) and (prefers-reduced-motion: no-preference)";

/** Defaults compartilhados por todas as animações do site. */
export const EASE = "power3.out";
export const DURATION = 1;

/**
 * Inércia dos reveals ligados ao scroll.
 *
 * Com `scrub: true` a animação gruda no scroll e reproduz cada tremida da
 * roda do mouse. Um número transforma o scrub em perseguição amortecida:
 * o elemento leva ~0.7s para alcançar a posição que o scroll pede, o que
 * lê como "seguindo o movimento" em vez de "preso a ele".
 */
export const SCRUB = 0.7;

export { gsap, ScrollTrigger, SplitText };
