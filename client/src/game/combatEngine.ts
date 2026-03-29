/**
 * ============================================================
 * AFK BATTLE ARENA — ENGINE DE COMBATE AFK
 * ============================================================
 * O coração do jogo. Processa o combate automaticamente em ticks.
 *
 * FLUXO DE COMBATE:
 * 1. Jogador ataca o mob (baseado em attackSpeed)
 * 2. Mob ataca o jogador (baseado em attackSpeed do mob)
 * 3. Sangramentos fazem tick a cada 1 segundo
 * 4. HP regen do jogador aplica a cada segundo
 * 5. Quando mob morre: gera drops, ouro, XP
 * 6. Quando todos os mobs da wave morrem: próxima wave
 * 7. Quando jogador morre: game over
 *
 * MECÂNICAS ESPECIAIS:
 * - Crítico: dano * (critDamage/100)
 * - Duplo ataque: segundo ataque na mesma ação
 * - Triplo ataque: terceiro ataque (adagas)
 * - Sangramento: dano por tick durante N ticks
 * - Esquiva: ignora completamente o ataque
 * - Bloqueio: reduz dano pelo blockValue
 * - Espinhos: reflete dano ao atacante
 * - Roubo de vida: cura % do dano causado
 *
 * VELOCIDADE DE SIMULAÇÃO:
 * - Normal: 1x (tick a cada 100ms, 10 ticks/s)
 * - Rápido: 2x
 * - Ultra: 4x
 * ============================================================
 */

import { nanoid } from 'nanoid';
import {
  GameState,
  CombatState,
  CombatEvent,
  CombatEventType,
  BleedEffect,
  FloatingNumber,
  Mob,
  Character,
  CharacterStats,
} from './types';
import { computeCharacterStats, calculateDamageAfterDefense, calculateItemPower } from './stats';
import { generateMobDrops } from './itemGenerator';
import { generateWaveMobs, shouldMerchantAppear, generateMerchantName, generateMob, getMobTypeForWave } from './mobGenerator';
import { generateMerchantItems } from './itemGenerator';
import { xpToNextLevel } from './stats';

// ─── CONSTANTES ───────────────────────────────────────────────

/** Intervalo base do tick em ms (10 ticks por segundo) */
export const BASE_TICK_MS = 100;

/** Máximo de eventos no log de combate */
const MAX_COMBAT_LOG = 50;

/** Máximo de números flutuantes simultâneos */
const MAX_FLOATING_NUMBERS = 20;

