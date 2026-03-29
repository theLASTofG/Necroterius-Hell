# AFK Battle Arena — Ideias de Design

## Contexto
Jogo AFK battle com progressão infinita, background preto, foco na batalha e mobs aleatórios.
Interface minimalista mas com identidade visual forte. Sem distrações visuais excessivas.

---

<response>
<probability>0.07</probability>
<text>

## Ideia A — "Dungeon Terminal" (Low-Key Cyberpunk Arcano)

**Design Movement:** Cyberpunk Arcano — tecnologia sombria misturada com magia medieval corrompida.

**Core Principles:**
1. Tudo acontece no escuro — o jogador é o único ponto de luz
2. Informação densa mas legível — estilo terminal de dados com fontes monoespaçadas para stats
3. Contrastes extremos — preto profundo vs. neon vermelho/âmbar para alertas críticos
4. Hierarquia visual por brilho — quanto mais importante, mais brilhante

**Color Philosophy:**
- Background: `#050508` — preto quase absoluto com leve toque azul
- Primário: `#E8C547` — âmbar dourado para elementos de UI principais (HP, nomes)
- Acento crítico: `#FF3B3B` — vermelho neon para dano, sangramento, morte
- Acento mágico: `#7B4FFF` — roxo elétrico para magia e itens raros
- Texto base: `#8A8A9A` — cinza frio para texto secundário
- Borda sutil: `#1A1A2E` — azul-noite para separadores

**Layout Paradigm:**
- Tela dividida assimetricamente: arena de batalha ocupa 60% central, painéis de stats nas laterais
- Painéis laterais colapsáveis com animação de slide
- Inventário em drawer inferior que sobe com animação
- Sem grid centralizado — elementos ancorados nas bordas como HUD de FPS

**Signature Elements:**
1. Scanlines sutis sobre o background da arena (CSS pseudo-element com opacity 0.03)
2. Bordas com efeito "glitch" em itens lendários — animação de deslocamento de cor
3. Números de dano flutuando com fonte monoespaçada e efeito de fade-up

**Interaction Philosophy:**
- Cliques produzem micro-feedback visual imediato (flash de cor)
- Hover em itens expande tooltip com animação de "boot" — dados aparecem linha por linha
- Botões sem bordas arredondadas — cantos retos ou levemente cortados (clip-path)

**Animation:**
- Dano: números flutuam para cima com ease-out, fade em 800ms
- Morte de mob: flash branco → dissolve em partículas (CSS keyframes)
- Loot drop: item "materializa" com animação de scan de cima para baixo
- Transição de wave: fade-to-black com texto de wave number em fonte grande

**Typography System:**
- Display/Títulos: `Share Tech Mono` — monoespaçada com personalidade tech-arcana
- UI/Stats: `JetBrains Mono` — legibilidade máxima para números
- Corpo/Lore: `Crimson Pro` — serifada elegante para descrições de itens

</text>
</response>

<response>
<probability>0.06</probability>
<text>

## Ideia B — "Ink & Ash" (Gravura Medieval Sombria)

**Design Movement:** Woodcut Medieval — estética de gravura em madeira, manuscritos iluminados corrompidos.

**Core Principles:**
1. Texturas orgânicas sobre fundo escuro — nada é perfeitamente liso
2. Tipografia serifada pesada com tracking apertado
3. Ícones como ilustrações de grimório — traços grossos, sem gradientes
4. Paleta de tinta e pergaminho queimado

**Color Philosophy:**
- Background: `#0A0805` — preto com calor, como tinta seca
- Primário: `#C8A96E` — pergaminho dourado envelhecido
- Acento: `#8B1A1A` — vermelho sangue escuro para elementos de combate
- Especial: `#2D5A27` — verde veneno para buffs/debuffs
- Texto: `#D4C5A9` — bege desbotado

**Layout Paradigm:**
- Layout de pergaminho vertical — conteúdo flui de cima para baixo como um manuscrito
- Separadores ornamentais entre seções (SVG de traços decorativos)
- Arena centralizada com moldura de gravura

