import type { GameIntentSink } from './types';

const MOVEMENT_ZONE_PERCENT = 0.2;

interface InputController {
  cleanup: () => void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function createInputController(
  hostElement: HTMLElement,
  intentSink: GameIntentSink,
): InputController {
  let movementTouchId: number | null = null;
  let movementStartX = 0;

  const onKeyDown = (event: KeyboardEvent): void => {
    switch (event.key) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
        intentSink.move(-1);
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        intentSink.move(1);
        break;
      case ' ':
      case 'Enter':
        event.preventDefault();
        intentSink.fire();
        break;
      default:
        break;
    }
  };

  const onTouchStart = (event: TouchEvent): void => {
    const hostRect = hostElement.getBoundingClientRect();
    const zoneBoundary = hostRect.left + hostRect.width * MOVEMENT_ZONE_PERCENT;

    for (const touch of Array.from(event.changedTouches)) {
      if (touch.clientX <= zoneBoundary) {
        movementTouchId = touch.identifier;
        movementStartX = touch.clientX;
      } else {
        intentSink.fire();
      }
    }
  };

  const onTouchMove = (event: TouchEvent): void => {
    if (movementTouchId === null) return;

    const zoneWidth = Math.max(hostElement.clientWidth * MOVEMENT_ZONE_PERCENT, 1);
    const activeTouch = Array.from(event.touches).find((touch) => touch.identifier === movementTouchId);
    if (!activeTouch) return;

    const delta = activeTouch.clientX - movementStartX;
    intentSink.move(clamp(delta / zoneWidth, -1, 1));
    movementStartX = activeTouch.clientX;
  };

  const onTouchEnd = (event: TouchEvent): void => {
    if (movementTouchId === null) return;
    const releasedMovementTouch = Array.from(event.changedTouches).some(
      (touch) => touch.identifier === movementTouchId,
    );
    if (releasedMovementTouch) {
      movementTouchId = null;
    }
  };

  window.addEventListener('keydown', onKeyDown);
  hostElement.addEventListener('touchstart', onTouchStart, { passive: true });
  hostElement.addEventListener('touchmove', onTouchMove, { passive: true });
  hostElement.addEventListener('touchend', onTouchEnd, { passive: true });
  hostElement.addEventListener('touchcancel', onTouchEnd, { passive: true });

  return {
    cleanup: () => {
      window.removeEventListener('keydown', onKeyDown);
      hostElement.removeEventListener('touchstart', onTouchStart);
      hostElement.removeEventListener('touchmove', onTouchMove);
      hostElement.removeEventListener('touchend', onTouchEnd);
      hostElement.removeEventListener('touchcancel', onTouchEnd);
    },
  };
}
