import { Suspense, lazy, useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";

const AuraScene = lazy(() => import("./AuraScene"));

/**
 * Carrega a cena WebGL de forma adiada (após o navegador ficar ocioso),
 * mantendo o gradiente CSS como base — o Three.js entra como camada
 * de profundidade, nunca como dependência do primeiro paint.
 *
 * Com prefers-reduced-motion, a cena nem é baixada.
 */
export function AuraBackground() {
  const reducedMotion = usePrefersReducedMotion();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (reducedMotion) return;

    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(() => setReady(true), { timeout: 2500 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(() => setReady(true), 1200);
    return () => window.clearTimeout(id);
  }, [reducedMotion]);

  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10">
      {/* Base CSS — visível de imediato e fallback permanente */}
      <div className="absolute inset-0 bg-gradient-to-br from-blush-100 via-white to-cloud-100" />
      {ready && (
        <Suspense fallback={null}>
          <div className="absolute inset-0 animate-fade-in">
            <AuraScene />
          </div>
        </Suspense>
      )}
      {/* Véu superior para garantir contraste do conteúdo */}
      <div className="absolute inset-0 bg-white/30" />
    </div>
  );
}
