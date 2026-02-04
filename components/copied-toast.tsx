'use client';

interface CopiedToastProps {
  show: boolean;
}

export function CopiedToast({ show }: CopiedToastProps) {
  if (!show) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#22C55E] text-white px-5 py-3 rounded-xl shadow-lg shadow-[#22C55E]/20 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300 z-50">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      <span className="font-medium">Copied to clipboard</span>
    </div>
  );
}
