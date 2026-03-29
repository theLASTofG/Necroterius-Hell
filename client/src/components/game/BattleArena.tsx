/**
 * ============================================================
 * AFK BATTLE ARENA — COMPONENTE DE ARENA DE BATALHA
 * ============================================================
 * Design: Void Signal — Brutal Minimalism Dark
 * - Background preto absoluto
 * - Sprites pixel art centralizados
 * - Barras de HP com animação de drain suave
 * - Números flutuantes de dano
 * - Efeitos visuais de status (sangramento, crítico)
 * ============================================================
 */

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../contexts/GameContext';
import { FloatingNumber, CombatEventType, RARITY_COLORS } from '../../game/types';

// ─── HERO SPRITE URL ──────────────────────────────────────────
const HERO_SPRITE = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663488898874/FQHBuMCGwST5CLgJSQ9Ws7/hero-warrior-fjmB4uuzB7nNLGf4pdaP6F.webp';

// ─── COR DOS NÚMEROS FLUTUANTES ───────────────────────────────
function getFloatingNumberColor(type: CombatEventType): string {
  switch (type) {
    case 'crit':
    case 'triple_attack': return '#FBBF24'; // âmbar — crítico
    case 'double_attack': return '#FB923C'; // laranja — duplo
    case 'attack':        return '#F9FAFB'; // branco — ataque normal
    case 'bleed_tick':    return '#DC2626'; // vermelho escuro — sangramento
    case 'mob_attack':
    case 'mob_crit':
    case 'mob_bleed':     return '#EF4444'; // vermelho — dano recebido
    case 'heal':
    case 'lifesteal':     return '#22C55E'; // verde — cura
    case 'dodge':         return '#3B82F6'; // azul — esquiva
    case 'block':         return '#6B7280'; // cinza — bloqueio
    case 'thorns':        return '#A855F7'; // roxo — espinhos
    default:              return '#F9FAFB';
  }
}

function getFloatingNumberSize(type: CombatEventType, value: number): string {
  if (type === 'crit' || type === 'triple_attack') {
    return value > 50 ? 'text-3xl' : 'text-2xl';
  }
  if (type === 'mob_crit') return 'text-2xl';
  return 'text-lg';
}

function getFloatingNumberLabel(type: CombatEventType, value: number): string {
  switch (type) {
    case 'dodge':  return 'ESQUIVOU';
    case 'block':  return `BLOQUEOU ${value}`;
    case 'miss':   return 'ERROU';
    case 'heal':
    case 'lifesteal': return `+${value}`;
    default: return `${value}`;
  }
}

// ─── COMPONENTE DE NÚMERO FLUTUANTE ──────────────────────────

