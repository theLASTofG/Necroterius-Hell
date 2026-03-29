/**
 * ============================================================
 * AFK BATTLE ARENA — GERADOR PROCEDURAL DE MOBS
 * ============================================================
 * Gera inimigos aleatórios com stats que escalam com a wave.
 *
 * ESTRUTURA DE WAVE:
 * - Waves 1-4: Mobs normais
 * - Wave 5: Elite (mais forte, mais drops)
 * - Waves 6-9: Mobs normais (mais fortes)
 * - Wave 10: Boss (muito forte, drops garantidos)
 * - Padrão repete com escala crescente
 *
 * SPRITES: Usa as imagens pixel art geradas para o projeto.
 * Mobs têm cores de destaque baseadas no tipo/elemento.
 * ============================================================
 */

import { nanoid } from 'nanoid';
import { Mob, MobStats, MobType, DropEntry } from './types';

// URLs das imagens geradas para o projeto
const MOB_SPRITES = {
  skeleton: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663488898874/FQHBuMCGwST5CLgJSQ9Ws7/mob-skeleton-Jak7EcHqcppM8U8QRixpWY.webp',
  demon:    'https://d2xsxph8kpxj0f.cloudfront.net/310519663488898874/FQHBuMCGwST5CLgJSQ9Ws7/mob-demon-bnemjQzbx9YrB6opGfb4qT.webp',
  slime:    'https://d2xsxph8kpxj0f.cloudfront.net/310519663488898874/FQHBuMCGwST5CLgJSQ9Ws7/mob-slime-3sVxF4iQySg7Dz3qRsR48c.webp',
};

// ─── TEMPLATES DE MOBS ────────────────────────────────────────

interface MobTemplate {
  namePool: string[];
  sprite: string;
  color: string;        // Cor de destaque (borda/glow)
  statBias: {           // Multiplicadores de stat (1.0 = padrão)
    hp: number;
    damage: number;
    speed: number;
    defense: number;
    critRate: number;
    dodgeChance: number;
    bleedChance: number;
  };
  element?: string;     // Elemento visual (fogo, gelo, veneno, etc.)
}

const MOB_TEMPLATES: MobTemplate[] = [
  // ── Esqueleto — balanceado, velocidade média ──────────────
  {
    namePool: ['Esqueleto Guerreiro', 'Esqueleto Arqueiro', 'Esqueleto Mago', 'Osso Ambulante', 'Morto-Vivo'],
    sprite: MOB_SPRITES.skeleton,
    color: '#94A3B8', // cinza azulado
    statBias: { hp: 0.9, damage: 1.0, speed: 1.0, defense: 0.7, critRate: 1.0, dodgeChance: 0.8, bleedChance: 0.5 },
  },
  // ── Demônio — alto dano, baixa defesa ────────────────────
  {
    namePool: ['Demônio do Fogo', 'Servo do Inferno', 'Imp Sombrio', 'Demônio Menor', 'Espírito Maligno'],
    sprite: MOB_SPRITES.demon,
    color: '#EF4444', // vermelho
    statBias: { hp: 0.8, damage: 1.5, speed: 1.2, defense: 0.6, critRate: 1.5, dodgeChance: 1.0, bleedChance: 0.3 },
  },
  // ── Slime — alto HP, baixo dano, lento ───────────────────
  {
    namePool: ['Slime Tóxico', 'Gosma Verde', 'Blob Ácido', 'Geleia Venenosa', 'Protoplasma'],
    sprite: MOB_SPRITES.slime,
    color: '#22C55E', // verde tóxico
    statBias: { hp: 1.8, damage: 0.6, speed: 0.6, defense: 0.5, critRate: 0.3, dodgeChance: 0.2, bleedChance: 1.5 },
  },
  // ── Goblin — rápido, baixo HP ─────────────────────────────
  {
    namePool: ['Goblin Ladrão', 'Goblin Guerreiro', 'Goblin Xamã', 'Kobold', 'Duende Sombrio'],
    sprite: MOB_SPRITES.slime, // Reusar sprite por ora
    color: '#84CC16', // verde-amarelo
    statBias: { hp: 0.7, damage: 0.9, speed: 1.6, defense: 0.5, critRate: 1.2, dodgeChance: 1.8, bleedChance: 0.8 },
  },
  // ── Troll — tanque, lento ─────────────────────────────────
  {
    namePool: ['Troll de Pedra', 'Ogro Brutal', 'Gigante Menor', 'Golem de Lama'],
    sprite: MOB_SPRITES.demon, // Reusar sprite por ora
    color: '#78716C', // marrom pedra
    statBias: { hp: 2.5, damage: 1.2, speed: 0.5, defense: 1.8, critRate: 0.5, dodgeChance: 0.2, bleedChance: 0.2 },
  },
];

