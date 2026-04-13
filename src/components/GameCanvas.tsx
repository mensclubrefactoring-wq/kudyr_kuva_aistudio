import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameState, LevelConfig, Player, NPC, Item, Entity, Vector2D, Animal } from '../types';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER_SIZE, MAX_INVENTORY, WIN_SCORE } from '../constants';
import { LightingSystem } from '../lib/lighting';
import { soundManager } from '../lib/sounds';

interface GameCanvasProps {
  level: LevelConfig;
  onGameOver: () => void;
  onVictory: () => void;
  onUpdateState: (state: Partial<GameState>) => void;
  joystickVector?: { x: number; y: number };
}

const GameCanvas: React.FC<GameCanvasProps> = ({ level, onGameOver, onVictory, onUpdateState, joystickVector }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(null);
  const lightingRef = useRef<LightingSystem | null>(null);
  const joystickRef = useRef({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: GAME_WIDTH, height: GAME_HEIGHT });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
        if (lightingRef.current) {
          lightingRef.current = new LightingSystem(width, height);
        }
      }
    };

    const observer = new ResizeObserver(updateDimensions);
    if (containerRef.current) observer.observe(containerRef.current);
    updateDimensions();

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (joystickVector) {
      joystickRef.current = joystickVector;
    }
  }, [joystickVector]);
  
  // Game state refs to avoid closure issues in the loop
  const playerRef = useRef<Player>({
    id: 'player',
    type: 'player',
    pos: { x: level.home.pos.x + 20, y: level.home.pos.y + 20 },
    size: { x: PLAYER_SIZE, y: PLAYER_SIZE },
    inventory: [],
    maxInventory: MAX_INVENTORY,
    speed: 4,
    angle: 0
  });

  const npcsRef = useRef<NPC[]>(level.npcs.map(npc => ({ ...npc })));
  const animalsRef = useRef<Animal[]>(level.animals?.map(a => ({ ...a })) || []);
  const itemsRef = useRef<Item[]>(level.items.map(item => ({ ...item })));
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const cameraRef = useRef<Vector2D>({ x: 0, y: 0 });
  const itemsDeliveredRef = useRef(0);
  const lastLaughTimeRef = useRef(0);

  useEffect(() => {
    // Reset game entities ONLY when the level changes
    playerRef.current.pos = { x: level.home.pos.x + 20, y: level.home.pos.y + 20 };
    playerRef.current.inventory = [];
    npcsRef.current = level.npcs.map(npc => ({ ...npc }));
    animalsRef.current = level.animals?.map(a => ({ ...a })) || [];
    itemsRef.current = level.items.map(item => ({ ...item }));
    itemsDeliveredRef.current = 0;
    
    // Play initial scary sound and background music
    soundManager.playScaryAmbient();
    soundManager.playBackgroundMusic();
  }, [level]);

  useEffect(() => {
    // Update camera and lighting when dimensions or level change, but DON'T reset entities
    cameraRef.current.x = playerRef.current.pos.x + playerRef.current.size.x / 2 - dimensions.width / 2;
    cameraRef.current.y = playerRef.current.pos.y + playerRef.current.size.y / 2 - dimensions.height / 2;
    cameraRef.current.x = Math.max(0, Math.min(cameraRef.current.x, level.mapWidth - dimensions.width));
    cameraRef.current.y = Math.max(0, Math.min(cameraRef.current.y, level.mapHeight - dimensions.height));

    lightingRef.current = new LightingSystem(dimensions.width, dimensions.height);
  }, [level, dimensions.width, dimensions.height]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    keysRef.current[e.key] = true;
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keysRef.current[e.key] = false;
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const checkCollision = (a: Entity, b: Entity) => {
    return (
      a.pos.x < b.pos.x + b.size.x &&
      a.pos.x + a.size.x > b.pos.x &&
      a.pos.y < b.pos.y + b.size.y &&
      a.pos.y + a.size.y > b.pos.y
    );
  };

  const isPointInVision = (npc: NPC | Animal, point: Vector2D) => {
    const dx = point.x - (npc.pos.x + npc.size.x / 2);
    const dy = point.y - (npc.pos.y + npc.size.y / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > npc.visionRange) return false;

    const angleToPoint = Math.atan2(dy, dx);
    let diff = Math.abs(angleToPoint - npc.angle);
    if (diff > Math.PI) diff = 2 * Math.PI - diff;

    return diff < npc.visionAngle / 2;
  };

  const update = () => {
    const player = playerRef.current;
    const npcs = npcsRef.current;
    const items = itemsRef.current;
    const animals = animalsRef.current;
    const lighting = lightingRef.current;

    // Player movement
    let dx = 0;
    let dy = 0;
    
    // Keyboard input
    if (keysRef.current['ArrowUp'] || keysRef.current['w']) dy -= player.speed;
    if (keysRef.current['ArrowDown'] || keysRef.current['s']) dy += player.speed;
    if (keysRef.current['ArrowLeft'] || keysRef.current['a']) dx -= player.speed;
    if (keysRef.current['ArrowRight'] || keysRef.current['d']) dx += player.speed;

    // Joystick input (additive)
    if (joystickRef.current.x !== 0 || joystickRef.current.y !== 0) {
      dx += joystickRef.current.x * player.speed;
      dy += joystickRef.current.y * player.speed;
    }

    if (dx !== 0 || dy !== 0) {
      player.angle = Math.atan2(dy, dx);
      
      const nextX = player.pos.x + dx;
      const nextY = player.pos.y + dy;

      // Map boundaries
      if (nextX >= 0 && nextX <= level.mapWidth - player.size.x) {
        const collisionX = level.obstacles.some(obs => checkCollision({ ...player, pos: { x: nextX, y: player.pos.y } }, obs));
        if (!collisionX) player.pos.x = nextX;
      }
      if (nextY >= 0 && nextY <= level.mapHeight - player.size.y) {
        const collisionY = level.obstacles.some(obs => checkCollision({ ...player, pos: { x: player.pos.x, y: nextY } }, obs));
        if (!collisionY) player.pos.y = nextY;
      }

      // Occasional laugh when moving
      if (Date.now() - lastLaughTimeRef.current > 15000 && Math.random() < 0.005) {
        soundManager.playLaugh();
        lastLaughTimeRef.current = Date.now();
      }
    }

    // Camera follow
    cameraRef.current.x = player.pos.x + player.size.x / 2 - dimensions.width / 2;
    cameraRef.current.y = player.pos.y + player.size.y / 2 - dimensions.height / 2;
    cameraRef.current.x = Math.max(0, Math.min(cameraRef.current.x, level.mapWidth - dimensions.width));
    cameraRef.current.y = Math.max(0, Math.min(cameraRef.current.y, level.mapHeight - dimensions.height));

    // Update Lighting
    if (lighting) {
      lighting.clearLights();
      // Static lights
      level.staticLights?.forEach(light => {
        lighting.addLight(light.x, light.y, light.radius, 1, light.flicker);
      });
      // Portal light
      lighting.addLight(level.home.pos.x + level.home.size.x/2, level.home.pos.y + level.home.size.y/2, 150, 1, true);
      
      // Exit Portal light (if active)
      if (itemsDeliveredRef.current >= WIN_SCORE && level.exitPortal) {
        lighting.addLight(level.exitPortal.pos.x + level.exitPortal.size.x/2, level.exitPortal.pos.y + level.exitPortal.size.y/2, 300, 1, true);
      }

      // NPC vision lights (lanterns)
      npcs.forEach(npc => {
        lighting.addLight(npc.pos.x + npc.size.x/2, npc.pos.y + npc.size.y/2, 220, 1, true);
      });

      // Animal lights (glowing eyes/presence)
      animals.forEach(animal => {
        lighting.addLight(animal.pos.x + animal.size.x/2, animal.pos.y + animal.size.y/2, 180, 0.9, true);
      });

      lighting.update();
    }

    // NPC movement and vision
    npcs.forEach((npc, index) => {
      const target = npc.path[npc.currentPathIndex];
      const dx = target.x - npc.pos.x;
      const dy = target.y - npc.pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 5) {
        npc.currentPathIndex = (npc.currentPathIndex + 1) % npc.path.length;
      } else {
        npc.angle = Math.atan2(dy, dx);
        npc.pos.x += Math.cos(npc.angle) * npc.speed;
        npc.pos.y += Math.sin(npc.angle) * npc.speed;
      }

      // Vision check: Only seen if in light OR very close to NPC
      const playerCenter = { x: player.pos.x + player.size.x / 2, y: player.pos.y + player.size.y / 2 };
      if (isPointInVision(npc, playerCenter)) {
        const inLight = lighting ? lighting.isInLight(playerCenter.x, playerCenter.y) : false;
        const veryClose = dist < 60;
        if (inLight || veryClose) {
          onGameOver();
        }
      }

      // Temporary NPCs (spawned by animals) disappear after some time or if far
      if (npc.isTemporary) {
        const distToPlayer = Math.sqrt(Math.pow(npc.pos.x - player.pos.x, 2) + Math.pow(npc.pos.y - player.pos.y, 2));
        if (distToPlayer > 600) {
          npcsRef.current.splice(index, 1);
        }
      }
    });

    // Animal logic
    animals.forEach((animal, i) => {
      const playerCenter = { x: player.pos.x + player.size.x / 2, y: player.pos.y + player.size.y / 2 };
      const animalCenter = { x: animal.pos.x + animal.size.x / 2, y: animal.pos.y + animal.size.y / 2 };
      const dx = playerCenter.x - animalCenter.x;
      const dy = playerCenter.y - animalCenter.y;
      const distToPlayer = Math.sqrt(dx * dx + dy * dy);

      if (distToPlayer < 250) {
        // Track player if close
        const targetAngle = Math.atan2(dy, dx);
        // Smoothly rotate towards player
        let angleDiff = targetAngle - animal.angle;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        animal.angle += angleDiff * 0.05;
      } else {
        // Idle rotation
        animal.angle += 0.01;
      }
      
      if (isPointInVision(animal, playerCenter)) {
        // Spawn a temporary NPC (human) if not too many
        if (npcs.filter(n => n.isTemporary).length < 2 && Math.random() < 0.02) {
          soundManager.playAlert();
          const spawnDist = 400;
          const spawnAngle = Math.random() * Math.PI * 2;
          const spawnPos = {
            x: player.pos.x + Math.cos(spawnAngle) * spawnDist,
            y: player.pos.y + Math.sin(spawnAngle) * spawnDist
          };
          
          npcsRef.current.push({
            id: `temp_npc_${Date.now()}`,
            type: 'npc',
            pos: spawnPos,
            size: { x: 35, y: 35 },
            path: [{ ...player.pos }, { x: Math.random() * level.mapWidth, y: Math.random() * level.mapHeight }],
            currentPathIndex: 0,
            speed: 3,
            visionAngle: Math.PI / 2,
            visionRange: 250,
            state: 'alert',
            angle: 0,
            waitTimer: 0,
            isTemporary: true
          });
        }
      }
    });

    // Item collection
    items.forEach(item => {
      if (!item.collected && !item.delivered && player.inventory.length < player.maxInventory) {
        if (checkCollision(player, item)) {
          item.collected = true;
          player.inventory.push(item);
          // Update inventory weight/count
          const currentWeight = player.inventory.length;
          onUpdateState({ score: currentWeight });
        }
      }
    });

    // Item delivery
    if (checkCollision(player, level.home)) {
      if (player.inventory.length > 0) {
        let deliveredValue = 0;
        player.inventory.forEach(item => {
          item.delivered = true;
          item.collected = false;
          deliveredValue += item.value;
        });
        itemsDeliveredRef.current += deliveredValue;
        player.inventory = [];
        onUpdateState({ itemsDelivered: itemsDeliveredRef.current, score: 0 });
        
        if (itemsDeliveredRef.current >= WIN_SCORE) {
          onUpdateState({ canExit: true });
        }
      }
    }

    // Exit Portal Logic
    if (itemsDeliveredRef.current >= WIN_SCORE && level.exitPortal) {
      if (checkCollision(player, level.exitPortal)) {
        onVictory();
      }
    }
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    const cam = cameraRef.current;
    const lighting = lightingRef.current;
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Draw background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);
    
    // Draw grid
    ctx.strokeStyle = '#151515';
    ctx.lineWidth = 1;
    for (let x = -cam.x % 100; x < dimensions.width; x += 100) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, dimensions.height); ctx.stroke();
    }
    for (let y = -cam.y % 100; y < dimensions.height; y += 100) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(dimensions.width, y); ctx.stroke();
    }

    // Draw obstacles
    level.obstacles.forEach(obs => {
      ctx.fillStyle = '#111';
      ctx.fillRect(obs.pos.x - cam.x, obs.pos.y - cam.y, obs.size.x, obs.size.y);
      ctx.strokeStyle = '#222';
      ctx.strokeRect(obs.pos.x - cam.x, obs.pos.y - cam.y, obs.size.x, obs.size.y);
    });

    // Draw home
    const home = level.home;
    const homeGrad = ctx.createRadialGradient(
      home.pos.x + home.size.x / 2 - cam.x, home.pos.y + home.size.y / 2 - cam.y, 0,
      home.pos.x + home.size.x / 2 - cam.x, home.pos.y + home.size.y / 2 - cam.y, home.size.x / 2
    );
    homeGrad.addColorStop(0, 'rgba(100, 0, 255, 0.6)');
    homeGrad.addColorStop(1, 'rgba(100, 0, 255, 0)');
    ctx.fillStyle = homeGrad;
    ctx.beginPath();
    ctx.arc(home.pos.x + home.size.x / 2 - cam.x, home.pos.y + home.size.y / 2 - cam.y, home.size.x / 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw Exit Portal
    if (itemsDeliveredRef.current >= WIN_SCORE && level.exitPortal) {
      const exit = level.exitPortal;
      const exitGrad = ctx.createRadialGradient(
        exit.pos.x + exit.size.x / 2 - cam.x, exit.pos.y + exit.size.y / 2 - cam.y, 0,
        exit.pos.x + exit.size.x / 2 - cam.x, exit.pos.y + exit.size.y / 2 - cam.y, exit.size.x / 2
      );
      exitGrad.addColorStop(0, 'rgba(0, 255, 100, 0.6)');
      exitGrad.addColorStop(1, 'rgba(0, 255, 100, 0)');
      ctx.fillStyle = exitGrad;
      ctx.beginPath();
      ctx.arc(exit.pos.x + exit.size.x / 2 - cam.x, exit.pos.y + exit.size.y / 2 - cam.y, exit.size.x / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw items
    itemsRef.current.forEach(item => {
      if (!item.collected && !item.delivered) {
        if (item.category === 'rare') {
          ctx.fillStyle = '#ff00ff'; // Rare items are magenta
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#ff00ff';
        } else if (item.category === 'junk') {
          ctx.fillStyle = '#555'; // Junk items are grey
          ctx.shadowBlur = 0;
        } else {
          ctx.fillStyle = '#ffd700'; // Normal items are gold
          ctx.shadowBlur = 5;
          ctx.shadowColor = '#ffd700';
        }
        
        ctx.beginPath();
        ctx.arc(item.pos.x + item.size.x / 2 - cam.x, item.pos.y + item.size.y / 2 - cam.y, item.size.x / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });

    // Draw Animals
    animalsRef.current.forEach(animal => {
      ctx.fillStyle = '#2d5a27'; // Green
      ctx.beginPath();
      ctx.arc(animal.pos.x + animal.size.x/2 - cam.x, animal.pos.y + animal.size.y/2 - cam.y, animal.size.x/2, 0, Math.PI * 2);
      ctx.fill();
      
      // Animal Vision Cone (subtle green)
      ctx.fillStyle = 'rgba(0, 255, 0, 0.05)';
      ctx.beginPath();
      ctx.moveTo(animal.pos.x + animal.size.x/2 - cam.x, animal.pos.y + animal.size.y/2 - cam.y);
      ctx.arc(animal.pos.x + animal.size.x/2 - cam.x, animal.pos.y + animal.size.y/2 - cam.y, animal.visionRange, animal.angle - animal.visionAngle/2, animal.angle + animal.visionAngle/2);
      ctx.closePath();
      ctx.fill();
    });

    // Draw NPCs
    npcsRef.current.forEach(npc => {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
      ctx.beginPath();
      ctx.moveTo(npc.pos.x + npc.size.x / 2 - cam.x, npc.pos.y + npc.size.y / 2 - cam.y);
      ctx.arc(npc.pos.x + npc.size.x / 2 - cam.x, npc.pos.y + npc.size.y / 2 - cam.y, npc.visionRange, npc.angle - npc.visionAngle / 2, npc.angle + npc.visionAngle / 2);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = npc.isTemporary ? '#ff4500' : '#8b0000';
      ctx.fillRect(npc.pos.x - cam.x, npc.pos.y - cam.y, npc.size.x, npc.size.y);
    });

    // Draw Player
    const player = playerRef.current;
    ctx.save();
    ctx.translate(player.pos.x + player.size.x / 2 - cam.x, player.pos.y + player.size.y / 2 - cam.y);
    ctx.rotate(player.angle);
    ctx.fillStyle = '#4a90e2';
    ctx.beginPath();
    ctx.ellipse(0, 0, player.size.x / 2, player.size.y / 3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Bright white eyes
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ffffff';
    ctx.beginPath();
    ctx.arc(8, -6, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(8, 6, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    ctx.restore();

    // Apply Lighting
    if (lighting) {
      lighting.render(ctx, cam.x, cam.y);
    }
  };

  const loop = () => {
    update();
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) draw(ctx);
    requestRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [level, dimensions.width, dimensions.height]);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-black overflow-hidden flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full sm:border-4 border-gray-800 sm:rounded-lg shadow-2xl"
      />
      <div className="absolute top-4 right-4 w-24 sm:w-40 h-18 sm:h-30 bg-black/50 border border-white/20 rounded overflow-hidden pointer-events-none hidden sm:block">
        <div 
          className="absolute bg-blue-500 w-2 h-2 rounded-full"
          style={{ 
            left: `${(playerRef.current.pos.x / level.mapWidth) * 100}%`,
            top: `${(playerRef.current.pos.y / level.mapHeight) * 100}%`
          }}
        />
      </div>
    </div>
  );
};

export default GameCanvas;
