import React, { KeyboardEvent } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { DEFAULT_BOT } from '../config';

interface MessageInputProps {
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  onSendMessage?: (content: string, botName: string) => void;
  isFixed?: boolean; // Controls whether the input is fixed at the bottom of the screen
  onStop?: () => void; // Callback for stopping message generation
}

export default function MessageInput({
  message,
  setMessage,
  isLoading,
  handleSubmit,
  onSendMessage,
  isFixed = true, // Default to fixed position for backward compatibility
  onStop
}: MessageInputProps) {
  const { isDarkMode } = useTheme();

  // Handle Enter key to send message (without Shift key)
  // Skip if in IME composition mode (for languages like Chinese, Japanese, etc.)
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      if (message.trim()) {
        onSubmit(e as unknown as React.FormEvent);
      }
    }
  };

  // If onSendMessage is provided, use it instead of the default handleSubmit
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      return;
    }

    if (onSendMessage) {
      onSendMessage(message, DEFAULT_BOT.name);
      setMessage('');
      return;
    }

    // Otherwise use the provided handleSubmit
    handleSubmit(e);
  };


  return (
    <div className={`${isFixed ? 'fixed bottom-0 left-0 right-0' : ''} flex justify-center mx-auto px-4 py-4 sm:w-[60%] 2xl:w-[50%] max-w-3xl`}>
      <form onSubmit={onSubmit} className="w-full">
        <div className={`relative flex items-center rounded-2xl shadow-lg ${
          isDarkMode ? 'text-white bg-gray-800 border border-gray-700' : 'text-gray-800 bg-white border border-gray-200'
        }`}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={isLoading}
            className={`flex-1 rounded-2xl py-4 pl-6 pr-16 ${
              isDarkMode
                ? 'bg-gray-800 text-gray-200 placeholder-gray-500'
                : 'bg-white text-gray-700 placeholder-gray-400'
            } focus:outline-none appearance-none ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
            style={{
              WebkitAppearance: 'none',
              MozAppearance: 'none',
              appearance: 'none',
              resize: 'none', // Disable resize handle
              minHeight: '60px' // Set minimum height
            }}
            rows={2}
            spellCheck="false"
            autoComplete="off"
          />

          <div className="absolute right-2 flex items-center">
            <button
              type={isLoading ? 'button' : 'submit'}
              onClick={isLoading && onStop ? onStop : undefined}
              disabled={!isLoading && !message.trim()}
              className={`rounded-full p-2 ${
                !isLoading && !message.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : isLoading
                    ? 'bg-gray-500 hover:bg-gray-600'
                    : 'bg-[#4285f4] hover:bg-blue-600'
              } text-white focus:outline-none`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center w-6 h-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <rect x="5" y="5" width="10" height="10" />
                  </svg>
                </span>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L11 6.414V16a1 1 0 11-2 0V6.414L7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
