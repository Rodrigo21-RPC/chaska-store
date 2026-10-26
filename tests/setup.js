import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import { JSDOM } from 'jsdom';
Object.defineProperty(globalThis, 'localStorage', { value: new JSDOM('', { url: 'http://localhost' }).window.localStorage, configurable: true });
afterEach(() => { cleanup(); localStorage.clear(); });
