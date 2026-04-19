import React, { useState } from 'react';
import { ErrorInfo } from '../../types';
import CopyButton from '../common/CopyButton';

interface ErrorDisplayProps {
  error: ErrorInfo;
  onClear?: () => void;
  inline?: boolean;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onClear, inline }) => {
  const [showTechnical, setShowTechnical] = useState(false);

  return (
    <div
      className={`
      bg-red-50 border border-red-200 rounded-2xl overflow-hidden shadow-sm animate-in fade-in zoom-in duration-300
      ${inline ? 'mt-2' : 'mb-6'}
    `}
    >
      <div className="p-4 flex items-start gap-3">
        <div className="mt-0.5 shrink-0 text-red-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-start gap-2">
            <h4 className="text-sm font-bold text-red-900 leading-tight mb-1">{error.message}</h4>
            <CopyButton
              text={error.message}
              iconOnly
              className="text-red-400 hover:text-red-600 p-1"
            />
          </div>

          {error.technical && (
            <div className="mt-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowTechnical(!showTechnical)}
                  className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors flex items-center gap-1"
                >
                  {showTechnical ? 'Hide Technical Details' : 'Show Technical Details'}
                  <span
                    className={`transform transition-transform ${showTechnical ? 'rotate-180' : ''}`}
                  >
                    ▼
                  </span>
                </button>
                {showTechnical && (
                  <CopyButton
                    text={error.technical}
                    label="Copy Stack Trace"
                    className="text-red-400 hover:text-red-600"
                  />
                )}
              </div>

              {showTechnical && (
                <div className="mt-2 p-3 bg-red-100/50 rounded-xl border border-red-200/50 overflow-x-auto">
                  <pre className="text-[10px] text-red-800 font-mono leading-relaxed whitespace-pre-wrap">
                    {error.technical}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {onClear && (
          <button
            onClick={onClear}
            className="p-1 text-red-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorDisplay;
