import React from 'react';
import { useGame } from '../../contexts/GameContext';
import { Area } from '../../game/types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';
import { Lock, Map as MapIcon, Sword, Target } from 'lucide-react';

const AREAS: Area[] = [
  { id: 'area_1', name: 'Floresta Sombria', minWave: 1, maxWave: 10, unlocked: true, isBossArea: false, description: 'Um lugar úmido e escuro, cheio de esqueletos e slimes.' },
  { id: 'area_2', name: 'Cavernas de Cristal', minWave: 11, maxWave: 20, unlocked: false, isBossArea: false, description: 'Goblins e trolls habitam estas profundezas brilhantes.' },
  { id: 'area_3', name: 'Portões do Inferno', minWave: 21, maxWave: 30, unlocked: false, isBossArea: true, description: 'O calor é insuportável. Demônios vagam por toda parte.' },
  { id: 'area_4', name: 'Abismo Eterno', minWave: 31, maxWave: 50, unlocked: false, isBossArea: true, description: 'Onde as almas perdidas e os deuses caídos residem.' },
  { id: 'area_5', name: 'Reino Celestial', minWave: 51, maxWave: 100, unlocked: false, isBossArea: true, description: 'Apenas os heróis mais fortes podem desafiar os seres de luz.' },
];

export function AreaNavigationPanel() {
  const { state, dispatch } = useGame();
  const { combat } = state;

  const handleToggleFarmMode = (checked: boolean) => {
    dispatch({ type: 'SET_FARM_MODE', payload: checked });
  };

  const handleSelectArea = (area: Area) => {
    if (area.unlocked || combat.maxWaveReached >= area.minWave) {
      dispatch({ type: 'SET_AREA', payload: area.id });
      dispatch({ type: 'GO_TO_WAVE', payload: area.minWave });
    }
  };

  const handleGoToMaxWave = () => {
    dispatch({ type: 'GO_TO_WAVE', payload: combat.maxWaveReached });
  };

  return (
    <Card className="bg-slate-900/50 border-slate-800 text-slate-200">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <MapIcon className="w-5 h-5 text-blue-400" />
            Navegação de Áreas
          </CardTitle>
          <div className="flex items-center gap-2">
            <Label htmlFor="farm-mode" className="text-xs text-slate-400">MODO FARM</Label>
            <Switch 
              id="farm-mode" 
              checked={combat.isFarmMode} 
              onCheckedChange={handleToggleFarmMode}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center justify-between p-2 bg-slate-950/50 rounded-lg border border-slate-800">
          <div>
            <div className="text-xs text-slate-500 uppercase font-bold">Progresso Atual</div>
            <div className="text-sm font-mono text-amber-400">WAVE {combat.wave} / {combat.maxWaveReached} (MAX)</div>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8 text-xs border-slate-700 hover:bg-slate-800"
            onClick={handleGoToMaxWave}
            disabled={combat.wave === combat.maxWaveReached}
          >
            VOLTAR AO TOPO
          </Button>
        </div>

        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-3">
            {AREAS.map((area) => {
              const isUnlocked = combat.maxWaveReached >= area.minWave;
              const isCurrentArea = combat.wave >= area.minWave && combat.wave <= area.maxWave;

              return (
                <div 
                  key={area.id}
                  className={`p-3 rounded-lg border transition-all ${
                    isCurrentArea 
                      ? 'bg-blue-900/20 border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]' 
                      : isUnlocked 
                        ? 'bg-slate-800/40 border-slate-700 hover:border-slate-500 cursor-pointer' 
                        : 'bg-slate-950/50 border-slate-900 opacity-60 cursor-not-allowed'
                  }`}
                  onClick={() => isUnlocked && handleSelectArea(area)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-bold flex items-center gap-2">
                      {area.name}
                      {area.isBossArea && <Target className="w-3 h-3 text-red-500" />}
                    </div>
                    {isUnlocked ? (
                      <Badge variant="outline" className="text-[10px] border-green-500/50 text-green-400">
                        DESBLOQUEADA
                      </Badge>
                    ) : (
                      <Lock className="w-3 h-3 text-slate-600" />
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 mb-2 uppercase tracking-wider">
                    Waves {area.minWave} - {area.maxWave}
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {area.description}
                  </p>
                  {isUnlocked && !isCurrentArea && (
                    <div className="mt-2 flex justify-end">
                      <Button size="xs" variant="ghost" className="h-6 text-[10px] text-blue-400 hover:text-blue-300 hover:bg-blue-900/30">
                        VIAJAR
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
