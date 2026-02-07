
import React, { useState, useEffect } from 'react';
import { Icons } from '../../constants';

interface GuidanceBalloonProps {
  filesCount: number;
  collectionsCount: number;
  activeView: string;
  isProcessing: boolean;
  onNavigate: (view: string) => void;
}

const GuidanceBalloon: React.FC<GuidanceBalloonProps> = ({ 
  filesCount, 
  collectionsCount, 
  activeView, 
  isProcessing,
  onNavigate 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  // Logic to determine the current Pre-RAG stage
  const getStage = () => {
    if (filesCount === 0) return { 
      step: 1, 
      title: 'Load Data', 
      text: 'Your Pre-RAG pipeline needs fuel. Start by uploading some documents.', 
      action: 'Upload Files', 
      view: 'upload',
      color: 'blue'
    };
    if (collectionsCount === 0) return { 
      step: 2, 
      title: 'Chunk & Vectorize', 
      text: 'Documents parsed! Now we need to slice them and create embeddings.', 
      action: 'Go to Process', 
      view: 'process',
      color: 'indigo'
    };
    if (isProcessing) return {
      step: 2,
      title: 'Processing...',
      text: 'Vectorization is in progress. We are building your knowledge base.',
      action: 'View Progress',
      view: 'process',
      color: 'amber'
    };
    return { 
      step: 3, 
      title: 'Ready to Search', 
      text: 'The brain is ready. Ask questions to retrieve semantic matches.', 
      action: 'Search Content', 
      view: 'search',
      color: 'green'
    };
  };

  const stage = getStage();

  // Pulse when the step changes
  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => setIsExpanded(true), 1000);
    const collapseTimer = setTimeout(() => setIsExpanded(false), 8000);
    return () => {
      clearTimeout(timer);
      clearTimeout(collapseTimer);
    };
  }, [stage.step, activeView]);

  if (!isVisible) return (
    <button 
      onClick={() => setIsVisible(true)}
      className="fixed bottom-8 right-8 w-12 h-12 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-50 border border-slate-700"
    >
      <span className="text-lg font-bold">?</span>
    </button>
  );

  const steps = [
    { id: 'upload', icon: '1' },
    { id: 'process', icon: '2' },
    { id: 'search', icon: '3' }
  ];

  return (
    <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-right-12 fade-in duration-500 max-w-[320px] w-full">
      <div className={`
        bg-slate-900/90 backdrop-blur-xl text-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] 
        border border-slate-700 p-5 pr-10 relative overflow-hidden transition-all duration-500
        ${stage.color === 'blue' ? 'ring-2 ring-blue-500/20' : ''}
        ${stage.color === 'indigo' ? 'ring-2 ring-indigo-500/20' : ''}
        ${stage.color === 'amber' ? 'ring-2 ring-amber-500/20' : ''}
        ${stage.color === 'green' ? 'ring-2 ring-green-500/20' : ''}
      `}>
        {/* Background Glow Effect */}
        <div className={`absolute -top-12 -right-12 w-32 h-32 blur-3xl rounded-full opacity-20 pointer-events-none
          ${stage.color === 'blue' ? 'bg-blue-500' : ''}
          ${stage.color === 'indigo' ? 'bg-indigo-500' : ''}
          ${stage.color === 'amber' ? 'bg-amber-500' : ''}
          ${stage.color === 'green' ? 'bg-green-500' : ''}
        `} />

        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 p-1 text-slate-500 hover:text-white transition-colors z-10"
        >
          <span className="text-xs">✕</span>
        </button>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className={`
              w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-black text-lg shadow-lg
              ${stage.color === 'blue' ? 'bg-blue-600' : ''}
              ${stage.color === 'indigo' ? 'bg-indigo-600' : ''}
              ${stage.color === 'amber' ? 'bg-amber-600 animate-pulse' : ''}
              ${stage.color === 'green' ? 'bg-green-600' : ''}
            `}>
              {isProcessing ? '⚙️' : stage.step}
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Next Objective</p>
              <h4 className="font-bold text-white text-sm">{stage.title}</h4>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              {stage.text}
            </p>

            {/* Journey Tracker Dots */}
            <div className="flex items-center gap-2 py-1">
              {steps.map((s, idx) => {
                const isPast = (idx + 1) < stage.step;
                const isCurrent = (idx + 1) === stage.step;
                return (
                  <React.Fragment key={s.id}>
                    <div className={`
                      w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border
                      ${isPast ? 'bg-green-500 border-green-400 text-white' : ''}
                      ${isCurrent ? 'bg-white border-white text-slate-900 shadow-sm' : ''}
                      ${(!isPast && !isCurrent) ? 'bg-slate-800 border-slate-700 text-slate-500' : ''}
                    `}>
                      {isPast ? '✓' : s.icon}
                    </div>
                    {idx < steps.length - 1 && (
                      <div className={`h-[1px] w-4 ${isPast ? 'bg-green-500' : 'bg-slate-800'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {stage.action && (
              <button 
                onClick={() => onNavigate(stage.view!)}
                className={`
                  w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300
                  flex items-center justify-center gap-2 group
                  ${stage.color === 'blue' ? 'bg-blue-600 hover:bg-blue-500 shadow-[0_10px_20px_rgba(37,99,235,0.3)]' : ''}
                  ${stage.color === 'indigo' ? 'bg-indigo-600 hover:bg-indigo-500 shadow-[0_10px_20px_rgba(79,70,229,0.3)]' : ''}
                  ${stage.color === 'amber' ? 'bg-amber-600 hover:bg-amber-500 shadow-[0_10px_20px_rgba(217,119,6,0.3)]' : ''}
                  ${stage.color === 'green' ? 'bg-green-600 hover:bg-green-500 shadow-[0_10px_20px_rgba(22,163,74,0.3)]' : ''}
                `}
              >
                {stage.action}
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidanceBalloon;
