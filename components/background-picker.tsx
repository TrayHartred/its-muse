'use client';

import { BackgroundType } from './ambient-background';

interface BackgroundPickerProps {
  current: BackgroundType;
  onChange: (type: BackgroundType) => void;
}

const backgrounds: { type: BackgroundType; label: string; color: string }[] = [
  { type: 'none', label: 'Off', color: '#6B6B70' },
  { type: 'swirl', label: 'Swirl', color: '#8B5CF6' },
  { type: 'aurora', label: 'Aurora', color: '#22C55E' },
  { type: 'pipeline', label: 'Pipeline', color: '#06B6D4' },
];

export function BackgroundPicker({ current, onChange }: BackgroundPickerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-1 p-1 bg-[#111113]/90 backdrop-blur-sm border border-[#2A2A2E] rounded-lg">
      {backgrounds.map(({ type, label, color }) => (
        <button
          key={type}
          onClick={() => onChange(type)}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all
            ${current === type
              ? 'bg-[#1F1F23] text-white'
              : 'text-[#6B6B70] hover:text-[#ADADB0] hover:bg-[#1A1A1D]'
            }
          `}
          title={label}
        >
          <span
            className={`w-2 h-2 rounded-full transition-all ${current === type ? 'scale-110' : 'opacity-50'}`}
            style={{ backgroundColor: color }}
          />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
