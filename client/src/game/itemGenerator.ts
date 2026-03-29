/**
 * ============================================================
 * AFK BATTLE ARENA — GERADOR PROCEDURAL DE ITENS
 * ============================================================
 * Gera itens aleatórios com modificadores baseados em:
 * - Raridade (comum → lendário)
 * - Slot do item (arma, armadura, amuleto)
 * - Nível da wave atual (escala o poder dos itens)
 *
 * FILOSOFIA DE DESIGN:
 * - Itens comuns: 1-2 stats base, 0 bônus
 * - Incomuns: 2 stats base, 1 bônus
 * - Raros: 2-3 stats base, 2 bônus
 * - Épicos: 3 stats base, 3 bônus
 * - Lendários: 3-4 stats base, 4-5 bônus + efeito especial
 *
 * Itens lendários são extremamente poderosos mas raros.
 * Alguns lendários requerem outros itens para funcionar.
 * ============================================================
 */

import { nanoid } from 'nanoid';
import {
  Item,
  ItemModifier,
  ModifierType,
  Rarity,
  EquipSlot,
  WeaponType,
  ItemAffix,
  RARITY_POWER_MULT,
  RARITY_DROP_CHANCE,
  AFFIX_CHANCES,
  generateRandomAffix,
} from './types';

// ─── UTILITÁRIOS ALEATÓRIOS ──────────────────────────────────

/** Número aleatório entre min e max (inclusivo) */
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Número aleatório float entre min e max */
function randFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/** Escolhe um elemento aleatório de um array */
function randChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Rola um dado de chance (0-100), retorna true se passar */
function rollChance(chance: number): boolean {
  return Math.random() * 100 < chance;
}

// ─── SORTEIO DE RARIDADE ─────────────────────────────────────

/**
 * Sorteia uma raridade baseada nas chances de drop.
 * Pode receber um bônus de item_find para aumentar chances de raros.
 */
export function rollRarity(itemFindBonus: number = 0): Rarity {
  // Ajustar chances com bônus de item find
  const bonusMultiplier = 1 + itemFindBonus / 100;

  const chances = {
    common:    RARITY_DROP_CHANCE.common,
    uncommon:  RARITY_DROP_CHANCE.uncommon * bonusMultiplier,
    rare:      RARITY_DROP_CHANCE.rare * bonusMultiplier,
    epic:      RARITY_DROP_CHANCE.epic * bonusMultiplier,
    legendary: RARITY_DROP_CHANCE.legendary * bonusMultiplier,
    mythic:    RARITY_DROP_CHANCE.mythic * bonusMultiplier,
    celestial: RARITY_DROP_CHANCE.celestial * bonusMultiplier,
  };

  const total = Object.values(chances).reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;

  for (const [rarity, chance] of Object.entries(chances)) {
    roll -= chance;
    if (roll <= 0) return rarity as Rarity;
  }

  return 'common';
}

// ─── POOLS DE MODIFICADORES POR SLOT ─────────────────────────

/** Modificadores disponíveis para armas principais */
const MAINHAND_MODS: ModifierType[] = [
  'attack_damage', 'attack_damage_pct', 'crit_rate', 'crit_damage',
  'attack_speed', 'double_attack_chance', 'triple_attack_chance',
  'bleed_chance', 'bleed_damage', 'lifesteal',
];

/** Modificadores disponíveis para armas secundárias */
const OFFHAND_MODS: ModifierType[] = [
  'attack_damage', 'crit_rate', 'block_chance', 'block_value',
  'defense', 'dodge_chance', 'attack_speed', 'bleed_chance',
];

/** Modificadores disponíveis para capacete */
const HELMET_MODS: ModifierType[] = [
  'max_hp', 'max_hp_pct', 'defense', 'defense_pct',
  'dodge_chance', 'crit_rate', 'hp_regen', 'xp_gain',
];

/** Modificadores disponíveis para peitoral */
const CHEST_MODS: ModifierType[] = [
  'max_hp', 'max_hp_pct', 'defense', 'defense_pct',
  'thorns', 'hp_regen', 'block_chance', 'block_value',
];