**Signature Elements:**
1. Bordas com textura de madeira gravada (SVG pattern)
2. Títulos com drop shadow de tinta borrada
3. Raridade de itens indicada por selos de cera coloridos

**Interaction Philosophy:**
- Hover em itens abre "página de grimório" lateral
- Sons de pergaminho ao interagir (opcional)

**Animation:**
- Dano: respingos de tinta
- Morte: dissolve em cinzas
- Loot: item "emerge" do chão como tinta subindo

**Typography System:**
- Display: `Cinzel Decorative` — romano gravado
- Body: `IM Fell English` — manuscrito histórico
- Mono: `Courier Prime` — máquina de escrever antiga

</text>
</response>

<response>
<probability>0.05</probability>
<text>

## Ideia C — "Void Signal" (Minimalismo Agressivo Dark) ← ESCOLHIDA

**Design Movement:** Brutal Minimalism Dark — menos é mais, mas cada elemento tem peso e intenção.

**Core Principles:**
1. Background preto absoluto — a arena é o vazio, os combatentes emergem dele
2. Cor como linguagem — cada cor tem um único significado semântico estrito
3. Tipografia como elemento gráfico — tamanhos extremos criam hierarquia visual
4. Animações funcionais — só existem para comunicar estado, nunca decorativas

**Color Philosophy:**
- Background: `#000000` — preto absoluto, sem concessões
- HP/Vida: `#22C55E` — verde puro (saúde)
- Dano físico: `#EF4444` — vermelho direto
- Mana/Magia: `#3B82F6` — azul limpo
- Sangramento: `#DC2626` — vermelho mais escuro, pulsante
- Crítico: `#FBBF24` — âmbar brilhante
- Lendário: `#A855F7` — roxo saturado
- Raro: `#3B82F6` — azul
- Incomum: `#22C55E` — verde
- Comum: `#9CA3AF` — cinza
- Texto principal: `#F9FAFB` — branco quase puro
- Texto secundário: `#6B7280` — cinza médio

**Layout Paradigm:**
- Arena ocupa o centro da tela — sprites de combate grandes e legíveis
- HUD mínimo: barras de HP/MP no topo, log de combate à direita
- Inventário/Equipamentos em painel lateral esquerdo retrátil
- Informações de wave/progresso no topo centralizado
- Sem decoração — cada pixel tem função

**Signature Elements:**
1. Barras de HP com animação de "drain" suave (não pula, diminui fluidamente)
2. Números de dano com tamanho proporcional ao valor — críticos são GRANDES
3. Borda de cor na raridade do item — 2px sólido, sem gradiente

**Interaction Philosophy:**
- Zero cliques desnecessários — tudo acontece automaticamente (AFK)
- Interação manual apenas para: equipar itens, comprar no mercante, pausar
- Tooltips instantâneos sem delay — informação sempre disponível

**Animation:**
- Dano: número flutua +Y com ease-out cubic, opacity 0→1→0 em 1.2s
- Crítico: escala 1→1.4→1 em 200ms antes de flutuar
- Sangramento: tick de dano com cor pulsante a cada 1s
- Morte de mob: flash de cor da raridade → fade out em 400ms
- Loot: item aparece com scale 0→1 com spring animation
- Mercante: painel desliza da direita com ease-out

**Typography System:**
- Display/Wave: `Bebas Neue` — condensada, impactante, sem serifa
- Stats/Números: `Space Mono` — monoespaçada, alinhamento perfeito para números
- UI/Labels: `DM Sans` — sem serifa geométrica limpa, legível em tamanhos pequenos
- Hierarquia: 48px display → 24px títulos → 14px labels → 11px micro-texto

</text>
</response>

---

## Design Escolhido: **Ideia C — "Void Signal"**

Brutal Minimalism Dark com background preto absoluto, sistema de cores semântico estrito,
tipografia de alto impacto e animações funcionais. Cada elemento visual existe para comunicar
estado de jogo — sem decoração supérflua.