// ─── UTILITÁRIOS ──────────────────────────────────────────────

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rollChance(chance: number): boolean {
  return Math.random() * 100 < chance;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ─── CRIAÇÃO DE EVENTOS DE COMBATE ───────────────────────────

function createEvent(
  type: CombatEventType,
  value: number,
  source: 'player' | 'mob',
  isCrit: boolean = false,
  label?: string
): CombatEvent {
  return {
    id: nanoid(),
    type,
    value,
    isCrit,
    source,
    timestamp: Date.now(),
    label,
  };
}

// ─── CÁLCULO DE ATAQUE ────────────────────────────────────────

interface AttackResult {
  events: CombatEvent[];
  totalDamage: number;
  healAmount: number;       // Lifesteal
  thornsReflect: number;    // Dano refletido (espinhos do alvo)
  appliedBleed: boolean;
  bleedDamage: number;
  bleedDuration: number;
}

/**
 * Calcula o resultado de um ataque do jogador no mob.
 */
function resolvePlayerAttack(
  playerStats: CharacterStats,
  mob: Mob
): AttackResult {
  const events: CombatEvent[] = [];
  let totalDamage = 0;
  let healAmount = 0;
  let appliedBleed = false;

  // Verificar esquiva do mob
  if (rollChance(mob.stats.dodgeChance)) {
    events.push(createEvent('dodge', 0, 'player', false, 'ESQUIVOU'));
    return { events, totalDamage: 0, healAmount: 0, thornsReflect: 0, appliedBleed: false, bleedDamage: 0, bleedDuration: 0 };
  }

  // Calcular número de ataques
  let attackCount = 1;
  if (rollChance(playerStats.tripleAttackChance)) {
    attackCount = 3;
  } else if (rollChance(playerStats.doubleAttackChance)) {
    attackCount = 2;
  }

  for (let i = 0; i < attackCount; i++) {
    // Verificar crítico
    const isCrit = rollChance(playerStats.critRate);
    const critMult = isCrit ? playerStats.critDamage / 100 : 1.0;

    // Dano base com variação de ±10%
    const rawDamage = playerStats.attackDamage * critMult * (0.9 + Math.random() * 0.2);

    // Aplicar defesa do mob
    const finalDamage = calculateDamageAfterDefense(
      rawDamage,
      mob.stats.defense,
      0 // Mobs não têm defensePct por padrão
    );

    totalDamage += finalDamage;

    // Lifesteal
    if (playerStats.lifesteal > 0) {
      healAmount += finalDamage * (playerStats.lifesteal / 100);
    }

    // Tipo de evento
    const eventType: CombatEventType = i === 0
      ? (isCrit ? 'crit' : 'attack')
      : (i === 1 ? 'double_attack' : 'triple_attack');

    events.push(createEvent(eventType, finalDamage, 'player', isCrit));
  }

  // Verificar sangramento
  if (playerStats.bleedChance > 0 && rollChance(playerStats.bleedChance)) {
    appliedBleed = true;
  }

  // Espinhos do mob (não implementado nos mobs por ora)
  const thornsReflect = 0;

  return {
    events,
    totalDamage,
    healAmount: Math.floor(healAmount),
    thornsReflect,
    appliedBleed,
    bleedDamage: playerStats.bleedDamage,
    bleedDuration: Math.max(3, playerStats.bleedDuration), // Mínimo 3 ticks
  };
}

/**
 * Calcula o resultado de um ataque do mob no jogador.
 */
function resolveMobAttack(
  mob: Mob,
  playerStats: CharacterStats
): { events: CombatEvent[]; totalDamage: number; thornsReflect: number; appliedBleed: boolean } {
  const events: CombatEvent[] = [];
  let totalDamage = 0;

  // Verificar esquiva do jogador
  if (rollChance(playerStats.dodgeChance)) {
    events.push(createEvent('dodge', 0, 'mob', false, 'ESQUIVOU'));
    return { events, totalDamage: 0, thornsReflect: 0, appliedBleed: false };
  }

  // Verificar bloqueio do jogador
  let blockedDamage = 0;
  if (rollChance(playerStats.blockChance)) {
    blockedDamage = playerStats.blockValue;
    events.push(createEvent('block', blockedDamage, 'mob', false, 'BLOQUEOU'));
  }

  // Crítico do mob
  const isCrit = rollChance(mob.stats.critRate);
  const critMult = isCrit ? mob.stats.critDamage / 100 : 1.0;

  // Dano base com variação
  const rawDamage = mob.stats.attackDamage * critMult * (0.9 + Math.random() * 0.2);

  // Aplicar defesa do jogador
  const afterDefense = calculateDamageAfterDefense(
    rawDamage,
    playerStats.defense,
    playerStats.defensePct
  );

  const finalDamage = Math.max(1, afterDefense - blockedDamage);
  totalDamage = finalDamage;

  events.push(createEvent(
    isCrit ? 'mob_crit' : 'mob_attack',
    finalDamage,
    'mob',
    isCrit
  ));

  // Espinhos do jogador
  let thornsReflect = 0;
  if (playerStats.thorns > 0) {
    thornsReflect = playerStats.thorns;
    events.push(createEvent('thorns', thornsReflect, 'player', false, 'ESPINHOS'));
  }

  // Sangramento do mob
  const appliedBleed = mob.stats.bleedChance > 0 && rollChance(mob.stats.bleedChance);

  return { events, totalDamage, thornsReflect, appliedBleed };
}

// ─── ESTADO INICIAL ───────────────────────────────────────────

/**
 * Cria o estado inicial de combate para uma nova wave.
 */
export function createInitialCombatState(wave: number = 1, maxWaveReached: number = 1): CombatState {
  const mobs = generateWaveMobs(wave);
  return {
    isRunning: false,
    isPaused: false,
    wave,
    maxWaveReached: Math.max(wave, maxWaveReached),
    isFarmMode: false,
    currentAreaId: 'area_1', // Padrão
    mobsInWave: mobs.length,
    mobsKilled: 0,
    currentMob: mobs[0] ?? null,
    playerBleedEffects: [],
    mobBleedEffects: [],
    combatLog: [],
    totalDamageDealt: 0,
    totalDamageTaken: 0,
    waveStartTime: Date.now(),
    lastTickTime: Date.now(),
  };
}

// ─── TICK DE COMBATE ──────────────────────────────────────────

export interface TickResult {
  newGameState: GameState;
  floatingNumbers: FloatingNumber[];
  mobDied: boolean;
  playerDied: boolean;
  waveClear: boolean;
  droppedItems: import('./types').Item[];
  goldGained: number;
  xpGained: number;
}

/**
 * Processa um tick de combate.
 * Chamado pelo loop de jogo a cada BASE_TICK_MS * (1/speedMultiplier) ms.
 *
 * Retorna o novo estado do jogo e eventos visuais para a UI.
 */
export function processCombatTick(
  gameState: GameState,
  deltaTimeMs: number
): TickResult {
  // Clonar estado para imutabilidade
  const state = deepCloneGameState(gameState);
  const floatingNumbers: FloatingNumber[] = [];
  let mobDied = false;
  let playerDied = false;
  let waveClear = false;
  let droppedItems: import('./types').Item[] = [];
  let goldGained = 0;
  let xpGained = 0;

  const { combat, character } = state;

  // Não processar se pausado ou sem mob
  if (!combat.isRunning || combat.isPaused || !combat.currentMob) {
    return { newGameState: state, floatingNumbers, mobDied, playerDied, waveClear, droppedItems, goldGained, xpGained };
  }

  // Calcular stats computados do personagem
  const playerStats = computeCharacterStats(character);

  const mob = combat.currentMob;
  const now = Date.now();

  // ── Acumuladores de tempo para ataques ────────────────────
  // Cada entidade tem um "timer" de ataque que acumula deltaTime
  // Quando timer >= 1000/attackSpeed, executa o ataque
  const playerAttackInterval = 1000 / playerStats.attackSpeed; // ms entre ataques
  const mobAttackInterval = 1000 / mob.stats.attackSpeed;

  // Usar lastTickTime para calcular quantos ataques aconteceram
  // (simplificado: 1 ataque por tick se o intervalo passou)
  const timeSinceLastTick = deltaTimeMs;

  // ── Ataque do jogador ─────────────────────────────────────
  // Probabilidade proporcional ao tempo: se intervalo=500ms e tick=100ms, chance=20%
  if (Math.random() < timeSinceLastTick / playerAttackInterval) {
    const attackResult = resolvePlayerAttack(playerStats, mob);

    // Aplicar dano no mob
    mob.stats.currentHp = Math.max(0, mob.stats.currentHp - attackResult.totalDamage);
    combat.totalDamageDealt += attackResult.totalDamage;

    // Adicionar eventos ao log
    addToCombatLog(combat, attackResult.events);

    // Números flutuantes de dano no mob
    for (const event of attackResult.events) {
      if (event.value > 0) {
        floatingNumbers.push(createFloatingNumber(event, 'mob'));
      }
    }

    // Lifesteal
    if (attackResult.healAmount > 0) {
      character.baseStats.currentHp = Math.min(
        playerStats.maxHp,
        character.baseStats.currentHp + attackResult.healAmount
      );
      floatingNumbers.push(createFloatingNumber(
        createEvent('heal', attackResult.healAmount, 'player'),
        'player'
      ));
    }

    // Aplicar sangramento no mob
    if (attackResult.appliedBleed && attackResult.bleedDamage > 0) {
      combat.mobBleedEffects.push({
        id: nanoid(),
        damage: attackResult.bleedDamage,
        ticksRemaining: attackResult.bleedDuration,
        source: 'player',
      });
    }
  }

  // ── Ataque do mob (se ainda vivo) ─────────────────────────────
  if (mob.stats.currentHp > 0) {
    if (Math.random() < timeSinceLastTick / mobAttackInterval) {
      const mobAttackResult = resolveMobAttack(mob, playerStats);

      // Aplicar dano no jogador
      character.baseStats.currentHp = Math.max(
        0,
        character.baseStats.currentHp - mobAttackResult.totalDamage
      );
      combat.totalDamageTaken += mobAttackResult.totalDamage;

      addToCombatLog(combat, mobAttackResult.events);

      // Números flutuantes no jogador
      for (const event of mobAttackResult.events) {
        if (event.value > 0) {
          floatingNumbers.push(createFloatingNumber(event, 'player'));
        }
      }

      // Espinhos refletidos
      if (mobAttackResult.thornsReflect > 0) {
        mob.stats.currentHp = Math.max(0, mob.stats.currentHp - mobAttackResult.thornsReflect);
      }

      // Sangramento do mob no jogador
      if (mobAttackResult.appliedBleed && mob.stats.bleedDamage > 0) {
        combat.playerBleedEffects.push({
          id: nanoid(),
          damage: mob.stats.bleedDamage,
          ticksRemaining: 3,
          source: 'mob',
        });
      }
    }
  }

  // ── Ticks de sangramento ──────────────────────────────────
  // Sangramento processa a cada 1000ms (simplificado: chance por tick)
  if (Math.random() < timeSinceLastTick / 1000) {
    // Sangramento no mob
    for (const bleed of combat.mobBleedEffects) {
      if (bleed.ticksRemaining > 0 && mob.stats.currentHp > 0) {
        mob.stats.currentHp = Math.max(0, mob.stats.currentHp - bleed.damage);
        combat.totalDamageDealt += bleed.damage;
        bleed.ticksRemaining--;
        addToCombatLog(combat, [createEvent('bleed_tick', bleed.damage, 'player', false, 'SANGRAMENTO')]);
        floatingNumbers.push(createFloatingNumber(
          createEvent('bleed_tick', bleed.damage, 'player'),
          'mob'
        ));
      }
    }
    combat.mobBleedEffects = combat.mobBleedEffects.filter(b => b.ticksRemaining > 0);

    // Sangramento no jogador
    for (const bleed of combat.playerBleedEffects) {
      if (bleed.ticksRemaining > 0) {
        character.baseStats.currentHp = Math.max(0, character.baseStats.currentHp - bleed.damage);
        combat.totalDamageTaken += bleed.damage;
        bleed.ticksRemaining--;
        addToCombatLog(combat, [createEvent('mob_bleed', bleed.damage, 'mob', false, 'SANGRAMENTO')]);
        floatingNumbers.push(createFloatingNumber(
          createEvent('mob_bleed', bleed.damage, 'mob'),
          'player'
        ));
      }
    }
    combat.playerBleedEffects = combat.playerBleedEffects.filter(b => b.ticksRemaining > 0);

    // HP Regen do jogador
    if (playerStats.hpRegen > 0 && character.baseStats.currentHp < playerStats.maxHp) {
      const regenAmount = Math.min(
        playerStats.hpRegen,
        playerStats.maxHp - character.baseStats.currentHp
      );
      character.baseStats.currentHp += regenAmount;
    }
  }

  // ── Verificar morte do mob ────────────────────────────────
  if (mob.stats.currentHp <= 0) {
    mobDied = true;
    combat.mobsKilled++;
    combat.mobBleedEffects = [];

    // Calcular recompensas
    const goldEarned = randInt(mob.goldReward.min, mob.goldReward.max);
    const goldBonus = Math.floor(goldEarned * (playerStats.goldFind / 100));
    goldGained = goldEarned + goldBonus;
    character.gold += goldGained;

    xpGained = Math.floor(mob.xpReward * (1 + playerStats.xpGain / 100));
    character.xp += xpGained;

    // Verificar level up
    while (character.xp >= character.xpToNextLevel) {
      character.xp -= character.xpToNextLevel;
      character.level++;
      character.xpToNextLevel = xpToNextLevel(character.level);
      // Curar completamente ao subir de nível
      character.baseStats.currentHp = computeCharacterStats(character).maxHp;
      state.gamePhase = 'levelup';
    }

    // Gerar drops
    droppedItems = generateMobDrops(
      mob.level,
      mob.type,
      playerStats.itemFind
    );

    // Adicionar drops ao inventário
    character.inventory.push(...droppedItems);

    // Auto-equipar itens melhores se a configuração estiver ativa
    if (state.settings.autoEquipBetter) {
      for (const item of droppedItems) {
        const equipped = character.equipment[item.slot];
        if (!equipped || calculateItemPower(item) > calculateItemPower(equipped)) {
          // Equipar o item (move o antigo para o inventário)
          const itemIndex = character.inventory.findIndex(i => i.id === item.id);
          if (itemIndex !== -1) {
            if (equipped) {
              // Já está no inventário por ser dropado, mas o equipado precisa ir para lá
              // Na verdade, o drop já está no inventário, então só precisamos trocar
              character.equipment[item.slot] = item;
              character.inventory.splice(itemIndex, 1);
              character.inventory.push(equipped);
            } else {
              character.equipment[item.slot] = item;
              character.inventory.splice(itemIndex, 1);
            }
          }
        }
      }
    }

    // Próximo mob ou próxima wave
    const nextMobIndex = combat.mobsKilled;
    const totalMobsInWave = combat.mobsInWave;

    if (nextMobIndex < totalMobsInWave) {
      // Próximo mob na wave — determinar tipo e gerar
      const mobType = getMobTypeForWave(combat.wave, nextMobIndex, totalMobsInWave);
      combat.currentMob = generateMob(combat.wave, mobType);
    } else {
      // Wave completa!
      waveClear = true;
      combat.isRunning = false;

      // Verificar se mercante aparece
      if (shouldMerchantAppear(combat.wave)) {
        const merchantItems = generateMerchantItems(combat.wave, playerStats.itemFind);
        state.merchant = {
          id: nanoid(),
          name: generateMerchantName(),
          wave: combat.wave,
          items: merchantItems.map(item => ({
            item,
            originalPrice: item.price,
            discountPct: Math.random() < 0.3 ? randInt(10, 30) : 0,
            finalPrice: item.price,
          })),
          specialOffer: undefined,
          refreshCost: Math.floor(50 * combat.wave),
        };
        // Aplicar desconto
        for (const mi of state.merchant.items) {
          mi.finalPrice = Math.floor(mi.originalPrice * (1 - mi.discountPct / 100));
        }
        state.showMerchant = true;
        state.gamePhase = 'merchant';
      } else {
        // Avançar para próxima wave ou repetir se estiver em modo farm
        const nextWave = combat.isFarmMode ? combat.wave : combat.wave + 1;
        const nextWaveMobs = generateWaveMobs(nextWave);
        const newMaxWave = Math.max(combat.maxWaveReached, nextWave);
        
        state.combat = {
          ...createInitialCombatState(nextWave, newMaxWave),
          isFarmMode: combat.isFarmMode,
          currentAreaId: combat.currentAreaId,
          currentMob: nextWaveMobs[0],
          mobsInWave: nextWaveMobs.length,
          isRunning: true,
          waveStartTime: Date.now(),
          lastTickTime: Date.now(),
        };
      }
    }
  }

  // ── Verificar morte do jogador ────────────────────────────
  // Ao invés de game over, fazer retry automático (AFK infinito)
  if (character.baseStats.currentHp <= 0) {
    playerDied = true;
    // Restaurar vida do jogador para o máximo
    character.baseStats.currentHp = character.computedStats.maxHp;
    
    // Adicionar evento de morte/ressurreição ao log
    addToCombatLog(combat, [createEvent('dodge', 0, 'player', false, 'RESSURREIÇÃO')]);
    
    // Reiniciar o mob atual (o jogador "morreu" mas volta imediatamente)
    if (combat.currentMob) {
      combat.currentMob.stats.currentHp = combat.currentMob.stats.maxHp;
    }
    
    // Garantir que o combate continue rodando
    combat.isRunning = true;
    state.gamePhase = 'combat';
  }

  // Atualizar stats computados
  character.computedStats = computeCharacterStats(character);
  combat.lastTickTime = now;

  return {
    newGameState: state,
    floatingNumbers,
    mobDied,
    playerDied,
    waveClear,
    droppedItems,
    goldGained,
    xpGained,
  };
}

// ─── UTILITÁRIOS INTERNOS ─────────────────────────────────────

function addToCombatLog(combat: CombatState, events: CombatEvent[]): void {
  combat.combatLog.push(...events);
  // Manter apenas os últimos N eventos
  if (combat.combatLog.length > MAX_COMBAT_LOG) {
    combat.combatLog = combat.combatLog.slice(-MAX_COMBAT_LOG);
  }
}

function createFloatingNumber(event: CombatEvent, target: 'player' | 'mob'): FloatingNumber {
  // Posição aleatória na área do alvo
  const isPlayer = target === 'player';
  return {
    id: nanoid(),
    value: event.value,
    type: event.type,
    x: isPlayer ? randInt(20, 45) : randInt(55, 80), // % da tela
    y: randInt(30, 60),
    createdAt: Date.now(),
  };
}

/**
 * Clone profundo do estado do jogo para imutabilidade.
 * Necessário para evitar mutações acidentais no estado React.
 */
function deepCloneGameState(state: GameState): GameState {
  return JSON.parse(JSON.stringify(state));
}

// ─── AÇÕES DO JOGADOR ─────────────────────────────────────────

/**
 * Equipa um item no slot correspondente.
 * Se já havia um item no slot, move para o inventário.
 */
export function equipItem(state: GameState, itemId: string): GameState {
  const newState = deepCloneGameState(state);
  const { character } = newState;

  // Encontrar item no inventário
  const itemIndex = character.inventory.findIndex(i => i.id === itemId);
  if (itemIndex === -1) return state;

  const item = character.inventory[itemIndex];

  // Verificar nível mínimo
  if (character.level < item.requiredLevel) return state;

  // Desequipar item atual (se houver)
  const currentEquipped = character.equipment[item.slot];
  if (currentEquipped) {
    character.inventory.push(currentEquipped);
  }

  // Equipar novo item
  character.equipment[item.slot] = item;
  character.inventory.splice(itemIndex, 1);

  // Recalcular stats
  character.computedStats = computeCharacterStats(character);

  return newState;
}

/**
 * Desequipa um item e move para o inventário.
 */
export function unequipItem(state: GameState, slot: import('./types').EquipSlot): GameState {
  const newState = deepCloneGameState(state);
  const { character } = newState;

  const item = character.equipment[slot];
  if (!item) return state;

  character.inventory.push(item);
  delete character.equipment[slot];
  character.computedStats = computeCharacterStats(character);

  return newState;
}

/**
 * Compra um item do mercante.
 */
export function buyMerchantItem(state: GameState, itemId: string): GameState {
  if (!state.merchant) return state;
  const newState = deepCloneGameState(state);
  const { character, merchant } = newState;

  if (!merchant) return state;

  const merchantItemIndex = merchant.items.findIndex(mi => mi.item.id === itemId);
  if (merchantItemIndex === -1) return state;

  const merchantItem = merchant.items[merchantItemIndex];

  // Verificar ouro suficiente
  if (character.gold < merchantItem.finalPrice) return state;

  // Deduzir ouro e adicionar item ao inventário
  character.gold -= merchantItem.finalPrice;
  character.inventory.push(merchantItem.item);

  // Remover item do mercante
  merchant.items.splice(merchantItemIndex, 1);

  character.computedStats = computeCharacterStats(character);

  return newState;
}

/**
 * Descarta um item do inventário.
 */
export function discardItem(state: GameState, itemId: string): GameState {
  const newState = deepCloneGameState(state);
  const { character } = newState;

  const index = character.inventory.findIndex(i => i.id === itemId);
  if (index === -1) return state;

  // Vender por 20% do preço
  const item = character.inventory[index];
  character.gold += Math.floor(item.price * 0.2);
  character.inventory.splice(index, 1);

  return newState;
}

/**
 * Inicia a próxima wave após o mercante.
 */
export function startNextWave(state: GameState): GameState {
  const newState = deepCloneGameState(state);
  const nextWave = newState.combat.wave + 1;
  const waveMobs = generateWaveMobs(nextWave);

  newState.combat = {
    ...createInitialCombatState(nextWave),
    currentMob: waveMobs[0],
    mobsInWave: waveMobs.length,
    isRunning: true,
    waveStartTime: Date.now(),
    lastTickTime: Date.now(),
  };
  newState.showMerchant = false;
  newState.merchant = null;
  newState.gamePhase = 'combat';

  return newState;
}

/**
 * Reinicia o jogo do zero.
 */
export function restartGame(state: GameState): GameState {
  const newState = deepCloneGameState(state);
  const { character } = newState;

  // Resetar personagem
  character.level = 1;
  character.xp = 0;
  character.xpToNextLevel = xpToNextLevel(1);
  character.gold = 100;
  character.baseStats.currentHp = character.baseStats.maxHp;
  character.equipment = {};
  character.inventory = [];
  character.computedStats = computeCharacterStats(character);

  // Resetar combate
  const waveMobs = generateWaveMobs(1);
  newState.combat = {
    ...createInitialCombatState(1),
    currentMob: waveMobs[0],
    mobsInWave: waveMobs.length,
    isRunning: true,
    waveStartTime: Date.now(),
    lastTickTime: Date.now(),
  };

  newState.merchant = null;
  newState.showMerchant = false;
  newState.gamePhase = 'combat';

  return newState;
}