/** Modificadores disponíveis para calça */
const PANTS_MODS: ModifierType[] = [
  'max_hp', 'defense', 'dodge_chance', 'attack_speed',
  'defense_pct', 'hp_regen', 'gold_find',
];

/** Modificadores disponíveis para botas */
const BOOTS_MODS: ModifierType[] = [
  'dodge_chance', 'attack_speed', 'defense', 'max_hp',
  'gold_find', 'item_find', 'hp_regen',
];

/** Modificadores disponíveis para amuletos — mais variados */
const AMULET_MODS: ModifierType[] = [
  'attack_damage', 'attack_damage_pct', 'crit_rate', 'crit_damage',
  'max_hp', 'max_hp_pct', 'defense', 'dodge_chance',
  'lifesteal', 'gold_find', 'item_find', 'xp_gain',
  'double_attack_chance', 'bleed_chance', 'hp_regen', 'thorns',
];

function getModPoolForSlot(slot: EquipSlot): ModifierType[] {
  switch (slot) {
    case 'mainhand': return MAINHAND_MODS;
    case 'offhand':  return OFFHAND_MODS;
    case 'helmet':   return HELMET_MODS;
    case 'chest':    return CHEST_MODS;
    case 'pants':    return PANTS_MODS;
    case 'boots':    return BOOTS_MODS;
    case 'amulet1':
    case 'amulet2':
    case 'amulet3':  return AMULET_MODS;
    default:         return AMULET_MODS;
  }
}

// ─── VALORES BASE DE MODIFICADORES ───────────────────────────

/**
 * Retorna o range de valores para um modificador baseado no nível da wave.
 * Escala linearmente com a wave para progressão infinita.
 */
function getModifierValueRange(
  modType: ModifierType,
  waveLevel: number,
  rarityMult: number
): { min: number; max: number; isPercent: boolean } {
  const scale = 1 + (waveLevel - 1) * 0.1; // +10% por wave

  const ranges: Record<ModifierType, { min: number; max: number; isPercent: boolean }> = {
    attack_damage:         { min: 3 * scale,  max: 8 * scale,  isPercent: false },
    attack_damage_pct:     { min: 5,          max: 20,         isPercent: true  },
    crit_rate:             { min: 3,          max: 12,         isPercent: true  },
    crit_damage:           { min: 10,         max: 50,         isPercent: true  },
    attack_speed:          { min: 5,          max: 25,         isPercent: true  },
    double_attack_chance:  { min: 5,          max: 25,         isPercent: true  },
    triple_attack_chance:  { min: 3,          max: 15,         isPercent: true  },
    bleed_chance:          { min: 5,          max: 30,         isPercent: true  },
    bleed_damage:          { min: 2 * scale,  max: 6 * scale,  isPercent: false },
    bleed_duration:        { min: 2,          max: 5,          isPercent: false },
    max_hp:                { min: 15 * scale, max: 40 * scale, isPercent: false },
    max_hp_pct:            { min: 5,          max: 20,         isPercent: true  },
    defense:               { min: 2 * scale,  max: 6 * scale,  isPercent: false },
    defense_pct:           { min: 3,          max: 12,         isPercent: true  },
    dodge_chance:          { min: 3,          max: 12,         isPercent: true  },
    block_chance:          { min: 5,          max: 20,         isPercent: true  },
    block_value:           { min: 5 * scale,  max: 15 * scale, isPercent: false },
    gold_find:             { min: 5,          max: 25,         isPercent: true  },
    item_find:             { min: 5,          max: 20,         isPercent: true  },
    xp_gain:               { min: 5,          max: 25,         isPercent: true  },
    hp_regen:              { min: 1 * scale,  max: 3 * scale,  isPercent: false },
    lifesteal:             { min: 3,          max: 12,         isPercent: true  },
    thorns:                { min: 2 * scale,  max: 5 * scale,  isPercent: false },
  };

  const range = ranges[modType];
  return {
    min: range.min * rarityMult,
    max: range.max * rarityMult,
    isPercent: range.isPercent,
  };
}

