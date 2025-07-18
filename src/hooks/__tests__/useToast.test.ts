import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToast } from '@/components/ui/use-toast';

describe('useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('creates and manages toasts', () => {
    const { result } = renderHook(() => useToast());

    expect(result.current.toasts).toEqual([]);

    act(() => {
      result.current.toast({
        title: 'Test Toast',
        description: 'Test Description',
      });
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      title: 'Test Toast',
      description: 'Test Description',
      id: expect.any(String),
    });
  });

  it('automatically removes toasts after 5 seconds', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: 'Auto Remove Toast',
      });
    });

    expect(result.current.toasts).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it('handles multiple toasts', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({ title: 'Toast 1' });
      result.current.toast({ title: 'Toast 2' });
      result.current.toast({ title: 'Toast 3' });
    });

    expect(result.current.toasts).toHaveLength(3);
    expect(result.current.toasts.map(t => t.title)).toEqual(['Toast 1', 'Toast 2', 'Toast 3']);
  });

  it('removes toasts independently', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({ title: 'Toast 1' });
    });

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    act(() => {
      result.current.toast({ title: 'Toast 2' });
    });

    // Advance by 3 more seconds (total 5 for first toast)
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe('Toast 2');
  });

  it('supports different variants', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: 'Error Toast',
        description: 'Something went wrong',
        variant: 'destructive',
      });
    });

    expect(result.current.toasts[0]).toMatchObject({
      title: 'Error Toast',
      description: 'Something went wrong',
      variant: 'destructive',
    });
  });

  it('logs toast information to console', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: 'Console Test',
        description: 'Should be logged',
      });
    });

    expect(consoleSpy).toHaveBeenCalledWith('Toast:', 'Console Test', 'Should be logged');
  });

  it('generates unique IDs for each toast', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({ title: 'Toast 1' });
      result.current.toast({ title: 'Toast 2' });
    });

    const ids = result.current.toasts.map(t => t.id);
    expect(ids[0]).not.toBe(ids[1]);
    expect(ids[0]).toMatch(/^[a-z0-9]{9}$/);
    expect(ids[1]).toMatch(/^[a-z0-9]{9}$/);
  });
});