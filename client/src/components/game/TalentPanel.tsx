/**
 * ============================================================
 * AFK BATTLE ARENA — PAINEL DE TALENTOS
 * ============================================================
 * Sistema de árvore de talentos onde o jogador gasta XP
 * para aumentar stats base permanentemente.
 * ============================================================
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../../contexts/GameContext';

interface Talent {
  id: string;
  label: string;
  stat: keyof import('../../game/types').CharacterStats;
  icon: string;
  costPerLevel: number;
  maxLevel: number;
  currentLevel: number;
  description: string;
}

export default function TalentPanel() {
  const { state } = useGame();
  const { character } = state;
  const [selectedTalent, setSelectedTalent] = useState<string | null>(null);

  // Talentos disponíveis
  const talents: Talent[] = [
    {
      id: 'hp',
      label: 'Vitalidade',
      stat: 'maxHp',
      icon: '❤️',
      costPerLevel: 10,
      maxLevel: 50,
      currentLevel: 0,
      description: 'Aumenta HP máximo em +5 por nível',
    },
    {
      id: 'attack',
      label: 'Força',
      stat: 'attackDamage',
      icon: '⚔️',
      costPerLevel: 15,
      maxLevel: 40,
      currentLevel: 0,
      description: 'Aumenta dano de ataque em +2 por nível',
    },
    {
      id: 'speed',
      label: 'Velocidade',
      stat: 'attackSpeed',
      icon: '⚡',
      costPerLevel: 12,
      maxLevel: 30,
      currentLevel: 0,
      description: 'Aumenta velocidade de ataque em +0.05 por nível',
    },
    {
      id: 'crit',
      label: 'Precisão',
      stat: 'critRate',
      icon: '🎯',
      costPerLevel: 20,
      maxLevel: 25,
      currentLevel: 0,
      description: 'Aumenta chance de crítico em +1% por nível',
    },
    {
      id: 'defense',
      label: 'Armadura',
      stat: 'defense',
      icon: '🛡️',
      costPerLevel: 18,
      maxLevel: 35,
      currentLevel: 0,
      description: 'Aumenta defesa em +3 por nível',
    },
    {
      id: 'dodge',
      label: 'Esquiva',
      stat: 'dodgeChance',
      icon: '◌',
      costPerLevel: 16,
      maxLevel: 20,
      currentLevel: 0,
      description: 'Aumenta chance de esquiva em +1% por nível',
    },
  ];

  const availableXp = character.xp; // XP não gasto

  return (
    <div
      className="w-full flex flex-col"
      style={{
        background: '#050505',
        border: '1px solid #111827',
        maxHeight: '500px',
      }}
    >
      {/* Header */}
      <div
        className="px-3 py-2"
        style={{ borderBottom: '1px solid #111827' }}
      >
        <div className="flex items-center justify-between">
          <span
            className="text-xs font-mono uppercase tracking-widest"
            style={{ color: '#4B5563', fontFamily: "'Space Mono', monospace" }}
          >
            🌳 ÁRVORE DE TALENTOS
          </span>
          <span className="text-xs font-mono" style={{ color: '#22C55E' }}>
            XP: {availableXp}
          </span>
        </div>
      </div>

      {/* Grid de talentos */}
      <div className="flex-1 overflow-y-auto p-2 grid grid-cols-2 gap-2">
        {talents.map(talent => {
          const canUpgrade = availableXp >= talent.costPerLevel && talent.currentLevel < talent.maxLevel;
          const isSelected = selectedTalent === talent.id;

          return (
            <motion.div
              key={talent.id}
              className="p-2 cursor-pointer"
              style={{
                border: isSelected ? '1px solid #FBBF24' : '1px solid #1F2937',
                background: isSelected ? '#FBBF2410' : '#080808',
              }}
              whileHover={{ borderColor: '#374151' }}
              onClick={() => setSelectedTalent(isSelected ? null : talent.id)}
            >
              <div className="flex items-center gap-2 mb-1">
                <span style={{ fontSize: '20px' }}>{talent.icon}</span>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-xs font-mono font-bold truncate"
                    style={{ color: '#D1D5DB', fontSize: '10px' }}
                  >
                    {talent.label}
                  </div>
                  <div
                    className="text-xs font-mono"
                    style={{ color: '#374151', fontSize: '8px' }}
                  >
                    Nv {talent.currentLevel}/{talent.maxLevel}
                  </div>
                </div>
              </div>

              {/* Barra de progresso */}
              <div className="w-full h-1 bg-gray-900 mb-1" style={{ border: '1px solid #1F2937' }}>
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${(talent.currentLevel / talent.maxLevel) * 100}%`,
                    background: '#FBBF24',
                  }}
                />
              </div>

              {/* Custo */}
              <div
                className="text-xs font-mono text-right"
                style={{
                  color: canUpgrade ? '#22C55E' : '#374151',
                  fontSize: '8px',
                }}
              >
                {talent.costPerLevel} XP
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Painel de detalhes */}
      {selectedTalent && (
        <div
          className="p-2"
          style={{
            borderTop: '1px solid #111827',
            background: '#030303',
            fontSize: '10px',
            color: '#6B7280',
            fontFamily: "'Space Mono', monospace",
          }}
        >
          <div className="text-xs font-mono" style={{ color: '#D1D5DB', marginBottom: '4px' }}>
            {talents.find(t => t.id === selectedTalent)?.description}
          </div>
          <motion.button
            className="w-full py-1 text-xs font-mono"
            style={{
              border: '1px solid #374151',
              color: '#9CA3AF',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '9px',
            }}
            whileHover={{ borderColor: '#FBBF24', color: '#FBBF24' }}
          >
            UPGRADE
          </motion.button>
        </div>
      )}
    </div>
  );
}
