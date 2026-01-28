
import React, { useState, useMemo, useCallback } from 'react';
import { LaborData, FixedCost, VariableCost, ProductData } from './types';
import { Card } from './components/Card';
import { NumberInput } from './components/NumberInput';
import { CostItemRow } from './components/CostItemRow';
import { PriceIcon, MoneyIcon, ClockIcon, PlusIcon, TrashIcon, CalculatorIcon, TagIcon, ChartBarIcon, ArrowRightIcon } from './components/Icons';

const App: React.FC = () => {
    const [laborData, setLaborData] = useState<LaborData>({
        desiredSalary: 1500,
        workingDays: 20,
        workingHours: 8,
    });

    const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([
        { id: '1', name: 'Internet', monthlyCost: 60 },
        { id: '2', name: 'Energia', monthlyCost: 72 },
    ]);

    const [variableCosts, setVariableCosts] = useState<VariableCost[]>([
        { id: '1', name: 'Fotográfico 230g', itemCost: 22, yield: 50, quantity: 70, unitName: 'folhas' },
        { id: '2', name: 'Tinta (Impressão)', itemCost: 159, yield: 7000, quantity: 70, unitName: 'impressões' },
    ]);

    const [productData, setProductData] = useState<ProductData>({
        name: 'Sacola Pequena',
        timeSpent: 2,
        desiredProfitMargin: 50,
    });

    const formatCurrency = (value: number) => {
        if (isNaN(value) || !isFinite(value)) return "R$ 0,00";
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const handleLaborChange = <T extends keyof LaborData>(field: T, value: LaborData[T]) => {
        setLaborData(prev => ({ ...prev, [field]: value }));
    };

    const handleProductChange = <T extends keyof ProductData>(field: T, value: ProductData[T]) => {
        setProductData(prev => ({ ...prev, [field]: value }));
    };
    
    const handleFixedCostChange = (id: string, field: keyof Omit<FixedCost, 'id'>, value: string | number) => {
        setFixedCosts(costs => costs.map(cost => cost.id === id ? { ...cost, [field]: value } : cost));
    };

    const handleAddFixedCost = () => {
        setFixedCosts(costs => [...costs, { id: Date.now().toString(), name: 'Novo Custo', monthlyCost: 0 }]);
    };

    const handleRemoveFixedCost = (id: string) => {
        setFixedCosts(costs => costs.filter(cost => cost.id !== id));
    };

    const handleVariableCostChange = (id: string, field: keyof Omit<VariableCost, 'id'>, value: string | number) => {
        setVariableCosts(costs => costs.map(cost => cost.id === id ? { ...cost, [field]: value } : cost));
    };

    const handleAddVariableCost = () => {
        setVariableCosts(costs => [...costs, { id: Date.now().toString(), name: 'Novo Material', itemCost: 0, yield: 1, quantity: 0, unitName: 'unidades' }]);
    };

    const handleRemoveVariableCost = (id: string) => {
        setVariableCosts(costs => costs.filter(cost => cost.id !== id));
    };


    const { hourlyLaborRate, totalMonthlyHours } = useMemo(() => {
        const totalHours = laborData.workingDays * laborData.workingHours;
        if (totalHours === 0) return { hourlyLaborRate: 0, totalMonthlyHours: 0 };
        return {
            hourlyLaborRate: laborData.desiredSalary / totalHours,
            totalMonthlyHours: totalHours,
        };
    }, [laborData]);

    const { totalHourlyFixedCost, totalMonthlyFixedCost } = useMemo(() => {
        const monthlyTotal = fixedCosts.reduce((acc, cost) => acc + Number(cost.monthlyCost || 0), 0);
        // O divisor 720 representa o total de horas em um mês de 30 dias (30 dias * 24 horas).
        const fixedDivisor = 720;
        return {
            totalHourlyFixedCost: monthlyTotal / fixedDivisor,
            totalMonthlyFixedCost: monthlyTotal
        };
    }, [fixedCosts]);

    const totalVariableCost = useMemo(() => {
        return variableCosts.reduce((acc, cost) => {
            const unitCost = (Number(cost.itemCost) || 0) / (Number(cost.yield) || 1);
            return acc + (unitCost * (Number(cost.quantity) || 0));
        }, 0);
    }, [variableCosts]);

    const { productLaborCost, productFixedCost, totalBaseCost, profitAmount, finalPrice } = useMemo(() => {
        const pLaborCost = hourlyLaborRate * productData.timeSpent;
        const pFixedCost = totalHourlyFixedCost * productData.timeSpent;
        const baseCost = pLaborCost + pFixedCost + totalVariableCost;
        const pAmount = baseCost * (productData.desiredProfitMargin / 100);
        const fPrice = baseCost + pAmount;

        return {
            productLaborCost: pLaborCost,
            productFixedCost: pFixedCost,
            totalBaseCost: baseCost,
            profitAmount: pAmount,
            finalPrice: fPrice,
        };
    }, [hourlyLaborRate, totalHourlyFixedCost, totalVariableCost, productData]);


    return (
        <div className="bg-slate-50 min-h-screen text-slate-800 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Calculadora de Preços</h1>
                    <p className="mt-2 text-lg text-slate-600">Precifique seus produtos de forma justa e lucrativa.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    
                    {/* Column 1: Base Costs */}
                    <div className="lg:col-span-1 space-y-8">
                        <Card title="Passo 1: Mão de Obra" icon={<ClockIcon />}>
                            <NumberInput label="Salário Pretendido (Mês)" value={laborData.desiredSalary} onChange={(v) => handleLaborChange('desiredSalary', v)} prefix="R$" />
                            <NumberInput label="Dias Trabalhados (Mês)" value={laborData.workingDays} onChange={(v) => handleLaborChange('workingDays', v)} />
                            <NumberInput label="Horas Trabalhadas (Dia)" value={laborData.workingHours} onChange={(v) => handleLaborChange('workingHours', v)} />
                            <div className="mt-4 p-3 bg-slate-100 rounded-lg text-center">
                                <p className="text-sm font-medium text-slate-500">Valor da sua Hora</p>
                                <p className="text-2xl font-bold text-indigo-600">{formatCurrency(hourlyLaborRate)}</p>
                            </div>
                        </Card>

                        <Card title="Passo 2: Custos Fixos" icon={<CalculatorIcon />}>
                           <div className="space-y-3">
                                {fixedCosts.map(cost => (
                                    <div key={cost.id} className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={cost.name}
                                            onChange={(e) => handleFixedCostChange(cost.id, 'name', e.target.value)}
                                            className="flex-grow bg-white border border-slate-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                            placeholder="Nome do custo"
                                        />
                                        <div className="relative">
                                           <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 text-sm">R$</span>
                                            <input
                                                type="number"
                                                value={cost.monthlyCost}
                                                onChange={(e) => handleFixedCostChange(cost.id, 'monthlyCost', Number(e.target.value))}
                                                className="w-32 bg-white border border-slate-300 rounded-md shadow-sm pl-9 pr-3 py-2 text-right focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <button onClick={() => handleRemoveFixedCost(cost.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-100 rounded-full transition-colors">
                                           <TrashIcon />
                                        </button>
                                    </div>
                                ))}
                           </div>
                           <button onClick={handleAddFixedCost} className="mt-4 w-full flex items-center justify-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors p-2 rounded-lg hover:bg-indigo-50">
                               <PlusIcon /> Adicionar Custo Fixo
                           </button>
                           <div className="mt-4 p-3 bg-slate-100 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Total Mensal</p>
                                    <p className="text-lg font-bold text-slate-700">{formatCurrency(totalMonthlyFixedCost)}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Custo por Hora</p>
                                    <p className="text-lg font-bold text-indigo-600">{formatCurrency(totalHourlyFixedCost)}</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                    
                    {/* Column 2: Variable Costs & Product Info */}
                    <div className="lg:col-span-1 space-y-8">
                       <Card title="Passo 3: Custos Variáveis" icon={<ChartBarIcon />}>
                           <div className="space-y-4">
                                {variableCosts.map(cost => (
                                    <CostItemRow key={cost.id} cost={cost} onChange={handleVariableCostChange} onRemove={handleRemoveVariableCost} />
                                ))}
                           </div>
                           <button onClick={handleAddVariableCost} className="mt-4 w-full flex items-center justify-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors p-2 rounded-lg hover:bg-indigo-50">
                               <PlusIcon /> Adicionar Material
                           </button>
                           <div className="mt-4 p-3 bg-slate-100 rounded-lg text-center">
                                <p className="text-sm font-medium text-slate-500">Custo Variável Total do Produto</p>
                                <p className="text-2xl font-bold text-indigo-600">{formatCurrency(totalVariableCost)}</p>
                            </div>
                       </Card>

                        <Card title="Passo 4: Dados do Produto" icon={<TagIcon />}>
                           <div className="mb-2">
                               <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Produto</label>
                               <input
                                   type="text"
                                   value={productData.name}
                                   onChange={(e) => handleProductChange('name', e.target.value)}
                                   className="w-full bg-white border border-slate-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                   placeholder="Ex: Cartão de Visita"
                               />
                           </div>
                           <NumberInput label="Tempo Gasto (Horas)" value={productData.timeSpent} onChange={(v) => handleProductChange('timeSpent', v)} />
                           <NumberInput label="Margem de Lucro Desejada (%)" value={productData.desiredProfitMargin} onChange={(v) => handleProductChange('desiredProfitMargin', v)} suffix="%" />
                       </Card>
                    </div>

                    {/* Column 3: Final Price */}
                     <div className="lg:col-span-1 sticky top-8">
                        <Card title="Preço Final do Produto" icon={<PriceIcon />} className="bg-indigo-600 text-white shadow-2xl shadow-indigo-200">
                             <h2 className="text-xl font-bold text-center text-indigo-200 truncate">{productData.name}</h2>
                             <div className="my-6 text-center">
                                 <p className="text-lg font-medium text-indigo-200">Preço de Venda Sugerido</p>
                                 <p className="text-6xl font-extrabold tracking-tight text-white py-2">{formatCurrency(finalPrice)}</p>
                             </div>
                             
                             <div className="space-y-3 text-sm border-t border-indigo-500 pt-6">
                                <div className="flex justify-between items-center text-indigo-100">
                                    <span>Custo de Mão de Obra</span>
                                    <span className="font-semibold">{formatCurrency(productLaborCost)}</span>
                                </div>
                                <div className="flex justify-between items-center text-indigo-100">
                                    <span>Custo Fixo (Proporcional)</span>
                                    <span className="font-semibold">{formatCurrency(productFixedCost)}</span>
                                </div>
                                <div className="flex justify-between items-center text-indigo-100">
                                    <span>Custo Variável (Materiais)</span>
                                    <span className="font-semibold">{formatCurrency(totalVariableCost)}</span>
                                </div>
                                <div className="flex justify-between items-center text-indigo-100 font-bold border-t border-indigo-500 pt-3 mt-3">
                                    <span>Custo Total de Produção</span>
                                    <span>{formatCurrency(totalBaseCost)}</span>
                                </div>
                                <div className="flex justify-between items-center text-indigo-100 mt-4">
                                    <span>Lucro ({productData.desiredProfitMargin}%)</span>
                                    <span className="font-semibold">{formatCurrency(profitAmount)}</span>
                                </div>
                             </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;
