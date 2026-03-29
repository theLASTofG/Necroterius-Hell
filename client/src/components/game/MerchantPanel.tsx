/**
 * ============================================================
 * AFK BATTLE ARENA — PAINEL DO MERCANTE
 * ============================================================
 * Design: Void Signal — Brutal Minimalism Dark
 * Aparece a cada 5 waves com itens aleatórios à venda.
 * Itens têm preços variáveis e possíveis descontos.
 * Jogador pode comprar ou pular para a próxima wave.
 * ============================================================
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../contexts/GameContext';
import {
  Item,
  MerchantItem,
  RARITY_COLORS,
  RARITY_LABELS,
} from '../../game/types';
import { getModifierLabel, calculateItemPower } from '../../game/stats';

// ─── CARD DE ITEM DO MERCANTE ─────────────────────────────────

interface MerchantItemCardProps {
  merchantItem: MerchantItem;
  canAfford: boolean;
  onBuy: () => void;
}

function MerchantItemCard({ merchantItem, canAfford, onBuy }: MerchantItemCardProps) {
  const { item, originalPrice, discountPct, finalPrice } = merchantItem;
  const [showTooltip, setShowTooltip] = useState(false);
  const rarityColor = RARITY_COLORS[item.rarity];
  const power = calculateItemPower(item);
  const hasDiscount = discountPct > 0;

  return (
    <div className="relative">
      <motion.div
        className="p-3 cursor-pointer"
        style={{
          border: `1px solid ${rarityColor}40`,
          background: '#080808',
          opacity: canAfford ? 1 : 0.6,
        }}
        whileHover={{
          borderColor: rarityColor,
          background: `${rarityColor}10`,
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Linha de raridade */}
        <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: rarityColor }} />

        {/* Badge de desconto */}
        {hasDiscount && (
          <div
            className="absolute top-1 right-1 text-xs font-mono px-1"
            style={{ background: '#22C55E', color: '#000', fontSize: '9px', fontWeight: 'bold' }}
          >
            -{discountPct}%
          </div>
        )}

        <div className="flex items-start gap-3">
          {/* Ícone grande */}
          <span style={{ fontSize: '32px', lineHeight: 1 }}>{item.icon}</span>

          {/* Info */}
          <div className="flex-1">
            <div className="font-bold text-sm font-mono" style={{ color: rarityColor }}>
              {item.name}
            </div>
            <div className="text-xs font-mono mt-0.5" style={{ color: '#4B5563' }}>
              {RARITY_LABELS[item.rarity]} · POW {power}
            </div>

            {/* Stats principais (primeiros 2) */}
            <div className="mt-1.5 flex flex-col gap-0.5">
              {[...item.baseStats, ...item.bonusStats].slice(0, 3).map((mod, i) => (
                <div
                  key={i}
                  className="text-xs font-mono"
                  style={{ color: i < item.baseStats.length ? '#9CA3AF' : rarityColor, fontSize: '10px' }}
                >
                  {getModifierLabel(mod)}
                </div>
              ))}
              {item.baseStats.length + item.bonusStats.length > 3 && (
                <div className="text-xs font-mono" style={{ color: '#374151', fontSize: '10px' }}>
                  +{item.baseStats.length + item.bonusStats.length - 3} mais...
                </div>
              )}
              {item.uniqueEffect && (
                <div className="text-xs font-mono font-bold" style={{ color: item.uniqueEffect.color, fontSize: '10px' }}>
                  ★ {item.uniqueEffect.name}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preço e botão de compra */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            {hasDiscount && (
              <span className="text-xs font-mono line-through" style={{ color: '#374151' }}>
                {originalPrice.toLocaleString()}
              </span>
            )}
            <span
              className="font-bold font-mono"
              style={{ color: canAfford ? '#FBBF24' : '#EF4444', fontSize: '14px' }}
            >
              💰 {finalPrice.toLocaleString()}
            </span>
          </div>

          <motion.button
            className="text-xs font-mono px-3 py-1"
            style={{
              border: `1px solid ${canAfford ? rarityColor : '#374151'}`,
              color: canAfford ? rarityColor : '#374151',
              background: 'transparent',
              cursor: canAfford ? 'pointer' : 'not-allowed',
              fontFamily: "'Space Mono', monospace",
            }}
            whileHover={canAfford ? { background: `${rarityColor}20` } : {}}
            whileTap={canAfford ? { scale: 0.95 } : {}}
            onClick={canAfford ? onBuy : undefined}
          >
            {canAfford ? 'COMPRAR' : 'SEM OURO'}
          </motion.button>
        </div>
      </motion.div>

      {/* Tooltip completo */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            className="absolute z-50 w-64 p-3 text-xs font-mono pointer-events-none"
            style={{
              background: '#0A0A0A',
              border: `1px solid ${rarityColor}`,
              boxShadow: `0 0 20px ${rarityColor}30`,
              left: '105%',
              top: '0',
            }}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            <div className="font-bold text-sm mb-1" style={{ color: rarityColor }}>
              {item.icon} {item.name}
            </div>
            <div className="text-gray-500 mb-2">
              {RARITY_LABELS[item.rarity]} · Nível {item.level}
            </div>
            <div className="w-full h-px mb-2" style={{ background: `${rarityColor}40` }} />
            {item.baseStats.map((mod, i) => (
              <div key={i} style={{ color: '#D1D5DB' }}>{getModifierLabel(mod)}</div>
            ))}
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────

export default function MerchantPanel() {
  const { state, buyItem, closeMerchant } = useGame();
  const { merchant, character } = state;

  if (!merchant) return null;

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-2xl max-h-screen overflow-y-auto p-4"
        style={{
          background: '#050505',
          border: '1px solid #1F2937',
          boxShadow: '0 0 40px rgba(251,191,36,0.1)',
        }}
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ duration: 0.2 }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between mb-4 pb-3"
          style={{ borderBottom: '1px solid #1F2937' }}
        >
          <div>
            <div
              className="font-bold"
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '28px',
                color: '#FBBF24',
                letterSpacing: '0.05em',
              }}
            >
              🏪 MERCANTE
            </div>
            <div className="text-xs font-mono" style={{ color: '#6B7280' }}>
              {merchant.name} · Wave {merchant.wave}
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold font-mono" style={{ color: '#FBBF24', fontSize: '18px' }}>
              💰 {character.gold.toLocaleString()}
            </div>
            <div className="text-xs font-mono" style={{ color: '#374151' }}>seu ouro</div>
          </div>
        </div>

        {/* Grid de itens */}
        <div className="grid grid-cols-1 gap-2 mb-4">
          {merchant.items.length === 0 ? (
            <div
              className="text-center py-8 font-mono text-sm"
              style={{ color: '#374151' }}
            >
              Estoque esgotado!
            </div>
          ) : (
            merchant.items.map(mi => (
              <MerchantItemCard
                key={mi.item.id}
                merchantItem={mi}
                canAfford={character.gold >= mi.finalPrice}
                onBuy={() => buyItem(mi.item.id)}
              />
            ))
          )}
        </div>

        {/* Botão de continuar */}
        <motion.button
          className="w-full py-3 font-bold font-mono uppercase tracking-widest"
          style={{
            border: '1px solid #374151',
            color: '#9CA3AF',
            background: 'transparent',
            cursor: 'pointer',
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '16px',
            letterSpacing: '0.1em',
          }}
          whileHover={{
            borderColor: '#FBBF24',
            color: '#FBBF24',
            background: '#FBBF2410',
          }}
          whileTap={{ scale: 0.98 }}
          onClick={closeMerchant}
        >
          ▶ CONTINUAR PARA WAVE {merchant.wave + 1}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
