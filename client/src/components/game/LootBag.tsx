/**
 * ============================================================
 * AFK BATTLE ARENA — SACOLA DE LOOT (LUCKY BLOCK)
 * ============================================================
 * Animação de sacola de loot que cai quando mob morre.
 * Clique para abrir e ver os itens dropados.
 * ============================================================
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Item, RARITY_COLORS, AFFIX_COLORS } from '../../game/types';

interface LootBagProps {
  items: Item[];
  gold: number;
  xp: number;
  onCollect: () => void;
}

export default function LootBag({ items, gold, xp, onCollect }: LootBagProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Sacola animada */}
      <motion.div
        className="fixed bottom-20 right-8 z-40 cursor-pointer"
        initial={{ y: -400, opacity: 0, scale: 0.5 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 400, opacity: 0, scale: 0.5 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* Pulsação */}
        <motion.div
          className="text-6xl"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          🎁
        </motion.div>

        {/* Número de itens */}
        {items.length > 0 && (
          <div
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
            style={{
              background: '#FBBF24',
              color: '#000',
              fontSize: '10px',
            }}
          >
            {items.length}
          </div>
        )}
      </motion.div>

      {/* Modal de loot */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.85)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="w-full max-w-md p-4"
              style={{
                background: '#050505',
                border: '2px solid #FBBF24',
                boxShadow: '0 0 40px #FBBF2440',
              }}
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div
                className="text-center mb-4 pb-3"
                style={{ borderBottom: '1px solid #111827' }}
              >
                <div
                  className="font-bold"
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: '28px',
                    color: '#FBBF24',
                    letterSpacing: '0.05em',
                  }}
                >
                  🎁 LOOT COLETADO
                </div>
              </div>

              {/* Rewards */}
              <div className="mb-4 flex gap-4 justify-center">
                {gold > 0 && (
                  <div className="text-center">
                    <div style={{ fontSize: '24px' }}>💰</div>
                    <div
                      className="text-xs font-mono"
                      style={{ color: '#FBBF24', marginTop: '4px' }}
                    >
                      +{gold}
                    </div>
                  </div>
                )}
                {xp > 0 && (
                  <div className="text-center">
                    <div style={{ fontSize: '24px' }}>⭐</div>
                    <div
                      className="text-xs font-mono"
                      style={{ color: '#22C55E', marginTop: '4px' }}
                    >
                      +{xp}
                    </div>
                  </div>
                )}
              </div>

              {/* Itens */}
              <div
                className="mb-4 max-h-64 overflow-y-auto"
                style={{ borderTop: '1px solid #111827', borderBottom: '1px solid #111827', paddingTop: '8px', paddingBottom: '8px' }}
              >
                {items.length === 0 ? (
                  <div
                    className="text-center text-xs font-mono"
                    style={{ color: '#374151' }}
                  >
                    Nenhum item
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    {items.map(item => {
                      const rarityColor = RARITY_COLORS[item.rarity];
                      const affixColor = AFFIX_COLORS[item.affix];

                      return (
                        <div
                          key={item.id}
                          className="p-1.5 text-xs font-mono"
                          style={{
                            border: `1px solid ${rarityColor}40`,
                            background: `${rarityColor}05`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                        >
                          <span style={{ fontSize: '16px' }}>{item.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div style={{ color: rarityColor, fontWeight: 'bold', fontSize: '9px' }}>
                              {item.name}
                            </div>
                            <div style={{ color: affixColor, fontSize: '8px' }}>
                              {item.affix === 'normal' ? '' : item.affix.toUpperCase()}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Botão de coletar */}
              <motion.button
                className="w-full py-2 font-mono uppercase tracking-widest"
                style={{
                  border: '1px solid #FBBF24',
                  color: '#FBBF24',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: '14px',
                  letterSpacing: '0.1em',
                }}
                whileHover={{ background: '#FBBF2420' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  onCollect();
                  setIsOpen(false);
                }}
              >
                ✓ COLETAR
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