// Templates de boss (mais únicos)
const BOSS_TEMPLATES: MobTemplate[] = [
  {
    namePool: ['Lorde dos Mortos', 'Lich Supremo', 'Necromante Eterno'],
    sprite: MOB_SPRITES.skeleton,
    color: '#A855F7', // roxo épico
    statBias: { hp: 4.0, damage: 2.0, speed: 0.8, defense: 1.5, critRate: 1.8, dodgeChance: 1.0, bleedChance: 1.0 },
  },
  {
    namePool: ['Arquidemônio', 'Senhor do Inferno', 'Príncipe Sombrio'],
    sprite: MOB_SPRITES.demon,
    color: '#FBBF24', // âmbar lendário
    statBias: { hp: 3.5, damage: 2.5, speed: 1.2, defense: 1.2, critRate: 2.5, dodgeChance: 1.5, bleedChance: 0.5 },
  },
  {
    namePool: ['Slime Rei', 'Núcleo Primordial', 'Entidade Amorfa'],
    sprite: MOB_SPRITES.slime,
    color: '#06B6D4', // ciano
    statBias: { hp: 5.0, damage: 1.5, speed: 0.7, defense: 2.0, critRate: 0.8, dodgeChance: 0.5, bleedChance: 2.0 },
  },
];

// ─── UTILITÁRIOS ──────────────────────────────────────────────

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── CÁLCULO DE STATS DE MOB ──────────────────────────────────

/**
 * Calcula os stats base de um mob baseado na wave e tipo.
 * Stats escalam exponencialmente para progressão infinita.
 *
 * Fórmula: statBase * waveScale * typeMult * templateBias
 */
function calculateMobStats(
  wave: number,
  mobType: MobType,
  template: MobTemplate
): MobStats {
  // Escala por wave: cresce ~15% por wave
  const waveScale = Math.pow(1.15, wave - 1);

  // Multiplicadores por tipo de mob
  const typeMults = {
    normal: { hp: 1.0, damage: 1.0, speed: 1.0, defense: 1.0 },
    elite:  { hp: 2.5, damage: 1.5, speed: 1.1, defense: 1.3 },
    boss:   { hp: 8.0, damage: 2.0, speed: 0.9, defense: 1.8 },
  };

  const mult = typeMults[mobType];
  const bias = template.statBias;

  // Stats base da wave 1
  const BASE_HP = 50;
  const BASE_DAMAGE = 8;
  const BASE_SPEED = 0.8;
  const BASE_DEFENSE = 2;

  return {
    maxHp:       Math.floor(BASE_HP * waveScale * mult.hp * bias.hp),
    currentHp:   Math.floor(BASE_HP * waveScale * mult.hp * bias.hp),
    attackDamage: Math.floor(BASE_DAMAGE * waveScale * mult.damage * bias.damage),
    attackSpeed:  Math.min(BASE_SPEED * mult.speed * bias.speed, 3.0), // Cap em 3.0
    defense:      Math.floor(BASE_DEFENSE * waveScale * mult.defense * bias.defense),
    critRate:     Math.min(5 * bias.critRate + wave * 0.5, 40),  // Cap em 40%
    critDamage:   130 + wave * 2,                                // Escala suave
    dodgeChance:  Math.min(5 * bias.dodgeChance + wave * 0.3, 30), // Cap em 30%
    bleedChance:  Math.min(5 * bias.bleedChance, 25),
    bleedDamage:  Math.floor(3 * waveScale * bias.bleedChance),
  };
}

