import { LevelConfig, NPC, Item, Entity, Animal } from './types';

export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;
export const PLAYER_SIZE = 30;
export const NPC_SIZE = 35;
export const ITEM_SIZE = 20;
export const HOME_SIZE = 60;
export const MAX_INVENTORY = 6;
export const WIN_SCORE = 30;

const createNPC = (id: string, path: {x: number, y: number}[], speed: number = 1.5, isTemporary: boolean = false): NPC => ({
  id,
  type: 'npc',
  pos: { ...path[0] },
  size: { x: NPC_SIZE, y: NPC_SIZE },
  path,
  currentPathIndex: 0,
  speed,
  visionAngle: Math.PI / 3, // 60 degrees
  visionRange: 200,
  state: 'patrol',
  angle: 0,
  waitTimer: 0,
  isTemporary
});

const createAnimal = (id: string, x: number, y: number): Animal => ({
  id,
  type: 'animal',
  pos: { x, y },
  size: { x: 25, y: 25 },
  visionRange: 150,
  visionAngle: Math.PI / 2,
  angle: Math.random() * Math.PI * 2,
  speed: 1
});

const createItem = (id: string, x: number, y: number, itemType: string, forceCategory?: 'rare' | 'normal' | 'junk'): Item => {
  const rand = Math.random();
  let category: 'normal' | 'rare' | 'junk' = forceCategory || 'normal';
  let value = 1;
  
  if (!forceCategory) {
    if (rand < 0.15) {
      category = 'rare';
      value = 3;
    } else if (rand < 0.35) {
      category = 'junk';
      value = 0;
    }
  } else {
    value = category === 'rare' ? 3 : category === 'junk' ? 0 : 1;
  }

  return {
    id,
    type: 'item',
    pos: { x, y },
    size: { x: ITEM_SIZE, y: ITEM_SIZE },
    itemType,
    collected: false,
    delivered: false,
    category,
    value
  };
};

