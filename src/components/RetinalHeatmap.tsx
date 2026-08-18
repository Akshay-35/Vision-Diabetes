import { useEffect, useRef, useState } from 'react';

interface HeatmapProps {
  imageUrl?: string | null;
  region?: { cx: number; cy: number; radius: number } | null;
  className?: string;
}

export function RetinalHeatmap({ imageUrl, region, className = '' }: HeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageUrl) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const size = 320;
      canvas.width = size;
      canvas.height = size;
      // Draw fundus image
      ctx.drawImage(img, 0, 0, size, size);
      setLoaded(true);

      if (region) {
        const cx = region.cx * size;
        const cy = region.cy * size;
        const r = region.radius * size;
        // Grad-CAM style radial gradient overlay
        const grad = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r);
        grad.addColorStop(0, 'rgba(255, 0, 0, 0.75)');
        grad.addColorStop(0.4, 'rgba(255, 165, 0, 0.55)');
        grad.addColorStop(0.7, 'rgba(255, 255, 0, 0.35)');
        grad.addColorStop(1, 'rgba(0, 0, 255, 0)');
        ctx.globalAlpha = 0.65;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    };
    img.onerror = () => setLoaded(false);
    img.src = imageUrl;
  }, [imageUrl, region]);

  if (!imageUrl) {
    return (
      <div className={`flex items-center justify-center rounded-2xl bg-navy-50 dark:bg-navy-900/40 ${className}`}>
        <p className="text-sm text-navy-400 dark:text-slate-500">No retinal image</p>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}>
      <canvas ref={canvasRef} className={loaded ? 'block h-full w-full' : 'hidden'} />
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-navy-50 dark:bg-navy-900/40">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-royal-500 border-t-transparent" />
        </div>
      )}
    </div>
  );
}
