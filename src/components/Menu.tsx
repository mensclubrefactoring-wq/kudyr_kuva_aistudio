import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Settings, Info, Trophy, RotateCcw, Home, Eye, EyeOff, Volume2, VolumeX, Globe } from 'lucide-react';
import { LevelConfig } from '../types';
import { LEVELS } from '../constants';
import { Language, translations } from '../i18n';

interface MenuProps {
  view: 'main' | 'level-select' | 'settings' | 'tutorial' | 'game-over' | 'victory';
  onStartGame: (level: LevelConfig) => void;
  onBack: () => void;
  onNavigate: (view: any) => void;
  score?: number;
  itemsDelivered?: number;
  language: Language;
  onLanguageChange?: (lang: Language) => void;
  onNextLevel?: () => void;
}

export const MainMenu: React.FC<MenuProps> = ({ onNavigate, language }) => {
  const t = translations[language];
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-6 p-12 bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl max-w-md w-full"
    >
      <h1 className="text-5xl font-bold text-white tracking-tighter mb-4 text-center">
        {t.title.split(' ')[0]} <span className="text-purple-500">{t.title.split(' ')[1]}</span>
      </h1>
      <p className="text-gray-400 text-center mb-8 italic">{t.subtitle}</p>
      
      <MenuButton icon={<Play />} label={t.startJourney} onClick={() => onNavigate('level-select')} primary />
      <MenuButton icon={<Info />} label={t.howToPlay} onClick={() => onNavigate('tutorial')} />
      <MenuButton icon={<Settings />} label={t.settings} onClick={() => onNavigate('settings')} />
    </motion.div>
  );
};

export const LevelSelect: React.FC<MenuProps> = ({ onStartGame, onBack, language }) => {
  const t = translations[language];
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-6 p-8 bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl max-w-4xl w-full"
    >
      <h2 className="text-3xl font-bold text-white mb-6">{t.selectLocation}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {LEVELS.map((level) => (
          <motion.div
            key={level.id}
            whileHover={{ y: -5, borderColor: 'rgba(168, 85, 247, 0.4)' }}
            onClick={() => onStartGame(level)}
            className="p-6 bg-white/5 border border-white/10 rounded-2xl cursor-pointer transition-colors"
          >
            <h3 className="text-xl font-bold text-white mb-2">{t.levelNames[level.id]}</h3>
            <p className="text-sm text-gray-400 mb-4">{t.levelDescs[level.id]}</p>
            <div className="text-xs text-purple-400 uppercase tracking-widest font-bold">Level {level.id}</div>
          </motion.div>
        ))}
      </div>
      <button onClick={onBack} className="mt-8 text-gray-500 hover:text-white transition-colors flex items-center gap-2">
        <RotateCcw size={18} /> {t.backToMenu}
      </button>
    </motion.div>
  );
};

export const Tutorial: React.FC<MenuProps> = ({ onBack, language }) => {
  const t = translations[language];
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-6 p-10 bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl max-w-2xl w-full text-white"
    >
      <h2 className="text-3xl font-bold mb-6">{t.ancientWisdom}</h2>
      <div className="space-y-6 text-gray-300">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400"><Play size={24} /></div>
          <div>
            <h4 className="font-bold text-white">{t.movement}</h4>
            <p>{t.movementDesc}</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400"><EyeOff size={24} /></div>
          <div>
            <h4 className="font-bold text-white">{t.stealth}</h4>
            <p>{t.stealthDesc}</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="p-3 bg-yellow-500/20 rounded-lg text-yellow-400"><Trophy size={24} /></div>
          <div>
            <h4 className="font-bold text-white">{t.collection}</h4>
            <p>{t.collectionDesc}</p>
          </div>
        </div>
      </div>
      <button onClick={onBack} className="mt-8 px-8 py-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
        {t.understand}
      </button>
    </motion.div>
  );
};

export const GameOver: React.FC<MenuProps> = ({ onBack, onNavigate, language }) => {
  const t = translations[language];
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-6 p-12 bg-red-950/40 backdrop-blur-2xl border border-red-500/30 rounded-3xl shadow-2xl max-w-md w-full text-center"
    >
      <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center text-red-500 mb-4">
        <Eye size={48} />
      </div>
      <h2 className="text-4xl font-bold text-white">{t.seenByHumans}</h2>
      <p className="text-red-200/70">{t.discovered}</p>
      <MenuButton icon={<RotateCcw />} label={t.tryAgain} onClick={onBack} primary />
      <MenuButton icon={<Home />} label={t.mainMenu} onClick={() => onNavigate('main')} />
    </motion.div>
  );
};

export const Victory: React.FC<MenuProps> = ({ itemsDelivered, onNavigate, language, onNextLevel }) => {
  const t = translations[language];
  const isFinalVictory = !onNextLevel;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-6 p-12 bg-purple-950/40 backdrop-blur-2xl border border-purple-500/30 rounded-3xl shadow-2xl max-w-md w-full text-center"
    >
      <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 mb-4">
        <Trophy size={48} />
      </div>
      <h2 className="text-4xl font-bold text-white">
        {isFinalVictory ? t.legendaryStealth : t.levelComplete}
      </h2>
      <p className="text-purple-200/70">
        {isFinalVictory 
          ? t.victoryDesc.replace('{items}', itemsDelivered?.toString() || '30')
          : `${t.delivered}: ${itemsDelivered} / 30`}
      </p>
      
      {onNextLevel && (
        <MenuButton icon={<Play />} label={t.nextLevel} onClick={onNextLevel} primary />
      )}
      
      <MenuButton icon={<Home />} label={t.mainMenu} onClick={() => onNavigate('main')} primary={!onNextLevel} />
    </motion.div>
  );
};

export const SettingsMenu: React.FC<{ onBack: () => void, language: Language, onLanguageChange: (lang: Language) => void }> = ({ onBack, language, onLanguageChange }) => {
  const [sound, setSound] = React.useState(true);
  const t = translations[language];
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-6 p-10 bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl max-w-md w-full text-white"
    >
      <h2 className="text-3xl font-bold mb-6">{t.settings}</h2>
      <div className="w-full space-y-4">
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
          <div className="flex items-center gap-3">
            {sound ? <Volume2 className="text-purple-400" /> : <VolumeX className="text-gray-500" />}
            <span>{t.soundEffects}</span>
          </div>
          <button 
            onClick={() => setSound(!sound)}
            className={`w-12 h-6 rounded-full transition-colors relative ${sound ? 'bg-purple-600' : 'bg-gray-700'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${sound ? 'left-7' : 'left-1'}`} />
          </button>
        </div>

        <div className="flex flex-col gap-3 p-4 bg-white/5 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <Globe className="text-purple-400" size={20} />
            <span>{t.language}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(['en', 'ru', 'chm'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => onLanguageChange(lang)}
                className={`px-2 py-2 rounded-lg text-xs font-bold transition-all ${
                  language === lang ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {lang === 'en' ? 'English' : lang === 'ru' ? 'Русский' : 'Марий'}
              </button>
            ))}
          </div>
        </div>
      </div>
      <button onClick={onBack} className="mt-8 px-8 py-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
        {t.saveClose}
      </button>
    </motion.div>
  );
};

const MenuButton: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void, primary?: boolean }> = ({ icon, label, onClick, primary }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`flex items-center gap-4 w-full px-6 py-4 rounded-2xl font-bold transition-all ${
      primary 
        ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20 hover:bg-purple-500' 
        : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/5'
    }`}
  >
    <span className={primary ? 'text-white' : 'text-purple-400'}>{icon}</span>
    {label}
  </motion.button>
);

