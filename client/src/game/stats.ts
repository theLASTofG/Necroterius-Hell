/**
 * ============================================================
 * AFK BATTLE ARENA — MÓDULO DE STATS
 * ============================================================
 * Responsável por calcular os stats finais do personagem
 * combinando stats base + todos os modificadores de equipamentos.
 *
 * REGRAS DE CAPS (limites máximos para balanceamento):
 * - Esquiva: máx 60%
 * - Redução de dano %: máx 75%
 * - Velocidade de ataque: máx 10.0 ataques/s
 * - Crítico: máx 95%
 * - Crítico dano: sem cap (pode escalar infinitamente)
 * ============================================================
 */

import {
  Character,
  CharacterStats,
  Item,
  ItemModifier,
  EquipSlot,
  BASE_CHARACTER_STATS,
} from './types';

// ─── CAPS DE STATS ───────────────────────────────────────────
export const STAT_CAPS = {
  dodgeChance: 60,      // % máximo de esquiva
  defensePct: 75,       // % máximo de redução de dano
  attackSpeed: 10.0,    // Ataques por segundo máximo
  critRate: 95,         // % máximo de chance crítica
  blockChance: 75,      // % máximo de bloqueio
} as const;

/**
 * Aplica um modificador de item a um objeto de stats.
 * Modifica o objeto in-place para performance.
 */
function applyModifier(stats: CharacterStats, mod: ItemModifier): void {
  switch (mod.type) {
    case 'attack_damage':
      stats.attackDamage += mod.value;
      break;
    case 'attack_damage_pct':
      stats.attackDamage *= (1 + mod.value / 100);
      break;
    case 'crit_rate':
      stats.critRate += mod.value;
      break;
    case 'crit_damage':
      stats.critDamage += mod.value;
      break;
    case 'attack_speed':
      stats.attackSpeed += mod.value / 100; // valor em %, ex: 20 = +20%
      break;
    case 'double_attack_chance':
      stats.doubleAttackChance += mod.value;
      break;
    case 'triple_attack_chance':
      stats.tripleAttackChance += mod.value;
      break;
    case 'bleed_chance':
      stats.bleedChance += mod.value;
      break;
    case 'bleed_damage':
      stats.bleedDamage += mod.value;
      break;
    case 'bleed_duration':
      stats.bleedDuration += mod.value;
      break;
    case 'max_hp':
      stats.maxHp += mod.value;
      break;
    case 'max_hp_pct':
      stats.maxHp *= (1 + mod.value / 100);
      break;
    case 'defense':
      stats.defense += mod.value;
      break;
    case 'defense_pct':
      stats.defensePct += mod.value;
      break;
    case 'dodge_chance':
      stats.dodgeChance += mod.value;
      break;
    case 'block_chance':
      stats.blockChance += mod.value;
      break;
    case 'block_value':
      stats.blockValue += mod.value;
      break;
    case 'gold_find':
      stats.goldFind += mod.value;
      break;
    case 'item_find':
      stats.itemFind += mod.value;
      break;
    case 'xp_gain':
      stats.xpGain += mod.value;
      break;
    case 'hp_regen':
      stats.hpRegen += mod.value;
      break;
    case 'lifesteal':
      stats.lifesteal += mod.value;
      break;
    case 'thorns':
      stats.thorns += mod.value;
      break;
  }
}

/**
 * Aplica todos os modificadores de um item (base + bônus) aos stats.
 */
function applyItemStats(stats: CharacterStats, item: Item): void {
  for (const mod of item.baseStats) {
    applyModifier(stats, mod);
  }
  for (const mod of item.bonusStats) {
    applyModifier(stats, mod);
  }
  // Aplicar modifiers do efeito único (se houver)
  if (item.uniqueEffect) {
    for (const mod of item.uniqueEffect.modifiers) {
      applyModifier(stats, mod);
    }
  }
}

/**
 * Aplica os caps de stats para garantir balanceamento.
 * Chamado após todos os modificadores serem aplicados.
 */
function applyStatCaps(stats: CharacterStats): void {
  stats.dodgeChance = Math.min(stats.dodgeChance, STAT_CAPS.dodgeChance);
  stats.defensePct = Math.min(stats.defensePct, STAT_CAPS.defensePct);
  stats.attackSpeed = Math.min(stats.attackSpeed, STAT_CAPS.attackSpeed);
  stats.critRate = Math.min(stats.critRate, STAT_CAPS.critRate);
  stats.blockChance = Math.min(stats.blockChance, STAT_CAPS.blockChance);

  // Garantir valores mínimos
  stats.attackSpeed = Math.max(stats.attackSpeed, 0.1);
  stats.maxHp = Math.max(stats.maxHp, 1);
  stats.attackDamage = Math.max(stats.attackDamage, 1);
}

/**
 * Calcula os stats completos do personagem incluindo todos os equipamentos.
 * Retorna um novo objeto CharacterStats (não modifica o original).
 *
 * Ordem de aplicação:
 * 1. Stats base do personagem
 * 2. Bônus por nível
 * 3. Modificadores flat de todos os equipamentos
 * 4. Modificadores percentuais
 * 5. Aplicação de caps
 */
