import { expect, afterEach, beforeAll, afterAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Setup MSW for tests
import { setupServer } from 'msw/node';
import handlers from './src/mocks/handlers';

export const server = setupServer(...handlers);

beforeAll(() => server.listen());

afterEach(() => {
  cleanup();
  server.resetHandlers();
});

afterAll(() => server.close());
