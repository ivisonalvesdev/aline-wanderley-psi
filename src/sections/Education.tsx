import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Hourglass, X, ZoomIn } from "lucide-react";
import { EDUCATION } from "@/constants/content";
import { rich } from "@/utils/rich";
import { gsap, ScrollTrigger, EASE, MOTION_OK, POINTER_FINE, SCRUB } from "@/utils/gsap";
import { useMagnetic } from "@/hooks/useMagnetic";
import { cn } from "@/utils/cn";
import formacaoVideo from "@assets/formacao.mp4";
import diplomaPsicologia from "@assets/diplomas/diploma-psicologia.png";

/**
 * Imagem de cada certificado, ligada pelo `id` de `EDUCATION.certificates`.
 *
 * Fica aqui, e não em `content.ts`, porque o caminho precisa passar pelo
 * empacotador para ganhar hash de cache — `content.ts` é importado também
 * pelo `vite.config.ts` (para o JSON-LD do FAQ), e um `import` de imagem
 * ali quebraria a leitura do arquivo em Node puro.
 */
const CERTIFICATE_IMAGES: Record<string, string> = {
  psicologia: diplomaPsicologia,
};

/**
 * Quanto a seção segura a página no desktop.
 *
 * O pin existe por um motivo só: dar tempo de os cartões entrarem sem que
 * a seção já esteja saindo de cena. Assim que a entrada termina, a rolagem
 * volta ao normal — segurar além disso seria prender a pessoa para assistir
 * a um laço que ela já viu começar.
 *
 * 70% da altura da tela é o que cobre os ~2,4s da entrada num scroll de
 * ritmo comum.
 */
const PIN_SCROLL = "+=70%";

/**
 * Percurso do celular.
 *
 * Curto de propósito. Aqui a seção trava, mas quem move a coreografia é o
 * dedo: parado, a pessoa fica vendo o vídeo limpo pelo tempo que quiser;
 * deslizando, os cartões entram; seguindo em frente, a página é devolvida.
 *
 * A versão anterior contava segundos e prendia por uma tela e meia, o que
 * obrigava a rolar muito para sair da seção depois de já ter visto tudo.
 * 80% é o mínimo que ainda dá curso para os cartões entrarem sem parecer
 * que apareceram de um salto.
 */
const MOBILE_PIN = "+=80%";

type Certificate = (typeof EDUCATION.certificates)[number];

/**
 * Acabamento do cartão de certificado.
 *
 * Deliberadamente **não** é o `card-glass` do resto do site. O vidro
 * depende de `backdrop-filter: blur(20px)`, e aqui o que passa por trás é
 * um vídeo em reprodução: o navegador teria de refazer o desfoque de toda
 * a área do cartão a cada quadro do vídeo, e era isso que se sentia como
 * engasgo ao chegar na seção.
 *
 * Fundo sólido também é a escolha certa de leitura: o documento é a peça
 * que precisa ser vista com nitidez, e vidro sobre cena em movimento
 * deixaria o cenário disputando atenção com o diploma.
 */
const CARD_SURFACE =
  "rounded-3xl border border-white/70 bg-white shadow-[0_26px_64px_-30px_rgb(48_42_44_/_0.5)]";

/**
 * Cartão de certificado.
 *
 * O magnetismo fica num wrapper interno, e não no `<li>`: o `<li>` é quem
 * recebe a animação de entrada (`autoAlpha` + `y`), e as duas coisas
 * escrevem `transform`. No mesmo nó, uma apagaria a outra — o mesmo motivo
 * que separa wrapper e imagem nas peças de montar da seção Sobre.
 */
