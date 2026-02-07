
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AppState, UploadedFile, VectorCollection, ChunkingMethod, ChunkParams, SearchResult, Experiment, ProcessingStatus, ErrorInfo } from './types';
import { Icons, CHUNKING_METHOD_LABELS, GEMINI_MODEL } from './constants';
import { parseFile } from './services/fileParser';
import { chunkText } from './services/chunkingService';
import { generateEmbeddings, generateQueryEmbedding } from './services/embeddingService';
import { 
  saveCollection, getAllCollections, deleteCollection, clearAllCollections,
  saveFile, getAllFiles, deleteFile 
} from './services/vectorStore';
import { cosineSimilarity, computeBM25 } from './utils/similarity';

// Component Imports
import Sidebar from './components/layout/Sidebar';
import FileUpload from './components/upload/FileUpload';
import ProcessSection from './components/chunking/ProcessSection';
import SearchSection from './components/search/SearchSection';
import CollectionsManager from './components/collections/CollectionsManager';
import GuidanceBalloon from './components/layout/GuidanceBalloon';
import ErrorDisplay from './components/layout/ErrorDisplay';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    files: [],
    collections: [],
    experiments: [],
    activeView: 'upload',
    processingStatus: [],
    globalError: undefined
  });

  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const collections = await getAllCollections();
        const files = await getAllFiles(); 
        const savedExperiments = JSON.parse(localStorage.getItem('rag_experiments') || '[]');
        
        setState(prev => ({ 
          ...prev, 
          collections, 
          files, 
          experiments: savedExperiments 
        }));
      } catch (err) {
        console.error("Failed to load initial data", err);
        setState(prev => ({
          ...prev,
          globalError: { message: "Failed to restore data from storage.", technical: String(err) }
        }));
      } finally {
        setDataLoaded(true);
      }
    };
    loadData();
  }, []);

  // Persist ONLY experiments to localStorage (Files and Collections use IndexedDB)
  // CRITICAL: Only run this AFTER dataLoaded is true to prevent overwriting storage with empty initial state
  useEffect(() => {
    if (dataLoaded) {
      localStorage.setItem('rag_experiments', JSON.stringify(state.experiments));
    }
  }, [state.experiments, dataLoaded]);

  const handleFilesAdded = async (newFiles: File[]) => {
    setLoading(true);
    setState(prev => ({ ...prev, globalError: undefined }));
    try {
      const parsedFiles: UploadedFile[] = await Promise.all(newFiles.map(async (file) => {
        const content = await parseFile(file);
        return {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.name.split('.').pop() as any,
          size: file.size,
          content,
          uploadedAt: new Date().toISOString()
        };
      }));

      // Persist files to IndexedDB
      await Promise.all(parsedFiles.map(f => saveFile(f)));

      setState(prev => ({ ...prev, files: [...prev.files, ...parsedFiles] }));
    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        globalError: { 
          message: "Could not parse one or more files. Check if they are valid PDF/CSV/Text formats.",
          technical: err.stack || err.message || JSON.stringify(err)
        } 
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFile = async (id: string) => {
    try {
      await deleteFile(id); // Remove from IndexedDB
      setState(prev => ({ ...prev, files: prev.files.filter(f => f.id !== id) }));
    } catch (err) {
      console.error("Failed to delete file from DB", err);
    }
  };

  const handleClearFiles = async () => {
    if (confirm("Are you sure you want to remove all uploaded files? This cannot be undone.")) {
      try {
        // We must delete them one by one or clear the store. 
        // For safety/simplicity in this context, we iterate the current state IDs.
        await Promise.all(state.files.map(f => deleteFile(f.id)));
        setState(prev => ({ ...prev, files: [] }));
      } catch (err) {
        console.error("Failed to clear all files", err);
      }
    }
  };

  const handleProcess = async (selectedFileIds: string[], selectedMethods: ChunkingMethod[], params: Record<ChunkingMethod, ChunkParams>) => {
    setLoading(true);
    setState(prev => ({ ...prev, globalError: undefined }));
    
    // Initialize processing status queue
    const initialStatus: ProcessingStatus[] = [];
    selectedFileIds.forEach(fileId => {
      const file = state.files.find(f => f.id === fileId);
      if (!file) return;
      selectedMethods.forEach(method => {
        initialStatus.push({
          taskId: `${fileId}_${method}`,
          fileName: file.name,
          method,
          status: 'waiting',
          progress: 0
        });
      });
    });
    setState(prev => ({ ...prev, processingStatus: initialStatus }));

    const startTime = Date.now();
    const newCollections: VectorCollection[] = [];
    const chunkCounts: Record<string, number> = {};

    try {
      for (const fileId of selectedFileIds) {
        const file = state.files.find(f => f.id === fileId);
        if (!file) continue;

        for (const method of selectedMethods) {
          const taskId = `${fileId}_${method}`;
          
          const updateStatus = (status: ProcessingStatus['status'], progress: number, error?: ErrorInfo, sampleChunks?: string[]) => {
            setState(prev => ({
              ...prev,
              processingStatus: prev.processingStatus.map(s => 
                s.taskId === taskId ? { ...s, status, progress, error, sampleChunks: sampleChunks || s.sampleChunks } : s
              )
            }));
          };

          try {
            // 1. Chunking
            updateStatus('chunking', 20);
            const chunkResult = await chunkText(file.content, method, params[method]);
            const samples = chunkResult.chunks.slice(0, 3);
            
            // 2. Vectorization
            updateStatus('vectorizing', 50, undefined, samples);
            const vectors = await generateEmbeddings(chunkResult.chunks);

            // 3. Create Collection
            updateStatus('vectorizing', 80, undefined, samples);
            const collection: VectorCollection = {
              id: `col_${Math.random().toString(36).substr(2, 9)}`,
              name: `${file.name}_${method}_${Date.now()}`,
              chunkMethod: method,
              sourceFileId: file.id,
              sourceFileName: file.name,
              chunkCount: chunkResult.chunks.length,
              params: params[method] || {},
              createdAt: new Date().toISOString(),
              chunks: chunkResult.chunks.map((text, idx) => ({
                id: `chunk_${idx}`,
                text,
                index: idx,
                sourceFileId: file.id,
                sourceFileName: file.name,
                chunkMethod: method,
                metadata: {}
              })),
              vectors,
              embeddingModel: GEMINI_MODEL
            };

            await saveCollection(collection);
            newCollections.push(collection);
            chunkCounts[method] = (chunkCounts[method] || 0) + chunkResult.chunks.length;
            
            updateStatus('finished', 100, undefined, samples);
          } catch (itemErr: any) {
            console.error(`Error processing ${taskId}:`, itemErr);
            const errorMessage = itemErr.message || '';
            let humanMessage = "An error occurred while vectorizing this document.";

            if (errorMessage.includes('onnx')) {
              humanMessage = "Failed to load local model. Check your internet connection.";
            } else if (errorMessage.includes('GPU')) {
              humanMessage = "Your browser GPU might be restricted. Try Chrome or Firefox.";
            }
              
            updateStatus('error', 0, {
              message: humanMessage,
              technical: `${itemErr.name}: ${itemErr.message}\n${itemErr.stack || ''}`
            });
          }
        }
      }

      const experiment: Experiment = {
        id: `exp_${Date.now()}`,
        timestamp: new Date().toISOString(),
        filesProcessed: selectedFileIds.map(id => state.files.find(f => f.id === id)?.name || id),
        chunkMethods: selectedMethods,
        params,
        chunkCounts,
        processingTimeMs: Date.now() - startTime
      };

      setState(prev => ({
        ...prev,
        collections: [...prev.collections, ...newCollections],
        experiments: [experiment, ...prev.experiments],
      }));
    } catch (err: any) {
      console.error(err);
      setState(prev => ({
        ...prev,
        globalError: {
          message: "A critical failure occurred during the processing batch.",
          technical: err.stack || err.message || JSON.stringify(err)
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCollection = async (id: string) => {
    try {
      await deleteCollection(id);
      setState(prev => ({ ...prev, collections: prev.collections.filter(c => c.id !== id) }));
    } catch (err) {
      console.error("Failed to delete collection", err);
    }
  };

  const handleClearAll = async () => {
    if (confirm("Clear all collections? This cannot be undone.")) {
      try {
        await clearAllCollections();
        setState(prev => ({ ...prev, collections: [] }));
      } catch (err) {
        console.error("Failed to clear collections", err);
      }
    }
  };

  const onViewChange = (view: any) => setState(prev => ({ ...prev, activeView: view, processingStatus: [], globalError: undefined }));

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        activeView={state.activeView} 
        onViewChange={onViewChange} 
        stats={{
          files: state.files.length,
          collections: state.collections.length
        }}
      />
      
      <main className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-10 custom-scrollbar">
        <div className="max-w-6xl mx-auto pb-24">
          {state.globalError && (
            <ErrorDisplay 
              error={state.globalError} 
              onClear={() => setState(prev => ({ ...prev, globalError: undefined }))} 
            />
          )}

          {state.activeView === 'upload' && (
            <FileUpload 
              files={state.files} 
              onFilesAdded={handleFilesAdded} 
              onRemoveFile={handleRemoveFile} 
              onClearAll={handleClearFiles}
              loading={loading}
            />
          )}

          {state.activeView === 'process' && (
            <ProcessSection 
              files={state.files} 
              onProcess={handleProcess}
              loading={loading}
              processingStatus={state.processingStatus}
            />
          )}

          {state.activeView === 'search' && (
            <SearchSection 
              collections={state.collections} 
              loading={loading}
            />
          )}

          {state.activeView === 'collections' && (
            <CollectionsManager 
              collections={state.collections} 
              experiments={state.experiments}
              onDelete={handleDeleteCollection}
              onClearAll={handleClearAll}
            />
          )}
        </div>
      </main>

      <GuidanceBalloon 
        filesCount={state.files.length}
        collectionsCount={state.collections.length}
        activeView={state.activeView}
        isProcessing={loading}
        onNavigate={onViewChange}
      />
    </div>
  );
};

export default App;
