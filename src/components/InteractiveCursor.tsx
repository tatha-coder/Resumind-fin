import React, { useEffect, useState, useRef } from 'react';

interface InteractiveCursorProps {
  theme: 'light' | 'dark';
}

interface ClickRipple {
  id: number;
  x: number;
  y: number;
}

export const InteractiveCursor: React.FC<InteractiveCursorProps> = ({ theme }) => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [trailingPos, setTrailingPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [hoverType, setHoverType] = useState<'button' | 'input' | 'card' | 'text' | 'default'>('default');
  const [isClicking, setIsClicking] = useState(false);
  const [ripples, setRipples] = useState<ClickRipple[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const requestRef = useRef<number | null>(null);
  const mousePosRef = useRef({ x: -100, y: -100 });
  const trailingPosRef = useRef({ x: -100, y: -100 });

  useEffect(() => {
    // Detect coarse pointers / touchscreens
    if (window.matchMedia('(pointer: coarse)').matches) {
      setIsTouchDevice(true);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      // Element detection under cursor
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactiveEl = target.closest('button, a, input, textarea, select, .cursor-pointer, [role="button"]');
        const cardEl = target.closest('.card-interactive, [data-card-hover]');
        
        if (interactiveEl) {
          setIsHovered(true);
          const tagName = interactiveEl.tagName.toLowerCase();
          if (tagName === 'input' || tagName === 'textarea') {
            setHoverType('input');
          } else {
            setHoverType('button');
          }
        } else if (cardEl) {
          setIsHovered(true);
          setHoverType('card');
        } else {
          setIsHovered(false);
          setHoverType('default');
        }
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      setIsClicking(true);
      const newRipple: ClickRipple = {
        id: Date.now(),
        x: e.clientX,
        y: e.clientY,
      };
      setRipples((prev) => [...prev.slice(-4), newRipple]);
    };

    const handleMouseUp = () => {
      setIsClicking(false);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Smooth animation loop for trailing ring position
    const animate = () => {
      const targetX = mousePosRef.current.x;
      const targetY = mousePosRef.current.y;

      const currentX = trailingPosRef.current.x;
      const currentY = trailingPosRef.current.y;

      // Lerp smooth follow factor (0.18)
      const nextX = currentX + (targetX - currentX) * 0.18;
      const nextY = currentY + (targetY - currentY) * 0.18;

      trailingPosRef.current = { x: nextX, y: nextY };
      setTrailingPos({ x: nextX, y: nextY });

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isVisible]);

  // Clean up old ripples after animation
  useEffect(() => {
    if (ripples.length === 0) return;
    const timer = setTimeout(() => {
      setRipples((prev) => prev.filter((r) => Date.now() - r.id < 700));
    }, 700);
    return () => clearTimeout(timer);
  }, [ripples]);

  if (isTouchDevice || !isVisible) return null;

  const isDark = theme === 'dark';

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {/* 1. Ambient Cursor Spotlight Effect in Background */}
      <div
        className="pointer-events-none fixed inset-0 transition-opacity duration-300"
        style={{
          background: isDark
            ? `radial-gradient(550px circle at ${position.x}px ${position.y}px, rgba(59, 130, 246, 0.12), rgba(139, 92, 246, 0.05) 50%, transparent 80%)`
            : `radial-gradient(450px circle at ${position.x}px ${position.y}px, rgba(37, 99, 235, 0.07), rgba(99, 102, 241, 0.03) 50%, transparent 80%)`,
        }}
      />

      {/* 2. Click Shockwave Ripples */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-500/60 dark:border-cyan-400/80 animate-ping opacity-75"
          style={{
            left: `${ripple.x}px`,
            top: `${ripple.y}px`,
            width: '60px',
            height: '60px',
          }}
        />
      ))}

      {/* 3. Trailing Outer Reactive Ring */}
      <div
        className={`pointer-events-none fixed -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-150 ease-out flex items-center justify-center ${
          isHovered
            ? hoverType === 'button'
              ? 'w-12 h-12 bg-blue-500/20 dark:bg-cyan-400/25 border-2 border-blue-500 dark:border-cyan-300 shadow-[0_0_20px_rgba(59,130,246,0.5)] scale-110'
              : hoverType === 'input'
              ? 'w-10 h-10 bg-indigo-500/15 dark:bg-indigo-400/20 border border-indigo-500 dark:border-indigo-300 shadow-sm scale-100'
              : 'w-14 h-14 bg-sky-500/10 dark:bg-sky-400/15 border border-sky-400/60 dark:border-sky-300/80 scale-105'
            : 'w-8 h-8 border border-slate-400/50 dark:border-slate-300/60 bg-blue-500/5 dark:bg-cyan-400/10 shadow-xs'
        } ${isClicking ? 'scale-75 bg-blue-600/30' : ''}`}
        style={{
          left: `${trailingPos.x}px`,
          top: `${trailingPos.y}px`,
        }}
      >
        {/* Glow halo when hovering buttons */}
        {isHovered && hoverType === 'button' && (
          <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-cyan-300 animate-pulse" />
        )}
      </div>

      {/* 4. Core Precision Dot */}
      <div
        className={`pointer-events-none fixed -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform duration-75 ease-out ${
          isClicking
            ? 'w-3 h-3 bg-blue-700 dark:bg-cyan-200 scale-125'
            : isHovered
            ? 'w-2.5 h-2.5 bg-blue-600 dark:bg-cyan-300 shadow-xs'
            : 'w-2 h-2 bg-slate-900 dark:bg-white shadow-xs'
        }`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      />
    </div>
  );
};
