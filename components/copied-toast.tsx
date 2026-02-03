'use client';

interface CopiedToastProps {
  show: boolean;
}

export function CopiedToast({ show }: CopiedToastProps) {
  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300 z-50">
      ✓ Copied to clipboard
    </div>
  );
}
