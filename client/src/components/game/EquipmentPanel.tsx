/**
 * ============================================================
 * AFK BATTLE ARENA — PAINEL DE EQUIPAMENTOS
 * ============================================================
 * Design: Void Signal — Brutal Minimalism Dark
 * Exibe todos os slots de equipamento do personagem.
 * Clique em slot equipado: desequipa
 * Clique em item no inventário: equipa
 *
 * SLOTS:
 * - Arma Principal (mainhand)
 * - Arma Secundária (offhand)
 * - Capacete (helmet)
 * - Peitoral (chest)
 * - Calça (pants)
 * - Botas (boots)
 * - Amuleto I, II, III
 * ============================================================
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../contexts/GameContext';
import {
  EquipSlot,
  Item,
  EQUIP_SLOT_LABELS,
  RARITY_COLORS,
  RARITY_LABELS,
} from '../../game/types';
import { getModifierLabel, calculateItemPower } from '../../game/stats';

// ─── TOOLTIP DE ITEM ──────────────────────────────────────────

interface ItemTooltipProps {
  item: Item;
  equippedItem?: Item;
}

function ItemTooltip({ item, equippedItem }: ItemTooltipProps) {
  const rarityColor = RARITY_COLORS[item.rarity];
  const power = calculateItemPower(item);
  const equippedPower = equippedItem ? calculateItemPower(equippedItem) : 0;
  const powerDiff = power - equippedPower;

  return (
    <div
      className="absolute z-50 w-64 p-3 text-xs font-mono"
      style={{
        background: '#0A0A0A',
        border: `1px solid ${rarityColor}`,
        boxShadow: `0 0 20px ${rarityColor}30`,
        left: '110%',
        top: '0',
        minWidth: '240px',
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="font-bold text-sm" style={{ color: rarityColor }}>
            {item.icon} {item.name}
          </div>
          <div className="text-gray-500 mt-0.5">
            {RARITY_LABELS[item.rarity]} · Nível {item.level}
          </div>
        </div>
        <div className="text-right">
          <div style={{ color: powerDiff > 0 ? '#22C55E' : powerDiff < 0 ? '#EF4444' : '#6B7280' }}>
            {powerDiff > 0 ? '+' : ''}{powerDiff !== 0 ? powerDiff : power} POW
          </div>
        </div>
      </div>

      {/* Separador */}
      <div className="w-full h-px mb-2" style={{ background: `${rarityColor}40` }} />

      {/* Stats base */}
      {item.baseStats.length > 0 && (
        <div className="mb-2">
          <div className="text-gray-600 mb-1 uppercase tracking-wider text-xs">Stats Base</div>
          {item.baseStats.map((mod, i) => (
            <div key={i} style={{ color: '#D1D5DB' }}>
              {getModifierLabel(mod)}
            </div>
          ))}
        </div>
      )}

      {/* Stats bônus */}
      {item.bonusStats.length > 0 && (
        <div className="mb-2">
          <div className="text-gray-600 mb-1 uppercase tracking-wider text-xs">Modificadores</div>
          {item.bonusStats.map((mod, i) => (
            <div key={i} style={{ color: rarityColor }}>
              {getModifierLabel(mod)}
            </div>
          ))}
        </div>
      )}

      {/* Separador */}
      <div className="w-full h-px mb-2" style={{ background: '#1F2937' }} />

      {/* Flavor text */}
      <div className="text-gray-600 italic">{item.description}</div>

      {/* Preço */}
      <div className="mt-2 text-right" style={{ color: '#FBBF24' }}>
        💰 {item.price.toLocaleString()} ouro
      </div>
    </div>
  );
}

// ─── SLOT DE EQUIPAMENTO ──────────────────────────────────────

interface EquipSlotProps {
  slot: EquipSlot;
  item?: Item;
  onUnequip: () => void;
  equippedItems: Partial<Record<EquipSlot, Item>>;
}

