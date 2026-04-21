import React, { useState, useEffect, useRef, useMemo } from 'react';
import { VectorCollection, SearchResult, ChunkingMethod } from '../../types';
import { generateQueryEmbedding } from '../../services/embeddingService';
import { cosineSimilarity, computeBM25 } from '../../utils/similarity';
import { Icons, CHUNKING_METHOD_LABELS, GEMINI_MODEL } from '../../constants';
import CopyButton from '../common/CopyButton';
import { SAMPLE_PERSONAS, Persona, Question } from '../../data/sampleQuestions';
import Papa from 'papaparse';

interface SearchSectionProps {
  collections: VectorCollection[];
  loading: boolean;
}

// --- Sub-Components ---

const ResultRow: React.FC<{ result: SearchResult; rank: number; scoreColor: string }> = ({
  result,
  rank,
  scoreColor,
}) => {
  const [expanded, setExpanded] = useState(false);

  const getRetrievalBadgeStyle = (method: string) => {
    switch (method) {
      case 'dense':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'sparse':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'hybrid':
        return 'bg-teal-100 text-teal-700 border-teal-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

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
          <span className="text-xs font-bold text-slate-700">
            {(result.score * 100).toFixed(0)}
          </span>
        </div>

        {/* Model Badge (Collapsed) - Moved First */}
        {result.embeddingModel && (
          <span
            className="hidden sm:inline-block px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-bold rounded border border-slate-200 shrink-0 truncate max-w-[120px]"
            title={result.embeddingModel}
          >
            {result.embeddingModel.split('/').pop()}
          </span>
        )}

        {/* Retrieval Method Badge (Collapsed) */}
        <span
          className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border shrink-0 ${getRetrievalBadgeStyle(result.retrievalMethod)}`}
        >
          {result.retrievalMethod}
        </span>

        {/* Truncated Text */}
        <p
          className={`text-sm text-slate-700 font-serif italic truncate flex-1 ${expanded ? 'hidden' : 'block'}`}
        >
          "{result.chunk.text}"
        </p>

        {/* Metadata badges (Collapsed) */}
        <div className={`flex items-center gap-2 ${expanded ? 'hidden' : 'flex'}`}>
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
            {/* Model First */}
            {result.embeddingModel && (
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-400 uppercase tracking-wider">Model:</span>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold border border-slate-200">
                  {result.embeddingModel}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-400 uppercase tracking-wider">
                Retrieval Method:
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getRetrievalBadgeStyle(result.retrievalMethod)}`}
              >
                {result.retrievalMethod} Match
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-400 uppercase tracking-wider">Collection:</span>
              <span className="font-semibold text-slate-700">{result.collectionName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-400 uppercase tracking-wider">Source:</span>
              <span>{result.chunk.sourceFileName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-400 uppercase tracking-wider">
                Chunking Method:
              </span>
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

// --- Hyperparameters View Component ---

interface DocStat {
  bestScore: number;
  bestMethod: string;
  bestChunking: string;
  bestModel: string;
}

const HyperparametersView: React.FC<{ results: SearchResult[] }> = ({ results }) => {
  const analysis = useMemo(() => {
    if (!results.length) return null;

    // Configuration Analysis (Chunking + Retrieval + Model)
    const configMap = new Map<
      string,
      {
        chunkMethod: string;
        retrievalMethod: string;
        embeddingModel: string;
        maxScore: number;
        avgScore: number;
        scores: number[];
      }
    >();

    // Document Analysis
    const docStats = new Map<string, DocStat>();

    results.forEach((r) => {
      // 1. Config Aggregation
      const sig = `${r.chunk.chunkMethod}|${r.retrievalMethod}|${r.embeddingModel}`;
      if (!configMap.has(sig)) {
        configMap.set(sig, {
          chunkMethod: r.chunk.chunkMethod,
          retrievalMethod: r.retrievalMethod,
          embeddingModel: r.embeddingModel || 'Unknown',
          maxScore: 0,
          avgScore: 0,
          scores: [],
        });
      }
      const conf = configMap.get(sig)!;
      conf.scores.push(r.score);
      conf.maxScore = Math.max(conf.maxScore, r.score);

      // 2. Doc Aggregation
      const doc = r.chunk.sourceFileName;
      const existingStat = docStats.get(doc);
      if (!existingStat || r.score > existingStat.bestScore) {
        docStats.set(doc, {
          bestScore: r.score,
          bestMethod: r.retrievalMethod,
          bestChunking: r.chunk.chunkMethod,
          bestModel: r.embeddingModel || 'Unknown',
        });
      }
    });

    const topConfigs = Array.from(configMap.values())
      .map((c) => ({
        ...c,
        avgScore: c.scores.reduce((a, b) => a + b, 0) / c.scores.length,
      }))
      .sort((a, b) => b.maxScore - a.maxScore) // Sort by Max Score
      .slice(0, 3);

    return { topConfigs, docStats };
  }, [results]);

  if (!analysis) return null;

  const { topConfigs, docStats } = analysis;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* SECTION 1: OVERALL CORPUS */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-1 bg-indigo-600 rounded-full"></div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Overall Corpus Performance</h3>
            <p className="text-xs text-slate-500">
              Top 3 parameter configurations that yielded the highest relevance scores across the
              entire result set.
            </p>
          </div>
        </div>

        {/* Overall Best Card */}
        {topConfigs.length > 0 && (
          <div className="mb-6 bg-indigo-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 bg-indigo-500/20 rounded-full blur-2xl group-hover:bg-indigo-400/30 transition-all duration-700"></div>
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-[10px] font-bold uppercase tracking-widest mb-4 backdrop-blur-sm">
                🏆 Best Overall Parameters
              </span>
              <div className="flex flex-col md:flex-row gap-8 items-start md:items-end justify-between">
                <div className="space-y-4 flex-1">
                  {/* Model First */}
                  <div>
                    <p className="text-xs text-indigo-300 font-bold uppercase mb-1">
                      Winning Model
                    </p>
                    <p className="text-lg font-bold break-all">
                      {topConfigs[0].embeddingModel.split('/').pop()}
                    </p>
                  </div>
                  <div className="flex gap-8">
                    <div>
                      <p className="text-xs text-indigo-300 font-bold uppercase mb-1">Chunking</p>
                      <p className="text-lg font-semibold capitalize">
                        {
                          CHUNKING_METHOD_LABELS[
                            topConfigs[0].chunkMethod as ChunkingMethod
                          ]?.split(' ')[0]
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-indigo-300 font-bold uppercase mb-1">Retrieval</p>
                      <p className="text-lg font-semibold capitalize">
                        {topConfigs[0].retrievalMethod}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-indigo-300 font-bold uppercase mb-1">
                    Relevance Score
                  </p>
                  <p className="text-5xl font-black tracking-tight text-white">
                    {(topConfigs[0].maxScore * 100).toFixed(0)}
                    <span className="text-2xl text-indigo-400">%</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top 3 List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topConfigs.map((config, idx) => (
            <div
              key={idx}
              className={`bg-white border rounded-xl p-5 shadow-sm relative overflow-hidden ${idx === 0 ? 'border-indigo-200 ring-1 ring-indigo-50' : 'border-slate-200'}`}
            >
              {idx === 0 && (
                <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[9px] font-black px-2 py-1 rounded-bl-lg uppercase">
                  Rank #1
                </div>
              )}
              {idx === 1 && (
                <div className="absolute top-0 right-0 bg-slate-400 text-white text-[9px] font-black px-2 py-1 rounded-bl-lg uppercase">
                  Rank #2
                </div>
              )}
              {idx === 2 && (
                <div className="absolute top-0 right-0 bg-amber-600 text-white text-[9px] font-black px-2 py-1 rounded-bl-lg uppercase">
                  Rank #3
                </div>
              )}

              <div className="flex items-baseline gap-2 mb-3">
                <span
                  className={`text-3xl font-black ${idx === 0 ? 'text-indigo-600' : 'text-slate-700'}`}
                >
                  {(config.maxScore * 100).toFixed(0)}
                </span>
                <span className="text-xs text-slate-400 font-bold uppercase">Max Score</span>
              </div>

              <div className="space-y-2 text-sm">
                {/* Model First */}
                <div className="pt-0 pb-2 border-b border-slate-50 mb-2">
                  <span className="block text-[10px] text-slate-400 uppercase font-bold mb-1">
                    Embedding Model
                  </span>
                  <code
                    className="text-[10px] bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 block truncate"
                    title={config.embeddingModel}
                  >
                    {config.embeddingModel.split('/').pop()}
                  </code>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-2">
                  <span className="text-slate-500 text-xs">Chunking</span>
                  <span className="font-bold text-slate-800 capitalize">
                    {CHUNKING_METHOD_LABELS[config.chunkMethod as ChunkingMethod]?.split(' ')[0]}
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500 text-xs">Retrieval</span>
                  <span className="font-bold text-slate-800 capitalize">
                    {config.retrievalMethod}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: DOCUMENT OPTIMIZATION */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-1 bg-slate-900 rounded-full"></div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Optimization by Document</h3>
            <p className="text-xs text-slate-500">
              Breakdown of the best performing parameters for each individual document found in
              results.
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Document Name
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">
                    Best Score
                  </th>
                  {/* Model First */}
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Embedding Model
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Winning Chunk Method
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Winning Retrieval
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Array.from(docStats.entries()).map(([docName, stats]: [string, DocStat]) => (
                  <tr key={docName} className="hover:bg-slate-50 transition-colors">
                    <td
                      className="px-6 py-4 text-sm font-bold text-slate-700 truncate max-w-[200px]"
                      title={docName}
                    >
                      {docName}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${stats.bestScore > 0.7 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}
                      >
                        {(stats.bestScore * 100).toFixed(0)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="text-[10px] font-mono text-slate-500 truncate block max-w-[150px]"
                        title={stats.bestModel}
                      >
                        {stats.bestModel.split('/').pop()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-slate-600 capitalize bg-white border border-slate-200 px-2 py-1 rounded shadow-sm">
                        {
                          CHUNKING_METHOD_LABELS[stats.bestChunking as ChunkingMethod]?.split(
                            ' '
                          )[0]
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-slate-600 capitalize bg-white border border-slate-200 px-2 py-1 rounded shadow-sm">
                        {stats.bestMethod}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

// --- Main Search Section Component ---

const SearchSection: React.FC<SearchSectionProps> = ({ collections, loading: _appLoading }) => {
  const [query, setQuery] = useState('');
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);

  // Tab State - Default to 'hyperparams' as requested
  const [activeTab, setActiveTab] = useState<'results' | 'hyperparams'>('hyperparams');

  // Persisted State: Retrieval Methods
  const [retrievalMethods, setRetrievalMethods] = useState<('dense' | 'sparse' | 'hybrid')[]>(
    () => {
      const saved = localStorage.getItem('rag_search_methods');
      return saved ? JSON.parse(saved) : ['dense'];
    }
  );

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
  const [showSampleQuestions, setShowSampleQuestions] = useState(true);

  const activePersona = personas.find((p) => p.id === selectedPersonaId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('rag_search_methods', JSON.stringify(retrievalMethods));
  }, [retrievalMethods]);

  useEffect(() => {
    localStorage.setItem('rag_search_topk', topK.toString());
  }, [topK]);

  // Bulk Actions
  const handleSelectAllCollections = () => setSelectedCollections(collections.map((c) => c.id));
  const handleClearAllCollections = () => setSelectedCollections([]);

  const handleSelectAllRetrieval = () => setRetrievalMethods(['dense', 'sparse', 'hybrid']);
  const handleClearAllRetrieval = () => setRetrievalMethods([]);

  const handleSearch = async () => {
    if (!query) return;
    if (selectedCollections.length === 0) return alert('Select at least one collection.');

    setSearching(true);
    // Note: We keep the active tab as is (user preference), or can force it:
    // setActiveTab('hyperparams');

    const startTime = performance.now();
    const allResults: SearchResult[] = [];

    try {
      // Group collections by embedding model to minimize model loading
      const collectionsByModel: Record<string, VectorCollection[]> = {};
      selectedCollections.forEach((colId) => {
        const col = collections.find((c) => c.id === colId);
        if (!col) return;
        const modelId = col.embeddingModel || GEMINI_MODEL;
        // eslint-disable-next-line security/detect-object-injection -- Safe: modelId from collection.embeddingModel
        if (!collectionsByModel[modelId]) {
          // eslint-disable-next-line security/detect-object-injection -- Safe: modelId from collection.embeddingModel
          collectionsByModel[modelId] = [];
        }
        // eslint-disable-next-line security/detect-object-injection -- Safe: modelId from collection.embeddingModel
        collectionsByModel[modelId].push(col);
      });

      // Generate query embedding once per unique model
      for (const [modelId, cols] of Object.entries(collectionsByModel)) {
        const queryEmbedding = await generateQueryEmbedding(query, modelId);

        for (const col of cols) {
          const docTexts = col.chunks.map((c) => c.text);
          const embeddingModel = col.embeddingModel || GEMINI_MODEL;

          // Retrieval Methods
          if (retrievalMethods.includes('dense')) {
            const scores = col.vectors.map((vec) => cosineSimilarity(queryEmbedding, vec));
            scores.forEach((score, idx) => {
              allResults.push({
                // eslint-disable-next-line security/detect-object-injection -- Safe: numeric array index
                chunk: col.chunks[idx],
                score,
                retrievalMethod: 'dense',
                collectionName: col.name,
                collectionId: col.id,
                embeddingModel,
              });
            });
          }

          if (retrievalMethods.includes('sparse')) {
            const scores = computeBM25(query, docTexts);
            const max = Math.max(...scores, 1);
            scores.forEach((s, idx) => {
              allResults.push({
                // eslint-disable-next-line security/detect-object-injection -- Safe: numeric array index
                chunk: col.chunks[idx],
                score: s / max,
                retrievalMethod: 'sparse',
                collectionName: col.name,
                collectionId: col.id,
                embeddingModel,
              });
            });
          }

          if (retrievalMethods.includes('hybrid')) {
            const denseScores = col.vectors.map((vec) => cosineSimilarity(queryEmbedding, vec));
            const sparseScores = computeBM25(query, docTexts);
            const maxSparse = Math.max(...sparseScores, 1);

            denseScores.forEach((ds, idx) => {
              // eslint-disable-next-line security/detect-object-injection -- Safe: numeric array index
              const ss = sparseScores[idx] / maxSparse;
              const hybridScore = ds * 0.7 + ss * 0.3;
              allResults.push({
                // eslint-disable-next-line security/detect-object-injection -- Safe: numeric array index
                chunk: col.chunks[idx],
                score: hybridScore,
                retrievalMethod: 'hybrid',
                collectionName: col.name,
                collectionId: col.id,
                embeddingModel,
              });
            });
          }
        } // end for col
      } // end for modelId

      const finalResults = allResults
        .sort((a, b) => b.score - a.score)
        .slice(0, topK * retrievalMethods.length);

      setResults(finalResults);
    } catch (err) {
      console.error(err);
      alert('Search failed.');
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
            const newQuestions: Question[] = json.map((q: unknown) => {
              const item = q as Record<string, unknown>;
              return {
                text: String(item.question || item.text || q),
                focus: String(item.category || item.focus || 'Custom'),
              };
            });
            const newPersona: Persona = {
              id: `custom-${Date.now()}`,
              role: `Custom: ${file.name}`,
              description: 'User uploaded questions',
              questions: newQuestions,
            };
            setPersonas((prev) => [...prev, newPersona]);
            setSelectedPersonaId(newPersona.id);
          }
        } catch {
          alert('Invalid JSON format');
        }
      } else if (file.name.endsWith('.csv')) {
        Papa.parse<Record<string, string>>(text, {
          header: true,
          complete: (results) => {
            const newQuestions: Question[] = results.data
              .filter((r) => r.question || r.text)
              .map((r) => ({
                text: r.question || r.text,
                focus: r.category || r.focus || 'Custom',
              }));
            if (newQuestions.length > 0) {
              const newPersona: Persona = {
                id: `custom-${Date.now()}`,
                role: `Custom: ${file.name}`,
                description: 'User uploaded questions',
                questions: newQuestions,
              };
              setPersonas((prev) => [...prev, newPersona]);
              setSelectedPersonaId(newPersona.id);
            }
          },
        });
      }
    };
    reader.readAsText(file);
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.6) return 'bg-blue-500';
    if (score >= 0.4) return 'bg-amber-500';
    return 'bg-slate-400';
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Pre-RAG Search Explorer</h2>
        <p className="text-slate-500">
          Query your vector store and analyze how different retrieval methods perform on your
          indexed content.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Configuration */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm sticky top-6">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Target Collections
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleSelectAllCollections}
                    className="text-[10px] font-bold text-blue-600 uppercase hover:text-blue-800 transition-colors"
                  >
                    All
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    onClick={handleClearAllCollections}
                    className="text-[10px] font-bold text-slate-400 uppercase hover:text-slate-600 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar pr-1">
                {collections.map((col) => (
                  <label
                    key={col.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedCollections.includes(col.id) ? 'bg-blue-50 border-blue-200 shadow-sm' : 'hover:bg-slate-50 border-transparent'}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCollections.includes(col.id)}
                      onChange={() =>
                        setSelectedCollections((prev) =>
                          prev.includes(col.id)
                            ? prev.filter((x) => x !== col.id)
                            : [...prev, col.id]
                        )
                      }
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{col.name}</p>
                      <p className="text-xs text-slate-400">{col.chunkCount} chunks</p>
                    </div>
                  </label>
                ))}
                {collections.length === 0 && (
                  <p className="text-xs text-slate-400 italic">No collections available.</p>
                )}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                Search Parameters
              </h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold text-slate-700">
                      Retrieval Methods
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSelectAllRetrieval}
                        className="text-[10px] font-bold text-blue-600 uppercase hover:text-blue-800 transition-colors"
                      >
                        All
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        onClick={handleClearAllRetrieval}
                        className="text-[10px] font-bold text-slate-400 uppercase hover:text-slate-600 transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {(['dense', 'sparse', 'hybrid'] as const).map((m) => (
                      <label
                        key={m}
                        className={`flex items-center gap-3 p-2 rounded-lg border transition-all cursor-pointer ${retrievalMethods.includes(m) ? 'bg-indigo-50 border-indigo-100' : 'border-transparent hover:bg-slate-50'}`}
                      >
                        <input
                          type="checkbox"
                          checked={retrievalMethods.includes(m)}
                          onChange={() =>
                            setRetrievalMethods((prev) =>
                              prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
                            )
                          }
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
                    <label className="text-xs font-semibold text-slate-700">
                      Results Limit (Top K)
                    </label>
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-bold text-slate-600">
                      {topK}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
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
          <div className="bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-2xl p-5 shadow-sm transition-all duration-200">
            <div
              className={`flex flex-col md:flex-row gap-4 items-start md:items-center justify-between ${showSampleQuestions ? 'mb-4' : ''}`}
            >
              <div
                className="flex items-center gap-2 cursor-pointer group select-none"
                onClick={() => setShowSampleQuestions(!showSampleQuestions)}
              >
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs">
                    ?
                  </span>
                  Sample Questions
                </h3>
                <div
                  className={`text-slate-400 group-hover:text-indigo-600 transition-transform duration-200 ${showSampleQuestions ? 'rotate-180' : ''}`}
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
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <select
                  value={selectedPersonaId}
                  onChange={(e) => setSelectedPersonaId(e.target.value)}
                  className="flex-1 md:flex-none px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none cursor-pointer hover:border-slate-300 transition-colors uppercase tracking-wide"
                >
                  <option value="">-- Select Question Set --</option>
                  {personas.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.role}
                    </option>
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

            {showSampleQuestions && activePersona && (
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
                      <span className="block font-bold text-[10px] text-slate-400 uppercase tracking-wider mb-0.5 group-hover:text-blue-400">
                        {q.focus}
                      </span>
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
              onKeyDown={(e) =>
                e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSearch())
              }
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

          {/* Search Results / Tabs */}
          <div className="space-y-6">
            {results.length > 0 && (
              <div className="bg-slate-100 rounded-xl border border-slate-200 p-1 sticky top-0 z-10 shadow-sm">
                <div className="flex justify-between items-center">
                  <div className="flex gap-1">
                    <button
                      onClick={() => setActiveTab('hyperparams')}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'hyperparams' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Hyperparameters
                    </button>
                    <button
                      onClick={() => setActiveTab('results')}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'results' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Detailed Results
                    </button>
                  </div>

                  <div className="flex items-center gap-4 px-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
                      {results.length} Matches in {searchTime.toFixed(0)}ms
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'results' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {results.map((res, i) => (
                  <ResultRow
                    key={`${res.collectionId}-${res.chunk.id}-${res.retrievalMethod}-${i}`}
                    result={res}
                    rank={i + 1}
                    scoreColor={getScoreColor(res.score)}
                  />
                ))}
              </div>
            )}

            {activeTab === 'hyperparams' && <HyperparametersView results={results} />}

            {results.length === 0 && !searching && query && (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <Icons.Search />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No matches found</h3>
                <p className="text-slate-500 max-w-md mx-auto mt-1">
                  Try adjusting your search query, lowering the similarity threshold, or selecting
                  more collections.
                </p>
              </div>
            )}

            {results.length === 0 && !searching && !query && (
              <div className="text-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-slate-300">
                  <Icons.Search />
                </div>
                <p className="text-slate-400 font-medium">
                  Enter a query above to start exploring.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchSection;
