/**
 * ============================================================
 * AFK BATTLE ARENA — SISTEMA DE TIERS DE DIFICULDADE
 * ============================================================
 * Define tiers de progressão com bosses únicos, escalas de
 * dificuldade e modificadores especiais por tier.
 * ============================================================
 */

import { Mob, Rarity } from './types';
import { generateMob } from './mobGenerator';

// ─── DEFINIÇÃO DE TIERS ────────────────────────────────────────

export type TierType = 'novice' | 'apprentice' | 'veteran' | 'elite' | 'mythic' | 'celestial';

export interface Tier {
  id: TierType;
  name: string;
  minWave: number;
  maxWave: number;
  bossWaves: number[]; // Waves em que bosses aparecem
  difficultyMultiplier: number;
  lootMultiplier: number;
  xpMultiplier: number;
  bossSpawnRate: number; // % de chance de boss ao invés de mob normal
  color: string;
}

export const TIERS: Record<TierType, Tier> = {
  novice: {
    id: 'novice',
    name: 'Aprendiz',
    minWave: 1,
    maxWave: 10,
    bossWaves: [5, 10],
    difficultyMultiplier: 1.0,
    lootMultiplier: 1.0,
    xpMultiplier: 1.0,
    bossSpawnRate: 0,
    color: '#9CA3AF',
  },
  apprentice: {
    id: 'apprentice',
    name: 'Aprendiz Avançado',
    minWave: 11,
    maxWave: 25,
    bossWaves: [15, 20, 25],
    difficultyMultiplier: 1.5,
    lootMultiplier: 1.3,
    xpMultiplier: 1.2,
    bossSpawnRate: 5,
    color: '#22C55E',
  },
  veteran: {
    id: 'veteran',
    name: 'Veterano',
    minWave: 26,
    maxWave: 50,
    bossWaves: [30, 40, 50],
    difficultyMultiplier: 2.5,
    lootMultiplier: 1.8,
    xpMultiplier: 1.6,
    bossSpawnRate: 8,
    color: '#3B82F6',
  },
  elite: {
    id: 'elite',
    name: 'Elite',
    minWave: 51,
    maxWave: 100,
    bossWaves: [60, 75, 90, 100],
    difficultyMultiplier: 4.0,
    lootMultiplier: 2.5,
    xpMultiplier: 2.2,
    bossSpawnRate: 12,
    color: '#A855F7',
  },
  mythic: {
    id: 'mythic',
    name: 'Mítico',
    minWave: 101,
    maxWave: 200,
    bossWaves: [110, 130, 160, 190, 200],
    difficultyMultiplier: 6.5,
    lootMultiplier: 3.5,
    xpMultiplier: 3.0,
    bossSpawnRate: 15,
    color: '#EC4899',
  },
  celestial: {
    id: 'celestial',
    name: 'Celestial',
    minWave: 201,
    maxWave: Infinity,
    bossWaves: [210, 240, 280, 320, 360, 400],
    difficultyMultiplier: 10.0,
    lootMultiplier: 5.0,
    xpMultiplier: 4.5,
    bossSpawnRate: 20,
    color: '#06B6D4',
  },
};

// ─── BOSSES ESPECIAIS ──────────────────────────────────────────

export interface BossTemplate {
  name: string;
  tier: TierType;
  healthMult: number;
  damageMult: number;
  speedMult: number;
  specialAbilities: string[];
  guaranteedDropRarity: Rarity;
}



export const BOSS_TEMPLATES: BossTemplate[] = [
  {
    name: 'Rei Morto-Vivo',
    tier: 'novice',
    healthMult: 2.0,
    damageMult: 1.5,
    speedMult: 0.8,
    specialAbilities: ['Golpe Giratório'],
    guaranteedDropRarity: 'rare',
  },
  {
    name: 'Demônio da Perdição',
    tier: 'apprentice',
    healthMult: 3.0,
    damageMult: 2.0,
    speedMult: 1.2,
    specialAbilities: ['Inferno', 'Teleporte'],
    guaranteedDropRarity: 'epic',
  },
  {
    name: 'Dragão Ancestral',
    tier: 'veteran',
    healthMult: 4.5,
    damageMult: 2.8,
    speedMult: 1.0,
    specialAbilities: ['Bafo de Fogo', 'Voo', 'Defesa Dracônica'],
    guaranteedDropRarity: 'legendary',
  },
  {
    name: 'Titã do Caos',
    tier: 'elite',
    healthMult: 6.0,
    damageMult: 3.5,
    speedMult: 1.1,
    specialAbilities: ['Terramoto', 'Invocação', 'Fúria Primordial'],
    guaranteedDropRarity: 'legendary',
  },
  {
    name: 'Deus Corrompido',
    tier: 'mythic',
    healthMult: 8.0,
    damageMult: 4.5,
    speedMult: 1.3,
    specialAbilities: ['Maldição', 'Regeneração', 'Teletransporte Múltiplo', 'Escudo Divino'],
    guaranteedDropRarity: 'mythic',
  },
  {
    name: 'Entidade Celestial',
    tier: 'celestial',
    healthMult: 12.0,
    damageMult: 6.0,
    speedMult: 1.5,
    specialAbilities: ['Aniquilação', 'Viagem Temporal', 'Duplicação', 'Ascensão'],
    guaranteedDropRarity: 'celestial',
  },
];

// ─── FUNÇÕES UTILITÁRIAS ──────────────────────────────────────

/**
 * Retorna o tier atual baseado na wave
 */
export function getTierForWave(wave: number): Tier {
  for (const tier of Object.values(TIERS)) {
    if (wave >= tier.minWave && wave <= tier.maxWave) {
      return tier;
    }
  }
  return TIERS.celestial;
}

/**
 * Verifica se a wave atual deve ter um boss
 */
export function isBossWave(wave: number): boolean {
  const tier = getTierForWave(wave);
  return tier.bossWaves.includes(wave);
}

/**
 * Retorna um template de boss aleatório para o tier
 */
export function getRandomBossForTier(tier: TierType): BossTemplate {
  const bosses = BOSS_TEMPLATES.filter(b => b.tier === tier);
  return bosses[Math.floor(Math.random() * bosses.length)];
}

/**
 * Cria um boss baseado no template
 */
export function createBoss(template: BossTemplate, waveLevel: number): Mob {
  const baseMob = generateMob(waveLevel, 'boss');

  return {
    ...baseMob,
    name: template.name,
    stats: {
      ...baseMob.stats,
      maxHp: Math.floor(baseMob.stats.maxHp * template.healthMult),
      currentHp: Math.floor(baseMob.stats.maxHp * template.healthMult),
      attackDamage: Math.floor(baseMob.stats.attackDamage * template.damageMult),
      attackSpeed: baseMob.stats.attackSpeed * template.speedMult,
    },
    goldReward: {
      min: Math.floor(baseMob.goldReward.min * 2.5),
      max: Math.floor(baseMob.goldReward.max * 2.5),
    },
    xpReward: Math.floor(baseMob.xpReward * 2.0),
  };
}

/**
 * Calcula os modificadores de dificuldade para a wave
 */
export function getWaveDifficultyModifiers(wave: number) {
  const tier = getTierForWave(wave);
  const waveInTier = wave - tier.minWave + 1;
  const tierProgress = waveInTier / (tier.maxWave - tier.minWave + 1);

  return {
    difficultyMultiplier: tier.difficultyMultiplier * (1 + tierProgress * 0.5),
    lootMultiplier: tier.lootMultiplier * (1 + tierProgress * 0.3),
    xpMultiplier: tier.xpMultiplier * (1 + tierProgress * 0.2),
  };
}