/**
 * Gera um modificador aleatório para um slot e nível de wave.
 */
function generateModifier(
  modType: ModifierType,
  waveLevel: number,
  rarityMult: number
): ItemModifier {
  const range = getModifierValueRange(modType, waveLevel, rarityMult);
  const rawValue = randFloat(range.min, range.max);
  const value = range.isPercent
    ? Math.round(rawValue * 10) / 10  // 1 casa decimal para %
    : Math.floor(rawValue);            // Inteiro para flat

  return { type: modType, value, isPercent: range.isPercent };
}

// ─── NOMES DE ITENS ───────────────────────────────────────────

const WEAPON_PREFIXES = ['Afiado', 'Sombrio', 'Ardente', 'Gélido', 'Sagrado', 'Maldito', 'Antigo', 'Corrompido', 'Eterno', 'Venenoso'];
const WEAPON_SUFFIXES_SWORD = ['Espadão', 'Lâmina', 'Gládio', 'Sabre', 'Espada Longa'];
const WEAPON_SUFFIXES_DAGGER = ['Adaga', 'Punhal', 'Estilete', 'Faca de Guerra', 'Lâmina Curta'];
const WEAPON_SUFFIXES_AXE = ['Machado', 'Cadinho', 'Lâmina de Guerra', 'Bárdiche'];
const WEAPON_SUFFIXES_STAFF = ['Cajado', 'Bastão Arcano', 'Orbe', 'Tomo Sombrio'];
const WEAPON_SUFFIXES_BOW = ['Arco', 'Besta', 'Arco Longo', 'Arco de Batalha'];
const ARMOR_PREFIXES = ['Reforçado', 'Sombrio', 'Sagrado', 'Corrompido', 'Antigo', 'Forjado', 'Encantado', 'Amaldiçoado'];
const HELMET_NAMES = ['Elmo', 'Capacete', 'Coroa de Guerra', 'Máscara', 'Tiara Sombria'];
const CHEST_NAMES = ['Peitoral', 'Armadura', 'Couraça', 'Cota de Malha', 'Veste de Batalha'];
const PANTS_NAMES = ['Grevas', 'Calças de Batalha', 'Leggings', 'Kilt de Guerra'];
const BOOTS_NAMES = ['Botas', 'Sapatões', 'Grevas de Pé', 'Sandálias de Batalha'];
const AMULET_NAMES = ['Amuleto', 'Pingente', 'Talismã', 'Medalhão', 'Orbe Menor', 'Gema Arcana'];

const LEGENDARY_PREFIXES = ['Lendário', 'Divino', 'Primordial', 'Abissal', 'Celestial', 'Infernal'];

function generateItemName(slot: EquipSlot, weaponType?: WeaponType, rarity?: Rarity): string {
  const prefix = rarity === 'legendary'
    ? randChoice(LEGENDARY_PREFIXES)
    : randChoice([...WEAPON_PREFIXES, ...ARMOR_PREFIXES]);

  switch (slot) {
    case 'mainhand':
    case 'offhand': {
      const suffixes = weaponType === 'dagger' ? WEAPON_SUFFIXES_DAGGER
        : weaponType === 'axe' ? WEAPON_SUFFIXES_AXE
        : weaponType === 'staff' ? WEAPON_SUFFIXES_STAFF
        : weaponType === 'bow' ? WEAPON_SUFFIXES_BOW
        : WEAPON_SUFFIXES_SWORD;
      return `${prefix} ${randChoice(suffixes)}`;
    }
    case 'helmet': return `${randChoice(ARMOR_PREFIXES)} ${randChoice(HELMET_NAMES)}`;
    case 'chest':  return `${randChoice(ARMOR_PREFIXES)} ${randChoice(CHEST_NAMES)}`;
    case 'pants':  return `${randChoice(ARMOR_PREFIXES)} ${randChoice(PANTS_NAMES)}`;
    case 'boots':  return `${randChoice(ARMOR_PREFIXES)} ${randChoice(BOOTS_NAMES)}`;
    case 'amulet1':
    case 'amulet2':
    case 'amulet3': return `${prefix} ${randChoice(AMULET_NAMES)}`;
    default: return `${prefix} Item`;
  }
}

