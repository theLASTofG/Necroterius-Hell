/**
 * ============================================================
 * AFK BATTLE ARENA — PAINEL DE STATS DO PERSONAGEM
 * ============================================================
 * Design: Void Signal — Brutal Minimalism Dark
 * Exibe todos os stats computados do personagem.
 * Stats são agrupados por categoria: Ofensivos / Defensivos / Utilitários
 * ============================================================
 */

import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { CharacterStats } from '../../game/types';

type StatCategory = 'offensive' | 'defensive' | 'utility';

interface StatRow {
  label: string;
  value: string;
  color: string;
  category: StatCategory;
}

function buildStatRows(stats: CharacterStats, level: number, xp: number, xpNext: number): StatRow[] {
  return [
    // Ofensivos
    { label: 'Dano de Ataque',    value: `${Math.floor(stats.attackDamage)}`,       color: '#EF4444', category: 'offensive' },
    { label: 'Vel. de Ataque',    value: `${stats.attackSpeed.toFixed(2)}/s`,        color: '#FB923C', category: 'offensive' },
    { label: 'Chance Crítica',    value: `${stats.critRate.toFixed(1)}%`,            color: '#FBBF24', category: 'offensive' },
    { label: 'Dano Crítico',      value: `${stats.critDamage.toFixed(0)}%`,          color: '#FBBF24', category: 'offensive' },
    { label: 'Duplo Ataque',      value: `${stats.doubleAttackChance.toFixed(1)}%`,  color: '#F97316', category: 'offensive' },
    { label: 'Triplo Ataque',     value: `${stats.tripleAttackChance.toFixed(1)}%`,  color: '#F97316', category: 'offensive' },
    { label: 'Sangramento',       value: `${stats.bleedChance.toFixed(1)}%`,         color: '#DC2626', category: 'offensive' },
    { label: 'Dano Sangramento',  value: `${Math.floor(stats.bleedDamage)}/tick`,    color: '#DC2626', category: 'offensive' },
    { label: 'Roubo de Vida',     value: `${stats.lifesteal.toFixed(1)}%`,           color: '#22C55E', category: 'offensive' },
    // Defensivos
    { label: 'HP Máximo',         value: `${Math.floor(stats.maxHp)}`,              color: '#22C55E', category: 'defensive' },
    { label: 'Regen HP',          value: `${stats.hpRegen.toFixed(1)}/s`,           color: '#16A34A', category: 'defensive' },
    { label: 'Defesa',            value: `${Math.floor(stats.defense)}`,            color: '#3B82F6', category: 'defensive' },
    { label: 'Redução Dano',      value: `${stats.defensePct.toFixed(1)}%`,         color: '#3B82F6', category: 'defensive' },
    { label: 'Esquiva',           value: `${stats.dodgeChance.toFixed(1)}%`,        color: '#60A5FA', category: 'defensive' },
    { label: 'Bloqueio',          value: `${stats.blockChance.toFixed(1)}%`,        color: '#6B7280', category: 'defensive' },
    { label: 'Valor Bloqueio',    value: `${Math.floor(stats.blockValue)}`,         color: '#6B7280', category: 'defensive' },
    { label: 'Espinhos',          value: `${Math.floor(stats.thorns)}`,             color: '#A855F7', category: 'defensive' },
    // Utilitários
    { label: 'Bônus Ouro',        value: `+${stats.goldFind.toFixed(0)}%`,          color: '#FBBF24', category: 'utility' },
    { label: 'Bônus Drop',        value: `+${stats.itemFind.toFixed(0)}%`,          color: '#A855F7', category: 'utility' },
    { label: 'Bônus XP',          value: `+${stats.xpGain.toFixed(0)}%`,            color: '#22C55E', category: 'utility' },
  ];
}

export default function StatsPanel() {
  const { state } = useGame();
  const { character } = state;
  const stats = character.computedStats;
  const [activeCategory, setActiveCategory] = useState<StatCategory>('offensive');

  const allRows = buildStatRows(stats, character.level, character.xp, character.xpToNextLevel);
  const filteredRows = allRows.filter(r => r.category === activeCategory);

  const xpPct = character.xpToNextLevel > 0
    ? (character.xp / character.xpToNextLevel) * 100
    : 0;

  const categories: Array<{ id: StatCategory; label: string }> = [
    { id: 'offensive', label: 'ATAQUE' },
    { id: 'defensive', label: 'DEFESA' },
    { id: 'utility',   label: 'UTIL' },
  ];

  return (
    <div
      className="w-full flex flex-col"
      style={{
        background: '#050505',
        border: '1px solid #111827',
      }}
    >
      {/* Header — Nível e XP */}
      <div
        className="px-3 py-2"
        style={{ borderBottom: '1px solid #111827' }}
      >
        <div className="flex items-center justify-between mb-1.5">
          <div>
            <span
              className="font-bold"
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '22px',
                color: '#F9FAFB',
                letterSpacing: '0.05em',
              }}
            >
              {character.name}
            </span>
            <span
              className="ml-2 text-xs font-mono"
              style={{ color: '#FBBF24' }}
            >
              LV.{character.level}
            </span>
          </div>
          <span className="text-xs font-mono" style={{ color: '#FBBF24' }}>
            💰 {character.gold.toLocaleString()}
          </span>
        </div>

        {/* Barra de XP */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-0.5" style={{ color: '#374151' }}>
            <span>XP</span>
            <span>{character.xp}/{character.xpToNextLevel}</span>
          </div>
          <div className="w-full h-1.5 bg-gray-900" style={{ border: '1px solid #1F2937' }}>
            <div
              className="h-full transition-all duration-300"
              style={{ width: `${xpPct}%`, background: '#22C55E' }}
            />
          </div>
        </div>
      </div>

      {/* Tabs de categoria */}
      <div className="flex" style={{ borderBottom: '1px solid #111827' }}>
        {categories.map(cat => (
          <button
            key={cat.id}
            className="flex-1 text-xs font-mono py-1.5 uppercase tracking-wider"
            style={{
              color: activeCategory === cat.id ? '#F9FAFB' : '#374151',
              background: activeCategory === cat.id ? '#111827' : 'transparent',
              border: 'none',
              borderBottom: activeCategory === cat.id ? '2px solid #FBBF24' : '2px solid transparent',
              cursor: 'pointer',
              fontFamily: "'Space Mono', monospace",
              fontSize: '9px',
            }}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="p-2 flex flex-col gap-0.5 overflow-y-auto" style={{ maxHeight: '200px' }}>
        {filteredRows.map((row, i) => (
          <div
            key={i}
            className="flex justify-between items-center py-0.5 px-1"
            style={{
              borderBottom: '1px solid #0D1117',
            }}
          >
            <span
              className="text-xs font-mono"
              style={{ color: '#4B5563', fontSize: '10px' }}
            >
              {row.label}
            </span>
            <span
              className="text-xs font-mono font-bold"
              style={{ color: row.value === '0' || row.value === '0%' || row.value === '0/tick' || row.value === '+0%' || row.value === '0/s' ? '#1F2937' : row.color, fontSize: '10px' }}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
