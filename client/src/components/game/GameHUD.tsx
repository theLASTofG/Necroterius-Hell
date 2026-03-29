/**
 * ============================================================
 * AFK BATTLE ARENA — HUD PRINCIPAL DO JOGO
 * ============================================================
 * Design: Void Signal — Brutal Minimalism Dark
 * Barra superior com: wave, controles de velocidade, pause/play
 * Notificações de drops e level up
 * Tela idle
 * ============================================================
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../contexts/GameContext';
import { RARITY_COLORS } from '../../game/types';

// ─── NOTIFICAÇÃO DE DROP ──────────────────────────────────────

function DropNotification() {
  const { state, dispatch } = useGame();
  const { notifications } = state;

  return (
    <div className="fixed top-4 right-4 z-30 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {notifications.slice(0, 4).map(notif => {
          const rarityColor = notif.item ? RARITY_COLORS[notif.item.rarity] : '#FBBF24';
          return (
            <motion.div
              key={notif.id}
              className="px-3 py-2 text-xs font-mono"
              style={{
                background: '#050505',
                border: `1px solid ${rarityColor}60`,
                color: rarityColor,
                boxShadow: `0 0 12px ${rarityColor}20`,
                maxWidth: '240px',
                fontFamily: "'Space Mono', monospace",
              }}
              initial={{ opacity: 0, x: 40, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              {notif.message}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// ─── TELA DE GAME OVER ────────────────────────────────────────

function GameOverScreen() {
  const { state, restartGame } = useGame();
  const { combat, character } = state;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.95)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="text-center">
        <motion.div
          className="font-bold mb-2"
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '72px',
            color: '#EF4444',
            letterSpacing: '0.1em',
            textShadow: '0 0 40px #EF444460',
          }}
          animate={{ opacity: [1, 0.7, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          GAME OVER
        </motion.div>

        <div className="font-mono mb-6" style={{ color: '#6B7280' }}>
          <div>Wave {combat.wave} · Nível {character.level}</div>
          <div>Dano total causado: {combat.totalDamageDealt.toLocaleString()}</div>
        </div>

        <motion.button
          className="px-8 py-3 font-bold font-mono uppercase tracking-widest"
          style={{
            border: '1px solid #EF4444',
            color: '#EF4444',
            background: 'transparent',
            cursor: 'pointer',
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '18px',
            letterSpacing: '0.1em',
          }}
          whileHover={{ background: '#EF444420', boxShadow: '0 0 20px #EF444440' }}
          whileTap={{ scale: 0.95 }}
          onClick={restartGame}
        >
          ↺ REINICIAR
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── TELA IDLE (INÍCIO) ───────────────────────────────────────

function IdleScreen() {
  const { startCombat } = useGame();

  return (
    <motion.div
      className="absolute inset-0 z-20 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="text-center">
        <motion.div
          className="font-bold mb-4"
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '48px',
            color: '#FBBF24',
            letterSpacing: '0.1em',
            textShadow: '0 0 30px #FBBF2450',
          }}
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          AFK BATTLE ARENA
        </motion.div>

        <div className="font-mono mb-6 text-sm" style={{ color: '#4B5563' }}>
          Progressão infinita · Itens aleatórios · Batalha automática
        </div>

        <motion.button
          className="px-10 py-4 font-bold font-mono uppercase tracking-widest"
          style={{
            border: '2px solid #FBBF24',
            color: '#FBBF24',
            background: 'transparent',
            cursor: 'pointer',
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '22px',
            letterSpacing: '0.15em',
          }}
          whileHover={{
            background: '#FBBF2420',
            boxShadow: '0 0 30px #FBBF2440',
          }}
          whileTap={{ scale: 0.95 }}
          onClick={startCombat}
        >
          ▶ INICIAR BATALHA
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── BARRA DE CONTROLES ───────────────────────────────────────

function ControlBar() {
  const { state, pauseCombat, resumeCombat, setSpeed } = useGame();
  const { combat, settings, gamePhase } = state;
  const isActive = gamePhase === 'combat';

  return (
    <div
      className="flex items-center justify-between px-4 py-2"
      style={{
        background: '#050505',
        borderBottom: '1px solid #111827',
      }}
    >
      {/* Info de wave */}
      <div className="flex items-center gap-4">
        <div
          className="font-bold"
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '24px',
            color: '#FBBF24',
            letterSpacing: '0.05em',
          }}
        >
          WAVE {combat.wave}
        </div>
        <div className="text-xs font-mono" style={{ color: '#374151' }}>
          {combat.mobsKilled}/{combat.mobsInWave} MOBS
        </div>
        {combat.isPaused && (
          <div className="text-xs font-mono" style={{ color: '#EF4444' }}>
            ⏸ PAUSADO
          </div>
        )}
      </div>

      {/* Controles */}
      <div className="flex items-center gap-2">
        {/* Velocidade */}
        {([1, 2, 4] as const).map(speed => (
          <motion.button
            key={speed}
            className="text-xs font-mono px-2 py-1"
            style={{
              border: `1px solid ${settings.combatSpeed === speed ? '#FBBF24' : '#1F2937'}`,
              color: settings.combatSpeed === speed ? '#FBBF24' : '#374151',
              background: settings.combatSpeed === speed ? '#FBBF2410' : 'transparent',
              cursor: 'pointer',
              fontFamily: "'Space Mono', monospace",
            }}
            whileHover={{ borderColor: '#FBBF24', color: '#FBBF24' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSpeed(speed)}
          >
            {speed}x
          </motion.button>
        ))}

        {/* Pause/Resume */}
        {isActive && (
          <motion.button
            className="text-xs font-mono px-3 py-1"
            style={{
              border: `1px solid ${combat.isPaused ? '#22C55E' : '#EF4444'}`,
              color: combat.isPaused ? '#22C55E' : '#EF4444',
              background: 'transparent',
              cursor: 'pointer',
              fontFamily: "'Space Mono', monospace",
            }}
            whileHover={{
              background: combat.isPaused ? '#22C55E20' : '#EF444420',
            }}
            whileTap={{ scale: 0.95 }}
            onClick={combat.isPaused ? resumeCombat : pauseCombat}
          >
            {combat.isPaused ? '▶ CONTINUAR' : '⏸ PAUSAR'}
          </motion.button>
        )}
      </div>
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────

export default function GameHUD() {
  const { state } = useGame();
  const { gamePhase } = state;

  return (
    <>
      <ControlBar />
      <DropNotification />
      <AnimatePresence>
        {gamePhase === 'idle' && <IdleScreen key="idle" />}
      </AnimatePresence>
    </>
  );
}