function EquipSlotComponent({ slot, item, onUnequip, equippedItems }: EquipSlotProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const rarityColor = item ? RARITY_COLORS[item.rarity] : '#1F2937';

  return (
    <div className="relative">
      <motion.div
        className="relative cursor-pointer select-none"
        style={{
          width: '52px',
          height: '52px',
          border: `1px solid ${item ? rarityColor : '#1F2937'}`,
          background: item ? `${rarityColor}08` : '#050505',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2px',
        }}
        whileHover={{ borderColor: item ? rarityColor : '#374151', scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={item ? onUnequip : undefined}
        onMouseEnter={() => item && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {item ? (
          <>
            <span style={{ fontSize: '20px', lineHeight: 1 }}>{item.icon}</span>
            {/* Indicador de raridade */}
            <div
              className="absolute bottom-0 left-0 right-0 h-0.5"
              style={{ background: rarityColor }}
            />
          </>
        ) : (
          <span className="text-gray-700" style={{ fontSize: '18px' }}>
            {getSlotEmptyIcon(slot)}
          </span>
        )}

        {/* Label do slot */}
        <div
          className="absolute -bottom-4 left-0 right-0 text-center"
          style={{ fontSize: '8px', color: '#374151', fontFamily: 'monospace' }}
        >
          {getSlotShortLabel(slot)}
        </div>
      </motion.div>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && item && (
          <motion.div
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            <ItemTooltip item={item} equippedItem={equippedItems[slot]} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getSlotEmptyIcon(slot: EquipSlot): string {
  const icons: Record<EquipSlot, string> = {
    mainhand: '⚔', offhand: '🛡', helmet: '⛑', chest: '🦺',
    pants: '👖', boots: '👢', amulet1: '◎', amulet2: '◎', amulet3: '◎',
  };
  return icons[slot] ?? '○';
}

function getSlotShortLabel(slot: EquipSlot): string {
  const labels: Record<EquipSlot, string> = {
    mainhand: 'ARMA', offhand: 'OFF', helmet: 'CAP', chest: 'PEIT',
    pants: 'CALÇ', boots: 'BOT', amulet1: 'AMU1', amulet2: 'AMU2', amulet3: 'AMU3',
  };
  return labels[slot] ?? slot;
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────

export default function EquipmentPanel() {
  const { state, unequipItem } = useGame();
  const { character } = state;
  const { equipment } = character;

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
        className="text-xs font-mono uppercase tracking-widest mb-4 pb-2"
        style={{
          color: '#4B5563',
          borderBottom: '1px solid #111827',
          fontFamily: "'Space Mono', monospace",
        }}
      >
        ⚔ EQUIPAMENTOS
      </div>

      {/* Layout de slots — silhueta do personagem */}
      <div className="flex flex-col items-center gap-6">

        {/* Linha 1: Capacete */}
        <div className="flex justify-center">
          <EquipSlotComponent
            slot="helmet"
            item={equipment.helmet}
            onUnequip={() => unequipItem('helmet')}
            equippedItems={equipment}
          />
        </div>

        {/* Linha 2: Arma + Peitoral + Offhand */}
        <div className="flex items-center gap-2">
          <EquipSlotComponent
            slot="mainhand"
            item={equipment.mainhand}
            onUnequip={() => unequipItem('mainhand')}
            equippedItems={equipment}
          />
          <EquipSlotComponent
            slot="chest"
            item={equipment.chest}
            onUnequip={() => unequipItem('chest')}
            equippedItems={equipment}
          />
          <EquipSlotComponent
            slot="offhand"
            item={equipment.offhand}
            onUnequip={() => unequipItem('offhand')}
            equippedItems={equipment}
          />
        </div>

        {/* Linha 3: Calça */}
        <div className="flex justify-center">
          <EquipSlotComponent
            slot="pants"
            item={equipment.pants}
            onUnequip={() => unequipItem('pants')}
            equippedItems={equipment}
          />
        </div>

        {/* Linha 4: Botas */}
        <div className="flex justify-center">
          <EquipSlotComponent
            slot="boots"
            item={equipment.boots}
            onUnequip={() => unequipItem('boots')}
            equippedItems={equipment}
          />
        </div>

        {/* Linha 5: Amuletos */}
        <div className="flex gap-1 justify-center">
          <EquipSlotComponent
            slot="amulet1"
            item={equipment.amulet1}
            onUnequip={() => unequipItem('amulet1')}
            equippedItems={equipment}
          />
          <EquipSlotComponent
            slot="amulet2"
            item={equipment.amulet2}
            onUnequip={() => unequipItem('amulet2')}
            equippedItems={equipment}
          />
          <EquipSlotComponent
            slot="amulet3"
            item={equipment.amulet3}
            onUnequip={() => unequipItem('amulet3')}
            equippedItems={equipment}
          />
        </div>
      </div>

      {/* Dica */}
      <div className="mt-4 text-center" style={{ fontSize: '9px', color: '#1F2937', fontFamily: 'monospace' }}>
        CLIQUE PARA DESEQUIPAR
      </div>
    </div>
  );
}
