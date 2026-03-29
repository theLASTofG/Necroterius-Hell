/**
 * ============================================================
 * AFK BATTLE ARENA — CONTEXTO GLOBAL DO JOGO
 * ============================================================
 * Gerencia todo o estado do jogo usando React Context + useReducer.
 * O loop de combate roda via setInterval no useEffect.
 *
 * ARQUITETURA:
 * - GameState: estado imutável do jogo
 * - GameAction: ações que modificam o estado
 * - gameReducer: puro, sem side effects
 * - GameProvider: gerencia o loop e despacha ações
 *
 * O loop de combate:
 * 1. setInterval chama processCombatTick a cada BASE_TICK_MS
 * 2. O resultado é despachado como ação UPDATE_STATE
 * 3. O reducer aplica o novo estado
 * 4. Números flutuantes são gerenciados separadamente (não no reducer)
 * ============================================================
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import { nanoid } from 'nanoid';
import {
  GameState,
  Character,
  CharacterStats,
  FloatingNumber,
  Item,
  EquipSlot,
  GameNotification,
} from '../game/types';
import { BASE_CHARACTER_STATS, RARITY_COLORS } from '../game/types';
import { computeCharacterStats, xpToNextLevel } from '../game/stats';
import {
  processCombatTick,
  createInitialCombatState,
  equipItem,
  unequipItem,
  buyMerchantItem,
  discardItem,
  startNextWave,
  restartGame,
  BASE_TICK_MS,
} from '../game/combatEngine';
import { generateWaveMobs } from '../game/mobGenerator';

// ─── ESTADO INICIAL ───────────────────────────────────────────

function createInitialCharacter(): Character {
  const baseStats: CharacterStats = { ...BASE_CHARACTER_STATS };
  const character: Character = {
    id: nanoid(),
    name: 'Herói',
    level: 1,
    xp: 0,
    xpToNextLevel: xpToNextLevel(1),
    gold: 100,
    baseStats,
    equipment: {},
    inventory: [],
    computedStats: baseStats,
  };
  character.computedStats = computeCharacterStats(character);
  return character;
}

function createInitialGameState(): GameState {
  const character = createInitialCharacter();
  const waveMobs = generateWaveMobs(1);
  const combatState = createInitialCombatState(1);

  return {
    character,
    combat: {
      ...combatState,
      currentMob: waveMobs[0] ?? null,
      mobsInWave: waveMobs.length,
      isRunning: false, // Começa pausado até o jogador iniciar
    },
    merchant: null,
    showMerchant: false,
    showInventory: false,
    showEquipment: true,
    gamePhase: 'idle',
    notifications: [],
    settings: {
      combatSpeed: 1,
      autoEquipBetter: false,
      showDamageNumbers: true,
      showCombatLog: true,
      cleanMode: false,
    },
  };
}

// ─── AÇÕES DO REDUCER ─────────────────────────────────────────

type GameAction =
  | { type: 'START_COMBAT' }
  | { type: 'PAUSE_COMBAT' }
  | { type: 'RESUME_COMBAT' }
  | { type: 'UPDATE_STATE'; payload: GameState }
  | { type: 'EQUIP_ITEM'; payload: string }
  | { type: 'UNEQUIP_ITEM'; payload: EquipSlot }
  | { type: 'BUY_ITEM'; payload: string }
  | { type: 'DISCARD_ITEM'; payload: string }
  | { type: 'START_NEXT_WAVE' }
  | { type: 'RESTART_GAME' }
  | { type: 'SET_SPEED'; payload: 1 | 2 | 4 }
  | { type: 'TOGGLE_INVENTORY' }
  | { type: 'TOGGLE_EQUIPMENT' }
  | { type: 'DISMISS_NOTIFICATION'; payload: string }
  | { type: 'ADD_NOTIFICATION'; payload: GameNotification }
  | { type: 'CLOSE_MERCHANT' }
  | { type: 'SET_FARM_MODE'; payload: boolean }
  | { type: 'GO_TO_WAVE'; payload: number }
  | { type: 'SET_AREA'; payload: string }
  | { type: 'TOGGLE_AUTO_EQUIP' }
  | { type: 'TOGGLE_CLEAN_MODE' }
  | { type: 'TOGGLE_COMBAT_LOG' }
  | { type: 'SELL_LOW_RARITY'; payload: Rarity };

// ─── REDUCER ──────────────────────────────────────────────────

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_COMBAT': {
      return {
        ...state,
        gamePhase: 'combat',
        combat: {
          ...state.combat,
          isRunning: true,
          isPaused: false,
          waveStartTime: Date.now(),
          lastTickTime: Date.now(),
        },
      };
    }

    case 'PAUSE_COMBAT': {
      return {
        ...state,
        combat: { ...state.combat, isPaused: true },
      };
    }

    case 'RESUME_COMBAT': {
      return {
        ...state,
        combat: { ...state.combat, isPaused: false, lastTickTime: Date.now() },
      };
    }

    case 'UPDATE_STATE': {
      return action.payload;
    }

    case 'EQUIP_ITEM': {
      return equipItem(state, action.payload);
    }

    case 'UNEQUIP_ITEM': {
      return unequipItem(state, action.payload);
    }

    case 'BUY_ITEM': {
      return buyMerchantItem(state, action.payload);
    }

    case 'DISCARD_ITEM': {
      return discardItem(state, action.payload);
    }

    case 'START_NEXT_WAVE': {
      return startNextWave(state);
    }

    case 'RESTART_GAME': {
      return restartGame(state);
    }

    case 'SET_SPEED': {
      return {
        ...state,
        settings: { ...state.settings, combatSpeed: action.payload },
      };
    }

    case 'TOGGLE_INVENTORY': {
      return { ...state, showInventory: !state.showInventory };
    }

    case 'TOGGLE_EQUIPMENT': {
      return { ...state, showEquipment: !state.showEquipment };
    }

    case 'DISMISS_NOTIFICATION': {
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      };
    }

    case 'ADD_NOTIFICATION': {
      const notifications = [action.payload, ...state.notifications].slice(0, 5);
      return { ...state, notifications };
    }

    case 'CLOSE_MERCHANT': {
      const nextWave = state.combat.isFarmMode ? state.combat.wave : state.combat.wave + 1;
      const waveMobs = generateWaveMobs(nextWave);
      const newMaxWave = Math.max(state.combat.maxWaveReached, nextWave);
      return {
        ...state,
        showMerchant: false,
        merchant: null,
        gamePhase: 'combat',
        combat: {
          ...createInitialCombatState(nextWave, newMaxWave),
          isFarmMode: state.combat.isFarmMode,
          currentAreaId: state.combat.currentAreaId,
          currentMob: waveMobs[0] ?? null,
          mobsInWave: waveMobs.length,
          isRunning: true,
          waveStartTime: Date.now(),
          lastTickTime: Date.now(),
        },
      };
    }

    case 'SET_FARM_MODE': {
      return {
        ...state,
        combat: { ...state.combat, isFarmMode: action.payload },
      };
    }

    case 'GO_TO_WAVE': {
      const wave = action.payload;
      const waveMobs = generateWaveMobs(wave);
      return {
        ...state,
        gamePhase: 'combat',
        combat: {
          ...createInitialCombatState(wave, state.combat.maxWaveReached),
          currentMob: waveMobs[0],
          mobsInWave: waveMobs.length,
          isRunning: true,
        },
      };
    }

    case 'SET_AREA': {
      return {
        ...state,
        combat: { ...state.combat, currentAreaId: action.payload },
      };
    }

    case 'TOGGLE_AUTO_EQUIP': {
      return {
        ...state,
        settings: { ...state.settings, autoEquipBetter: !state.settings.autoEquipBetter },
      };
    }

    case 'TOGGLE_CLEAN_MODE': {
      return {
        ...state,
        settings: { ...state.settings, cleanMode: !state.settings.cleanMode },
      };
    }

    case 'TOGGLE_COMBAT_LOG': {
      return {
        ...state,
        settings: { ...state.settings, showCombatLog: !state.settings.showCombatLog },
      };
    }

    case 'SELL_LOW_RARITY': {
      const newState = deepCloneGameState(state);
      const threshold = RARITY_ORDER[action.payload];
      
      const toKeep: Item[] = [];
      let goldGained = 0;
      
      for (const item of newState.character.inventory) {
        if (RARITY_ORDER[item.rarity] <= threshold) {
          goldGained += Math.floor(item.price * 0.2);
        } else {
          toKeep.push(item);
        }
      }
      
      newState.character.inventory = toKeep;
      newState.character.gold += goldGained;
      
      return newState;
    }

    default:
      return state;
  }
}

// ─── CONTEXTO ─────────────────────────────────────────────────

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  floatingNumbers: FloatingNumber[];
  // Ações convenientes
  startCombat: () => void;
  pauseCombat: () => void;
  resumeCombat: () => void;
  equipItem: (itemId: string) => void;
  unequipItem: (slot: EquipSlot) => void;
  buyItem: (itemId: string) => void;
  discardItem: (itemId: string) => void;
  startNextWave: () => void;
  restartGame: () => void;
  setSpeed: (speed: 1 | 2 | 4) => void;
  closeMerchant: () => void;
}

const RARITY_ORDER: Record<string, number> = {
  common: 1,
  uncommon: 2,
  rare: 3,
  epic: 4,
  legendary: 5,
  mythic: 6,
  celestial: 7,
};

const GameContext = createContext<GameContextValue | null>(null);

// ─── PROVIDER ─────────────────────────────────────────────────

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialGameState);
  const [floatingNumbers, setFloatingNumbers] = useState<FloatingNumber[]>([]);

  // Ref para o estado atual (evita closure stale no setInterval)
  const stateRef = useRef(state);
  stateRef.current = state;

  // Loop de combate
  useEffect(() => {
    const intervalId = setInterval(() => {
      const currentState = stateRef.current;

      // Não processar se não está em combate ativo
      if (!currentState.combat.isRunning || currentState.combat.isPaused) return;
      if (!currentState.combat.currentMob) return;

      const speedMult = currentState.settings.combatSpeed;
      const deltaTime = BASE_TICK_MS * speedMult;

      const result = processCombatTick(currentState, deltaTime);

      // Atualizar estado
      dispatch({ type: 'UPDATE_STATE', payload: result.newGameState });

      // Adicionar números flutuantes
      if (result.floatingNumbers.length > 0 && currentState.settings.showDamageNumbers) {
        setFloatingNumbers(prev => {
          const combined = [...prev, ...result.floatingNumbers];
          return combined.slice(-20); // Máximo 20 simultâneos
        });
      }

      // Notificações de drops
      for (const item of result.droppedItems) {
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: nanoid(),
            type: 'item_drop',
            message: `${item.icon} ${item.name} dropou!`,
            item,
            timestamp: Date.now(),
            duration: 3000,
          },
        });
      }

      // Notificação de ouro
      // (silenciosa, apenas atualiza o estado)

    }, BASE_TICK_MS);

    return () => clearInterval(intervalId);
  }, []); // Sem dependências — usa stateRef para evitar re-criação

  // Limpar números flutuantes expirados
  useEffect(() => {
    const cleanupId = setInterval(() => {
      const now = Date.now();
      setFloatingNumbers(prev =>
        prev.filter(fn => now - fn.createdAt < 1200) // Remove após 1.2s
      );
    }, 200);

    return () => clearInterval(cleanupId);
  }, []);

  // Auto-dismiss de notificações
  useEffect(() => {
    const now = Date.now();
    const expired = state.notifications.filter(n => now - n.timestamp > n.duration);
    for (const n of expired) {
      dispatch({ type: 'DISMISS_NOTIFICATION', payload: n.id });
    }
  }, [state.notifications]);

  // ── Ações convenientes ────────────────────────────────────
  const startCombat = useCallback(() => dispatch({ type: 'START_COMBAT' }), []);
  const pauseCombat = useCallback(() => dispatch({ type: 'PAUSE_COMBAT' }), []);
  const resumeCombat = useCallback(() => dispatch({ type: 'RESUME_COMBAT' }), []);
  const equipItemFn = useCallback((itemId: string) => dispatch({ type: 'EQUIP_ITEM', payload: itemId }), []);
  const unequipItemFn = useCallback((slot: EquipSlot) => dispatch({ type: 'UNEQUIP_ITEM', payload: slot }), []);
  const buyItemFn = useCallback((itemId: string) => dispatch({ type: 'BUY_ITEM', payload: itemId }), []);
  const discardItemFn = useCallback((itemId: string) => dispatch({ type: 'DISCARD_ITEM', payload: itemId }), []);
  const startNextWaveFn = useCallback(() => dispatch({ type: 'START_NEXT_WAVE' }), []);
  const restartGameFn = useCallback(() => dispatch({ type: 'RESTART_GAME' }), []);
  const setSpeedFn = useCallback((speed: 1 | 2 | 4) => dispatch({ type: 'SET_SPEED', payload: speed }), []);
  const closeMerchantFn = useCallback(() => dispatch({ type: 'CLOSE_MERCHANT' }), []);

  const value: GameContextValue = {
    state,
    dispatch,
    floatingNumbers,
    startCombat,
    pauseCombat,
    resumeCombat,
    equipItem: equipItemFn,
    unequipItem: unequipItemFn,
    buyItem: buyItemFn,
    discardItem: discardItemFn,
    startNextWave: startNextWaveFn,
    restartGame: restartGameFn,
    setSpeed: setSpeedFn,
    closeMerchant: closeMerchantFn,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

// ─── HOOK ─────────────────────────────────────────────────────

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame deve ser usado dentro de GameProvider');
  return ctx;
}
