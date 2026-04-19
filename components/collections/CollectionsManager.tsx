import React, { useState } from 'react';
import { VectorCollection, Experiment } from '../../types';
import { Icons, CHUNKING_METHOD_LABELS } from '../../constants';

interface CollectionsManagerProps {
  collections: VectorCollection[];
  experiments: Experiment[];
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

const CollectionsManager: React.FC<CollectionsManagerProps> = ({
  collections,
  experiments,
  onDelete,
  onClearAll,
}) => {
  const [tab, setTab] = useState<'collections' | 'experiments'>('collections');

  // Fix: Explicitly type reduce parameters to prevent unknown type errors on the + operator
  const storageUsage = collections.reduce(
    (acc: number, col: VectorCollection) =>
      acc +
      col.chunks.reduce((a: number, b) => a + b.text.length, 0) * 1.5 +
      col.vectors.length * 768 * 8,
    0
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Management Console</h2>
          <p className="text-slate-500">
            Manage your indexed collections and review the history of your vectorization
            experiments.
          </p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setTab('collections')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'collections' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Collections
          </button>
          <button
            onClick={() => setTab('experiments')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'experiments' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Experiments
          </button>
        </div>
      </header>

      {tab === 'collections' ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-blue-50 p-4 rounded-2xl border border-blue-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <Icons.Database />
              </div>
              <div>
                <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">
                  Indexed Content
                </p>
                <p className="text-xl font-black text-slate-900">
                  {collections.length}{' '}
                  <span className="text-sm font-medium text-slate-500">Collections</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 font-bold uppercase mb-1">Estimated Storage</p>
              <p className="text-sm font-bold text-slate-900">
                {(storageUsage / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={onClearAll}
              className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs font-bold hover:bg-red-600 hover:text-white transition-all"
            >
              Clear All Data
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {collections.map((col) => (
              <div
                key={col.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow group"
              >
                <div className="flex justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-black rounded border border-blue-100 uppercase">
                      COLLECTION
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                      {new Date(col.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    onClick={() => onDelete(col.id)}
                    className="text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Icons.Trash />
                  </button>
                </div>

                <h3 className="font-bold text-slate-900 mb-1 truncate" title={col.name}>
                  {col.name}
                </h3>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-slate-50 p-2 rounded-lg col-span-2">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">
                      Embedding Model
                    </p>
                    <p className="text-xs font-bold text-slate-700 truncate">
                      {col.embeddingModel || 'Unknown'}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">
                      Chunking
                    </p>
                    <p className="text-xs font-bold text-slate-700 truncate">
                      {CHUNKING_METHOD_LABELS[col.chunkMethod]}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Chunks</p>
                    <p className="text-xs font-bold text-slate-700">{col.chunkCount}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-50">
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Source File</p>
                  <p className="text-xs text-slate-600 font-medium truncate">
                    {col.sourceFileName}
                  </p>
                </div>
              </div>
            ))}
            {collections.length === 0 && (
              <div className="col-span-full py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl text-center">
                <p className="text-slate-400 italic">
                  No collections created yet. Start by vectorizing some documents.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">
                  Sources
                </th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">
                  Methods
                </th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">
                  Latency
                </th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider text-right">
                  Total Chunks
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {experiments.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-600">
                    {new Date(exp.timestamp).toLocaleString([], {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {exp.filesProcessed.map((f) => (
                        <span
                          key={f}
                          className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded truncate max-w-[120px]"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {exp.chunkMethods.map((m) => (
                        <span
                          key={m}
                          className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-700">
                    {(exp.processingTimeMs / 1000).toFixed(2)}s
                  </td>
                  <td className="px-6 py-4 text-sm font-black text-slate-900 text-right">
                    {/* Fix: Explicitly type reduce operands to prevent unknown type errors */}
                    {(Object.values(exp.chunkCounts) as number[]).reduce(
                      (a: number, b: number) => a + b,
                      0
                    )}
                  </td>
                </tr>
              ))}
              {experiments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400 italic">
                    No experiments logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CollectionsManager;
