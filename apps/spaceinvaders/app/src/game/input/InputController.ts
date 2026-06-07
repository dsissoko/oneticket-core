const MOBILE_FIRE_ZONE_HEIGHT_RATIO = 0.8;
const MOBILE_DRAG_SENSITIVITY_RATIO = 0.2;

export type InputSource = 'none' | 'keyboard' | 'touch';

export type GameInputIntents = {
  moveAxis: number;
  firePressed: boolean;
  inputSource: InputSource;
};

type DragState = {
  pointerId: number;
  startX: number;
  currentX: number;
  canvasWidth: number;
};

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const EMPTY_INTENTS: GameInputIntents = {
  moveAxis: 0,
  firePressed: false,
  inputSource: 'none',
};

export class InputController {
  private readonly pressedKeys = new Set<string>();

  private dragState: DragState | null = null;

  private fireRequested = false;

  private lastFireSource: InputSource = 'none';

  private onKeyDown = (event: KeyboardEvent): void => {
    const { code } = event;
    if (code === 'ArrowLeft' || code === 'ArrowRight' || code === 'Space') {
      event.preventDefault();
    }

    if (code === 'ArrowLeft' || code === 'ArrowRight') {
      this.pressedKeys.add(code);
    }

    if (code === 'Space' && !event.repeat) {
      this.fireRequested = true;
      this.lastFireSource = 'keyboard';
    }
  };

  private onKeyUp = (event: KeyboardEvent): void => {
    if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
      this.pressedKeys.delete(event.code);
    }
  };

  private onPointerDown = (event: PointerEvent): void => {
    const point = this.getLocalPoint(event);
    if (!point) return;

    const fireZoneLimit = point.height * MOBILE_FIRE_ZONE_HEIGHT_RATIO;

    if (point.y <= fireZoneLimit) {
      this.fireRequested = true;
      this.lastFireSource = 'touch';
      return;
    }

    this.dragState = {
      pointerId: event.pointerId,
      startX: point.x,
      currentX: point.x,
      canvasWidth: point.width,
    };
  };

  private onPointerMove = (event: PointerEvent): void => {
    if (!this.dragState || event.pointerId !== this.dragState.pointerId) {
      return;
    }

    const point = this.getLocalPoint(event);
    if (!point) return;

    this.dragState = {
      ...this.dragState,
      currentX: point.x,
    };
  };

  private onPointerUpOrCancel = (event: PointerEvent): void => {
    if (!this.dragState || event.pointerId !== this.dragState.pointerId) {
      return;
    }

    this.dragState = null;
  };

  public attach(canvas: HTMLCanvasElement): () => void {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);

    canvas.addEventListener('pointerdown', this.onPointerDown);
    canvas.addEventListener('pointermove', this.onPointerMove);
    canvas.addEventListener('pointerup', this.onPointerUpOrCancel);
    canvas.addEventListener('pointercancel', this.onPointerUpOrCancel);

    return () => {
      window.removeEventListener('keydown', this.onKeyDown);
      window.removeEventListener('keyup', this.onKeyUp);

      canvas.removeEventListener('pointerdown', this.onPointerDown);
      canvas.removeEventListener('pointermove', this.onPointerMove);
      canvas.removeEventListener('pointerup', this.onPointerUpOrCancel);
      canvas.removeEventListener('pointercancel', this.onPointerUpOrCancel);

      this.dragState = null;
      this.pressedKeys.clear();
      this.fireRequested = false;
      this.lastFireSource = 'none';
    };
  }

  public consumeIntents(): GameInputIntents {
    const keyboardMove =
      (this.pressedKeys.has('ArrowRight') ? 1 : 0) - (this.pressedKeys.has('ArrowLeft') ? 1 : 0);
    const touchMove = this.getTouchMoveAxis();
    const useTouch = this.dragState !== null;

    const moveAxis = clamp(useTouch ? touchMove : keyboardMove, -1, 1);
    const firePressed = this.fireRequested;
    this.fireRequested = false;

    const inputSource: InputSource = useTouch
      ? 'touch'
      : this.lastFireSource === 'touch'
        ? 'touch'
        : keyboardMove !== 0 || firePressed
          ? 'keyboard'
          : 'none';
    this.lastFireSource = 'none';

    if (moveAxis === 0 && !firePressed) {
      return EMPTY_INTENTS;
    }

    return {
      moveAxis,
      firePressed,
      inputSource,
    };
  }

  private getTouchMoveAxis(): number {
    if (!this.dragState) {
      return 0;
    }

    const dragDistance = this.dragState.currentX - this.dragState.startX;
    const dragThreshold = Math.max(1, this.dragState.canvasWidth * MOBILE_DRAG_SENSITIVITY_RATIO);

    return clamp(dragDistance / dragThreshold, -1, 1);
  }

  private getLocalPoint(
    event: PointerEvent,
  ): { x: number; y: number; width: number; height: number } | null {
    const target = event.currentTarget;
    if (!(target instanceof HTMLCanvasElement)) {
      return null;
    }

    const rect = target.getBoundingClientRect();
    const x = clamp(event.clientX - rect.left, 0, rect.width);
    const y = clamp(event.clientY - rect.top, 0, rect.height);

    return {
      x,
      y,
      width: rect.width,
      height: rect.height,
    };
  }
}

export const NO_INPUT_INTENTS: GameInputIntents = EMPTY_INTENTS;
