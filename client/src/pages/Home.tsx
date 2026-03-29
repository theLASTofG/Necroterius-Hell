/**
 * ============================================================
 * AFK BATTLE ARENA — PÁGINA PRINCIPAL
 * ============================================================
 * Design: Void Signal — Brutal Minimalism Dark
 *
 * Layout:
 * ┌─────────────────────────────────────────────────────────┐
 * │                    CONTROL BAR (HUD)                    │
 * ├──────────────┬──────────────────────────┬───────────────┤
 * │  EQUIPMENT   │      BATTLE ARENA        │    STATS      │
 * │  PANEL       │                          │    PANEL      │
 * │  (esquerda)  │   (centro - principal)   │  (direita)    │
 * ├──────────────┴──────────────────────────┴───────────────┤
 * │              INVENTORY + COMBAT LOG                     │
 * └─────────────────────────────────────────────────────────┘
 *
 * Responsivo: em mobile, painéis laterais ficam em tabs
 * ============================================================
 */

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { GameProvider } from '../contexts/GameContext';
import BattleArena from '../components/game/BattleArena';
import EquipmentPanel from '../components/game/EquipmentPanel';
import InventoryPanel from '../components/game/InventoryPanel';
import CombatLog from '../components/game/CombatLog';
import StatsPanel from '../components/game/StatsPanel';
import GameHUD from '../components/game/GameHUD';
import MerchantPanel from '../components/game/MerchantPanel';
import { useGame } from '../contexts/GameContext';

// ─── LAYOUT INTERNO (usa o contexto) ─────────────────────────

type MobileTab = 'arena' | 'equipment' | 'inventory' | 'stats';

function GameLayout() {
  const { state } = useGame();
  const [mobileTab, setMobileTab] = useState<MobileTab>('arena');

  const tabs: Array<{ id: MobileTab; label: string; icon: string }> = [
    { id: 'arena',     label: 'BATALHA',    icon: '⚔️' },
    { id: 'equipment', label: 'EQUIP',      icon: '🛡️' },
    { id: 'inventory', label: 'INVENTÁRIO', icon: '🎒' },
    { id: 'stats',     label: 'STATS',      icon: '📊' },
  ];

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{ background: '#000000', fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── HUD (barra de controles) ── */}
      <GameHUD />

      {/* ── Layout desktop ── */}
      <div className="hidden md:flex flex-1 overflow-hidden">

        {/* Coluna esquerda: Equipamentos */}
        <div
          className="flex-shrink-0 overflow-y-auto"
          style={{
            width: '200px',
            borderRight: '1px solid #111827',
            background: '#030303',
          }}
        >
          <EquipmentPanel />
        </div>

        {/* Centro: Arena de batalha */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Arena */}
          <div className="flex-1 relative" style={{ minHeight: '350px' }}>
            <BattleArena />
          </div>

          {/* Log de combate */}
          <div style={{ borderTop: '1px solid #111827' }}>
            <CombatLog />
          </div>
        </div>

        {/* Coluna direita: Stats + Inventário */}
        <div
          className="flex-shrink-0 flex flex-col overflow-hidden"
          style={{
            width: '280px',
            borderLeft: '1px solid #111827',
            background: '#030303',
          }}
        >
          {/* Stats */}
          <div className="flex-shrink-0">
            <StatsPanel />
          </div>

          {/* Inventário */}
          <div className="flex-1 overflow-hidden">
            <InventoryPanel />
          </div>
        </div>
      </div>

      {/* ── Layout mobile ── */}
      <div className="flex md:hidden flex-1 flex-col overflow-hidden">
        {/* Tabs de navegação mobile */}
        <div
          className="flex"
          style={{ borderBottom: '1px solid #111827', background: '#050505' }}
        >
          {tabs.map(tab => (
            <button
              key={tab.id}
              className="flex-1 py-2 text-xs font-mono uppercase"
              style={{
                color: mobileTab === tab.id ? '#FBBF24' : '#374151',
                background: mobileTab === tab.id ? '#111827' : 'transparent',
                border: 'none',
                borderBottom: mobileTab === tab.id ? '2px solid #FBBF24' : '2px solid transparent',
                cursor: 'pointer',
                fontFamily: "'Space Mono', monospace",
                fontSize: '9px',
              }}
              onClick={() => setMobileTab(tab.id)}
            >
              <span className="block text-base">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Conteúdo da tab ativa */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {mobileTab === 'arena' && (
              <motion.div
                key="arena"
                className="flex flex-col h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div style={{ minHeight: '300px' }}>
                  <BattleArena />
                </div>
                <CombatLog />
              </motion.div>
            )}
            {mobileTab === 'equipment' && (
              <motion.div
                key="equipment"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <EquipmentPanel />
              </motion.div>
            )}
            {mobileTab === 'inventory' && (
              <motion.div
                key="inventory"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <InventoryPanel />
              </motion.div>
            )}
            {mobileTab === 'stats' && (
              <motion.div
                key="stats"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <StatsPanel />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Mercante (overlay) ── */}
      <AnimatePresence>
        {state.showMerchant && state.merchant && (
          <MerchantPanel key="merchant" />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────

export default function Home() {
  return (
    <GameProvider>
      <GameLayout />
    </GameProvider>
  );
}
