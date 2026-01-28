
import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import type { Session } from '@supabase/supabase-js';
import { LaborData, FixedCost, VariableCost, ProductData, InkCost } from '../types';
import { Card } from './Card';
import { NumberInput } from './NumberInput';
import { CostItemRow } from './CostItemRow';
import { InkCostRow } from './InkCostRow';
import { PriceIcon, ClockIcon, PlusIcon, TrashIcon, CalculatorIcon, TagIcon, ChartBarIcon, PrinterIcon } from './Icons';

interface PricingCalculatorProps {
    session: Session;
}

const PricingCalculator: React.FC<PricingCalculatorProps> = ({ session }) => {
    const [loading, setLoading] = useState(true);
    const [laborData, setLaborData] = useState<LaborData>({ desiredSalary: 1500, workingDays: 20, workingHours: 8 });
    const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([]);
    const [variableCosts, setVariableCosts] = useState<VariableCost[]>([]);
    const [inkCosts, setInkCosts] = useState<InkCost[]>([]);
    const [productData, setProductData] = useState<ProductData>({ name: '', timeSpent: 0, printQuantity: 0, desiredProfitMargin: 50 });
    const [manualSellingPrice, setManualSellingPrice] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            if (!supabase) return;
            setLoading(true);
            const user = session.user;
            try {
                // Fetch or Create Labor Data
                let { data: labor, error: laborError } = await supabase.from('labor_data').select('*').eq('user_id', user.id).single();
                if (laborError && laborError.code === 'PGRST116') {
                    const { data: newLabor, error: insertError } = await supabase.from('labor_data').insert({ user_id: user.id, desired_salary: 1500, working_days: 20, working_hours: 8 }).select().single();
                    if (insertError) throw insertError;
                    labor = newLabor;
                } else if (laborError) throw laborError;
                if (labor) setLaborData(labor);
                
                // Fetch or Create Product Data
                let { data: product, error: productError } = await supabase.from('product_data').select('*').eq('user_id', user.id).single();
                 if (productError && productError.code === 'PGRST116') {
                    const { data: newProduct, error: insertError } = await supabase.from('product_data').insert({ user_id: user.id, name: 'Meu Primeiro Produto', time_spent: 1, print_quantity: 100, desired_profit_margin: 50 }).select().single();
                    if (insertError) throw insertError;
                    product = newProduct;
                } else if (productError) throw productError;
                if (product) setProductData(product);

                // Fetch other data
                const { data: fixed, error: fixedError } = await supabase.from('fixed_costs').select('*').eq('user_id', user.id).order('created_at');
                if (fixedError) throw fixedError;
                if (fixed) setFixedCosts(fixed);

                const { data: variable, error: variableError } = await supabase.from('variable_costs').select('*').eq('user_id', user.id).order('created_at');
                if (variableError) throw variableError;
                if (variable) setVariableCosts(variable);

                const { data: inks, error: inkError } = await supabase.from('ink_costs').select('*').eq('user_id', user.id).order('created_at');
                if (inkError) throw inkError;
                if (inks) setInkCosts(inks);
            } catch (error) {
                console.error("Erro ao buscar dados do Supabase:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [session]);

    const formatCurrency = (value: number, minimumFractionDigits = 2) => {
        if (isNaN(value) || !isFinite(value)) return "R$ 0,00";
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits }).format(value);
    };

    const handleLaborChange = async <T extends keyof LaborData>(field: T, value: LaborData[T]) => {
        if (!supabase) return;
        const newData = { ...laborData, [field]: value };
        setLaborData(newData);
        await supabase.from('labor_data').update({ [field]: value }).eq('user_id', session.user.id);
    };
    
    const handleProductChange = async <T extends keyof ProductData>(field: T, value: ProductData[T]) => {
        if (!supabase) return;
        const newData = { ...productData, [field]: value };
        setProductData(newData);
        await supabase.from('product_data').update({ [field]: value }).eq('user_id', session.user.id);
    };
    
    const handleFixedCostChange = async (id: string, field: keyof Omit<FixedCost, 'id'>, value: string | number) => {
        if (!supabase) return;
        const newCosts = fixedCosts.map(cost => cost.id === id ? { ...cost, [field]: value } : cost);
        setFixedCosts(newCosts);
        await supabase.from('fixed_costs').update({ [field]: value }).eq('id', id);
    };

    const handleAddFixedCost = async () => {
        if (!supabase) return;
        const { data } = await supabase.from('fixed_costs').insert({ name: 'Novo Custo', monthly_cost: 0, user_id: session.user.id }).select().single();
        if (data) setFixedCosts(costs => [...costs, data]);
    };

    const handleRemoveFixedCost = async (id: string) => {
        if (!supabase) return;
        setFixedCosts(costs => costs.filter(cost => cost.id !== id));
        await supabase.from('fixed_costs').delete().eq('id', id);
    };

    const handleVariableCostChange = async (id: string, field: keyof Omit<VariableCost, 'id'>, value: string | number) => {
        if (!supabase) return;
        const newCosts = variableCosts.map(cost => cost.id === id ? { ...cost, [field]: value } : cost);
        setVariableCosts(newCosts);
        await supabase.from('variable_costs').update({ [field]: value }).eq('id', id);
    };

    const handleAddVariableCost = async () => {
        if (!supabase) return;
        const { data } = await supabase.from('variable_costs').insert({ name: 'Novo Material', item_cost: 0, yield: 1, quantity: 0, unit_name: 'unidades', user_id: session.user.id }).select().single();
        if (data) setVariableCosts(costs => [...costs, data]);
    };

    const handleRemoveVariableCost = async (id: string) => {
        if (!supabase) return;
        setVariableCosts(costs => costs.filter(cost => cost.id !== id));
        await supabase.from('variable_costs').delete().eq('id', id);
    };
    
    const handleInkCostChange = async (id: string, field: keyof Omit<InkCost, 'id'>, value: string | number) => {
        if (!supabase) return;
        const newCosts = inkCosts.map(cost => cost.id === id ? { ...cost, [field]: value } : cost);
        setInkCosts(newCosts);
        await supabase.from('ink_costs').update({ [field]: value }).eq('id', id);
    };

    const handleAddInkCost = async () => {
        if (!supabase) return;
        const { data } = await supabase.from('ink_costs').insert({ name: 'Nova Tinta', cartridge_price: 0, cartridge_yield: 1, user_id: session.user.id }).select().single();
        if (data) setInkCosts(costs => [...costs, data]);
    };
    
    const handleRemoveInkCost = async (id: string) => {
        if (!supabase) return;
        setInkCosts(costs => costs.filter(cost => cost.id !== id));
        await supabase.from('ink_costs').delete().eq('id', id);
    };

    const { hourlyLaborRate } = useMemo(() => {
        const totalHours = laborData.workingDays * laborData.workingHours;
        return { hourlyLaborRate: totalHours > 0 ? laborData.desiredSalary / totalHours : 0 };
    }, [laborData]);

    const { totalHourlyFixedCost, totalMonthlyFixedCost } = useMemo(() => {
        const monthlyTotal = fixedCosts.reduce((acc, cost) => acc + Number(cost.monthlyCost || 0), 0);
        const totalHoursInMonth = (laborData.workingDays * laborData.workingHours) > 0 ? (laborData.workingDays * laborData.workingHours) : (22*8); // Assume 22 days * 8 hours if not set
        return { totalHourlyFixedCost: monthlyTotal / totalHoursInMonth, totalMonthlyFixedCost: monthlyTotal };
    }, [fixedCosts, laborData]);

    const totalVariableCost = useMemo(() => variableCosts.reduce((acc, cost) => acc + ((Number(cost.itemCost) || 0) / (Number(cost.yield) || 1)) * (Number(cost.quantity) || 0), 0), [variableCosts]);
    
    const totalInkCost = useMemo(() => {
        const costPerImpression = inkCosts.reduce((acc, ink) => acc + (Number(ink.cartridgePrice) || 0) / (Number(ink.cartridgeYield) || 1), 0);
        return costPerImpression * (productData.printQuantity || 0);
    }, [inkCosts, productData.printQuantity]);

    const { productLaborCost, productFixedCost, totalBaseCost } = useMemo(() => {
        const pLaborCost = hourlyLaborRate * (productData.timeSpent || 0);
        const pFixedCost = totalHourlyFixedCost * (productData.timeSpent || 0);
        return { productLaborCost: pLaborCost, productFixedCost: pFixedCost, totalBaseCost: pLaborCost + pFixedCost + totalVariableCost + totalInkCost };
    }, [hourlyLaborRate, totalHourlyFixedCost, totalVariableCost, totalInkCost, productData.timeSpent]);
    
    const { suggestedPrice } = useMemo(() => {
        const profit = totalBaseCost * ((productData.desiredProfitMargin || 0) / 100);
        return { suggestedPrice: totalBaseCost + profit };
    }, [totalBaseCost, productData.desiredProfitMargin]);
    
    const roundedSuggestedPrice = useMemo(() => Math.ceil(suggestedPrice), [suggestedPrice]);

    const { finalProfitAmount, finalProfitMargin } = useMemo(() => {
        const priceToUse = Number(manualSellingPrice) > 0 ? Number(manualSellingPrice) : suggestedPrice;
        const profit = priceToUse - totalBaseCost;
        return { finalProfitAmount: profit, finalProfitMargin: totalBaseCost > 0 ? (profit / totalBaseCost) * 100 : 0 };
    }, [manualSellingPrice, suggestedPrice, totalBaseCost]);

    if (loading) return <div className="flex items-center justify-center min-h-screen bg-slate-50"><p className="text-lg text-slate-600">Carregando seus dados...</p></div>;

    return (
        <div className="text-slate-800 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                 <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">Calculadora de Preços</h1>
                        <p className="mt-1 text-base sm:text-lg text-slate-600">Olá, {session.user.email}</p>
                    </div>
                    <button onClick={() => supabase?.auth.signOut()} className="px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-100 hover:bg-indigo-200 rounded-lg transition-colors">Sair</button>
                </header>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                     <div className="lg:col-span-1 space-y-8">
                        <Card title="Passo 1: Mão de Obra" icon={<ClockIcon />}><NumberInput label="Salário Pretendido (Mês)" value={laborData.desiredSalary} onChange={(v) => handleLaborChange('desiredSalary', v)} prefix="R$" /><NumberInput label="Dias Trabalhados (Mês)" value={laborData.workingDays} onChange={(v) => handleLaborChange('workingDays', v)} /><NumberInput label="Horas Trabalhadas (Dia)" value={laborData.workingHours} onChange={(v) => handleLaborChange('workingHours', v)} /><div className="mt-4 p-3 bg-slate-100 rounded-lg text-center"><p className="text-sm font-medium text-slate-500">Valor da sua Hora</p><p className="text-2xl font-bold text-indigo-600">{formatCurrency(hourlyLaborRate)}</p></div></Card>
                        <Card title="Passo 2: Custos Fixos" icon={<CalculatorIcon />}><div className="space-y-3">{fixedCosts.map(cost => (<div key={cost.id} className="flex items-center gap-2"><input type="text" value={cost.name} onChange={(e) => handleFixedCostChange(cost.id, 'name', e.target.value)} className="flex-grow bg-white border border-slate-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm" placeholder="Nome do custo" /><div className="relative"><span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 text-sm">R$</span><input type="number" value={cost.monthlyCost} onChange={(e) => handleFixedCostChange(cost.id, 'monthlyCost', Number(e.target.value))} className="w-32 bg-white border border-slate-300 rounded-md shadow-sm pl-9 pr-3 py-2 text-right focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm" placeholder="0.00" /></div><button onClick={() => handleRemoveFixedCost(cost.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-100 rounded-full transition-colors"><TrashIcon /></button></div>))}</div><button onClick={handleAddFixedCost} className="mt-4 w-full flex items-center justify-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors p-2 rounded-lg hover:bg-indigo-50"><PlusIcon /> Adicionar Custo Fixo</button><div className="mt-4 p-3 bg-slate-100 rounded-lg flex justify-between items-center"><div><p className="text-sm font-medium text-slate-500">Total Mensal</p><p className="text-lg font-bold text-slate-700">{formatCurrency(totalMonthlyFixedCost)}</p></div><div><p className="text-sm font-medium text-slate-500">Custo por Hora</p><p className="text-lg font-bold text-indigo-600">{formatCurrency(totalHourlyFixedCost, 4)}</p></div></div></Card>
                    </div>
                    <div className="lg:col-span-1 space-y-8">
                       <Card title="Passo 3: Custos Variáveis" icon={<ChartBarIcon />}><div className="space-y-4">{variableCosts.map(cost => <CostItemRow key={cost.id} cost={cost} onChange={handleVariableCostChange} onRemove={handleRemoveVariableCost} />)}</div><button onClick={handleAddVariableCost} className="mt-4 w-full flex items-center justify-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors p-2 rounded-lg hover:bg-indigo-50"><PlusIcon /> Adicionar Material</button><div className="mt-4 p-3 bg-slate-100 rounded-lg text-center"><p className="text-sm font-medium text-slate-500">Custo Variável Total</p><p className="text-2xl font-bold text-indigo-600">{formatCurrency(totalVariableCost)}</p></div></Card>
                       <Card title="Passo 4: Custo de Impressão" icon={<PrinterIcon />}><div className="space-y-4">{inkCosts.map(cost => <InkCostRow key={cost.id} cost={cost} onChange={handleInkCostChange} onRemove={handleRemoveInkCost} />)}</div><button onClick={handleAddInkCost} className="mt-4 w-full flex items-center justify-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors p-2 rounded-lg hover:bg-indigo-50"><PlusIcon /> Adicionar Tinta</button><div className="mt-4 p-3 bg-slate-100 rounded-lg text-center"><p className="text-sm font-medium text-slate-500">Custo de Impressão Total</p><p className="text-2xl font-bold text-indigo-600">{formatCurrency(totalInkCost)}</p></div></Card>
                    </div>
                     <div className="lg:col-span-1 space-y-8">
                        <Card title="Passo 5: Dados do Produto" icon={<TagIcon />}><div className="mb-2"><label className="block text-sm font-medium text-slate-700 mb-1">Nome do Produto</label><input type="text" value={productData.name} onChange={(e) => handleProductChange('name', e.target.value)} className="w-full bg-white border border-slate-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Ex: Cartão de Visita" /></div><NumberInput label="Tempo Gasto (Horas)" value={productData.timeSpent} onChange={(v) => handleProductChange('timeSpent', v)} step={0.1} /><NumberInput label="Quantidade de Impressões" value={productData.printQuantity} onChange={(v) => handleProductChange('printQuantity', v)} /><NumberInput label="Margem de Lucro Desejada (%)" value={productData.desiredProfitMargin} onChange={(v) => handleProductChange('desiredProfitMargin', v)} suffix="%" /></Card>
                        <div className="sticky top-8"><Card title="Resultado da Precificação" icon={<PriceIcon />} className="bg-indigo-600 text-white shadow-2xl shadow-indigo-200"><h2 className="text-xl font-bold text-center text-indigo-200 truncate">{productData.name || "Seu Produto"}</h2><div className="my-6 text-center bg-indigo-700/50 p-4 rounded-lg"><p className="text-sm font-medium text-indigo-200">Preço de Venda Sugerido</p><p className="text-4xl font-extrabold tracking-tight text-white py-1">{formatCurrency(suggestedPrice)}</p><p className="text-sm text-indigo-300">Sugestão arredondada: {formatCurrency(roundedSuggestedPrice)}</p></div><div className="space-y-2"><label htmlFor="manualPrice" className="block text-sm font-medium text-indigo-200">Seu Preço de Venda (Opcional)</label><div className="relative"><span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-300">R$</span><input id="manualPrice" type="number" value={manualSellingPrice} onChange={(e) => setManualSellingPrice(e.target.value)} min={0} placeholder={suggestedPrice.toFixed(2)} className="w-full bg-indigo-500/50 border border-indigo-400 rounded-md py-2 pl-10 pr-3 text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-white focus:border-white" /></div></div><div className="space-y-3 text-sm border-t border-indigo-500 pt-6 mt-6"><div className="flex justify-between items-center text-indigo-100"><span>Custo de Mão de Obra</span><span className="font-semibold">{formatCurrency(productLaborCost)}</span></div><div className="flex justify-between items-center text-indigo-100"><span>Custo Fixo (Proporcional)</span><span className="font-semibold">{formatCurrency(productFixedCost, 4)}</span></div><div className="flex justify-between items-center text-indigo-100"><span>Custo Variável (Materiais)</span><span className="font-semibold">{formatCurrency(totalVariableCost)}</span></div><div className="flex justify-between items-center text-indigo-100"><span>Custo de Impressão</span><span className="font-semibold">{formatCurrency(totalInkCost)}</span></div><div className="flex justify-between items-center text-indigo-100 font-bold border-t border-indigo-500 pt-3 mt-3"><span>Custo Total de Produção</span><span>{formatCurrency(totalBaseCost)}</span></div><div className={`p-3 rounded-lg mt-4 ${Number(manualSellingPrice) > 0 ? 'bg-indigo-900' : 'bg-transparent'}`}><div className="flex justify-between items-center text-white font-bold"><span>Lucro ({finalProfitMargin.toFixed(1)}%)</span><span>{formatCurrency(finalProfitAmount)}</span></div>{Number(manualSellingPrice) > 0 && Number(manualSellingPrice) < suggestedPrice && (<p className="text-xs text-yellow-300 mt-1 text-center">Atenção: Seu preço está abaixo do sugerido.</p>)}</div></div></Card></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PricingCalculator;
