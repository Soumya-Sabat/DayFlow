import { useEffect, useState } from 'react';

export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return reducedMotion;
}

export function useAnimationDelay(index: number, baseDelay: number = 100): string {
  const reducedMotion = useReducedMotion();
  if (reducedMotion) return '0ms';
  return `${index * baseDelay}ms`;
}

export function useStaggeredAnimation(count: number, baseDelay: number = 100): string[] {
  const reducedMotion = useReducedMotion();
  if (reducedMotion) return Array(count).fill('0ms');

  return Array.from({ length: count }, (_, i) => `${i * baseDelay}ms`);
}



