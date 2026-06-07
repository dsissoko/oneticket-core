import { describe, expect, it } from 'vitest';
import { InputController } from '@/game/input/InputController';

const createPointerLikeEvent = (
  type: string,
  init: { clientX: number; clientY: number; pointerId?: number },
): Event => {
  const pointerId = init.pointerId ?? 1;

  if ('PointerEvent' in window) {
    return new PointerEvent(type, {
      clientX: init.clientX,
      clientY: init.clientY,
      pointerId,
    });
  }

  const fallbackEvent = new MouseEvent(type, {
    clientX: init.clientX,
    clientY: init.clientY,
  });
  Object.defineProperty(fallbackEvent, 'pointerId', {
    value: pointerId,
  });

  return fallbackEvent;
};

describe('InputController', () => {
  it('maps desktop arrow and space keys to move/fire intents', () => {
    const canvas = document.createElement('canvas');
    const controller = new InputController();
    const detach = controller.attach(canvas);

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));
    const moving = controller.consumeIntents();

    expect(moving.moveAxis).toBe(1);
    expect(moving.firePressed).toBe(false);
    expect(moving.inputSource).toBe('keyboard');

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
    const firing = controller.consumeIntents();

    expect(firing.firePressed).toBe(true);
    expect(firing.inputSource).toBe('keyboard');

    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ArrowRight' }));
    const idle = controller.consumeIntents();
    expect(idle).toEqual({ moveAxis: 0, firePressed: false, inputSource: 'none' });

    detach();
  });

  it('maps mobile top-zone tap to fire intent', () => {
    const canvas = document.createElement('canvas');
    canvas.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 200, height: 100 } as DOMRect);

    const controller = new InputController();
    const detach = controller.attach(canvas);

    canvas.dispatchEvent(
      createPointerLikeEvent('pointerdown', {
        clientX: 40,
        clientY: 20,
      }),
    );

    const intents = controller.consumeIntents();
    expect(intents.firePressed).toBe(true);
    expect(intents.inputSource).toBe('touch');

    detach();
  });

  it('maps mobile bottom-zone horizontal drag to movement intent', () => {
    const canvas = document.createElement('canvas');
    canvas.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 200, height: 100 } as DOMRect);

    const controller = new InputController();
    const detach = controller.attach(canvas);

    canvas.dispatchEvent(
      createPointerLikeEvent('pointerdown', {
        clientX: 40,
        clientY: 95,
        pointerId: 7,
      }),
    );
    canvas.dispatchEvent(
      createPointerLikeEvent('pointermove', {
        clientX: 120,
        clientY: 95,
        pointerId: 7,
      }),
    );

    const moving = controller.consumeIntents();

    expect(moving.moveAxis).toBeGreaterThan(0);
    expect(moving.inputSource).toBe('touch');

    canvas.dispatchEvent(createPointerLikeEvent('pointerup', { clientX: 120, clientY: 95, pointerId: 7 }));
    const idle = controller.consumeIntents();
    expect(idle.moveAxis).toBe(0);

    detach();
  });
});
