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

// ─── EFEITOS ÚNICOS DE ITENS ────────────────────────────────
// Efeitos especiais que podem aparecer em itens raros+
// Esses efeitos são game-changers que resolvem a run
export interface UniqueEffect {
  id: string;
  name: string;
  description: string;
  color: string;
  modifiers: ItemModifier[];
}

// Pool de efeitos únicos — cada um é poderoso o suficiente para mudar a run
export const UNIQUE_EFFECTS: UniqueEffect[] = [
  // Ofensivos
  {
    id: 'vampiric_blade',
    name: 'Lâmina Vampírica',
    description: 'Cada golpe drena a essência vital do inimigo.',
    color: '#DC2626',
    modifiers: [
      { type: 'lifesteal', value: 18, isPercent: true },
      { type: 'attack_damage_pct', value: 15, isPercent: true },
    ],
  },
  {
    id: 'berserker_fury',
    name: 'Fúria do Berserker',
    description: 'Atacar mais rápido que o olho pode acompanhar.',
    color: '#EF4444',
    modifiers: [
      { type: 'attack_speed', value: 50, isPercent: true },
      { type: 'double_attack_chance', value: 25, isPercent: true },
      { type: 'crit_rate', value: 10, isPercent: true },
    ],
  },
  {
    id: 'executioner',
    name: 'Golpe do Executor',
    description: 'Críticos devastadores que destroem qualquer defesa.',
    color: '#FBBF24',
    modifiers: [
      { type: 'crit_damage', value: 120, isPercent: true },
      { type: 'crit_rate', value: 15, isPercent: true },
    ],
  },
  {
    id: 'triple_threat',
    name: 'Ameaça Tripla',
    description: 'As mãos se movem em blur — três golpes onde havia um.',
    color: '#F97316',
    modifiers: [
      { type: 'triple_attack_chance', value: 30, isPercent: true },
      { type: 'attack_speed', value: 20, isPercent: true },
    ],
  },
  {
    id: 'venomous_edge',
    name: 'Fio Venenoso',
    description: 'Cada corte injeta veneno puro nas veias do inimigo.',
    color: '#22C55E',
    modifiers: [
      { type: 'bleed_chance', value: 40, isPercent: true },
      { type: 'bleed_damage', value: 15, isPercent: false },
      { type: 'bleed_duration', value: 3, isPercent: false },
    ],
  },
  {
    id: 'soul_reaper',
    name: 'Ceifador de Almas',
    description: 'Cada inimigo morto alimenta sua fome insaciável.',
    color: '#7C3AED',
    modifiers: [
      { type: 'attack_damage_pct', value: 35, isPercent: true },
      { type: 'lifesteal', value: 8, isPercent: true },
    ],
  },
  // Defensivos
  {
    id: 'immortal_aegis',
    name: 'Égide Imortal',
    description: 'Um escudo que já protegeu deuses caídos.',
    color: '#3B82F6',
    modifiers: [
      { type: 'max_hp', value: 200, isPercent: false },
      { type: 'defense_pct', value: 20, isPercent: true },
      { type: 'hp_regen', value: 8, isPercent: false },
    ],
  },
  {
    id: 'phantom_reflexes',
    name: 'Reflexos Fantasma',
    description: 'Você se move como fumaça — impossível de acertar.',
    color: '#60A5FA',
    modifiers: [
      { type: 'dodge_chance', value: 25, isPercent: true },
      { type: 'attack_speed', value: 15, isPercent: true },
    ],
  },
  {
    id: 'thorns_of_agony',
    name: 'Espinhos da Agonia',
    description: 'Quem ousa te tocar paga com dor.',
    color: '#A855F7',
    modifiers: [
      { type: 'thorns', value: 30, isPercent: false },
      { type: 'defense', value: 20, isPercent: false },
      { type: 'block_chance', value: 15, isPercent: true },
    ],
  },
  {
    id: 'undying_will',
    name: 'Vontade Imorredoura',
    description: 'Sua vontade de viver supera qualquer ferimento.',
    color: '#16A34A',
    modifiers: [
      { type: 'max_hp_pct', value: 40, isPercent: true },
      { type: 'hp_regen', value: 12, isPercent: false },
      { type: 'lifesteal', value: 5, isPercent: true },
    ],
  },
  {
    id: 'fortress',
    name: 'Fortaleza Ambulante',
    description: 'Você É a muralha. Nada passa.',
    color: '#6B7280',
    modifiers: [
      { type: 'block_chance', value: 30, isPercent: true },
      { type: 'block_value', value: 50, isPercent: false },
      { type: 'defense', value: 25, isPercent: false },
    ],
  },
  // Utilitários / Híbridos
  {
    id: 'midas_touch',
    name: 'Toque de Midas',
    description: 'Tudo que toca vira ouro. Literalmente.',
    color: '#FBBF24',
    modifiers: [
      { type: 'gold_find', value: 80, isPercent: true },
      { type: 'item_find', value: 40, isPercent: true },
    ],
  },
  {
    id: 'lucky_charm',
    name: 'Amuleto da Sorte Absurda',
    description: 'A sorte favorece os ousados. E você é insano.',
    color: '#EC4899',
    modifiers: [
      { type: 'item_find', value: 60, isPercent: true },
      { type: 'crit_rate', value: 12, isPercent: true },
      { type: 'gold_find', value: 30, isPercent: true },
    ],
  },
  {
    id: 'war_machine',
    name: 'Máquina de Guerra',
    description: 'Construído para destruição total. Sem piedade.',
    color: '#EF4444',
    modifiers: [
      { type: 'attack_damage_pct', value: 25, isPercent: true },
      { type: 'attack_speed', value: 25, isPercent: true },
      { type: 'crit_rate', value: 10, isPercent: true },
      { type: 'crit_damage', value: 40, isPercent: true },
    ],
  },
  {
    id: 'blood_pact',
    name: 'Pacto de Sangue',
    description: 'Poder absoluto cobra um preço — mas vale cada gota.',
    color: '#B91C1C',
    modifiers: [
      { type: 'attack_damage_pct', value: 50, isPercent: true },
      { type: 'lifesteal', value: 20, isPercent: true },
      { type: 'crit_damage', value: 60, isPercent: true },
    ],
  },
  {
    id: 'celestial_blessing',
    name: 'Bênção Celestial',
    description: 'Os céus sorriem para você. Tudo fica mais fácil.',
    color: '#06B6D4',
    modifiers: [
      { type: 'max_hp_pct', value: 25, isPercent: true },
      { type: 'attack_damage_pct', value: 20, isPercent: true },
      { type: 'xp_gain', value: 50, isPercent: true },
      { type: 'gold_find', value: 30, isPercent: true },
    ],
  },
];

// Chance de efeito único por raridade (0 = nunca)
export const UNIQUE_EFFECT_CHANCE: Record<Rarity, number> = {
  common:    0,
  uncommon:  0,
  rare:      3,
  epic:      10,
  legendary: 25,
  mythic:    40,
  celestial: 60,
};

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
  uniqueEffect?: UniqueEffect;
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

export interface CombatState {
  isRunning: boolean;
  isPaused: boolean;
  wave: number;
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
  gamePhase: 'idle' | 'combat' | 'merchant' | 'levelup';
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
