# Redesign — auditoria e verificação

Data: 10 de outubro de 2026.

## Auditoria antes da implementação

Foram lidos integralmente `index.html`, `styles.css`, `script.js` e `README.md`, examinada a árvore de arquivos e inspecionados os assets locais e a página original no navegador. O projeto é estático, com GSAP 3.13.0 via CDN, sem package.json ou framework. Não havia AGENTS.md no checkout. A referência JPEG representa o layout anterior; a nova direção segue o prompt de redesign.

Problemas encontrados:

- Busca ignorava o termo e apenas rolava até a família.
- Sacola exibia um toast sem funcionalidade; comprar levava ao footer.
- Comparação era apenas um link de retorno à galeria.
- Navegação duplicava destinos e havia contato/social fictícios.
- Swatches eram decorativos e não possuíam imagens de variantes.
- Modais/menu não continham o foco nem restituíam o foco de maneira consistente.
- Dois carrosséis fixados acumulavam grandes distâncias de scroll.
- Imagens de iPhone 17 e iPhone 17e estavam trocadas: `rosa.jpg` mostra o 17 lavanda e `bege.jpg` mostra o 17e rosa-pálido.
- O vídeo roxo adicional estava no workspace, ainda sem rastreamento Git. Foi preservado e integrado, sem substituir os outros modelos.

## Inventário dos assets

| Material                                                                                                    | Dimensões                                      | Uso                                                     |
| ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------- |
| Vídeo `iPhone_product_reveal_video_1080p_20261010133414.mp4`                                                | 1920 × 1080, 8 segundos, aproximadamente 12 MB | Hero do conceito roxo                                   |
| Poster JPG/WebP derivado do vídeo                                                                           | 1920 × 1080                                    | Hero estática, macro e encerramento                     |
| `Link.jpg`, `cinza.jpg`, `rosa.jpg`, `bege.jpg`, `ROXO.jpg`                                                 | 372 × 395                                      | Cinco modelos, detalhes, busca e comparação             |
| `List Item-2.jpg`                                                                                           | 372 × 680                                      | História de câmeras                                     |
| `Container-2.jpg`                                                                                           | 372 × 680                                      | História de desempenho, vinculada visualmente ao 17 Pro |
| `List Item.png`                                                                                             | 372 × 680                                      | História de design do Air                               |
| `Container-1.jpg`                                                                                           | 372 × 680                                      | Sistema e experiência                                   |
| `List Item-1.jpg`                                                                                           | 372 × 680                                      | Privacidade                                             |
| Duas imagens hero laranja, vídeo anterior, `Container-3.jpg`, `Container.png`, `Text.svg`, `REFERENCIA.jpg` | Vários                                         | Preservados; não atribuídos ao conceito 18 Pro          |

## Direção e implementação

Mantidos HTML/CSS/JavaScript e a versão original do GSAP. Reutilizados os artigos de produto, conteúdo/preços do catálogo, âncoras relevantes e mídias existentes. CSS e controladores foram refatorados após a auditoria para remover os contratos falsos e as composições anteriores.

O sistema combina grafite e off-white, reservando roxo ao conceito e ao manifesto. Tipografia do sistema, sem fontes remotas, títulos editoriais, linhas finas e alinhamentos compartilhados. A família alterna escalas e alturas, mantendo navegação nativa. No mobile, produto e texto têm enquadramentos próprios; histórias tornam-se verticais e não há pin ou ScrollSmoother.

Sequência: hero → macro → família → manifesto → cinco histórias → comparação → encerramento → footer. O conceito independente é identificado na abertura e no footer. Os nomes e preços do catálogo original foram preservados. Nenhuma especificação numérica do iPhone 18 foi acrescentada.

## Animações

- Entrada coordenada da mídia, eyebrow, título em caracteres, copy e controles.
- Escala/posição suaves da hero conforme scroll.
- Macro com clip-path, escala reversível e pin de 450 px em desktops altos; telas baixas mantêm o trecho sem pin.
- Títulos com SplitText, máscaras de linha, redimensionamento e reversão.
- Parallax moderado no retrato, acabamento e chip.
- Manifesto com deslocamento tipográfico e mudança gradual de fundo.
- Encerramento com escala contínua da fotografia.
- `gsap.matchMedia()` cria/reverte timelines; preferência reduzida desmonta animações e pausa vídeo.
- Dialogs e menu têm transições curtas e foco nativo. Controles continuam utilizáveis durante o movimento.

## Validação

