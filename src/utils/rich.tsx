import { Fragment, type ReactNode } from "react";

/**
 * Converte `**palavra**` em destaque colorido dentro de um texto.
 *
 * O texto do site vive todo em `constants/content.ts`, em strings puras —
 * quem edita a copy não deveria precisar mexer em JSX. A marcação de
 * asteriscos (a mesma do markdown) mantém isso: o arquivo continua legível
 * para quem só quer trocar uma frase, e a seção renderiza o destaque.
 *
 * A cor sai de `--rich-accent` (ver `.rich-em` no CSS), definida pelo
 * contêiner — assim a mesma função serve ao título escuro sobre branco e
 * ao título branco sobre a foto do hero.
 *
 * Um `\n` na string vira quebra de linha, mas só a partir de `sm`: serve
 * para segurar uma expressão inteira na mesma linha em telas largas
 * ("Terapia Cognitivo-Comportamental," antes de "explicada com calma")
 * sem impor essa quebra ao mobile, onde ela produziria linhas órfãs.
 *
 * ⚠️ Ao destacar o fim de uma frase, inclua a pontuação dentro dos
 * asteriscos (`**Recife ou online,**`): uma vírgula preta pendurada
 * depois de uma expressão rosa parece defeito de renderização.
 */
export function rich(text: string): ReactNode {
  const lines = text.split("\n");

  if (lines.length === 1) return emphasize(lines[0]);

  return lines.map((line, index) => (
    <Fragment key={index}>
      {index > 0 && <br className="hidden sm:inline" />}
      {emphasize(line)}
    </Fragment>
  ));
}

function emphasize(text: string): ReactNode {
  const parts = text.split(/\*\*(.+?)\*\*/g);

  // Sem marcação: devolve a string original, sem embrulhar em spans à toa.
  if (parts.length === 1) return text;

  return parts.map((part, index) =>
    // Os índices ímpares são o conteúdo capturado entre os asteriscos.
    index % 2 === 1 ? (
      <em key={index} className="rich-em">
        {part}
      </em>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  );
}
