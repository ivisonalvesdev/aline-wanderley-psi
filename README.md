# Aline Wanderley — Psicóloga Clínica · Landing Page

Landing page premium para conversão via WhatsApp. React + Vite + TypeScript +
TailwindCSS v4 + GSAP (ScrollTrigger/SplitText) + Three.js (background orgânico
discreto, carregado sob demanda).

## Comandos

```bash
npm install     # instalar dependências
npm run dev     # ambiente de desenvolvimento (http://localhost:5173)
npm run build   # build de produção (gera /dist)
npm run preview # pré-visualizar o build
```

## Antes de publicar — checklist

1. **WhatsApp** — em [src/constants/site.ts](src/constants/site.ts), substituir
   `whatsappNumber` pelo número real (DDI+DDD, somente dígitos).
2. **Domínio** — `https://www.alinewanderleypsicologa.com.br` já é o domínio de
   produção (configurado em [src/constants/site.ts](src/constants/site.ts),
   [index.html](index.html), [vite.config.ts](vite.config.ts),
   [public/robots.txt](public/robots.txt) e [public/sitemap.xml](public/sitemap.xml)).
3. **Fotos** — substituir os `<ImagePlaceholder />`:
   - Hero: marcado com `{/* FOTO HERO */}` em [src/sections/Hero.tsx](src/sections/Hero.tsx)
   - Sobre: marcado com `{/* FOTO SOBRE */}` em [src/sections/About.tsx](src/sections/About.tsx)
   - Usar `<img>` com `alt` descritivo, formato AVIF/WebP, ~800×1000px.
   - A foto do Hero deve ter `fetchpriority="high"`; a do Sobre, `loading="lazy"`.
4. **Open Graph** — adicionar `public/og-image.jpg` (1200×630).
5. **Formação** — revisar a timeline em
   [src/constants/content.ts](src/constants/content.ts) com os dados reais.
6. **Endereço** — completar o endereço do consultório em
   [src/components/Footer.tsx](src/components/Footer.tsx) e no JSON-LD se desejar.

## Arquitetura

```
src/
├── components/       # componentes reutilizáveis (Header, Footer, CTA, ícones…)
│   └── three/        # cena WebGL (lazy load)
├── sections/         # seções da página, na ordem de exibição
├── hooks/            # useReveal (GSAP), useMediaQuery
├── constants/        # site.ts (dados) e content.ts (todo o texto)
├── utils/            # gsap.ts (plugins/registro), cn.ts
└── styles/           # design tokens (Tailwind v4 @theme) e base
```

- **Todo o texto** editável está em `src/constants/content.ts` — nenhuma copy
  hardcoded nas seções principais.
- **Animações** respeitam `prefers-reduced-motion` (conteúdo permanece visível,
  Three.js nem é baixado).
- **Acessibilidade**: navegação por teclado, focus visível, ARIA nos
  componentes interativos, contraste AA.