export function computeCharacterStats(character: Character): CharacterStats {
  // Clonar stats base para não modificar o original
  const stats: CharacterStats = { ...character.baseStats };

  // Bônus por nível: +5 HP, +1 dano, +0.5% crit por nível
  const levelBonus = character.level - 1;
  stats.maxHp += levelBonus * 5;
  stats.attackDamage += levelBonus * 1;
  stats.critRate += levelBonus * 0.5;

  // Aplicar todos os equipamentos
  const slots: EquipSlot[] = [
    'mainhand', 'offhand', 'helmet', 'chest',
    'pants', 'boots', 'amulet1', 'amulet2', 'amulet3'
  ];

  for (const slot of slots) {
    const item = character.equipment[slot];
    if (item) {
      applyItemStats(stats, item);
    }
  }

  // Aplicar caps
  applyStatCaps(stats);

  // HP atual não pode exceder o máximo
  stats.currentHp = Math.min(character.baseStats.currentHp, stats.maxHp);

  return stats;
}

/**
 * Calcula o XP necessário para o próximo nível.
 * Fórmula: base * (nível ^ expoente)
 * Escala suavemente para progressão infinita.
 */
export function xpToNextLevel(level: number): number {
  const base = 100;
  const exponent = 1.5;
  return Math.floor(base * Math.pow(level, exponent));
}

/**
 * Calcula o dano final após aplicar defesa do alvo.
 * Fórmula: dano * (1 - defensePct/100) - defenseFlat
 * Dano mínimo: 1 (sempre causa pelo menos 1 de dano)
 */
export function calculateDamageAfterDefense(
  rawDamage: number,
  targetDefense: number,
  targetDefensePct: number
): number {
  const afterPct = rawDamage * (1 - targetDefensePct / 100);
  const afterFlat = afterPct - targetDefense;
  return Math.max(1, Math.floor(afterFlat));
}

/**
 * Calcula o score de poder de um item para comparação.
 * Usado para auto-equip e exibição de "melhor item".
 */
export function calculateItemPower(item: Item): number {
  let power = 0;
  const allMods = [...item.baseStats, ...item.bonusStats];

  for (const mod of allMods) {
    // Pesos por tipo de modificador para score de poder
    const weights: Partial<Record<typeof mod.type, number>> = {
      attack_damage: 2.0,
      attack_damage_pct: 1.8,
      max_hp: 1.0,
      max_hp_pct: 1.2,
      crit_rate: 1.5,
      crit_damage: 1.3,
      attack_speed: 1.6,
      defense: 0.8,
      defense_pct: 1.0,
      dodge_chance: 1.2,
      double_attack_chance: 1.4,
      triple_attack_chance: 1.6,
      bleed_chance: 1.1,
      lifesteal: 1.5,
    };

    const weight = weights[mod.type] ?? 0.5;
    power += mod.value * weight;
  }

  return Math.floor(power);
}

/**
 * Verifica se um item é melhor que o equipado no mesmo slot.
 * Retorna true se o novo item tem maior power score.
 */
export function isItemUpgrade(
  newItem: Item,
  equippedItem: Item | undefined
): boolean {
  if (!equippedItem) return true;
  return calculateItemPower(newItem) > calculateItemPower(equippedItem);
}

/**
 * Formata um valor de stat para exibição.
 * Ex: 25.5 -> "25.5%", 100 -> "100"
 */
export function formatStatValue(value: number, isPercent: boolean): string {
  const rounded = Math.round(value * 10) / 10;
  return isPercent ? `${rounded}%` : `${rounded}`;
}

/**
 * Retorna o label de exibição de um modificador.
 * Ex: { type: 'crit_rate', value: 15, isPercent: true } -> "+15% Chance Crítica"
 */
export function getModifierLabel(mod: ItemModifier): string {
  const labels: Record<string, string> = {
    attack_damage: 'Dano de Ataque',
    attack_damage_pct: 'Dano de Ataque',
    crit_rate: 'Chance Crítica',
    crit_damage: 'Dano Crítico',
    attack_speed: 'Velocidade de Ataque',
    double_attack_chance: 'Chance Duplo Ataque',
    triple_attack_chance: 'Chance Triplo Ataque',
    bleed_chance: 'Chance Sangramento',
    bleed_damage: 'Dano Sangramento',
    bleed_duration: 'Duração Sangramento',
    max_hp: 'HP Máximo',
    max_hp_pct: 'HP Máximo',
    defense: 'Defesa',
    defense_pct: 'Redução de Dano',
    dodge_chance: 'Chance de Esquiva',
    block_chance: 'Chance de Bloqueio',
    block_value: 'Valor de Bloqueio',
    gold_find: 'Bônus de Ouro',
    item_find: 'Bônus de Drop',
    xp_gain: 'Bônus de XP',
    hp_regen: 'Regeneração de HP',
    lifesteal: 'Roubo de Vida',
    thorns: 'Espinhos',
  };

  const label = labels[mod.type] ?? mod.type;
  const sign = mod.value >= 0 ? '+' : '';
  const suffix = mod.isPercent ? '%' : '';
  return `${sign}${mod.value}${suffix} ${label}`;
}
