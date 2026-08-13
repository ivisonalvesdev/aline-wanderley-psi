/**
 * Prepara o vídeo de fundo da seção Formação.
 *
 * O arquivo que sai do gerador (`assets/video-origem/formacao.mp4`) é
 * 1280×720. A seção o exibe em tela cheia, sem `max-width` — ou seja,
 * esticado em qualquer monitor comum. Deixar esse trabalho para o
 * navegador foi exatamente o que estragou a primeira tentativa de animação
 * do hero: o filtro de upscale em tempo real é fraco e produz halo.
 *
 * Aqui a escala é feita uma vez, offline, com Lanczos, e o resultado é
 * recodificado em 1080p. Não é super-resolução — não inventa detalhe que a
 * origem não tem —, mas entrega ao navegador um quadro do tamanho em que
 * ele será exibido, que é onde estava a perda.
 *
 * O áudio é descartado: o vídeo toca mudo por exigência das políticas de
 * autoplay, então a trilha seria peso puro.
 *
 *   npm run video
 */
import { execFileSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import ffmpeg from "ffmpeg-static";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "assets", "video-origem", "formacao.mp4");
const OUT = join(ROOT, "assets", "formacao.mp4");

/*
  A origem não fica versionada: são 7 MB que o site não usa, já que o que
  vai ao ar é o resultado deste script. O arquivo final em `assets/` é o
  que está no repositório.

  Este script existe para o dia em que o vídeo mudar — a receita de
  codificação abaixo é o que não se quer redescobrir. Para rodar de novo,
  basta devolver o novo original ao caminho esperado.
*/
if (!existsSync(SRC)) {
  console.error(
    `Original não encontrado em ${SRC}\n` +
      `Coloque o vídeo novo nesse caminho e rode de novo (o resultado ` +
      `sobrescreve ${OUT}).`,
  );
  process.exit(1);
}

/**
 * CRF 20 é o ponto em que o material para de ganhar com mais bits.
 *
 * A origem já vem com bitrate alto para 720p (~7 Mbps), então o quadro é
 * limpo e o gargalo é a resolução, não a compressão. Abaixo de 20 o
 * arquivo cresce sem diferença visível; acima de 23 os degradês pastel das
 * paredes começam a mostrar blocking — o mesmo defeito que apareceu nos
 * frames em qualidade baixa demais.
 */
const CRF = 20;

const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

execFileSync(
  ffmpeg,
  [
    "-y",
    "-i", SRC,
    "-vf", "scale=1920:1080:flags=lanczos",
    "-c:v", "libx264",
    "-crf", String(CRF),
    // `slow` custa tempo de build, não de quem assiste, e rende alguns
    // por cento de bitrate no mesmo nível de qualidade.
    "-preset", "slow",
    // Sem isto o x264 pode escolher um formato de cor que o Safari recusa.
    "-pix_fmt", "yuv420p",
    // Move o índice do arquivo para o começo: o navegador consegue começar
    // a tocar antes de terminar o download.
    "-movflags", "+faststart",
    "-an",
    OUT,
  ],
  { stdio: ["ignore", "ignore", "inherit"] },
);

console.log(`Origem : ${SRC}  ${mb(statSync(SRC).size)}`);
console.log(`Saída  : ${OUT}  1920×1080 crf${CRF}  ${mb(statSync(OUT).size)}`);
