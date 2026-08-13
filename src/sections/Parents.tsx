import { useLayoutEffect } from "react";
import { Check } from "lucide-react";
import { PARENTS } from "@/constants/content";
import { WhatsAppCta } from "@/components/WhatsAppCta";
import { useReveal } from "@/hooks/useReveal";
import { rich } from "@/utils/rich";
import { gsap, MOTION_OK } from "@/utils/gsap";
import parentalVideo from "@assets/orientacao-parental.mp4";

export function Parents() {
  const ref = useReveal<HTMLElement>();

  /**
   * Ciclo de vida do vídeo de fundo.
   *
   * Fica separado da timeline de entrada de propósito: a lista é animada só
   * onde há `prefers-reduced-motion: no-preference`, e o vídeo tem regra
   * própria — quem pediu menos movimento continua vendo o cenário, parado.
   */
  useLayoutEffect(() => {
    const section = ref.current;
    if (!section) return;

    const video = section.querySelector<HTMLVideoElement>("[data-parental-video]");
    if (!video) return;

    if (!MOTION_OK) {
      // Sem animação o vídeo vira fotografia: carrega o suficiente para o
      // primeiro quadro pintar e para por aí.
      video.preload = "metadata";
      video.load();
      return;
    }

    // O atributo no JSX já basta para os navegadores atuais, mas o autoplay
    // só é liberado se a propriedade estiver de pé no momento do `play()`.
    video.muted = true;
    video.loop = true;

    const play = () => void video.play().catch(() => {});
    const download = () => {
      if (video.preload === "auto") return;
      video.preload = "auto";
      video.load();
    };

    /**
     * Quando o vídeo toca — e o que ele deliberadamente ignora.
     *
     * A rolagem não conduz o vídeo: não há `scrub`, o loop corre no ritmo
     * dele e a página não tem voz sobre em que quadro ele está. A única
     * decisão tomada aqui é se vale manter um decodificador de vídeo aberto
     * neste momento.
     *
     * Quem observa é o `IntersectionObserver`, e não o ScrollTrigger, por
     * um motivo concreto: esta seção é presa (`pin`), e durante o pin o
     * GSAP troca a posição do elemento e insere um espaçador. Gatilhos
     * medidos em coordenadas de rolagem passam a depender dessa
     * reorganização — foi o que deixou o vídeo parado na volta. O
     * observador lê a geometria real do elemento na tela e não se importa
     * com pin nenhum.
     *
     * O `rootMargin` é o que separa "toca quando aparece" de "já está
     * tocando quando aparece": ele infla a área de observação em uma tela
     * inteira para cima e para baixo, então o loop começa enquanto a seção
     * ainda está fora de quadro. Descendo ou subindo, quando ela entra o
     * movimento já está em curso — sem o primeiro quadro congelado
     * denunciando o truque.
     */
    let porPerto = false;

    const playback = new IntersectionObserver(
      ([entry]) => {
        porPerto = entry.isIntersecting;
        if (porPerto) play();
        else video.pause();
      },
      { rootMargin: "100% 0px 100% 0px" },
    );
    playback.observe(section);

    /*
      O arquivo não pode sair junto com o resto da página: a seção fica no
      meio do documento e quem não chega nela não deveria pagar por ela. O
      download começa a duas telas de distância — não uma: ele precisa
      terminar antes do observador de cima, que é quem manda tocar.
    */
    const warmup = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        download();
        warmup.disconnect();
      },
      { rootMargin: "200% 0px 200% 0px" },
    );
    warmup.observe(section);

    /*
      Aba em segundo plano: o navegador reduz o ritmo por conta própria, mas
      não solta o decodificador. Pausar solta.

      Na volta é preciso saber se a seção ainda está por perto, e o
      observador não dispara de novo só porque a aba voltou — a geometria
      não mudou. Daí a bandeira mantida pelo próprio callback acima.
    */
    const onVisibility = () => {
      if (document.hidden) video.pause();
      else if (porPerto) play();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      playback.disconnect();
      warmup.disconnect();
      video.pause();
    };
  }, [ref]);

  useLayoutEffect(() => {
    const section = ref.current;
    if (!section) return;

    const mm = gsap.matchMedia();

    /**
     * Entrada da lista, item a item, vinda da direita.
     *
     * `stagger: 0.55` contra `duration: 1` deixa as entradas se
     * sobrepondo pela metade: uma peça ainda está chegando quando a
     * seguinte parte, o que dá continuidade ao conjunto em vez de seis
     * animações isoladas em fila.
     */
    const buildEntrance = (scrollTrigger: gsap.TimelineVars["scrollTrigger"]) => {
      const items = section.querySelectorAll<HTMLElement>("[data-parent-item]");
      if (items.length === 0) return;

      gsap.timeline({ scrollTrigger }).fromTo(
        items,
        { autoAlpha: 0, x: 96 },
        {
          autoAlpha: 1,
          x: 0,
          duration: 1,
          ease: "power2.out",
          stagger: 0.55,
        },
      );
    };

    /**
     * A seção trava e a lista se escreve com a página parada, em qualquer
     * tela — mesma lógica de ancoragem do Sobre (ver a nota lá): cabendo
     * na tela, para centralizada; não cabendo, alinha o fim, que é onde a
     * lista fica no empilhamento de mobile.
     *
     * O percurso é dimensionado por item, e não em bloco: cada benefício
     * ganha uma fração de tela para entrar, o que separa "aparecendo
     * devagar" de "travado esperando". No celular a fração é menor —
     * rolar com o dedo custa mais do que girar a roda do mouse.
     */
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      buildEntrance({
        trigger: section,
        start: () =>
          section.offsetHeight > window.innerHeight * 0.96 ? "bottom bottom" : "center center",
        end: () => {
          const perItem = window.innerWidth < 640 ? 0.24 : 0.35;
          return `+=${window.innerHeight * perItem * PARENTS.benefits.length}`;
        },
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        scrub: 1,
        invalidateOnRefresh: true,
        // Ver a nota em About.tsx: pins são medidos primeiro para que o
        // resto da página já considere o espaço que criam.
        refreshPriority: 1,
      });
    });

    return () => mm.revert();
  }, [ref]);

  return (
    <section
      ref={ref}
      id="para-pais"
      aria-labelledby="pais-titulo"
      className="section-y surface-blush relative overflow-hidden"
    >
      {/*
        Cenário da seção.

        Entra em `-z-10`, atrás do conteúdo e à frente do `surface-blush`
        da própria seção — que continua no lugar como rede de segurança:
        é ele quem aparece enquanto o vídeo não baixou (o `preload` começa
        em `none`), se a rede falhar, ou se o navegador recusar o autoplay.
        Em qualquer um desses casos a seção volta a ser exatamente o que
        era antes, sem buraco nem retângulo preto.
      */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <video
          data-parental-video
          src={parentalVideo}
          muted
          loop
          playsInline
          preload="none"
          /*
            O quadro é 16:9 e a âncora resolve o recorte que o `cover`
            produz. No desktop a seção tem proporção parecida com a do
            vídeo, então quase não há corte e o centro serve.

            No celular a seção é bem mais alta que larga: o `cover` escala
            pela altura — que passa a caber inteira, e por isso o segundo
            valor não muda nada aqui — e descarta a maior parte da
            horizontal, sobrando uma fatia estreita. 80% arrasta o quadro
            para a esquerda até essa fatia cair sobre o cérebro, que é o que
            se quer ver em movimento. Como ele ocupa a faixa do meio na
            vertical, sobra fundo claro em cima e embaixo — o corte mostra a
            silhueta, não uma mancha rosa preenchendo a tela.
          */
          className="size-full object-cover object-[80%_50%] lg:object-center"
        />
        <div className="parental-veil absolute inset-0" />
      </div>

      <div className="container-page grid items-center gap-12 sm:gap-14 lg:grid-cols-2 lg:gap-16 xl:gap-20">
        <div className="lg:max-w-xl xl:max-w-2xl">
          <p data-reveal="fast" className="eyebrow mb-4 text-blush-600">
            {PARENTS.eyebrow}
          </p>
          <h2
            id="pais-titulo"
            data-reveal
            className="heading-section font-display font-medium text-ink-900 text-balance"
          >
            {rich(PARENTS.title)}
          </h2>
          <p data-reveal className="lede mt-6 text-ink-700 [--rich-weight:500]">
            {rich(PARENTS.description)}
          </p>
          <div data-reveal className="mt-8">
            <WhatsAppCta ariaLabel="Conversar sobre orientação parental pelo WhatsApp">
              Quero conversar sobre meu filho
            </WhatsAppCta>
          </div>
        </div>

        {/* A lista não usa `data-reveal`: sua entrada é conduzida pela
            timeline acima, que precisa dos seis itens em uma sequência
            única para escaloná-los. */}
        <ul className="grid gap-3 sm:gap-3.5 lg:ml-auto lg:w-full lg:max-w-xl xl:max-w-2xl 2xl:max-w-3xl">
          {PARENTS.benefits.map((benefit) => (
            /*
              O `<li>` só carrega a animação de entrada, que é escrita em
              `transform` pelo GSAP. O cartão e o seu hover ficam no wrapper
              de dentro: transform de classe no mesmo nó seria apagado pelo
              inline do GSAP assim que a entrada terminasse — mesma
              separação usada nas peças de montar do Sobre e nos cartões da
              Formação.
            */
            <li key={benefit} data-parent-item>
              <div
                /*
                  Sem `backdrop-blur` desde que o fundo virou vídeo: o filtro
                  é recalculado a cada quadro que entra atrás dele, seis
                  vezes (uma por card), com a seção presa na tela. Foi a
                  mesma troca feita nos cards da Formação. A opacidade sobe
                  de 70 para 80 para compensar a perda do desfoque na
                  legibilidade.

                  No hover o cartão desliza um pouco para a direita e sobe,
                  como se destacasse da pilha. O deslocamento lateral é o
                  maior dos dois de propósito: a lista inteira entrou vindo
                  da direita, então é esse o eixo que a seção já estabeleceu
                  como o do movimento.
                */
                className="group flex items-start gap-3.5 rounded-2xl border border-white/70 bg-white/80 p-4 transition-[transform,background-color,box-shadow] duration-300 ease-out hover:-translate-y-0.5 hover:translate-x-1.5 hover:bg-white hover:shadow-[0_18px_40px_-22px_rgb(48_42_44_/_0.45)] sm:gap-4 sm:p-5"
              >
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-blush-100 text-blush-600 transition-transform duration-300 ease-out group-hover:scale-110">
                  <Check className="size-3.5" aria-hidden="true" />
                </span>
                <p className="text-sm leading-relaxed text-ink-700 sm:text-base">{benefit}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
