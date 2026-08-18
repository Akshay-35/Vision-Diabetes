import { useEffect, useState } from 'react';

export function useCountUp(target: number, duration = 1200, start = 0) {
  const [value, setValue] = useState(start);
  useEffect(() => {
    let raf = 0;
    const startTime = performance.now();
    const animate = (now: number) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(start + (target - start) * eased);
      if (progress < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);
  return value;
}
