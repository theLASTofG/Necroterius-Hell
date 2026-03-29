/**
 * ============================================================
 * AFK BATTLE ARENA — TIPOS BASE DO JOGO
 * ============================================================
 * Design: Void Signal — Brutal Minimalism Dark
 * Cores semânticas: verde=HP, vermelho=dano, âmbar=crítico,
 *                   roxo=lendário, azul=raro, verde=incomum, cinza=comum
 *
 * Este arquivo define TODOS os tipos TypeScript do jogo.
 * É o contrato central que todos os módulos devem seguir.
 * Adicionar novos tipos aqui antes de implementar features.
 * ============================================================
 */

// ─── RARIDADE DE ITENS ───────────────────────────────────────
// Cada raridade tem cor semântica estrita no sistema visual
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'celestial';

export const RARITY_COLORS: Record<Rarity, string> = {
  common:    '#9CA3AF', // cinza
  uncommon:  '#22C55E', // verde
  rare:      '#3B82F6', // azul
  epic:      '#A855F7', // roxo
  legendary: '#FBBF24', // âmbar dourado
  mythic:    '#EC4899', // rosa/magenta
  celestial: '#06B6D4', // ciano brilhante
};

export const RARITY_LABELS: Record<Rarity, string> = {
  common:    'Comum',
  uncommon:  'Incomum',
  rare:      'Raro',
  epic:      'Épico',
  legendary: 'Lendário',
  mythic:    'Mítico',
  celestial: 'Celestial',
};

// Multiplicador de poder base por raridade
export const RARITY_POWER_MULT: Record<Rarity, number> = {
  common:    1.0,
  uncommon:  1.4,
  rare:      2.0,
  epic:      3.2,
  legendary: 5.5,
  mythic:    8.5,
  celestial: 12.0,
};

// Chance de drop por raridade (soma = 100%)
export const RARITY_DROP_CHANCE: Record<Rarity, number> = {
  common:    50,
  uncommon:  25,
  rare:      15,
  epic:      6,
  legendary: 3,
  mythic:    0.8,
  celestial: 0.2,
};

// ─── SLOTS DE EQUIPAMENTO ────────────────────────────────────
// Slots disponíveis no personagem — expansível no futuro
export type EquipSlot =
  | 'mainhand'    // Arma principal (espada, adaga, machado, etc.)
  | 'offhand'     // Arma secundária (menos dano, mas útil)
  | 'helmet'      // Capacete — defesa e stats de cabeça
  | 'chest'       // Peitoral — maior slot de defesa
  | 'pants'       // Calça — defesa e mobilidade
  | 'boots'       // Botas — velocidade e esquiva
  | 'amulet1'     // Amuleto slot 1
  | 'amulet2'     // Amuleto slot 2
  | 'amulet3';    // Amuleto slot 3

export const EQUIP_SLOT_LABELS: Record<EquipSlot, string> = {
  mainhand: 'Arma Principal',
  offhand:  'Arma Secundária',
  helmet:   'Capacete',
  chest:    'Peitoral',
  pants:    'Calça',
  boots:    'Botas',
  amulet1:  'Amuleto I',
  amulet2:  'Amuleto II',
  amulet3:  'Amuleto III',
};

// ─── TIPO DE ARMA ────────────────────────────────────────────
export type WeaponType =
  | 'sword'    // Espada — balanceada, crit rate bônus
  | 'dagger'   // Adaga — rápida, 3x ataque, sangramento
  | 'axe'      // Machado — dano alto, 2x ataque chance
  | 'staff'    // Cajado — dano mágico, sem bônus físico
  | 'bow'      // Arco — distância, crit rate alto
  | 'shield';  // Escudo — para offhand, defesa extra

// ─── MODIFICADORES DE ITEM ───────────────────────────────────
// Cada modificador tem um tipo e um valor (pode ser % ou flat)
export type ModifierType =
  // Ofensivos
  | 'attack_damage'       // +X dano de ataque (flat)
  | 'attack_damage_pct'   // +X% dano de ataque
  | 'crit_rate'           // +X% chance de crítico
  | 'crit_damage'         // +X% multiplicador de crítico
  | 'attack_speed'        // +X% velocidade de ataque
  | 'double_attack_chance'// +X% chance de atacar duas vezes
  | 'triple_attack_chance'// +X% chance de atacar três vezes (adagas)
  | 'bleed_chance'        // +X% chance de causar sangramento
  | 'bleed_damage'        // +X dano de sangramento por tick
  | 'bleed_duration'      // +X ticks de sangramento
  // Defensivos
  | 'max_hp'              // +X HP máximo (flat)
  | 'max_hp_pct'          // +X% HP máximo
  | 'defense'             // +X defesa (redução de dano flat)
  | 'defense_pct'         // +X% redução de dano
  | 'dodge_chance'        // +X% chance de esquivar
  | 'block_chance'        // +X% chance de bloquear (offhand/escudo)
  | 'block_value'         // +X dano bloqueado quando bloqueia
  // Utilitários
  | 'gold_find'           // +X% ouro encontrado
  | 'item_find'           // +X% chance de drop de item
  | 'xp_gain'             // +X% experiência ganha
  | 'hp_regen'            // +X HP regenerado por segundo
  | 'lifesteal'           // +X% do dano convertido em HP
  | 'thorns';             // +X dano refletido ao atacante

