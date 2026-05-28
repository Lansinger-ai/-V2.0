import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  X, Settings2, Save, Cpu, HardDrive, Layout, Trash2, AlertTriangle, Plus, 
  ChevronDown, Layers, RefreshCcw, Upload, FileText, CheckCircle, AlertCircle, Copy, HelpCircle 
} from 'lucide-react';
import { ServerAsset, LogEntry } from '../types';

interface ModelItem {
  id: string;
  name: string;
  qty: number;
}

interface SpecItem {
  id: string;
  name: string;
  totalQty: number;
  models: ModelItem[];
}

const HARDWARE_CATALOG: Record<string, { specs: string[]; mapping: Record<string, string[]> }> = {
  cpu: {
    specs: ['Intel Xeon 8358', 'Intel Xeon Platinum 8480C', 'AMD EPYC 9654', 'Intel Xeon 8350'],
    mapping: {
      'Intel Xeon 8358': ['Intel-8358-Standard-V2', 'Intel-8358-Retail', 'Intel-8358-OEM'],
      'Intel Xeon Platinum 8480C': ['Intel-8480C-QS', 'Intel-8480C-Retail-V1'],
      'AMD EPYC 9654': ['AMD-EPYC-9654-Retail'],
      'Intel Xeon 8350': ['Intel-8350-OEM']
    }
  },
  gpu: {
    specs: ['NVIDIA A100 80GB', 'NVIDIA H100 80GB', 'NVIDIA L40S', 'NVIDIA RTX 4090'],
    mapping: {
      'NVIDIA A100 80GB': ['A100-PG150-S01', 'A100-SXM4-80GB'],
      'NVIDIA H100 80GB': ['H100-PG520-S01', 'H100-SXM5-80GB'],
      'NVIDIA L40S': ['L40S-NVLink-V1'],
      'NVIDIA RTX 4090': ['RTX-4090-FE']
    }
  },
  memory: {
    specs: ['32GB DDR4', '64GB DDR4', '64GB DDR5'],
    mapping: {
      '32GB DDR4': ['Samsung-DDR4-3200', 'Hynix-DDR4-3200', 'Micron-DDR4-3200'],
      '64GB DDR4': ['Samsung-DDR4-3200-HR'],
      '64GB DDR5': ['Samsung-DDR5-4800', 'Hynix-DDR5-4800']
    }
  },
  ssd: {
    specs: ['1.92TB NVMe', '3.84TB NVMe', '7.68TB NVMe'],
    mapping: {
      '1.92TB NVMe': ['Samsung-PM9A3', 'Intel-D7-P5510'],
      '3.84TB NVMe': ['Samsung-PM1733', 'Micron-7450-Pro'],
      '7.68TB NVMe': ['Samsung-PM1733-Max']
    }
  },
  fpga: {
    specs: ['Xilinx Alveo U250', 'Xilinx Alveo U200'],
    mapping: {
      'Xilinx Alveo U250': ['U250-PQ123', 'U250-Custom'],
      'Xilinx Alveo U200': ['U200-PQ456']
    }
  }
};

const CATEGORIES = [
  { id: 'gpu', label: 'GPU', icon: <Layout size={14} /> },
  { id: 'cpu', label: 'CPU', icon: <Cpu size={14} /> },
  { id: 'memory', label: '内存', icon: <Settings2 size={14} /> },
  { id: 'networkCard', label: '网卡', icon: <Layout size={14} /> },
  { id: 'harddisk', label: '硬盘', icon: <HardDrive size={14} /> },
  { id: 'ssd', label: 'SSD', icon: <HardDrive size={14} /> },
  { id: 'raid', label: 'RAID', icon: <Settings2 size={14} /> },
  { id: 'fpga', label: 'FPGA', icon: <Cpu size={14} /> },
];

const isAbnormalStr = (text: string): boolean => {
  if (!text) return false;
  const lower = text.toLowerCase();
  return lower.includes('err:') || lower.includes('unknown') || lower.includes('mismatch') || lower.includes('bad');
};