function FloatingDamageNumber({ fn }: { fn: FloatingNumber }) {
  const color = getFloatingNumberColor(fn.type);
  const sizeClass = getFloatingNumberSize(fn.type, fn.value);
  const label = getFloatingNumberLabel(fn.type, fn.value);
  const isCrit = fn.type === 'crit' || fn.type === 'mob_crit' || fn.type === 'triple_attack';

  return (
    <motion.div
      key={fn.id}
      className={`absolute pointer-events-none font-mono font-bold select-none ${sizeClass}`}
      style={{
        left: `${fn.x}%`,
        top: `${fn.y}%`,
        color,
        textShadow: isCrit ? `0 0 12px ${color}` : `0 0 6px ${color}80`,
        zIndex: 50,
        fontFamily: "'Space Mono', monospace",
      }}
      initial={{ opacity: 1, y: 0, scale: isCrit ? 1.4 : 1 }}
      animate={{ opacity: 0, y: -60, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
    >
      {isCrit && <span className="text-xs block text-center mb-0.5">CRÍTICO!</span>}
      {label}
    </motion.div>
  );
}

// ─── BARRA DE HP ──────────────────────────────────────────────

interface HpBarProps {
  current: number;
  max: number;
  color: string;
  label: string;
  showNumbers?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

function HpBar({ current, max, color, label, showNumbers = true, size = 'md' }: HpBarProps) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0;
  const heightClass = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-4' : 'h-2.5';

  // Cor da barra muda quando HP está baixo
  const barColor = pct > 50 ? color
    : pct > 25 ? '#FBBF24'  // âmbar quando 25-50%
    : '#EF4444';             // vermelho quando <25%

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">{label}</span>
        {showNumbers && (
          <span className="text-xs font-mono" style={{ color: barColor }}>
            {Math.ceil(current)}/{max}
          </span>
        )}
      </div>
      <div className={`w-full ${heightClass} bg-gray-900 rounded-none overflow-hidden`}
           style={{ border: '1px solid #1F2937' }}>
        <motion.div
          className={`${heightClass} rounded-none`}
          style={{ backgroundColor: barColor }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────

export default function BattleArena() {
  const { state, floatingNumbers } = useGame();
  const { combat, character } = state;
  const mob = combat.currentMob;
  const playerStats = character.computedStats;

  // Efeito de sangramento no mob
  const mobHasBleeding = combat.mobBleedEffects.length > 0;
  const playerHasBleeding = combat.playerBleedEffects.length > 0;

  return (
    <div
      className="relative w-full flex flex-col items-center justify-between"
      style={{
        background: '#000000',
        minHeight: '400px',
        height: '100%',
      }}
    >
      {/* ── Números flutuantes de dano ── */}
      <AnimatePresence>
        {floatingNumbers.map(fn => (
          <FloatingDamageNumber key={fn.id} fn={fn} />
        ))}
      </AnimatePresence>

      {/* ── Área de batalha ── */}
      <div className="flex-1 w-full flex items-center justify-between px-8 py-4 relative">

        {/* ── Lado do jogador (esquerda) ── */}
        <div className="flex flex-col items-center gap-3 w-40">
          {/* Status de sangramento */}
          {playerHasBleeding && (
            <motion.div
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="text-xs font-mono px-2 py-0.5"
              style={{ color: '#DC2626', border: '1px solid #DC2626' }}
            >
              ⚡ SANGRANDO
            </motion.div>
          )}

          {/* Sprite do herói */}
          <motion.div
            className="relative"
            animate={
              playerHasBleeding
                ? { filter: ['brightness(1)', 'brightness(1.3) sepia(1) hue-rotate(-20deg)', 'brightness(1)'] }
                : {}
            }
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            <img
              src={HERO_SPRITE}
              alt="Herói"
              className="w-28 h-28 object-contain"
              style={{
                imageRendering: 'pixelated',
                filter: character.baseStats.currentHp <= 0
                  ? 'grayscale(1) brightness(0.3)'
                  : 'drop-shadow(0 0 8px rgba(251,191,36,0.4))',
              }}
            />
          </motion.div>

          {/* Nome do personagem */}
          <span
            className="text-xs font-mono uppercase tracking-widest"
            style={{ color: '#9CA3AF' }}
          >
            {character.name}
          </span>

          {/* Barra de HP do jogador */}
          <div className="w-full">
            <HpBar
              current={character.baseStats.currentHp}
              max={playerStats.maxHp}
              color="#22C55E"
              label="HP"
              size="md"
            />
          </div>
        </div>

        {/* ── Centro — VS e info de wave ── */}
        <div className="flex flex-col items-center gap-2">
          <motion.div
            className="text-4xl font-bold"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              color: '#1F2937',
              letterSpacing: '0.1em',
            }}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            VS
          </motion.div>

          {/* Indicador de wave */}
          <div
            className="text-xs font-mono px-3 py-1 text-center"
            style={{
              color: '#6B7280',
              border: '1px solid #1F2937',
              background: '#050505',
            }}
          >
            <div style={{ color: '#FBBF24', fontFamily: "'Bebas Neue', sans-serif", fontSize: '18px' }}>
              WAVE {combat.wave}
            </div>
            <div style={{ color: '#374151' }}>
              {combat.mobsKilled}/{combat.mobsInWave} mobs
            </div>
          </div>
        </div>

        {/* ── Lado do mob (direita) ── */}
        <div className="flex flex-col items-center gap-3 w-40">
          {/* Status de sangramento no mob */}
          {mobHasBleeding && (
            <motion.div
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="text-xs font-mono px-2 py-0.5"
              style={{ color: '#DC2626', border: '1px solid #DC2626' }}
            >
              ⚡ SANGRANDO
            </motion.div>
          )}

          {mob ? (
            <>
              {/* Sprite do mob */}
              <motion.div
                className="relative"
                animate={
                  mob.stats.currentHp < mob.stats.maxHp * 0.3
                    ? { x: [-1, 1, -1, 0] }
                    : {}
                }
                transition={{ duration: 0.1, repeat: Infinity }}
              >
                {/* Borda colorida baseada na raridade/tipo */}
                <div
                  className="absolute inset-0 rounded-none"
                  style={{
                    boxShadow: `0 0 20px ${mob.color}40`,
                    border: `1px solid ${mob.color}30`,
                  }}
                />
                <img
                  src={mob.sprite}
                  alt={mob.name}
                  className="w-28 h-28 object-contain relative z-10"
                  style={{
                    imageRendering: 'pixelated',
                    filter: `drop-shadow(0 0 8px ${mob.color}60)`,
                    transform: 'scaleX(-1)', // Virar para encarar o herói
                  }}
                />

                {/* Badge de tipo */}
                {mob.type !== 'normal' && (
                  <div
                    className="absolute -top-2 -right-2 text-xs font-mono px-1 z-20"
                    style={{
                      background: mob.type === 'boss' ? '#FBBF24' : '#A855F7',
                      color: '#000',
                      fontSize: '9px',
                      fontWeight: 'bold',
                    }}
                  >
                    {mob.type === 'boss' ? 'BOSS' : 'ELITE'}
                  </div>
                )}
              </motion.div>

              {/* Nome do mob */}
              <span
                className="text-xs font-mono text-center uppercase tracking-wide"
                style={{ color: mob.color, maxWidth: '140px' }}
              >
                {mob.name}
              </span>

              {/* Barra de HP do mob */}
              <div className="w-full">
                <HpBar
                  current={mob.stats.currentHp}
                  max={mob.stats.maxHp}
                  color={mob.color}
                  label="HP"
                  size="md"
                />
              </div>
            </>
          ) : (
            <div
              className="w-28 h-28 flex items-center justify-center"
              style={{ border: '1px dashed #1F2937' }}
            >
              <span className="text-gray-700 text-xs font-mono">VAZIO</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Linha de progresso da wave ── */}
      <div className="w-full px-4 pb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-mono text-gray-600">PROGRESSO DA WAVE</span>
          <span className="text-xs font-mono text-gray-600">
            {combat.mobsKilled}/{combat.mobsInWave}
          </span>
        </div>
        <div className="w-full h-1 bg-gray-900" style={{ border: '1px solid #111827' }}>
          <motion.div
            className="h-full"
            style={{ background: '#FBBF24' }}
            animate={{
              width: `${combat.mobsInWave > 0 ? (combat.mobsKilled / combat.mobsInWave) * 100 : 0}%`
            }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  );
}
