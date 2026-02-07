
import React, { useState, useEffect, useRef } from 'react';
import { VectorCollection, SearchResult, ChunkingMethod, ChunkParams } from '../../types';
import { generateQueryEmbedding } from '../../services/embeddingService';
import { cosineSimilarity, computeBM25 } from '../../utils/similarity';
import { Icons, CHUNKING_METHOD_LABELS } from '../../constants';
import CopyButton from '../common/CopyButton';
import { SAMPLE_PERSONAS, Persona, Question } from '../../data/sampleQuestions';
import Papa from 'papaparse';

interface SearchSectionProps {
  collections: VectorCollection[];
  loading: boolean;
}

const SearchSection: React.FC<SearchSectionProps> = ({ collections, loading: appLoading }) => {
  const [query, setQuery] = useState('');
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  
  // Persisted State: Retrieval Methods
  const [retrievalMethods, setRetrievalMethods] = useState<('dense' | 'sparse' | 'hybrid')[]>(() => {
    const saved = localStorage.getItem('rag_search_methods');
    return saved ? JSON.parse(saved) : ['dense'];
  });

  // Persisted State: Top K
  const [topK, setTopK] = useState(() => {
    const saved = localStorage.getItem('rag_search_topk');
    return saved ? parseInt(saved) : 5;
  });

  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchTime, setSearchTime] = useState<number>(0);
  
  // Question Sets
  const [personas, setPersonas] = useState<Persona[]>(SAMPLE_PERSONAS);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('');
  const activePersona = personas.find(p => p.id === selectedPersonaId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('rag_search_methods', JSON.stringify(retrievalMethods));
  }, [retrievalMethods]);

  useEffect(() => {
    localStorage.setItem('rag_search_topk', topK.toString());
  }, [topK]);

  // Bulk Actions
  const handleSelectAllCollections = () => setSelectedCollections(collections.map(c => c.id));
  const handleClearAllCollections = () => setSelectedCollections([]);
  
  const handleSelectAllRetrieval = () => setRetrievalMethods(['dense', 'sparse', 'hybrid']);
  const handleClearAllRetrieval = () => setRetrievalMethods([]);

  const handleSearch = async () => {
    if (!query) return;
    if (selectedCollections.length === 0) return alert("Select at least one collection.");
    
    setSearching(true);
    const startTime = performance.now();
    const allResults: SearchResult[] = [];

    try {
      const queryEmbedding = await generateQueryEmbedding(query);

      for (const colId of selectedCollections) {
        const col = collections.find(c => c.id === colId);
        if (!col) continue;

        const docTexts = col.chunks.map(c => c.text);
        
        // Retrieval Methods
        if (retrievalMethods.includes('dense')) {
          const scores = col.vectors.map(vec => cosineSimilarity(queryEmbedding, vec));
          scores.forEach((score, idx) => {
            allResults.push({
              chunk: col.chunks[idx],
              score,
              retrievalMethod: 'dense',
              collectionName: col.name,
              collectionId: col.id
            });
          });
        }

        if (retrievalMethods.includes('sparse')) {
          const scores = computeBM25(query, docTexts);
          const max = Math.max(...scores, 1);
          scores.forEach((s, idx) => {
            allResults.push({
              chunk: col.chunks[idx],
              score: s / max, 
              retrievalMethod: 'sparse',
              collectionName: col.name,
              collectionId: col.id
            });
          });
        }

        if (retrievalMethods.includes('hybrid')) {
            const denseScores = col.vectors.map(vec => cosineSimilarity(queryEmbedding, vec));
            const sparseScores = computeBM25(query, docTexts);
            const maxSparse = Math.max(...sparseScores, 1);
            
            denseScores.forEach((ds, idx) => {
                const ss = sparseScores[idx] / maxSparse;
                const hybridScore = (ds * 0.7) + (ss * 0.3);
                allResults.push({
                    chunk: col.chunks[idx],
                    score: hybridScore,
                    retrievalMethod: 'hybrid',
                    collectionName: col.name,
                    collectionId: col.id
                });
            });
        }
      }

      const finalResults = allResults
        .sort((a, b) => b.score - a.score)
        .slice(0, topK * retrievalMethods.length);
      
      setResults(finalResults);
    } catch (err) {
      console.error(err);
      alert("Search failed.");
    } finally {
      setSearchTime(performance.now() - startTime);
      setSearching(false);
    }
  };

  const handleQuestionsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (file.name.endsWith('.json')) {
        try {
          const json = JSON.parse(text);
          if (Array.isArray(json)) {
             // Basic structure check - assume array of {category, question} or just raw questions
             // Transform into a new Persona
             const newQuestions: Question[] = json.map((q: any) => ({
                text: q.question || q.text || String(q),
                focus: q.category || q.focus || 'Custom'
             }));
             const newPersona: Persona = {
               id: `custom-${Date.now()}`,
               role: `Custom: ${file.name}`,
               description: "User uploaded questions",
               questions: newQuestions
             };
             setPersonas(prev => [...prev, newPersona]);
             setSelectedPersonaId(newPersona.id);
          }
        } catch (err) {
          alert("Invalid JSON format");
        }
      } else if (file.name.endsWith('.csv')) {
        Papa.parse(text, {
           header: true,
           complete: (results: any) => {
              const newQuestions: Question[] = results.data
                 .filter((r: any) => r.question || r.text)
                 .map((r: any) => ({
                    text: r.question || r.text,
                    focus: r.category || r.focus || 'Custom'
                 }));
              if (newQuestions.length > 0) {
                const newPersona: Persona = {
                    id: `custom-${Date.now()}`,
                    role: `Custom: ${file.name}`,
                    description: "User uploaded questions",
                    questions: newQuestions
                  };
                  setPersonas(prev => [...prev, newPersona]);
                  setSelectedPersonaId(newPersona.id);
              }
           }
        });
      }
    };
    reader.readAsText(file);
  };

  // Group results by method
  const groupedResults = results.reduce((acc, res) => {
    if (!acc[res.retrievalMethod]) acc[res.retrievalMethod] = [];
    acc[res.retrievalMethod].push(res);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.6) return 'bg-blue-500';
    if (score >= 0.4) return 'bg-amber-500';
    return 'bg-slate-400';
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Retrieval Explorer</h2>
        <p className="text-slate-500">Query your vector store and analyze how different retrieval methods perform on your indexed content.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Configuration */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm sticky top-6">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Target Collections</h3>
                <div className="flex gap-2">
                   <button onClick={handleSelectAllCollections} className="text-[10px] font-bold text-blue-600 uppercase hover:text-blue-800 transition-colors">All</button>
                   <span className="text-slate-300">|</span>
                   <button onClick={handleClearAllCollections} className="text-[10px] font-bold text-slate-400 uppercase hover:text-slate-600 transition-colors">Clear</button>
                </div>
              </div>
              <div className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar pr-1">
                {collections.map(col => (
                  <label key={col.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedCollections.includes(col.id) ? 'bg-blue-50 border-blue-200 shadow-sm' : 'hover:bg-slate-50 border-transparent'}`}>
                    <input 
                      type="checkbox" 
                      checked={selectedCollections.includes(col.id)}
                      onChange={() => setSelectedCollections(prev => prev.includes(col.id) ? prev.filter(x => x !== col.id) : [...prev, col.id])}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{col.name}</p>
                      <p className="text-[10px] text-slate-400">{col.chunkCount} chunks</p>
                    </div>
                  </label>
                ))}
                {collections.length === 0 && <p className="text-xs text-slate-400 italic">No collections available.</p>}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Search Parameters</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                     <label className="text-xs font-semibold text-slate-700">Retrieval Algorithms</label>
                  </div>
                  <div className="space-y-2">
                    {['dense', 'sparse', 'hybrid'].map((m) => (
                      <label key={m} className={`flex items-center gap-3 p-2 rounded-lg border transition-all cursor-pointer ${retrievalMethods.includes(m as any) ? 'bg-indigo-50 border-indigo-100' : 'border-transparent hover:bg-slate-50'}`}>
                        <input 
                          type="checkbox" 
                          checked={retrievalMethods.includes(m as any)}
                          onChange={() => setRetrievalMethods(prev => prev.includes(m as any) ? prev.filter(x => x !== m) : [...prev, m as any])}
                          className="w-4 h-4 text-indigo-600 rounded"
                        />
                        <div>
                          <span className="text-xs font-bold capitalize text-slate-700 block">
                            {m} 
                            <span className="font-normal text-slate-500 ml-1">
                              {m === 'dense' && '(Vector Similarity)'}
                              {m === 'sparse' && '(Keyword BM25)'}
                              {m === 'hybrid' && '(Dense + Sparse)'}
                            </span>
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold text-slate-700">Results Limit (Top K)</label>
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-bold text-slate-600">{topK}</span>
                  </div>
                  <input 
                    type="range" min="1" max="20" 
                    value={topK} 
                    onChange={(e) => setTopK(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>1</span>
                    <span>10</span>
                    <span>20</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Search Area */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Persona/Question Selection */}
          <div className="bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs">?</span>
                  Sample Questions
                </h3>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <select 
                  value={selectedPersonaId}
                  onChange={(e) => setSelectedPersonaId(e.target.value)}
                  className="flex-1 md:flex-none px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none cursor-pointer hover:border-slate-300 transition-colors uppercase tracking-wide"
                >
                  <option value="">-- Select Question Set --</option>
                  {personas.map(p => (
                    <option key={p.id} value={p.id}>{p.role}</option>
                  ))}
                </select>
                <button 
                   onClick={() => fileInputRef.current?.click()}
                   className="px-3 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 hover:text-slate-800 transition-colors"
                   title="Upload JSON/CSV Questions"
                >
                   <Icons.Upload />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".json,.csv" 
                  onChange={handleQuestionsUpload} 
                />
              </div>
            </div>
            
            {activePersona && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="bg-indigo-50/50 p-3 rounded-xl mb-3 border border-indigo-100/50">
                   <p className="text-xs text-indigo-800 italic">{activePersona.description}</p>
                </div>
                <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto custom-scrollbar p-1">
                  {activePersona.questions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => setQuery(q.text)}
                      className="text-left px-3 py-2 bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 rounded-lg text-xs font-medium text-slate-600 transition-all shadow-sm group"
                    >
                      <span className="block font-bold text-[10px] text-slate-400 uppercase tracking-wider mb-0.5 group-hover:text-blue-400">{q.focus}</span>
                      "{q.text}"
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative group">
            <textarea 
              placeholder="Enter your search query here..."
              className="w-full h-24 p-5 rounded-2xl border border-slate-200 bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none text-lg resize-none shadow-sm placeholder:text-slate-300"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSearch())}
            />
            <button 
              onClick={handleSearch}
              disabled={searching || !query || selectedCollections.length === 0}
              className="absolute bottom-4 right-4 px-6 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
            >
              {searching ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Icons.Search />
              )}
              Search
            </button>
          </div>

          {/* Search Results Display */}
          <div className="space-y-6">
            {results.length > 0 && (
              <div className="flex items-center justify-between px-2 py-3 bg-slate-100 rounded-xl border border-slate-200 sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="px-3 py-1 bg-white rounded-lg border border-slate-200 shadow-sm">
                    <span className="text-[10px] uppercase font-black text-slate-400 block">Results</span>
                    <span className="text-lg font-bold text-slate-900 leading-none">{results.length}</span>
                  </div>
                  <div className="px-3 py-1 bg-white rounded-lg border border-slate-200 shadow-sm">
                    <span className="text-[10px] uppercase font-black text-slate-400 block">Latency</span>
                    <span className="text-lg font-bold text-slate-900 leading-none">{searchTime.toFixed(0)}<span className="text-xs font-medium text-slate-400">ms</span></span>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Filters</span>
                  <div className="flex gap-2 mt-1">
                    {retrievalMethods.map(m => (
                      <span key={m} className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[10px] font-bold uppercase">{m}</span>
                    ))}
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded text-[10px] font-bold uppercase">Top {topK}</span>
                  </div>
                </div>
              </div>
            )}

            {Object.entries(groupedResults).map(([method, methodResults]: [string, SearchResult[]]) => (
              <div key={method} className="space-y-2">
                 <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                    <span className={`px-2 py-1 text-xs font-bold rounded uppercase tracking-wider border ${
                        method === 'dense' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                        method === 'sparse' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                        'bg-teal-50 text-teal-600 border-teal-100'
                      }`}>
                      {method} Match
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{methodResults.length} results</span>
                 </div>
                 
                 {methodResults.map((res, i) => (
                   <ResultRow key={`${res.collectionId}-${res.chunk.id}-${i}`} result={res} rank={i+1} scoreColor={getScoreColor(res.score)} />
                 ))}
              </div>
            ))}

            {results.length === 0 && !searching && query && (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <Icons.Search />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No matches found</h3>
                <p className="text-slate-500 max-w-md mx-auto mt-1">
                  Try adjusting your search query, lowering the similarity threshold, or selecting more collections.
                </p>
              </div>
            )}

            {results.length === 0 && !searching && !query && (
              <div className="text-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-slate-300">
                  <Icons.Search />
                </div>
                <p className="text-slate-400 font-medium">Enter a query above to start exploring.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ResultRow: React.FC<{ result: SearchResult, rank: number, scoreColor: string }> = ({ result, rank, scoreColor }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div 
      className={`bg-white border rounded-xl overflow-hidden transition-all duration-200 cursor-pointer hover:border-blue-300 hover:shadow-sm ${expanded ? 'border-blue-200 shadow-md ring-1 ring-blue-50' : 'border-slate-200'}`}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Compact Row */}
      <div className="flex items-center p-3 gap-4">
        <span className="w-6 text-xs font-bold text-slate-400 text-center">#{rank}</span>
        
        {/* Visual Score Bar */}
        <div className="w-24 shrink-0 flex items-center gap-2">
          <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
             <div className={`h-full ${scoreColor}`} style={{ width: `${result.score * 100}%` }} />
          </div>
          <span className="text-xs font-bold text-slate-700">{(result.score * 100).toFixed(0)}</span>
        </div>

        {/* Truncated Text */}
        <p className={`text-sm text-slate-700 font-serif italic truncate flex-1 ${expanded ? 'hidden' : 'block'}`}>
          "{result.chunk.text}"
        </p>
        
        {/* Metadata badges (Collapsed) */}
        <div className={`flex items-center gap-2 ${expanded ? 'hidden' : 'flex'}`}>
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate max-w-[100px]" title={result.chunk.sourceFileName}>
             {result.chunk.sourceFileName}
           </span>
           <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[9px] font-bold text-slate-500 uppercase">
             {CHUNKING_METHOD_LABELS[result.chunk.chunkMethod].split(' ')[0]}
           </span>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-4 pb-4 pt-0 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="border-t border-slate-50 my-2" />
          <p className="text-slate-800 text-sm leading-relaxed font-serif mb-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
            "{result.chunk.text}"
          </p>
          
          <div className="flex flex-wrap gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Icons.Database />
              <span className="font-semibold text-slate-700">{result.collectionName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-400 uppercase tracking-wider">Source:</span>
              <span>{result.chunk.sourceFileName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-400 uppercase tracking-wider">Method:</span>
              <span>{CHUNKING_METHOD_LABELS[result.chunk.chunkMethod]}</span>
            </div>
            <div className="ml-auto">
               <CopyButton text={result.chunk.text} label="Copy Chunk" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchSection;
