import { useEffect, useRef, useState } from 'react';
import { cn } from '@/utils/cn';
import { useReducedMotion } from '@/hooks/useAnimation';

interface FloatingShape {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
  borderRadius: number;
}

export function AuthBackground({ className, children }: { className?: string; children?: React.ReactNode }) {
  const reducedMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [shapes, setShapes] = useState<FloatingShape[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const initShapes = (width: number, height: number) => {
      const newShapes: FloatingShape[] = [];
      const colors = [
        'rgba(99, 102, 241, 0.08)',
        'rgba(168, 85, 247, 0.06)',
        'rgba(16, 185, 129, 0.05)',
        'rgba(59, 130, 246, 0.04)',
      ];

      for (let i = 0; i < 8; i++) {
        newShapes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 200 + 100,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: (Math.random() - 0.5) * 0.3,
          opacity: Math.random() * 0.5 + 0.1,
          color: colors[Math.floor(Math.random() * colors.length)],
          borderRadius: Math.random() * 50,
        });
      }
      setShapes(newShapes);
    };

    if (dimensions.width && dimensions.height) {
      initShapes(dimensions.width, dimensions.height);
    }
  }, [dimensions, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawCtx = ctx;

function animate() {
      drawCtx.clearRect(0, 0, dimensions.width, dimensions.height);

shapes.forEach((shape) => {
        shape.x += shape.speedX;
        shape.y += shape.speedY;

        if (shape.x < -shape.size) shape.x = dimensions.width + shape.size;
        if (shape.x > dimensions.width + shape.size) shape.x = -shape.size;
        if (shape.y < -shape.size) shape.y = dimensions.height + shape.size;
        if (shape.y > dimensions.height + shape.size) shape.y = -shape.size;

        drawCtx.beginPath();
        const radius = shape.size / 2;
        drawCtx.ellipse(
          shape.x,
          shape.y,
          radius,
          radius * 0.6,
          (shape.borderRadius / 50) * Math.PI,
          0,
          Math.PI * 2
        );
        drawCtx.fillStyle = shape.color;
        drawCtx.globalAlpha = shape.opacity;
        drawCtx.fill();
      });

      drawCtx.globalAlpha = 1;

      const gradient = drawCtx.createRadialGradient(
        dimensions.width * 0.5,
        dimensions.height * 0.5,
        0,
        dimensions.width * 0.5,
        dimensions.height * 0.5,
        Math.max(dimensions.width, dimensions.height) * 0.7
      );
      gradient.addColorStop(0, 'rgba(30, 34, 53, 0)');
      gradient.addColorStop(1, 'rgba(30, 34, 53, 0.4)');
      drawCtx.fillStyle = gradient;
      drawCtx.fillRect(0, 0, dimensions.width, dimensions.height);

      animationRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [shapes, dimensions, reducedMotion]);

  return (
    <div className={cn('fixed inset-0 overflow-hidden', className)}>
      <div className="absolute inset-0 bg-gradient-to-br from-dayflow-navy-950 via-dayflow-navy-900 to-dayflow-purple-950/30" />
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="absolute inset-0"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(99,102,241,0.15)_0%,transparent_50%),radial-gradient(ellipse_at_80%_80%,rgba(168,85,247,0.1)_0%,transparent_50%),radial-gradient(ellipse_at_50%_50%,rgba(16,185,129,0.05)_0%,transparent_70%)]" />
      {children}
    </div>
  );
}

export function AuthBackgroundSimple({ className, children }: { className?: string; children?: React.ReactNode }) {
  const reducedMotion = useReducedMotion();

  return (
    <div className={cn('fixed inset-0', className)}>
      <div className="absolute inset-0 bg-gradient-to-br from-dayflow-navy-950 via-dayflow-navy-900 to-dayflow-purple-950/30" />
      <div className={cn(
        'absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(99,102,241,0.15)_0%,transparent_50%),radial-gradient(ellipse_at_80%_80%,rgba(168,85,247,0.1)_0%,transparent_50%),radial-gradient(ellipse_at_50%_50%,rgba(16,185,129,0.05)_0%,transparent_70%)]',
        !reducedMotion && 'animate-gradient-shift bg-[length:200%_200%]'
      )} />
      {children}
    </div>
  );
}



