"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface RoomCodeInputProps {
  onJoin: (code: string) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export function RoomCodeInput({
  onJoin,
  onCancel,
  isLoading = false,
  error,
}: RoomCodeInputProps) {
  const { t } = useLanguage();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only accept alphanumeric
    const char = value.toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (char.length === 0) {
      // Backspace - clear and focus previous
      const newCode = [...code];
      newCode[index] = '';
      setCode(newCode);
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      return;
    }

    if (char.length === 1) {
      const newCode = [...code];
      newCode[index] = char;
      setCode(newCode);

      // Move to next input
      if (index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }

    // Handle paste of full code
    if (char.length === 6) {
      const chars = char.split('');
      setCode(chars);
      inputRefs.current[5]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && code[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (pasted.length === 6) {
      setCode(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = () => {
    const fullCode = code.join('');
    if (fullCode.length === 6) {
      onJoin(fullCode);
    }
  };

  const isComplete = code.every(c => c !== '');

  return (
    <div className="flex flex-col items-center gap-6 p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl border-2 border-gray-300 dark:border-gray-600 shadow-xl max-w-md w-full">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {t('multiplayer.joinPrivate') || 'Join Private Room'}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          {t('multiplayer.enterCode') || 'Enter the 6-character room code'}
        </p>
      </div>

      {/* Code inputs */}
      <div className="flex gap-2">
        {code.map((char, index) => (
          <input
            key={index}
            ref={el => { inputRefs.current[index] = el; }}
            type="text"
            maxLength={6}
            value={char}
            onChange={e => handleChange(index, e.target.value)}
            onKeyDown={e => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={isLoading}
            className={`w-12 h-14 text-center text-2xl font-mono font-bold rounded-lg border-2 transition-all
              ${char
                ? 'border-yellow-400 dark:border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30'
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
              }
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
              text-gray-900 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500
            `}
          />
        ))}
      </div>

      {/* Error message */}
      {error && (
        <div className="text-red-600 dark:text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 w-full">
        <Button
          variant="ghost"
          size="md"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          {t('common.cancel') || 'Cancel'}
        </Button>
        <Button
          variant="celo"
          size="md"
          onClick={handleSubmit}
          disabled={!isComplete || isLoading}
          className="flex-1"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
              {t('common.joining') || 'Joining...'}
            </span>
          ) : (
            t('multiplayer.join') || 'Join Room'
          )}
        </Button>
      </div>
    </div>
  );
}

export default RoomCodeInput;
