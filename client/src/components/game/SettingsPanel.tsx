import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  X, 
  Zap, 
  Trash2, 
  Eye, 
  EyeOff, 
  FastForward, 
  RefreshCcw,
  ShieldCheck,
  Layout
} from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';

interface SettingsPanelProps {
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
  const { state, dispatch, restartGame, setSpeed } = useGame();
  const { settings } = state;

  const toggleCleanMode = () => dispatch({ type: 'TOGGLE_CLEAN_MODE' });
  const toggleCombatLog = () => dispatch({ type: 'TOGGLE_COMBAT_LOG' });
  const toggleAutoEquip = () => dispatch({ type: 'TOGGLE_AUTO_EQUIP' });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="fixed right-4 top-20 w-80 z-50"
    >
      <Card className="bg-slate-900/95 border-slate-800 shadow-2xl backdrop-blur-md overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800/50 pb-3 bg-gradient-to-r from-slate-900 to-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-500/10 rounded-lg">
              <Settings className="w-5 h-5 text-amber-500" />
            </div>
            <CardTitle className="text-lg font-bold bg-gradient-to-r from-amber-400 to-purple-400 bg-clip-text text-transparent">
              Configurações
            </CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="p-4 space-y-6">
          {/* Seção de Progresso */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-3 h-3" /> Progresso Atual
            </h3>
            <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800/50 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Wave Atual / Máxima</p>
                <p className="text-xl font-bold text-white">
                  {state.combat.wave} <span className="text-slate-600 text-sm font-normal">/ {state.combat.maxWaveReached}</span>
                </p>
              </div>
              <Badge variant="outline" className="border-amber-500/30 text-amber-500 bg-amber-500/5">
                Nível {state.character.level}
              </Badge>
            </div>
          </div>

          {/* Seção de Velocidade */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <FastForward className="w-3 h-3" /> Velocidade de Combate
            </h3>
            <div className="flex p-1 bg-slate-950 rounded-lg border border-slate-800/50">
              {[1, 2, 4].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setSpeed(speed as 1 | 2 | 4)}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                    settings.combatSpeed === speed 
                      ? 'bg-amber-500 text-slate-950 shadow-lg' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${settings.cleanMode ? 'bg-purple-500/10' : 'bg-slate-800'}`}>
                  {settings.cleanMode ? <EyeOff className="w-4 h-4 text-purple-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">Modo Clean</p>
                  <p className="text-xs text-slate-500">Esconder danos flutuantes</p>
                </div>
              </div>
              <Switch checked={settings.cleanMode} onCheckedChange={toggleCleanMode} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${settings.showCombatLog ? 'bg-blue-500/10' : 'bg-slate-800'}`}>
                  <Layout className={`w-4 h-4 ${settings.showCombatLog ? 'text-blue-400' : 'text-slate-400'}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">Log de Combate</p>
                  <p className="text-xs text-slate-500">Mostrar histórico de ações</p>
                </div>
              </div>
              <Switch checked={settings.showCombatLog} onCheckedChange={toggleCombatLog} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${settings.autoEquipBetter ? 'bg-green-500/10' : 'bg-slate-800'}`}>
                  <ShieldCheck className={`w-4 h-4 ${settings.autoEquipBetter ? 'text-green-400' : 'text-slate-400'}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">Auto-Equipar</p>
                  <p className="text-xs text-slate-500">Equipar itens melhores</p>
                </div>
              </div>
              <Switch checked={settings.autoEquipBetter} onCheckedChange={toggleAutoEquip} />
            </div>
          </div>

          {/* Botão de Reiniciar */}
          <div className="pt-2">
            <Button 
              variant="destructive" 
              className="w-full gap-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/50"
              onClick={() => {
                if (confirm('Tem certeza que deseja reiniciar o jogo? Todo o progresso será perdido.')) {
                  restartGame();
                  onClose();
                }
              }}
            >
              <RefreshCcw className="w-4 h-4" /> Reiniciar Jogo
            </Button>
          </div>
        </CardContent>

        <div className="bg-slate-950/80 p-3 text-center border-t border-slate-800/50">
          <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em]">
            Necroterius Hell v1.2.0
          </p>
        </div>
      </Card>
    </motion.div>
  );
};
