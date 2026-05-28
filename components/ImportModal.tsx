
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { X, Upload, FileText, CheckCircle, AlertTriangle, ChevronRight, Save, ChevronDown, ListFilter, Cpu, HardDrive, Layout, Server, FileUp, ArrowRight, Layers, Settings2, Database, Search, Hash, PlusCircle, AlertCircle, Activity, ExternalLink, Factory, FileArchive, Check, RotateCcw, Boxes, Info, Filter, Zap, Trash2, FilePlus, Star, Plus, Download, Eye } from 'lucide-react';

export interface ParsedConfig {
  id: string;
  sourceFiles: string[];
  suggestedSNs: string[];
  additionalSNs: string[]; 
  rawIds: Record<string, string>; 
  rawQtys: Record<string, number>; 
  specs: Record<string, string>;
  models: Record<string, string>;
}

const ALL_MANUFACTURERS = [
  '浪潮 (Inspur)', '戴尔 (Dell)', '惠普 (HPE)', '联想 (Lenovo)', '华为 (Huawei)', 
  '超微 (Supermicro)', '中兴 (ZTE)', '新华三 (H3C)', '超聚变 (FusionServer)', 
  '宝德 (PowerLeader)', '曙光 (Sugon)', '华硕 (ASUS)', '技嘉 (Gigabyte)', 
  '泰安 (TYAN)', '英特尔 (Intel)', '甲骨文 (Oracle)', '思科 (Cisco)',
  '富士通 (Fujitsu)', '日立 (Hitachi)', 'NEC', '超云 (SuperCloud)',
  '烽火 (FiberHome)', '深信服 (Sangfor)', '锐捷 (Ruijie)', '迈络思 (Mellanox)',
  '超聚变 (XFusion)', '亚马逊 (AWS)', '微软 (Azure)', '谷歌 (Google)',
  '英伟达 (NVIDIA)', '鲲鹏 (Kunpeng)', '飞腾 (Phytium)', '海光 (Hygon)',
  '申威 (Sunway)', '龙芯 (Loongson)', '兆芯 (Zhaoxin)', '金山云 (Kingsoft)', 
  '京东云 (JD Cloud)', '百度智能云 (Baidu Cloud)', '腾讯云 (Tencent Cloud)', 
  '阿里云 (Alibaba Cloud)', '网易 (NetEase)', '西部数据 (WD)', '希捷 (Seagate)', 
  '三星 (Samsung)', '英睿达 (Crucial)', '金士顿 (Kingston)', '博通 (Broadcom)',
  '威联通 (QNAP)', '群晖 (Synology)', '宏碁 (Acer)', '微星 (MSI)', '安腾 (Itanium)'
].sort();

const POPULAR_MANUFACTURERS = ['浪潮 (Inspur)', '戴尔 (Dell)', '惠普 (HPE)', '华为 (Huawei)', '新华三 (H3C)'];

const ENUM_OPTIONS: Record<string, { specs: string[]; models: string[] }> = {
  gpu: {
    specs: ['NVIDIA A100 80GB x8', 'NVIDIA H100 80GB x8', 'NVIDIA L40S x4'],
    models: ['A100-PG150-S01 x8', 'H100-PG520-S01 x8', 'L40S-NVLink-V1']
  },
  cpu: {
    specs: ['Intel Xeon 8358 x2', 'Intel Xeon Platinum 8480C x2', 'AMD EPYC 9654 x2'],
    models: ['Intel-8358-Standard-V2', 'Intel-8480C-QS', 'AMD-EPYC-9654-Retail']
  },
  memory: {
    specs: ['256GB (32GB x8)', '1024GB (64GB x16)', '2048GB (128GB x16)'],
    models: ['Samsung-DDR4-3200 x8', 'Hynix-DDR4-3200 x8', 'Samsung-DDR4-3200 x8']
  },
  networkCard: {
    specs: ['100G Dual Port x1', '25G Dual Port x1', '200G HDR x1'],
    models: ['Mellanox-CX6-VPI', 'Mellanox-CX4-LX', 'Mellanox-CX5-EN']
  },
  harddisk: {
    specs: ['2TB SATA x2', '8TB SAS x12'],
    models: ['ST2000-NM001', 'Seagate-Exos-X18']
  },
  ssd: {
    specs: ['3.84TB NVMe x2', '7.68TB NVMe x1', '1.92TB SATA x4'],
    models: ['Samsung-PM1733', 'Micron-7450-Pro', 'Samsung-PM9A3-V2']
  },
  raid: {
    specs: ['RAID 1', 'RAID 10'],
    models: ['9460-16i-Primary', '9361-8i-Adapter']
  },
  fpga: {
    specs: ['Xilinx Alveo U250 x1'],
    models: ['U250-PQ123']
  }
};

const CATEGORIES = [
  { id: 'gpu', label: 'GPU', icon: <Layout size={12} className="text-indigo-400" /> },
  { id: 'cpu', label: 'CPU', icon: <Cpu size={12} className="text-blue-400" /> },
  { id: 'memory', label: '内存', icon: <Settings2 size={12} className="text-purple-400" /> },
  { id: 'networkCard', label: '网卡', icon: <Layout size={12} className="text-emerald-400" /> },
  { id: 'harddisk', label: '硬盘', icon: <HardDrive size={12} className="text-amber-400" /> },
  { id: 'ssd', label: 'SSD', icon: <HardDrive size={12} className="text-teal-400" /> },
  { id: 'raid', label: 'RAID', icon: <Settings2 size={12} className="text-slate-400" /> },
  { id: 'fpga', label: 'FPGA', icon: <Cpu size={12} className="text-rose-400" /> },
];

const isAbnormal = (str: string) => {
  if (!str || str.trim() === '' || str.trim() === '-') return false;
  const lower = str.toLowerCase();
  return lower.includes('err:') || lower.includes('unknown') || lower.includes('mismatch') || lower.includes('bad') || lower.includes('unmapped');
};

