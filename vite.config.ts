import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";
import { FAQ_ITEMS } from "./src/constants/faq";

/** Domínio de produção — precisa bater com o canonical do index.html. */
const SITE_URL = "https://www.alinewanderleypsicologa.com.br";

/**
 * Injeta o bloco `FAQPage` do JSON-LD a partir de `constants/faq.ts`.
 *
 * As perguntas precisam existir em dois formatos: como seção da página
 * (React) e como dado estruturado no `<head>` (é assim que o Google monta
 * o acordeão de perguntas no resultado de busca — ele não lê o que o React
 * renderiza depois).
 *
 * Manter as duas versões à mão significava, na prática, que uma hora elas
 * divergiriam — e a divergência entre o schema e a página visível é
 * justamente o que faz o Google descartar o resultado rico. Aqui o
 * `index.html` guarda só o marcador `"__FAQ_PAGE__"` (uma string, então o
 * arquivo continua sendo JSON válido) e o build o troca pelo objeto real.
 *
 * Vale tanto em `dev` quanto em `build`: o Vite aplica `transformIndexHtml`
 * nos dois, então o que você inspeciona no navegador é o que vai ao ar.
 */
function faqJsonLd(): Plugin {
  return {
    name: "aline-faq-jsonld",
    transformIndexHtml(html) {
      const faqPage = {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/#faq`,
        mainEntity: FAQ_ITEMS.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      };

      return html.replace('"__FAQ_PAGE__"', JSON.stringify(faqPage, null, 2));
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), faqJsonLd()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@assets": fileURLToPath(new URL("./assets", import.meta.url)),
    },
  },
  build: {
    target: "es2022",
    // Rolldown (Vite 8) faz o code splitting automático.
  },
});
