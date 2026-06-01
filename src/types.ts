export interface SlotSpecification {
  type: string;        // e.g. "硬盘", "内存", "CPU"
  size?: string;       // e.g. "3.5寸", "2.5寸", "DDR4", "LGA4189"
}

export interface ComponentUsage {
  name: string;        // 配件名称, e.g. "8TB SATA HDD"
  count: number;       // 使用数量
}

export interface SlotGroupInventory {
  spec: SlotSpecification;
  total: number;       // 总槽位数
  used: ComponentUsage[]; // 已使用的配件及其数量
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'manual' | 'auto';
  content: string;
  operator: string;
  ticketId?: string; // 关联工单 ID
}

export interface GpuDictionaryEntry {
  id: string;
  packageName: string;
  model: string;
  vendor: string;
  updatedAt?: string;
  logs?: LogEntry[];
  slots: {
    type: string;
    size: string;
    count: number;
  }[];
}

export interface ServerComponentRecord {
  id: number;
  serverSN: string;
  serverPackage: string;
  serverModel: string;
  vendor?: string;
  isGPU?: boolean;
  dataSource?: '人工维护' | 'by sn' | 'by套餐' | 'by机型';
  inventory: SlotGroupInventory[]; // 详细槽位及配件清单
  logs: LogEntry[];       // 变更日志记录
  updateTime: string;
}
