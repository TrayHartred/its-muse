'use client';

import { useRef, useEffect, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Theme } from '@/hooks/use-theme';

interface InputPanelProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
  theme?: Theme;
}

interface InitStatus {
  status: 'loading' | 'ready' | 'error';
  message: string;
  model?: string;
}

export function InputPanel({ onSubmit, isLoading, theme = 'dark' }: InputPanelProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [initStatus, setInitStatus] = useState<InitStatus>({
    status: 'loading',
    message: 'Initializing SAL∴PAA...',
  });
  const [isGeneratingExample, setIsGeneratingExample] = useState(false);

  // Initialize system on mount
  useEffect(() => {
    async function initSystem() {
      try {
        const response = await fetch('/api/init');
        const data = await response.json();

        if (data.status === 'ready') {
          setInitStatus({
            status: 'ready',
            message: data.message,
            model: data.model,
          });
        } else {
          setInitStatus({
            status: 'error',
            message: data.error || 'Initialization failed',
          });
        }
      } catch {
        setInitStatus({
          status: 'error',
          message: 'Failed to connect to Grok API',
        });
      }
    }

    initSystem();
  }, []);

  const [text, setText] = useState('');

  const handleAnalyze = () => {
    if (text.trim() && !isLoading && initStatus.status === 'ready') {
      onSubmit(text.trim());
    }
  };

  // Focus textarea on mount
  useEffect(() => {
    if (initStatus.status === 'ready') {
      textareaRef.current?.focus();
    }
  }, [initStatus.status]);

  const handleExampleClick = async () => {
    if (isLoading || initStatus.status !== 'ready' || isGeneratingExample) return;

    setIsGeneratingExample(true);
    setText('');

    try {
      const response = await fetch('/api/example');
      const data = await response.json();

      if (data.error) {
        console.error('Example generation error:', data.error);
        setText('Experts agree you must act now before it\'s too late! The shocking truth they don\'t want you to know is finally coming to light.');
      } else {
        setText(data.text);
      }
    } catch (error) {
      console.error('Failed to fetch example:', error);
      setText('Experts agree you must act now before it\'s too late! The shocking truth they don\'t want you to know is finally coming to light.');
    } finally {
      setIsGeneratingExample(false);
    }
  };

  // Theme colors
  const colors = {
    text: theme === 'dark' ? '#E4E4E7' : '#1A1A1D',
    textSecondary: theme === 'dark' ? '#A1A1AA' : '#52525B',
    textMuted: theme === 'dark' ? '#6B6B70' : '#A1A1AA',
    card: theme === 'dark' ? 'rgba(17,17,19,0.9)' : 'rgba(255,255,255,0.9)',
    cardBorder: theme === 'dark' ? '#1F1F23' : '#E5E5E0',
    input: theme === 'dark' ? '#0A0A0B' : '#FAFAF8',
    inputBorder: theme === 'dark' ? '#2A2A2E' : '#E0E0DB',
    inputText: theme === 'dark' ? '#FFFFFF' : '#1A1A1D',
    placeholder: theme === 'dark' ? '#71717A' : '#71717A',
    buttonHover: theme === 'dark' ? '#1A1A1D' : '#F0F0EB',
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen min-h-[100dvh] px-4 pt-6 pb-20">
      <div className="flex flex-col items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <h1
            className="text-4xl font-bold tracking-wider font-mono"
            style={{ color: colors.text }}
          >
            Muse
          </h1>
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5C00] shadow-[0_0_12px_rgba(255,92,0,0.6)]" />
          <span
            className="text-4xl font-light"
            style={{ color: colors.textMuted }}
          >
            Filter
          </span>
        </div>
        <p
          className="text-lg text-center max-w-md"
          style={{ color: colors.textSecondary }}
        >
          Detect manipulation tactics in any text and get a clean, neutral version
        </p>
      </div>

      {/* Init Status Banner */}
      <div className={`px-4 py-2 rounded-full text-sm flex items-center gap-2 ${
        initStatus.status === 'loading'
          ? 'bg-blue-500/10 text-blue-500'
          : initStatus.status === 'ready'
          ? 'bg-[#22C55E]/10 text-[#22C55E]'
          : 'bg-red-500/10 text-red-500'
      }`}>
        {initStatus.status === 'loading' && (
          <>
            <span className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" />
            {initStatus.message}
          </>
        )}
        {initStatus.status === 'ready' && (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            {initStatus.message}
          </>
        )}
        {initStatus.status === 'error' && (
          <span>✗ {initStatus.message}</span>
        )}
      </div>

      <div
        className="w-full max-w-2xl mt-6 backdrop-blur-sm rounded-2xl transition-colors duration-300"
        style={{
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.cardBorder,
          padding: '15px',
        }}
      >
        <Textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={initStatus.status === 'ready' ? 'Paste text to analyze for manipulation tactics...' : 'Waiting for system...'}
          className="min-h-[200px] resize-none text-[15px] rounded-xl transition-colors duration-300"
          style={{
            backgroundColor: colors.input,
            borderColor: colors.inputBorder,
            color: colors.inputText,
            paddingTop: '14px',
            paddingBottom: '14px',
            paddingLeft: '14px',
            paddingRight: '14px',
          }}
          disabled={isLoading || initStatus.status !== 'ready'}
        />

        <button
          onClick={handleAnalyze}
          disabled={isLoading || initStatus.status !== 'ready' || !text.trim()}
          className="w-full h-12 bg-gradient-to-br from-[#FF5C00] to-[#FF8A4C] hover:from-[#FF6A1A] hover:to-[#FF9A5C] text-white font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
          style={{ marginTop: '15px' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-[15px]">Analyze</span>
        </button>
      </div>

      <button
        onClick={handleExampleClick}
        disabled={isLoading || initStatus.status !== 'ready' || isGeneratingExample}
        className="mt-5 px-4 py-2.5 text-[14px] rounded-lg transition-all disabled:opacity-70 cursor-pointer flex items-center justify-center gap-2 min-w-[160px]"
        style={{
          color: colors.textSecondary,
          backgroundColor: colors.buttonHover,
          borderWidth: 1,
          borderColor: colors.cardBorder,
        }}
        onMouseEnter={(e) => {
          if (!isGeneratingExample) {
            e.currentTarget.style.backgroundColor = theme === 'dark' ? '#27272A' : '#E5E5E0';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = colors.buttonHover;
        }}
      >
        {isGeneratingExample ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Generating...</span>
          </>
        ) : (
          <span>Generate example →</span>
        )}
      </button>
    </div>
  );
}