const itemTypes = ['spoon', 'button', 'thread', 'coin', 'key', 'bead', 'rusty_nail', 'broken_glass', 'gold_ring'];

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: 'The Yard (Дорожки возле избы)',
    description: 'An open area with people patrolling. Stay in the shadows.',
    mapWidth: 1200,
    mapHeight: 900,
    home: { id: 'home', type: 'home', pos: { x: 50, y: 50 }, size: { x: HOME_SIZE, y: HOME_SIZE } },
    exitPortal: { id: 'exit', type: 'home', pos: { x: 1100, y: 800 }, size: { x: HOME_SIZE, y: HOME_SIZE } },
    npcs: [
      createNPC('npc1', [{ x: 300, y: 200 }, { x: 800, y: 200 }, { x: 800, y: 600 }, { x: 300, y: 600 }]),
      createNPC('npc2', [{ x: 1000, y: 100 }, { x: 1000, y: 800 }, { x: 600, y: 800 }]),
    ],
    items: [
      // Rare items in corners
      createItem('rare1', 1150, 50, 'gold_ring', 'rare'),
      createItem('rare2', 50, 850, 'gold_ring', 'rare'),
      createItem('rare3', 1150, 850, 'gold_ring', 'rare'),
      ...Array.from({ length: 42 }, (_, i) => 
        createItem(`item${i}`, Math.random() * 1100 + 50, Math.random() * 800 + 50, itemTypes[i % itemTypes.length])
      )
    ],
    obstacles: [
      { id: 'tree1', type: 'obstacle', pos: { x: 400, y: 400 }, size: { x: 100, y: 100 } },
      { id: 'tree2', type: 'obstacle', pos: { x: 700, y: 300 }, size: { x: 80, y: 80 } },
      { id: 'fence1', type: 'obstacle', pos: { x: 0, y: 450 }, size: { x: 300, y: 20 } },
    ],
    staticLights: [
      { x: 50, y: 50, radius: 150, flicker: true },
      { x: 600, y: 450, radius: 300, flicker: false },
      { x: 1100, y: 800, radius: 250, flicker: true },
      { x: 300, y: 100, radius: 200, flicker: false },
      { x: 900, y: 300, radius: 250, flicker: false },
      { x: 200, y: 700, radius: 200, flicker: true },
      { x: 800, y: 800, radius: 250, flicker: false },
      { x: 100, y: 450, radius: 200, flicker: false },
      { x: 1100, y: 450, radius: 200, flicker: false },
      { x: 600, y: 50, radius: 200, flicker: false },
      { x: 600, y: 850, radius: 200, flicker: false },
    ]
  },
  {
    id: 2,
    name: 'The Cellar (Подпол)',
    description: 'Narrow passages and limited visibility. Watch your step.',
    mapWidth: 1000,
    mapHeight: 1000,
    home: { id: 'home', type: 'home', pos: { x: 900, y: 900 }, size: { x: HOME_SIZE, y: HOME_SIZE } },
    exitPortal: { id: 'exit', type: 'home', pos: { x: 100, y: 100 }, size: { x: HOME_SIZE, y: HOME_SIZE } },
    npcs: [
      createNPC('npc1', [{ x: 200, y: 200 }, { x: 200, y: 800 }], 2),
      createNPC('npc2', [{ x: 500, y: 800 }, { x: 500, y: 200 }], 2),
      createNPC('npc3', [{ x: 800, y: 200 }, { x: 800, y: 800 }], 2),
    ],
    items: [
      // Rare items in corners
      createItem('rare1', 50, 50, 'gold_ring', 'rare'),
      createItem('rare2', 950, 50, 'gold_ring', 'rare'),
      createItem('rare3', 50, 950, 'gold_ring', 'rare'),
      ...Array.from({ length: 42 }, (_, i) => 
        createItem(`item${i}`, Math.random() * 900 + 50, Math.random() * 900 + 50, itemTypes[i % itemTypes.length])
      )
    ],
    obstacles: [
      { id: 'wall1', type: 'obstacle', pos: { x: 300, y: 0 }, size: { x: 50, y: 700 } },
      { id: 'wall2', type: 'obstacle', pos: { x: 600, y: 300 }, size: { x: 50, y: 700 } },
    ],
    staticLights: [
      { x: 900, y: 900, radius: 200, flicker: true },
      { x: 450, y: 500, radius: 350, flicker: true },
      { x: 100, y: 100, radius: 200, flicker: true },
      { x: 200, y: 400, radius: 250, flicker: false },
      { x: 800, y: 300, radius: 250, flicker: false },
      { x: 500, y: 100, radius: 300, flicker: true },
      { x: 100, y: 500, radius: 200, flicker: false },
      { x: 900, y: 500, radius: 200, flicker: false },
    ]
  },
  {
    id: 3,
    name: 'The Barn (Сарай со скотом)',
    description: 'Chaos and obstacles. Animals move unpredictably.',
    mapWidth: 1200,
    mapHeight: 1200,
    home: { id: 'home', type: 'home', pos: { x: 600, y: 600 }, size: { x: HOME_SIZE, y: HOME_SIZE } },
    exitPortal: { id: 'exit', type: 'home', pos: { x: 100, y: 1100 }, size: { x: HOME_SIZE, y: HOME_SIZE } },
    npcs: [
      createNPC('npc1', [{ x: 100, y: 100 }, { x: 1100, y: 100 }, { x: 1100, y: 1100 }, { x: 100, y: 1100 }], 3),
      createNPC('npc2', [{ x: 300, y: 300 }, { x: 900, y: 300 }, { x: 900, y: 900 }, { x: 300, y: 900 }], 2.5),
    ],
    items: [
      // Rare items near animals
      createItem('rare1', 420, 420, 'gold_ring', 'rare'),
      createItem('rare2', 820, 220, 'gold_ring', 'rare'),
      createItem('rare3', 220, 820, 'gold_ring', 'rare'),
      ...Array.from({ length: 42 }, (_, i) => 
        createItem(`item${i}`, Math.random() * 1100 + 50, Math.random() * 1100 + 50, itemTypes[i % itemTypes.length])
      )
    ],
    obstacles: [
      { id: 'hay1', type: 'obstacle', pos: { x: 200, y: 200 }, size: { x: 120, y: 120 } },
      { id: 'hay2', type: 'obstacle', pos: { x: 800, y: 800 }, size: { x: 120, y: 120 } },
      { id: 'stall1', type: 'obstacle', pos: { x: 500, y: 100 }, size: { x: 200, y: 100 } },
    ],
    animals: [
      createAnimal('cow1', 400, 400),
      createAnimal('cow2', 800, 200),
      createAnimal('sheep1', 200, 800),
    ],
    staticLights: [
      { x: 600, y: 600, radius: 250, flicker: true },
      { x: 100, y: 100, radius: 300, flicker: false },
      { x: 1100, y: 1100, radius: 300, flicker: false },
      { x: 100, y: 1100, radius: 250, flicker: true },
      { x: 1100, y: 100, radius: 250, flicker: true },
      { x: 600, y: 100, radius: 250, flicker: false },
      { x: 600, y: 1100, radius: 250, flicker: false },
      { x: 300, y: 600, radius: 200, flicker: false },
      { x: 900, y: 600, radius: 200, flicker: false },
    ]
  }
];
