/**
 * ============================================================
 * AFK BATTLE ARENA — PAINEL DE DROP RATES
 * ============================================================
 * Exibe as chances de drop de itens por raridade
 * para o mob atual.
 * ============================================================
 */

import React from 'react';
import { useGame } from '../../contexts/GameContext';
import { RARITY_COLORS, RARITY_LABELS, RARITY_DROP_CHANCE } from '../../game/types';

export default function DropRatesPanel() {
  const { state } = useGame();
  const { combat } = state;
  const mob = combat.currentMob;

  if (!mob) return null;

  return (
    <div
      className="w-full p-3"
      style={{
        background: '#050505',
        border: '1px solid #111827',
      }}
    >
      {/* Header */}
      <div
        className="text-xs font-mono uppercase tracking-widest mb-3 pb-2"
        style={{
          color: '#4B5563',
          borderBottom: '1px solid #111827',
          fontFamily: "'Space Mono', monospace",
        }}
      >
        📊 CHANCES DE DROP
      </div>

      {/* Tabela de raridades */}
      <div className="flex flex-col gap-2">
        {(['legendary', 'epic', 'rare', 'uncommon', 'common'] as const).map(rarity => {
          const chance = RARITY_DROP_CHANCE[rarity];
          const color = RARITY_COLORS[rarity];

          return (
            <div key={rarity} className="flex items-center gap-2">
              {/* Label */}
              <div
                className="text-xs font-mono flex-shrink-0"
                style={{ color, width: '60px', fontSize: '9px' }}
              >
                {RARITY_LABELS[rarity]}
              </div>

              {/* Barra de progresso */}
              <div className="flex-1 h-2 bg-gray-900" style={{ border: `1px solid ${color}40` }}>
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${chance}%`,
                    background: color,
                  }}
                />
              </div>

              {/* Percentual */}
              <div
                className="text-xs font-mono flex-shrink-0"
                style={{ color, width: '35px', textAlign: 'right', fontSize: '9px' }}
              >
                {chance}%
              </div>
            </div>
          );
        })}
      </div>

      {/* Info do mob */}
      <div
        className="mt-3 pt-2 text-xs font-mono"
        style={{
          borderTop: '1px solid #111827',
          color: '#374151',
          fontSize: '8px',
        }}
      >
        <div>{mob.name} (Nível {mob.level})</div>
        <div style={{ color: '#22C55E' }}>
          💰 {mob.goldReward.min}-{mob.goldReward.max} ouro
        </div>
        <div style={{ color: '#FBBF24' }}>
          ⭐ {mob.xpReward} XP
        </div>
      </div>
    </div>
  );
}
