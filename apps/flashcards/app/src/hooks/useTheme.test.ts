import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from './useTheme';

describe('useTheme', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => null),
      setItem: vi.fn(() => {}),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('loads 17 themes including africa', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.themes).toHaveLength(17);
    expect(result.current.themes[0].id).toBe('africa');
  });

  it('returns first theme as current theme when none selected', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.currentTheme).not.toBeNull();
    expect(result.current.currentTheme?.id).toBe('africa');
  });

  it('provides theme selection method', () => {
    const { result } = renderHook(() => useTheme());
    expect(typeof result.current.selectTheme).toBe('function');
  });

  it('selects theme by id', () => {
    const { result } = renderHook(() => useTheme());
    act(() => {
      result.current.selectTheme('africa');
    });
    expect(result.current.selectedThemeId).toBe('africa');
  });

  it('persists selected theme to localStorage', () => {
    const { result } = renderHook(() => useTheme());
    act(() => {
      result.current.selectTheme('africa');
    });
    expect(window.localStorage.setItem).toHaveBeenCalledWith('flashcards-selected-theme', 'africa');
  });

  it('restores selected theme from localStorage on init', () => {
    window.localStorage.getItem = vi.fn(() => 'africa');
    const { result } = renderHook(() => useTheme());
    expect(result.current.selectedThemeId).toBe('africa');
  });

  it('falls back to africa when world-capitals stored in localStorage', () => {
    window.localStorage.getItem = vi.fn(() => 'world-capitals');
    const { result } = renderHook(() => useTheme());
    expect(result.current.currentTheme).toBeNull();
  });

  it('returns null currentTheme when invalid theme id stored', () => {
    window.localStorage.getItem = vi.fn(() => 'non-existent-theme');
    const { result } = renderHook(() => useTheme());
    expect(result.current.currentTheme).toBeNull();
  });
});
