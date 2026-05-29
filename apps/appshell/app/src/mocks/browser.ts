import { setupWorker } from 'msw/browser';
import { handlers } from '../api/mocks';

export const worker = setupWorker(...handlers);
