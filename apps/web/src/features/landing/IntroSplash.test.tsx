import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '../../i18n';
import { INTRO_HOLD_MS, INTRO_LEAVE_MS, IntroSplash } from './IntroSplash';

describe('IntroSplash', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
    sessionStorage.clear();
    window.location.hash = '';
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('plays once, locks scrolling while it plays, then lifts away by itself', () => {
    render(<IntroSplash />);
    expect(screen.getByTestId('intro')).toBeInTheDocument();
    expect(document.documentElement.dataset.intro).toBe('playing');
    expect(document.documentElement.style.overflow).toBe('hidden');
    expect(sessionStorage.getItem('canadex.introSeen')).toBe('1');

    act(() => void vi.advanceTimersByTime(INTRO_HOLD_MS));
    expect(document.documentElement.dataset.intro).toBe('leaving');

    act(() => void vi.advanceTimersByTime(INTRO_LEAVE_MS));
    expect(screen.queryByTestId('intro')).not.toBeInTheDocument();
    expect(document.documentElement.dataset.intro).toBeUndefined();
    expect(document.documentElement.style.overflow).toBe('');
  });

  it('can be skipped with the button or the Escape key', () => {
    const { unmount } = render(<IntroSplash />);
    fireEvent.click(screen.getByRole('button', { name: 'Skip intro' }));
    expect(document.documentElement.dataset.intro).toBe('leaving');
    unmount();

    sessionStorage.clear();
    render(<IntroSplash />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(document.documentElement.dataset.intro).toBe('leaving');
  });

  it('does not play again in the same session or on deep links', () => {
    sessionStorage.setItem('canadex.introSeen', '1');
    const { unmount } = render(<IntroSplash />);
    expect(screen.queryByTestId('intro')).not.toBeInTheDocument();
    unmount();

    sessionStorage.clear();
    window.location.hash = '#booking';
    render(<IntroSplash />);
    expect(screen.queryByTestId('intro')).not.toBeInTheDocument();
  });
});
