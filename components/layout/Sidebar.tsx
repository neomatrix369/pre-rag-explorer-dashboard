
import React from 'react';
import { Icons } from '../../constants';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  stats: { files: number; collections: number };
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, stats }) => {
  const navItems = [
    { id: 'upload', label: '1. Load Data', icon: <Icons.Upload /> },
    { id: 'process', label: '2. Chunk & Vectorize', icon: <Icons.Cog /> },
    { id: 'search', label: '3. Search', icon: <Icons.Search /> },
    { id: 'collections', label: 'Management', icon: <Icons.Database /> },
  ];

  return (
    <aside className="w-80 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 transition-all duration-300">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-900/20 shrink-0">
            P
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">Explorer</h1>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold whitespace-nowrap">Pre-RAG Dashboard</p>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center justify-start gap-3 px-4 py-3 rounded-lg transition-all duration-200 group text-left ${
                activeView === item.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className={`shrink-0 ${activeView === item.id ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>
                {item.icon}
              </span>
              <span className="font-medium whitespace-nowrap">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-slate-800 space-y-4 bg-slate-900/50">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500">Files</span>
          <span className="font-bold text-white">{stats.files}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500">Collections</span>
          <span className="font-bold text-white">{stats.collections}</span>
        </div>
        
        <div className="pt-4">
          <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-500" 
              style={{ width: `${Math.min(100, (stats.collections / 10) * 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-tight">Capacity Usage Estimate</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
