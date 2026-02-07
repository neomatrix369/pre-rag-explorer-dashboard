
import React, { useState, useEffect } from 'react';
import { UploadedFile, ChunkingMethod, ChunkParams, ProcessingStatus } from '../../types';
import { CHUNKING_METHOD_LABELS, Icons } from '../../constants';
import ErrorDisplay from '../layout/ErrorDisplay';
import CopyButton from '../common/CopyButton';

interface ProcessSectionProps {
  files: UploadedFile[];
  onProcess: (fileIds: string[], methods: ChunkingMethod[], params: Record<ChunkingMethod, ChunkParams>) => void;
  loading: boolean;
  processingStatus: ProcessingStatus[];
}

const ProcessSection: React.FC<ProcessSectionProps> = ({ files, onProcess, loading, processingStatus }) => {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  
  // Persisted State: Methods
  const [selectedMethods, setSelectedMethods] = useState<ChunkingMethod[]>(() => {
    const saved = localStorage.getItem('rag_process_methods');
    return saved ? JSON.parse(saved) : [ChunkingMethod.RECURSIVE];
  });

  // Persisted State: Params
  const [params, setParams] = useState<Record<ChunkingMethod, ChunkParams>>(() => {
    const saved = localStorage.getItem('rag_process_params');
    return saved ? JSON.parse(saved) : {
      [ChunkingMethod.FIXED]: { chunkSize: 1000, overlap: 200 },
      [ChunkingMethod.RECURSIVE]: { chunkSize: 1000, overlap: 200 },
      [ChunkingMethod.TOKEN]: { tokenCount: 256, overlap: 50 },
      [ChunkingMethod.SENTENCE]: { sentenceCount: 5, overlap: 1 },
      [ChunkingMethod.SEMANTIC]: { similarityThreshold: 0.5 }
    };
  });

  // Save preferences on change
  useEffect(() => {
    localStorage.setItem('rag_process_methods', JSON.stringify(selectedMethods));
  }, [selectedMethods]);

  useEffect(() => {
    localStorage.setItem('rag_process_params', JSON.stringify(params));
  }, [params]);

  const toggleFile = (id: string) => {
    setSelectedFiles(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleMethod = (method: ChunkingMethod) => {
    setSelectedMethods(prev => prev.includes(method) ? prev.filter(x => x !== method) : [...prev, method]);
  };

  // Bulk Actions
  const handleSelectAllFiles = () => setSelectedFiles(files.map(f => f.id));
  const handleClearAllFiles = () => setSelectedFiles([]);

  const handleSelectAllMethods = () => setSelectedMethods(Object.values(ChunkingMethod));
  const handleClearAllMethods = () => setSelectedMethods([]);

  const handleStart = () => {
    if (selectedFiles.length === 0) return alert("Select at least one file.");
    if (selectedMethods.length === 0) return alert("Select at least one chunking method.");
    onProcess(selectedFiles, selectedMethods, params);
  };

  if (files.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icons.Cog />
        </div>
        <h3 className="text-lg font-bold text-slate-900">No files uploaded yet</h3>
        <p className="text-slate-500">Go back to the Load Data step to add some files.</p>
      </div>
    );
  }

  const isFinished = processingStatus.length > 0 && processingStatus.every(s => s.status === 'finished' || s.status === 'error');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Chunk & Vectorize</h2>
        <p className="text-slate-500">Transform your raw text into searchable vectors. Choose your Chunking Method wisely—it affects context retrieval.</p>
      </header>

      {processingStatus.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Processing Queue</h3>
            {isFinished && (
               <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded uppercase">Batch Complete</span>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4">
            {processingStatus.map((task) => (
              <div key={task.taskId} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm overflow-hidden flex flex-col transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 truncate">{task.fileName}</p>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-tighter">{CHUNKING_METHOD_LABELS[task.method]}</p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    {task.status === 'chunking' && <span className="text-[10px] text-blue-600 font-bold animate-pulse uppercase">Chunking...</span>}
                    {task.status === 'vectorizing' && <span className="text-[10px] text-indigo-600 font-bold animate-pulse uppercase">Vectorizing...</span>}
                    {task.status === 'finished' && <span className="text-[10px] text-green-600 font-bold uppercase flex items-center gap-1">Success <span className="text-xs">✓</span></span>}
                    {task.status === 'waiting' && <span className="text-[10px] text-slate-400 font-bold uppercase">Queued</span>}
                    {task.status === 'error' && <span className="text-[10px] text-red-600 font-bold uppercase">Failed</span>}
                  </div>
                </div>
                
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      task.status === 'finished' ? 'bg-green-500' : 
                      task.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${task.progress}%` }}
                  />
                </div>

                {task.sampleChunks && task.sampleChunks.length > 0 && (
                  <div className="mt-2 bg-slate-50 border border-slate-100 rounded-lg p-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Chunk Samples</p>
                    <div className="space-y-2">
                      {task.sampleChunks.map((chunk, idx) => (
                        <div key={idx} className="bg-white p-2 rounded border border-slate-200 text-xs text-slate-600 font-mono relative group">
                          <p className="line-clamp-2 leading-relaxed">"{chunk}"</p>
                          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <CopyButton text={chunk} iconOnly />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {task.error && (
                  <div className="mt-4">
                    <ErrorDisplay error={task.error} inline />
                  </div>
                )}
              </div>
            ))}
          </div>
          {!loading && isFinished && (
            <div className="flex justify-center mt-6">
              <p className="text-sm text-slate-500 italic">All items processed. You can now head to the Search section to explore results.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded text-xs flex items-center justify-center font-bold">1</span>
                Select Documents
              </h3>
              <div className="flex gap-2">
                 <button onClick={handleSelectAllFiles} className="text-[10px] font-bold text-blue-600 uppercase hover:text-blue-800 transition-colors">Select All</button>
                 <span className="text-slate-300">|</span>
                 <button onClick={handleClearAllFiles} className="text-[10px] font-bold text-slate-400 uppercase hover:text-slate-600 transition-colors">Clear All</button>
              </div>
            </div>
            
            <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
              {files.map(file => (
                <label key={file.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedFiles.includes(file.id) ? 'bg-blue-50 border-blue-200' : 'hover:bg-slate-50 border-slate-100'}`}>
                  <input 
                    type="checkbox" 
                    checked={selectedFiles.includes(file.id)} 
                    onChange={() => toggleFile(file.id)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 truncate">{file.name}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-tighter">{file.type} • {(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </label>
              ))}
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded text-xs flex items-center justify-center font-bold">2</span>
                  Chunking Methods
                </h3>
                <div className="flex gap-2">
                   <button onClick={handleSelectAllMethods} className="text-[10px] font-bold text-blue-600 uppercase hover:text-blue-800 transition-colors">Select All</button>
                   <span className="text-slate-300">|</span>
                   <button onClick={handleClearAllMethods} className="text-[10px] font-bold text-slate-400 uppercase hover:text-slate-600 transition-colors">Clear All</button>
                </div>
             </div>

            <div className="space-y-2">
              {(Object.values(ChunkingMethod) as ChunkingMethod[]).map(method => (
                <div key={method} className={`p-4 rounded-xl border transition-all ${selectedMethods.includes(method) ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100'}`}>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={selectedMethods.includes(method)} 
                      onChange={() => toggleMethod(method)}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900">{CHUNKING_METHOD_LABELS[method]}</p>
                      <p className="text-xs text-slate-500">
                        {method === 'recursive' && 'Standard NLP splitting on boundaries.'}
                        {method === 'fixed' && 'Simple window-based character splitting.'}
                        {method === 'token' && 'Approximates token boundaries (LLM-friendly).'}
                        {method === 'sentence' && 'Splits by semantic sentences.'}
                        {method === 'semantic' && 'Group paragraphs by logical structure.'}
                      </p>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {processingStatus.length === 0 && (
        <div className="flex justify-center pt-4">
          <button 
            onClick={handleStart}
            disabled={loading || selectedFiles.length === 0 || selectedMethods.length === 0}
            className={`px-10 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:scale-105 transition-all flex items-center gap-3 disabled:opacity-50 disabled:hover:scale-100`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                Initializing...
              </>
            ) : (
              <>
                <Icons.Cog />
                Start Vectorization Pipeline
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProcessSection;