// ─── GERADOR PRINCIPAL ────────────────────────────────────────

/**
 * Determina o tipo de mob baseado na posição na wave.
 * Padrão: normal, normal, normal, normal, elite, ..., boss (a cada 10 waves)
 */
export function getMobTypeForWave(wave: number, mobIndex: number, mobsInWave: number): MobType {
  // Último mob da wave: boss a cada 10 waves, elite a cada 5
  if (mobIndex === mobsInWave - 1) {
    if (wave % 10 === 0) return 'boss';
    if (wave % 5 === 0) return 'elite';
  }
  // Penúltimo mob em waves múltiplas de 5: elite
  if (mobIndex === mobsInWave - 2 && wave % 5 === 0) return 'elite';
  return 'normal';
}

/**
 * Calcula quantos mobs existem em uma wave.
 * Começa com 3, aumenta gradualmente.
 */
export function getMobCountForWave(wave: number): number {
  return Math.min(3 + Math.floor(wave / 5), 8); // 3-8 mobs por wave
}

/**
 * Gera um mob aleatório para uma wave específica.
 */
export function generateMob(wave: number, mobType: MobType): Mob {
  // Escolher template (boss tem templates especiais)
  const template = mobType === 'boss'
    ? randChoice(BOSS_TEMPLATES)
    : randChoice(MOB_TEMPLATES);

  const stats = calculateMobStats(wave, mobType, template);
  const name = randChoice(template.namePool);

  // Sufixo para elite/boss
  const nameSuffix = mobType === 'elite' ? ' [ELITE]' : mobType === 'boss' ? ' [BOSS]' : '';

  // Recompensa de ouro escala com wave e tipo
  const goldBase = 10 * wave;
  const goldMults = { normal: 1, elite: 3, boss: 8 };
  const goldMult = goldMults[mobType];

  // Recompensa de XP
  const xpBase = 20 * wave;
  const xpMults = { normal: 1, elite: 2.5, boss: 6 };

  return {
    id: nanoid(),
    name: `${name}${nameSuffix}`,
    type: mobType,
    level: wave,
    stats,
    sprite: template.sprite,
    color: template.color,
    dropTable: [], // Drops são gerados na morte pelo itemGenerator
    goldReward: {
      min: Math.floor(goldBase * goldMult * 0.8),
      max: Math.floor(goldBase * goldMult * 1.2),
    },
    xpReward: Math.floor(xpBase * xpMults[mobType]),
  };
}

/**
 * Gera a sequência completa de mobs para uma wave.
 */
export function generateWaveMobs(wave: number): Mob[] {
  const count = getMobCountForWave(wave);
  const mobs: Mob[] = [];

  for (let i = 0; i < count; i++) {
    const mobType = getMobTypeForWave(wave, i, count);
    mobs.push(generateMob(wave, mobType));
  }

  return mobs;
}

/**
 * Gera um mercante aleatório para aparecer entre waves.
 * Aparece a cada 5 waves por padrão.
 */
export function shouldMerchantAppear(wave: number): boolean {
  return wave > 0 && wave % 5 === 0;
}

/**
 * Gera o nome do mercante aleatoriamente.
 */
export function generateMerchantName(): string {
  const names = [
    'Gareth, o Mercador Sombrio',
    'Lyra das Sombras',
    'Theron, o Viajante',
    'Mira, a Comerciante',
    'Drak, o Anão Mercador',
    'Selene, a Bruxa Mercante',
    'Korr, o Orc Negociante',
  ];
  return randChoice(names);
}