// ─── ÍCONES DE ITENS ──────────────────────────────────────────

function getItemIcon(slot: EquipSlot, weaponType?: WeaponType): string {
  switch (slot) {
    case 'mainhand':
      return weaponType === 'dagger' ? '🗡️'
        : weaponType === 'axe' ? '🪓'
        : weaponType === 'staff' ? '🪄'
        : weaponType === 'bow' ? '🏹'
        : '⚔️';
    case 'offhand': return '🛡️';
    case 'helmet':  return '⛑️';
    case 'chest':   return '🦺';
    case 'pants':   return '👖';
    case 'boots':   return '👢';
    case 'amulet1':
    case 'amulet2':
    case 'amulet3': return '📿';
    default: return '💎';
  }
}

// ─── DESCRIÇÕES DE FLAVOR TEXT ────────────────────────────────

const FLAVOR_TEXTS = [
  'Forjado nas profundezas do abismo.',
  'Carrega o peso de mil batalhas.',
  'Sussurra segredos de guerreiros mortos.',
  'Brilha com uma luz que não deveria existir.',
  'Encontrado nas ruínas de uma civilização esquecida.',
  'Imbuído com a essência de um deus caído.',
  'Cada arranhão conta uma história de sobrevivência.',
  'Criado por um artesão que vendeu sua alma.',
  'Pulsa com energia sombria e insaciável.',
  'Diz-se que foi usado para matar um dragão.',
];

// ─── GERADOR PRINCIPAL ────────────────────────────────────────

/**
 * Número de modificadores bônus por raridade.
 */
const BONUS_MODS_BY_RARITY: Record<Rarity, number> = {
  common:    0,
  uncommon:  1,
  rare:      2,
  epic:      3,
  legendary: 5,
  mythic:    7,
  celestial: 9,
};

/**
 * Número de stats base por slot.
 */
function getBaseStatCount(slot: EquipSlot, rarity: Rarity): number {
  const base = slot === 'mainhand' || slot === 'offhand' ? 2 : 1;
  const rarityBonus = rarity === 'epic' || rarity === 'legendary' ? 1 : 0;
  return base + rarityBonus;
}

/**
 * Gera um item aleatório completo.
 *
 * @param slot - Slot do item
 * @param waveLevel - Nível da wave atual (escala o poder)
 * @param rarity - Raridade (se não fornecida, sorteia aleatoriamente)
 * @param itemFindBonus - Bônus de item find do personagem
 */
