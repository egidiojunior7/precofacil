
export interface LaborData {
    desiredSalary: number;
    workingDays: number;
    workingHours: number;
}

export interface FixedCost {
    id: string;
    name: string;
    monthlyCost: number;
}

export interface VariableCost {
    id: string;
    name: string;
    itemCost: number; // Cost of the pack/kit
    yield: number;    // How many units in the pack/kit
    quantity: number; // How many units are used for the product
    unitName: string; // e.g., 'folhas', 'impressões', 'unidades'
}

export interface InkCost {
    id: string;
    name: string;
    cartridgePrice: number;
    cartridgeYield: number;
}

export interface ProductData {
    name: string;
    timeSpent: number;
    printQuantity: number;
    desiredProfitMargin: number;
}