import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';

interface JoystickProps {
  onMove: (vector: { x: number; y: number }) => void;
}

export const Joystick: React.FC<JoystickProps> = ({ onMove }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const maxRadius = 40;

  const handleStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true);
    handleMove(e);
  };

  const handleMove = (e: React.TouchEvent | React.MouseEvent | TouchEvent | MouseEvent) => {
    if (!isDragging && e.type !== 'mousedown' && e.type !== 'touchstart') return;
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as MouseEvent).clientX;
      clientY = (e as MouseEvent).clientY;
    }

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const limitedDistance = Math.min(distance, maxRadius);
    const angle = Math.atan2(dy, dx);
    
    const x = Math.cos(angle) * limitedDistance;
    const y = Math.sin(angle) * limitedDistance;

    setPosition({ x, y });
    
    // Normalize vector for movement
    onMove({
      x: x / maxRadius,
      y: y / maxRadius
    });
  };

  const handleEnd = () => {
    setIsDragging(false);
    setPosition({ x: 0, y: 0 });
    onMove({ x: 0, y: 0 });
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
    } else {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging]);

  return (
    <div className="fixed bottom-12 left-12 z-50 select-none touch-none">
      <div 
        ref={containerRef}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
        className="w-24 h-24 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center"
      >
        <motion.div 
          animate={{ x: position.x, y: position.y }}
          transition={{ type: 'spring', damping: 15, stiffness: 200 }}
          className="w-12 h-12 bg-purple-500 rounded-full shadow-lg shadow-purple-900/40 border border-purple-400/50"
        />
      </div>
    </div>
  );
};