function CertificateCard({
  certificate,
  onOpen,
}: {
  certificate: Certificate;
  onOpen: (certificate: Certificate) => void;
}) {
  const magnetRef = useMagnetic<HTMLDivElement>({ strength: 0.18, reach: 90, tilt: 3 });
  const image = CERTIFICATE_IMAGES[certificate.id];

  const caption = (
    <div className="mt-4 text-left">
      <h3 className="font-display text-[0.9375rem] font-semibold tracking-[-0.01em] text-ink-900">
        {certificate.course}
      </h3>
      <p className="mt-1.5 text-sm leading-snug text-ink-500">{certificate.institution}</p>
      <p className="mt-1 font-alt text-xs tracking-[0.02em] text-blush-600">
        {certificate.place} · {certificate.year}
      </p>
    </div>
  );

  /*
    A cadeia de `flex` daqui até o cartão existe para os dois ficarem do
    mesmo tamanho.

    As legendas têm alturas diferentes — "Especialização em Terapia
    Cognitivo-Comportamental" ocupa duas linhas onde "Bacharelado em
    Psicologia" ocupa uma —, e sem isso cada cartão parava na altura do
    próprio conteúdo. O `<li>` já era esticado pela grade; o que faltava era
    repassar essa altura para dentro, o que `display: flex` faz sem depender
    de porcentagem resolver contra pai de altura implícita.

    A sobra vai para o documento (`grow` no quadro da imagem), e não para um
    vazio no rodapé do cartão: é o diploma que cresce até empatar com o
    vizinho, que era o pedido.
  */
  return (
    <li data-formacao-card className="flex">
      <div ref={magnetRef} className="flex w-full">
        {certificate.pending || !image ? (
          <div className={cn(CARD_SURFACE, "flex w-full flex-col p-4")}>
            {/*
              O segundo espaço existe antes do documento para que a seção
              não precise ser rediagramada quando ele chegar — e porque um
              par de cartões lê como percurso em andamento, enquanto um
              cartão só lê como percurso encerrado.
            */}
            <div className="flex aspect-[4/3] grow flex-col items-center justify-center gap-2.5 rounded-xl border border-dashed border-blush-300/70 bg-blush-50/60 px-4 text-center">
              <Hourglass className="size-5 text-blush-500" aria-hidden="true" />
              <p className="font-alt text-xs font-medium tracking-[0.02em] text-blush-700">
                Certificado a caminho
              </p>
            </div>
            {caption}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onOpen(certificate)}
            aria-label={`Ampliar o diploma de ${certificate.course}`}
            className={cn(
              CARD_SURFACE,
              "group flex w-full cursor-zoom-in flex-col p-4 text-left transition-shadow duration-300 hover:shadow-[0_34px_76px_-28px_rgb(48_42_44_/_0.6)]",
            )}
          >
            <div className="relative aspect-[4/3] grow overflow-hidden rounded-xl bg-white ring-1 ring-mist-200">
              <img
                src={image}
                alt={`Diploma de ${certificate.course}, emitido pelo ${certificate.institution}`}
                loading="lazy"
                decoding="async"
                className="size-full object-contain"
              />
              {/* Só a lupa avisa que o cartão abre — o cursor `zoom-in`
                  não existe no toque, onde nada indicaria o gesto. */}
              <span
                aria-hidden="true"
                className="absolute right-2 bottom-2 flex size-8 items-center justify-center rounded-full bg-ink-900/55 text-white opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 max-lg:opacity-100"
              >
                <ZoomIn className="size-4" />
              </span>
            </div>
            {caption}
          </button>
        )}
      </div>
    </li>
  );
}

