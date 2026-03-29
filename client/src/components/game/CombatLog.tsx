/**
 * ============================================================
 * AFK BATTLE ARENA — LOG DE COMBATE
 * ============================================================
 * Design: Void Signal — Brutal Minimalism Dark
 * Exibe os últimos eventos de combate em tempo real.
 * Auto-scroll para o evento mais recente.
 * Cores semânticas por tipo de evento.
 * ============================================================
 */

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../contexts/GameContext';
import { CombatEvent, CombatEventType } from '../../game/types';

// ─── COR E LABEL POR TIPO DE EVENTO ──────────────────────────

function getEventStyle(event: CombatEvent): { color: string; prefix: string } {
  switch (event.type) {
    case 'attack':
      return { color: '#D1D5DB', prefix: '▶' };
    case 'crit':
      return { color: '#FBBF24', prefix: '★' };
    case 'double_attack':
      return { color: '#FB923C', prefix: '▶▶' };
    case 'triple_attack':
      return { color: '#F97316', prefix: '▶▶▶' };
    case 'bleed_tick':
      return { color: '#DC2626', prefix: '⚡' };
    case 'dodge':
      return { color: '#3B82F6', prefix: '◌' };
    case 'block':
      return { color: '#6B7280', prefix: '■' };
    case 'heal':
    case 'lifesteal':
      return { color: '#22C55E', prefix: '♥' };
    case 'thorns':
      return { color: '#A855F7', prefix: '◆' };
    case 'mob_attack':
      return { color: '#EF4444', prefix: '◀' };
    case 'mob_crit':
      return { color: '#DC2626', prefix: '★' };
    case 'mob_bleed':
      return { color: '#B91C1C', prefix: '⚡' };
    default:
      return { color: '#6B7280', prefix: '·' };
  }
}

function getEventText(event: CombatEvent): string {
  if (event.label) return event.label;

  switch (event.type) {
    case 'attack':        return `Herói causou ${event.value} de dano`;
    case 'crit':          return `CRÍTICO! ${event.value} de dano`;
    case 'double_attack': return `Duplo ataque! ${event.value} de dano`;
    case 'triple_attack': return `Triplo ataque! ${event.value} de dano`;
    case 'bleed_tick':    return `Sangramento: ${event.value} de dano`;
    case 'dodge':         return `Mob esquivou!`;
    case 'block':         return `Herói bloqueou ${event.value} de dano`;
    case 'heal':          return `Herói curou ${event.value} HP`;
    case 'lifesteal':     return `Roubo de vida: +${event.value} HP`;
    case 'thorns':        return `Espinhos: ${event.value} de dano`;
    case 'mob_attack':    return `Mob causou ${event.value} de dano`;
    case 'mob_crit':      return `Mob CRÍTICO! ${event.value} de dano`;
    case 'mob_bleed':     return `Sangramento: ${event.value} de dano`;
    default:              return `Evento: ${event.value}`;
  }
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────

export default function CombatLog() {
  const { state } = useGame();
  const { combat } = state;
  const logRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para o final
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [combat.combatLog.length]);

  // Mostrar apenas os últimos 20 eventos
  const recentEvents = combat.combatLog.slice(-20);

  return (
    <div
      className="w-full flex flex-col"
      style={{
        background: '#050505',
        border: '1px solid #111827',
        height: '180px',
      }}
    >
      {/* Header */}
      <div
        className="px-3 py-1.5 flex items-center justify-between"
        style={{ borderBottom: '1px solid #0D1117' }}
      >
        <span
          className="text-xs font-mono uppercase tracking-widest"
          style={{ color: '#374151', fontFamily: "'Space Mono', monospace" }}
        >
          📋 LOG DE COMBATE
        </span>
        <span className="text-xs font-mono" style={{ color: '#1F2937' }}>
          W{combat.wave} · {combat.mobsKilled}/{combat.mobsInWave}
        </span>
      </div>

      {/* Log */}
      <div
        ref={logRef}
        className="flex-1 overflow-y-auto p-2 flex flex-col gap-0.5"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#1F2937 #050505' }}
      >
        {recentEvents.length === 0 ? (
          <div
            className="flex items-center justify-center h-full text-xs font-mono"
            style={{ color: '#1F2937' }}
          >
            AGUARDANDO COMBATE...
          </div>
        ) : (
          recentEvents.map((event, i) => {
            const { color, prefix } = getEventStyle(event);
            const text = getEventText(event);
            const isRecent = i >= recentEvents.length - 3;

            return (
              <motion.div
                key={event.id}
                className="flex items-center gap-1.5 text-xs font-mono"
                style={{
                  color: isRecent ? color : `${color}60`,
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '10px',
                }}
                initial={isRecent ? { opacity: 0, x: -5 } : {}}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.1 }}
              >
                <span style={{ color, minWidth: '12px', textAlign: 'center' }}>{prefix}</span>
                <span>{text}</span>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
