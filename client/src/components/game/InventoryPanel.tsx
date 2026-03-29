/**
 * ============================================================
 * AFK BATTLE ARENA — PAINEL DE INVENTÁRIO
 * ============================================================
 * Design: Void Signal — Brutal Minimalism Dark
 * Lista todos os itens no inventário do personagem.
 * Clique em item: equipa
 * Botão direito / botão vender: descarta por 20% do preço
 *
 * Itens são ordenados por: raridade (desc) → power score (desc)
 * ============================================================
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../contexts/GameContext';
import {
  Item,
  RARITY_COLORS,
  RARITY_LABELS,
  Rarity,
} from '../../game/types';
import { getModifierLabel, calculateItemPower } from '../../game/stats';

// Ordem de raridade para sort
const RARITY_ORDER: Record<Rarity, number> = {
  celestial: 7, mythic: 6, legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1,
};

// ─── CARD DE ITEM ─────────────────────────────────────────────

interface ItemCardProps {
  item: Item;
  onEquip: () => void;
  onDiscard: () => void;
  isEquipped?: boolean;
}

function ItemCard({ item, onEquip, onDiscard, isEquipped }: ItemCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const rarityColor = RARITY_COLORS[item.rarity];
  const power = calculateItemPower(item);

  return (
    <div className="relative">
      <motion.div
        className="relative p-2 cursor-pointer select-none"
        style={{
          border: `1px solid ${rarityColor}50`,
          background: isEquipped ? `${rarityColor}10` : '#080808',
          transition: 'all 0.15s',
        }}
        whileHover={{
          borderColor: rarityColor,
          background: `${rarityColor}15`,
        }}
        whileTap={{ scale: 0.98 }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Linha de raridade no topo */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: rarityColor }}
        />

        <div className="flex items-center gap-2">
          {/* Ícone */}
          <span style={{ fontSize: '20px', minWidth: '24px', textAlign: 'center' }}>
            {item.icon}
          </span>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div
              className="text-xs font-mono truncate"
              style={{ color: item.uniqueEffect ? item.uniqueEffect.color : rarityColor, fontWeight: 'bold' }}
            >
              {item.uniqueEffect ? '★ ' : ''}{item.name}
            </div>
            <div className="text-xs font-mono" style={{ color: '#4B5563' }}>
              {RARITY_LABELS[item.rarity]} · POW {power}
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-1">
            <motion.button
              className="text-xs font-mono px-2 py-0.5"
              style={{
                border: `1px solid ${rarityColor}60`,
                color: rarityColor,
                background: 'transparent',
                cursor: 'pointer',
                fontSize: '10px',
              }}
              whileHover={{ background: `${rarityColor}20` }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => { e.stopPropagation(); onEquip(); }}
            >
              EQUIPAR
            </motion.button>
            <motion.button
              className="text-xs font-mono px-1.5 py-0.5"
              style={{
                border: '1px solid #374151',
                color: '#6B7280',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: '10px',
              }}
              whileHover={{ background: '#1F2937', color: '#FBBF24' }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => { e.stopPropagation(); onDiscard(); }}
              title={`Vender por ${Math.floor(item.price * 0.2)} ouro`}
            >
              💰
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            className="absolute z-50 w-64 p-3 text-xs font-mono pointer-events-none"
            style={{
              background: '#0A0A0A',
              border: `1px solid ${rarityColor}`,
              boxShadow: `0 0 20px ${rarityColor}30`,
              right: '110%',
              top: '0',
              minWidth: '240px',
            }}
            initial={{ opacity: 0, x: 5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            {/* Header */}
            <div className="font-bold text-sm mb-1" style={{ color: rarityColor }}>
              {item.icon} {item.name}
            </div>
            <div className="text-gray-500 mb-2">
              {RARITY_LABELS[item.rarity]} · Nível {item.level} · POW {power}
            </div>

            <div className="w-full h-px mb-2" style={{ background: `${rarityColor}40` }} />

            {/* Stats base */}
            {item.baseStats.map((mod, i) => (
              <div key={i} style={{ color: '#D1D5DB' }}>{getModifierLabel(mod)}</div>
            ))}

            {/* Stats bônus */}
            {item.bonusStats.length > 0 && (
              <>
                <div className="mt-1 mb-1 text-gray-600 uppercase tracking-wider text-xs">Modificadores</div>
                {item.bonusStats.map((mod, i) => (
                  <div key={i} style={{ color: rarityColor }}>{getModifierLabel(mod)}</div>
                ))}
              </>
            )}

            {/* Efeito Único */}
            {item.uniqueEffect && (
              <div className="mt-2 p-2" style={{ background: `${item.uniqueEffect.color}10`, border: `1px solid ${item.uniqueEffect.color}40` }}>
                <div className="font-bold text-xs mb-1" style={{ color: item.uniqueEffect.color }}>
                  ★ {item.uniqueEffect.name}
                </div>
                <div className="text-xs italic mb-1" style={{ color: `${item.uniqueEffect.color}CC` }}>
                  {item.uniqueEffect.description}
                </div>
                {item.uniqueEffect.modifiers.map((mod, i) => (
                  <div key={i} style={{ color: item.uniqueEffect!.color, fontWeight: 'bold' }}>
                    {getModifierLabel(mod)}
                  </div>
                ))}
              </div>
            )}

            <div className="w-full h-px mt-2 mb-2" style={{ background: '#1F2937' }} />
            <div className="text-gray-600 italic">{item.description}</div>
            <div className="mt-2 flex justify-between">
              <span style={{ color: '#6B7280' }}>Venda:</span>
              <span style={{ color: '#FBBF24' }}>💰 {Math.floor(item.price * 0.2)}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────

export default function InventoryPanel() {
  const { state, equipItem, discardItem } = useGame();
  const { character } = state;
  const [filter, setFilter] = useState<Rarity | 'all'>('all');

  // Ordenar inventário: raridade desc → power desc
  const sortedInventory = useMemo(() => {
    return [...character.inventory]
      .filter(item => filter === 'all' || item.rarity === filter)
      .sort((a, b) => {
        const rarityDiff = RARITY_ORDER[b.rarity] - RARITY_ORDER[a.rarity];
        if (rarityDiff !== 0) return rarityDiff;
        return calculateItemPower(b) - calculateItemPower(a);
      });
  }, [character.inventory, filter]);

  const rarities: Array<Rarity | 'all'> = ['all', 'legendary', 'epic', 'rare', 'uncommon', 'common'];

  return (
    <div
      className="w-full flex flex-col"
      style={{
        background: '#050505',
        border: '1px solid #111827',
        maxHeight: '400px',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ borderBottom: '1px solid #111827' }}
      >
        <span
          className="text-xs font-mono uppercase tracking-widest"
          style={{ color: '#4B5563', fontFamily: "'Space Mono', monospace" }}
        >
          🎒 INVENTÁRIO ({character.inventory.length})
        </span>
        <span className="text-xs font-mono" style={{ color: '#FBBF24' }}>
          💰 {character.gold.toLocaleString()}
        </span>
      </div>

      {/* Filtros de raridade */}
      <div className="flex gap-1 px-2 py-1.5 overflow-x-auto" style={{ borderBottom: '1px solid #0D1117' }}>
        {rarities.map(r => (
          <button
            key={r}
            className="text-xs font-mono px-2 py-0.5 whitespace-nowrap"
            style={{
              border: `1px solid ${r === 'all' ? '#374151' : RARITY_COLORS[r as Rarity]}40`,
              color: filter === r
                ? (r === 'all' ? '#F9FAFB' : RARITY_COLORS[r as Rarity])
                : '#4B5563',
              background: filter === r ? '#111827' : 'transparent',
              cursor: 'pointer',
              fontSize: '9px',
            }}
            onClick={() => setFilter(r)}
          >
            {r === 'all' ? 'TODOS' : r.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Lista de itens */}
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
        <AnimatePresence>
          {sortedInventory.length === 0 ? (
            <div
              className="flex items-center justify-center py-8 text-xs font-mono"
              style={{ color: '#1F2937' }}
            >
              INVENTÁRIO VAZIO
            </div>
          ) : (
            sortedInventory.map(item => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
              >
                <ItemCard
                  item={item}
                  onEquip={() => equipItem(item.id)}
                  onDiscard={() => discardItem(item.id)}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
