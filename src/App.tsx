import { useCallback, useEffect, useState } from "react";
import { ScrollTrigger } from "@/utils/gsap";
import { Preloader } from "@/components/Preloader";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { Hero } from "@/sections/Hero";
import { Specialties } from "@/sections/Specialties";
import { About } from "@/sections/About";
import { Tcc } from "@/sections/Tcc";
import { Parents } from "@/sections/Parents";
import { Modalities } from "@/sections/Modalities";
import { Differentials } from "@/sections/Differentials";
import { Education } from "@/sections/Education";
import { Faq } from "@/sections/Faq";
import { FinalCta } from "@/sections/FinalCta";

export default function App() {
  const [introReady, setIntroReady] = useState(false);
  const handlePreloaderComplete = useCallback(() => setIntroReady(true), []);

  /**
   * As seções montam seus gatilhos de scroll antes de as fontes trocarem
   * do fallback para a Poppins — e essa troca muda a altura de cada bloco
   * de texto, deslocando tudo o que vem abaixo. Sem este recálculo, os
   * reveals do fim da página disparam nas coordenadas erradas.
   *
   * O preloader só libera a página depois de `document.fonts.ready`, então
   * este é exatamente o momento em que as medidas já são as definitivas.
   */
  useEffect(() => {
    if (!introReady) return;
    ScrollTrigger.refresh();
  }, [introReady]);

  return (
    <>
      {/* Link de pulo — navegação por teclado */}
      <a
        href="#inicio"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded-full focus:bg-white focus:px-5 focus:py-2.5 focus:text-sm focus:font-medium focus:text-ink-900 focus:shadow-lg"
      >
        Pular para o conteúdo
      </a>

      <Preloader onComplete={handlePreloaderComplete} />
      <Header />

      <main>
        <Hero introReady={introReady} />
        <Specialties />
        <About />
        <Tcc />
        <Parents />
        <Modalities />
        <Differentials />
        <Education />
        <Faq />
        <FinalCta />
      </main>

      <Footer />
      <WhatsAppFloat />
    </>
  );
}
