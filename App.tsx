
import React, { useState, useMemo, useCallback } from 'react';
import { LaborConfig, CostItem, Material, InkConfig, Product, MaterialUsage } from './types';
import { PlusIcon, TrashIcon, CalculatorIcon, DollarSignIcon, TagIcon, ClockIcon } from './components/Icons';

// Helper function to format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// --- Reusable UI Components ---

interface CardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}
const Card: React.FC<CardProps> = ({ title, icon, children, className }) => (
  <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>
    <div className="flex items-center mb-4">
      <div className="bg-primary/10 text-primary p-2 rounded-full mr-3">{icon}</div>
      <h2 className="text-xl font-bold text-dark">{title}</h2>
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

interface InputProps {
  label: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  step?: string;
  min?: string;
  name?: string;
  placeholder?: string;
  adornment?: string;
}
const Input: React.FC<InputProps> = ({ label, adornment, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
    <div className="relative">
      {adornment && <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">{adornment}</span>}
      <input
        className={`w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent ${adornment ? 'pl-7' : ''}`}
        {...props}
      />
    </div>
  </div>
);

interface ResultDisplayProps {
    label: string;
    value: string;
    isHighlighted?: boolean;
}
const ResultDisplay: React.FC<ResultDisplayProps> = ({ label, value, isHighlighted }) => (
    <div className={`flex justify-between items-center p-3 rounded-lg ${isHighlighted ? 'bg-primary/10' : 'bg-slate-50'}`}>
        <span className={`font-medium ${isHighlighted ? 'text-primary' : 'text-slate-600'}`}>{label}</span>
        <span className={`font-bold text-lg ${isHighlighted ? 'text-primary' : 'text-dark'}`}>{value}</span>
    </div>
);


// --- App Components (Defined outside App to prevent re-creation) ---

const LaborCostEditor: React.FC<{ config: LaborConfig, setConfig: React.Dispatch<React.SetStateAction<LaborConfig>>, hourlyRate: number }> = ({ config, setConfig, hourlyRate }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: Number(value) || 0 }));
  };
  return (
    <Card title="1. Custo da Mão de Obra" icon={<ClockIcon />}>
      <Input label="Salário Mensal Pretendido" name="salary" value={config.salary} onChange={handleChange} type="number" adornment="R$" />
      <Input label="Dias Trabalhados / Mês" name="workDays" value={config.workDays} onChange={handleChange} type="number" />
      <Input label="Horas Trabalhadas / Dia" name="workHours" value={config.workHours} onChange={handleChange} type="number" />
      <ResultDisplay label="Valor da Hora de Trabalho" value={formatCurrency(hourlyRate)} isHighlighted />
    </Card>
  );
};

const FixedCostsEditor: React.FC<{ costs: CostItem[], setCosts: React.Dispatch<React.SetStateAction<CostItem[]>>, totalMonthly: number, hourlyRate: number }> = ({ costs, setCosts, totalMonthly, hourlyRate }) => {
    const handleAdd = () => setCosts(prev => [...prev, { id: crypto.randomUUID(), name: '', value: 0 }]);
    const handleRemove = (id: string) => setCosts(prev => prev.filter(c => c.id !== id));
    const handleChange = (id: string, field: 'name' | 'value', value: string | number) => {
        setCosts(prev => prev.map(c => c.id === id ? {...c, [field]: value} : c));
    };

    return (
        <Card title="2. Custos Fixos Mensais" icon={<CalculatorIcon />}>
            {costs.map(cost => (
                <div key={cost.id} className="flex items-center gap-2">
                    <input type="text" placeholder="Descrição (ex: Internet)" value={cost.name} onChange={e => handleChange(cost.id, 'name', e.target.value)} className="flex-grow w-full px-3 py-2 border border-slate-300 rounded-md" />
                    <input type="number" placeholder="Valor" value={cost.value || ''} onChange={e => handleChange(cost.id, 'value', Number(e.target.value))} className="w-28 px-3 py-2 border border-slate-300 rounded-md" adornment="R$" />
                    <button onClick={() => handleRemove(cost.id)} className="text-red-500 hover:text-red-700 p-2"><TrashIcon /></button>
                </div>
            ))}
            <button onClick={handleAdd} className="w-full flex items-center justify-center gap-2 text-sm text-accent font-semibold hover:bg-accent/10 p-2 rounded-md">
                <PlusIcon /> Adicionar Custo
            </button>
            <ResultDisplay label="Custo Fixo Total / Mês" value={formatCurrency(totalMonthly)} />
            <ResultDisplay label="Custo Fixo / Hora" value={formatCurrency(hourlyRate)} isHighlighted />
        </Card>
    );
};

