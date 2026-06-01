# Sisal EcoLab — site institucional

Landing page estática sobre regeneração na Caatinga: hero, soluções, método, programas, cases, FAQ e formulários de contato/newsletter.

**Demo:** [ecolab-sisal.vercel.app](https://ecolab-sisal.vercel.app)

## Destaques

- Tipografia editorial (Fraunces + DM Sans)
- Loader unificado com fallback CSS e redução de movimento
- Faixas editoriais com fotos do território e scroll 3D (otimizado no mobile)
- SEO (`robots.txt`, `sitemap.xml`, Open Graph, JSON-LD)
- Política de privacidade (`privacidade.html`) e avisos LGPD nos formulários
- Formulários via Formspree com validação acessível

## Estrutura

| Arquivo / pasta | Função |
|-----------------|--------|
| `index.html` | Estrutura e conteúdo da página |
| `styles.css` | Estilos e tema visual |
| `script.js` | Menu, loader, scroll 3D, formulários, animações |
| `js/site-config.js` | E-mail, URLs e tempos do loader |
| `privacidade.html` | Política de privacidade (LGPD) |
| `robots.txt` / `sitemap.xml` | SEO |
| `assets/images/` | Imagens do território |
| `assets/favicon.svg` / `logo-mark.svg` | Identidade visual |

## Como abrir localmente

Não é necessário Node ou build. Use um servidor HTTP simples:

```bash
cd "caminho/para/Ecolab-Sisal"
python -m http.server 8765
```

Acesse: `http://localhost:8765`

## Repositório

Código versionado em: [github.com/douglasmouradev/Ecolab-Sisal](https://github.com/douglasmouradev/Ecolab-Sisal)

## Licença

Uso conforme acordo do proprietário do projeto.
