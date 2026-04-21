import React, { useState, useEffect } from 'react';
import { UploadedFile, ChunkingMethod, ChunkParams, ProcessingStatus } from '../../types';
import { CHUNKING_METHOD_LABELS, Icons, MODEL_REGISTRY, DEFAULT_MODEL_ID } from '../../constants';
import ErrorDisplay from '../layout/ErrorDisplay';
import CopyButton from '../common/CopyButton';

interface ProcessSectionProps {
  files: UploadedFile[];
  onProcess: (
    fileIds: string[],
    methods: ChunkingMethod[],
    params: Record<ChunkingMethod, ChunkParams>,
    modelId: string
  ) => void;
  loading: boolean;
  processingStatus: ProcessingStatus[];
}

const ProcessSection: React.FC<ProcessSectionProps> = ({
  files,
  onProcess,
  loading,
  processingStatus,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  // Persisted State: Selected Model
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    const saved = localStorage.getItem('rag_selected_model');
    return saved || DEFAULT_MODEL_ID;
  });

  // Persisted State: Methods
  const [selectedMethods, setSelectedMethods] = useState<ChunkingMethod[]>(() => {
    const saved = localStorage.getItem('rag_process_methods');
    return saved ? JSON.parse(saved) : [ChunkingMethod.RECURSIVE];
  });

  // Persisted State: Params
  const [params, setParams] = useState<Record<ChunkingMethod, ChunkParams>>(() => {
    const saved = localStorage.getItem('rag_process_params');
    return saved
      ? JSON.parse(saved)
      : {
          [ChunkingMethod.FIXED]: { chunkSize: 1000, overlap: 200 },
          [ChunkingMethod.RECURSIVE]: { chunkSize: 1000, overlap: 200 },
          [ChunkingMethod.TOKEN]: { tokenCount: 256, overlap: 50 },
          [ChunkingMethod.SENTENCE]: { sentenceCount: 5, overlap: 1 },
          [ChunkingMethod.SEMANTIC]: { similarityThreshold: 0.5 },
        };
  });

  // Save preferences on change
  useEffect(() => {
    localStorage.setItem('rag_selected_model', selectedModel);
  }, [selectedModel]);

  useEffect(() => {
    localStorage.setItem('rag_process_methods', JSON.stringify(selectedMethods));
  }, [selectedMethods]);

  useEffect(() => {
    localStorage.setItem('rag_process_params', JSON.stringify(params));
  }, [params]);

  const toggleFile = (id: string) => {
    setSelectedFiles((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleMethod = (method: ChunkingMethod) => {
    setSelectedMethods((prev) =>
      prev.includes(method) ? prev.filter((x) => x !== method) : [...prev, method]
    );
  };

  const updateParam = (method: ChunkingMethod, key: keyof ChunkParams, value: number) => {
    // eslint-disable-next-line security/detect-object-injection -- Safe: method is ChunkingMethod enum, key is ChunkParams property
    setParams((prev) => ({ ...prev, [method]: { ...prev[method], [key]: value } }));
  };

  // Bulk Actions
  const handleSelectAllFiles = () => setSelectedFiles(files.map((f) => f.id));
  const handleClearAllFiles = () => setSelectedFiles([]);

  const handleSelectAllMethods = () => setSelectedMethods(Object.values(ChunkingMethod));
  const handleClearAllMethods = () => setSelectedMethods([]);

  const handleStart = () => {
    if (selectedFiles.length === 0) return alert('Select at least one file.');
    if (selectedMethods.length === 0) return alert('Select at least one chunking method.');
    onProcess(selectedFiles, selectedMethods, params, selectedModel);
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

  const isFinished =
    processingStatus.length > 0 &&
    processingStatus.every((s) => s.status === 'finished' || s.status === 'error');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Chunk & Vectorize</h2>
        <p className="text-slate-500">
          Transform your raw text into searchable vectors. Choose your Chunking Method wisely—it
          affects context retrieval.
        </p>
      </header>

      {/* Embedding Model Selector */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-white rounded-lg shadow-sm text-indigo-600 shrink-0">
            <Icons.Database />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-indigo-900 mb-2">Embedding Model</h4>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
            >
              {Object.values(MODEL_REGISTRY).map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} — {model.dimensions}d, ~{model.sizeMB}MB ({model.family})
                </option>
              ))}
            </select>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 bg-white border border-indigo-200 rounded text-xs font-mono text-indigo-700 font-bold shadow-sm">
                {selectedModel}
              </span>
              {/* eslint-disable security/detect-object-injection -- Safe: selectedModel validated against MODEL_REGISTRY keys */}
              <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-600 text-[10px] font-bold rounded uppercase tracking-wider">
                {MODEL_REGISTRY[selectedModel]?.dimensions || 384} Dimensions
              </span>
              <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-600 text-[10px] font-bold rounded uppercase tracking-wider">
                ~{MODEL_REGISTRY[selectedModel]?.sizeMB || 23}MB
              </span>
            </div>
            <p className="mt-2 text-xs text-indigo-600/80 font-medium">
              {MODEL_REGISTRY[selectedModel]?.description || 'Local browser-based embedding model'}
            </p>
            {/* eslint-enable security/detect-object-injection */}
            <p className="text-xs text-indigo-500 italic mt-1">
              All models run 100% locally in your browser using WebAssembly.
            </p>
          </div>
        </div>
      </div>

      {processingStatus.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">
              Processing Queue
            </h3>
            {isFinished && (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded uppercase">
                Batch Complete
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4">
            {processingStatus.map((task) => (
              <div
                key={task.taskId}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm overflow-hidden flex flex-col transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 truncate">{task.fileName}</p>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-tighter">
                      {CHUNKING_METHOD_LABELS[task.method]}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    {task.status === 'chunking' && (
                      <span className="text-[10px] text-blue-600 font-bold animate-pulse uppercase">
                        Chunking...
                      </span>
                    )}
                    {task.status === 'vectorizing' && (
                      <span className="text-[10px] text-indigo-600 font-bold animate-pulse uppercase">
                        Vectorizing...
                      </span>
                    )}
                    {task.status === 'finished' && (
                      <span className="text-[10px] text-green-600 font-bold uppercase flex items-center gap-1">
                        Success <span className="text-xs">✓</span>
                      </span>
                    )}
                    {task.status === 'waiting' && (
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Queued</span>
                    )}
                    {task.status === 'error' && (
                      <span className="text-[10px] text-red-600 font-bold uppercase">Failed</span>
                    )}
                  </div>
                </div>

                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
                  <div
                    className={`h-full transition-all duration-500 ${
                      task.status === 'finished'
                        ? 'bg-green-500'
                        : task.status === 'error'
                          ? 'bg-red-500'
                          : 'bg-blue-500'
                    }`}
                    style={{ width: `${task.progress}%` }}
                  />
                </div>

                {task.sampleChunks && task.sampleChunks.length > 0 && (
                  <div className="mt-2 bg-slate-50 border border-slate-100 rounded-lg p-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                      Chunk Samples
                    </p>
                    <div className="space-y-2">
                      {task.sampleChunks.map((chunk, idx) => (
                        <div
                          key={idx}
                          className="bg-white p-2 rounded border border-slate-200 text-xs text-slate-600 font-mono relative group"
                        >
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
              <p className="text-sm text-slate-500 italic">
                All items processed. You can now head to the Search section to explore results.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded text-xs flex items-center justify-center font-bold">
                  1
                </span>
                Select Documents
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={handleSelectAllFiles}
                  className="text-[10px] font-bold text-blue-600 uppercase hover:text-blue-800 transition-colors"
                >
                  Select All
                </button>
                <span className="text-slate-300">|</span>
                <button
                  onClick={handleClearAllFiles}
                  className="text-[10px] font-bold text-slate-400 uppercase hover:text-slate-600 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
              {files.map((file) => (
                <label
                  key={file.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedFiles.includes(file.id) ? 'bg-blue-50 border-blue-200' : 'hover:bg-slate-50 border-slate-100'}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedFiles.includes(file.id)}
                    onChange={() => toggleFile(file.id)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 truncate">{file.name}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-tighter">
                      {file.type} • {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded text-xs flex items-center justify-center font-bold">
                  2
                </span>
                Chunking Methods
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={handleSelectAllMethods}
                  className="text-[10px] font-bold text-blue-600 uppercase hover:text-blue-800 transition-colors"
                >
                  Select All
                </button>
                <span className="text-slate-300">|</span>
                <button
                  onClick={handleClearAllMethods}
                  className="text-[10px] font-bold text-slate-400 uppercase hover:text-slate-600 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {(Object.values(ChunkingMethod) as ChunkingMethod[]).map((method) => (
                <div
                  key={method}
                  className={`p-4 rounded-xl border transition-all ${selectedMethods.includes(method) ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100'}`}
                >
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedMethods.includes(method)}
                      onChange={() => toggleMethod(method)}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900">
                        {/* eslint-disable-next-line security/detect-object-injection */}
                        {CHUNKING_METHOD_LABELS[method]}
                      </p>
                      <p className="text-xs text-slate-500">
                        {method === 'recursive' && 'Standard NLP splitting on boundaries.'}
                        {method === 'fixed' && 'Simple window-based character splitting.'}
                        {method === 'token' && 'Approximates token boundaries (LLM-friendly).'}
                        {method === 'sentence' && 'Splits by semantic sentences.'}
                        {method === 'semantic' && 'Group paragraphs by logical structure.'}
                      </p>
                    </div>
                  </label>
                  {selectedMethods.includes(method) && method !== ChunkingMethod.SEMANTIC && (
                    /* eslint-disable security/detect-object-injection -- All params[method] accesses in this block are safe: method is ChunkingMethod enum */
                    <div
                      className="mt-3 pt-3 border-t border-indigo-100 pl-7 space-y-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {(method === ChunkingMethod.FIXED || method === ChunkingMethod.RECURSIVE) && (
                        <div>
                          <div className="flex justify-between text-xs text-slate-600 mb-1">
                            <span className="font-medium" title="Number of characters per chunk">
                              Chunk Size
                            </span>
                            <span className="font-bold text-indigo-600">
                              {params[method].chunkSize} chars
                            </span>
                          </div>
                          <input
                            type="range"
                            min={100}
                            max={4000}
                            step={100}
                            value={params[method].chunkSize ?? 1000}
                            onChange={(e) =>
                              updateParam(method, 'chunkSize', Number(e.target.value))
                            }
                            className="w-full h-1.5 accent-indigo-500"
                            title="Number of characters per chunk"
                          />
                        </div>
                      )}
                      {method === ChunkingMethod.TOKEN && (
                        <div>
                          <div className="flex justify-between text-xs text-slate-600 mb-1">
                            <span
                              className="font-medium"
                              title="Number of tokens per chunk (approximate)"
                            >
                              Token Count
                            </span>
                            <span className="font-bold text-indigo-600">
                              {params[method].tokenCount} tokens
                            </span>
                          </div>
                          <input
                            type="range"
                            min={32}
                            max={1024}
                            step={32}
                            value={params[method].tokenCount ?? 256}
                            onChange={(e) =>
                              updateParam(method, 'tokenCount', Number(e.target.value))
                            }
                            className="w-full h-1.5 accent-indigo-500"
                            title="Number of tokens per chunk (approximate)"
                          />
                        </div>
                      )}
                      {method === ChunkingMethod.SENTENCE && (
                        <div>
                          <div className="flex justify-between text-xs text-slate-600 mb-1">
                            <span
                              className="font-medium"
                              title="Number of sentences to group per chunk"
                            >
                              Sentences per Chunk
                            </span>
                            <span className="font-bold text-indigo-600">
                              {params[method].sentenceCount}
                            </span>
                          </div>
                          <input
                            type="range"
                            min={1}
                            max={20}
                            step={1}
                            value={params[method].sentenceCount ?? 5}
                            onChange={(e) =>
                              updateParam(method, 'sentenceCount', Number(e.target.value))
                            }
                            className="w-full h-1.5 accent-indigo-500"
                            title="Number of sentences to group per chunk"
                          />
                        </div>
                      )}
                      <div>
                        <div className="flex justify-between text-xs text-slate-600 mb-1">
                          <span
                            className="font-medium"
                            title="Overlap between consecutive chunks (preserves context across boundaries)"
                          >
                            Overlap
                            <span className="ml-1 text-slate-400 font-normal">
                              {method === ChunkingMethod.SENTENCE
                                ? '(sentences)'
                                : method === ChunkingMethod.TOKEN
                                  ? '(tokens)'
                                  : '(chars)'}
                            </span>
                          </span>
                          <span className="font-bold text-indigo-600">
                            {params[method].overlap}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={
                            method === ChunkingMethod.SENTENCE
                              ? Math.max(0, (params[method].sentenceCount ?? 5) - 1)
                              : method === ChunkingMethod.TOKEN
                                ? Math.max(0, (params[method].tokenCount ?? 256) - 1)
                                : Math.max(0, (params[method].chunkSize ?? 1000) - 100)
                          }
                          step={
                            method === ChunkingMethod.SENTENCE
                              ? 1
                              : method === ChunkingMethod.TOKEN
                                ? 8
                                : 50
                          }
                          value={params[method].overlap ?? 0}
                          onChange={(e) => updateParam(method, 'overlap', Number(e.target.value))}
                          className="w-full h-1.5 accent-indigo-500"
                          title="Overlap between consecutive chunks (preserves context across boundaries)"
                        />
                        <p className="text-[10px] text-slate-400 mt-1 italic">
                          Higher overlap preserves more context across chunk boundaries.
                        </p>
                      </div>
                    </div>
                    /* eslint-enable security/detect-object-injection */
                  )}
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
