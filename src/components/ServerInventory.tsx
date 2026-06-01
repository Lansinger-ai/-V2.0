import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Plus, 
  CheckSquare, 
  Download, 
  Upload,
  Filter,
  RefreshCw, 
  Settings2, 
  SearchCode,
  Boxes,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Database,
  HardDrive,
  Activity,
  Zap,
  Network,
  Disc,
  Layers,
  History,
  Clock,
  FileText,
  Server,
  Edit3,
  Package,
  Cpu as ModelIcon,
  X,
  ArrowRight,
  ChevronDown,
  Trash2,
  Copy,
  AlertCircle,
  Lock,
  Check,
  ChevronsUpDown
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ServerComponentRecord, LogEntry, SlotGroupInventory, GpuDictionaryEntry } from '@/src/types';

// 极简单选搜索组件
const SearchableSelect = ({ 
  options, 
  value, 
  onValueChange, 
  placeholder 
}: { 
  options: string[], 
  value: string, 
  onValueChange: (val: string) => void,
  placeholder: string
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  const filtered = options.filter(opt => opt.toLowerCase().includes(search.toLowerCase()));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger 
        className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between px-4 font-bold text-sm focus:bg-white transition-all cursor-pointer hover:bg-slate-100/50 outline-none"
      >
        <span className={value ? "text-slate-800" : "text-slate-400"}>
          {value || placeholder}
        </span>
        <ChevronDown className="w-4 h-4 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0 rounded-2xl shadow-2xl border-none outline-none overflow-hidden" align="start">
        <div className="flex items-center border-b border-slate-100 px-3 bg-slate-50/50">
          <Search className="w-4 h-4 text-slate-400" />
          <input 
            className="flex h-11 w-full bg-transparent py-3 px-2 text-sm outline-none placeholder:text-slate-400 font-bold"
            placeholder="搜索..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="max-h-[240px] overflow-y-auto p-1 bg-white">
          {filtered.length === 0 && (
            <div className="p-4 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">无匹配结果</div>
          )}
          {filtered.map(opt => (
            <div 
              key={opt}
              onClick={() => {
                onValueChange(opt);
                setOpen(false);
                setSearch('');
              }}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${value === opt ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-600'}`}
            >
              <span className="text-sm font-bold">{opt}</span>
              {value === opt && <Check className="w-4 h-4 text-indigo-600" />}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
const MultiSelect = ({ 
  options, 
  selected, 
  onChange, 
  placeholder 
}: { 
  options: string[], 
  selected: string[], 
  onChange: (val: string[]) => void,
  placeholder: string
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger 
        className="w-full h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-between px-3 font-medium text-xs cursor-pointer hover:bg-slate-50 transition-colors outline-none"
      >
        <span className="truncate">
          {selected.length === 0 ? placeholder : `已选 ${selected.length} 项`}
        </span>
        <ChevronDown className="w-3 h-3 opacity-50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 rounded-xl p-1 max-h-[300px] overflow-y-auto">
        {options.map(opt => (
          <div 
            key={opt} 
            onClick={() => {
              if (selected.includes(opt)) {
                onChange(selected.filter(s => s !== opt));
              } else {
                onChange([...selected, opt]);
              }
            }}
            className="flex items-center gap-2 px-2 py-1.5 hover:bg-indigo-50 rounded-lg cursor-pointer transition-colors"
          >
            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selected.includes(opt) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
              {selected.includes(opt) && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className="text-xs font-bold text-slate-700">{opt}</span>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const MOCK_DATA: ServerComponentRecord[] = [
  { 
    id: 1, 
    serverSN: 'N888500240301021', 
    serverPackage: 'MI-GM502-V9B', 
    serverModel: 'SYS-821GE-TNHR',
    vendor: 'Supermicro',
    isGPU: true,
    dataSource: '人工维护',
    inventory: [
      { spec: { type: 'SATA/SAS', size: '2.5寸 (SFF)' }, total: 8, used: [{ name: '固态硬盘', count: 4 }] },
      { spec: { type: 'SATA/SAS', size: '3.5寸 (LFF)' }, total: 12, used: [{ name: '机械硬盘', count: 6 }] },
      { spec: { type: '内存', size: 'DDR4' }, total: 32, used: [{ name: '内存', count: 16 }] },
      { spec: { type: 'PCIe 4.0', size: 'x16' }, total: 4, used: [{ name: 'GPU', count: 2 }] },
      { spec: { type: 'PCIe 4.0', size: 'x8' }, total: 2, used: [] },
      { spec: { type: 'CPU', size: 'LGA4189' }, total: 2, used: [{ name: 'CPU', count: 2 }] }
    ],
    logs: [{ id: '1', timestamp: '2026-01-27 10:00:05', type: 'manual', content: '初始资产录入', operator: 'Admin' }],
    updateTime: '2026-01-27 19:19:29' 
  },
  { 
    id: 2, 
    serverSN: 'N888011240902011', 
    serverPackage: 'N2-8-GW2', 
    serverModel: 'X660 G45',
    vendor: 'H3C',
    dataSource: 'by sn',
    inventory: [
      { spec: { type: 'PCIe 5.0', size: 'x16' }, total: 4, used: [{ name: '网卡', count: 2 }] },
      { spec: { type: 'PCIe 5.0', size: 'x4' }, total: 2, used: [] },
      { spec: { type: 'PCIe 5.0', size: 'HHHL' }, total: 2, used: [] },
      { spec: { type: '内存', size: 'DDR5' }, total: 24, used: [{ name: '内存', count: 12 }] },
      { spec: { type: 'CPU', size: 'SP3' }, total: 2, used: [{ name: 'CPU', count: 2 }] }
    ],
    logs: [{ id: '2', timestamp: '2026-01-27 10:05:12', type: 'manual', content: '批量槽位核准', operator: 'System' }],
    updateTime: '2026-01-27 19:19:36' 
  },
  { 
    id: 3, 
    serverSN: 'A925247X4602747', 
    serverPackage: 'L-E-GM502-V9M', 
    serverModel: 'SA5212M5',
    vendor: 'Inspur',
    dataSource: 'by套餐',
    inventory: [
      { spec: { type: 'SATA/SAS', size: '3.5寸 (LFF)' }, total: 12, used: [{ name: '硬盘', count: 6 }] },
      { spec: { type: 'M.2', size: '2280' }, total: 2, used: [{ name: '硬盘', count: 1 }] },
      { spec: { type: '内存', size: 'DDR4' }, total: 16, used: [{ name: '内存', count: 4 }] }
    ],
    logs: [{ id: '3', timestamp: '2026-01-27 10:10:45', type: 'auto', content: '实时用量同步', operator: 'Monitor' }],
    updateTime: '2026-01-27 19:19:38' 
  },
  { 
    id: 4, 
    serverSN: 'SN-20260004', 
    serverPackage: 'KPC-YH-S2-4B-2', 
    serverModel: 'R620-G40',
    vendor: 'H3C',
    dataSource: 'by机型',
    inventory: [
      { spec: { type: '内存', size: 'DDR5' }, total: 32, used: [{ name: '内存', count: 8 }] },
      { spec: { type: 'CPU', size: 'LGA4677' }, total: 2, used: [{ name: 'CPU', count: 2 }] },
      { spec: { type: 'PCIe 4.0', size: 'x16' }, total: 2, used: [] }
    ],
    logs: [], 
    updateTime: '2026-04-22 10:00:00'
  },
  { 
    id: 5, 
    serverSN: 'SN-20260005', 
    serverPackage: 'MI-GM502-V9B', 
    serverModel: '2288H_V6',
    vendor: 'Huawei',
    dataSource: '人工维护',
    inventory: [
      { spec: { type: 'SATA/SAS', size: '2.5寸 (SFF)' }, total: 12, used: [{ name: '硬盘', count: 4 }] },
      { spec: { type: 'PCIe 3.0', size: 'x8' }, total: 6, used: [] },
      { spec: { type: 'OCP3', size: 'SFF' }, total: 1, used: [{ name: '网卡', count: 1 }] }
    ],
    logs: [], 
    updateTime: '2026-04-22 10:05:00'
  },
  { 
    id: 6, 
    serverSN: 'SN-20260006', 
    serverPackage: 'N2-8-GW2', 
    serverModel: 'EG340W-G20',
    vendor: 'Supermicro',
    dataSource: 'by sn',
    inventory: [
      { spec: { type: 'PCIe 5.0', size: 'x16' }, total: 8, used: [{ name: 'GPU', count: 4 }] },
      { spec: { type: '内存', size: 'DDR5 RECC' }, total: 64, used: [{ name: '内存', count: 32 }] },
      { spec: { type: 'SATA/SAS', size: '3.5寸 (LFF)' }, total: 4, used: [] }
    ],
    logs: [], 
    updateTime: '2026-04-22 10:10:00'
  },
  { 
    id: 7, 
    serverSN: 'SN-20260007', 
    serverPackage: 'L-E-GM502-V9M', 
    serverModel: 'SYS-821GE-TNHR',
    dataSource: 'by套餐',
    inventory: [
      { spec: { type: 'U.2', size: 'SFF' }, total: 8, used: [{ name: 'NVMe SSD', count: 4 }] },
      { spec: { type: 'CPU', size: 'LGA4189' }, total: 2, used: [{ name: 'CPU', count: 2 }] },
      { spec: { type: '内存', size: 'DDR4' }, total: 32, used: [{ name: '内存', count: 16 }] }
    ],
    logs: [], 
    updateTime: '2026-04-22 10:15:00'
  },
  { 
    id: 8, 
    serverSN: 'SN-20260008', 
    serverPackage: 'KPC-YH-S2-4B-2', 
    serverModel: 'X660 G45',
    dataSource: 'by机型',
    inventory: [
      { spec: { type: '内存', size: 'DDR4' }, total: 16, used: [{ name: '内存', count: 8 }] },
      { spec: { type: 'SATA/SAS', size: '2.5寸 (SFF)' }, total: 8, used: [{ name: '硬盘', count: 2 }] },
      { spec: { type: 'PCIe 4.0', size: 'x4' }, total: 4, used: [] }
    ],
    logs: [], 
    updateTime: '2026-04-22 10:20:00'
  },
  { 
    id: 9, 
    serverSN: 'SN-20260009', 
    serverPackage: 'MI-GM502-V9B', 
    serverModel: 'SA5212M5',
    dataSource: '人工维护',
    inventory: [
      { spec: { type: 'SATA/SAS', size: '3.5寸 (LFF)' }, total: 24, used: [{ name: '机械硬盘', count: 12 }] },
      { spec: { type: 'M.2', size: '22110' }, total: 2, used: [{ name: 'M.2 SSD', count: 2 }] },
      { spec: { type: '内存', size: 'DDR4' }, total: 32, used: [{ name: '内存', count: 8 }] }
    ],
    logs: [], 
    updateTime: '2026-04-22 10:25:00'
  },
  { 
    id: 10, 
    serverSN: 'SN-20260010', 
    serverPackage: 'N2-8-GW2', 
    serverModel: 'R620-G40',
    dataSource: 'by sn',
    inventory: [
      { spec: { type: '内存', size: 'DDR4' }, total: 128, used: [{ name: '内存', count: 64 }] },
      { spec: { type: 'CPU', size: 'LGA3647' }, total: 2, used: [{ name: 'CPU', count: 2 }] },
      { spec: { type: 'PCIe', size: 'x16' }, total: 10, used: [] }
    ],
    logs: [], 
    updateTime: '2026-04-22 10:30:00'
  },
  { 
    id: 11, 
    serverSN: 'SN-20260011', 
    serverPackage: 'L-E-GM502-V9M', 
    serverModel: '2288H_V6',
    dataSource: 'by套餐',
    inventory: [
      { spec: { type: 'M.2', size: '22110' }, total: 2, used: [] },
      { spec: { type: 'SATA/SAS', size: '2.5寸 (SFF)' }, total: 12, used: [{ name: 'SSD', count: 4 }] },
      { spec: { type: '内存', size: 'DDR5' }, total: 64, used: [{ name: '内存', count: 16 }] }
    ],
    logs: [], 
    updateTime: '2026-04-22 10:35:00'
  },
  { 
    id: 12, 
    serverSN: 'SN-20260012', 
    serverPackage: 'KPC-YH-S2-4B-2', 
    serverModel: 'EG340W-G20',
    dataSource: 'by机型',
    inventory: [
      { spec: { type: 'PCIe', size: 'HHHL' }, total: 4, used: [{ name: '网卡', count: 1 }] },
      { spec: { type: 'U.2', size: 'SFF' }, total: 8, used: [{ name: 'U.2 SSD', count: 4 }] },
      { spec: { type: '内存', size: 'DDR5 RECC' }, total: 32, used: [] }
    ],
    logs: [], 
    updateTime: '2026-04-22 10:40:00'
  },
  { 
    id: 13, 
    serverSN: 'SN-20260013', 
    serverPackage: 'MI-GM502-V9B', 
    serverModel: 'SYS-821GE-TNHR',
    dataSource: '人工维护',
    inventory: [
      { spec: { type: 'OCP3', size: 'SFF' }, total: 1, used: [{ name: '网卡', count: 1 }] },
      { spec: { type: 'PCIe', size: 'x16' }, total: 8, used: [{ name: 'GPU', count: 8 }] },
      { spec: { type: '内存', size: 'DDR4' }, total: 128, used: [{ name: '内存', count: 64 }] }
    ],
    logs: [], 
    updateTime: '2026-04-22 10:45:00'
  },
  { 
    id: 14, 
    serverSN: 'SN-20260014', 
    serverPackage: 'N2-8-GW2', 
    serverModel: 'X660 G45',
    dataSource: 'by sn',
    inventory: [
      { spec: { type: 'SATA/SAS', size: '3.5寸 (LFF)' }, total: 8, used: [{ name: '硬盘', count: 4 }] },
      { spec: { type: 'CPU', size: 'SP5' }, total: 1, used: [{ name: 'CPU', count: 1 }] },
      { spec: { type: '内存', size: 'DDR5' }, total: 32, used: [] }
    ],
    logs: [], 
    updateTime: '2026-04-22 10:50:00'
  },
  { 
    id: 15, 
    serverSN: 'SN-20260015', 
    serverPackage: 'L-E-GM502-V9M', 
    serverModel: 'SA5212M5',
    dataSource: 'by套餐',
    inventory: [
      { spec: { type: 'CPU', size: 'LGA4677' }, total: 2, used: [{ name: 'CPU', count: 2 }] },
      { spec: { type: '内存', size: 'DDR5 RECC' }, total: 128, used: [{ name: '内存', count: 32 }] },
      { spec: { type: 'SATA/SAS', size: '2.5寸 (SFF)' }, total: 12, used: [] }
    ],
    logs: [], 
    updateTime: '2026-04-22 10:55:00'
  },
  { 
    id: 16, 
    serverSN: 'SN-20260016', 
    serverPackage: 'KPC-YH-S2-4B-2', 
    serverModel: 'R620-G40',
    dataSource: 'by机型',
    inventory: [
      { spec: { type: 'PCIe', size: 'x16' }, total: 4, used: [{ name: 'NIC', count: 2 }] },
      { spec: { type: 'M.2', size: '2280' }, total: 2, used: [{ name: 'SSD', count: 2 }] },
      { spec: { type: '内存', size: 'DDR4' }, total: 16, used: [{ name: '内存', count: 8 }] }
    ],
    logs: [], 
    updateTime: '2026-04-22 11:00:00'
  },
  { 
    id: 17, 
    serverSN: 'SN-20260017', 
    serverPackage: 'MI-GM502-V9B', 
    serverModel: '2288H_V6',
    dataSource: '人工维护',
    inventory: [
      { spec: { type: 'SATA/SAS', size: '2.5寸 (SFF)' }, total: 8, used: [{ name: 'Disk', count: 4 }] },
      { spec: { type: '内存', size: 'DDR5' }, total: 16, used: [] },
      { spec: { type: 'PCIe', size: 'x4' }, total: 2, used: [] }
    ],
    logs: [], 
    updateTime: '2026-04-22 11:05:00'
  },
  { 
    id: 18, 
    serverSN: 'SN-20260018', 
    serverPackage: 'N2-8-GW2', 
    serverModel: 'EG340W-G20',
    dataSource: 'by sn',
    inventory: [
      { spec: { type: 'M.2', size: '2280' }, total: 2, used: [{ name: 'Boot Disk', count: 1 }] },
      { spec: { type: 'CPU', size: 'LGA3647' }, total: 2, used: [{ name: 'CPU', count: 2 }] },
      { spec: { type: '内存', size: 'DDR4' }, total: 64, used: [{ name: '内存', count: 32 }] }
    ],
    logs: [], 
    updateTime: '2026-04-22 11:10:00'
  },
  { 
    id: 19, 
    serverSN: 'SN-20260019', 
    serverPackage: 'L-E-GM502-V9M', 
    serverModel: 'SYS-821GE-TNHR',
    dataSource: 'by套餐',
    inventory: [
      { spec: { type: 'U.2', size: 'SFF' }, total: 10, used: [{ name: 'NVMe', count: 2 }] },
      { spec: { type: '内存', size: 'DDR4' }, total: 32, used: [{ name: '内存', count: 16 }] },
      { spec: { type: 'OCP3', size: 'SFF' }, total: 1, used: [] }
    ],
    logs: [], 
    updateTime: '2026-04-22 11:15:00'
  },
  { 
    id: 20, 
    serverSN: 'SN-20260020', 
    serverPackage: 'KPC-YH-S2-4B-2', 
    serverModel: 'X660 G45',
    isGPU: true,
    dataSource: 'by机型',
    inventory: [
      { spec: { type: 'PCIe 5.0', size: 'x16' }, total: 4, used: [{ name: 'GPU', count: 1 }] },
      { spec: { type: 'SATA/SAS', size: '3.5寸 (LFF)' }, total: 4, used: [] }
    ],
    logs: [], 
    updateTime: '2026-04-22 11:20:00'
  }
];

const SLOT_COLUMNS = [
  { key: 'CPU', icon: Cpu, label: 'CPU', color: 'text-rose-600', bg: 'bg-rose-50' },
  { key: '内存', icon: Layers, label: '内存', color: 'text-blue-600', bg: 'bg-blue-50' },
  { key: 'SATA/SAS', icon: Database, label: 'SATA/SAS', color: 'text-amber-600', bg: 'bg-amber-50' },
  { key: 'U.2', icon: Zap, label: 'U.2', color: 'text-cyan-600', bg: 'bg-cyan-50' },
  { key: 'M.2', icon: HardDrive, label: 'M.2', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { key: 'PCIe 3.0', icon: Activity, label: 'PCIe 3.0', color: 'text-purple-600', bg: 'bg-purple-50' },
  { key: 'PCIe 4.0', icon: Activity, label: 'PCIe 4.0', color: 'text-purple-600', bg: 'bg-purple-50' },
  { key: 'PCIe 5.0', icon: Activity, label: 'PCIe 5.0', color: 'text-purple-600', bg: 'bg-purple-50' },
  { key: 'PCIe 6.0', icon: Activity, label: 'PCIe 6.0', color: 'text-purple-600', bg: 'bg-purple-50' },
  { key: 'OCP3', icon: Network, label: 'OCP3', color: 'text-indigo-600', bg: 'bg-indigo-50' },
] as const;

const PCIE_SIZES = ['x4', 'x8', 'x16', 'HHHL', 'FHHL'];

const SLOT_SIZE_PRESETS: Record<string, string[]> = {
  'SATA/SAS': ['2.5寸 (SFF)', '3.5寸 (LFF)', 'SFF', 'LFF'],
  'PCIe 3.0': PCIE_SIZES,
  'PCIe 4.0': PCIE_SIZES,
  'PCIe 5.0': PCIE_SIZES,
  'PCIe 6.0': PCIE_SIZES,
  'PCIe': PCIE_SIZES,
  'M.2': ['2280', '22110', '2242'],
  'U.2': ['SFF (15mm)', 'SFF (7mm)'],
  'OCP3': ['SFF', 'LFF'],
  '内存': ['DDR4', 'DDR5', 'DDR5 RECC'],
  'CPU': ['LGA4189', 'LGA4677', 'LGA3647', 'SP3', 'SP5']
};

const SearchableSlotTypeSelect = ({ 
  value, 
  onValueChange, 
  disabled,
  className
}: { 
  value: string; 
  onValueChange: (v: string) => void;
  disabled?: boolean;
  className?: string;
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={`h-8 w-full flex items-center justify-between px-3 text-[11px] font-bold border border-indigo-100 bg-white rounded-md hover:bg-slate-50 transition-all cursor-pointer outline-none ${disabled ? 'opacity-70 cursor-not-allowed pointer-events-none' : ''} ${className || ''}`}
      >
        {value
          ? SLOT_COLUMNS.find((c) => c.key === value)?.label
          : "选择类型..."}
        <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0 rounded-xl shadow-2xl border-indigo-50 z-[9999]" align="start">
        <Command className="rounded-xl">
          <CommandInput placeholder="搜索槽位类型..." className="h-8 text-[11px]" />
          <CommandList className="max-h-[200px]">
            <CommandEmpty className="py-2 text-[10px] text-center text-slate-400">未找到相关类型</CommandEmpty>
            <CommandGroup>
              {SLOT_COLUMNS.map((c) => (
                <CommandItem
                  key={c.key}
                  value={c.key}
                  onSelect={() => {
                    onValueChange(c.key);
                    setOpen(false);
                  }}
                  className="text-[11px] font-bold py-2 cursor-pointer hover:bg-indigo-50"
                >
                  <Check
                    className={`mr-2 h-3 w-3 ${
                      value === c.key ? "opacity-100 text-indigo-600" : "opacity-0"
                    }`}
                  />
                  {c.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const SearchableSimpleSelect = ({ 
  value, 
  onValueChange, 
  options,
  placeholder = "选择...",
  searchPlaceholder = "搜索...",
  emptyMessage = "未找到相关项",
  disabled,
  className
}: { 
  value: string; 
  onValueChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={`h-9 w-full flex items-center justify-between px-3 text-xs font-bold border border-slate-100 bg-slate-50/50 rounded-md hover:bg-white hover:border-indigo-200 transition-all cursor-pointer outline-none ${disabled ? 'opacity-70 cursor-not-allowed pointer-events-none' : ''} ${className || ''}`}
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50 text-slate-400" />
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0 rounded-2xl shadow-2xl border-indigo-50 z-[9999]" align="start">
        <Command className="rounded-2xl">
          <CommandInput placeholder={searchPlaceholder} className="h-9 text-xs" />
          <CommandList className="max-h-[240px] custom-scrollbar">
            <CommandEmpty className="py-3 text-xs text-center text-slate-400 font-medium">{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem
                  key={opt}
                  value={opt}
                  onSelect={() => {
                    onValueChange(opt);
                    setOpen(false);
                  }}
                  className="text-xs font-bold py-2.5 cursor-pointer hover:bg-indigo-50 aria-selected:bg-indigo-50 transition-colors"
                >
                  <Check
                    className={`mr-2 h-3.5 w-3.5 ${
                      value === opt ? "opacity-100 text-indigo-600" : "opacity-0"
                    }`}
                  />
                  <span className="truncate">{opt}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const SearchableMultiSelect = ({ 
  value, 
  onValueChange, 
  options,
  placeholder = "选择...",
  searchPlaceholder = "搜索...",
  emptyMessage = "未找到相关项",
  disabled,
  className
}: { 
  value: string[]; 
  onValueChange: (v: string[]) => void;
  options: string[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
}) => {
  const [open, setOpen] = React.useState(false);

  const toggleOption = (opt: string) => {
    const newValue = value.includes(opt) 
      ? value.filter(v => v !== opt) 
      : [...value, opt];
    onValueChange(newValue);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={`h-9 w-full flex items-center justify-between px-3 text-xs font-bold border border-slate-100 bg-slate-50/50 rounded-md hover:bg-white hover:border-indigo-200 transition-all cursor-pointer outline-none ${disabled ? 'opacity-70 cursor-not-allowed pointer-events-none' : ''} ${className || ''}`}
      >
        <span className="truncate">
          {value.length > 0 ? value.join(', ') : placeholder}
        </span>
        <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50 text-slate-400" />
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0 rounded-2xl shadow-2xl border-indigo-50 z-[9999]" align="start">
        <Command className="rounded-2xl">
          <CommandInput placeholder={searchPlaceholder} className="h-9 text-xs" />
          <CommandList className="max-h-[240px] custom-scrollbar">
            <CommandEmpty className="py-3 text-xs text-center text-slate-400 font-medium">{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem
                  key={opt}
                  value={opt}
                  onSelect={() => toggleOption(opt)}
                  className="text-xs font-bold py-2.5 cursor-pointer hover:bg-indigo-50 aria-selected:bg-indigo-50 transition-colors"
                >
                  <div className="flex items-center gap-2 w-full">
                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${value.includes(opt) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white'}`}>
                      {value.includes(opt) && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <span className="truncate">{opt}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default function ServerInventory() {
  const [data, setData] = useState<ServerComponentRecord[]>(MOCK_DATA);
  
  // 提取唯一选项
  const modelOptions = React.useMemo(() => Array.from(new Set(data.map(item => item.serverModel))).filter(Boolean), [data]);
  const packageOptions = React.useMemo(() => Array.from(new Set(data.map(item => item.serverPackage))).filter(Boolean), [data]);
  const vendorOptions = React.useMemo(() => Array.from(new Set(data.map(item => item.vendor))).filter(Boolean), [data]);
  const dataSourceOptions = React.useMemo(() => Array.from(new Set(data.map(item => item.dataSource))).filter(Boolean), [data]) as string[];
  const slotTypeOptions = React.useMemo(() => SLOT_COLUMNS.map(c => c.key), []);
  const slotSizeOptions = React.useMemo(() => {
    const sizes = new Set<string>();
    data.forEach(item => {
      item.inventory.forEach(inv => {
        if (inv.spec.size) sizes.add(inv.spec.size);
      });
    });
    return Array.from(sizes).filter(Boolean);
  }, [data]);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isBatchUpdateOpen, setIsBatchUpdateOpen] = useState(false);
  const [gpuDict, setGpuDict] = useState<GpuDictionaryEntry[]>([
    {
      id: '1',
      packageName: 'MI-GM502-V9B',
      model: 'SYS-821GE-TNHR',
      vendor: 'Supermicro',
      slots: [
        { type: 'GPU', size: 'NVIDIA H100 80GB', count: 8 },
        { type: 'NVMe', size: '2.5" U.2', count: 12 },
        { type: '内存', size: 'DDR5 128G', count: 32 }
      ]
    },
    {
      id: '2',
      packageName: 'N2-8-GW2',
      model: 'X660 G45',
      vendor: 'H3C',
      slots: [
        { type: 'GPU', size: 'A100 40GB', count: 8 },
        { type: 'SATA/SAS', size: '2.5" SFF', count: 12 },
        { type: '内存', size: 'DDR4 64G', count: 16 }
      ]
    }
  ]);

  const [isGpuDictOpen, setIsGpuDictOpen] = useState(false);
  const [isDictFormView, setIsDictFormView] = useState(false);
  const [editingDictEntry, setEditingDictEntry] = useState<GpuDictionaryEntry | null>(null);

  // 标准槽位字典搜索状态 (升级为多选)
  const [gpuDictSearch, setGpuDictSearch] = useState({
    packages: [] as string[],
    models: [] as string[],
    vendors: [] as string[],
    slotTypes: [] as string[]
  });
  const [gpuDictKeyword, setGpuDictKeyword] = useState('');
  const [isDictAdvancedSearchOpen, setIsDictAdvancedSearchOpen] = useState(false);

  // 分页状态
  const [dictPage, setDictPage] = useState(1);
  const [dictPageSize] = useState(5);

  // 模拟主数据 (通常从接口获取)
  const MASTER_MODELS = ['SYS-821GE-TNHR', 'X660 G45', 'FusionServer G5500 V5', 'UniServer R5300 G5', 'NF5468M6'];
  const MASTER_VENDORS = ['Supermicro', 'H3C', 'Huawei', 'Inspur', 'Lenovo', 'Dell'];
  const MASTER_PACKAGES = ['不限套餐', 'MI-GM502-V9B', 'N2-8-GW2', 'T4-GPU-ST', 'H100-8-NVLINK'];

  // 初始化新建字典项的状态
  const [dictForm, setDictForm] = useState<Omit<GpuDictionaryEntry, 'id'>>({
    packageName: '',
    model: '',
    vendor: '',
    slots: [{ type: 'GPU', size: 'A100 80GB', count: 8 }]
  });

  const [isDictLogOpen, setIsDictLogOpen] = useState(false);
  const [activeDictLogEntry, setActiveDictLogEntry] = useState<GpuDictionaryEntry | null>(null);

  const [isColumnSettingsOpen, setIsColumnSettingsOpen] = useState(false);
  const [isGlobalLogOpen, setIsGlobalLogOpen] = useState(false);
  // 占用率进度条组件
  const UsageProgress = ({ used, total }: { used: number, total: number }) => {
    const percentage = Math.min(Math.round((used / total) * 100), 100);
    const isOver = used > total;
    
    let barColor = "bg-indigo-500";
    let bgColor = "bg-indigo-100";
    
    if (percentage >= 90) {
      barColor = "bg-rose-500";
      bgColor = "bg-rose-100";
    } else if (percentage >= 70) {
      barColor = "bg-amber-500";
      bgColor = "bg-amber-100";
    } else if (percentage > 0) {
      barColor = "bg-emerald-500";
      bgColor = "bg-emerald-100";
    } else {
      barColor = "bg-slate-300";
      bgColor = "bg-slate-100";
    }

    return (
      <div className="flex flex-col gap-1.5 w-full min-w-[120px]">
        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-tight">
          <span className={isOver ? "text-rose-600 animate-pulse" : "text-slate-500"}>
            {isOver ? "超额占用" : `${percentage}%`}
          </span>
          <span className="text-slate-400 font-mono">{used} / {total}</span>
        </div>
        <div className={`h-2 w-full ${bgColor} rounded-full overflow-hidden shadow-inner flex relative`}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full ${barColor} rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)] relative`}
          >
            {percentage > 20 && (
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            )}
          </motion.div>
        </div>
      </div>
    );
  };

  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'id', 'serverSN', 'isGPU', 'vendor', 'serverPackage', 'serverModel', 'dataSource', 'slotType', 'slotSize', 'slotUsageRate', 'slotTotal', 'slotUsed', 'slotRemaining', 'actions'
  ]);

  // 高级查询状态
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [advSearchType, setAdvSearchType] = useState<'standard' | 'batch'>('standard');
  const [advFilters, setAdvFilters] = useState({
    serverSN: '',
    serverPackage: [] as string[],
    serverModel: [] as string[],
    vendor: [] as string[],
    isGPU: [] as string[], // 'GPU', 'CPU'
    dataSource: [] as string[],
    slotType: [] as string[],
    slotSize: [] as string[],
  });
  const [advBatchSNs, setAdvBatchSNs] = useState('');
  const [advBatchType, setAdvBatchType] = useState<'sn' | 'package' | 'model'>('sn');
  const [isFiltersApplied, setIsFiltersApplied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) return;

        const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
        if (lines.length <= 1) {
          alert('文件内容为空或仅包含表头');
          return;
        }

        // 识别表头索引 (支持一定程度的列偏移或乱序)
        const headerRow = lines[0].split(',').map(h => h.trim());
        const getIdx = (name: string) => headerRow.findIndex(h => h.includes(name));

        const snIdx = getIdx('服务器SN');
        const vendorIdx = getIdx('厂商');
        const packIdx = getIdx('套餐');
        const modelIdx = getIdx('机型');
        const gpuIdx = getIdx('是否GPU');
        const sourceIdx = getIdx('数据来源');
        const typeIdx = getIdx('槽位类型');
        const specIdx = getIdx('规格');
        const totalIdx = getIdx('总槽位数');

        if (snIdx === -1 || typeIdx === -1 || totalIdx === -1) {
          alert('导入失败：关键字段（服务器SN、槽位类型、总槽位数）缺失');
          return;
        }

        // 解析数据并按 SN 分组
        const importedDataMap = new Map<string, any>();
        let currentSN = '';

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim());
          if (cols.length < 3) continue;

          // 获取行 SN，如果为空则沿用上一行有效 SN
          const rowSN = cols[snIdx];
          if (rowSN) {
            currentSN = rowSN;
          }

          if (!currentSN) continue;

          // 提取槽位定义
          const slotType = cols[typeIdx];
          const slotSpec = specIdx !== -1 ? cols[specIdx] : '';
          const slotTotal = parseInt(cols[totalIdx]) || 0;

          if (!slotType && slotTotal === 0) continue;

          if (!importedDataMap.has(currentSN)) {
            importedDataMap.set(currentSN, {
              serverSN: currentSN,
              vendor: vendorIdx !== -1 ? (cols[vendorIdx] || '') : '',
              serverPackage: packIdx !== -1 ? (cols[packIdx] || '') : '',
              serverModel: modelIdx !== -1 ? (cols[modelIdx] || '') : '',
              isGPU: gpuIdx !== -1 ? (cols[gpuIdx]?.toUpperCase().includes('GPU')) : false,
              dataSource: sourceIdx !== -1 ? (cols[sourceIdx] as any || '人工维护') : '人工维护',
              inventory: []
            });
          }

          const record = importedDataMap.get(currentSN);
          
          // 如果提供了基本信息且当前记录还是空的，则补充基本信息 (针对 SN 相同但后续行才填基本信息的情况)
          if (rowSN) {
            if (vendorIdx !== -1 && cols[vendorIdx]) record.vendor = cols[vendorIdx];
            if (packIdx !== -1 && cols[packIdx]) record.serverPackage = cols[packIdx];
            if (modelIdx !== -1 && cols[modelIdx]) record.serverModel = cols[modelIdx];
            if (gpuIdx !== -1 && cols[gpuIdx]) record.isGPU = cols[gpuIdx].toUpperCase().includes('GPU');
          }

          record.inventory.push({
            spec: {
              type: slotType || '未知',
              size: slotSpec
            },
            total: slotTotal,
            used: []
          });
        }

        // 合并到当前数据
        const newData = [...data];
        let addedCount = 0;
        let updatedCount = 0;

        importedDataMap.forEach((impRecord, sn) => {
          const existingIdx = newData.findIndex(r => r.serverSN === sn);
          const currentTime = new Date().toLocaleString();

          if (existingIdx !== -1) {
            // 更新现有记录的槽位定义
            newData[existingIdx] = {
              ...newData[existingIdx],
              vendor: impRecord.vendor || newData[existingIdx].vendor,
              serverPackage: impRecord.serverPackage || newData[existingIdx].serverPackage,
              serverModel: impRecord.serverModel || newData[existingIdx].serverModel,
              isGPU: impRecord.isGPU !== undefined ? impRecord.isGPU : newData[existingIdx].isGPU,
              dataSource: impRecord.dataSource || newData[existingIdx].dataSource,
              inventory: impRecord.inventory, // 覆盖槽位定义
              updateTime: currentTime,
              logs: [
                {
                  id: Math.random().toString(36).substr(2, 9),
                  timestamp: currentTime,
                  type: 'manual',
                  content: '通过 CSV 导入更新了槽位资产配置',
                  operator: 'System'
                },
                ...newData[existingIdx].logs
              ]
            };
            updatedCount++;
          } else {
            // 新增记录
            newData.push({
              id: Math.max(0, ...newData.map(r => r.id)) + 1,
              ...impRecord,
              updateTime: currentTime,
              logs: [
                {
                  id: Math.random().toString(36).substr(2, 9),
                  timestamp: currentTime,
                  type: 'manual',
                  content: '通过 CSV 导入批量创建',
                  operator: 'System'
                }
              ]
            });
            addedCount++;
          }
        });

        setData(newData);
        alert(`导入完成！新增: ${addedCount} 条记录，更新: ${updatedCount} 条记录。`);
      } catch (err) {
        console.error('Import error:', err);
        alert('导入过程中发生错误，请检查文件格式是否正确。');
      }
      
      // 重置 input 以便下次选择同一文件
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const allColumns = [
    { key: 'id', label: '序号' },
    { key: 'serverSN', label: '服务器SN' },
    { key: 'isGPU', label: '是否GPU' },
    { key: 'vendor', label: '厂商' },
    { key: 'serverPackage', label: '套餐' },
    { key: 'serverModel', label: '机型' },
    { key: 'dataSource', label: '槽位数据来源' },
    { key: 'slotType', label: '槽位类型' },
    { key: 'slotSize', label: '规格' },
    { key: 'slotUsageRate', label: '占用率状态' },
    { key: 'slotTotal', label: '总槽位' },
    { key: 'slotUsed', label: '已用配件' },
    { key: 'slotUsedTotal', label: '总占用' },
    { key: 'slotRemaining', label: '剩余' },
    { key: 'actions', label: '操作' },
  ];

  const toggleColumn = (key: string) => {
    setVisibleColumns(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ServerComponentRecord | null>(null);
  const [activeLogRecord, setActiveLogRecord] = useState<ServerComponentRecord | null>(null);
  
  const [batchStep, setBatchStep] = useState<1 | 2 | 3>(1);
  const [batchUpdateType, setBatchUpdateType] = useState<'sn' | 'package' | 'model'>('sn');
  const [batchUpdateInput, setBatchUpdateInput] = useState('');
  
  // 组合规则状态
  const [packageRules, setPackageRules] = useState<{ model: string; packageName: string; vendor: string[] }[]>([{ model: '', packageName: '', vendor: [] }]);
  const [modelRules, setModelRules] = useState<{ model: string; vendor: string[] }[]>([{ model: '', vendor: [] }]);
  
  const copyPackageRule = (idx: number) => {
    const newRules = [...packageRules];
    newRules.splice(idx + 1, 0, { ...packageRules[idx], vendor: [...packageRules[idx].vendor] });
    setPackageRules(newRules);
  };

  const copyModelRule = (idx: number) => {
    const newRules = [...modelRules];
    newRules.splice(idx + 1, 0, { ...modelRules[idx], vendor: [...modelRules[idx].vendor] });
    setModelRules(newRules);
  };

  // 选中的目标 SN 列表
  const [targetSNs, setTargetSNs] = useState<string[]>([]);
  const [step2SelectedSNs, setStep2SelectedSNs] = useState<string[]>([]);
  
  const targetServersDetails = React.useMemo(() => {
    return data.filter(item => targetSNs.includes(item.serverSN));
  }, [data, targetSNs]);

  const [batchInventory, setBatchInventory] = useState<SlotGroupInventory[]>([]);

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 计算过滤后的数据
  const filteredData = data.filter(r => {
    const basicMatch = searchQuery === '' || 
      r.serverSN.toLowerCase().includes(searchQuery.toLowerCase()) || 
      r.serverModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.serverPackage.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!isFiltersApplied) return basicMatch;

    if (advSearchType === 'batch') {
      if (!advBatchSNs.trim()) return basicMatch;
      const targets = advBatchSNs.split(/[\n,，\s]+/).filter(Boolean).map(s => s.toLowerCase());
      if (targets.length === 0) return basicMatch;
      
      if (advBatchType === 'sn') {
        return targets.some(sn => r.serverSN.toLowerCase().includes(sn));
      } else if (advBatchType === 'package') {
        return targets.some(pkg => r.serverPackage.toLowerCase().includes(pkg));
      } else if (advBatchType === 'model') {
        return targets.some(m => r.serverModel.toLowerCase().includes(m));
      }
      return basicMatch;
    }

    const snMatch = !advFilters.serverSN || r.serverSN.toLowerCase().includes(advFilters.serverSN.toLowerCase());
    const modelMatch = advFilters.serverModel.length === 0 || advFilters.serverModel.includes(r.serverModel);
    const packageMatch = advFilters.serverPackage.length === 0 || advFilters.serverPackage.includes(r.serverPackage);
    const vendorMatch = advFilters.vendor.length === 0 || (r.vendor && advFilters.vendor.includes(r.vendor));
    const dataSourceMatch = advFilters.dataSource.length === 0 || (r.dataSource && advFilters.dataSource.includes(r.dataSource));
    
    const archMatch = advFilters.isGPU.length === 0 || (
      (advFilters.isGPU.includes('GPU') && r.isGPU) || 
      (advFilters.isGPU.includes('CPU') && !r.isGPU)
    );

    const slotTypeMatch = advFilters.slotType.length === 0 || r.inventory.some(inv => advFilters.slotType.includes(inv.spec.type));
    const slotSizeMatch = advFilters.slotSize.length === 0 || r.inventory.some(inv => inv.spec.size && advFilters.slotSize.includes(inv.spec.size));

    return snMatch && modelMatch && packageMatch && vendorMatch && dataSourceMatch && archMatch && slotTypeMatch && slotSizeMatch;
  });

  // 分页处理
  const sortedData = [...filteredData].sort((a, b) => b.id - a.id);
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, advFilters, advBatchSNs, isFiltersApplied, pageSize]);

  // 模拟系统自动抓取并更新已使用槽位
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => prev.map(item => {
        // 随机模拟某些槽位的占用发生变化
        if (Math.random() > 0.8 && item.inventory.length > 0) {
          const newInventory = [...item.inventory];
          const randomIndex = Math.floor(Math.random() * newInventory.length);
          const group = { ...newInventory[randomIndex] };
          
          if (group.total > 0) {
            const currentUsedCount = group.used.reduce((sum, u) => sum + u.count, 0);
            
            if (currentUsedCount < group.total && Math.random() > 0.5) {
              // 模拟增加
              const newUsed = [...group.used];
              if (newUsed.length > 0) {
                newUsed[0] = { ...newUsed[0], count: newUsed[0].count + 1 };
              } else {
                newUsed.push({ name: '新增配件', count: 1 });
              }
              group.used = newUsed;
            } else if (currentUsedCount > 0) {
              // 模拟减少
              const newUsed = [...group.used];
              if (newUsed.length > 0 && newUsed[0].count > 0) {
                 newUsed[0] = { ...newUsed[0], count: newUsed[0].count - 1 };
                 if (newUsed[0].count === 0) newUsed.shift();
              }
              group.used = newUsed;
            }

            const afterUsedCount = group.used.reduce((sum, u) => sum + u.count, 0);
            
            if (currentUsedCount !== afterUsedCount) {
              newInventory[randomIndex] = group;
              const log: LogEntry = {
                id: Date.now().toString(),
                timestamp: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
                type: 'auto',
                content: `实时用量同步: ${group.spec.type}(${group.spec.size || ''}) ${currentUsedCount} -> ${afterUsedCount}`,
                operator: 'System Monitor'
              };
              return { 
                ...item, 
                inventory: newInventory,
                logs: [log, ...item.logs].slice(0, 50) 
              };
            }
          }
        }
        return item;
      }));
    }, 8000);
    
    return () => clearInterval(interval);
  }, []);

  const toggleSelectAll = () => {
    if (selectedIds.length === data.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.map(d => d.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // 当第一步点击“下一步”时，根据条件自动带出 SN
  const generateTargetSNs = () => {
    let sns: string[] = [];
    
    if (batchUpdateType === 'sn') {
      const inputs = batchUpdateInput.split(/[\n,，\s]+/).filter(s => s.trim() !== '');
      sns = inputs;
    } else if (batchUpdateType === 'package') {
      // 按照套餐组合规则过滤: 机型 + 套餐名 + 厂商
      sns = data.filter(item => {
        return packageRules.some(rule => {
          const modelMatch = !rule.model || item.serverModel.toLowerCase().includes(rule.model.toLowerCase());
          const packageMatch = !rule.packageName || item.serverPackage.toLowerCase().includes(rule.packageName.toLowerCase());
          const vendorMatch = rule.vendor.length === 0 || rule.vendor.some(v => (item.vendor || '').toLowerCase().includes(v.toLowerCase()));
          const atLeastOne = rule.model || rule.packageName || rule.vendor.length > 0;
          return atLeastOne && modelMatch && packageMatch && vendorMatch;
        });
      }).map(i => i.serverSN);
    } else if (batchUpdateType === 'model') {
      // 按照机型组合规则过滤: 机型 + 厂商
      sns = data.filter(item => {
        return modelRules.some(rule => {
          const modelMatch = !rule.model || item.serverModel.toLowerCase().includes(rule.model.toLowerCase());
          const vendorMatch = rule.vendor.length === 0 || rule.vendor.some(v => (item.vendor || '').toLowerCase().includes(v.toLowerCase()));
          const atLeastOne = rule.model || rule.vendor.length > 0;
          return atLeastOne && modelMatch && vendorMatch;
        });
      }).map(i => i.serverSN);
    }
    
    setTargetSNs([...new Set(sns)]);
  };

  const downloadImportTemplate = () => {
    const headers = [
      "服务器SN (必填)", "厂商", "套餐", "机型", "是否GPU (GPU/CPU)", "数据来源", "槽位类型", "规格", "总槽位数"
    ];
    
    const sampleRows = [
      ["SN10001", "华为", "标准型", "2288H V5", "CPU", "人工维护", "硬盘", "3.5寸", "12"],
      ["", "", "", "", "", "", "内存", "DDR4", "24"],
      ["", "", "", "", "", "", "网卡", "SFP+", "4"],
      ["SN10002", "浪潮", "计算型", "NF5280M6", "GPU", "by机型", "硬盘", "2.5寸", "25"],
      ["SN10002", "", "", "", "", "", "内存", "DDR5", "32"]
    ];
    
    let content = "\uFEFF"; // Add BOM for Excel UTF-8 support
    content += headers.join(",") + "\n";
    sampleRows.forEach(row => {
      content += row.join(",") + "\n";
    });
    
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `服务器槽位批量导入模板.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportInventory = () => {
    // 定义表头
    const headers = [
      "序号", "服务器SN", "厂商", "套餐", "机型", "是否GPU", "数据来源",
      "槽位类型", "规格", "总槽位", "已用构成", "占用数", "剩余数", "更新时间"
    ];
    
    const rows: string[][] = [];
    
    sortedData.forEach((record, index) => {
      if (record.inventory.length === 0) {
        rows.push([
          (index + 1).toString(),
          record.serverSN,
          record.vendor || '-',
          record.serverPackage,
          record.serverModel,
          record.isGPU ? 'GPU' : 'CPU',
          record.dataSource || '人工维护',
          '-', '-', '-', '-', '-', '-',
          record.updateTime
        ]);
      } else {
        record.inventory.forEach((inv, invIdx) => {
          const usedCount = inv.used.reduce((sum, u) => sum + u.count, 0);
          const usedDetails = inv.used.map(u => `${u.name}(${u.count})`).join('; ');
          
          rows.push([
            invIdx === 0 ? (index + 1).toString() : '',
            invIdx === 0 ? record.serverSN : '',
            invIdx === 0 ? (record.vendor || '-') : '',
            invIdx === 0 ? record.serverPackage : '',
            invIdx === 0 ? record.serverModel : '',
            invIdx === 0 ? (record.isGPU ? 'GPU' : 'CPU') : '',
            invIdx === 0 ? (record.dataSource || '人工维护') : '',
            inv.spec.type,
            inv.spec.size || '-',
            inv.total.toString(),
            usedDetails || '无',
            usedCount.toString(),
            (inv.total - usedCount).toString(),
            invIdx === 0 ? record.updateTime : ''
          ]);
        });
      }
    });

    // 转换为 CSV 字符串
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // 处理 BOM 解决中文乱码
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Server_Inventory_Export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEditRecord = (record: ServerComponentRecord) => {
    setEditingRecord(JSON.parse(JSON.stringify(record))); // 深拷贝
    setIsEditModalOpen(true);
  };

  const handleUpdateRecord = () => {
    if (!editingRecord) return;
    
    const timestamp = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
    const newLog: any = {
      id: Date.now().toString(),
      timestamp,
      type: 'manual',
      content: '手动更新配件槽位参数',
      operator: 'Admin'
    };

    setData(prev => prev.map(item => 
      item.id === editingRecord.id 
        ? { ...editingRecord, updateTime: timestamp, logs: [newLog, ...item.logs] } 
        : item
    ));
    setIsEditModalOpen(false);
    setEditingRecord(null);
  };

  const updateEditSlotValue = (key: string, val: string) => {
    if (!editingRecord) return;
    const n = parseInt(val) || 0;
    setEditingRecord({
      ...editingRecord,
      slots: { ...editingRecord.slots, [key]: n }
    });
  };

  const removeSN = (sn: string) => {
    setTargetSNs(prev => prev.filter(s => s !== sn));
  };

  const getIconForType = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('sata') || t.includes('sas') || t.includes('硬盘') || t.includes('disk')) return Database;
    if (t.includes('内存') || t.includes('ram') || t.includes('memory') || t.includes('ddr')) return Layers;
    if (t.includes('cpu') || t.includes('processor')) return Cpu;
    if (t.includes('gpu') || t.includes('video') || t.includes('graphics') || t.includes('pcie')) return Activity;
    if (t.includes('nvme') || t.includes('u.2') || t.includes('m.2') || t.includes('zap')) return Zap;
    if (t.includes('网卡') || t.includes('nic') || t.includes('network') || t.includes('ocp')) return Network;
    return HardDrive;
  };

  const handleBatchUpdateSubmit = () => {
    const timestamp = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
    const newLog: any = {
      id: Date.now().toString(),
      timestamp,
      type: 'manual',
      content: '批量广播同步配件槽位架构',
      operator: 'Admin'
    };

    setData(prev => prev.map(item => {
      if (targetSNs.includes(item.serverSN)) {
        return {
          ...item,
          inventory: JSON.parse(JSON.stringify(batchInventory)),
          updateTime: timestamp,
          logs: [newLog, ...item.logs]
        };
      }
      return item;
    }));

    setIsBatchUpdateOpen(false);
    setBatchStep(1);
    alert(`成功对 ${targetSNs.length} 台服务器完成批量更新`);
  };

  const handleDictSubmit = () => {
    const nowStr = new Date().toLocaleString('zh-CN', { hour12: false });
    const log: LogEntry = {
      id: Date.now().toString(),
      timestamp: nowStr,
      type: 'manual',
      content: `${editingDictEntry ? '更新' : '新增'}了 ${dictForm.vendor} ${dictForm.model} (${dictForm.packageName}) 的标准槽位配置`,
      operator: 'Current User'
    };

    if (editingDictEntry) {
      setGpuDict(prev => prev.map(item => item.id === editingDictEntry.id ? { 
        ...dictForm, 
        id: item.id, 
        updatedAt: nowStr,
        logs: [log, ...(item.logs || [])]
      } as GpuDictionaryEntry : item));
       alert('配置字典项更新成功');
    } else {
      setGpuDict(prev => [...prev, { 
        ...dictForm, 
        id: Date.now().toString(), 
        updatedAt: nowStr,
        logs: [log]
      } as GpuDictionaryEntry]);
       alert('标准配置项已新增至字典');
    }
    setIsDictFormView(false);
  };

  const addDictSlot = () => {
    setDictForm(prev => ({ ...prev, slots: [...prev.slots, { type: 'SATA/SAS', size: '2.5寸 (SFF)', count: 0 }]}));
  };

  const removeDictSlot = (index: number) => {
    setDictForm(prev => ({ ...prev, slots: prev.slots.filter((_, i) => i !== index) }));
  };

  const updateDictSlot = (index: number, field: string, value: any) => {
    setDictForm(prev => ({
      ...prev,
      slots: prev.slots.map((s, i) => i === index ? { ...s, [field]: value } : s)
    }));
  };

  const addInventoryItem = (setter: React.Dispatch<React.SetStateAction<any[]>>) => {
    setter(prev => [...prev, { spec: { type: 'SATA/SAS', size: '2.5寸 (SFF)' }, total: 0, used: [] }]);
  };

  const removeComponentUsage = (groupIndex: number, componentIndex: number) => {
    if (!editingRecord) return;
    const nextInventory = [...editingRecord.inventory];
    nextInventory[groupIndex].used = nextInventory[groupIndex].used.filter((_, i) => i !== componentIndex);
    setEditingRecord({ ...editingRecord, inventory: nextInventory });
  };

  const addComponentUsage = (groupIndex: number) => {
    if (!editingRecord) return;
    const nextInventory = [...editingRecord.inventory];
    nextInventory[groupIndex].used.push({ name: '新增配件', count: 1 });
    setEditingRecord({ ...editingRecord, inventory: nextInventory });
  };

  const updateComponentUsage = (groupIndex: number, componentIndex: number, field: 'name' | 'count', value: any) => {
    if (!editingRecord) return;
    const nextInventory = [...editingRecord.inventory];
    nextInventory[groupIndex].used[componentIndex] = { 
      ...nextInventory[groupIndex].used[componentIndex], 
      [field]: field === 'count' ? parseInt(value) || 0 : value 
    };
    setEditingRecord({ ...editingRecord, inventory: nextInventory });
  };

  const removeInventoryItem = (setter: React.Dispatch<React.SetStateAction<any[]>>, index: number) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const updateInventoryItem = (setter: React.Dispatch<React.SetStateAction<any[]>>, index: number, field: string, value: any) => {
    setter(prev => {
      const next = [...prev];
      if (field === 'type' || field === 'size') {
        next[index].spec = { ...next[index].spec, [field]: value };
      } else {
        next[index] = { ...next[index], [field]: value };
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] text-slate-900 overflow-hidden font-sans">
      {/* 增强型页眉 */}
      <header className="px-6 py-4 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between z-30 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-100 shrink-0">
            <Server className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-800">服务器配件槽位资产管理</h1>
            <p className="text-[10px] text-slate-400 font-bold tracking-wider leading-none mt-0.5">INFRASTRUCTURE COMPONENT AUDIT</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 1. 高级查询 */}
          <Button 
            variant="outline" 
            className={`h-10 px-4 rounded-xl border-slate-200 hover:border-indigo-600 hover:text-indigo-600 font-bold gap-2 transition-all active:scale-95 shrink-0 bg-white ${isAdvancedSearchOpen || isFiltersApplied ? 'border-indigo-600 text-indigo-600 bg-indigo-50/10 shadow-inner' : ''}`}
            onClick={() => setIsAdvancedSearchOpen(!isAdvancedSearchOpen)}
          >
            <Filter className={`w-4 h-4 transition-transform duration-300 ${isAdvancedSearchOpen ? 'rotate-180' : ''}`} />
            高级查询
            {isFiltersApplied && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 ml-1 animate-pulse" />}
          </Button>

          {/* 2. 导出 */}
          <Button 
            variant="outline" 
            onClick={handleExportInventory}
            className="h-10 px-4 rounded-xl border-slate-200 hover:border-indigo-600 hover:text-indigo-600 font-bold gap-2 transition-all active:scale-95 shrink-0 bg-white"
          >
            <Download className="w-4 h-4" />
            导出
          </Button>

          {/* 3. 导入 */}
          <DropdownMenu>
            <DropdownMenuTrigger 
              className="h-10 px-4 rounded-xl border border-slate-200 hover:border-indigo-600 hover:text-indigo-600 font-bold gap-2 transition-all active:scale-95 shrink-0 bg-white flex items-center justify-center outline-none cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              导入
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl p-1 shadow-xl border-slate-100 z-[100]">
              <DropdownMenuItem 
                className="rounded-lg font-bold text-xs gap-2 py-3 cursor-pointer focus:bg-indigo-50 focus:text-indigo-600" 
                onClick={downloadImportTemplate}
              >
                <Download className="w-4 h-4" />
                下载导入模板
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="rounded-lg font-bold text-xs gap-2 py-3 cursor-pointer focus:bg-indigo-50 focus:text-indigo-600" 
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4" />
                上传数据文件
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 隐藏的文件输入框 */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImportCSV} 
            accept=".csv" 
            className="hidden" 
          />

          {/* 4. 批量更新 */}
          <Button 
            variant="outline" 
            className="h-10 px-4 rounded-xl border-slate-200 hover:border-indigo-600 hover:text-indigo-600 font-bold gap-2 transition-all active:scale-95 shrink-0 bg-white"
            onClick={() => {
              setBatchInventory([{ spec: { type: 'SATA/SAS', size: '3.5寸 (LFF)' }, total: 12, used: [] }]);
              setIsBatchUpdateOpen(true);
            }}
          >
            <Edit3 className="w-4 h-4" />
            批量更新
          </Button>

          {/* 5. 标准槽位管理 (字典管理) */}
          <Button 
            variant="default" 
            className="h-10 px-4 rounded-xl bg-slate-900 hover:bg-indigo-600 font-bold gap-2 shadow-lg shadow-indigo-100 transition-all active:scale-95 shrink-0"
            onClick={() => {
              setEditingDictEntry(null);
              setIsDictFormView(false);
              setIsGpuDictOpen(true);
            }}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            标准槽位管理
          </Button>

          <div className="w-[1px] h-6 bg-slate-200 mx-1" />

          {/* 6. 全局搜索 */}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <Input 
              placeholder="全局搜索 SN / 机型..." 
              className="h-10 w-64 pl-9 pr-4 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all text-xs font-bold"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1 ml-2 p-1 bg-slate-100 rounded-lg border border-slate-200 shadow-inner">
            <Button 
              variant="ghost" 
              size="icon" 
              className={`h-8 w-8 rounded-md transition-all ${isGlobalLogOpen ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-white'}`} 
              title="全局操作日志"
              onClick={() => setIsGlobalLogOpen(true)}
            >
              <History className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className={`h-8 w-8 rounded-md transition-all ${isColumnSettingsOpen ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-white'}`} 
              title="显示字段设置"
              onClick={() => setIsColumnSettingsOpen(true)}
            >
              <Settings2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-slate-500 hover:bg-white transition-all" title="刷新数据" onClick={() => window.location.reload()}>
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* 高级查询展开面板 (取代弹窗) */}
      <AnimatePresence>
        {isAdvancedSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-white border-b border-slate-200 shadow-inner z-20 relative"
          >
            <div className="max-w-[1600px] mx-auto px-8 py-8">
              <div className="flex items-start gap-12">
                {/* 模式选择侧栏 */}
                <div className="w-48 shrink-0 space-y-2 pt-1 border-r border-slate-100 pr-6">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1 leading-none">搜索模式选择</div>
                  <button 
                    onClick={() => setAdvSearchType('standard')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${advSearchType === 'standard' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 focus:outline-none'}`}
                  >
                    <Search className="w-4 h-4" /> 条件搜索
                  </button>
                  <button 
                    onClick={() => setAdvSearchType('batch')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${advSearchType === 'batch' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 focus:outline-none'}`}
                  >
                    <Layers className="w-4 h-4" /> 批量搜索
                  </button>
                </div>

                {/* 搜索内容 */}
                <div className="flex-1">
                  <AnimatePresence mode="wait">
                    {advSearchType === 'standard' ? (
                      <motion.div 
                        key="standard"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="grid grid-cols-4 gap-x-8 gap-y-5 w-full"
                      >
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">任务搜索 (SN)</label>
                          <Input 
                            placeholder="搜索服务器 SN..." 
                            value={advFilters.serverSN}
                            onChange={e => setAdvFilters(f => ({...f, serverSN: e.target.value}))}
                            className="h-9 rounded-xl bg-slate-50 border-2 border-slate-100 focus:bg-white focus:border-indigo-600 transition-all font-bold text-[11px]"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">套餐</label>
                          <SearchableMultiSelect 
                            options={packageOptions}
                            value={advFilters.serverPackage}
                            onValueChange={v => setAdvFilters(f => ({...f, serverPackage: v}))}
                            placeholder="不限套餐"
                            searchPlaceholder="搜索套餐..."
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">机型</label>
                          <SearchableMultiSelect 
                            options={modelOptions}
                            value={advFilters.serverModel}
                            onValueChange={v => setAdvFilters(f => ({...f, serverModel: v}))}
                            placeholder="不限机型"
                            searchPlaceholder="搜索机型..."
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">厂商</label>
                          <SearchableMultiSelect 
                            options={vendorOptions}
                            value={advFilters.vendor}
                            onValueChange={v => setAdvFilters(f => ({...f, vendor: v}))}
                            placeholder="不限厂商"
                            searchPlaceholder="搜索厂商..."
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">是否GPU</label>
                          <SearchableMultiSelect 
                            options={['GPU', 'CPU']}
                            value={advFilters.isGPU}
                            onValueChange={v => setAdvFilters(f => ({...f, isGPU: v}))}
                            placeholder="不限"
                            searchPlaceholder="筛选是否GPU..."
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">槽位数据来源</label>
                          <SearchableMultiSelect 
                            options={dataSourceOptions}
                            value={advFilters.dataSource}
                            onValueChange={v => setAdvFilters(f => ({...f, dataSource: v}))}
                            placeholder="不限"
                            searchPlaceholder="搜索数据来源..."
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">槽位包含</label>
                          <SearchableMultiSelect 
                            options={slotTypeOptions}
                            value={advFilters.slotType}
                            onValueChange={v => setAdvFilters(f => ({...f, slotType: v}))}
                            placeholder="全部槽位"
                            searchPlaceholder="搜索槽位类型..."
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">槽位尺寸规格</label>
                          <SearchableMultiSelect 
                            options={slotSizeOptions}
                            value={advFilters.slotSize}
                            onValueChange={v => setAdvFilters(f => ({...f, slotSize: v}))}
                            placeholder="不限"
                            searchPlaceholder="搜索尺寸/规格..."
                          />
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="batch"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex flex-col gap-5 w-full"
                      >
                        <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border-2 border-slate-100 w-fit">
                          {[
                            { id: 'sn', label: '按 SN 序列号' },
                            { id: 'package', label: '按 套餐' },
                            { id: 'model', label: '按 服务器机型' }
                          ].map(t => (
                            <button
                              key={t.id}
                              onClick={() => setAdvBatchType(t.id as any)}
                              className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${advBatchType === t.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>

                        <div className="flex-1 space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex justify-between items-center leading-none">
                            批量匹配清单
                            <span className="text-slate-300 normal-case font-medium text-[9px]">支持 Excel 粘贴, 换行/空格/逗号分隔</span>
                          </label>
                          <textarea 
                            value={advBatchSNs}
                            onChange={e => setAdvBatchSNs(e.target.value)}
                            placeholder={advBatchType === 'sn' ? "请输入 SN, 如: SN001 SN002..." : advBatchType === 'package' ? "请输入套餐名, 如: 计算型 通用型..." : "请输入机型关键字, 如: R740 H3C..."}
                            className="w-full h-[60px] px-5 py-3 rounded-xl bg-slate-50 border-2 border-slate-100 focus:bg-white focus:ring-[6px] focus:ring-indigo-600/5 focus:border-indigo-600 transition-all font-mono text-xs outline-none resize-none shadow-inner leading-relaxed"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 操作钮 */}
                <div className="flex flex-col gap-2 shrink-0 pt-6">
                  <Button 
                    onClick={() => setIsFiltersApplied(true)}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold h-11 px-8 rounded-xl shadow-lg transition-all active:scale-95"
                  >
                    立即检索
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      setAdvFilters({ 
                        serverSN: '', 
                        serverPackage: [], 
                        serverModel: [], 
                        vendor: [],
                        isGPU: [],
                        dataSource: [],
                        slotType: [],
                        slotSize: []
                      });
                      setAdvBatchSNs('');
                      setIsFiltersApplied(false);
                      setIsAdvancedSearchOpen(false);
                    }}
                    className="text-xs font-bold text-slate-400 hover:text-rose-500 hover:bg-rose-50/50 h-10 rounded-xl"
                  >
                    重置并关闭
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 取消之前的操作栏，因为已经合并到页眉 */}

      {/* 表格容器 */}
      <div className="flex-1 overflow-auto bg-[#F1F5F9]/50">
        <div className="p-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
            <div className="overflow-x-auto relative scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              <Table className="border-separate border-spacing-0">
                <TableHeader>
                  <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 text-nowrap">
                    <TableHead className="sticky left-0 z-40 bg-slate-50 border-b border-slate-200 w-12 px-6 py-5 after:content-[''] after:absolute after:right-0 after:top-0 after:bottom-0 after:w-[1px] after:bg-slate-200">
                      <Checkbox 
                        checked={selectedIds.length === data.length && data.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    {visibleColumns.includes('id') && <TableHead className="sticky left-12 z-40 bg-slate-50 border-b border-slate-200 w-16 font-bold text-slate-500 text-[10px] uppercase tracking-widest pl-4 after:content-[''] after:absolute after:right-0 after:top-0 after:bottom-0 after:w-[1px] after:bg-slate-200">序号</TableHead>}
                    {visibleColumns.includes('serverSN') && <TableHead className="sticky left-28 z-40 bg-slate-50 border-b border-slate-200 min-w-[180px] font-bold text-slate-500 text-[10px] uppercase tracking-widest pl-4 after:content-[''] after:absolute after:right-[-1px] after:top-0 after:bottom-0 after:w-4 after:bg-gradient-to-r after:from-slate-200/50 after:to-transparent">服务器SN</TableHead>}
                    {visibleColumns.includes('isGPU') && <TableHead className="text-center font-bold text-slate-500 text-[10px] uppercase tracking-widest border-b border-slate-200">是否GPU</TableHead>}
                    {visibleColumns.includes('vendor') && <TableHead className="min-w-[100px] font-bold text-slate-500 text-[10px] uppercase tracking-widest pl-6 border-b border-slate-200 text-center">厂商</TableHead>}
                    {visibleColumns.includes('serverPackage') && <TableHead className="min-w-[120px] font-bold text-slate-500 text-[10px] uppercase tracking-widest pl-6 border-b border-slate-200">所属套餐</TableHead>}
                    {visibleColumns.includes('serverModel') && <TableHead className="min-w-[150px] font-bold text-slate-500 text-[10px] uppercase tracking-widest pl-6 border-b border-slate-200">机型</TableHead>}
                    {visibleColumns.includes('dataSource') && <TableHead className="min-w-[120px] font-bold text-slate-500 text-[10px] uppercase tracking-widest pl-6 border-b border-slate-200">槽位数据来源</TableHead>}
                    {visibleColumns.includes('slotType') && <TableHead className="min-w-[120px] font-bold text-slate-500 text-[10px] uppercase tracking-widest text-center border-b border-slate-200">槽位类型</TableHead>}
                    {visibleColumns.includes('slotSize') && <TableHead className="min-w-[120px] font-bold text-slate-500 text-[10px] uppercase tracking-widest text-center border-b border-slate-200">盘体尺寸/规格</TableHead>}
                    {visibleColumns.includes('slotTotal') && <TableHead className="min-w-[100px] font-bold text-slate-500 text-[10px] uppercase tracking-widest text-center border-b border-slate-200">总槽位</TableHead>}
                    {visibleColumns.includes('slotUsageRate') && <TableHead className="min-w-[160px] font-bold text-slate-500 text-[10px] uppercase tracking-widest px-6 border-b border-slate-200">槽位占用情况</TableHead>}
                    {visibleColumns.includes('slotUsed') && <TableHead className="min-w-[250px] font-bold text-slate-500 text-[10px] uppercase tracking-widest pl-6 border-b border-slate-200">已用配件构成</TableHead>}
                    {visibleColumns.includes('slotRemaining') && <TableHead className="min-w-[100px] font-bold text-slate-500 text-[10px] uppercase tracking-widest text-center border-b border-slate-200 text-indigo-600">剩余槽位</TableHead>}
                    {visibleColumns.includes('slotUsedTotal') && <TableHead className="min-w-[100px] font-bold text-slate-500 text-[10px] uppercase tracking-widest text-center border-b border-slate-200">总占用</TableHead>}
                    {visibleColumns.includes('actions') && <TableHead className="sticky right-0 z-40 bg-slate-50 border-b border-slate-200 w-32 font-bold text-slate-500 text-[10px] uppercase tracking-widest text-right pr-10 before:content-[''] before:absolute before:left-[-17px] before:top-0 before:bottom-0 before:w-4 before:bg-gradient-to-l before:from-slate-200/50 before:to-transparent before:border-r before:border-slate-200">操作</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {paginatedData.flatMap((record, idx) => 
                      record.inventory.length === 0 ? [
                        <motion.tr
                          key={`${record.id}-empty`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="group border-b border-slate-100/80 last:border-0 hover:bg-indigo-50/50 transition-colors"
                        >
                          <TableCell className="sticky left-0 z-30 transition-colors bg-inherit px-6 py-5 after:content-[''] after:absolute after:right-0 after:top-0 after:bottom-0 after:w-[1px] after:bg-slate-100/50">
                            <Checkbox 
                              checked={selectedIds.includes(record.id)}
                              onCheckedChange={() => toggleSelect(record.id)}
                            />
                          </TableCell>
                          {visibleColumns.includes('id') && <TableCell className="sticky left-12 z-30 bg-inherit text-slate-400 font-mono text-[11px] font-bold pl-4">
                            {record.id.toString().padStart(2, '0')}
                          </TableCell>}
                          {visibleColumns.includes('serverSN') && <TableCell className="sticky left-28 z-30 bg-inherit border-r border-slate-100/50 pl-4">
                            <span className="font-mono text-xs font-bold text-slate-700">{record.serverSN}</span>
                          </TableCell>}
                          {visibleColumns.includes('isGPU') && (
                            <TableCell className="text-center">
                              {record.isGPU ? (
                                <Badge className="bg-amber-50 text-amber-600 border-none px-2 py-0.5 text-[9px] font-black gap-1 uppercase inline-flex items-center">
                                  <Zap className="w-2.5 h-2.5 fill-amber-600" /> GPU
                                </Badge>
                              ) : (
                                <Badge className="bg-indigo-50 text-indigo-600 border-none px-2 py-0.5 text-[9px] font-black gap-1 uppercase inline-flex items-center">
                                  <ModelIcon className="w-2.5 h-2.5" /> CPU
                                </Badge>
                              )}
                            </TableCell>
                          )}
                          {visibleColumns.includes('vendor') && (
                            <TableCell className="text-center">
                              <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-md uppercase border border-slate-200/50 tracking-wider">
                                {record.vendor || '-'}
                              </span>
                            </TableCell>
                          )}
                          {visibleColumns.includes('serverPackage') && <TableCell className="pl-6"><span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{record.serverPackage}</span></TableCell>}
                          {visibleColumns.includes('serverModel') && <TableCell className="pl-6"><span className="text-xs font-bold text-slate-600">{record.serverModel}</span></TableCell>}
                          {visibleColumns.includes('dataSource') && (
                            <TableCell className="pl-6">
                              <Badge variant="outline" className={`text-[10px] font-bold border-none ${
                                record.dataSource === '人工维护' ? 'bg-slate-100 text-slate-600' : 
                                record.dataSource === 'by sn' ? 'bg-indigo-50 text-indigo-600' :
                                record.dataSource === 'by套餐' ? 'bg-amber-50 text-amber-600' :
                                'bg-emerald-50 text-emerald-600'
                              }`}>
                                {record.dataSource || '人工维护'}
                              </Badge>
                            </TableCell>
                          )}
                          <TableCell colSpan={visibleColumns.filter(k => !['id', 'serverSN', 'isGPU', 'vendor', 'serverPackage', 'serverModel', 'dataSource', 'actions'].includes(k)).length} className="text-center text-slate-300 text-[10px] font-bold italic">暂无详细槽位信息</TableCell>
                          {visibleColumns.includes('actions') && <TableCell className="sticky right-0 z-30 bg-inherit text-right pr-8">
                            <div className="flex items-center justify-end gap-3">
                               <Button variant="ghost" size="sm" onClick={() => handleEditRecord(record)} className="h-8 px-2.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 font-bold gap-1.5"><Edit3 className="w-3.5 h-3.5" />编辑</Button>
                            </div>
                          </TableCell>}
                        </motion.tr>
                      ] :
                      record.inventory.map((inv, invIdx) => {
                        const usedTotal = inv.used.reduce((sum, u) => sum + u.count, 0);
                        const Icon = getIconForType(inv.spec.type);
                        return (
                          <motion.tr
                            key={`${record.id}-${invIdx}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`group border-b border-slate-100/80 last:border-0 hover:bg-indigo-50/50 transition-colors ${invIdx === 0 ? 'bg-white border-t-2 border-t-slate-100' : 'bg-slate-50/10'}`}
                          >
                            <TableCell className="sticky left-0 z-30 transition-colors bg-inherit px-6 py-5 after:content-[''] after:absolute after:right-0 after:top-0 after:bottom-0 after:w-[1px] after:bg-slate-100/50">
                              {invIdx === 0 && (
                                <Checkbox 
                                  checked={selectedIds.includes(record.id)}
                                  onCheckedChange={() => toggleSelect(record.id)}
                                />
                              )}
                            </TableCell>
                            {visibleColumns.includes('id') && <TableCell className="sticky left-12 z-30 bg-inherit text-slate-400 font-mono text-[11px] font-bold pl-4">
                              {invIdx === 0 ? record.id.toString().padStart(2, '0') : ''}
                            </TableCell>}
                            {visibleColumns.includes('serverSN') && <TableCell className="sticky left-28 z-30 bg-inherit border-r border-slate-100/50 pl-4">
                              {invIdx === 0 && <span className="font-mono text-xs font-bold text-slate-700">{record.serverSN}</span>}
                            </TableCell>}
                            {visibleColumns.includes('isGPU') && (
                              <TableCell className="text-center">
                                {invIdx === 0 && (record.isGPU ? (
                                  <Badge className="bg-amber-50 text-amber-600 border-none px-2 py-0.5 text-[9px] font-black gap-1 uppercase inline-flex items-center">
                                    <Zap className="w-2.5 h-2.5 fill-amber-600" /> GPU
                                  </Badge>
                                ) : (
                                  <Badge className="bg-indigo-50 text-indigo-600 border-none px-2 py-0.5 text-[9px] font-black gap-1 uppercase inline-flex items-center">
                                    <ModelIcon className="w-2.5 h-2.5" /> CPU
                                  </Badge>
                                ))}
                              </TableCell>
                            )}
                            {visibleColumns.includes('vendor') && (
                              <TableCell className="text-center">
                                {invIdx === 0 && (
                                  <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-md uppercase border border-slate-200/50 tracking-wider">
                                    {record.vendor || '-'}
                                  </span>
                                )}
                              </TableCell>
                            )}
                            {visibleColumns.includes('serverPackage') && <TableCell className="pl-6">
                              {invIdx === 0 && <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{record.serverPackage}</span>}
                            </TableCell>}
                            {visibleColumns.includes('serverModel') && <TableCell className="pl-6">
                              {invIdx === 0 && <span className="text-xs font-bold text-slate-600">{record.serverModel}</span>}
                            </TableCell>}
                            {visibleColumns.includes('dataSource') && (
                              <TableCell className="pl-6">
                                {invIdx === 0 && (
                                  <Badge variant="outline" className={`text-[10px] font-bold border-none ${
                                    record.dataSource === '人工维护' ? 'bg-slate-100 text-slate-600' : 
                                    record.dataSource === 'by sn' ? 'bg-indigo-50 text-indigo-600' :
                                    record.dataSource === 'by套餐' ? 'bg-amber-50 text-amber-600' :
                                    'bg-emerald-50 text-emerald-600'
                                  }`}>
                                    {record.dataSource || '人工维护'}
                                  </Badge>
                                )}
                              </TableCell>
                            )}
                            
                            {visibleColumns.includes('slotType') && <TableCell className="text-center">
                               { (invIdx === 0 || record.inventory[invIdx - 1].spec.type !== inv.spec.type) ? (
                                 <div className="flex items-center justify-center gap-2">
                                    <Icon className="w-3.5 h-3.5 text-indigo-500" />
                                    <span className="text-xs font-black text-slate-700">{inv.spec.type}</span>
                                 </div>
                               ) : (
                                 <div className="flex items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity">
                                    <div className="w-1 h-1 rounded-full bg-slate-400" />
                                 </div>
                               )}
                            </TableCell>}
                            {visibleColumns.includes('slotSize') && <TableCell className="text-center">
                               <Badge variant="secondary" className="text-[10px] bg-slate-100 hover:bg-slate-200 border-none text-slate-600 font-bold px-2 py-0.5 rounded-md shadow-sm">{inv.spec.size || '-'}</Badge>
                            </TableCell>}
                            {visibleColumns.includes('slotTotal') && <TableCell className="text-center">
                               <span className="text-sm font-bold text-slate-700">{inv.total}</span>
                            </TableCell>}
                            {visibleColumns.includes('slotUsageRate') && (
                              <TableCell className="px-6">
                                <UsageProgress used={usedTotal} total={inv.total} />
                              </TableCell>
                            )}
                            {visibleColumns.includes('slotUsed') && <TableCell className="pl-6">
                               <div className="flex flex-col gap-1 py-1">
                                  {inv.used.length > 0 ? inv.used.map((u, ui) => (
                                    <div key={ui} className="flex items-center gap-2">
                                       <button 
                                         onClick={() => {
                                           // 模拟跳转到服务器配置页
                                           console.log(`Navigating to config for component: ${u.name}`);
                                           alert(`即将跳转查看配件 [${u.name}] 的详细拓扑配置`);
                                         }}
                                         className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors text-left truncate max-w-[180px]"
                                       >
                                         {u.name}
                                       </button>
                                       <Badge className="bg-amber-50 text-amber-600 border-none h-4 px-1 text-[9px] font-black">×{u.count}</Badge>
                                    </div>
                                  )) : (
                                    <span className="text-[10px] text-slate-300 font-bold italic">未安装配件</span>
                                  )}
                               </div>
                            </TableCell>}
                            {visibleColumns.includes('slotRemaining') && <TableCell className="text-center">
                               <span className={`text-sm font-black ${(inv.total - usedTotal) <= 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                 {inv.total - usedTotal}
                               </span>
                            </TableCell>}

                            {visibleColumns.includes('actions') && <TableCell className="sticky right-0 z-30 bg-inherit text-right pr-8">
                               {invIdx === 0 && (
                                 <div className="flex items-center justify-end gap-3">
                                   <Button 
                                     variant="ghost" 
                                     size="sm" 
                                     className="h-8 px-2.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-all font-bold gap-1.5"
                                     onClick={() => handleEditRecord(record)}
                                   >
                                     <Edit3 className="w-3.5 h-3.5" />
                                     编辑
                                   </Button>
                                   <Button 
                                     variant="ghost" 
                                     size="sm" 
                                     className="h-8 px-2.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all font-bold gap-1.5"
                                     onClick={() => {
                                       setActiveLogRecord(record);
                                       setIsLogModalOpen(true);
                                     }}
                                   >
                                     <History className="w-3.5 h-3.5" />
                                   </Button>
                                 </div>
                               )}
                            </TableCell>}
                          </motion.tr>
                        );
                      })
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      {/* 批量更新 Dialog */}
      <Dialog open={isBatchUpdateOpen} onOpenChange={(val) => {
        setIsBatchUpdateOpen(val);
        if(!val) setBatchStep(1);
      }}>
        <DialogContent className="sm:max-w-[960px] rounded-[32px] p-0 overflow-hidden border-none shadow-[0_32px_120px_-20px_rgba(79,70,229,0.3)] bg-white">
          <header className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 px-7 py-4 text-white relative overflow-hidden">
            {/* 装饰性元素 */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 mb-0.5">
                  {batchUpdateType === 'sn' && batchStep === 3 && (
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 font-bold px-2 py-0 h-4 text-[9px] mb-1">自动跳过核对</Badge>
                  )}
                </div>
                <DialogHeader>
                  <DialogTitle className="text-lg font-black flex items-center gap-2 tracking-tight">
                    <Edit3 className="w-4 h-4 text-indigo-200" />
                    批量更新配件槽位
                  </DialogTitle>
                  <DialogDescription className="text-indigo-100/60 text-[11px] font-bold leading-tight">
                    {batchStep === 1 
                      ? '可选服务器SN、套餐、机型任一方式by sn维度对服务器总槽位进行批量更新' 
                      : batchStep === 2 
                      ? '检查待更新的服务器SN列表' 
                      : '参数广播，覆盖目标设备'
                    }
                  </DialogDescription>
                </DialogHeader>
              </div>
              
              <div className="p-2.5 bg-white/5 rounded-2xl border border-white/10 shadow-inner">
                <Zap className={`w-5 h-5 ${batchStep === 3 ? 'text-amber-300 fill-amber-300 animate-pulse' : 'text-white/20'}`} />
              </div>
            </div>
          </header>

          <div className="px-10 py-8 min-h-[400px]">
             <AnimatePresence mode="wait">
               {batchStep === 1 ? (
                 <motion.div 
                   key="step1" 
                   initial={{ opacity: 0, y: 10 }} 
                   animate={{ opacity: 1, y: 0 }} 
                   exit={{ opacity: 0, y: -10 }} 
                   className="space-y-8"
                 >
                    <div className="space-y-4">
                       <div className="flex items-center justify-between px-1">
                         <label className="text-xs font-black text-slate-400 uppercase tracking-widest">第一步：选择过滤基准</label>
                         <span className="text-[11px] font-bold text-indigo-500 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> 支持模糊匹配逻辑</span>
                       </div>
                       <div className="grid grid-cols-3 gap-5">
                         {[
                           {id:'sn', label:'按 SN 列表', icon:Search, color:'indigo', desc:'输入原始序列号清单'}, 
                           {id:'package', label:'按 套餐', icon:Package, color:'violet', desc:'同步特定等级套餐'}, 
                           {id:'model', label:'按 服务器机型', icon:ModelIcon, color:'blue', desc:'按硬件型号批量同步'}
                         ].map(opt => (
                           <button 
                             key={opt.id} 
                             onClick={() => setBatchUpdateType(opt.id as any)}
                             className={`group flex flex-col items-start p-5 rounded-[20px] border-2 transition-all gap-3 text-left relative overflow-hidden ${
                               batchUpdateType === opt.id 
                               ? 'border-indigo-600 bg-indigo-50/30' 
                               : 'border-slate-100 bg-slate-50/50 hover:border-slate-200 hover:bg-white'
                             }`}
                           >
                             <div className={`p-2.5 rounded-lg transition-all ${
                               batchUpdateType === opt.id 
                               ? 'bg-indigo-600 text-white shadow-lg' 
                               : 'bg-white text-slate-400 group-hover:text-slate-600 shadow-sm border border-slate-100'
                             }`}>
                               <opt.icon className="w-5 h-5" />
                             </div>
                             <div>
                               <span className={`text-sm font-black tracking-tight ${batchUpdateType === opt.id ? 'text-indigo-900' : 'text-slate-600'}`}>
                                 {opt.label}
                               </span>
                               <p className="text-[10px] font-bold text-slate-400 mt-0.5 line-clamp-1">{opt.desc}</p>
                             </div>
                             {batchUpdateType === opt.id && (
                               <motion.div layoutId="active-dot" className="absolute top-5 right-5 w-2 h-2 bg-indigo-600 rounded-full" />
                             )}
                           </button>
                         ))}
                       </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-dashed border-slate-200">
                       <div className="flex items-center justify-between px-1">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                            第二步：输入匹配条件
                          </label>
                       </div>
                       
                       {batchUpdateType === 'sn' ? (
                         <div className="space-y-2">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">序列号列表</label>
                           <textarea 
                             rows={4}
                             className="w-full rounded-[20px] bg-slate-50 border-2 border-slate-100 p-6 font-mono text-sm focus:bg-white focus:ring-[8px] focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all resize-none shadow-inner"
                             placeholder="支持 Excel/Word 列表直接粘贴，自动识别换行或逗号..."
                             value={batchUpdateInput}
                             onChange={(e) => setBatchUpdateInput(e.target.value)}
                           />
                         </div>
                       ) : batchUpdateType === 'package' ? (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">组合规则 (机型 + 套餐 + 厂商)</span>
                              <Button variant="outline" size="sm" onClick={() => setPackageRules([...packageRules, { model: '', packageName: '', vendor: [] }])} className="h-7 text-[10px] border-indigo-100 text-indigo-600 font-black px-3 rounded-full">
                                <Plus className="w-3 h-3 mr-1" /> 添加条件组
                              </Button>
                            </div>
                            <div className="max-h-[220px] overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                              {packageRules.map((rule, idx) => (
                               <div key={idx} className="flex gap-2 items-end bg-white p-4 rounded-2xl border border-slate-100 shadow-sm relative group">
                                  <div className="grid grid-cols-3 gap-3 flex-1">
                                    <div className="space-y-1">
                                      <label className="text-[9px] font-black text-slate-400 uppercase ml-1">机型</label>
                                      <SearchableSimpleSelect
                                        placeholder="选择机型"
                                        options={modelOptions}
                                        value={rule.model}
                                        onValueChange={(v) => {
                                          const newRules = [...packageRules];
                                          newRules[idx].model = v;
                                          setPackageRules(newRules);
                                        }}
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[9px] font-black text-slate-400 uppercase ml-1">套餐</label>
                                      <SearchableSimpleSelect
                                        placeholder="选择套餐"
                                        options={packageOptions}
                                        value={rule.packageName}
                                        onValueChange={(v) => {
                                          const newRules = [...packageRules];
                                          newRules[idx].packageName = v;
                                          setPackageRules(newRules);
                                        }}
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[9px] font-black text-slate-400 uppercase ml-1">厂商 (多选)</label>
                                      <SearchableMultiSelect
                                        placeholder="选择厂商"
                                        options={vendorOptions}
                                        value={rule.vendor}
                                        onValueChange={(v) => {
                                          const newRules = [...packageRules];
                                          newRules[idx].vendor = v;
                                          setPackageRules(newRules);
                                        }}
                                      />
                                    </div>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      onClick={() => copyPackageRule(idx)}
                                      className="h-9 w-9 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                      title="复制条件组"
                                    >
                                      <Copy className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      disabled={packageRules.length === 1}
                                      onClick={() => setPackageRules(packageRules.filter((_, i) => i !== idx))}
                                      className="h-9 w-9 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                      title="删除条件组"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                       ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">组合规则 (机型 + 厂商)</span>
                              <Button variant="outline" size="sm" onClick={() => setModelRules([...modelRules, { model: '', vendor: [] }])} className="h-7 text-[10px] border-indigo-100 text-indigo-600 font-black px-3 rounded-full">
                                <Plus className="w-3 h-3 mr-1" /> 添加条件组
                              </Button>
                            </div>
                            <div className="max-h-[220px] overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                              {modelRules.map((rule, idx) => (
                                <div key={idx} className="flex gap-2 items-end bg-white p-4 rounded-2xl border border-slate-100 shadow-sm relative group">
                                  <div className="grid grid-cols-2 gap-3 flex-1">
                                    <div className="space-y-1">
                                      <label className="text-[9px] font-black text-slate-400 uppercase ml-1">机型</label>
                                      <SearchableSimpleSelect
                                        placeholder="选择机型"
                                        options={modelOptions}
                                        value={rule.model}
                                        onValueChange={(v) => {
                                          const newRules = [...modelRules];
                                          newRules[idx].model = v;
                                          setModelRules(newRules);
                                        }}
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[9px] font-black text-slate-400 uppercase ml-1">厂商 (多选)</label>
                                      <SearchableMultiSelect
                                        placeholder="选择厂商"
                                        options={vendorOptions}
                                        value={rule.vendor}
                                        onValueChange={(v) => {
                                          const newRules = [...modelRules];
                                          newRules[idx].vendor = v;
                                          setModelRules(newRules);
                                        }}
                                      />
                                    </div>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      onClick={() => copyModelRule(idx)}
                                      className="h-9 w-9 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                      title="复制条件组"
                                    >
                                      <Copy className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      disabled={modelRules.length === 1}
                                      onClick={() => setModelRules(modelRules.filter((_, i) => i !== idx))}
                                      className="h-9 w-9 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                      title="删除条件组"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                       )}
                    </div>
                 </motion.div>
               ) : batchStep === 2 ? (
                 <motion.div 
                   key="step2" 
                   initial={{ opacity: 0, scale: 0.98 }} 
                   animate={{ opacity: 1, scale: 1 }} 
                   exit={{ opacity: 0, scale: 1.02 }} 
                   className="space-y-8"
                 >
                    <div className="flex items-center justify-between px-2">
                       <div className="flex flex-col">
                          <h3 className="text-xl font-black text-slate-800 tracking-tight">目标资产核对</h3>
                          <p className="text-sm font-medium text-slate-400">已检索到 {targetSNs.length} 台资产，可勾选后批量剔除</p>
                       </div>
                       <div className="flex items-center gap-3">
                           {step2SelectedSNs.length > 0 && (
                             <Button 
                               variant="ghost" 
                               size="sm" 
                               onClick={() => {
                                 setTargetSNs(prev => prev.filter(sn => !step2SelectedSNs.includes(sn)));
                                 setStep2SelectedSNs([]);
                               }}
                               className="h-10 rounded-xl px-4 text-rose-500 hover:bg-rose-50 font-bold gap-2 transition-all"
                             >
                               <Trash2 className="w-4 h-4" /> 批量剔除 ({step2SelectedSNs.length})
                             </Button>
                           )}
                           <Button variant="outline" size="sm" onClick={generateTargetSNs} className="h-10 rounded-xl px-4 border-slate-200 font-bold text-indigo-600 gap-2 hover:bg-indigo-50 hover:border-indigo-100 transition-all">
                             <RefreshCw className="w-4 h-4" /> 重新检索数据
                           </Button>
                        </div>
                     </div>
                     
                     <div className="border border-slate-100 rounded-[24px] overflow-hidden bg-white shadow-sm max-h-[400px] overflow-y-auto custom-scrollbar">
                        <Table>
                          <TableHeader className="bg-slate-50/50">
                            <TableRow className="hover:bg-transparent border-slate-100">
                              <TableHead className="w-12 text-center">
                                <Checkbox 
                                  checked={step2SelectedSNs.length === targetSNs.length && targetSNs.length > 0}
                                  onCheckedChange={(checked) => {
                                    if (checked) setStep2SelectedSNs([...targetSNs]);
                                    else setStep2SelectedSNs([]);
                                  }}
                                />
                              </TableHead>
                              <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4">服务器SN</TableHead>
                              <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">机型</TableHead>
                              {batchUpdateType === 'package' && (
                                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">套餐</TableHead>
                              )}
                              <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right pr-6">厂商</TableHead>
                              <TableHead className="w-16 text-right pr-6"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {targetServersDetails.length === 0 ? (
                               <TableRow>
                                 <TableCell colSpan={batchUpdateType === 'package' ? 6 : 5} className="h-64 text-center">
                                   <div className="flex flex-col items-center gap-3">
                                     <div className="p-4 bg-slate-50 rounded-2xl"><Search className="w-8 h-8 text-slate-200" /></div>
                                     <p className="text-sm font-bold text-slate-400">暂无匹配资产，请返回第一步重新设置条件</p>
                                   </div>
                                 </TableCell>
                               </TableRow>
                            ) : (
                              targetServersDetails.map((item) => (
                                <TableRow key={item.serverSN} className="group border-slate-50 hover:bg-slate-50/50 transition-colors">
                                  <TableCell className="text-center">
                                    <Checkbox 
                                      checked={step2SelectedSNs.includes(item.serverSN)}
                                      onCheckedChange={(checked) => {
                                        if (checked) setStep2SelectedSNs(prev => [...prev, item.serverSN]);
                                        else setStep2SelectedSNs(prev => prev.filter(s => s !== item.serverSN));
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell className="pl-4">
                                    <span className="font-mono text-xs font-black text-slate-700">{item.serverSN}</span>
                                  </TableCell>
                                  <TableCell>
                                    <span className="text-[11px] font-bold text-slate-500">{item.serverModel}</span>
                                  </TableCell>
                                  {batchUpdateType === 'package' && (
                                    <TableCell className="text-center">
                                      <Badge variant="outline" className="text-[10px] bg-indigo-50/30 text-indigo-500 border-indigo-100 font-black h-5">{item.serverPackage}</Badge>
                                    </TableCell>
                                  )}
                                  <TableCell className="text-right pr-6">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.vendor}</span>
                                  </TableCell>
                                  <TableCell className="text-right pr-6">
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      onClick={() => {
                                        setTargetSNs(prev => prev.filter(s => s !== item.serverSN));
                                        setStep2SelectedSNs(prev => prev.filter(s => s !== item.serverSN));
                                      }}
                                      className="w-8 h-8 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                     </div>
 
                     <div className="flex items-center justify-center gap-3 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        <p className="text-[11px] font-bold text-slate-500 italic">核对清单无误后，点击右下方“下一步”按钮进入最终参数广播配置页</p>
                     </div>
                 </motion.div>
               ) : (
                <motion.div 
                  key="step3" 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  className="space-y-8"
                >
                   <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 relative overflow-hidden group">
                       <div className="p-3 bg-emerald-500 rounded-xl shadow-lg shadow-emerald-200"><CheckSquare className="w-5 h-5 text-white" /></div>
                       <div>
                          <p className="text-lg font-black text-emerald-900 tracking-tight">即将同步至 {targetSNs.length} 台基础设施</p>
                       </div>
                   </div>
                   
                   <div className="space-y-4">
                     <div className="flex items-center justify-between">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">定义目标槽位组架构</label>
                        <Button variant="outline" size="sm" onClick={() => addInventoryItem(setBatchInventory)} className="h-8 border-indigo-100 text-indigo-600 font-bold"><Plus className="w-4 h-4" /> 新增组</Button>
                     </div>
                     <div className="max-h-[300px] overflow-y-auto space-y-3">
                       {batchInventory.map((inv, i) => (
                          <div key={i} className="flex gap-3 items-end bg-slate-50 p-3 rounded-xl border border-slate-100">
                             <div className="flex-1 space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase">类型</label>
                                 <SearchableSlotTypeSelect 
                                   value={inv.spec.type} 
                                   onValueChange={v => updateInventoryItem(setBatchInventory, i, 'type', v)} 
                                 />
                             </div>
                             <div className="flex-1 space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase">尺寸</label>
                                {SLOT_SIZE_PRESETS[inv.spec.type] ? (
                                   <Select value={inv.spec.size} onValueChange={v => updateInventoryItem(setBatchInventory, i, 'size', v)}>
                                      <SelectTrigger className="h-8 text-[11px] font-bold ring-0 focus:ring-0 border-indigo-100 bg-white">
                                         <SelectValue placeholder="规格" />
                                      </SelectTrigger>
                                      <SelectContent>
                                         {SLOT_SIZE_PRESETS[inv.spec.type].map(s => <SelectItem key={s} value={s} className="text-[11px] font-bold">{s}</SelectItem>)}
                                      </SelectContent>
                                   </Select>
                                ) : (
                                   <Input value={inv.spec.size} onChange={e => updateInventoryItem(setBatchInventory, i, 'size', e.target.value)} className="h-8 text-[11px] font-bold border-indigo-100 bg-white" />
                                )}
                             </div>
                             <div className="w-16 space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase">总计</label>
                                <Input type="number" value={inv.total} onChange={e => updateInventoryItem(setBatchInventory, i, 'total', parseInt(e.target.value)||0)} className="h-8 text-[11px]" />
                             </div>
                             <Button variant="ghost" size="icon" onClick={() => removeInventoryItem(setBatchInventory, i)} className="text-rose-400 h-8 w-8"><Trash2 className="w-3.5 h-3.5" /></Button>
                          </div>
                       ))}
                     </div>
                   </div>

                 </motion.div>
               )}
             </AnimatePresence>
          </div>

          <DialogFooter className="px-12 py-8 bg-slate-50 border-t border-slate-100 flex sm:justify-end items-center gap-4">
             <Button 
               variant="ghost" 
               className="font-black text-slate-400 hover:text-indigo-600 tracking-widest text-xs h-12 px-6 rounded-2xl transition-all" 
               onClick={() => {
                 if (batchStep === 3 && batchUpdateType === 'sn') {
                   setBatchStep(1);
                 } else if (batchStep > 1) {
                   setBatchStep(prev => (prev + 1) as any);
                 } else {
                   setIsBatchUpdateOpen(false);
                 }
               }}
             >
               {batchStep === 1 ? '取消操作' : '返回上一步'}
             </Button>

             {batchStep < 3 ? (
               <Button 
                disabled={batchUpdateType === 'sn' ? !batchUpdateInput : batchUpdateType === 'package' ? packageRules.every(r => !r.model && !r.packageName && r.vendor.length === 0) : modelRules.every(r => !r.model && r.vendor.length === 0)}
                className="bg-indigo-600 hover:bg-slate-900 h-14 px-10 rounded-[20px] font-black shadow-2xl shadow-indigo-200 transition-all group active:scale-95"
                onClick={() => {
                  if (batchStep === 1) {
                    generateTargetSNs();
                    setBatchStep(2);
                  } else {
                    setBatchStep(prev => (prev + 1) as any);
                  }
                }}
              >
                保存并进入下一步
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
              </Button>
             ) : (
               <Button 
                className="bg-indigo-600 hover:bg-slate-900 h-14 px-12 rounded-[20px] font-black shadow-2xl shadow-indigo-200 transition-all active:scale-95" 
                onClick={handleBatchUpdateSubmit}
               >
                 确认广播同步至 {targetSNs.length} 台设备
               </Button>
             )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 标准槽位字典管理 (标准配置字典) Dialog */}
      <Dialog open={isGpuDictOpen} onOpenChange={(val) => {
        setIsGpuDictOpen(val);
        if(!val) {
          setIsDictFormView(false);
          setGpuDictSearch({ packages: [], models: [], vendors: [], slotTypes: [] });
          setIsDictAdvancedSearchOpen(false);
        }
      }}>
        <DialogContent className="sm:max-w-[1200px] rounded-[32px] p-0 overflow-hidden border-none shadow-2xl bg-white focus:outline-none">
          <header className={`p-6 text-white relative transition-colors duration-500 ${isDictFormView ? 'bg-indigo-600' : 'bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-900 group'}`}>
             <div className="relative z-10 flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                   <DialogTitle className="text-xl font-black tracking-tight">标准槽位字典管理</DialogTitle>
                </div>
                {!isDictFormView && (
                   <div className="flex items-center gap-4">
                     <div className="text-right hidden md:block">
                       <p className="text-indigo-100/60 text-xs font-bold">新资产入库将依据此处定义的标准架构自动初始化槽位详情</p>
                     </div>
                   </div>
                )}
             </div>
          </header>

          <div className="p-8">
            <AnimatePresence mode="wait">
              {!isDictFormView ? (
                <motion.div 
                  key="list" 
                  initial={{ opacity: 0, scale: 0.98 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="space-y-6"
                >
                  {/* Toolbar & Advanced Search */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <Input 
                               placeholder="搜索套餐/机型/厂商..." 
                               value={gpuDictKeyword}
                               onChange={e => {
                                 setGpuDictKeyword(e.target.value);
                                 setDictPage(1);
                               }}
                               className="h-10 w-64 pl-10 rounded-xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-100 font-bold transition-all"
                            />
                         </div>
                         <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setIsDictAdvancedSearchOpen(!isDictAdvancedSearchOpen)}
                            className={`h-10 px-4 rounded-xl font-bold gap-2 transition-all ${isDictAdvancedSearchOpen ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'border-slate-100 hover:bg-slate-50'}`}
                         >
                            <Filter className="w-4 h-4" /> 
                            高级查询
                         </Button>

                         {/* Import/Export buttons */}
                         <div className="flex items-center gap-2 border-l border-slate-100 pl-3">
                           <DropdownMenu>
                             <DropdownMenuTrigger className="h-10 px-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold gap-2 border-none transition-all active:scale-95 flex items-center justify-center outline-none cursor-pointer">
                               <Upload className="w-4 h-4" />
                               导入
                             </DropdownMenuTrigger>
                             <DropdownMenuContent className="w-48 p-2 rounded-2xl border-none shadow-2xl bg-white/95 backdrop-blur-xl">
                                <DropdownMenuItem 
                                  onClick={() => {
                                    const header = "厂商,机型,套餐,槽位配置(格式: 类型:规格:数量|类型:规格:数量)\n";
                                    const example = "Dell,R750,Basic,\"GPU:A100 80GB:8|内存:64GB DDR4:32\"\n";
                                    const blob = new Blob(["\ufeff" + header + example], { type: 'text/csv;charset=utf-8;' });
                                    const link = document.createElement("a");
                                    link.href = URL.createObjectURL(blob);
                                    link.download = "GPU_Dictionary_Template.csv";
                                    link.click();
                                  }}
                                  className="rounded-lg font-bold gap-2 cursor-pointer"
                                >
                                  <FileText className="w-4 h-4 text-amber-500" />
                                  下载模版
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    const input = document.createElement('input');
                                    input.type = 'file';
                                    input.accept = '.csv';
                                    input.onchange = (e) => {
                                      const file = (e.target as HTMLInputElement).files?.[0];
                                      if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (event) => {
                                          const text = event.target?.result as string;
                                          const rows = text.split('\n').filter(r => r.trim()).slice(1); // skip header
                                          const newEntries = rows.map(row => {
                                            const [vendor, model, packageName, slotsStrRaw] = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
                                            if (!vendor || !model) return null;
                                            const slotsStr = slotsStrRaw?.replace(/"/g, '') || '';
                                            const slots = slotsStr.split('|').map(s => {
                                              const parts = s.split(':');
                                              if (parts.length < 3) return { type: 'GPU', size: 'A100 80GB', count: 0 };
                                              const [type, size, count] = parts;
                                              return { type, size, count: parseInt(count) || 0 };
                                            });
                                            return {
                                              id: Math.random().toString(36).substr(2, 9),
                                              vendor,
                                              model,
                                              packageName,
                                              slots,
                                              updatedAt: new Date().toLocaleString()
                                            } as GpuDictionaryEntry;
                                          }).filter(item => item !== null) as GpuDictionaryEntry[];
                                          if (newEntries.length > 0) {
                                            setGpuDict(prev => [...prev, ...newEntries]);
                                            alert(`成功导入 ${newEntries.length} 条配置`);
                                          } else {
                                            alert("未找到有效数据，请检查文件格式。");
                                          }
                                        };
                                        reader.readAsText(file);
                                      }
                                    };
                                    input.click();
                                  }}
                                  className="rounded-lg font-bold gap-2 cursor-pointer"
                                >
                                  <Plus className="w-4 h-4 text-indigo-500" />
                                  导入文件
                                </DropdownMenuItem>
                             </DropdownMenuContent>
                           </DropdownMenu>

                           <Button 
                             onClick={() => {
                               // 定义表头
                               const header = "厂商,机型,套餐,槽位类型,标准规格,标配数量\n";
                               
                               // 展平数据，每个槽位一条记录
                               const rows: string[] = [];
                               gpuDict.forEach(item => {
                                 item.slots.forEach(slot => {
                                   rows.push([
                                     item.vendor,
                                     item.model,
                                     item.packageName,
                                     slot.type,
                                     slot.size,
                                     slot.count.toString()
                                   ].map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(','));
                                 });
                               });

                               const csvContent = header + rows.join('\n');
                               const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
                               const link = document.createElement("a");
                               link.href = URL.createObjectURL(blob);
                               link.download = `GPU_Standard_Config_Export_${new Date().toISOString().slice(0,10)}.csv`;
                               link.click();
                             }}
                             className="h-10 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-black gap-2 border-none transition-all active:scale-95"
                           >
                             <Download className="w-4 h-4" />
                             导出
                           </Button>
                         </div>

                         {(gpuDictSearch?.vendors?.length > 0 || gpuDictSearch?.models?.length > 0 || gpuDictSearch?.packages?.length > 0 || gpuDictSearch?.slotTypes?.length > 0) && (
                           <Button 
                             variant="ghost" 
                             size="sm" 
                             onClick={() => {
                               setGpuDictSearch({ packages: [], models: [], vendors: [], slotTypes: [] });
                               setDictPage(1);
                             }} 
                             className="h-8 px-2 text-rose-500 font-bold text-[10px] uppercase"
                           >
                             清空筛选
                           </Button>
                         )}
                      </div>
                      <Button 
                        onClick={() => {
                          setEditingDictEntry(null);
                          setDictForm({ packageName: '', model: '', vendor: '', slots: [{ type: 'GPU', size: 'A100 80GB', count: 8 }] });
                          setIsDictFormView(true);
                        }}
                        className="bg-indigo-600 hover:bg-slate-900 shadow-lg shadow-indigo-100 font-black rounded-xl h-10 px-6 gap-2 transition-all active:scale-95"
                      >
                        <Plus className="w-4 h-4" /> 新增标配
                      </Button>
                    </div>

                    <AnimatePresence>
                      {isDictAdvancedSearchOpen && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }} 
                          animate={{ height: 'auto', opacity: 1 }} 
                          exit={{ height: 0, opacity: 0 }} 
                          className="overflow-hidden"
                        >
                          <div className="grid grid-cols-4 gap-4 p-5 bg-slate-50/50 border border-slate-100 rounded-2xl">
                             <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">机型 (多选)</label>
                                <MultiSelect 
                                  placeholder="所有机型"
                                  options={MASTER_MODELS}
                                  selected={gpuDictSearch.models}
                                  onChange={v => { setGpuDictSearch(p => ({ ...p, models: v })); setDictPage(1); }}
                                />
                             </div>
                             <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">套餐 (多选)</label>
                                <MultiSelect 
                                  placeholder="所有套餐"
                                  options={MASTER_PACKAGES}
                                  selected={gpuDictSearch.packages}
                                  onChange={v => { setGpuDictSearch(p => ({ ...p, packages: v })); setDictPage(1); }}
                                />
                             </div>
                             <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">厂商 (多选)</label>
                                <MultiSelect 
                                  placeholder="所有厂商"
                                  options={MASTER_VENDORS}
                                  selected={gpuDictSearch.vendors}
                                  onChange={v => { setGpuDictSearch(p => ({ ...p, vendors: v })); setDictPage(1); }}
                                />
                             </div>
                             <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">槽位类型 (多选)</label>
                                <MultiSelect 
                                  placeholder="所有类型"
                                  options={['GPU', '内存', 'NVMe', 'SATA/SAS', 'CPU', '网卡', '阵列卡', '电源']}
                                  selected={gpuDictSearch.slotTypes}
                                  onChange={v => { setGpuDictSearch(p => ({ ...p, slotTypes: v })); setDictPage(1); }}
                                />
                             </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="border border-slate-100 rounded-[24px] overflow-hidden bg-slate-50/30">
                    <Table>
                      <TableHeader className="bg-white border-b border-slate-100">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-16 text-[10px] font-black text-slate-500 uppercase py-4 pl-6">#</TableHead>
                          <TableHead className="text-[10px] font-black text-slate-500 uppercase">机型</TableHead>
                          <TableHead className="text-[10px] font-black text-slate-500 uppercase">套餐</TableHead>
                          <TableHead className="text-[10px] font-black text-slate-500 uppercase">厂商</TableHead>
                          <TableHead className="text-[10px] font-black text-slate-500 uppercase">标准配置详情</TableHead>
                          <TableHead className="text-[10px] font-black text-slate-500 uppercase">最后更新</TableHead>
                          <TableHead className="w-32 text-right pr-6 px-4"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(() => {
                           const filtered = gpuDict.filter(item => {
                              const query = gpuDictKeyword.toLowerCase();
                              const matchesKeyword = !query || 
                                                     item.packageName.toLowerCase().includes(query) || 
                                                     item.model.toLowerCase().includes(query) || 
                                                     item.vendor.toLowerCase().includes(query);
                              
                              const matchesVendor = (gpuDictSearch?.vendors?.length ?? 0) === 0 || gpuDictSearch.vendors.includes(item.vendor);
                              const matchesModel = (gpuDictSearch?.models?.length ?? 0) === 0 || gpuDictSearch.models.includes(item.model);
                              const matchesPackage = (gpuDictSearch?.packages?.length ?? 0) === 0 || gpuDictSearch.packages.includes(item.packageName);
                              const matchesSlotTypes = (gpuDictSearch?.slotTypes?.length ?? 0) === 0 || item.slots.some(s => gpuDictSearch.slotTypes.includes(s.type));
                              
                              return matchesKeyword && matchesVendor && matchesModel && matchesPackage && matchesSlotTypes;
                           });

                           const totalItems = filtered.length;
                           const totalPages = Math.ceil(totalItems / dictPageSize);
                           const displayed = filtered.slice((dictPage - 1) * dictPageSize, dictPage * dictPageSize);

                           if (totalItems === 0) {
                              return (
                                <TableRow>
                                  <TableCell colSpan={7} className="py-20 text-center">
                                    <div className="flex flex-col items-center gap-3 opacity-20">
                                      <Boxes className="w-12 h-12" />
                                      <p className="text-sm font-black uppercase tracking-[0.2em]">未找到符合条件的标准配置</p>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                           }

                           return (
                             <>
                               {displayed.map((item, index) => (
                                 <TableRow key={item.id} className="group hover:bg-white border-slate-100 transition-colors">
                                   <TableCell className="pl-6 py-5">
                                      <span className="text-[10px] font-black text-slate-400">{(dictPage - 1) * dictPageSize + index + 1}</span>
                                   </TableCell>
                                   <TableCell>
                                      <span className="text-sm font-black text-slate-800 tracking-tight">{item.model}</span>
                                   </TableCell>
                                   <TableCell>
                                      <span className="text-xs font-bold text-slate-600">{item.packageName}</span>
                                   </TableCell>
                                   <TableCell>
                                      <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 font-bold px-2 py-0.5">{item.vendor}</Badge>
                                   </TableCell>
                                   <TableCell>
                                      <div className="grid grid-cols-1 gap-1.5 py-2 min-w-[300px]">
                                         {item.slots.map((s, idx) => (
                                           <div key={idx} className="grid grid-cols-[80px_1fr_60px] items-center gap-3 bg-white/50 group-hover:bg-indigo-50/30 border border-slate-100/50 rounded-lg px-2.5 py-1.5 shadow-sm transition-colors">
                                             <span className="text-[10px] font-black text-indigo-600 uppercase tracking-tight">{s.type}</span>
                                             <span className="text-[10px] font-bold text-slate-500 truncate">{s.size}</span>
                                             <div className="flex items-center gap-1.5 justify-end">
                                                <span className="text-[9px] font-black text-slate-300">QTY:</span>
                                                <span className="text-[11px] font-black text-indigo-900">{s.count}</span>
                                             </div>
                                           </div>
                                         ))}
                                      </div>
                                   </TableCell>
                                   <TableCell>
                                      <div className="flex flex-col gap-0.5">
                                        <span className="text-[10px] font-bold text-slate-500">{item.updatedAt?.split(' ')[0] || '2024-01-01'}</span>
                                        <span className="text-[9px] font-black text-slate-300 uppercase letter-spacing-widest">{item.updatedAt?.split(' ')[1] || '00:00:00'}</span>
                                      </div>
                                   </TableCell>
                                   <TableCell className="text-right pr-6">
                                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                         <Button 
                                           variant="ghost" 
                                           size="icon" 
                                           onClick={() => {
                                             setEditingDictEntry(item);
                                             setDictForm({ 
                                               packageName: item.packageName, 
                                               model: item.model, 
                                               vendor: item.vendor, 
                                               slots: JSON.parse(JSON.stringify(item.slots))
                                             });
                                             setIsDictFormView(true);
                                           }}
                                           className="h-9 w-9 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                                         >
                                           <Edit3 className="w-4 h-4" />
                                         </Button>
                                         <Button 
                                           variant="ghost" 
                                           size="icon" 
                                           onClick={() => {
                                             setActiveDictLogEntry(item);
                                             setIsDictLogOpen(true);
                                           }}
                                           className="h-9 w-9 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                                         >
                                           <History className="w-4 h-4" />
                                         </Button>
                                         <Button 
                                           variant="ghost" 
                                           size="icon" 
                                           onClick={() => {
                                             if(window.confirm('确定要删除该标准字典配置吗？')) {
                                               setGpuDict(prev => prev.filter(d => d.id !== item.id));
                                             }
                                           }}
                                           className="h-9 w-9 rounded-xl text-slate-200 hover:text-rose-500 hover:bg-rose-50 transition-all"
                                         >
                                           <Trash2 className="w-4 h-4" />
                                         </Button>
                                      </div>
                                   </TableCell>
                                 </TableRow>
                               ))}
                               {totalItems > dictPageSize && (
                                 <TableRow className="hover:bg-transparent">
                                    <TableCell colSpan={7} className="py-4 px-6 border-t border-slate-100">
                                       <div className="flex items-center justify-between">
                                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                             显示 {(dictPage - 1) * dictPageSize + 1} - {Math.min(dictPage * dictPageSize, totalItems)} 条 / 共 {totalItems} 条
                                          </p>
                                          <div className="flex gap-2">
                                             <Button 
                                               variant="outline" 
                                               size="sm" 
                                               disabled={dictPage === 1}
                                               onClick={() => setDictPage(prev => Math.max(1, prev - 1))}
                                               className="h-8 rounded-lg border-slate-200 font-bold px-3 gap-1"
                                             >
                                                <ChevronLeft className="w-4 h-4" /> 上一页
                                             </Button>
                                             <div className="flex h-8 items-center px-4 bg-white border border-slate-100 rounded-lg text-xs font-black text-indigo-600">
                                                {dictPage} / {totalPages}
                                             </div>
                                             <Button 
                                               variant="outline" 
                                               size="sm" 
                                               disabled={dictPage === totalPages}
                                               onClick={() => setDictPage(prev => Math.min(totalPages, prev + 1))}
                                               className="h-8 rounded-lg border-slate-200 font-bold px-3 gap-1"
                                             >
                                                下一页 <ChevronRight className="w-4 h-4" />
                                             </Button>
                                          </div>
                                       </div>
                                    </TableCell>
                                 </TableRow>
                               )}
                             </>
                           );
                        })()}
                      </TableBody>
                    </Table>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="form" 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-3 gap-6">
                     <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">机型</label>
                        <SearchableSelect 
                          options={MASTER_MODELS} 
                          value={dictForm.model} 
                          onValueChange={v => setDictForm(prev => ({ ...prev, model: v }))}
                          placeholder="选择或搜索机型"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">套餐</label>
                        <SearchableSelect 
                          options={MASTER_PACKAGES} 
                          value={dictForm.packageName} 
                          onValueChange={v => setDictForm(prev => ({ ...prev, packageName: v }))}
                          placeholder="选择或搜索套餐"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">厂商</label>
                        <SearchableSelect 
                          options={MASTER_VENDORS} 
                          value={dictForm.vendor} 
                          onValueChange={v => setDictForm(prev => ({ ...prev, vendor: v }))}
                          placeholder="选择或搜索厂商"
                        />
                     </div>
                  </div>

                  <div className="space-y-4">
                     <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                           <Layers className="w-4 h-4 text-indigo-600" />
                           <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">标准槽位架构定义</h4>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={addDictSlot}
                          className="h-8 border-indigo-100 text-indigo-600 font-bold rounded-lg hover:bg-indigo-50"
                        >
                          <Plus className="w-3.5 h-3.5" /> 增加槽位组
                        </Button>
                     </div>
                     
                     <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
                        {dictForm.slots.map((slot, sIdx) => (
                          <div key={sIdx} className="flex gap-4 items-end bg-slate-50 p-4 rounded-2xl border border-slate-100 group transition-all hover:border-indigo-100">
                             <div className="flex-1 space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-tight ml-1">槽位类型</label>
                                <SearchableSlotTypeSelect 
                                  value={slot.type} 
                                  onValueChange={v => updateDictSlot(sIdx, 'type', v)} 
                                />
                             </div>
                             <div className="flex-1 space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-tight ml-1">标准尺寸/规格</label>
                                {SLOT_SIZE_PRESETS[slot.type] ? (
                                   <Select value={slot.size} onValueChange={v => updateDictSlot(sIdx, 'size', v)}>
                                      <SelectTrigger className="h-10 rounded-xl text-xs font-bold ring-0 focus:ring-0 border-indigo-100 bg-white">
                                         <SelectValue placeholder="规格" />
                                      </SelectTrigger>
                                      <SelectContent className="rounded-xl p-1">
                                         {SLOT_SIZE_PRESETS[slot.type].map(s => <SelectItem key={s} value={s} className="text-xs font-bold">{s}</SelectItem>)}
                                      </SelectContent>
                                   </Select>
                                ) : (
                                   <Input 
                                    value={slot.size} 
                                    onChange={e => updateDictSlot(sIdx, 'size', e.target.value)} 
                                    className="h-10 rounded-xl text-xs font-bold border-indigo-100 bg-white" 
                                    placeholder="输入规格"
                                   />
                                )}
                             </div>
                             <div className="w-24 space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-tight ml-1">标配数量</label>
                                <Input 
                                  type="number" 
                                  value={slot.count} 
                                  onChange={e => updateDictSlot(sIdx, 'count', parseInt(e.target.value) || 0)} 
                                  className="h-10 rounded-xl text-xs font-bold border-indigo-100 bg-white text-center" 
                                />
                             </div>
                             <Button 
                               variant="ghost" 
                               size="icon" 
                               onClick={() => removeDictSlot(sIdx)}
                               className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 h-10 w-10 rounded-xl"
                             >
                               <Trash2 className="w-4 h-4" />
                             </Button>
                          </div>
                        ))}
                     </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100 items-center justify-between">
             <Button 
                variant="ghost" 
                onClick={() => isDictFormView ? setIsDictFormView(false) : setIsGpuDictOpen(false)} 
                className="font-bold text-slate-400 hover:text-slate-600 transition-colors"
             >
                {isDictFormView ? '取消编辑' : '关闭字典'}
             </Button>
             
             {isDictFormView && (
               <Button 
                 onClick={handleDictSubmit}
                 className="bg-indigo-600 hover:bg-slate-900 font-black h-12 px-10 rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-95 gap-2"
                 disabled={!dictForm.packageName || !dictForm.model || dictForm.slots.length === 0}
               >
                  确认保存字典项
                  <Check className="w-4 h-4" />
               </Button>
             )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑服务器资产 Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[800px] rounded-[32px] p-0 overflow-hidden border-none shadow-2xl bg-white">
          <header className="bg-slate-900 p-6 text-white relative">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600 rounded-xl"><Edit3 className="w-5 h-5 text-white" /></div>
                <div>
                   <DialogTitle className="text-xl font-black">编辑资产信息</DialogTitle>
                   <DialogDescription className="text-slate-400 font-bold text-xs">SN: {editingRecord?.serverSN}</DialogDescription>
                </div>
             </div>
          </header>

          <div className="p-8 space-y-6 max-h-[600px] overflow-y-auto scrollbar-thin">
             {/* 基本属性配置 */}
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">是否GPU</label>
                   <Select 
                     value={editingRecord?.isGPU ? 'true' : 'false'} 
                     onValueChange={v => setEditingRecord(prev => prev ? ({...prev, isGPU: v === 'true'}) : null)}
                   >
                     <SelectTrigger className="h-10 rounded-xl font-bold text-xs bg-slate-50 border-slate-100 focus:ring-0 focus:border-indigo-500 transition-colors">
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent className="rounded-xl p-1">
                       <SelectItem value="true" className="rounded-lg font-bold text-xs py-2 text-amber-600">GPU</SelectItem>
                       <SelectItem value="false" className="rounded-lg font-bold text-xs py-2 text-indigo-600">CPU</SelectItem>
                     </SelectContent>
                   </Select>
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">槽位数据来源</label>
                   <Select 
                     value={editingRecord?.dataSource || '人工维护'} 
                     onValueChange={v => setEditingRecord(prev => prev ? ({...prev, dataSource: v as any}) : null)}
                   >
                     <SelectTrigger className="h-10 rounded-xl font-bold text-xs bg-slate-50 border-slate-100 focus:ring-0 focus:border-indigo-500 transition-colors">
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent className="rounded-xl p-1">
                       <SelectItem value="人工维护" className="rounded-lg font-bold text-xs py-2">人工维护</SelectItem>
                       <SelectItem value="by sn" className="rounded-lg font-bold text-xs py-2">by sn</SelectItem>
                       <SelectItem value="by套餐" className="rounded-lg font-bold text-xs py-2">by套餐</SelectItem>
                       <SelectItem value="by机型" className="rounded-lg font-bold text-xs py-2">by机型</SelectItem>
                     </SelectContent>
                   </Select>
                </div>
             </div>

             <div className="flex items-center justify-between mb-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">槽位分布与配件关系</h4>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      if (window.confirm('确定要清空没有占用配件的槽位类型吗？')) {
                        setEditingRecord(prev => {
                          if (!prev) return null;
                          // 过滤掉没有 used 记录的 inventory 项目
                          return { 
                            ...prev, 
                            inventory: prev.inventory.filter(inv => inv.used.length > 0) 
                          };
                        });
                      }
                    }} 
                    className="h-8 text-rose-400 hover:text-rose-600 hover:bg-rose-50 font-bold gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> 清空数据
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setEditingRecord(prev => {
                    if (!prev) return null;
                    return { ...prev, inventory: [...prev.inventory, { spec: { type: 'SATA/SAS', size: '2.5寸 (SFF)' }, total: 0, used: [] }]};
                  })} className="h-8 border-indigo-100 text-indigo-600 font-bold gap-1.5">
                    <Plus className="w-3.5 h-3.5" /> 新增槽位类型
                  </Button>
                </div>
             </div>

                <div className="space-y-4">
                   {editingRecord?.inventory.map((inv, i) => {
                      const totalUsed = inv.used.reduce((acc, curr) => acc + (parseInt(curr.count as any) || 0), 0);
                      const hasUsage = totalUsed > 0;
                      return (
                      <div key={i} className="p-5 bg-slate-50 rounded-[24px] border border-slate-100 space-y-4">
                         <div className="flex items-center gap-3">
                            <div className="flex-1 grid grid-cols-3 gap-3">
                                <SearchableSlotTypeSelect 
                                  value={inv.spec.type} 
                                  disabled={hasUsage}
                                  onValueChange={v => {
                                    const next = [...(editingRecord?.inventory || [])];
                                    next[i] = { ...next[i], spec: { ...next[i].spec, type: v } };
                                    setEditingRecord(prev => prev ? {...prev, inventory: next} : null);
                                  }}
                                  className="h-9 text-xs rounded-lg shadow-sm"
                                />

                               {SLOT_SIZE_PRESETS[inv.spec.type] ? (
                                  <Select value={inv.spec.size} disabled={hasUsage} onValueChange={v => {
                                     const next = [...(editingRecord?.inventory || [])];
                                     next[i] = { ...next[i], spec: { ...next[i].spec, size: v } };
                                     setEditingRecord(prev => prev ? {...prev, inventory: next} : null);
                                  }}>
                                     <SelectTrigger className={`h-9 text-xs rounded-lg font-bold shadow-sm bg-white border-indigo-100 ${hasUsage ? 'opacity-70 cursor-not-allowed bg-slate-100/50' : ''}`}>
                                        <SelectValue placeholder="规格" />
                                     </SelectTrigger>
                                     <SelectContent>
                                        {SLOT_SIZE_PRESETS[inv.spec.type].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                     </SelectContent>
                                  </Select>
                               ) : (
                                  <Input value={inv.spec.size} disabled={hasUsage} onChange={e => {
                                     const next = [...(editingRecord?.inventory || [])];
                                     next[i] = { ...next[i], spec: { ...next[i].spec, size: e.target.value } };
                                     setEditingRecord(prev => prev ? {...prev, inventory: next} : null);
                                  }} placeholder="尺寸规格" className={`h-9 text-xs rounded-lg font-bold shadow-sm bg-white border-indigo-100 ${hasUsage ? 'opacity-70 cursor-not-allowed bg-slate-100/50' : ''}`} />
                               )}
                               <div className="relative">
                                  <Input type="number" min={totalUsed} value={inv.total} onChange={e => {
                                     const val = parseInt(e.target.value) || 0;
                                     const finalVal = hasUsage ? Math.max(val, totalUsed) : val;
                                     const next = [...(editingRecord?.inventory || [])];
                                     next[i] = { ...next[i], total: finalVal };
                                     setEditingRecord(prev => prev ? {...prev, inventory: next} : null);
                                  }} placeholder="总槽位" className="h-9 text-xs rounded-lg font-bold shadow-sm bg-white border-indigo-100 pr-8" />
                                  {hasUsage && (
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-black text-indigo-400">
                                      MIN:{totalUsed}
                                    </div>
                                  )}
                               </div>
                            </div>
                            {!hasUsage ? (
                               <Button variant="ghost" size="icon" onClick={() => {
                                  const next = (editingRecord?.inventory || []).filter((_, idx) => idx !== i);
                                  setEditingRecord(prev => prev ? {...prev, inventory: next} : null);
                               }} className="text-rose-400 h-8 w-8 hover:bg-rose-50"><Trash2 className="w-3.5 h-3.5" /></Button>
                            ) : (
                               <div className="w-8 h-8 flex items-center justify-center text-slate-300" title="已有占用，不可删除">
                                  <Lock className="w-3 h-3" />
                                </div>
                            )}
                         </div>

                         <div className="pl-4 border-l-2 border-indigo-200 space-y-2">
                            <div className="flex items-center justify-between px-1">
                               <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                 已占用配件明细 <Badge variant="outline" className="text-[8px] py-0 h-4 border-indigo-100 text-indigo-600 bg-indigo-50/50">系统抓取 只读</Badge>
                               </span>
                            </div>
                            <div className="space-y-2">
                               {inv.used.map((u, ui) => (
                                  <div key={ui} className="flex items-center gap-2">
                                     <div className="h-8 text-[11px] flex-1 bg-white border border-slate-200 rounded-lg flex items-center px-3 font-bold border-dashed text-slate-600">
                                       {u.name}
                                     </div>
                                     <div className="h-8 text-[11px] w-20 bg-white border border-slate-200 rounded-lg flex items-center px-3 font-bold border-dashed text-slate-600">
                                       {u.count}
                                     </div>
                                  </div>
                               ))}
                               {inv.used.length === 0 && (
                                 <div className="text-[10px] text-slate-300 italic font-medium px-1">该槽位当前无配件占用数据</div>
                               )}
                            </div>
                         </div>
                      </div>
                     );
                  })}
                </div>
             </div>

          <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
             <Button variant="ghost" onClick={() => setIsEditModalOpen(false)} className="font-bold text-slate-400">取消</Button>
             <Button onClick={handleUpdateRecord} className="bg-indigo-600 hover:bg-slate-900 font-bold px-8 rounded-xl shadow-lg shadow-indigo-100">保存变更记录</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 日志详情 Dialog */}
      <Dialog open={isLogModalOpen} onOpenChange={setIsLogModalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[32px] p-0 overflow-hidden border-none shadow-2xl bg-white">
          <header className="bg-slate-50 p-6 border-b border-slate-100">
             <div className="flex items-center gap-3">
               <div className="p-2 bg-indigo-100 rounded-xl">
                 <History className="w-5 h-5 text-indigo-600" />
               </div>
               <div>
                 <DialogTitle className="text-lg font-black text-slate-800">变更日志审计</DialogTitle>
                 <DialogDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                   Change History: {activeLogRecord?.serverSN}
                 </DialogDescription>
               </div>
             </div>
          </header>

          <div className="p-6">
             <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                <div className="max-h-[450px] overflow-y-auto scrollbar-thin">
                   <Table>
                      <TableHeader className="bg-white sticky top-0 z-10 shadow-sm border-b">
                         <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="w-[150px] font-black text-[10px] text-slate-400 uppercase tracking-widest pl-6">变更时间</TableHead>
                            <TableHead className="w-[100px] font-black text-[10px] text-slate-400 uppercase tracking-widest text-center">类型</TableHead>
                            <TableHead className="font-black text-[10px] text-slate-400 uppercase tracking-widest">变更内容描述</TableHead>
                            <TableHead className="w-[100px] font-black text-[10px] text-slate-400 uppercase tracking-widest text-right pr-6">操作人</TableHead>
                         </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activeLogRecord?.logs.length === 0 ? (
                           <TableRow>
                             <TableCell colSpan={4} className="py-20 text-center text-slate-300 font-bold italic">暂无变更日志</TableCell>
                           </TableRow>
                        ) : (
                          activeLogRecord?.logs.map((log) => (
                            <TableRow key={log.id} className="group hover:bg-white transition-colors border-slate-100/50">
                               <TableCell className="pl-6 py-4">
                                  <span className="text-[11px] font-bold text-slate-600 font-mono italic">{log.timestamp}</span>
                               </TableCell>
                               <TableCell className="text-center">
                                  <Badge 
                                    className={`text-[9px] font-black uppercase tracking-widest border-none ${
                                      log.type === 'manual' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
                                    }`}
                                  >
                                    {log.type === 'manual' ? 'MANUAL' : 'AUTO'}
                                  </Badge>
                               </TableCell>
                               <TableCell>
                                  <span className="text-[11px] font-black text-slate-800 leading-relaxed block">
                                    {log.content}
                                  </span>
                               </TableCell>
                               <TableCell className="text-right pr-6">
                                  <span className="text-[11px] font-bold text-slate-500">{log.operator}</span>
                               </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                   </Table>
                </div>
             </div>
          </div>

          <DialogFooter className="p-4 bg-slate-50 border-t border-slate-100">
            <Button variant="outline" className="w-full rounded-xl font-bold border-slate-200 text-slate-600" onClick={() => setIsLogModalOpen(false)}>
              关闭窗口
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 全局操作日志 Dialog */}
      <Dialog open={isGlobalLogOpen} onOpenChange={setIsGlobalLogOpen}>
        <DialogContent className="sm:max-w-[1000px] rounded-[32px] p-0 overflow-hidden border-none shadow-2xl bg-white">
          <header className="bg-indigo-600 p-6 text-white relative">
             <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md">
                      <History className="w-5 h-5 text-white" />
                   </div>
                   <div>
                      <DialogTitle className="text-xl font-black">系统全局操作日志汇总</DialogTitle>
                      <DialogDescription className="text-indigo-100 font-bold text-xs opacity-80 uppercase tracking-widest mt-0.5">Audit Log: Tracking cross-system infrastructure changes</DialogDescription>
                   </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsGlobalLogOpen(false)}
                  className="rounded-full text-white hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </Button>
             </div>
          </header>

          <div className="p-6">
             <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                <div className="max-h-[500px] overflow-y-auto scrollbar-thin">
                   <Table>
                      <TableHeader className="bg-white sticky top-0 z-10 shadow-sm border-b">
                         <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="w-[180px] font-black text-[10px] text-slate-400 uppercase tracking-widest pl-6">操作时间</TableHead>
                            <TableHead className="w-[150px] font-black text-[10px] text-slate-400 uppercase tracking-widest">涉及设备 SN</TableHead>
                            <TableHead className="w-[100px] font-black text-[10px] text-slate-400 uppercase tracking-widest text-center">操作类型</TableHead>
                            <TableHead className="font-black text-[10px] text-slate-400 uppercase tracking-widest">变更描述内容</TableHead>
                            <TableHead className="w-[120px] font-black text-[10px] text-slate-400 uppercase tracking-widest text-right pr-6">执行账户</TableHead>
                         </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(() => {
                          const allLogs = data.flatMap(s => (s.logs || []).map(l => ({ ...l, serverSN: s.serverSN })))
                            .sort((a, b) => new Date(b.timestamp.replace(/-/g, '/')).getTime() - new Date(a.timestamp.replace(/-/g, '/')).getTime());
                          
                          if (allLogs.length === 0) {
                            return (
                              <TableRow>
                                <TableCell colSpan={5} className="py-20 text-center">
                                   <div className="flex flex-col items-center gap-3 opacity-20">
                                      <SearchCode className="w-10 h-10" />
                                      <p className="text-xs font-black uppercase tracking-widest">暂无记录检索到任何变更日志</p>
                                   </div>
                                </TableCell>
                              </TableRow>
                            );
                          }

                          return allLogs.map((log) => (
                            <TableRow key={log.id} className="group hover:bg-white transition-colors border-slate-100/50">
                               <TableCell className="pl-6 py-4">
                                  <div className="flex flex-col">
                                     <span className="text-[11px] font-bold text-slate-700 font-mono tracking-tight">{log.timestamp.split(' ')[0]}</span>
                                     <span className="text-[10px] font-black text-indigo-500 font-mono">{log.timestamp.split(' ')[1]}</span>
                                  </div>
                               </TableCell>
                               <TableCell>
                                  <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-mono text-[10px] font-bold border-none px-2 py-0.5">
                                    {log.serverSN}
                                  </Badge>
                               </TableCell>
                               <TableCell className="text-center">
                                  <Badge 
                                    className={`text-[9px] font-black uppercase tracking-widest border-none ${
                                      log.type === 'manual' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
                                    }`}
                                  >
                                    {log.type === 'manual' ? 'MANUAL' : 'AUTO'}
                                  </Badge>
                               </TableCell>
                               <TableCell>
                                  <span className="text-[11px] font-black text-slate-800 leading-relaxed block">
                                    {log.content}
                                  </span>
                               </TableCell>
                               <TableCell className="text-right pr-6">
                                  <div className="flex items-center justify-end gap-2 text-[11px] font-bold text-slate-500">
                                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-black text-slate-400 border border-white shadow-sm overflow-hidden">
                                      {log.operator.charAt(0)}
                                    </div>
                                    {log.operator}
                                  </div>
                               </TableCell>
                            </TableRow>
                          ));
                        })()}
                      </TableBody>
                   </Table>
                </div>
             </div>
          </div>

          <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100">
             <Button 
               variant="outline" 
               onClick={() => setIsGlobalLogOpen(false)}
               className="w-full h-12 rounded-2xl border-slate-200 font-black text-slate-500 hover:bg-white transition-all active:scale-95 shadow-sm"
             >
               关闭日志审计面板
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 列显隐设置 Dialog */}
      <Dialog open={isColumnSettingsOpen} onOpenChange={setIsColumnSettingsOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-[32px] p-0 overflow-hidden border-none shadow-2xl bg-white focus:outline-none">
          <header className="bg-indigo-600 px-6 py-5 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                <Settings2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-lg font-black tracking-tight">显示列设置</DialogTitle>
                <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest opacity-80">Configure table display columns</p>
              </div>
            </div>
          </header>

          <div className="p-6">
            <div className="grid grid-cols-2 gap-2">
              {allColumns.map((col) => (
                <div 
                  key={col.key} 
                  onClick={() => toggleColumn(col.key)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-all border ${
                    visibleColumns.includes(col.key) 
                      ? 'bg-indigo-50 border-indigo-100 text-indigo-700 shadow-sm' 
                      : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                    visibleColumns.includes(col.key) 
                      ? 'bg-indigo-600 border-indigo-600' 
                      : 'border-slate-300'
                  }`}>
                    {visibleColumns.includes(col.key) && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-xs font-black tracking-tight">{col.label}</span>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="p-4 bg-slate-50 border-t border-slate-100">
            <Button 
              className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-lg shadow-indigo-100 transition-all active:scale-95" 
              onClick={() => setIsColumnSettingsOpen(false)}
            >
              应用配置并保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 标准槽位字典操作日志 Dialog */}
      <Dialog open={isDictLogOpen} onOpenChange={setIsDictLogOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[32px] p-0 overflow-hidden border-none shadow-2xl bg-white focus:outline-none">
          <header className="bg-slate-900 px-6 py-5 text-white flex items-center gap-3">
            <div className="p-2 bg-indigo-500 rounded-xl"><History className="w-5 h-5" /></div>
            <div>
              <DialogTitle className="text-lg font-black tracking-tight">操作日志回顾</DialogTitle>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{activeDictLogEntry?.model} - {activeDictLogEntry?.packageName}</p>
            </div>
          </header>

          <div className="p-6">
             <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
                   <Table>
                      <TableHeader className="bg-white sticky top-0 z-10 shadow-sm border-b">
                         <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="w-[150px] font-black text-[10px] text-slate-400 uppercase tracking-widest pl-6">操作时间</TableHead>
                            <TableHead className="font-black text-[10px] text-slate-400 uppercase tracking-widest">变更事项</TableHead>
                            <TableHead className="w-[100px] font-black text-[10px] text-slate-400 uppercase tracking-widest text-right pr-6">执行人</TableHead>
                         </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(!activeDictLogEntry?.logs || activeDictLogEntry.logs.length === 0) ? (
                           <TableRow>
                             <TableCell colSpan={3} className="py-20 text-center">
                                <div className="flex flex-col items-center gap-3 opacity-20">
                                   <Clock className="w-10 h-10" />
                                   <p className="text-[10px] font-black uppercase tracking-widest">暂无变更溯源记录</p>
                                </div>
                             </TableCell>
                           </TableRow>
                        ) : (
                          activeDictLogEntry?.logs?.map((log) => (
                            <TableRow key={log.id} className="group hover:bg-white transition-colors border-slate-100/50">
                               <TableCell className="pl-6 py-4">
                                  <span className="text-[11px] font-bold text-slate-600 font-mono">{log.timestamp}</span>
                               </TableCell>
                               <TableCell>
                                  <span className="text-[11px] font-black text-slate-800 leading-relaxed block">
                                    {log.content}
                                  </span>
                               </TableCell>
                               <TableCell className="text-right pr-6">
                                  <span className="text-[11px] font-bold text-slate-500">{log.operator}</span>
                               </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                   </Table>
                </div>
             </div>
          </div>

          <DialogFooter className="p-4 bg-slate-50 border-t border-slate-100">
            <Button variant="outline" className="w-full rounded-2xl h-12 font-black border-slate-200 text-slate-600 hover:bg-white transition-all" onClick={() => setIsDictLogOpen(false)}>
              关闭回顾
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 页脚简略版 */}
      <footer className="px-8 py-5 bg-white border-t border-slate-200 flex items-center justify-between z-30">
        <div className="flex items-center gap-6">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
            TOTAL: <span className="text-indigo-600 ml-1">{filteredData.length}</span> RECORDS
          </span>
          <div className="flex items-center gap-2 border-l border-slate-200 pl-6">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">每页显示</span>
            <Select value={pageSize.toString()} onValueChange={v => setPageSize(parseInt(v))}>
              <SelectTrigger className="h-8 w-[70px] rounded-lg border-slate-200 text-xs font-bold bg-slate-50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                {[5, 10, 20, 50].map(size => (
                  <SelectItem key={size} value={size.toString()} className="text-xs font-bold rounded-lg">{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
             PAGE <span className="text-indigo-600">{currentPage}</span> / {totalPages || 1}
           </div>
           <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="h-8 rounded-lg px-3 gap-2 border-slate-200 text-xs font-bold hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" /> 上一页
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="h-8 rounded-lg px-3 gap-2 border-slate-200 text-xs font-bold hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                下一页 <ChevronRight className="w-4 h-4" />
              </Button>
           </div>
        </div>
      </footer>
    </div>
  );
}