export interface ItemModifier {
  type: ModifierType;
  value: number;       // Valor do modificador
  isPercent: boolean;  // Se true, é percentual; se false, é flat
}

// ─── AFIXOS DE ITENS ────────────────────────────────────────
export type ItemAffix = 'normal' | 'cursed' | 'blessed' | 'god_touch';

export const AFFIX_LABELS: Record<ItemAffix, string> = {
  normal:    'Normal',
  cursed:    'Amaldiçoado',
  blessed:   'Abençoado',
  god_touch: 'Toque Divino',
};

export const AFFIX_COLORS: Record<ItemAffix, string> = {
  normal:    '#9CA3AF',
  cursed:    '#7C3AED',
  blessed:   '#06B6D4',
  god_touch: '#FBBF24',
};

export const AFFIX_CHANCES: Record<Rarity, Record<ItemAffix, number>> = {
  common:    { normal: 85, cursed: 10, blessed: 5, god_touch: 0 },
  uncommon:  { normal: 80, cursed: 10, blessed: 8, god_touch: 2 },
  rare:      { normal: 70, cursed: 10, blessed: 15, god_touch: 5 },
  epic:      { normal: 60, cursed: 10, blessed: 20, god_touch: 10 },
  legendary: { normal: 40, cursed: 10, blessed: 30, god_touch: 20 },
  mythic:    { normal: 30, cursed: 10, blessed: 40, god_touch: 20 },
  celestial: { normal: 20, cursed: 5, blessed: 35, god_touch: 40 },
};

export function generateRandomAffix(rarity: Rarity): ItemAffix {
  const chances = AFFIX_CHANCES[rarity];
  const roll = Math.random() * 100;
  let cumulative = 0;
  for (const [affix, chance] of Object.entries(chances)) {
    cumulative += chance;
    if (roll < cumulative) return affix as ItemAffix;
  }
  return 'normal';
}

// ─── ITEM ────────────────────────────────────────────────────
export interface Item {
  id: string;
  name: string;
  slot: EquipSlot;
  rarity: Rarity;
  affix: ItemAffix;
  weaponType?: WeaponType;
  level: number;
  baseStats: ItemModifier[];
  bonusStats: ItemModifier[];
  icon: string;
  imageUrl?: string;
  description: string;
  price: number;
  requiredLevel: number;
  requiredItem?: string;
}

// ─── STATS DO PERSONAGEM ─────────────────────────────────────
// Stats base + stats calculados com equipamentos
export interface CharacterStats {
  // Vitais
  maxHp: number;
  currentHp: number;
  hpRegen: number;       // HP regenerado por segundo

  // Ofensivos
  attackDamage: number;  // Dano base de ataque
  attackSpeed: number;   // Ataques por segundo (base: 1.0)
  critRate: number;      // Chance de crítico (0-100%)
  critDamage: number;    // Multiplicador de crítico (base: 150%)
  doubleAttackChance: number; // Chance de atacar duas vezes
  tripleAttackChance: number; // Chance de atacar três vezes
  bleedChance: number;   // Chance de causar sangramento
  bleedDamage: number;   // Dano por tick de sangramento
  bleedDuration: number; // Duração do sangramento em ticks
  lifesteal: number;     // % do dano convertido em HP

  // Defensivos
  defense: number;       // Redução de dano flat
  defensePct: number;    // Redução de dano percentual (0-75% cap)
  dodgeChance: number;   // Chance de esquivar (0-60% cap)
  blockChance: number;   // Chance de bloquear
  blockValue: number;    // Dano bloqueado quando bloqueia
  thorns: number;        // Dano refletido ao atacante

  // Utilitários
  goldFind: number;      // % bônus de ouro
  itemFind: number;      // % bônus de drop de item
  xpGain: number;        // % bônus de XP
}

// Stats base do personagem sem equipamentos
export const BASE_CHARACTER_STATS: CharacterStats = {
  maxHp: 100,
  currentHp: 100,
  hpRegen: 0,
  attackDamage: 10,
  attackSpeed: 1.0,
  critRate: 5,
  critDamage: 150,
  doubleAttackChance: 0,
  tripleAttackChance: 0,
  bleedChance: 0,
  bleedDamage: 0,
  bleedDuration: 0,
  lifesteal: 0,
  defense: 0,
  defensePct: 0,
  dodgeChance: 0,
  blockChance: 0,
  blockValue: 0,
  thorns: 0,
  goldFind: 0,
  itemFind: 0,
  xpGain: 0,
};

// ─── PERSONAGEM ──────────────────────────────────────────────
export interface Character {
  id: string;
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  gold: number;
  baseStats: CharacterStats;
  equipment: Partial<Record<EquipSlot, Item>>;
  inventory: Item[];     // Inventário (itens não equipados)
  // Stats calculados (base + equipamentos) — recalculado a cada mudança
  computedStats: CharacterStats;
}