const VariableCostsEditor: React.FC<{
  ink: InkConfig; setInk: React.Dispatch<React.SetStateAction<InkConfig>>; costPerPrint: number;
  materials: Material[]; setMaterials: React.Dispatch<React.SetStateAction<Material[]>>
}> = ({ ink, setInk, costPerPrint, materials, setMaterials }) => {
  const handleInkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInk(prev => ({ ...prev, [e.target.name]: Number(e.target.value) || 0 }));
  };

  const handleAddMaterial = () => setMaterials(prev => [...prev, { id: crypto.randomUUID(), name: '', packCost: 0, itemsPerPack: 1 }]);
  const handleRemoveMaterial = (id: string) => setMaterials(prev => prev.filter(m => m.id !== id));
  const handleMaterialChange = (id: string, field: keyof Omit<Material, 'id'>, value: string | number) => {
    setMaterials(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };
  
  return (
    <div className="space-y-6">
       <Card title="3. Custo de Impressão" icon={<TagIcon />}>
          <Input label="Custo do Kit de Tinta" name="kitCost" value={ink.kitCost} onChange={handleInkChange} type="number" adornment="R$" />
          <Input label="Rendimento (nº de impressões)" name="yield" value={ink.yield} onChange={handleInkChange} type="number" />
          <ResultDisplay label="Custo por Impressão" value={formatCurrency(costPerPrint)} isHighlighted />
       </Card>
       <Card title="4. Materiais" icon={<TagIcon />}>
        <div className="text-xs grid grid-cols-[1fr_auto_auto_auto] gap-2 font-semibold text-slate-500 px-2">
            <span>Descrição</span>
            <span>Custo Pacote</span>
            <span>Qtd. Pacote</span>
            <span></span>
        </div>
        {materials.map(mat => (
            <div key={mat.id} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2">
                <input type="text" placeholder="Nome do material" value={mat.name} onChange={e => handleMaterialChange(mat.id, 'name', e.target.value)} className="w-full px-2 py-1 border border-slate-300 rounded-md" />
                <input type="number" value={mat.packCost || ''} onChange={e => handleMaterialChange(mat.id, 'packCost', Number(e.target.value))} className="w-24 px-2 py-1 border border-slate-300 rounded-md" />
                <input type="number" value={mat.itemsPerPack || ''} onChange={e => handleMaterialChange(mat.id, 'itemsPerPack', Number(e.target.value))} className="w-24 px-2 py-1 border border-slate-300 rounded-md" />
                <button onClick={() => handleRemoveMaterial(mat.id)} className="text-red-500 hover:text-red-700 p-1"><TrashIcon /></button>
            </div>
        ))}
         <button onClick={handleAddMaterial} className="w-full flex items-center justify-center gap-2 text-sm text-accent font-semibold hover:bg-accent/10 p-2 rounded-md">
                <PlusIcon /> Adicionar Material
         </button>
       </Card>
    </div>
  );
};


// --- Main App Component ---