Resultados consolidados e evidências em `docs/qa/`. Os testes verificam interfaces locais e não realizam compras, mensagens, commits ou deploy.

| Verificação                           | Resultado                                                                                                                                  |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Sintaxe, referências locais e âncoras | `node scripts/check.mjs`: aprovado; 35 IDs únicos, 65 referências/âncoras                                                                  |
| Catálogo                              | Cinco nomes/preços originais preservados; imagens de 17/17e corrigidas                                                                     |
| Chromium responsivo                   | 2560, 1440, 1280, 1024, 768, 430, 390 e 320 px: sem overflow da página nem imagens quebradas                                               |
| Console e rede                        | Nenhum erro de JavaScript nem falha de requisição na rodada principal                                                                      |
| Busca                                 | Modelo/cor, acentos normalizados, resultado vazio, seleção e foco                                                                          |
| Galeria                               | Setas, Home/End, posição e estados desabilitados                                                                                           |
| Detalhes                              | Conteúdo correto, Escape, retorno de foco e atalho de comparação                                                                           |
| Comparador                            | Atualização de modelo/preço; seleção repetida troca os lados mantendo dois modelos diferentes                                              |
| Mobile                                | Menu com contenção de foco, Escape, retorno de foco e âncora na posição esperada                                                           |
| Movimento                             | Scroll reverso; desktop/mobile e preferência reduzida alterados em execução, sem duplicação de triggers                                    |
| Movimento reduzido                    | Zero ScrollTriggers, sem ScrollSmoother e vídeo pausado                                                                                    |
| Falhas controladas                    | GSAP bloqueado mantém busca/conteúdo; vídeo bloqueado mantém poster                                                                        |
| Vídeo                                 | Controle manual pausa/reprodução funcionando                                                                                               |
| axe WCAG 2 A/AA e 2.1 AA              | Zero violações detectadas após correções, em 1440/390 px e busca aberta                                                                    |
| WebKit 27.2 automatizado              | Desktop 1440 × 900, iPhone 13 e iPad: sem overflow, imagens quebradas ou erros JS; busca, comparação, vídeo e movimento reduzido aprovados |
| Amostra de desempenho                 | Chrome local, sem limitação de rede/CPU: LCP 116 ms e CLS 0 durante o carregamento observado; não representa métricas de produção          |
| Integridade do diff                   | `git diff --check` aprovado                                                                                                                |

A inspeção visual abrangeu desktop e mobile. Os contrastes do manifesto foram ajustados considerando também o tom mais escuro da animação de fundo. O teste automatizado não substitui avaliação com leitores de tela nem testes em aparelhos físicos.

Evidências: [relatório JSON](qa/browser-report.json), [hero desktop](qa/desktop-hero.webp), [hero mobile](qa/mobile-hero.webp), [família mobile](qa/mobile-family.webp), [comparação mobile](qa/mobile-compare.webp), [experiência desktop](qa/desktop-experience.webp), [sistema e privacidade](qa/desktop-system.webp).

Ferramentas de navegador foram instaladas fora do projeto, em diretório temporário, e não introduzem dependências de execução ou compilação. Não existe build a executar na arquitetura estática; as verificações de sintaxe, assets, navegação, renderização e fluxo substituem essa etapa.

## Limitações e assets pendentes

- Não faltam assets para a experiência implementada. O nome futuro `assets/iphone-18-hero.mp4` é apenas um ponto de substituição documentado; o vídeo real existente é usado diretamente.
- Há apenas uma cor fotografada por modelo. Para habilitar seleção de cores, são necessárias imagens correspondentes e cadastro dessas variantes. Não foram feitas recolorações artificiais.
- Algumas fotografias de catálogo têm apenas 372 px de largura, limitando a nitidez em grandes ampliações. Não foi feita geração artificial de detalhes.
- Dados técnicos adicionais dependem de fontes verificadas. O comparador apresenta nome, imagem, descrição original, acabamento e preço existente; preços não foram atualizados nem verificados comercialmente.
- WebKit automatizado não equivale a testes físicos em todos os iPhones/Safari. Métricas locais não são Core Web Vitals de campo nem certificação de acessibilidade.
- Não houve publicação. O vídeo que já estava sem rastreamento e os novos assets devem acompanhar uma futura publicação autorizada.

Referências técnicas consultadas: [gsap.matchMedia](<https://gsap.com/docs/v3/GSAP/gsap.matchMedia()>), [ScrollSmoother](https://gsap.com/docs/v3/Plugins/ScrollSmoother/) e [SplitText](https://gsap.com/docs/v3/Plugins/SplitText/).