// ─── MOB (INIMIGO) ───────────────────────────────────────────
export type MobType =
  | 'normal'   // Mob padrão
  | 'elite'    // Mob mais forte, mais drops
  | 'boss';    // Boss da wave, muito forte, drops garantidos

export interface MobStats {
  maxHp: number;
  currentHp: number;
  attackDamage: number;
  attackSpeed: number;   // Ataques por segundo
  defense: number;
  critRate: number;
  critDamage: number;
  dodgeChance: number;
  bleedChance: number;
  bleedDamage: number;
}

export interface Mob {
  id: string;
  name: string;
  type: MobType;
  level: number;
  stats: MobStats;
  sprite: string;        // URL da imagem ou emoji
  dropTable: DropEntry[]; // Tabela de drops possíveis
  goldReward: { min: number; max: number };
  xpReward: number;
  // Efeitos visuais especiais
  color: string;         // Cor de destaque do mob (para borda/glow)
}

// ─── DROPS ───────────────────────────────────────────────────
export interface DropEntry {
  itemTemplate: Partial<Item>; // Template base do item
  chance: number;              // Chance de drop (0-100)
  minRarity: Rarity;           // Raridade mínima garantida
}

// ─── ESTADO DE COMBATE ───────────────────────────────────────
export type CombatEventType =
  | 'attack'           // Ataque normal
  | 'crit'             // Ataque crítico
  | 'double_attack'    // Segundo ataque
  | 'triple_attack'    // Terceiro ataque (adagas)
  | 'bleed_tick'       // Tick de sangramento
  | 'dodge'            // Esquiva
  | 'block'            // Bloqueio
  | 'miss'             // Erro (mob errou)
  | 'heal'             // Cura
  | 'lifesteal'        // Roubo de vida
  | 'thorns'           // Espinhos
  | 'mob_attack'       // Ataque do mob
  | 'mob_crit'         // Crítico do mob
  | 'mob_bleed';       // Sangramento do mob

export interface CombatEvent {
  id: string;
  type: CombatEventType;
  value: number;       // Dano/cura causado
  isCrit: boolean;
  source: 'player' | 'mob';
  timestamp: number;   // Date.now()
  label?: string;      // Texto customizado para o log
}

export interface BleedEffect {
  id: string;
  damage: number;      // Dano por tick
  ticksRemaining: number;
  source: 'player' | 'mob';
}

export interface Area {
  id: string;
  name: string;
  minWave: number;
  maxWave: number;
  unlocked: boolean;
  isBossArea: boolean;
  description: string;
}

export interface CombatState {
  isRunning: boolean;
  isPaused: boolean;
  wave: number;
  maxWaveReached: number; // Para controle de áreas desbloqueadas
  isFarmMode: boolean;    // Se true, repete a wave atual ao invés de avançar
  currentAreaId: string;  // ID da área atual
  mobsInWave: number;
  mobsKilled: number;
  currentMob: Mob | null;
  playerBleedEffects: BleedEffect[];  // Sangramentos no jogador
  mobBleedEffects: BleedEffect[];     // Sangramentos no mob
  combatLog: CombatEvent[];           // Últimos N eventos
  totalDamageDealt: number;
  totalDamageTaken: number;
  waveStartTime: number;
  lastTickTime: number;
}

// ─── MERCANTE ────────────────────────────────────────────────
export interface MerchantItem {
  item: Item;
  originalPrice: number;
  discountPct: number;   // 0-50% de desconto possível
  finalPrice: number;
}

export interface Merchant {
  id: string;
  name: string;
  wave: number;          // Wave em que aparece
  items: MerchantItem[]; // Itens à venda
  specialOffer?: MerchantItem; // Oferta especial (item raro/épico)
  refreshCost: number;   // Custo para atualizar o estoque
}

// ─── ESTADO GLOBAL DO JOGO ───────────────────────────────────
export interface GameState {
  character: Character;
  combat: CombatState;
  merchant: Merchant | null;
  showMerchant: boolean;
  showInventory: boolean;
  showEquipment: boolean;
  gamePhase: 'idle' | 'combat' | 'merchant' | 'levelup' | 'gameover';
  notifications: GameNotification[];
  settings: GameSettings;
}

export interface GameNotification {
  id: string;
  type: 'item_drop' | 'level_up' | 'wave_clear' | 'merchant' | 'achievement';
  message: string;
  item?: Item;
  timestamp: number;
  duration: number; // ms
}

export interface GameSettings {
  combatSpeed: 1 | 2 | 4;  // Multiplicador de velocidade
  autoEquipBetter: boolean;  // Equipar automaticamente itens melhores
  showDamageNumbers: boolean;
  showCombatLog: boolean;
}

// ─── NÚMERO FLUTUANTE DE DANO ────────────────────────────────
export interface FloatingNumber {
  id: string;
  value: number;
  type: CombatEventType;
  x: number;  // Posição X relativa (0-100%)
  y: number;  // Posição Y relativa (0-100%)
  createdAt: number;
}