export function Education() {
  const rootRef = useRef<HTMLElement>(null);
  const [zoomed, setZoomed] = useState<Certificate | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  /** Devolve o foco ao cartão que abriu a ampliação. */
  const openerRef = useRef<HTMLElement | null>(null);

  const openZoom = useCallback((certificate: Certificate) => {
    openerRef.current = document.activeElement as HTMLElement | null;
    setZoomed(certificate);
  }, []);

  const closeZoom = useCallback(() => {
    setZoomed(null);
    openerRef.current?.focus();
  }, []);

  /* Com a ampliação aberta: trava a rolagem do fundo, fecha no Escape e
     leva o foco para o botão de fechar — sem isso o teclado continuaria
     navegando os cartões atrás do escurecido. */
  useEffect(() => {
    if (!zoomed) return;

    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    /*
      Pausa o vídeo enquanto a ampliação está aberta.

      Vale pelos dois lados: o fundo do diálogo usa `backdrop-blur`, e
      desfocar vídeo em reprodução obriga o navegador a refazer o efeito a
      cada quadro — caro justamente quando a atenção está no documento.
      E o vídeo, atrás do escurecido, não teria quem o assistisse.
    */
    const video = rootRef.current?.querySelector<HTMLVideoElement>("[data-formacao-video]");
    video?.pause();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeZoom();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      void video?.play().catch(() => {});
    };
  }, [zoomed, closeZoom]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const mm = gsap.matchMedia();

    /**
     * `motion` decide se há animação; `pinned` separa desktop de toque, que
     * aqui recebem roteiros diferentes (ver o comentário em `playVideo`).
     */
    mm.add({ pinned: POINTER_FINE, motion: MOTION_OK }, (ctx) => {
      if (!ctx.conditions?.motion) return;

      const pinned = Boolean(ctx.conditions?.pinned);
      const video = root.querySelector<HTMLVideoElement>("[data-formacao-video]");
      const dim = root.querySelector<HTMLElement>("[data-formacao-dim]");
      const items = root.querySelectorAll<HTMLElement>("[data-formacao-item]");
      const cards = root.querySelectorAll<HTMLElement>("[data-formacao-card]");
      const hidden = [...items, ...cards];

      // O atributo `muted` no JSX nem sempre chega ao DOM a tempo, e sem
      // ele o navegador recusa o autoplay. Reforça na propriedade.
      if (video) video.muted = true;

      gsap.set(hidden, { autoAlpha: 0, y: 22 });

      /**
       * Os dois caminhos prendem a seção; o que muda é quem conduz.
       *
       * No desktop o conteúdo tem coluna própria ao lado do vídeo, então
       * entra sozinho, em tempo fixo: os dois convivem em quadro sem
       * disputa.
       *
       * No celular os cartões passam por cima da Aline, e mostrar as duas
       * coisas juntas tira da pessoa a escolha de ver o vídeo limpo. Ali a
       * entrada é percorrida pela rolagem — parada, ela vê só o vídeo;
       * deslizando, traz os cartões.
       */
      const playVideo = () => {
        if (!video) return;
        // A promessa é rejeitada quando a política de autoplay barra — o
        // vídeo fica no primeiro quadro e o texto entra do mesmo jeito,
        // então não há o que tratar.
        void video.play().catch(() => {});
      };

      let entrance: gsap.core.Timeline;
      let trigger: ScrollTrigger;
      /** Só existe no desktop: adianta o play em relação ao pin. */
      let prime: ScrollTrigger | undefined;
      const cleanups: Array<() => void> = [];

      if (pinned) {
        entrance = gsap.timeline({ paused: true, defaults: { ease: EASE } });
        entrance
          .to(items, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.11 })
          .to(cards, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.14 }, "-=0.6");

        /*
          O vídeo começa a tocar antes de a seção travar, e não no mesmo
          instante.

          Decodificar o primeiro quadro custa alguns milissegundos, e
          prender a seção obriga o navegador a refazer o layout de tudo o
          que vem abaixo. Disparados no mesmo quadro, os dois custos se
          somavam — era a travadinha ao chegar na seção. Meia tela antes,
          o vídeo já está rodando quando o pin entra.
        */
        prime = ScrollTrigger.create({
          trigger: root,
          start: "top 55%",
          onEnter: playVideo,
          onEnterBack: playVideo,
        });

        if (video) video.loop = true;

        trigger = ScrollTrigger.create({
          trigger: root,
          start: "top top",
          end: PIN_SCROLL,
          pin: true,
          anticipatePin: 1,
          // A seção presa desloca tudo que vem depois; remedir antes dos
          // reveals das seções seguintes evita que elas leiam coordenadas
          // velhas.
          refreshPriority: 1,
          onEnter: () => entrance.play(0),
          /*
            Subindo, a entrada é posta direto no fim em vez de tocada de
            novo — era daqui que vinha a piscada.

            `onEnterBack` dispara ao reentrar pelo lado de baixo, e nesse
            instante a seção já está à vista com os cartões desenhados. Um
            `play(0)` os devolvia ao quadro zero, onde o `autoAlpha` é 0 e
            escreve `visibility: hidden`: eles sumiam e voltavam a entrar
            com a pessoa olhando. `progress(1)` chega ao mesmo estado final
            sem passar pelo início.

            Reapresentar a animação continua acontecendo, mas só pelo
            `onLeaveBack` logo abaixo — que é quando a seção saiu de cena
            por cima e a próxima descida é uma chegada de verdade.
          */
          onEnterBack: () => entrance.progress(1),
          onLeaveBack: () => {
            entrance.pause(0);
            gsap.set(hidden, { autoAlpha: 0, y: 22 });
          },
        });
      } else {
        if (video) video.loop = true;

        /*
          No celular quem conduz a coreografia é o dedo, não o relógio.

          A seção trava e o vídeo roda. Enquanto a pessoa não deslizar, o
          progresso fica em zero: ela vê o vídeo limpo pelo tempo que
          quiser, sem nada por cima. Ao deslizar, os cartões entram no
          ritmo do próprio gesto; seguindo em frente, o pin solta e a
          página continua.

          É o contrário da versão anterior, que contava segundos: ali a
          espera era imposta, e depois de ver tudo ainda sobrava uma tela e
          meia de rolagem presa para conseguir sair.
        */
        entrance = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: MOBILE_PIN,
            pin: true,
            anticipatePin: 1,
            refreshPriority: 1,
            scrub: SCRUB,
          },
        });

        entrance
          // Respiro inicial: o primeiro toque de rolagem ainda é só vídeo,
          // para o gesto não trazer os cartões de imediato.
          .to({}, { duration: 0.2 })
          .to(items, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.07 })
          /*
            O escurecimento larga um fio à frente do texto.

            Ele é o que dá contraste de leitura, então precisa já estar
            chegando quando a primeira letra acende — no mesmo instante
            ele ainda lia como atrasado, porque a opacidade leva um tempo
            para virar sombra perceptível enquanto o texto acende de uma
            vez. O `<-=0.1` compensa essa diferença de percepção: no
            relógio a sombra sai antes, na tela os dois aparecem juntos.

            A duração também encolheu (era 0.7): rampa mais curta chega ao
            valor final junto com o texto, em vez de ainda estar subindo
            quando ele já está inteiro em cena.

            Como agora o véu do celular é leve (ver `formacao-veil` no
            CSS), é este dim que responde sozinho pelo contraste; antes
            ele apenas somava a um véu que já era pesado.
          */
          .to(dim, { opacity: 0.55, duration: 0.5 }, "<-=0.1")
          .to(cards, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.1 }, "-=0.4");

        // O vídeo acompanha a presença da seção em tela, e não o pin: ele
        // já está rodando quando a seção trava, e continua enquanto ela
        // estiver visível.
        trigger = ScrollTrigger.create({
          trigger: root,
          start: "top bottom",
          end: "bottom top",
          onEnter: playVideo,
          onEnterBack: playVideo,
          onLeave: () => video?.pause(),
          onLeaveBack: () => video?.pause(),
        });
      }

      /**
       * Os 7 MB do vídeo não podem sair junto com o resto da página — a
       * seção fica lá embaixo, e quem nunca chega nela não deveria pagar
       * por isso. O download começa quando a seção está a menos de uma
       * tela de distância, tempo suficiente para o começo estar pronto.
       */
      const warmup = ScrollTrigger.create({
        trigger: root,
        start: "top bottom+=100%",
        once: true,
        onEnter: () => {
          if (!video) return;
          video.preload = "auto";
          video.load();
        },
      });

      return () => {
        for (const dispose of cleanups) dispose();
        warmup.kill();
        prime?.kill();
        trigger.kill();
        entrance.scrollTrigger?.kill();
        entrance.kill();
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      id="formacao"
      aria-labelledby="formacao-titulo"
      className="relative isolate flex min-h-svh items-center overflow-hidden py-24 sm:py-28 short:py-16"
    >
      {/*
        O vídeo é cenário, não conteúdo: fica em `-z-10` com o véu por
        cima, como a foto do hero. A cor de fundo do wrapper cobre o
        intervalo entre o layout e o primeiro quadro decodificado — sem
        ela, o vazio aparece como retângulo preto no meio de uma página
        clara.
      */}
      {/*
        No celular o fundo abaixo da faixa de vídeo não é a ameixa cheia.

        Ela encostava logo abaixo do notebook, e o contraste ali ficava
        duro justamente no ponto em que a cena termina. O degradê entra
        com um tom mais claro na altura da faixa e só fecha na ameixa
        original mais abaixo — a massa escura desce, e a passagem do
        vídeo para o fundo deixa de disputar com a mesa.

        A cor chapada continua como base: é ela que cobre o intervalo
        entre o layout e o primeiro quadro decodificado, e no desktop,
        onde o vídeo ocupa tudo, é a única que aparece.
      */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[rgb(78_30_45)] max-sm:bg-[linear-gradient(to_bottom,rgb(102_46_64)_0%,rgb(102_46_64)_62%,rgb(90_37_54)_76%,rgb(78_30_45)_100%)]"
      >
        <video
          data-formacao-video
          src={formacaoVideo}
          muted
          playsInline
          preload="metadata"
          /*
            No celular o vídeo é uma faixa, não um fundo de tela cheia.

            O arquivo é 16:9 e a tela do celular é quase o inverso disso.
            Cobrindo a altura toda, o `cover` precisava ampliar o quadro a
            ponto de sobrar só ~26% da largura — uma fatia vertical com o
            rosto dela e mais nada. O notebook, as mãos e a mesa, que são o
            que conta a cena, ficavam inteiramente fora. Não havia
            ancoragem que resolvesse: o problema é de proporção, não de
            enquadramento.

            Limitar a altura inverte a conta. Numa faixa de ~54svh o
            `cover` amplia bem menos e a janela visível passa a caber a
            cena inteira: rosto, mãos, notebook e mesa. Abaixo da faixa
            aparece a cor de fundo do wrapper, e a máscara logo abaixo
            dissolve a borda para que a passagem não leia como corte.

            A altura é o ponto de equilíbrio da seção: encolhendo, sobra
            faixa escura demais embaixo; crescendo, volta-se ao close que
            se queria corrigir. O degradê da máscara ocupa os últimos 14%
            da faixa — o suficiente para desmanchar a borda sem comer
            parte útil da cena.

            No eixo Y o 22% do desktop segue valendo: em notebook largo e
            baixo o corte é vertical, e a cabeça dela quase encosta no topo
            do vídeo — centralizar cortava justamente ali. Na faixa do
            celular não há sobra vertical, então o eixo Y é indiferente e
            só o X é ancorado, em 10%, que é onde a cena fica centrada.
          */
          className="w-full object-cover object-[10%_50%] max-sm:h-[62svh] max-sm:[-webkit-mask-image:linear-gradient(to_bottom,#000_91%,transparent_100%)] max-sm:[mask-image:linear-gradient(to_bottom,#000_91%,transparent_100%)] sm:h-full sm:object-[32%_22%]"
        />

        <div className="formacao-veil absolute inset-0" />

        {/*
          Escurecimento extra.

          No celular os cartões passam por cima da Aline — não há coluna
          livre ao lado como no desktop —, e o véu sozinho não separa o
          suficiente documento de cenário. Entra depois dos cartões, no fim
          da coreografia, para que o vídeo apareça limpo primeiro.

          Fica sempre no DOM, em opacidade zero, e quem o acende é a
          coreografia sem pin. Esconder por largura (`lg:hidden`) pareceria
          equivalente, mas o pin é decidido por tipo de ponteiro, não por
          largura: num notebook com tela sensível ao toque as duas regras
          discordariam, e o escurecimento simplesmente não apareceria.
        */}
        <div data-formacao-dim className="absolute inset-0 bg-ink-900 opacity-0" />
      </div>

      <div className="container-page">
        {/* O conteúdo ocupa a metade direita, onde o véu está mais fechado
            — a esquerda fica livre para a Aline aparecer no vídeo. */}
        <div className="lg:ml-auto lg:w-[54%] lg:max-w-2xl xl:w-1/2">
          <p
            data-formacao-item
            className="eyebrow mb-4 text-blush-200"
          >
            {EDUCATION.eyebrow}
          </p>

          <h2
            id="formacao-titulo"
            data-formacao-item
            className="heading-section font-display font-medium text-white text-balance [--rich-accent:var(--color-blush-300)]"
          >
            {rich(EDUCATION.title)}
          </h2>

          <p
            data-formacao-item
            className="lede mt-5 text-white/85"
          >
            {EDUCATION.description}
          </p>

          <ul className="mt-10 grid gap-5 sm:mt-12 sm:grid-cols-2">
            {EDUCATION.certificates.map((certificate) => (
              <CertificateCard
                key={certificate.id}
                certificate={certificate}
                onOpen={openZoom}
              />
            ))}
          </ul>
        </div>
      </div>

      {/*
        Ampliação do diploma.

        Fica fora do `container-page` e usa `fixed`: a seção tem
        `overflow-hidden` e `isolate`, que recortariam e rebaixariam
        qualquer camada declarada lá dentro.

        O clique no fundo fecha, mas o `stopPropagation` na figura impede
        que um clique sobre o próprio documento — que é o gesto natural de
        quem está tentando ler — feche por engano.
      */}
      {zoomed && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Diploma de ${zoomed.course}`}
          onClick={closeZoom}
          className="fixed inset-0 z-100 flex items-center justify-center bg-ink-900/80 p-4 backdrop-blur-md motion-safe:animate-fade-in-fast sm:p-8"
        >
          {/* A largura máxima acompanha a resolução do arquivo, não o
              espaço disponível: o diploma tem 600px de largura, e abrir
              além de ~740px só entrega um upscale borrado. Se um dia
              chegar uma digitalização maior, este teto pode subir junto. */}
          <figure
            onClick={(event) => event.stopPropagation()}
            className="relative max-h-full w-full max-w-3xl overflow-auto rounded-2xl bg-white p-3 shadow-[0_40px_120px_-40px_rgb(0_0_0_/_0.7)] sm:p-4"
          >
            <img
              src={CERTIFICATE_IMAGES[zoomed.id]}
              alt={`Diploma de ${zoomed.course}, emitido pelo ${zoomed.institution}`}
              className="mx-auto block h-auto w-full rounded-lg"
            />
            <figcaption className="px-1 pt-3 pb-1 text-center">
              <p className="font-display text-sm font-semibold text-ink-900">{zoomed.course}</p>
              <p className="mt-1 text-xs text-ink-500">
                {zoomed.institution} · {zoomed.place} · {zoomed.year}
              </p>
            </figcaption>
          </figure>

          <button
            ref={closeRef}
            type="button"
            onClick={closeZoom}
            aria-label="Fechar a ampliação do diploma"
            className="absolute top-4 right-4 inline-flex size-11 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur-md transition-colors duration-300 hover:bg-white/30 sm:top-6 sm:right-6"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
      )}
    </section>
  );
}
