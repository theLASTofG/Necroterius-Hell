/**
 * ============================================================
 * AFK BATTLE ARENA — PAINEL DE DROP RATES
 * ============================================================
 * Exibe as chances de drop de itens por raridade
 * para o mob atual, considerando bônus de item find.
 * ============================================================
 */

import React from 'react';
import { useGame } from '../../contexts/GameContext';
import { RARITY_COLORS, RARITY_LABELS, RARITY_DROP_CHANCE, Rarity } from '../../game/types';
import { computeCharacterStats } from '../../game/stats';

export default function DropRatesPanel() {
  const { state } = useGame();
  const { combat, character } = state;
  const mob = combat.currentMob;

  if (!mob) return null;

  const playerStats = computeCharacterStats(character);
  const itemFindBonus = playerStats.itemFind;
  const bonusMultiplier = 1 + itemFindBonus / 100;

  // Calcular chances reais com bônus (mesma lógica do rollRarity)
  const rawChances: Record<Rarity, number> = {
    common:    RARITY_DROP_CHANCE.common,
    uncommon:  RARITY_DROP_CHANCE.uncommon * bonusMultiplier,
    rare:      RARITY_DROP_CHANCE.rare * bonusMultiplier,
    epic:      RARITY_DROP_CHANCE.epic * bonusMultiplier,
    legendary: RARITY_DROP_CHANCE.legendary * bonusMultiplier,
    mythic:    RARITY_DROP_CHANCE.mythic * bonusMultiplier,
    celestial: RARITY_DROP_CHANCE.celestial * bonusMultiplier,
  };

  const total = Object.values(rawChances).reduce((a, b) => a + b, 0);
  
  const rarities: Rarity[] = ['celestial', 'mythic', 'legendary', 'epic', 'rare', 'uncommon', 'common'];

  return (
    <div
      className="w-full p-3 rounded-lg"
      style={{
        background: '#050505',
        border: '1px solid #111827',
      }}
    >
      {/* Header */}
      <div
        className="text-xs font-mono uppercase tracking-widest mb-3 pb-2 flex justify-between items-center"
        style={{
          color: '#4B5563',
          borderBottom: '1px solid #111827',
          fontFamily: "'Space Mono', monospace",
        }}
      >
        <span>📊 CHANCES DE DROP</span>
        {itemFindBonus > 0 && (
          <span className="text-blue-400 text-[9px]">+{itemFindBonus}% ITEM FIND</span>
        )}
      </div>

      {/* Tabela de raridades */}
      <div className="flex flex-col gap-2">
        {rarities.map(rarity => {
          const rawChance = rawChances[rarity];
          const realChance = (rawChance / total) * 100;
          const color = RARITY_COLORS[rarity];

          // Não mostrar raridades com 0% de chance real
          if (realChance < 0.001) return null;

          return (
            <div key={rarity} className="flex items-center gap-2">
              {/* Label */}
              <div
                className="text-xs font-mono flex-shrink-0"
                style={{ color, width: '70px', fontSize: '9px' }}
              >
                {RARITY_LABELS[rarity]}
              </div>

              {/* Barra de progresso */}
              <div className="flex-1 h-2 bg-gray-900 rounded-full overflow-hidden" style={{ border: `1px solid ${color}20` }}>
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, realChance * 2)}%`, // Escala visual para melhor visibilidade de raros
                    background: color,
                    boxShadow: realChance < 1 ? `0 0 5px ${color}` : 'none'
                  }}
                />
              </div>

              {/* Percentual */}
              <div
                className="text-xs font-mono flex-shrink-0"
                style={{ color, width: '45px', textAlign: 'right', fontSize: '9px' }}
              >
                {realChance < 0.1 ? realChance.toFixed(3) : realChance.toFixed(1)}%
              </div>
            </div>
          );
        })}
      </div>

      {/* Info do mob */}
      <div
        className="mt-3 pt-2 text-xs font-mono flex justify-between items-end"
        style={{
          borderTop: '1px solid #111827',
          color: '#374151',
          fontSize: '8px',
        }}
      >
        <div>
          <div className="text-slate-400">{mob.name}</div>
          <div className="text-slate-600">Nível {mob.level} • {mob.type.toUpperCase()}</div>
        </div>
        <div className="text-right">
          <div style={{ color: '#22C55E' }}>
            💰 {mob.goldReward.min}-{mob.goldReward.max}
          </div>
          <div style={{ color: '#FBBF24' }}>
            ⭐ {mob.xpReward} XP
          </div>
        </div>
      </div>
    </div>
  );
}
