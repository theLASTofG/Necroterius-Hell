/**
 * ============================================================
 * AFK BATTLE ARENA — PAINEL DE STATUS DO HERÓI
 * ============================================================
 * Exibe todos os stats do personagem de forma expansível.
 * Pode ser aberto/fechado para economizar espaço.
 * ============================================================
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../contexts/GameContext';
import { CharacterStats } from '../../game/types';

export default function HeroStatusPanel() {
  const { state } = useGame();
  const { character } = state;
  const stats = character.computedStats;
  const [isExpanded, setIsExpanded] = useState(false);

  const statGroups = [
    {
      label: 'VITAIS',
      icon: '❤️',
      color: '#22C55E',
      stats: [
        { label: 'HP', value: `${Math.ceil(stats.maxHp)}` },
        { label: 'Regen', value: `${stats.hpRegen.toFixed(1)}/s` },
      ],
    },
    {
      label: 'OFENSIVO',
      icon: '⚔️',
      color: '#EF4444',
      stats: [
        { label: 'Ataque', value: `${Math.floor(stats.attackDamage)}` },
        { label: 'Vel.', value: `${stats.attackSpeed.toFixed(2)}/s` },
        { label: 'Crítico', value: `${stats.critRate.toFixed(1)}%` },
        { label: 'Dano Crítico', value: `${stats.critDamage.toFixed(0)}%` },
        { label: 'Duplo Ataque', value: `${stats.doubleAttackChance.toFixed(1)}%` },
        { label: 'Triplo Ataque', value: `${stats.tripleAttackChance.toFixed(1)}%` },
        { label: 'Sangramento', value: `${stats.bleedChance.toFixed(1)}%` },
        { label: 'Roubo de Vida', value: `${stats.lifesteal.toFixed(1)}%` },
      ],
    },
    {
      label: 'DEFENSIVO',
      icon: '🛡️',
      color: '#3B82F6',
      stats: [
        { label: 'Defesa', value: `${Math.floor(stats.defense)}` },
        { label: 'Redução %', value: `${stats.defensePct.toFixed(1)}%` },
        { label: 'Esquiva', value: `${stats.dodgeChance.toFixed(1)}%` },
        { label: 'Bloqueio', value: `${stats.blockChance.toFixed(1)}%` },
        { label: 'Valor Bloqueio', value: `${Math.floor(stats.blockValue)}` },
        { label: 'Espinhos', value: `${Math.floor(stats.thorns)}` },
      ],
    },
    {
      label: 'UTILITÁRIO',
      icon: '✨',
      color: '#A855F7',
      stats: [
        { label: 'Bônus Ouro', value: `+${stats.goldFind.toFixed(0)}%` },
        { label: 'Bônus Drop', value: `+${stats.itemFind.toFixed(0)}%` },
        { label: 'Bônus XP', value: `+${stats.xpGain.toFixed(0)}%` },
      ],
    },
  ];

  return (
    <div
      className="w-full"
      style={{
        background: '#050505',
        border: '1px solid #111827',
      }}
    >
      {/* Header expansível */}
      <motion.button
        className="w-full p-3 flex items-center justify-between"
        style={{
          borderBottom: isExpanded ? '1px solid #111827' : 'none',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <span style={{ fontSize: '20px' }}>👤</span>
          <div className="text-left">
            <div
              className="font-bold"
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '16px',
                color: '#F9FAFB',
                letterSpacing: '0.05em',
              }}
            >
              {character.name}
            </div>
            <div className="text-xs font-mono" style={{ color: '#374151' }}>
              LV.{character.level} · {character.gold.toLocaleString()} 💰
            </div>
          </div>
        </div>

        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ fontSize: '16px' }}
        >
          ▼
        </motion.div>
      </motion.button>

      {/* Conteúdo expandível */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="p-3 flex flex-col gap-3" style={{ borderTop: '1px solid #111827' }}>
              {statGroups.map(group => (
                <div key={group.label}>
                  {/* Título do grupo */}
                  <div
                    className="text-xs font-mono uppercase tracking-wider mb-2"
                    style={{ color: group.color, fontFamily: "'Space Mono', monospace" }}
                  >
                    {group.icon} {group.label}
                  </div>

                  {/* Stats do grupo */}
                  <div className="grid grid-cols-2 gap-1">
                    {group.stats.map((stat, i) => (
                      <div
                        key={i}
                        className="p-1.5 text-xs font-mono"
                        style={{
                          background: '#080808',
                          border: `1px solid ${group.color}20`,
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span style={{ color: '#4B5563', fontSize: '9px' }}>{stat.label}</span>
                        <span style={{ color: group.color, fontWeight: 'bold', fontSize: '9px' }}>
                          {stat.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
