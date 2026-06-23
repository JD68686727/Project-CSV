import type { ReactNode } from 'react';
import type { Theme } from '@/types/theme';
import { cn } from '@/utils/cn';

const iconProps = {
  className: 'h-4 w-4',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const SunIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" {...iconProps}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

const MonitorIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" {...iconProps}>
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8M12 17v4" />
  </svg>
);

const MoonIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" {...iconProps}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);

const OPTIONS: { value: Theme; label: string; icon: ReactNode }[] = [
  { value: 'light', label: 'Light', icon: SunIcon },
  { value: 'system', label: 'System', icon: MonitorIcon },
  { value: 'dark', label: 'Dark', icon: MoonIcon },
];

export interface ThemeToggleProps {
  theme: Theme;
  onChange: (theme: Theme) => void;
}

export function ThemeToggle({ theme, onChange }: ThemeToggleProps) {
  return (
    <div
      role="group"
      aria-label="Theme"
      className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-900"
    >
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={theme === option.value}
          aria-label={option.label}
          title={option.label}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
            theme === option.value
              ? 'bg-slate-100 text-brand-600 dark:bg-slate-800 dark:text-brand-400'
              : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300',
          )}
        >
          {option.icon}
        </button>
      ))}
    </div>
  );
}
