export type EntityType = 'player' | 'npc' | 'item' | 'home' | 'obstacle' | 'animal';

export interface Vector2D {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  type: EntityType;
  pos: Vector2D;
  size: Vector2D;
  color?: string;
  sprite?: string;
}

export interface Light {
  x: number;
  y: number;
  radius: number;
  baseRadius: number;
  intensity: number;
  flicker: boolean;
}

export interface Player extends Entity {
  inventory: Item[];
  maxInventory: number;
  speed: number;
  angle: number;
}

export interface NPC extends Entity {
  path: Vector2D[];
  currentPathIndex: number;
  speed: number;
  visionAngle: number;
  visionRange: number;
  state: 'patrol' | 'investigate' | 'alert';
  angle: number;
  waitTimer: number;
  isTemporary?: boolean;
}

export interface Animal extends Entity {
  visionRange: number;
  visionAngle: number;
  angle: number;
  speed: number;
}

export interface Item extends Entity {
  collected: boolean;
  delivered: boolean;
  itemType: string;
}

export interface GameState {
  level: number;
  score: number;
  totalItems: number;
  itemsDelivered: number;
  isGameOver: boolean;
  isVictory: boolean;
  isPaused: boolean;
}

export interface LevelConfig {
  id: number;
  name: string;
  description: string;
  mapWidth: number;
  mapHeight: number;
  npcs: NPC[];
  items: Item[];
  home: Entity;
  obstacles: Entity[];
  animals?: Animal[];
  staticLights?: { x: number, y: number, radius: number, flicker: boolean }[];
}
