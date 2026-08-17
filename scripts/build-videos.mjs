/**
 * Prepara os vídeos de fundo do site.
 *
 * O vídeo é exibido em tela cheia, sem `max-width`, ou seja, esticado em
 * qualquer monitor comum. Deixar essa escala para o navegador foi
 * exatamente o que estragou a primeira tentativa de animação do hero — o
 * filtro de upscale em tempo real é fraco e produz halo. Aqui a escala é
 * feita uma vez, offline, com Lanczos, e o resultado sai em 1080p: o
 * navegador recebe o quadro no tamanho em que vai exibi-lo, que é onde
 * estava a perda.
 *
 * O original não fica versionado — são megabytes que o site não usa, já
 * que o que vai ao ar é o resultado deste script. Este arquivo existe para
 * o dia em que o vídeo mudar: a receita abaixo é o que não se quer
 * redescobrir.
 *
 * A seção Formação tinha um vídeo aqui também; virou foto estática
 * (`assets/formacao.webp`), então saiu deste pipeline.
 *
 *   npm run video
 */
import { execFileSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import ffmpeg from "ffmpeg-static";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const asset = (...parts) => join(ROOT, "assets", ...parts);

const JOBS = [
  {
    nome: "Orientação Parental",
    src: asset("video-orientacao-parental", "Cerebro-Orientacao-Parental.mp4"),
    out: asset("orientacao-parental.mp4"),
    crf: 20,
    /*
      Este caso é o oposto do de cima: a origem chegou já espremida a 164
      kb/s de vídeo (720p, 24 fps), num arquivo em que metade do peso era
      trilha de áudio — inútil, já que o vídeo toca mudo.

      Esse bitrate deixou um chuvisco fino nas áreas lisas, que são quase
      todo o quadro: é um render 3D sobre um degradê coral. Ampliar sem
      tratar transformaria esse chuvisco em manchas visíveis, porque o
      Lanczos realça tanto o detalhe quanto o defeito.

      Por isso o `hqdn3d` vem antes da escala. Os dois primeiros números
      cuidam do ruído dentro do quadro e os dois últimos, da variação entre
      quadros — que é o que faz fundo liso "ferver" durante o loop. Os
      valores são baixos de propósito: o assunto é uma superfície modelada,
      e denoise pesado apagaria os sulcos do cérebro junto com o ruído.
    */
    filtros: "hqdn3d=2:1.5:6:6,scale=1920:1080:flags=lanczos",
  },
];

const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

let feitos = 0;

for (const job of JOBS) {
  if (!existsSync(job.src)) {
    console.warn(
      `— ${job.nome}: original ausente, pulando.\n` +
        `  Esperado em ${job.src}\n` +
        `  (o arquivo final em assets/ é o que está versionado; devolva o ` +
        `original a esse caminho para recodificar)`,
    );
    continue;
  }

  execFileSync(
    ffmpeg,
    [
      "-y",
      "-i", job.src,
      "-vf", job.filtros,
      "-c:v", "libx264",
      "-crf", String(job.crf),
      // `slow` custa tempo de build, não de quem assiste, e rende alguns
      // por cento de bitrate no mesmo nível de qualidade.
      "-preset", "slow",
      // Sem isto o x264 pode escolher um formato de cor que o Safari recusa.
      "-pix_fmt", "yuv420p",
      // Move o índice do arquivo para o começo: o navegador consegue
      // começar a tocar antes de terminar o download.
      "-movflags", "+faststart",
      // Todos tocam mudos por exigência das políticas de autoplay, então a
      // trilha seria peso puro.
      "-an",
      job.out,
    ],
    { stdio: ["ignore", "ignore", "inherit"] },
  );

  console.log(
    `✓ ${job.nome}\n` +
      `  origem : ${mb(statSync(job.src).size)}\n` +
      `  saída  : ${job.out}  1920×1080 crf${job.crf}  ${mb(statSync(job.out).size)}`,
  );
  feitos += 1;
}

if (feitos === 0) {
  console.error("\nNenhum original encontrado — nada foi recodificado.");
  process.exit(1);
}
