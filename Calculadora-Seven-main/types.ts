
export interface LaborConfig {
  salary: number;
  workDays: number;
  workHours: number;
}

export interface CostItem {
  id: string;
  name: string;
  value: number;
}

export interface Material {
  id:string;
  name: string;
  packCost: number;
  itemsPerPack: number;
}

export interface InkConfig {
  kitCost: number;
  yield: number;
}

export interface MaterialUsage {
  materialId: string;
  quantity: number;
}

export interface Product {
  name: string;
  timeSpent: number; // in hours
  materialsUsed: MaterialUsage[];
  printCount: number;
  profitMargin: number; // percentage
}
