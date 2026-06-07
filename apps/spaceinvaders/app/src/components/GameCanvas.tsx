import { useEffect, useRef } from 'react';

type LogicalDimensions = {
  width: number;
  height: number;
};

export function GameCanvas(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const logicalDimensionsRef = useRef<LogicalDimensions>({ width: 1, height: 1 });
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      console.warn('[SpaceInvaders] Canvas element unavailable at mount');
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      console.warn('[SpaceInvaders] Unable to acquire 2D context');
      return;
    }

    let isUnmounted = false;

    const updateLogicalDimensions = (): void => {
      if (isUnmounted) return;

      const parent = canvas.parentElement;
      if (!parent) {
        console.warn('[SpaceInvaders] Canvas parent not found while sizing');
        return;
      }

      const width = Math.max(1, Math.floor(parent.clientWidth));
      const height = Math.max(1, Math.floor(parent.clientHeight));

      logicalDimensionsRef.current = { width, height };
      canvas.width = width;
      canvas.height = height;
    };

    const drawFrame = (): void => {
      const { width, height } = logicalDimensionsRef.current;

      context.clearRect(0, 0, width, height);
      context.fillStyle = '#05070e';
      context.fillRect(0, 0, width, height);

      context.fillStyle = '#7fffd4';
      context.font = '16px monospace';
      context.fillText(`logical: ${width}x${height}`, 16, 28);
      context.fillText('SpaceInvaders runtime foundation', 16, 52);

      if (!isUnmounted) {
        animationFrameRef.current = window.requestAnimationFrame(drawFrame);
      }
    };

    const handleResize = (): void => {
      try {
        updateLogicalDimensions();
      } catch (error) {
        console.error('[SpaceInvaders] Failed to handle canvas resize', error);
      }
    };

    try {
      updateLogicalDimensions();
      window.addEventListener('resize', handleResize);
      animationFrameRef.current = window.requestAnimationFrame(drawFrame);
    } catch (error) {
      console.error('[SpaceInvaders] Failed to initialize canvas runtime', error);
    }

    return () => {
      isUnmounted = true;
      window.removeEventListener('resize', handleResize);

      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, []);

  return <canvas aria-label="SpaceInvaders game canvas" className="game-canvas" ref={canvasRef} />;
}
