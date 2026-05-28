
import React from 'react';
import { X, Check, RotateCcw, Layout } from 'lucide-react';
import { COLUMNS } from '../constants';

interface ColumnConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  visibleKeys: Set<string>;
  onChange: (keys: Set<string>) => void;
}

export const ColumnConfigModal: React.FC<ColumnConfigModalProps> = ({ isOpen, onClose, visibleKeys, onChange }) => {
  if (!isOpen) return null;

  const toggleColumn = (key: string) => {
    const next = new Set(visibleKeys);
    if (next.has(key)) {
      if (next.size > 1) next.delete(key); // Ensure at least one column remains
    } else {
      next.add(key);
    }
    onChange(next);
  };

  const resetToDefault = () => {
    onChange(new Set(COLUMNS.map(c => c.key)));
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-[500px] max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl shadow-sm">
              <Layout size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-sm">设置显示字段</h3>
              <p className="text-[10px] text-gray-500 font-medium">勾选您希望在资产列表中看到的字段</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-white custom-scrollbar-thin">
          <div className="grid grid-cols-2 gap-3">
            {COLUMNS.map(col => (
              <div 
                key={col.key}
                onClick={() => toggleColumn(col.key)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all cursor-pointer group ${
                  visibleKeys.has(col.key) 
                    ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                    : 'bg-white border-gray-100 hover:border-gray-200 text-gray-400'
                }`}
              >
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                  visibleKeys.has(col.key) ? 'bg-indigo-600 border-indigo-600' : 'border-gray-200 group-hover:border-gray-300'
                }`}>
                  {visibleKeys.has(col.key) && <Check size={12} className="text-white" />}
                </div>
                <span className={`text-[12px] font-bold ${visibleKeys.has(col.key) ? 'text-indigo-900' : 'text-gray-500'}`}>
                  {col.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <button 
            onClick={resetToDefault}
            className="flex items-center gap-2 px-4 py-2 text-[11px] font-bold text-gray-500 hover:bg-white hover:shadow-sm rounded-lg transition-all"
          >
            <RotateCcw size={14} /> 恢复默认显示
          </button>
          <button 
            onClick={onClose}
            className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-[12px] font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
          >
            完成设置
          </button>
        </div>
      </div>
    </div>
  );
};
