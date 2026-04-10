export type Language = 'en' | 'ru' | 'chm';

export interface Translations {
  title: string;
  subtitle: string;
  startJourney: string;
  howToPlay: string;
  settings: string;
  selectLocation: string;
  backToMenu: string;
  ancientWisdom: string;
  movement: string;
  movementDesc: string;
  stealth: string;
  stealthDesc: string;
  collection: string;
  collectionDesc: string;
  understand: string;
  seenByHumans: string;
  discovered: string;
  tryAgain: string;
  mainMenu: string;
  legendaryStealth: string;
  victoryDesc: string;
  nextLevel: string;
  levelComplete: string;
  soundEffects: string;
  language: string;
  saveClose: string;
  carrying: string;
  delivered: string;
  currentLocation: string;
  controlsHint: string;
  levelNames: {
    [key: number]: string;
  };
  levelDescs: {
    [key: number]: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    title: "KUDIR KUVA",
    subtitle: "The Hidden One of Mari Mythology",
    startJourney: "Start Journey",
    howToPlay: "How to Play",
    settings: "Settings",
    selectLocation: "Select Location",
    backToMenu: "Back to Menu",
    ancientWisdom: "Ancient Wisdom",
    movement: "Movement",
    movementDesc: "Use WASD or Arrow Keys to move Kudyr Kuva through the shadows.",
    stealth: "Stealth",
    stealthDesc: "Avoid the red vision cones of humans. If they see you, you vanish from this world.",
    collection: "Collection",
    collectionDesc: "Collect 30 items out of 45. You can carry 6 at a time. Return to your portal to deliver them.",
    understand: "I Understand",
    seenByHumans: "Seen by Humans",
    discovered: "You have been discovered. The magic of the Hidden One fades...",
    tryAgain: "Try Again",
    mainMenu: "Main Menu",
    legendaryStealth: "Legendary Stealth",
    victoryDesc: "You have collected all 90 items. Your hidden home is now complete.",
    nextLevel: "Next Level",
    levelComplete: "Level Complete",
    soundEffects: "Sound Effects",
    language: "Language",
    saveClose: "Save & Close",
    carrying: "Carrying",
    delivered: "Delivered",
    currentLocation: "Current Location",
    controlsHint: "WASD to move • Avoid red cones • Return to portal",
    levelNames: {
      1: "The Yard",
      2: "The Cellar",
      3: "The Barn"
    },
    levelDescs: {
      1: "An open area with people patrolling. Stay in the shadows.",
      2: "Narrow passages and limited visibility. Watch your step.",
      3: "Chaos and obstacles. Animals move unpredictably."
    }
  },
  ru: {
    title: "КУДЫР КУВА",
    subtitle: "Скрытое существо марийской мифологии",
    startJourney: "Начать путь",
    howToPlay: "Как играть",
    settings: "Настройки",
    selectLocation: "Выбор локации",
    backToMenu: "В меню",
    ancientWisdom: "Древняя мудрость",
    movement: "Движение",
    movementDesc: "Используйте WASD или стрелки, чтобы перемещать Кудыр куву в тенях.",
    stealth: "Скрытность",
    stealthDesc: "Избегайте красных конусов зрения людей. Если вас заметят, вы исчезнете из этого мира.",
    collection: "Сбор предметов",
    collectionDesc: "Соберите 30 предметов из 45. Можно нести до 6 за раз. Вернитесь в портал, чтобы сдать их.",
    understand: "Я понимаю",
    seenByHumans: "Замечен людьми",
    discovered: "Вас обнаружили. Магия Скрытого существа угасает...",
    tryAgain: "Попробовать снова",
    mainMenu: "Главное меню",
    legendaryStealth: "Легендарная скрытность",
    victoryDesc: "Вы собрали все 90 предметов. Ваше скрытое жилище теперь завершено.",
    nextLevel: "Следующий уровень",
    levelComplete: "Уровень пройден",
    soundEffects: "Звуковые эффекты",
    language: "Язык",
    saveClose: "Сохранить и закрыть",
    carrying: "Несу",
    delivered: "Сдано",
    currentLocation: "Текущая локация",
    controlsHint: "WASD для движения • Избегайте красных зон • Вернитесь в портал",
    levelNames: {
      1: "Двор",
      2: "Подпол",
      3: "Сарай"
    },
    levelDescs: {
      1: "Открытая площадка с патрулирующими людьми. Оставайтесь в тени.",
      2: "Узкие проходы и ограниченная видимость. Смотрите под ноги.",
      3: "Хаос и препятствия. Животные движутся непредсказуемо."
    }
  },
  chm: {
    title: "КҮДЫР КУВА",
    subtitle: "Марий мифологийысе шылше шӱлыш",
    startJourney: "Корным тӱҥалаш",
    howToPlay: "Кузе модаш",
    settings: "Келыштарымаш",
    selectLocation: "Верным ойыраш",
    backToMenu: "Тӱҥ менюш",
    ancientWisdom: "Тошто акрет уш",
    movement: "Тарванымаш",
    movementDesc: "WASD але стрелке-влак дене Кӱдыр кувам шӱкшӧ верлаште тарватыза.",
    stealth: "Шылмаш",
    stealthDesc: "Айдемын йошкар шинчаончалтышыж деч шылыза. Ойыш вералтса гын, тӱня деч йомыда.",
    collection: "Погымаш",
    collectionDesc: "45 ӱзгарым погыза (30-ым наҥгаяш кӱлеш). Ик гана 6 ӱзгарым наҥгайыман. Порталыш пӧртылза.",
    understand: "Мый умылем",
    seenByHumans: "Айдеме ужо",
    discovered: "Тыйын пале лийыч. Кӱдыр куван магийже пыта...",
    tryAgain: "Уэш тӱҥалаш",
    mainMenu: "Тӱҥ меню",
    legendaryStealth: "Чот шылше",
    victoryDesc: "Тый чыла 90 ӱзгарым погыч. Тыйын шылше суртыт ямде.",
    nextLevel: "Вес уровень",
    levelComplete: "Уровень эртыме",
    soundEffects: "Йӱк",
    language: "Йылме",
    saveClose: "Аралаш да петыраш",
    carrying: "Наҥгаем",
    delivered: "Пуымо",
    currentLocation: "Кызытсе вер",
    controlsHint: "WASD тарванаш • Йошкар вер деч шылаш • Порталыш пӧртылаш",
    levelNames: {
      1: "Кудывече",
      2: "Йымал",
      3: "Вичкыж"
    },
    levelDescs: {
      1: "Айдеме-влак коштыт. Пычкемыш верлаште лийза.",
      2: "Вичкыж корно-влак. Шинчалан начар коеш.",
      3: "Чыла йыр-йыр. Вольык-влак тарванат."
    }
  }
};
