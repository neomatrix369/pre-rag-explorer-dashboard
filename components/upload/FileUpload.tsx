
import React, { useRef } from 'react';
import { UploadedFile } from '../../types';
import { Icons } from '../../constants';

interface FileUploadProps {
  files: UploadedFile[];
  onFilesAdded: (files: File[]) => void;
  onRemoveFile: (id: string) => void;
  onClearAll?: () => void;
  loading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ files, onFilesAdded, onRemoveFile, onClearAll, loading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesAdded(Array.from(e.target.files));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Upload Data</h2>
        <p className="text-slate-500 max-w-2xl">Start your Pre-RAG pipeline by uploading source documents. We support PDF, CSV, Markdown, and plain text files.</p>
      </header>

      <div 
        onClick={() => fileInputRef.current?.click()}
        className="relative group border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer overflow-hidden"
      >
        <input 
          type="file" 
          multiple 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileChange}
          accept=".pdf,.csv,.md,.txt"
        />
        
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
            <Icons.Upload />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Drag & Drop files here</h3>
          <p className="text-slate-500 mt-1">or click to browse from your computer</p>
          <div className="mt-6 flex gap-2">
            {['PDF', 'CSV', 'MD', 'TXT'].map(type => (
              <span key={type} className="px-2 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded border border-slate-200 uppercase tracking-tighter">
                {type}
              </span>
            ))}
          </div>
        </div>
        
        {loading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium text-slate-600">Parsing documents...</p>
            </div>
          </div>
        )}
      </div>

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
             <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Uploaded Documents ({files.length})</h3>
             {onClearAll && (
               <button 
                onClick={onClearAll}
                className="text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
               >
                 <Icons.Trash />
                 Clear All
               </button>
             )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file) => (
              <div key={file.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow group relative">
                <button 
                  onClick={() => onRemoveFile(file.id)}
                  className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Icons.Trash />
                </button>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 shrink-0 font-bold text-xs uppercase">
                    {file.type}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-slate-900 truncate pr-4">{file.name}</h4>
                    <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB • {new Date(file.uploadedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-[11px] text-slate-400 line-clamp-3 bg-slate-50 p-2 rounded italic">
                    "{file.content.slice(0, 150)}..."
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
