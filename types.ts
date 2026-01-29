
export interface Profile {
  id: string;
  desired_salary: number;
  monthly_hours: number;
}

export interface FixedCost {
  id: string;
  user_id: string;
  name: string;
  monthly_cost: number;
}

export interface Material {
  id: string;
  user_id: string;
  name: string;
  unit_price: number;
  yield: number; // Quantidade de peças que o material rende
}

export interface Product {
  id: string;
  user_id: string;
  name: string;
  production_time_minutes: number;
  profit_margin_percentage: number;
}

// Tabela de junção para materiais em um produto
export interface ProductMaterial {
  id: string;
  product_id: string;
  material_id: string;
  quantity_used: number;
  materials: Material; // Para facilitar o acesso aos dados do material
}

export interface OtherProductCost {
  id: string;
  product_id: string;
  name: string;
  price: number;
}