export default function App() {
  // --- STATE MANAGEMENT ---
  const [laborConfig, setLaborConfig] = useState<LaborConfig>({ salary: 1500, workDays: 20, workHours: 8 });
  const [fixedCosts, setFixedCosts] = useState<CostItem[]>([
    { id: 'fc1', name: 'Internet', value: 60 },
    { id: 'fc2', name: 'Energia', value: 72 },
  ]);
  const [inkConfig, setInkConfig] = useState<InkConfig>({ kitCost: 159, yield: 7000 });
  const [materials, setMaterials] = useState<Material[]>([
    { id: 'm1', name: 'Fotográfico 230g', packCost: 22, itemsPerPack: 50 },
    { id: 'm2', name: 'Fotográfico Adesivo 130g', packCost: 25, itemsPerPack: 50 },
    { id: 'm3', name: 'Fotográfico Matte 180g', packCost: 49, itemsPerPack: 100 },
    { id: 'm4', name: 'Papel 60kg', packCost: 16, itemsPerPack: 100 },
  ]);
  const [product, setProduct] = useState<Product>({
    name: 'Sacola Pequena', timeSpent: 2, printCount: 70, profitMargin: 50,
    materialsUsed: [{ materialId: 'm1', quantity: 70 }],
  });

  // --- DERIVED CALCULATIONS ---
  const totalWorkHoursMonth = useMemo(() => laborConfig.workDays * laborConfig.workHours, [laborConfig]);
  
  const hourlyLaborRate = useMemo(() => totalWorkHoursMonth > 0 ? laborConfig.salary / totalWorkHoursMonth : 0, [laborConfig, totalWorkHoursMonth]);
  
  const totalMonthlyFixedCost = useMemo(() => fixedCosts.reduce((sum, cost) => sum + cost.value, 0), [fixedCosts]);
  
  const hourlyFixedCostRate = useMemo(() => totalMonthlyFixedCost / 720, [totalMonthlyFixedCost]);
  
  const costPerPrint = useMemo(() => inkConfig.yield > 0 ? inkConfig.kitCost / inkConfig.yield : 0, [inkConfig]);

  const materialsMap = useMemo(() => new Map(materials.map(m => [m.id, m])), [materials]);

  const { productLaborCost, productFixedCost, productVariableCost, totalProductCost, profitValue, finalPrice, pricePerUnit } = useMemo(() => {
    const productLaborCost = product.timeSpent * hourlyLaborRate;
    const productFixedCost = product.timeSpent * hourlyFixedCostRate;
    
    const materialsCost = product.materialsUsed.reduce((sum, usage) => {
        const material = materialsMap.get(usage.materialId);
        if (!material || material.itemsPerPack <= 0) return sum;
        const costPerItem = material.packCost / material.itemsPerPack;
        return sum + (costPerItem * usage.quantity);
    }, 0);

    const printingCost = product.printCount * costPerPrint;
    const productVariableCost = materialsCost + printingCost;
    const totalProductCost = productLaborCost + productFixedCost + productVariableCost;
    const profitValue = totalProductCost * (product.profitMargin / 100);
    const finalPrice = totalProductCost + profitValue;
    const totalQuantity = product.materialsUsed.reduce((sum, item) => sum + item.quantity, 0) || 1;
    const pricePerUnit = finalPrice / Math.max(1, totalQuantity);


    return { productLaborCost, productFixedCost, productVariableCost, totalProductCost, profitValue, finalPrice, pricePerUnit };
  }, [product, hourlyLaborRate, hourlyFixedCostRate, costPerPrint, materialsMap]);


  // --- HANDLERS ---
  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProduct(p => ({ ...p, [name]: (e.target.type === 'number') ? Number(value) : value }));
  };
  
  const handleAddMaterialUsage = () => {
      if (materials.length === 0) return;
      setProduct(p => ({ ...p, materialsUsed: [...p.materialsUsed, {materialId: materials[0].id, quantity: 0 }] }));
  };

  const handleMaterialUsageChange = (index: number, field: keyof MaterialUsage, value: string | number) => {
      setProduct(p => {
          const newMaterialsUsed = [...p.materialsUsed];
          newMaterialsUsed[index] = {...newMaterialsUsed[index], [field]: value};
          return {...p, materialsUsed: newMaterialsUsed};
      });
  };

  const handleRemoveMaterialUsage = (index: number) => {
      setProduct(p => ({...p, materialsUsed: p.materialsUsed.filter((_, i) => i !== index)}));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="bg-primary shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-full">
                <DollarSignIcon className="text-white h-8 w-8" />
            </div>
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Calculadora de Preços para Gráfica</h1>
                <p className="text-white/80 text-sm">Precifique seus produtos de forma rápida e precisa.</p>
            </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Coluna de Configuração */}
        <div className="space-y-6">
          <LaborCostEditor config={laborConfig} setConfig={setLaborConfig} hourlyRate={hourlyLaborRate} />
          <FixedCostsEditor costs={fixedCosts} setCosts={setFixedCosts} totalMonthly={totalMonthlyFixedCost} hourlyRate={hourlyFixedCostRate} />
          <VariableCostsEditor ink={inkConfig} setInk={setInkConfig} costPerPrint={costPerPrint} materials={materials} setMaterials={setMaterials} />
        </div>

        {/* Coluna de Precificação */}
        <div className="lg:sticky top-8">
            <Card title="5. Precificação do Produto" icon={<DollarSignIcon />} className="bg-light border-2 border-accent">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Nome do Produto" name="name" value={product.name} onChange={handleProductChange} />
                    <Input label="Tempo Gasto (horas)" name="timeSpent" value={product.timeSpent} onChange={handleProductChange} type="number" />
                </div>
                
                <div className="border-t pt-4">
                    <h3 className="font-semibold text-dark mb-2">Materiais Utilizados no Produto</h3>
                    {product.materialsUsed.map((usage, index) => (
                        <div key={index} className="grid grid-cols-[1fr_auto_auto] items-center gap-2 mb-2">
                             <select value={usage.materialId} onChange={e => handleMaterialUsageChange(index, 'materialId', e.target.value)} className="w-full px-2 py-2 border border-slate-300 rounded-md bg-white">
                                {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                            <input type="number" placeholder="Qtd." value={usage.quantity || ''} onChange={e => handleMaterialUsageChange(index, 'quantity', Number(e.target.value))} className="w-24 px-2 py-2 border border-slate-300 rounded-md" />
                            <button onClick={() => handleRemoveMaterialUsage(index)} className="text-red-500 hover:text-red-700 p-1"><TrashIcon /></button>
                        </div>
                    ))}
                    <button onClick={handleAddMaterialUsage} className="w-full text-sm text-accent font-semibold hover:bg-accent/10 p-2 rounded-md flex items-center justify-center gap-2 mt-2">
                        <PlusIcon /> Adicionar Material ao Produto
                    </button>
                </div>
                
                <Input label="Quantidade de Impressões" name="printCount" value={product.printCount} onChange={handleProductChange} type="number" />
                
                <div className="border-t pt-4 space-y-2">
                    <h3 className="font-semibold text-lg text-dark mb-2">Resumo de Custos</h3>
                    <ResultDisplay label="Custo Mão de Obra" value={formatCurrency(productLaborCost)} />
                    <ResultDisplay label="Custo Fixo Aplicado" value={formatCurrency(productFixedCost)} />
                    <ResultDisplay label="Custo Variável (Materiais + Impressão)" value={formatCurrency(productVariableCost)} />
                    <ResultDisplay label="CUSTO TOTAL DO PRODUTO" value={formatCurrency(totalProductCost)} isHighlighted />
                </div>

                <div className="border-t pt-4 space-y-3">
                    <h3 className="font-semibold text-lg text-dark mb-2">Preço Final</h3>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Margem de Lucro ({product.profitMargin}%)</label>
                        <input type="range" name="profitMargin" min="0" max="200" value={product.profitMargin} onChange={handleProductChange} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-accent" />
                    </div>
                     <ResultDisplay label="Valor do Lucro" value={formatCurrency(profitValue)} />
                     <div className="bg-secondary text-white p-4 rounded-lg text-center">
                        <span className="block text-sm opacity-80">PREÇO FINAL SUGERIDO</span>
                        <span className="block text-4xl font-bold">{formatCurrency(finalPrice)}</span>
                        <span className="block text-sm opacity-80 mt-1">({formatCurrency(pricePerUnit)} por unidade)</span>
                     </div>
                </div>
            </Card>
        </div>
      </main>
    </div>
  );
}
