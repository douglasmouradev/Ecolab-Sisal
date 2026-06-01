# EcoLab Sisal — site institucional

Landing page estática sobre regeneração na Caatinga: hero, soluções, método, programas em formato de cases, FAQ e formulários de contato/newsletter.

## Destaques

- Tipografia editorial (Fraunces + DM Sans)
- Loader estável e transição de entrada da página
- Blocos editoriais com fotos do território
- SEO básico (`robots.txt`, `sitemap.xml`, Open Graph)
- Avisos de privacidade (LGPD) nos formulários

## Estrutura

| Arquivo       | Função |
|---------------|--------|
| `index.html`  | Estrutura e conteúdo da página |
| `styles.css`  | Estilos e tema visual |
| `script.js`   | Menu mobile, progresso de leitura, revelar seções, fundo dinâmico, formulário |

## Como abrir localmente

Não é necessário Node ou build. Abra o arquivo principal no navegador:

- **macOS:** arraste `index.html` para o Chrome/Safari/Firefox, ou use um servidor simples para evitar restrições de `file://` em alguns recursos:

```bash
cd "/Users/douglas/Desktop/Projeto site Ivarn"
python3 -m http.server 8080
```

Depois acesse `http://localhost:8080`.

## Repositório

Código versionado em: [github.com/douglasmouradev/Ecolab-Sisal](https://github.com/douglasmouradev/Ecolab-Sisal)

## Licença

Uso conforme acordo do proprietário do projeto.
