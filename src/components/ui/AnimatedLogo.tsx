import { useEffect, useRef, useState } from 'react';
import { cn } from '@/utils/cn';
import { useReducedMotion } from '@/hooks/useAnimation';

interface AnimatedLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animate?: boolean;
}

export function AnimatedLogo({ size = 'md', className, animate = true }: AnimatedLogoProps) {
  const reducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  const sizes = {
    sm: 40,
    md: 56,
    lg: 80,
    xl: 120,
  };

  const sizeValue = sizes[size];

  useEffect(() => {
    if (reducedMotion || !animate) {
      setIsVisible(true);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      opacity: number;
      color: string;
    }> = [];

    const colors = [
      'rgba(99, 102, 241, 0.6)',
      'rgba(168, 85, 247, 0.6)',
      'rgba(16, 185, 129, 0.6)',
      'rgba(59, 130, 246, 0.6)',
    ];

    function initParticles() {
      particles.length = 0;
      for (let i = 0; i < 15; i++) {
        particles.push({
          x: Math.random() * sizeValue,
          y: Math.random() * sizeValue,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          radius: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.2,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    }

    function animate() {
      if (!ctx) return;

      ctx.clearRect(0, 0, sizeValue, sizeValue);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > sizeValue) p.vx *= -1;
        if (p.y < 0 || p.y > sizeValue) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      });

      ctx.globalAlpha = 1;

      animationRef.current = requestAnimationFrame(animate);
    }

    initParticles();
    animate();
    setIsVisible(true);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [sizeValue, reducedMotion, animate]);

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <canvas
        ref={canvasRef}
        width={sizeValue}
        height={sizeValue}
        className={cn('absolute inset-0', !isVisible && 'opacity-0', reducedMotion && 'hidden')}
        aria-hidden="true"
      />
      <div
        className={cn(
          'relative z-10 flex items-center justify-center',
          'bg-gradient-to-br from-dayflow-indigo-600 via-dayflow-purple-600 to-dayflow-emerald-500',
          'rounded-2xl',
          'shadow-lg shadow-dayflow-indigo-500/30',
          !isVisible && 'opacity-0 scale-95',
          'transition-all duration-500 ease-out'
        )}
        style={{ width: sizeValue, height: sizeValue }}
        aria-hidden="true"
      >
        <svg
          className="w-1/2 h-1/2 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </div>
    </div>
  );
}

export function AnimatedLogoText({ className, animate = true }: { className?: string; animate?: boolean }) {
  const reducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (reducedMotion || !animate) {
      setIsVisible(true);
      return;
    }
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, [reducedMotion, animate]);

  return (
    <div
      className={cn(
        'flex items-center gap-2',
        'bg-gradient-to-r from-dayflow-indigo-600 via-dayflow-purple-600 to-dayflow-emerald-500',
        'bg-clip-text text-transparent',
        'font-heading font-bold tracking-tight',
        !isVisible && 'opacity-0 translate-y-4',
        animate && 'transition-all duration-700 ease-out',
        className
      )}
      aria-hidden="true"
    >
      <span className="text-2xl sm:text-3xl md:text-4xl">Dayflow</span>
    </div>
  );
}



