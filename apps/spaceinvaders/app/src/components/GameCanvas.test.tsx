import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GameCanvas } from './GameCanvas';

describe('GameCanvas', () => {
  it('mounts and unmounts without throwing', () => {
    const view = render(<GameCanvas />);

    expect(view.getByLabelText('SpaceInvaders game canvas')).toBeInTheDocument();

    expect(() => view.unmount()).not.toThrow();
  });
});