const parseToNested = (specStr: string, modelStr: string): SpecItem[] => {
  if (!specStr || specStr === '-') return [];
  const specParts = specStr.split('|').map(s => s.trim());
  const modelParts = modelStr.split('|').map(m => m.trim());

  return specParts.map((s, idx) => {
    const specMatch = s.match(/(.+)\s+x(\d+)/) || [null, s, '1'];
    const specName = specMatch[1]?.trim() || s;
    const specQty = parseInt(specMatch[2] || '1');

    const mPart = modelParts[idx] || '';
    const mRows = mPart.split(';').map(m => m.trim()).filter(Boolean);
    
    const models: ModelItem[] = mRows.map(m => {
      const mMatch = m.match(/(.+)\s+x(\d+)/) || [null, m, '1'];
      return {
        id: Math.random().toString(36).substr(2, 9),
        name: mMatch[1]?.trim() || m,
        qty: parseInt(mMatch[2] || '1')
      };
    });

    return {
      id: Math.random().toString(36).substr(2, 9),
      name: specName,
      totalQty: specQty,
      models
    };
  });
};

interface BulkUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ServerAsset[];
  onSaveBulk: (sns: string[], updates: Partial<ServerAsset>) => void;
}

export const BulkUpdateModal: React.FC<BulkUpdateModalProps> = ({
  isOpen,
  onClose,
  data,
  onSaveBulk
}) => {
  const [snInput, setSnInput] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('gpu');
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  
  // Storage for the bulk config editing values
  const [configs, setConfigs] = useState<Record<string, SpecItem[]>>({});
  const [templateToLoad, setTemplateToLoad] = useState<ServerAsset | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse SNs from text area
  const parsedSNs = useMemo(() => {
    if (!snInput) return [];
    return snInput
      .split(/[\s,;\n]+/)
      .filter(Boolean)
      .map(s => s.trim().toUpperCase());
  }, [snInput]);

  // Unique listed target SNs
  const uniqueSNs = useMemo(() => {
    return Array.from(new Set(parsedSNs));
  }, [parsedSNs]);

  // Map inputted SNs to database matching state
  const resolvedServers = useMemo(() => {
    return uniqueSNs.map(sn => {
      const found = data.find(item => item.sn.toUpperCase() === sn);
      return {
        sn,
        found: !!found,
        server: found || null
      };
    });
  }, [uniqueSNs, data]);

  // Only count matched valid servers
  const validServers = useMemo(() => {
    return resolvedServers.filter(s => s.found && s.server).map(s => s.server as ServerAsset);
  }, [resolvedServers]);

  const invalidSnsCount = useMemo(() => {
    return resolvedServers.filter(s => !s.found).length;
  }, [resolvedServers]);

  // Initialize form options
  useEffect(() => {
    if (isOpen) {
      // Start with clean default configurations for all categories
      const initial: Record<string, SpecItem[]> = {};
      CATEGORIES.forEach(cat => {
        initial[cat.id] = [];
      });
      setConfigs(initial);
      setSnInput('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const activeCategoryLabel = CATEGORIES.find(c => c.id === activeTab)?.label || '';

  const checkCategoryAbnormality = (catId: string): boolean => {
    const specs = configs[catId] || [];
    return specs.some(s => {
      const nameAbnormal = isAbnormalStr(s.name);
      const modelNameAbnormal = s.models.some(m => isAbnormalStr(m.name));
      const hasModels = s.models.length > 0 && s.models.some(m => m.name.trim() !== '');
      const currentModelQtySum = s.models.reduce((sum, m) => sum + m.qty, 0);
      const qtyMismatch = hasModels && (currentModelQtySum !== s.totalQty);
      return nameAbnormal || modelNameAbnormal || qtyMismatch;
    });
  };

  const addSpec = (catId: string) => {
    const newSpec: SpecItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      totalQty: 1,
      models: [{ id: Math.random().toString(36).substr(2, 9), name: '', qty: 1 }]
    };
    setConfigs(prev => ({ ...prev, [catId]: [...(prev[catId] || []), newSpec] }));
  };

  const removeSpec = (catId: string, specId: string) => {
    setConfigs(prev => ({ ...prev, [catId]: prev[catId].filter(s => s.id !== specId) }));
  };

  const updateSpec = (catId: string, specId: string, updates: Partial<SpecItem>) => {
    setConfigs(prev => ({
      ...prev,
      [catId]: prev[catId].map(s => {
        if (s.id !== specId) return s;
        const next = { ...s, ...updates };
        if (updates.name && HARDWARE_CATALOG[catId]) {
          const firstModel = HARDWARE_CATALOG[catId].mapping[updates.name]?.[0] || '';
          if (next.models.length === 0) {
             next.models = [{ id: Math.random().toString(36).substr(2, 9), name: firstModel, qty: next.totalQty }];
          } else {
             next.models = next.models.map((m, idx) => idx === 0 ? { ...m, name: firstModel } : m);
          }
        }
        return next;
       })
    }));
  };

  const addModel = (catId: string, specId: string) => {
    setConfigs(prev => ({
      ...prev,
      [catId]: prev[catId].map(s => s.id === specId ? {
        ...s,
        models: [...s.models, { id: Math.random().toString(36).substr(2, 9), name: '', qty: 1 }]
      } : s)
    }));
  };

  const removeModel = (catId: string, specId: string, modelId: string) => {
    setConfigs(prev => ({
      ...prev,
      [catId]: prev[catId].map(s => s.id === specId ? {
        ...s,
        models: s.models.filter(m => m.id !== modelId)
      } : s)
    }));
  };

  const updateModel = (catId: string, specId: string, modelId: string, updates: Partial<ModelItem>) => {
    setConfigs(prev => ({
      ...prev,
      [catId]: prev[catId].map(s => s.id === specId ? {
        ...s,
        models: s.models.map(m => m.id === modelId ? { ...m, ...updates } : m)
      } : s)
    }));
  };

  const handleClearCurrentCategory = () => {
    setConfigs(prev => ({ ...prev, [activeTab]: [] }));
  };

  // Set the visual configuration based on an existing template server
  const handleLoadTemplateServer = (server: ServerAsset) => {
    const hasActiveConfigs = Object.values(configs).some((specs: any) => Array.isArray(specs) && specs.length > 0);
    if (hasActiveConfigs) {
      setTemplateToLoad(server);
    } else {
      applyTemplate(server);
    }
  };

  const applyTemplate = (server: ServerAsset) => {
    const loaded: Record<string, SpecItem[]> = {};
    CATEGORIES.forEach(cat => {
      const sVal = (server as any)[cat.id] || '';
      const mVal = (server as any)[`${cat.id}Model`] || '';
      loaded[cat.id] = parseToNested(sVal, mVal);
    });
    setConfigs(loaded);
    setTemplateToLoad(null);
  };

  const handleFinalSave = () => {
    const finalUpdates: any = {};
    CATEGORIES.forEach(cat => {
      const specs = configs[cat.id] || [];
      const validSpecs = specs.filter(s => s.name.trim() !== '');
      
      if (validSpecs.length > 0) {
        finalUpdates[cat.id] = validSpecs.map(s => `${s.name} x${s.totalQty}`).join(' | ');
        finalUpdates[`${cat.id}Model`] = validSpecs.map(s => {
          const modelStrs = s.models
            .filter(m => m.name.trim() !== '')
            .map(m => `${m.name} x${m.qty}`);
          return modelStrs.length > 0 ? modelStrs.join('; ') : '-';
        }).join(' | ');
      } else {
        // If left as empty, we keep existing or set as empty '-' depending on user preference.
        // Let's explicitly set to Empty to allow blanking out or replaying clean configs.
        finalUpdates[cat.id] = '-';
        finalUpdates[`${cat.id}Model`] = '-';
      }
    });

    const targetSNs = validServers.map(s => s.sn);
    onSaveBulk(targetSNs, finalUpdates);
    onClose();
  };

  // Parse SN file import supporting plain text, CSV and Excel format
  const parseExcelOrTextFile = (file: File) => {
    const name = file.name.toLowerCase();
    if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const arrayBuffer = event.target?.result;
        if (arrayBuffer) {
          try {
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
            const allCells: string[] = [];
            rows.forEach((row: any) => {
              if (Array.isArray(row)) {
                row.forEach((cell: any) => {
                  if (cell !== undefined && cell !== null) {
                    const str = String(cell).trim();
                    if (str) allCells.push(str);
                  }
                });
              }
            });
            setSnInput(allCells.join('\n'));
          } catch (err) {
            alert('读取 Excel 失败，请检查文件格式！');
            console.error(err);
          }
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          setSnInput(text);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      parseExcelOrTextFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      parseExcelOrTextFile(file);
    }
  };

  // Count if a server already has existing config on any field
  const getServerConfigCount = (server: ServerAsset) => {
    let count = 0;
    CATEGORIES.forEach(cat => {
      const val = (server as any)[cat.id];
      if (val && val !== '-' && val !== '') {
        count++;
      }
    });
    return count;
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300 p-4">
      <div className="bg-white w-[95vw] max-w-[1600px] h-[94vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100 ring-2 ring-white">
              <Layers size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">批量更新服务器硬件配置</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                支持批量输入或导入多个服务器 SN，统一覆盖并重写配置。可查看服务器是否已有配置。
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Content Panel */}
        <div className="flex-1 flex overflow-hidden min-h-0 min-w-0">
          
          {/* Left panel: Input and Validations */}
          <div className="w-[600px] bg-slate-50/50 border-r border-slate-100 flex flex-col p-6 overflow-y-auto custom-scrollbar shrink-0">
            
            {/* Step 1: Input Area */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span className="w-5 h-5 bg-indigo-50 text-indigo-600 flex items-center justify-center rounded text-[10px] font-bold font-mono">1</span>
                手动输入或导入服务器 SN (每行或逗号隔开)
              </h3>
              
              {/* File Upload zone */}
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
                  isDragging 
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-500'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".txt,.csv,.xlsx,.xls"
                  className="hidden" 
                />
                <Upload size={18} className={isDragging ? 'text-indigo-600' : 'text-slate-400'} />
                <div>
                  <span className="text-[11px] font-bold text-slate-700">点击上传或将文件拖拽到此</span>
                  <p className="text-[9px] text-slate-400 mt-0.5">支持 .txt、.csv、.xlsx、.xls (文本或 Excel 格式)</p>
                </div>
              </div>

              {/* Text Area input */}
              <div className="relative">
                <textarea
                  value={snInput}
                  onChange={e => setSnInput(e.target.value)}
                  placeholder="请输入服务器 SN，例如：&#10;SN-1000&#10;SN-1001, SN-1002&#10;SN-1003"
                  className="w-full h-36 border border-slate-200 rounded-2xl p-3 text-xs outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 font-mono resize-none shadow-inner leading-relaxed bg-white"
                />
                {snInput && (
                  <button 
                    onClick={() => setSnInput('')}
                    className="absolute right-3.5 bottom-3.5 px-2 py-1 text-[9px] bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold rounded-lg transition-all active:scale-95 border border-slate-200"
                  >
                    一键清空
                  </button>
                )}
              </div>
            </div>

            {/* Validation & Display lists */}
            <div className="mt-5 flex-1 flex flex-col min-h-[200px]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <span className="w-5 h-5 bg-indigo-50 text-indigo-600 flex items-center justify-center rounded text-[10px] font-bold font-mono">2</span>
                  解析服务器 SN
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200 text-slate-600 rounded">
                  输入 {uniqueSNs.length} 台
                </span>
              </div>

              {uniqueSNs.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-slate-200 border-dashed rounded-2xl bg-white/40">
                  <FileText size={24} className="text-slate-300 mb-2" />
                  <p className="text-[11px] text-slate-400 italic">请在上方步骤 1 中输入或导入服务器 SN</p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col gap-3 min-h-0">
                  {/* Status Indicator Bar */}
                  <div className="grid grid-cols-2 gap-2 shrink-0">
                    <div className="bg-green-50/50 border border-green-100 rounded-xl p-2.5 flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xs font-bold">
                        {validServers.length}
                      </div>
                      <div className="leading-tight">
                        <p className="text-[10px] font-bold text-slate-700">匹配成功</p>
                        <p className="text-[9px] text-slate-400">可在系统中更新</p>
                      </div>
                    </div>
                    <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-2.5 flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 text-xs font-bold">
                        {invalidSnsCount}
                      </div>
                      <div className="leading-tight">
                        <p className="text-[10px] font-bold text-slate-700">未匹配到 SN</p>
                        <p className="text-[9px] text-slate-400">将跳过更新</p>
                      </div>
                    </div>
                  </div>

                  {/* Matched Servers List with original configurations info (展示之前服务器的是否已有配置) */}
                  <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-100 bg-white shadow-inner p-3 space-y-2 min-h-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">点击服务器可【套用该配置】作为模板：</p>
                    {resolvedServers.map((s, idx) => {
                      if (!s.found || !s.server) {
                        return (
                          <div key={idx} className="flex items-center justify-between p-2.5 bg-rose-50/50 hover:bg-rose-50 rounded-xl border border-rose-100/50">
                            <div className="flex items-center gap-2">
                              <AlertCircle size={14} className="text-rose-500 shrink-0" />
                              <span className="text-[11px] font-mono font-bold text-rose-600 shrink-0">{s.sn}</span>
                            </div>
                            <span className="text-[9px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-bold">
                              无效 SN
                            </span>
                          </div>
                        );
                      }

                      const specCount = getServerConfigCount(s.server);
                      const isConfigured = specCount > 0;

                      return (
                        <div 
                          key={s.server.id} 
                          title="点击套用其所有硬件规格作为批量编辑模板"
                          onClick={() => s.server && handleLoadTemplateServer(s.server)}
                          className="group border border-slate-100 bg-slate-50/30 hover:border-indigo-200 hover:bg-indigo-50/25 p-3 rounded-xl transition-all cursor-pointer relative"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <CheckCircle size={14} className="text-green-500 shrink-0" />
                              <span className="text-[11px] font-mono font-bold text-slate-800 shrink-0">{s.sn}</span>
                              <span className="text-[10px] text-slate-400 shrink-0">|</span>
                              <span className="text-[10px] text-slate-500 font-medium truncate max-w-[120px]" title={s.server.hostname}>
                                {s.server.hostname || '无主机名'}
                              </span>
                            </div>
                            <button 
                              className="text-[9px] text-indigo-600 font-bold flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200"
                            >
                              <Copy size={10} /> 套用模板
                            </button>
                          </div>

                          {/* Existing Specs overview (展示之前是否存在配置) */}
                          <div className="pl-5 space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                isConfigured 
                                  ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                                  : 'bg-slate-100 text-slate-400 border border-slate-200/60'
                              }`}>
                                {isConfigured ? '已有配置' : '无任何配置'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Tabbed Custom Configurations Editor */}
          <div className="flex-1 flex md:flex-row flex-col min-w-0 bg-white">
            
            {/* Tab selector */}
            <div className="w-44 bg-slate-50/80 border-r border-slate-100 p-4 space-y-1 overflow-y-auto shrink-0 flex flex-col">
              <p className="px-3 py-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">3. 统一覆盖配置</p>
              {CATEGORIES.map(cat => {
                const hasAbnormality = checkCategoryAbnormality(cat.id);
                const isActive = activeTab === cat.id;

                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveTab(cat.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[11px] font-bold transition-all relative group ${
                      isActive 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                        : hasAbnormality 
                          ? 'bg-rose-50 text-rose-600 border border-rose-200'
                          : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={hasAbnormality && !isActive ? 'animate-pulse' : ''}>
                         {cat.icon}
                      </div>
                      {cat.label}
                    </div>
                    <div className="flex items-center gap-1">
                      {hasAbnormality && !isActive && (
                        <AlertTriangle size={10} className="text-rose-500" />
                      )}
                      {(configs[cat.id]?.length || 0) > 0 && (
                        <span className={`px-1.5 py-0.5 scale-90 rounded-full text-[8px] ${isActive ? 'bg-white text-indigo-600' : 'bg-slate-200 text-slate-600'}`}>
                          {configs[cat.id].length}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
              
              {/* Help tip card */}
              <div className="mt-auto bg-indigo-50/50 border border-indigo-100 p-3 rounded-xl">
                <div className="flex gap-1.5 text-indigo-600 mb-1">
                  <HelpCircle size={12} className="shrink-0 mt-0.5" />
                  <span className="text-[10px] font-bold">温馨提示</span>
                </div>
                <p className="text-[9px] text-slate-500 leading-relaxed">
                  编辑右侧配件信息将覆盖所选 SN 对应分类的规格。如果您不想重写某个配件，可将其保持为空。
                </p>
              </div>
            </div>

            {/* Category content editor */}
            <div className="flex-1 overflow-y-auto p-8 flex flex-col min-h-0 min-w-0">
              <div className="flex items-center justify-between mb-6 border-b border-slate-50 pb-4 shrink-0">
                <div>
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    {activeCategoryLabel} 批量更新项
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">该规格将覆盖并应用到所选的 {validServers.length} 台服务器中</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleClearCurrentCategory}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-bold hover:bg-rose-100 transition-all active:scale-95 border border-rose-100"
                    title="清空并暂置为 `-` （还原初始/无）"
                  >
                    <Trash2 size={12} /> 清空当前项
                  </button>
                  <div className="w-px h-5 bg-slate-100 mx-1" />
                  <button 
                    onClick={() => addSpec(activeTab)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-[10px] font-bold hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100"
                  >
                    <Plus size={12} /> 添加新规格
                  </button>
                </div>
              </div>

              {/* Specs array mapping content */}
              <div className="flex-1 space-y-6">
                {(configs[activeTab] || []).map((spec, sIdx) => {
                  const catalog = HARDWARE_CATALOG[activeTab];
                  const validModels = (catalog && catalog.mapping[spec.name]) || [];
                  const currentModelQtySum = spec.models.reduce((sum, m) => sum + m.qty, 0);
                  
                  const hasModels = spec.models.length > 0 && spec.models.some(m => m.name.trim() !== '');
                  const isMismatch = hasModels && (currentModelQtySum !== spec.totalQty);
                  const isSpecAbnormal = isAbnormalStr(spec.name);

                  return (
                    <div key={spec.id} className={`group bg-white border rounded-2xl overflow-hidden transition-all hover:shadow-lg hover:shadow-slate-50 ${isMismatch || isSpecAbnormal ? 'border-rose-200 bg-rose-50/5' : 'border-slate-200 hover:border-indigo-200 bg-white'}`}>
                      {/* Spec header */}
                      <div className={`px-6 py-4 flex items-center gap-4 border-b ${isMismatch || isSpecAbnormal ? 'bg-rose-50/30 border-rose-100' : 'bg-slate-50/40 border-slate-100'}`}>
                        <div className="flex-1 flex gap-3 items-center">
                          <div className="flex flex-col flex-1 gap-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">规格名称 (Spec)</label>
                            <div className="relative">
                              {catalog ? (
                                <select 
                                  value={spec.name}
                                  onChange={e => updateSpec(activeTab, spec.id, { name: e.target.value })}
                                  className={`w-full border rounded-xl px-3 py-1.5 text-xs font-bold outline-none appearance-none pr-8 ${isSpecAbnormal ? 'bg-rose-50 border-rose-300 text-rose-700 focus:ring-rose-500' : 'bg-white border-slate-200 focus:ring-indigo-500'}`}
                                >
                                  <option value="" disabled>选择规格参数...</option>
                                  {catalog.specs.map(s => <option key={s} value={s}>{s}</option>)}
                                  {spec.name && !catalog.specs.includes(spec.name) && <option value={spec.name}>{spec.name}</option>}
                                </select>
                              ) : (
                                <input 
                                  type="text" 
                                  value={spec.name}
                                  onChange={e => updateSpec(activeTab, spec.id, { name: e.target.value })}
                                  className={`w-full border rounded-xl px-3 py-1.5 text-xs font-bold outline-none ${isSpecAbnormal ? 'bg-rose-50 border-rose-300 text-rose-700 focus:ring-rose-500' : 'bg-white border-slate-200 focus:ring-indigo-500'}`}
                                  placeholder="输入物理规格或型号描述..."
                                />
                              )}
                            </div>
                          </div>
                          <div className="w-24 flex flex-col gap-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">设备件数</label>
                            <div className={`flex items-center gap-1 border rounded-xl px-2.5 py-1.5 ${isMismatch ? 'bg-rose-50/55 border-rose-300' : 'bg-white border-slate-200'}`}>
                              <span className="text-[10px] font-bold text-slate-400">x</span>
                              <input 
                                type="number" 
                                value={spec.totalQty}
                                onChange={e => updateSpec(activeTab, spec.id, { totalQty: parseInt(e.target.value) || 0 })}
                                className="w-full text-xs font-bold outline-none bg-transparent"
                              />
                            </div>
                          </div>
                        </div>
                        <button onClick={() => removeSpec(activeTab, spec.id)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all mt-4 shrink-0">
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Models lists details override */}
                      <div className="p-6 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-bold text-slate-400 uppercase">子配件 Model 绑定列表</span>
                            {isMismatch && (
                              <span className="text-[8px] font-bold text-rose-600 flex items-center gap-0.5 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                                <AlertTriangle size={8} /> 件数不匹配 ({currentModelQtySum}/{spec.totalQty})
                              </span>
                            )}
                          </div>
                          <button 
                            onClick={() => addModel(activeTab, spec.id)}
                            className="text-[9px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5 px-1.5 py-0.5 rounded hover:bg-indigo-50 transition-all font-mono"
                          >
                            + 加 Model
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                          {spec.models.map((model, mIdx) => {
                            const isMAbnormal = isAbnormalStr(model.name);
                            return (
                              <div key={model.id} className={`flex items-center gap-3 p-3 rounded-xl border ${isMAbnormal ? 'bg-rose-50/10 border-rose-100' : 'bg-slate-50/30 border-slate-100'}`}>
                                <div className="w-5 h-5 border rounded-full flex items-center justify-center text-[9px] font-bold bg-white text-slate-400 shrink-0">
                                  {mIdx + 1}
                                </div>
                                <div className="flex-1 flex relative">
                                  {validModels.length > 0 ? (
                                    <select 
                                      value={model.name}
                                      onChange={e => updateModel(activeTab, spec.id, model.id, { name: e.target.value })}
                                      className={`w-full border rounded-lg px-2.5 py-1 text-xs font-mono font-bold outline-none appearance-none pr-8 ${isMAbnormal ? 'bg-white border-rose-300 text-rose-700 focus:ring-rose-500' : 'bg-white border-slate-200 focus:ring-indigo-500'}`}
                                    >
                                      <option value="" disabled>选择硬件部件型号...</option>
                                      {validModels.map(m => <option key={m} value={m}>{m}</option>)}
                                      {model.name && !validModels.includes(model.name) && <option value={model.name}>{model.name}</option>}
                                    </select>
                                  ) : (
                                    <input 
                                      type="text" 
                                      value={model.name}
                                      onChange={e => updateModel(activeTab, spec.id, model.id, { name: e.target.value })}
                                      className={`w-full border rounded-lg px-2.5 py-1 text-xs font-mono font-bold outline-none ${isMAbnormal ? 'bg-white border-rose-300 text-rose-700 focus:ring-rose-500' : 'bg-white border-slate-200 focus:ring-indigo-500'}`}
                                      placeholder="输入部件 Model 编号/编码..."
                                    />
                                  )}
                                  <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                                <div className="w-20">
                                  <div className="flex items-center gap-1 border rounded-lg px-2 py-1 bg-white border-slate-200">
                                    <span className="text-[9px] font-bold text-slate-400">x</span>
                                    <input 
                                      type="number" 
                                      value={model.qty}
                                      onChange={e => updateModel(activeTab, spec.id, model.id, { qty: parseInt(e.target.value) || 0 })}
                                      className="w-full text-xs font-bold outline-none bg-transparent"
                                    />
                                  </div>
                                </div>
                                <button onClick={() => removeModel(activeTab, spec.id, model.id)} className="p-1.5 text-slate-300 hover:text-rose-400 transition-colors">
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            );
                          })}
                          
                          {spec.models.length === 0 && (
                            <div className="py-2.5 text-center border border-dashed border-slate-100 rounded-lg text-[9px] text-slate-400 italic">
                              暂无子 Model 映射
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {(!configs[activeTab] || configs[activeTab]?.length === 0) && (
                  <div className="py-16 text-center border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center gap-1.5 bg-slate-50/10">
                    <div className="p-3 bg-slate-50 rounded-full text-slate-300">
                      <Layers size={24} />
                    </div>
                    <p className="text-slate-400 text-xs italic">当前分类暂不配置 (若保存将清空/重置为 “-”)</p>
                    <button 
                      onClick={() => addSpec(activeTab)} 
                      className="mt-2 text-[10px] font-bold text-indigo-600 px-3 py-1 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-all"
                    >
                      立即开启配置
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Area */}
        <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 text-slate-400">
            <AlertTriangle size={14} className="text-amber-500 shrink-0" />
            <p className="text-[10px] font-medium leading-relaxed uppercase tracking-tight text-left">
              保存将同时覆盖这 <span className="text-slate-700 font-bold">{validServers.length}</span> 台验证通过的合法服务器的相关配置并记录审计日志。<br/>
              如果某硬件分类未配置任何项，则默认在批量生效时会将该分类配置重置为 <span className="font-mono text-slate-600 font-bold">“-”</span>。
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={onClose} 
              className="px-6 py-2 text-xs font-bold text-slate-500 hover:bg-slate-200/50 rounded-xl transition-all"
            >
              取消并退出
            </button>
            <button 
              onClick={() => {
                if (validServers.length === 0) {
                  alert('请至少输入 1 台匹配成功的合法服务器 SN 进行批量物理改配！');
                  return;
                }
                setShowConfirm(true);
              }} 
              disabled={validServers.length === 0}
              className={`flex items-center gap-1.5 px-10 py-2.5 rounded-xl text-xs font-bold shadow-xl transition-all active:scale-95 text-white ${
                validServers.length === 0 
                  ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                  : 'bg-green-600 hover:bg-green-700 shadow-green-100'
              }`}
            >
              <Save size={14} /> 批量更新此 {validServers.length} 台配置
            </button>
          </div>
        </div>

        {/* Confirmation Overlap */}
        {showConfirm && (
          <div className="absolute inset-0 z-[130] bg-slate-900/40 backdrop-blur-[6px] flex items-center justify-center animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full mx-4 flex flex-col items-center text-center border border-white">
              <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-5 ring-4 ring-amber-50/50">
                <AlertTriangle size={32} />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">确认进行批量硬件覆盖？</h4>
              <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                您正在批量覆写这 <b>{validServers.length}台</b> 资产配置：<br/>
                <span className="font-mono text-[10px] bg-indigo-50/50 text-indigo-700 px-2 py-1 rounded inline-block mt-2">
                  {validServers.map(s => s.sn).join(', ')}
                </span>
                <br/><br/>
                此变动将独立记录每一台服务器的历史日志。请务必确认规格及 Model 是否合法。
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 px-4 py-2.5 text-xs font-bold text-slate-400 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all"
                >
                  继续检查
                </button>
                <button 
                  onClick={handleFinalSave}
                  className="flex-1 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95"
                >
                  确认批量覆写
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Template Overwrite Confirmation Overlap */}
        {templateToLoad && (
          <div className="absolute inset-0 z-[130] bg-slate-900/40 backdrop-blur-[6px] flex items-center justify-center animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full mx-4 flex flex-col items-center text-center border border-white">
              <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-5 ring-4 ring-amber-50/50">
                <AlertTriangle size={32} />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">是否套用此资产模板？</h4>
              <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                您当前右侧已经编辑或开启了硬件配置项。套用来自 <b>{templateToLoad.sn}</b> 的硬件模板将完全覆盖您当前填写的配置。
                <br/><br/>
                此操作无法撤销，确定套用模板并清空现有草稿吗？
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setTemplateToLoad(null)}
                  className="flex-1 px-4 py-2.5 text-xs font-bold text-slate-400 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all"
                >
                  取消
                </button>
                <button 
                  onClick={() => applyTemplate(templateToLoad)}
                  className="flex-1 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95"
                >
                  确定套用
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