const EditableCell: React.FC<{
  value: string;
  options: string[];
  onChange: (val: string) => void;
  placeholder?: string;
  isMono?: boolean;
}> = ({ value, options, onChange, placeholder = "请选择...", isMono }) => {
  const [isCustom, setIsCustom] = useState(!options.includes(value) && value !== "");
  const abnormal = isAbnormal(value);

  return (
    <div className="relative flex-1">
      {isCustom ? (
        <div className="relative">
          <input
            autoFocus
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full px-3 py-1.5 text-[11px] border rounded-lg focus:outline-none focus:ring-2 pr-10 transition-all ${
              abnormal ? 'bg-rose-50 border-rose-300 text-rose-700 focus:ring-rose-200 font-bold' : 'bg-white border-blue-200 focus:ring-blue-100'
            } ${isMono ? 'font-mono' : ''}`}
          />
          {abnormal && <AlertTriangle size={12} className="absolute right-7 top-1/2 -translate-y-1/2 text-rose-500 animate-pulse" />}
          <button onClick={() => setIsCustom(false)} className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-blue-500">
            <X size={10} />
          </button>
        </div>
      ) : (
        <div className="relative">
          <select
            value={value}
            onChange={(e) => e.target.value === "__CUSTOM__" ? setIsCustom(true) : onChange(e.target.value)}
            className={`w-full px-3 py-1.5 pr-10 text-[11px] border rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 transition-all ${
              abnormal ? 'bg-rose-50 border-rose-300 text-rose-600 focus:ring-rose-100 font-bold ring-1 ring-rose-200' : 'bg-white border-gray-200 focus:ring-blue-100 hover:border-blue-300'
            } ${isMono ? 'font-mono' : ''}`}
          >
            <option value="" disabled>{placeholder}</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            {!options.includes(value) && value !== "" && <option value={value}>{value}</option>}
            <option value="__CUSTOM__" className="text-blue-600 font-bold">+ 自定义输入</option>
          </select>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-1">
            {abnormal && <AlertTriangle size={12} className="text-rose-500 animate-bounce" />}
            <ChevronDown size={12} className="text-gray-400" />
          </div>
        </div>
      )}
    </div>
  );
};

export const ImportModal: React.FC<{ isOpen: boolean; onClose: () => void; onApply: (configs: any[]) => void }> = ({ isOpen, onClose, onApply }) => {
  const [step, setStep] = useState(1);
  const [isParsing, setIsParsing] = useState(false);
  const [hasUploaded, setHasUploaded] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{name: string, size: string, id: string}[]>([]);
  
  const [snManufacturerMap, setSnManufacturerMap] = useState<Record<string, string>>({});
  const [selectedSNsInStep1, setSelectedSNsInStep1] = useState<Set<string>>(new Set());
  const [assignmentTab, setAssignmentTab] = useState<'pending' | 'assigned' | 'all'>('pending');
  const [snSearchTerm, setSnSearchTerm] = useState('');
  const [templateSearchTerm, setTemplateSearchTerm] = useState('');
  const configRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  const [brandSearchTerm, setBrandSearchTerm] = useState('');
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
  const brandDropdownRef = useRef<HTMLDivElement>(null);

  const [parsedConfigs, setParsedConfigs] = useState<ParsedConfig[]>([]);
  const [selectedConfigIds, setSelectedConfigIds] = useState<Set<string>>(new Set());
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const snFileInputRef = useRef<HTMLInputElement>(null);
  const [currentActiveConfigId, setCurrentActiveConfigId] = useState<string | null>(null);

  // 新增：异常 Part ID 详情弹窗状态
  const [detailModalCategory, setDetailModalCategory] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (brandDropdownRef.current && !brandDropdownRef.current.contains(e.target as Node)) {
        setIsBrandDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const allDetectedSNs = useMemo(() => {
    return parsedConfigs.reduce((acc, curr) => [...acc, ...curr.suggestedSNs], [] as string[]);
  }, [parsedConfigs]);

  const snToSourceFileMap = useMemo(() => {
    const map: Record<string, string> = {};
    parsedConfigs.forEach(config => {
      const sourceStr = config.sourceFiles.join(', ');
      config.suggestedSNs.forEach(sn => {
        map[sn] = sourceStr;
      });
    });
    return map;
  }, [parsedConfigs]);

  const filteredSNs = useMemo(() => {
    let base = allDetectedSNs;
    if (assignmentTab === 'pending') base = base.filter(sn => !snManufacturerMap[sn]);
    if (assignmentTab === 'assigned') base = base.filter(sn => snManufacturerMap[sn]);
    if (snSearchTerm) {
      const term = snSearchTerm.toLowerCase();
      base = base.filter(sn => sn.toLowerCase().includes(term));
    }
    return base;
  }, [allDetectedSNs, assignmentTab, snSearchTerm, snManufacturerMap]);

  const filteredBrands = useMemo(() => {
    if (!brandSearchTerm) return ALL_MANUFACTURERS;
    const term = brandSearchTerm.toLowerCase();
    return ALL_MANUFACTURERS.filter(b => b.toLowerCase().includes(term));
  }, [brandSearchTerm]);

  const assignedCount = useMemo(() => allDetectedSNs.filter(sn => snManufacturerMap[sn]).length, [allDetectedSNs, snManufacturerMap]);
  const progressPercent = Math.round((assignedCount / (allDetectedSNs.length || 1)) * 100);

  const filteredConfigs = useMemo(() => {
    if (!templateSearchTerm) return parsedConfigs;
    const term = templateSearchTerm.toLowerCase();
    return parsedConfigs.filter(c => 
      c.id.toLowerCase().includes(term) || 
      c.suggestedSNs.some(sn => sn.toLowerCase().includes(term))
    );
  }, [parsedConfigs, templateSearchTerm]);

  // 计算第二步中的异常项总数
  const totalIssuesCount = useMemo(() => {
    let count = 0;
    parsedConfigs.forEach(config => {
      Object.values(config.specs).forEach(val => { if (isAbnormal(val as string)) count++; });
      Object.values(config.models).forEach(val => { if (isAbnormal(val as string)) count++; });
    });
    return count;
  }, [parsedConfigs]);

  // 新增：按配件类别聚合所有的 Part ID
  const aggregatedPartsByCategory = useMemo(() => {
    const result: Record<string, { all: Set<string>, abnormal: Set<string> }> = {};
    CATEGORIES.forEach(cat => {
      result[cat.id] = { all: new Set(), abnormal: new Set() };
    });

    parsedConfigs.forEach(config => {
      Object.entries(config.rawIds).forEach(([catId, rawId]) => {
        if (result[catId]) {
          // Cast rawId as string to fix unknown type issues in Object.entries iterators
          result[catId].all.add(rawId as string);
          if (isAbnormal(rawId as string)) {
            result[catId].abnormal.add(rawId as string);
          }
        }
      });
    });
    return result;
  }, [parsedConfigs]);

  const batchAssignManufacturer = (manufacturer: string) => {
    if (selectedSNsInStep1.size === 0 || !manufacturer.trim()) return;
    const next = { ...snManufacturerMap };
    selectedSNsInStep1.forEach(sn => { next[sn] = manufacturer; });
    setSnManufacturerMap(next);
    setSelectedSNsInStep1(new Set());
    setBrandSearchTerm('');
    setIsBrandDropdownOpen(false);
  };

  const runSimulation = (files: {name: string}[]) => {
    if (files.length === 0) {
      setHasUploaded(false);
      setParsedConfigs([]);
      return;
    }
    setIsParsing(true);
    setTimeout(() => {
      const totalSNCount = files.length * 15;
      const allSNs = Array.from({ length: totalSNCount }, (_, i) => {
        const prefix = i < (totalSNCount * 0.4) ? 'ISP-' : (i < (totalSNCount * 0.7) ? 'DEL-' : 'H3C-');
        return `${prefix}NODE-${1000 + i}`;
      });
      const configA: ParsedConfig = {
        id: 'TEMPLATE-TYPE-H100',
        sourceFiles: files.slice(0, Math.ceil(files.length / 2)).map(f => f.name),
        suggestedSNs: allSNs.slice(0, Math.floor(totalSNCount * 0.6)),
        additionalSNs: [],
        rawIds: { gpu: 'NV-ID-H100-SXM5', cpu: 'Intel-8480C', memory: 'PN: M393A8G', networkCard: 'PCI-15B3-1021', harddisk: 'ST4000', ssd: 'MZ-PLJ3T', raid: '9460-16i', fpga: '-' },
        rawQtys: { gpu: 8, cpu: 2, memory: 16, networkCard: 2, harddisk: 4, ssd: 2, raid: 1, fpga: 0 },
        specs: { gpu: 'NVIDIA H100 80GB x8', cpu: 'Intel Xeon Platinum 8480C x2', memory: '1024GB (64GB x16)', networkCard: '200G HDR x1', harddisk: '4TB SATA x4', ssd: '3.84TB NVMe x2', raid: 'RAID 1', fpga: '-' },
        models: { gpuModel: 'H100-PG520-S01 x8', cpuModel: 'Intel-8480C-QS', memoryModel: 'Samsung-DDR5-4800 x16', networkCardModel: 'Mellanox-CX6-VPI', harddiskModel: 'ST4000-NM002 x4', ssdModel: 'Samsung-PM1733', raidModel: '9460-16i-Primary', fpgaModel: '-' }
      };
      const configB: ParsedConfig = {
        id: 'TEMPLATE-TYPE-A100',
        sourceFiles: files.slice(Math.ceil(files.length / 2)).map(f => f.name),
        suggestedSNs: allSNs.slice(Math.floor(totalSNCount * 0.6)),
        additionalSNs: [],
        rawIds: { gpu: 'NV-ID-A100-SXM4', cpu: 'Intel-8358', memory: 'UNKNOWN-MEM', networkCard: 'PCI-15B3-1017', harddisk: 'UNKNOWN_HDD', ssd: 'MZ-76E1T0', raid: '9361-8i', fpga: '-' },
        rawQtys: { gpu: 8, cpu: 2, memory: 8, networkCard: 1, harddisk: 2, ssd: 4, raid: 1, fpga: 0 },
        specs: { gpu: 'NVIDIA A100 80GB x8', cpu: 'Intel Xeon 8358 x2', memory: 'ERR: Unknown Layout', networkCard: '100G Dual Port x1', harddisk: 'ERR: Unknown Mapping', ssd: '1.92TB SATA x4', raid: 'RAID 10', fpga: '-' },
        models: { gpuModel: 'A100-PG150-S01 x8', cpuModel: 'Intel-8358-Standard-V2', memoryModel: 'ERR: Unmapped Part', networkCardModel: 'Mellanox-CX6-VPI', harddiskModel: 'ERR: Unmapped Part', ssdModel: 'Samsung-PM9A3-V2', raidModel: '9361-8i-Adapter', fpgaModel: '-' }
      };
      setParsedConfigs([configA, configB]);
      setSelectedConfigIds(new Set([configA.id, configB.id]));
      setIsParsing(false);
      setHasUploaded(true);
    }, 1200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newFiles = Array.from(files).map((f: File) => ({
      name: f.name,
      size: (f.size / 1024 / 1024).toFixed(2) + ' MB',
      id: Math.random().toString(36).substr(2, 9)
    }));
    const updatedTotalFiles = [...uploadedFiles, ...newFiles];
    setUploadedFiles(updatedTotalFiles);
    runSimulation(updatedTotalFiles);
    if(fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (id: string) => {
    const updated = uploadedFiles.filter(f => f.id !== id);
    setUploadedFiles(updated);
    runSimulation(updated);
  };

  const selectedConfigs = useMemo(() => {
    return parsedConfigs.filter(c => selectedConfigIds.has(c.id)).map(c => {
      const firstSn = c.suggestedSNs[0];
      const manufacturer = snManufacturerMap[firstSn] || '未知厂商';
      const updatedSpecs: Record<string, string> = {};
      Object.entries(c.specs).forEach(([key, value]) => {
        const val = value as string;
        if (val !== '-' && !val.startsWith(manufacturer)) {
          updatedSpecs[key] = `${manufacturer} ${val}`;
        } else {
          updatedSpecs[key] = val;
        }
      });
      return { ...c, specs: updatedSpecs, targetSNs: [...new Set([...c.suggestedSNs, ...c.additionalSNs])] };
    });
  }, [parsedConfigs, selectedConfigIds, snManufacturerMap]);

  const handleExportPartIds = (catId: string) => {
    const parts = aggregatedPartsByCategory[catId];
    if (!parts) return;
    const content = Array.from(parts.all).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PartIDs_${catId}_${new Date().getTime()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  const updateNested = (id: string, type: 'specs' | 'models', field: string, value: string) => {
    setParsedConfigs(prev => prev.map(c => c.id === id ? { ...c, [type]: { ...(c[type] as any), [field]: value } } : c));
  };

  const handleSNFileUpload = (e: React.ChangeEvent<HTMLInputElement>, configId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const newSns = (event.target?.result as string).split(/[\s,;]+/).filter(Boolean);
      setParsedConfigs(prev => prev.map(c => c.id === configId ? { ...c, additionalSNs: [...new Set([...c.additionalSNs, ...newSns])] } : c));
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-[1380px] max-h-[96vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border border-white relative">
        
        {/* Header Section */}
        <div className="px-10 py-7 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-indigo-600 text-white rounded-[1.5rem] shadow-xl shadow-indigo-100">
              <Upload size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">批量导入配置资产</h3>
              <p className="text-[12px] text-gray-500 font-medium tracking-tight">自动对齐 <span className="text-indigo-600 font-black">抓取数据 → 品牌归档 → 规格映射 → 批量应用</span></p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-gray-200 rounded-full text-gray-400 transition-colors"><X size={24} /></button>
        </div>

        {/* Steps Breadcrumb */}
        <div className="bg-white">
          <div className="flex px-16 py-6 justify-between items-center">
            {[
              { n: 1, l: '资产识别与厂商分拨' },
              { n: 2, l: '规格对齐核对' },
              { n: 3, l: '任务清单与追加 SN' }
            ].map((s, i) => (
              <React.Fragment key={s.n}>
                <div className={`flex items-center gap-4 ${step >= s.n ? 'text-indigo-600' : 'text-gray-300'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s.n ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 border border-gray-200'}`}>{s.n}</div>
                  <span className="text-[13px] font-black whitespace-nowrap">{s.l}</span>
                </div>
                {i < 2 && <div className={`flex-1 mx-12 h-0.5 transition-colors ${step > s.n ? 'bg-indigo-600' : 'bg-gray-100'}`} />}
              </React.Fragment>
            ))}
          </div>
          {step === 1 && hasUploaded && (
            <div className="h-1.5 w-full bg-slate-50 relative">
              <div className="absolute inset-y-0 left-0 bg-indigo-600 transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }} />
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-10 bg-slate-50/30 custom-scrollbar min-h-[550px]">
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            multiple 
          />

          {step === 1 && (
            <div className="h-full flex flex-col items-center justify-start gap-8">
              {isParsing ? (
                <div className="text-center animate-pulse mt-32">
                  <div className="w-24 h-24 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-8 shadow-inner" />
                  <p className="text-lg font-black text-slate-700 tracking-tight italic">正在分析并提取附件中的配置数据...</p>
                </div>
              ) : !hasUploaded ? (
                <div className="w-full max-w-4xl flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-500 mt-20">
                    <div className="w-full p-28 border-4 border-dashed border-indigo-100 rounded-[5rem] bg-white flex flex-col items-center hover:border-indigo-400 hover:bg-indigo-50/20 transition-all cursor-pointer group shadow-2xl shadow-indigo-100/10" onClick={() => fileInputRef.current?.click()}>
                      <div className="w-28 h-28 bg-indigo-50 text-indigo-500 rounded-[3rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-inner"><FileArchive size={56} /></div>
                      <h4 className="text-3xl font-black text-slate-800">上传离线解析数据包</h4>
                      <p className="text-base text-slate-400 mt-5">支持多节点离线文件混合上传，系统将自动识别 SN 并归类配置模板。</p>
                    </div>
                </div>
              ) : (
                <div className="w-full max-w-7xl flex flex-col gap-10 animate-in fade-in zoom-in-95 duration-400">
                  <div className="bg-white border border-slate-200 rounded-[3rem] p-8 shadow-xl shadow-slate-100/30">
                    <div className="flex items-center justify-between mb-6 px-4">
                       <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl"><FileText size={20} /></div>
                          <span className="text-base font-black text-slate-800">已导入的附件快照 ({uploadedFiles.length})</span>
                       </div>
                       <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-2xl text-[12px] font-black hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100">
                         <FilePlus size={14} /> 继续添加附件
                       </button>
                    </div>
                    <div className="flex flex-wrap gap-4 px-2 overflow-x-auto pb-2 custom-scrollbar-thin">
                       {uploadedFiles.map(file => (
                         <div key={file.id} className="flex items-center gap-4 bg-slate-50 border border-slate-100 px-5 py-3 rounded-2xl group hover:border-indigo-200 transition-all hover:bg-white hover:shadow-lg shrink-0 animate-in fade-in slide-in-from-left-2 duration-300">
                            <div className="p-2 bg-white rounded-xl text-indigo-400 shadow-sm"><FileArchive size={16} /></div>
                            <div className="flex flex-col">
                               <span className="text-[13px] font-black text-slate-700 truncate max-w-[150px]">{file.name}</span>
                               <span className="text-[10px] text-slate-400 font-bold">{file.size}</span>
                            </div>
                            <button onClick={() => removeFile(file.id)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                               <Trash2 size={16} />
                            </button>
                         </div>
                       ))}
                    </div>
                  </div>

                  <div className="flex gap-10">
                    <div className="flex-1 bg-white border border-slate-200 rounded-[3rem] p-10 shadow-xl shadow-slate-100/50 flex flex-col gap-8">
                       <div className="flex items-center justify-between border-b border-slate-50 pb-8">
                          <div>
                            <h4 className="text-xl font-black text-slate-800">厂商分拨 ({assignedCount}/{allDetectedSNs.length})</h4>
                            <p className="text-[13px] text-slate-400 mt-1">请为自动识别到的物理资产指派服务器品牌</p>
                          </div>
                          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                             {(['pending', 'assigned', 'all'] as const).map(tab => (
                               <button key={tab} onClick={() => setAssignmentTab(tab)} className={`px-6 py-2 rounded-xl text-[12px] font-black transition-all ${assignmentTab === tab ? 'bg-white text-indigo-600 shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}>
                                 {tab === 'pending' ? '待指派' : tab === 'assigned' ? '已指派' : '全部'}
                               </button>
                             ))}
                          </div>
                       </div>
                       <div className="flex flex-col gap-6">
                          <div className="flex items-center gap-4">
                             <div className="relative flex-1">
                                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                <input type="text" value={snSearchTerm} onChange={e => setSnSearchTerm(e.target.value)} placeholder="搜索 SN..." className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-200 rounded-[1.5rem] text-[13px] font-bold focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 outline-none" />
                             </div>
                             <button onClick={() => { const next = new Set(selectedSNsInStep1); filteredSNs.forEach(sn => next.add(sn)); setSelectedSNsInStep1(next); }} className="px-6 py-3.5 bg-slate-800 text-white rounded-2xl text-[12px] font-black hover:bg-slate-700 transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-slate-200">
                               <CheckCircle size={16} /> 选中当前结果 ({filteredSNs.length})
                             </button>
                          </div>
                          <div className="h-[420px] border border-slate-100 rounded-[2.5rem] overflow-hidden bg-slate-50/20">
                             <div className="grid grid-cols-12 px-8 py-4 border-b border-slate-100 bg-slate-100/30 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                               <div className="col-span-1">选择</div>
                               <div className="col-span-1 text-center">#</div>
                               <div className="col-span-4">服务器唯一识别码 (SN)</div>
                               <div className="col-span-3">来源附件</div>
                               <div className="col-span-3 text-center">当前厂商</div>
                             </div>
                             <div className="overflow-y-auto h-[355px] custom-scrollbar">
                                {filteredSNs.map((sn, index) => {
                                  const manufacturer = snManufacturerMap[sn];
                                  const isSelected = selectedSNsInStep1.has(sn);
                                  const sourceFile = snToSourceFileMap[sn] || '未知来源';
                                  return (
                                    <div key={sn} onClick={() => { const next = new Set(selectedSNsInStep1); next.has(sn) ? next.delete(sn) : next.add(sn); setSelectedSNsInStep1(next); }} className={`grid grid-cols-12 items-center px-8 py-3 border-b border-slate-50 transition-all cursor-pointer group ${isSelected ? 'bg-indigo-50/60 ring-1 ring-inset ring-indigo-100' : 'hover:bg-white'}`}>
                                       <div className="col-span-1"><div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-600 border-indigo-600 shadow-md shadow-indigo-100' : 'border-slate-200 bg-white group-hover:border-indigo-300'}`}>{isSelected && <Check size={14} className="text-white" />}</div></div>
                                       <div className="col-span-1 text-center text-[10px] text-slate-300 font-black">{index + 1}</div>
                                       <div className="col-span-4 font-mono font-black text-slate-700 text-[13px]">{sn}</div>
                                       <div className="col-span-3 flex items-center gap-2">
                                          <FileText size={12} className="text-slate-300 shrink-0" />
                                          <span className="text-[11px] text-slate-500 font-medium truncate" title={sourceFile}>{sourceFile}</span>
                                       </div>
                                       <div className="col-span-3 flex justify-center">
                                          {manufacturer ? <div className="px-4 py-1.5 bg-white border border-indigo-100 text-indigo-600 text-[11px] font-black rounded-xl shadow-sm flex items-center gap-2.5"><Factory size={12} /> {manufacturer}</div> : <div className="px-4 py-1.5 bg-amber-50 border border-amber-100 text-amber-600 text-[11px] font-black rounded-xl animate-pulse italic">等待分拨</div>}
                                       </div>
                                    </div>
                                  );
                                })}
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="w-[420px] flex flex-col gap-6">
                       <div className={`flex-1 p-8 border-2 rounded-[3.5rem] transition-all flex flex-col gap-6 shadow-2xl relative ${selectedSNsInStep1.size > 0 ? 'bg-white border-indigo-200 shadow-indigo-100/40' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                          <div className="flex items-center gap-4">
                             <div className={`p-3 rounded-2xl ${selectedSNsInStep1.size > 0 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'}`}><Zap size={20} /></div>
                             <div><h5 className="text-base font-black text-slate-800">指派厂商至所选资产</h5><p className="text-[12px] text-slate-500 mt-0.5">已选中 <span className="text-indigo-600 font-black">{selectedSNsInStep1.size}</span> 台服务器</p></div>
                          </div>
                          
                          <div className="space-y-4" ref={brandDropdownRef}>
                             <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">厂商库选择 (严格限定)</label>
                             <div className="relative">
                                <button 
                                  onClick={() => selectedSNsInStep1.size > 0 && setIsBrandDropdownOpen(!isBrandDropdownOpen)}
                                  className={`w-full flex items-center justify-between px-5 py-3.5 bg-white border rounded-[1.25rem] transition-all ${selectedSNsInStep1.size === 0 ? 'border-slate-200 cursor-not-allowed' : 'border-indigo-100 hover:border-indigo-400 focus:ring-4 focus:ring-indigo-50 shadow-sm'}`}
                                >
                                  <div className="flex items-center gap-3">
                                    <Factory size={16} className="text-indigo-400" />
                                    <span className={`text-[13px] font-black ${brandSearchTerm ? 'text-indigo-600' : 'text-slate-400'}`}>
                                      {brandSearchTerm || "点击展开搜索厂商列表..."}
                                    </span>
                                  </div>
                                  <ChevronDown size={18} className={`text-slate-300 transition-transform ${isBrandDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isBrandDropdownOpen && (
                                  <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-indigo-100 rounded-[2.5rem] shadow-2xl z-[150] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 min-h-[400px]">
                                     <div className="p-5 border-b border-slate-50 bg-slate-50/50">
                                        <div className="relative">
                                          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" />
                                          <input 
                                            autoFocus
                                            type="text" 
                                            value={brandSearchTerm}
                                            onChange={e => setBrandSearchTerm(e.target.value)}
                                            placeholder="输入关键字过滤厂商..."
                                            className="w-full pl-11 pr-4 py-3 bg-white border border-indigo-100 rounded-2xl text-[12px] font-bold outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                                          />
                                        </div>
                                     </div>
                                     <div className="px-5 py-4 border-b border-slate-50">
                                        <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3"><Star size={10} className="text-amber-400 fill-amber-400" /> 常用厂商</div>
                                        <div className="flex flex-wrap gap-2">
                                           {POPULAR_MANUFACTURERS.map(brand => (
                                             <button 
                                               key={brand} 
                                               onClick={() => batchAssignManufacturer(brand)}
                                               className="px-3 py-1.5 bg-white border border-slate-100 text-[11px] font-black text-slate-600 rounded-xl hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all active:scale-95"
                                             >
                                               {brand.split(' ')[0]}
                                             </button>
                                           ))}
                                        </div>
                                     </div>
                                     <div className="flex-1 overflow-y-auto custom-scrollbar-thin p-2 space-y-1">
                                        {filteredBrands.length > 0 ? (
                                          filteredBrands.map(brand => (
                                            <button 
                                              key={brand} 
                                              onClick={() => batchAssignManufacturer(brand)}
                                              className="w-full text-left px-5 py-3 hover:bg-indigo-50 rounded-2xl text-[12px] font-bold text-slate-600 hover:text-indigo-700 transition-all flex items-center justify-between group"
                                            >
                                              <span>{brand}</span>
                                              <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                            </button>
                                          ))
                                        ) : (
                                          <div className="py-12 flex flex-col items-center gap-4 text-center">
                                             <AlertCircle size={32} className="text-rose-300" />
                                             <div className="space-y-1">
                                                <p className="text-[13px] font-black text-slate-700">库中无匹配结果</p>
                                                <p className="text-[11px] text-slate-400 px-8 leading-relaxed">请确保输入正确，如确实缺失，请联系管理员维护厂商主表。</p>
                                             </div>
                                          </div>
                                        )}
                                     </div>
                                  </div>
                                )}
                             </div>
                          </div>
                          <div className="mt-auto p-8 bg-blue-50/50 border border-blue-100 rounded-[2.5rem] flex gap-5 shadow-inner">
                            <Info size={28} className="text-blue-500 shrink-0 mt-1" />
                            <div className="space-y-2">
                              <p className="text-[13px] text-blue-800 font-black">交互指南：</p>
                              <p className="text-[11px] text-blue-700 font-medium leading-relaxed">
                                1. 在左侧列表中勾选需要分拨的 SN。<br/>
                                2. 点击上方下拉框，在弹出的面板中搜索或选择对应厂商。<br/>
                                3. 严格禁止手动输入，确保数据清洗后的规范性。
                              </p>
                            </div>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-10 animate-in slide-in-from-right-4 duration-400">
               {/* 新增：硬件识别异常分类看板 */}
               <div className="bg-white border border-slate-200 p-8 rounded-[3rem] shadow-xl">
                  <div className="flex items-center justify-between mb-8 px-4">
                     <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shadow-inner"><Activity size={20} /></div>
                        <div>
                           <h4 className="text-lg font-black text-slate-800">硬件抓取异常监控 (按配件类别)</h4>
                           <p className="text-[12px] text-slate-400 font-medium italic">系统自动提取并展示所有上传附件中识别到的异常 Part ID，点击分类查看详情并导出。</p>
                        </div>
                     </div>
                     <div className="flex gap-4">
                        <div className="px-6 py-2.5 bg-rose-50 border border-rose-100 text-rose-600 text-[11px] font-black rounded-2xl flex items-center gap-2">
                           <AlertTriangle size={14} className="animate-pulse" /> 异常总计: {totalIssuesCount}
                        </div>
                     </div>
                  </div>

                  <div className="flex gap-4 overflow-x-auto pb-4 px-2 custom-scrollbar-thin">
                     {CATEGORIES.map(cat => {
                        const stats = aggregatedPartsByCategory[cat.id];
                        const hasAbnormal = stats && stats.abnormal.size > 0;
                        return (
                           <div 
                             key={cat.id} 
                             onClick={() => setDetailModalCategory(cat.id)}
                             className={`min-w-[180px] p-6 rounded-[2.25rem] border transition-all cursor-pointer hover:shadow-2xl hover:scale-105 group relative overflow-hidden ${
                               hasAbnormal 
                                 ? 'bg-rose-50 border-rose-200 ring-4 ring-rose-50 shadow-lg shadow-rose-100' 
                                 : 'bg-emerald-50 border-emerald-100 shadow-sm opacity-60'
                             }`}
                           >
                              {hasAbnormal && (
                                 <div className="absolute -top-2 -right-2 w-16 h-16 bg-rose-100/30 rounded-full blur-xl" />
                              )}
                              <div className="flex flex-col gap-4 relative z-10">
                                 <div className="flex items-center justify-between">
                                    <div className={`p-2.5 rounded-xl ${hasAbnormal ? 'bg-rose-500 text-white shadow-lg' : 'bg-emerald-500 text-white shadow-md'}`}>
                                       {hasAbnormal ? <AlertTriangle size={14} /> : cat.icon}
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${hasAbnormal ? 'text-rose-400' : 'text-emerald-400'}`}>
                                       {cat.id}
                                    </span>
                                 </div>
                                 <div>
                                    <h5 className={`text-[15px] font-black mb-1 ${hasAbnormal ? 'text-rose-900' : 'text-emerald-900'}`}>{cat.label}</h5>
                                    <div className="flex items-center gap-2">
                                       <span className={`text-[10px] font-bold ${hasAbnormal ? 'text-rose-600' : 'text-emerald-600'}`}>
                                          {hasAbnormal ? `检测到 ${stats.abnormal.size} 处异常项` : '识别正常'}
                                       </span>
                                    </div>
                                 </div>
                                 <div className={`mt-2 flex items-center justify-between text-[9px] font-black uppercase ${hasAbnormal ? 'text-rose-400' : 'text-emerald-400'}`}>
                                    <span>查看详情</span>
                                    <Eye size={10} className="group-hover:translate-x-1 transition-transform" />
                                 </div>
                              </div>
                           </div>
                        );
                     })}
                  </div>
               </div>

               {/* 新增：模板快速导航与筛选 */}
               <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border border-slate-200 p-6 rounded-[2.5rem] shadow-xl flex items-center gap-8">
                  <div className="flex items-center gap-4 border-r border-slate-100 pr-8">
                     <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
                        <Layers size={20} />
                     </div>
                     <div>
                        <h4 className="text-sm font-black text-slate-800">模板概览</h4>
                        <p className="text-[11px] text-slate-400 font-bold">共识别到 <span className="text-indigo-600">{parsedConfigs.length}</span> 个配置模板</p>
                     </div>
                  </div>

                  <div className="relative flex-1 max-w-md">
                     <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                     <input 
                        type="text" 
                        value={templateSearchTerm}
                        onChange={e => setTemplateSearchTerm(e.target.value)}
                        placeholder="搜索模板 ID 或关联 SN..."
                        className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-[12px] font-bold outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition-all"
                     />
                  </div>

                  <div className="flex-1 flex gap-3 overflow-x-auto pb-1 custom-scrollbar-thin">
                     {parsedConfigs.map((config, idx) => {
                        const isFiltered = filteredConfigs.some(c => c.id === config.id);
                        const hasIssues = Object.values(config.specs).some(val => isAbnormal(val as string)) || Object.values(config.models).some(val => isAbnormal(val as string));
                        
                        return (
                           <button 
                             key={config.id}
                             onClick={() => configRefs.current[config.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                             className={`shrink-0 px-4 py-2 rounded-xl border text-[11px] font-black transition-all flex items-center gap-2 ${
                               isFiltered 
                                 ? (hasIssues ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-sm' : 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm')
                                 : 'bg-slate-50 border-slate-100 text-slate-400 opacity-40'
                             } hover:scale-105 active:scale-95`}
                           >
                              <span className={`w-2 h-2 rounded-full ${hasIssues ? 'bg-rose-500 animate-pulse' : 'bg-indigo-500'}`} />
                              模板 {idx + 1}
                              <span className="opacity-40 font-mono">({config.suggestedSNs.length})</span>
                           </button>
                        );
                     })}
                  </div>
               </div>

               <div className="space-y-12 pb-10">
                {filteredConfigs.map((config, idx) => {
                  const hasTemplateIssues = Object.values(config.specs).some(val => isAbnormal(val as string)) || Object.values(config.models).some(val => isAbnormal(val as string));
                  
                  return (
                    <div 
                      key={config.id} 
                      ref={el => configRefs.current[config.id] = el}
                      className={`bg-white border rounded-[4rem] overflow-hidden shadow-2xl flex transition-all ${hasTemplateIssues ? 'border-rose-200 ring-2 ring-rose-50' : 'border-gray-100 hover:shadow-indigo-100/30'}`}
                    >
                      <div className="w-80 bg-slate-50/50 border-r border-slate-100 flex flex-col p-8 gap-6 relative">
                        {hasTemplateIssues && <div className="absolute top-4 right-4 bg-rose-500 text-white px-3 py-1 rounded-full text-[9px] font-black shadow-lg animate-bounce">需修正</div>}
                        <div className="space-y-4">
                          <div className="flex items-center gap-4"><div className={`w-10 h-10 rounded-[1.25rem] flex items-center justify-center text-white font-black text-sm shadow-lg ${idx === 0 ? 'bg-indigo-600 shadow-indigo-100' : 'bg-rose-500 shadow-rose-100'}`}>{idx + 1}</div><span className="text-[15px] font-black text-slate-800">模板 - {idx === 0 ? 'A 类' : 'B 类'}</span></div>
                          <span className="inline-block px-3 py-1 bg-white border border-slate-200 text-[11px] rounded-lg font-mono font-bold text-slate-400 shadow-sm">{config.id}</span>
                        </div>
                        <div className="flex-1 flex flex-col gap-3">
                          <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest px-2">指派 SN ({config.suggestedSNs.length} 台)</span>
                          <div className="flex-1 overflow-y-auto max-h-[350px] space-y-2 custom-scrollbar pr-2">
                            {config.suggestedSNs.map(sn => (
                              <div key={sn} className="bg-white border border-slate-100 px-4 py-2.5 rounded-2xl text-[12px] font-mono font-black text-slate-600 shadow-sm flex items-center justify-between hover:border-indigo-300 transition-all">
                                {sn.split('-')[0]}...{sn.slice(-4)}
                                <span className="text-[9px] text-indigo-500 font-black italic">{snManufacturerMap[sn]?.split(' ')[0] || '-'}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col bg-white">
                        <div className="px-10 py-6 bg-slate-50/30 flex items-center justify-between border-b border-slate-100">
                          <div className="flex items-center gap-5">
                            <input type="checkbox" checked={selectedConfigIds.has(config.id)} onChange={() => { const next = new Set(selectedConfigIds); next.has(config.id) ? next.delete(config.id) : next.add(config.id); setSelectedConfigIds(next); }} className="rounded-xl text-indigo-600 w-7 h-7 cursor-pointer border-slate-300" />
                            <div className="flex flex-col"><span className="text-base font-black text-slate-800">同步应用此模板配置规格</span><span className="text-[12px] text-slate-400 font-medium italic">关联 SN 将批量以此快照更新资产信息</span></div>
                          </div>
                          <div className="px-5 py-2 bg-indigo-50 border border-indigo-100 text-indigo-600 text-[11px] font-black rounded-xl shadow-sm flex items-center gap-2"><Factory size={14} /> {snManufacturerMap[config.suggestedSNs[0]] || '混合资产'}</div>
                        </div>
                        <div className="p-10 space-y-4">
                          {CATEGORIES.map((cat) => {
                            const specVal = config.specs[cat.id] || '-';
                            const modelKey = `${cat.id}Model`;
                            const modelVal = config.models[modelKey] || '-';
                            const rawId = config.rawIds[cat.id] || '-';
                            
                            const hasRowIssue = isAbnormal(specVal) || isAbnormal(modelVal);
                            const opts = ENUM_OPTIONS[cat.id] || { specs: [], models: [] };
                            
                            return (
                              <div key={cat.id} className={`grid grid-cols-12 items-center p-4 rounded-[2.5rem] border transition-all ${hasRowIssue ? 'bg-rose-50/50 border-rose-200 shadow-inner' : 'border-slate-100 hover:bg-slate-50'}`}>
                                <div className="col-span-2 flex items-center gap-3">
                                  <div className={`p-3 rounded-2xl shadow-sm border ${hasRowIssue ? 'bg-rose-100 border-rose-300 text-rose-600' : 'bg-white border-slate-100'}`}>
                                    {hasRowIssue ? <AlertTriangle size={14} className="animate-pulse" /> : cat.icon}
                                  </div>
                                  <span className={`text-[13px] font-black ${hasRowIssue ? 'text-rose-700' : 'text-slate-700'}`}>{cat.label}</span>
                                </div>
                                <div className="col-span-10 grid grid-cols-12 items-center gap-4">
                                  <div className="col-span-4 flex items-center gap-2 relative">
                                    <div className={`flex-1 px-4 py-2.5 rounded-2xl border text-[11px] font-mono font-black truncate shadow-inner ${hasRowIssue ? 'bg-rose-50 border-rose-100 text-rose-400' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>{rawId}</div>
                                    <div className={`shrink-0 w-12 px-2 py-2.5 rounded-2xl border flex items-center justify-center text-[11px] font-black shadow-sm ${hasRowIssue ? 'bg-rose-100 border-rose-200 text-rose-600' : 'bg-indigo-50 border-indigo-100 text-indigo-600'}`}><Hash size={12} /> {config.rawQtys[cat.id]}</div>
                                  </div>
                                  <div className={`col-span-1 flex justify-center ${hasRowIssue ? 'text-rose-300' : 'text-indigo-300'} opacity-50`}><ArrowRight size={18} /></div>
                                  <div className="col-span-3">
                                    <EditableCell value={modelVal} options={opts.models} onChange={(v) => updateNested(config.id, 'models', modelKey, v)} placeholder="对齐 Model..." isMono />
                                  </div>
                                  <div className={`col-span-1 flex justify-center ${hasRowIssue ? 'text-rose-300' : 'text-indigo-300'} opacity-50`}><ArrowRight size={18} /></div>
                                  <div className="col-span-3">
                                    <EditableCell value={specVal} options={opts.specs} onChange={(v) => updateNested(config.id, 'specs', cat.id, v)} placeholder="对齐 Spec..." />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-12 animate-in slide-in-from-right-4 duration-400">
              <div className="grid grid-cols-1 gap-12 pb-10">
                {selectedConfigs.length === 0 ? (
                  <div className="py-32 text-center text-gray-400 flex flex-col items-center gap-6 bg-white rounded-[3.5rem] border border-slate-200 shadow-sm"><Layers size={64} className="opacity-20" /><p className="italic text-base font-medium">请在上一环节勾选需要执行同步的配置模板</p></div>
                ) : selectedConfigs.map((config) => (
                  <div key={config.id} className="bg-white border border-slate-200 rounded-[4rem] p-12 shadow-2xl flex flex-col gap-10">
                    <div className="flex items-center justify-between pb-8 border-b border-slate-50">
                      <div className="flex items-center gap-5">
                        <div className="w-5 h-12 bg-indigo-600 rounded-full shadow-lg shadow-indigo-100" />
                        <div>
                          <h5 className="text-2xl font-black text-slate-900">执行同步任务: {config.id}</h5>
                          <p className="text-[14px] text-slate-400 mt-1 font-medium italic">即将为 <span className="text-indigo-600 font-black px-1">{config.targetSNs.length}</span> 台目标资产应用配置快照</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-12 h-[520px]">
                      <div className="flex-1 flex flex-col gap-8">
                        {/* 新增：配置模板信息汇总 */}
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between px-4">
                            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              <Settings2 size={16} /> 配置模板信息 (硬件汇总)
                            </label>
                            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                              厂商: {snManufacturerMap[config.suggestedSNs[0]] || '未知'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-3 p-5 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-y-auto max-h-[180px] custom-scrollbar-thin">
                            {CATEGORIES.map(cat => {
                              const model = config.models[`${cat.id}Model`];
                              const qty = config.rawQtys[cat.id];
                              if (!model || model === '-' || qty === 0) return null;
                              return (
                                <div key={cat.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-colors group">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-xl shadow-sm text-indigo-500 group-hover:scale-110 transition-transform">
                                      {cat.icon}
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{cat.label}</span>
                                      <span className="text-[11px] font-black text-slate-700 truncate max-w-[110px]" title={model}>{model}</span>
                                    </div>
                                  </div>
                                  <div className="px-2.5 py-1 bg-white border border-indigo-100 text-indigo-600 text-[10px] font-black rounded-lg shadow-sm">
                                    x{qty}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex flex-col gap-3">
                           <div className="flex items-center justify-between px-4">
                             <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Database size={16} /> 第一步自动指派的资产 SN</label>
                             <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shadow-sm">已就绪: {config.suggestedSNs.length} 台</span>
                           </div>
                           <div className="w-full h-24 p-6 bg-slate-50/50 border border-slate-100 rounded-[2.5rem] overflow-y-auto flex flex-wrap gap-2.5 content-start custom-scrollbar opacity-70">
                              {config.suggestedSNs.map(sn => (<span key={sn} className="px-3 py-1.5 bg-white border border-slate-200 text-[11px] font-mono font-black text-slate-400 rounded-xl shadow-sm">{sn}</span>))}
                           </div>
                        </div>
                        <div className="flex-1 flex flex-col gap-3">
                          <div className="flex items-center justify-between px-4">
                            <label className="text-[12px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2"><PlusCircle size={16} /> 额外追加目标资产 SN (手动录入/批量粘贴)</label>
                            <button onClick={() => { setCurrentActiveConfigId(config.id); snFileInputRef.current?.click(); }} className="px-5 py-2 bg-indigo-50 border border-indigo-200 text-indigo-600 text-[11px] font-black rounded-2xl flex items-center gap-2.5 hover:bg-indigo-600 hover:text-white transition-all active:scale-95 shadow-lg shadow-indigo-100/20"><FileUp size={16} /> 追加 SN 文本</button>
                          </div>
                          <textarea 
                            value={config.additionalSNs.join('\n')}
                            onChange={(e) => { const input = e.target.value.split(/[\s,;]+/).filter(Boolean); setParsedConfigs(prev => prev.map(c => c.id === config.id ? { ...c, additionalSNs: input } : c)); }}
                            placeholder="请粘贴额外的资产序列号，支持空格/换行/逗号分隔..."
                            className="w-full flex-1 p-8 text-[13px] font-mono font-bold border border-slate-100 rounded-[3rem] focus:ring-8 focus:ring-indigo-50 focus:border-indigo-400 outline-none resize-none transition-all shadow-inner bg-slate-50/10"
                          />
                        </div>
                      </div>
                      <div className="w-[450px] bg-indigo-50/20 rounded-[3.5rem] p-10 border border-indigo-100 shadow-inner flex flex-col gap-6">
                        <div className="flex items-center justify-between pb-4 border-b border-indigo-100">
                           <h6 className="text-[13px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2"><ListFilter size={16} /> 最终同步任务队列</h6>
                           <div className="px-4 py-1.5 bg-indigo-600 text-white text-[12px] font-black rounded-2xl shadow-xl shadow-indigo-100 animate-in zoom-in">{config.targetSNs.length} 台资产</div>
                        </div>
                        <div className="flex-1 space-y-3 overflow-y-auto pr-4 custom-scrollbar">
                          {config.targetSNs.map((sn, snIdx) => (
                            <div key={`${sn}-${snIdx}`} className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-indigo-100 shadow-sm animate-in fade-in slide-in-from-right-2 duration-300">
                              <div className="flex items-center gap-4">
                                <span className="text-[11px] text-indigo-300 font-black">#{snIdx + 1}</span>
                                <span className="text-[14px] font-mono font-black text-slate-700 tracking-tight">{sn}</span>
                              </div>
                              {config.suggestedSNs.includes(sn) ? <Database size={14} className="text-indigo-200" /> : <PlusCircle size={14} className="text-indigo-500 animate-pulse" />}
                            </div>
                          ))}
                          {config.targetSNs.length === 0 && <div className="py-32 flex flex-col items-center gap-4 opacity-20"><Boxes size={48} /><p className="text-sm font-bold">等待追加 SN 录入</p></div>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-12 py-9 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-5 text-gray-400">
            <AlertTriangle size={32} className="text-amber-500" />
            <div className="max-w-xl">
              <span className="text-[12px] font-black leading-tight uppercase tracking-tight text-slate-500">同步改配任务将强制覆盖目标资产的核心硬件快照。厂商指派将直接决定 Spec 命名规范。</span>
            </div>
          </div>
          <div className="flex gap-6">
            <button onClick={onClose} className="px-12 py-4 text-[13px] font-black text-gray-500 hover:bg-slate-200 rounded-[1.25rem] transition-all">放弃同步</button>
            {step > 1 && <button onClick={() => setStep(step - 1)} className="px-12 py-4 text-[13px] font-black text-indigo-600 border-2 border-indigo-100 rounded-[1.25rem] hover:bg-indigo-50 transition-all">返回上一步</button>}
            {step < 3 ? (
              <button onClick={() => setStep(step + 1)} disabled={step === 1 && (!hasUploaded || assignedCount < allDetectedSNs.length)} className={`flex items-center gap-4 px-20 py-4 text-[13px] font-black text-white rounded-[1.25rem] shadow-2xl transition-all ${step === 1 && (!hasUploaded || assignedCount < allDetectedSNs.length) ? 'bg-gray-300 cursor-not-allowed shadow-none' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-indigo-100'}`}>
                {step === 1 ? '确认指派，进入核对' : '确认无误，同步预览'} <ChevronRight size={22} />
              </button>
            ) : (
              <button onClick={() => { onApply(selectedConfigs); onClose(); }} className="flex items-center gap-4 px-24 py-5 text-[14px] font-black text-white bg-emerald-600 rounded-[1.5rem] shadow-2xl shadow-emerald-100 hover:bg-emerald-700 active:scale-95 transition-all">
                <Save size={24} /> 立即下发资产改配同步
              </button>
            )}
          </div>
        </div>
        <input type="file" ref={snFileInputRef} className="hidden" onChange={(e) => currentActiveConfigId && handleSNFileUpload(e, currentActiveConfigId)} />

        {/* 新增：Part ID 分类详情弹窗 */}
        {detailModalCategory && (
           <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 backdrop-blur-md animate-in fade-in duration-200 p-6">
              <div className="bg-white w-[600px] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">
                 <div className="px-10 py-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                       <div className="p-4 bg-indigo-600 text-white rounded-[1.5rem] shadow-xl">
                          <Activity size={24} />
                       </div>
                       <div>
                          <h4 className="text-xl font-black text-slate-800">
                             【{CATEGORIES.find(c => c.id === detailModalCategory)?.label}】识别 ID 汇总
                          </h4>
                          <p className="text-[12px] text-slate-400 font-medium">共检测到 {aggregatedPartsByCategory[detailModalCategory]?.all.size} 个唯一的原始硬件标识符</p>
                       </div>
                    </div>
                    <button onClick={() => setDetailModalCategory(null)} className="p-3 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                       <X size={24} />
                    </button>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto p-10 bg-white max-h-[450px] custom-scrollbar">
                    <div className="space-y-3">
                       {Array.from(aggregatedPartsByCategory[detailModalCategory]?.all || []).map((partId, pIdx) => {
                          // Explicitly cast partId as string to fix TypeScript unknown type issues
                          const abnormal = isAbnormal(partId as string);
                          return (
                             <div key={pIdx} className={`flex items-center justify-between px-6 py-4 border rounded-2xl transition-all ${abnormal ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                                <div className="flex items-center gap-4">
                                   <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black ${abnormal ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                      {pIdx + 1}
                                   </div>
                                   <span className="text-[13px] font-mono font-black">{partId as string}</span>
                                </div>
                                {abnormal && (
                                   <div className="px-3 py-1 bg-rose-500 text-white text-[9px] font-black rounded-lg shadow-lg animate-pulse">
                                      异常项
                                   </div>
                                )}
                             </div>
                          );
                       })}
                    </div>
                 </div>

                 <div className="px-10 py-8 border-t border-slate-50 bg-slate-50/80 flex items-center justify-between">
                    <div className="text-[11px] text-slate-400 max-w-[280px] leading-relaxed">
                       这些 ID 是直接从服务器底层接口或日志中抓取的原始标识符。
                    </div>
                    <div className="flex gap-4">
                       <button 
                         onClick={() => setDetailModalCategory(null)}
                         className="px-6 py-3 text-[12px] font-black text-slate-500 hover:bg-white rounded-2xl transition-all"
                       >
                         关闭面板
                       </button>
                       <button 
                         onClick={() => handleExportPartIds(detailModalCategory)}
                         className="flex items-center gap-3 px-10 py-3 bg-indigo-600 text-white rounded-2xl text-[12px] font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
                       >
                         <Download size={16} /> 导出清单 (.txt)
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};
