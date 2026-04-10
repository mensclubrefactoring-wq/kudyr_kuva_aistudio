import React, { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { MainMenu, LevelSelect, Tutorial, SettingsMenu, GameOver, Victory } from './components/Menu';
import GameCanvas from './components/GameCanvas';
import { GameState, LevelConfig } from './types';
import { Language, translations } from './i18n';
import { LEVELS } from './constants';
import { Package, Home, Trophy, TriangleAlert } from 'lucide-react';

type View = 'main' | 'level-select' | 'settings' | 'tutorial' | 'playing' | 'game-over' | 'victory';

const HUDCard: React.FC<{ icon: React.ReactNode, label: string, value: string, alert?: boolean }> = ({ icon, label, value, alert }) => (
  <div className={`flex items-center gap-4 p-4 rounded-2xl border backdrop-blur-md transition-all ${
    alert ? 'bg-red-500/20 border-red-500/50 shadow-lg shadow-red-900/20' : 'bg-black/60 border-white/10'
  }`}>
    <div className="p-2 bg-white/5 rounded-lg">{alert ? <TriangleAlert className="text-red-500 animate-pulse" /> : icon}</div>
    <div>
      <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{label}</div>
      <div className={`text-xl font-bold ${alert ? 'text-red-500' : 'text-white'}`}>{value}</div>
    </div>
  </div>
);

export default function App() {
  const [view, setView] = useState<View>('main');
  const [language, setLanguage] = useState<Language>('ru');
  const [currentLevel, setCurrentLevel] = useState<LevelConfig | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    level: 1,
    score: 0,
    totalItems: 45,
    itemsDelivered: 0,
    isGameOver: false,
    isVictory: false,
    isPaused: false,
    canExit: false
  });

  const startGame = (level: LevelConfig) => {
    setCurrentLevel(level);
    setGameState({
      level: level.id,
      score: 0,
      totalItems: 45,
      itemsDelivered: 0,
      isGameOver: false,
      isVictory: false,
      isPaused: false,
      canExit: false
    });
    setView('playing');
  };

  const handleGameOver = useCallback(() => {
    setView('game-over');
  }, []);

  const handleVictory = useCallback(() => {
    setView('victory');
  }, []);

  const updateGameState = useCallback((newState: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...newState }));
  }, []);

  const t = translations[language];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-purple-500/30 overflow-hidden">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[150px] rounded-full" />
      </div>

      <main className="relative z-10 w-full h-screen flex flex-col items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {view === 'main' && (
            <MainMenu 
              key="main" 
              view="main" 
              onNavigate={setView} 
              onStartGame={() => {}} 
              onBack={() => {}} 
              language={language}
            />
          )}
          
          {view === 'level-select' && (
            <LevelSelect 
              key="level-select" 
              view="level-select" 
              onStartGame={startGame} 
              onBack={() => setView('main')} 
              onNavigate={setView} 
              language={language}
            />
          )}

          {view === 'tutorial' && (
            <Tutorial 
              key="tutorial" 
              view="tutorial" 
              onBack={() => setView('main')} 
              onNavigate={setView} 
              onStartGame={() => {}} 
              language={language}
            />
          )}

          {view === 'settings' && (
            <SettingsMenu 
              key="settings" 
              onBack={() => setView('main')} 
              language={language}
              onLanguageChange={setLanguage}
            />
          )}

          {view === 'game-over' && (
            <GameOver 
              key="game-over" 
              view="game-over" 
              onBack={() => currentLevel && startGame(currentLevel)} 
              onNavigate={setView} 
              onStartGame={() => {}} 
              language={language}
            />
          )}

          {view === 'victory' && (
            <Victory 
              key="victory" 
              view="victory" 
              itemsDelivered={gameState.itemsDelivered} 
              onNavigate={setView} 
              onStartGame={() => {}} 
              onBack={() => {}}
              language={language}
              onNextLevel={
                currentLevel && currentLevel.id < 3 ? 
                () => {
                  const nextLevel = LEVELS.find(l => l.id === currentLevel.id + 1);
                  if (nextLevel) startGame(nextLevel);
                } : undefined
              }
            />
          )}

          {view === 'playing' && currentLevel && (
            <motion.div 
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex flex-col items-center justify-center"
            >
              {/* HUD */}
              <div className="absolute top-8 left-8 right-8 flex justify-between items-start pointer-events-none z-20">
                <div className="flex flex-col gap-2">
                  <HUDCard 
                    icon={<Package className="text-yellow-400" />} 
                    label={t.carrying} 
                    value={`${gameState.score} / 6`} 
                    alert={gameState.score >= 6}
                  />
                  <HUDCard 
                    icon={<Home className="text-purple-400" />} 
                    label={t.delivered} 
                    value={`${gameState.itemsDelivered} / 30`} 
                  />
                  {gameState.canExit && (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-green-500/20 border border-green-500/50 p-4 rounded-2xl flex items-center gap-3"
                    >
                      <Trophy className="text-green-400 animate-bounce" />
                      <div className="text-xs font-bold text-green-400 uppercase tracking-wider">
                        {t.nextLevel} Portal Open!
                      </div>
                    </motion.div>
                  )}
                </div>
                
                <div className="bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
                  <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">{t.currentLocation}</div>
                  <div className="text-lg font-bold">{t.levelNames[currentLevel.id]}</div>
                </div>
              </div>

              <GameCanvas 
                level={currentLevel} 
                onGameOver={handleGameOver} 
                onVictory={handleVictory}
                onUpdateState={updateGameState}
              />

              {/* Controls Hint */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-sm px-6 py-2 rounded-full border border-white/5 text-xs text-gray-400">
                {t.controlsHint}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}


