# Tech.apple — Uma nova perspectiva

Experiência conceitual independente desenvolvida por João Carlos, com direção visual Light. Apresenta um estudo visual do iPhone 18 Pro e preserva a família iPhone do projeto original. Não possui vínculo com a Apple, vendas ou checkout.

## Executar

Projeto estático, sem instalação de dependências ou compilação:

```sh
python3 -m http.server 4173
```

Abra `http://localhost:4173`. Sirva por HTTP para que vídeos e recursos locais funcionem corretamente.

```sh
node scripts/check.mjs
```

Esse comando verifica a sintaxe JavaScript, os arquivos referenciados, as âncoras, IDs duplicados e a preservação dos cinco modelos/preços originais.

## Estrutura

- `index.html`: estrutura semântica e catálogo original como fonte de dados.
- `styles.css`: tokens, composições, estados, desktop/tablet/mobile e movimento reduzido.
- `script.js`: busca, galeria, comparação, dialogs, vídeo e sistema de animação.
- `IMGS/`: assets originais, preservados.
- `assets/`: poster extraído do vídeo fornecido, versão WebP, favicon e GSAP local.
- `docs/redesign-verification.md`: auditoria, decisões, testes e limites da entrega.

## Interações

Busca por nome ou cor, com resultados e estado vazio. Galeria com setas, gestos nativos, Home/End e indicador de posição. Detalhes em dialogs nativos com Escape e retorno de foco. Comparação entre dois modelos, com troca automática quando a seleção coincide. O controle de sacola foi substituído pela navegação de comparação; nenhuma compra é simulada.

Cada produto possui **uma única cor com imagem real**. A interface exibe o acabamento disponível; não há seletores de variações sem assets. O cadastro é derivado dos cards HTML, evitando divergência de nomes, preços e imagens entre busca, modais e comparação. `specifications: null` reserva a extensão para dados técnicos verificados.

## Mídia e movimento

A hero utiliza o arquivo já fornecido em `IMGS/iPhone_product_reveal_video_1080p_20261010133414.mp4`. O poster foi extraído desse vídeo, sem gerar ou recolorir aparelhos. Para uma substituição futura, adicione `assets/iphone-18-hero.mp4` e atualize `data-src` no elemento `<video>`; substitua também o poster por um frame correspondente. A aplicação não tenta carregar o caminho futuro enquanto ele não existir.

O vídeo é silencioso, inline, pausável e suspenso fora da tela ou em uma aba oculta. Preferência por movimento reduzido e economia de dados usam o poster. GSAP 3.13.0, ScrollTrigger, ScrollSmoother e SplitText estão em `assets/vendor/`, com seus avisos de licença. Há uma única instância de ScrollSmoother apenas em desktop com ponteiro preciso. A galeria usa rolagem horizontal nativa. Sem GSAP, conteúdo e interações permanecem disponíveis.

## Deploy

Continua sendo um site estático compatível com Vercel: preset **Other**, sem Build Command e diretório de saída na raiz (`.`). Os arquivos de `assets/` e o vídeo de `IMGS/` precisam acompanhar o deploy. Não há variáveis de ambiente nem serviços externos. Esta entrega altera apenas o checkout local.
