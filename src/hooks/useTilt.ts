import { useLayoutEffect, useRef, type RefObject } from "react";
import { gsap, POINTER_FINE } from "@/utils/gsap";

interface TiltOptions {
  /** Inclinação máxima, em graus, nas bordas do elemento. */
  max?: number;
  /** Distância do observador: quanto menor, mais dramática a perspectiva. */
  perspective?: number;
  /** Crescimento no hover — 1 desliga. */
  scale?: number;
}

/**
 * Inclinação 3D seguindo o cursor, com brilho de vidro acompanhando.
 *
 * O elemento gira em torno dos dois eixos conforme a posição do ponteiro
 * dentro dele: cursor à direita inclina para a direita, acima inclina para
 * cima. Como o giro é proporcional à distância até o centro, a superfície
 * parece seguir a mão em vez de trocar de estado.
 *
 * O hook também alimenta `--glare-x` / `--glare-y`, que o CSS usa para
 * posicionar o reflexo. É esse reflexo que faz o cartão ler como vidro e
 * não como um retângulo girando: sem ele, a inclinação sozinha parece um
 * truque de CSS.
 *
 * 8 graus é o teto por um motivo: acima disso o texto do cartão começa a
 * distorcer visivelmente e a leitura sofre — o efeito passa a custar mais
 * do que entrega.
 */
export function useTilt<T extends HTMLElement>({
  max = 8,
  perspective = 1000,
  scale = 1.02,
}: TiltOptions = {}): RefObject<T | null> {
  const ref = useRef<T>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mm = gsap.matchMedia();

    mm.add(POINTER_FINE, () => {
      gsap.set(el, { transformPerspective: perspective, transformStyle: "preserve-3d" });

      const rotateX = gsap.quickTo(el, "rotationX", { duration: 0.6, ease: "power3.out" });
      const rotateY = gsap.quickTo(el, "rotationY", { duration: 0.6, ease: "power3.out" });
      const scaleTo = gsap.quickTo(el, "scale", { duration: 0.6, ease: "power3.out" });
      const glareX = gsap.quickSetter(el, "--glare-x", "%");
      const glareY = gsap.quickSetter(el, "--glare-y", "%");

      let frame = 0;
      let pointerX = 0;
      let pointerY = 0;

      const apply = () => {
        frame = 0;
        const box = el.getBoundingClientRect();
        // -0.5 a 0.5 em cada eixo, a partir do centro do cartão.
        const relativeX = (pointerX - box.left) / box.width - 0.5;
        const relativeY = (pointerY - box.top) / box.height - 0.5;

        // O eixo Y é invertido: mouse acima do centro deve levantar a
        // borda de cima, o que em rotationX é um ângulo positivo.
        rotateX(-relativeY * max * 2);
        rotateY(relativeX * max * 2);
        glareX((relativeX + 0.5) * 100);
        glareY((relativeY + 0.5) * 100);
      };

      const onPointerMove = (event: PointerEvent) => {
        pointerX = event.clientX;
        pointerY = event.clientY;
        if (!frame) frame = requestAnimationFrame(apply);
      };

      const onPointerEnter = () => {
        el.dataset.tilting = "true";
        scaleTo(scale);
      };

      const onPointerLeave = () => {
        delete el.dataset.tilting;
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        rotateX(0);
        rotateY(0);
        scaleTo(1);
      };

      el.addEventListener("pointermove", onPointerMove, { passive: true });
      el.addEventListener("pointerenter", onPointerEnter);
      el.addEventListener("pointerleave", onPointerLeave);

      return () => {
        el.removeEventListener("pointermove", onPointerMove);
        el.removeEventListener("pointerenter", onPointerEnter);
        el.removeEventListener("pointerleave", onPointerLeave);
        if (frame) cancelAnimationFrame(frame);
        delete el.dataset.tilting;
        gsap.set(el, { rotationX: 0, rotationY: 0, scale: 1, clearProps: "transformPerspective" });
      };
    });

    return () => mm.revert();
  }, [max, perspective, scale]);

  return ref;
}
