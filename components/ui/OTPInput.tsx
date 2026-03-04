'use client';

import { useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

export function OTPInput({
  length = 6,
  value,
  onChange,
  disabled,
}: {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const focusInput = useCallback((index: number) => {
    inputs.current[index]?.focus();
  }, []);

  function handleChange(index: number, char: string) {
    // Only allow digits
    if (char && !/^\d$/.test(char)) return;

    const next = value.split('');
    next[index] = char;
    const joined = next.join('').slice(0, length);
    onChange(joined);

    if (char && index < length - 1) {
      focusInput(index + 1);
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      focusInput(index - 1);
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (pasted) {
      onChange(pasted);
      focusInput(Math.min(pasted.length, length - 1));
    }
  }

  return (
    <div className="flex justify-center gap-2.5">
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={(el) => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          disabled={disabled}
          value={value[i] ?? ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={cn(
            'h-12 w-11 rounded-[var(--radius-card)] border border-border bg-transparent text-center font-body text-[20px] font-medium text-fg outline-none transition-colors focus:border-accent',
            disabled && 'opacity-50',
          )}
        />
      ))}
    </div>
  );
}