export function generateItem(
  slot: EquipSlot,
  waveLevel: number,
  rarity?: Rarity,
  itemFindBonus: number = 0
): Item {
  const finalRarity = rarity ?? rollRarity(itemFindBonus);
  const rarityMult = RARITY_POWER_MULT[finalRarity];

  // Determinar tipo de arma para mainhand/offhand
  let weaponType: WeaponType | undefined;
  if (slot === 'mainhand') {
    weaponType = randChoice<WeaponType>(['sword', 'dagger', 'axe', 'staff', 'bow']);
  } else if (slot === 'offhand') {
    weaponType = randChoice<WeaponType>(['sword', 'shield']);
  }

  // Gerar stats base
  const modPool = getModPoolForSlot(slot);
  const baseStatCount = getBaseStatCount(slot, finalRarity);
  const usedMods = new Set<ModifierType>();
  const baseStats: ItemModifier[] = [];

  // Para adagas: garantir modificadores específicos de adaga
  if (weaponType === 'dagger') {
    const daggerMods: ModifierType[] = ['attack_speed', 'triple_attack_chance', 'bleed_chance'];
    const guaranteedMod = randChoice(daggerMods);
    baseStats.push(generateModifier(guaranteedMod, waveLevel, rarityMult));
    usedMods.add(guaranteedMod);
  }

  // Preencher stats base restantes
  while (baseStats.length < baseStatCount) {
    const available = modPool.filter(m => !usedMods.has(m));
    if (available.length === 0) break;
    const modType = randChoice(available);
    baseStats.push(generateModifier(modType, waveLevel, rarityMult));
    usedMods.add(modType);
  }

  // Gerar stats bônus (modificadores aleatórios extras)
  const bonusCount = BONUS_MODS_BY_RARITY[finalRarity];
  const bonusStats: ItemModifier[] = [];

  for (let i = 0; i < bonusCount; i++) {
    const available = modPool.filter(m => !usedMods.has(m));
    if (available.length === 0) break;
    const modType = randChoice(available);
    bonusStats.push(generateModifier(modType, waveLevel, rarityMult * 1.2)); // Bônus ligeiramente mais fortes
    usedMods.add(modType);
  }

  // Calcular preço baseado em raridade e nível
  const basePrice = 50 * waveLevel;
  const rarityPriceMultipliers: Record<Rarity, number> = {
    common: 1, uncommon: 2.5, rare: 6, epic: 15, legendary: 50, mythic: 150, celestial: 500,
  };
  const price = Math.floor(basePrice * rarityPriceMultipliers[finalRarity] * (0.8 + Math.random() * 0.4));
  const affix = generateRandomAffix(finalRarity);

  return {
    id: nanoid(),
    name: generateItemName(slot, weaponType, finalRarity),
    slot,
    rarity: finalRarity,
    affix,
    weaponType,
    level: waveLevel,
    baseStats,
    bonusStats,
    icon: getItemIcon(slot, weaponType),
    description: randChoice(FLAVOR_TEXTS),
    price,
    requiredLevel: Math.max(1, waveLevel - 2),
  };
}

/**
 * Gera um conjunto de itens para o mercante.
 * Sempre inclui pelo menos um item de cada slot principal.
 */
export function generateMerchantItems(waveLevel: number, itemFindBonus: number = 0): Item[] {
  const slots: EquipSlot[] = ['mainhand', 'offhand', 'helmet', 'chest', 'pants', 'boots', 'amulet1'];
  const items: Item[] = [];

  // 5-7 itens no mercante
  const count = randInt(5, 7);
  const shuffledSlots = [...slots].sort(() => Math.random() - 0.5);

  for (let i = 0; i < count; i++) {
    const slot = shuffledSlots[i % shuffledSlots.length];
    items.push(generateItem(slot, waveLevel, undefined, itemFindBonus));
  }

  // Chance de item especial épico/lendário
  if (rollChance(20 + itemFindBonus * 0.5)) {
    const specialSlot = randChoice<EquipSlot>(['mainhand', 'amulet1', 'chest']);
    const specialRarity: Rarity = rollChance(10) ? 'legendary' : 'epic';
    items.push(generateItem(specialSlot, waveLevel, specialRarity, itemFindBonus));
  }

  return items;
}

/**
 * Gera drops de um mob morto.
 * Chance base de drop + bônus de item find.
 */
export function generateMobDrops(
  mobLevel: number,
  mobType: 'normal' | 'elite' | 'boss',
  itemFindBonus: number = 0
): Item[] {
  const drops: Item[] = [];

  // Chances de drop por tipo de mob
  const dropChances = {
    normal: 25 + itemFindBonus * 0.5,
    elite:  60 + itemFindBonus * 0.5,
    boss:   100, // Boss sempre dropa
  };

  const dropCount = {
    normal: 1,
    elite:  randInt(1, 2),
    boss:   randInt(2, 3),
  };

  const chance = dropChances[mobType];
  const count = dropCount[mobType];

  for (let i = 0; i < count; i++) {
    if (rollChance(chance)) {
      const slots: EquipSlot[] = [
        'mainhand', 'offhand', 'helmet', 'chest',
        'pants', 'boots', 'amulet1', 'amulet2', 'amulet3'
      ];
      const slot = randChoice(slots);
      drops.push(generateItem(slot, mobLevel, undefined, itemFindBonus));
    }
  }

  return drops;
}
