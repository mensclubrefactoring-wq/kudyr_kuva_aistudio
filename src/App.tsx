import React, { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { MainMenu, LevelSelect, Tutorial, SettingsMenu, GameOver, Victory } from './components/Menu';
import GameCanvas from './components/GameCanvas';
import { Joystick } from './components/Joystick';
import { GameState, LevelConfig } from './types';
import { Language, translations } from './i18n';
import { LEVELS } from './constants';
import { Package, Home, Trophy, TriangleAlert, Menu, X, Maximize, Minimize } from 'lucide-react';

type View = 'main' | 'level-select' | 'settings' | 'tutorial' | 'playing' | 'game-over' | 'victory';

const HUDCard: React.FC<{ icon: React.ReactNode, label: string, value: string, alert?: boolean }> = ({ icon, label, value, alert }) => (
  <div className={`flex items-center gap-1.5 md:gap-2.5 p-1.5 md:p-2.5 rounded-lg md:rounded-xl border backdrop-blur-md transition-all pointer-events-auto ${
    alert ? 'bg-red-500/20 border-red-500/50 shadow-lg shadow-red-900/20' : 'bg-black/60 border-white/10'
  }`}>
    <div className="p-1 md:p-1.5 bg-white/5 rounded-md md:rounded-lg">
      {alert ? (
        <TriangleAlert className="text-red-500 animate-pulse size-3 md:size-4" />
      ) : (
        React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { 
          className: `${(icon as React.ReactElement<any>).props.className || ''} size-3 md:size-4` 
        }) : icon
      )}
    </div>
    <div>
      <div className="text-[7px] md:text-[9px] text-gray-500 uppercase tracking-widest font-bold leading-none">{label}</div>
      <div className={`text-xs md:text-sm font-bold leading-none mt-0.5 ${alert ? 'text-red-500' : 'text-white'}`}>{value}</div>
    </div>
  </div>
);

export default function App() {
  const [view, setView] = useState<View>('main');
  const [language, setLanguage] = useState<Language>('ru');
  const [currentLevel, setCurrentLevel] = useState<LevelConfig | null>(null);
  const [joystickVector, setJoystickVector] = useState({ x: 0, y: 0 });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showControlsHint, setShowControlsHint] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
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
    setShowControlsHint(true);
    setTimeout(() => setShowControlsHint(false), 3000);
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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const t = translations[language];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-purple-500/30 overflow-hidden">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[150px] rounded-full" />
      </div>

      <main className="relative z-10 w-full h-screen flex flex-col items-center justify-center p-0 sm:p-4">
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
              <div className="absolute top-4 md:top-8 left-4 md:left-8 right-4 md:right-8 flex justify-end items-start pointer-events-none z-20 safe-top">
                <div className="flex flex-col items-end gap-2">
                  <div className="flex gap-2 pointer-events-auto">
                    {/* Fullscreen Toggle */}
                    <button 
                      onClick={toggleFullscreen}
                      className="p-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-white hover:bg-white/10 transition-colors"
                      title="Toggle Fullscreen"
                    >
                      {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                    </button>

                    {/* Toggle Button (Sandwich) - Always available */}
                    <button 
                      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                      className="p-2 bg-purple-600 backdrop-blur-md border border-purple-400/50 rounded-full text-white shadow-lg shadow-purple-900/40"
                    >
                      {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                  </div>

                  {/* HUD Panels Stack */}
                  <div className={`flex flex-col items-end gap-2 transition-all duration-500 ${isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
                    <div className="bg-black/60 backdrop-blur-md border border-white/10 p-2 md:p-3 rounded-xl md:rounded-2xl">
                      <div className="text-[8px] md:text-[9px] text-gray-500 uppercase tracking-widest font-bold mb-0.5 md:mb-1 leading-none">{t.currentLocation}</div>
                      <div className="text-xs md:text-sm font-bold leading-none">{t.levelNames[currentLevel.id]}</div>
                    </div>

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
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-green-500/20 border border-green-500/50 p-2 md:p-3 rounded-xl md:rounded-2xl flex items-center gap-2 md:gap-3 pointer-events-auto"
                      >
                        <Trophy className="text-green-400 animate-bounce size-4 md:size-5" />
                        <div className="text-[8px] md:text-[9px] font-bold text-green-400 uppercase tracking-wider">
                          {t.nextLevel} Portal Open!
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>

              <GameCanvas 
                level={currentLevel} 
                onGameOver={handleGameOver} 
                onVictory={handleVictory}
                onUpdateState={updateGameState}
                joystickVector={joystickVector}
              />

              <Joystick onMove={setJoystickVector} />

              {/* Controls Hint */}
              <AnimatePresence>
                {showControlsHint && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-sm px-4 sm:px-6 py-1 sm:py-2 rounded-full border border-white/5 text-[8px] sm:text-xs text-gray-400 whitespace-nowrap z-30 landscape:hidden"
                  >
                    {t.controlsHint}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}


