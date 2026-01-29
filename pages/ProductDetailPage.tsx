
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { Product, Material, ProductMaterial, OtherProductCost, Profile, FixedCost } from '../types';
import { PlusIcon, TrashIcon } from '../components/Icons';

interface ProductDetailPageProps {
    productId: string;
    onBack: () => void;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ productId, onBack }) => {
    const [product, setProduct] = useState<Product | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([]);
    const [productMaterials, setProductMaterials] = useState<ProductMaterial[]>([]);
    const [otherCosts, setOtherCosts] = useState<OtherProductCost[]>([]);
    const [allMaterials, setAllMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const productReq = supabase.from('products').select('*').eq('id', productId).single();
            const profileReq = supabase.from('profiles').select('*').single();
            const fixedCostsReq = supabase.from('fixed_costs').select('*');
            const productMaterialsReq = supabase.from('product_materials').select('*, materials(*)').eq('product_id', productId);
            const otherCostsReq = supabase.from('other_product_costs').select('*').eq('product_id', productId);
            const allMaterialsReq = supabase.from('materials').select('*');

            const [
                { data: productData, error: productError },
                { data: profileData, error: profileError },
                { data: fixedCostsData, error: fixedCostsError },
                { data: productMaterialsData, error: productMaterialsError },
                { data: otherCostsData, error: otherCostsError },
                { data: allMaterialsData, error: allMaterialsError }
            ] = await Promise.all([productReq, profileReq, fixedCostsReq, productMaterialsReq, otherCostsReq, allMaterialsReq]);

            if (productError || profileError || fixedCostsError || productMaterialsError || otherCostsError || allMaterialsError) {
                console.error({ productError, profileError, fixedCostsError, productMaterialsError, otherCostsError, allMaterialsError });
            } else {
                setProduct(productData);
                setProfile(profileData);
                setFixedCosts(fixedCostsData || []);
                setProductMaterials(productMaterialsData as ProductMaterial[] || []);
                setOtherCosts(otherCostsData || []);
                setAllMaterials(allMaterialsData || []);
            }
            setLoading(false);
        };
        fetchData();
    }, [productId]);

    const calculations = useMemo(() => {
        if (!product || !profile) return null;

        const totalMonthlyFixedCost = fixedCosts.reduce((sum, fc) => sum + fc.monthly_cost, 0);
        const hourlyFixedCost = profile.monthly_hours > 0 ? totalMonthlyFixedCost / profile.monthly_hours : 0;
        const hourlyLaborRate = profile.monthly_hours > 0 ? profile.desired_salary / profile.monthly_hours : 0;

        const productionTimeHours = product.production_time_minutes / 60;
        
        const laborCost = productionTimeHours * hourlyLaborRate;
        const fixedCostForProduct = productionTimeHours * hourlyFixedCost;
        
        const materialsCost = productMaterials.reduce((sum, pm) => {
            const material = pm.materials;
            if (!material || material.yield === 0) return sum;
            const costPerPiece = material.unit_price / material.yield;
            return sum + (costPerPiece * pm.quantity_used);
        }, 0);

        const otherCostsTotal = otherCosts.reduce((sum, oc) => sum + oc.price, 0);

        const totalCost = laborCost + fixedCostForProduct + materialsCost + otherCostsTotal;
        const profitAmount = totalCost * (product.profit_margin_percentage / 100);
        const finalPrice = totalCost + profitAmount;

        return { laborCost, fixedCostForProduct, materialsCost, otherCostsTotal, totalCost, profitAmount, finalPrice };
    }, [product, profile, fixedCosts, productMaterials, otherCosts]);

    const handleProductUpdate = async (field: keyof Product, value: any) => {
        if (!product) return;
        const updatedProduct = { ...product, [field]: value };
        setProduct(updatedProduct);
        await supabase.from('products').update({ [field]: value }).eq('id', productId);
    };

    const handleAddMaterialToProduct = async (materialId: string) => {
        const { data, error } = await supabase
            .from('product_materials')
            .insert({ product_id: productId, material_id: materialId, quantity_used: 1 })
            .select('*, materials(*)')
            .single();
        if (data) setProductMaterials([...productMaterials, data as ProductMaterial]);
    };

    const handleUpdateProductMaterial = async (pmId: string, quantity_used: number) => {
        setProductMaterials(pms => pms.map(pm => pm.id === pmId ? {...pm, quantity_used} : pm));
        await supabase.from('product_materials').update({ quantity_used }).eq('id', pmId);
    };

    const handleRemoveProductMaterial = async (pmId: string) => {
        setProductMaterials(pms => pms.filter(pm => pm.id !== pmId));
        await supabase.from('product_materials').delete().eq('id', pmId);
    };

    const handleAddOtherCost = async () => {
        const { data } = await supabase.from('other_product_costs').insert({ product_id: productId, name: 'Novo Custo', price: 0 }).select().single();
        if (data) setOtherCosts([...otherCosts, data]);
    };
    
    const handleUpdateOtherCost = async (id: string, field: keyof OtherProductCost, value: any) => {
        setOtherCosts(ocs => ocs.map(oc => oc.id === id ? {...oc, [field]: value} : oc));
        await supabase.from('other_product_costs').update({ [field]: value }).eq('id', id);
    };

    const handleRemoveOtherCost = async (id: string) => {
        setOtherCosts(ocs => ocs.filter(oc => oc.id !== id));
        await supabase.from('other_product_costs').delete().eq('id', id);
    };

    const handleDeleteProduct = async () => {
        if(window.confirm(`Tem certeza que deseja apagar o produto "${product?.name}"?`)) {
            await supabase.from('products').delete().eq('id', productId);
            onBack();
        }
    };
    
    if (loading) return <p>Carregando detalhes do produto...</p>;
    if (!product || !calculations) return <p>Produto não encontrado.</p>;

    const availableMaterials = allMaterials.filter(m => !productMaterials.some(pm => pm.material_id === m.id));

    return (
        <div className="space-y-6">
            <button onClick={onBack} className="text-sm font-semibold text-indigo-600 hover:underline">&larr; Voltar para todos os produtos</button>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-6">
                    {/* Detalhes do Produto */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-4">
                        <input value={product.name} onChange={e => handleProductUpdate('name', e.target.value)} className="text-2xl font-bold text-slate-900 w-full p-1 -m-1 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-500">Tempo de Produção (minutos)</label>
                                <input type="number" value={product.production_time_minutes} onChange={e => handleProductUpdate('production_time_minutes', Number(e.target.value))} className="mt-1 w-full border-slate-300 rounded-md shadow-sm"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-500">Margem de Lucro (%)</label>
                                <input type="number" value={product.profit_margin_percentage} onChange={e => handleProductUpdate('profit_margin_percentage', Number(e.target.value))} className="mt-1 w-full border-slate-300 rounded-md shadow-sm"/>
                            </div>
                        </div>
                    </div>
                    {/* Materiais Usados */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                        <h3 className="font-semibold text-slate-800 mb-4">Materiais Utilizados</h3>
                        <div className="space-y-2 mb-4">
                            {productMaterials.map(pm => (
                                <div key={pm.id} className="flex items-center gap-2">
                                    <span className="flex-grow">{pm.materials.name}</span>
                                    <input type="number" value={pm.quantity_used} onChange={e => handleUpdateProductMaterial(pm.id, Number(e.target.value))} className="w-20 text-right border-slate-300 rounded-md shadow-sm text-sm"/>
                                    <button onClick={() => handleRemoveProductMaterial(pm.id)} className="p-1 text-slate-400 hover:text-red-500"><TrashIcon /></button>
                                </div>
                            ))}
                        </div>
                         {availableMaterials.length > 0 && (
                            <div className="flex gap-2">
                                <select onChange={e => handleAddMaterialToProduct(e.target.value)} className="flex-grow border-slate-300 rounded-md shadow-sm text-sm">
                                    <option>Adicionar material existente...</option>
                                    {availableMaterials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                </select>
                            </div>
                         )}
                    </div>
                    {/* Outros Gastos */}
                     <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                        <h3 className="font-semibold text-slate-800 mb-4">Outros Gastos</h3>
                        <div className="space-y-2 mb-4">
                            {otherCosts.map(oc => (
                                <div key={oc.id} className="flex items-center gap-2">
                                    <input value={oc.name} onChange={e => handleUpdateOtherCost(oc.id, 'name', e.target.value)} className="flex-grow border-slate-300 rounded-md shadow-sm text-sm"/>
                                    <input type="number" value={oc.price} onChange={e => handleUpdateOtherCost(oc.id, 'price', Number(e.target.value))} className="w-24 text-right border-slate-300 rounded-md shadow-sm text-sm"/>
                                    <button onClick={() => handleRemoveOtherCost(oc.id)} className="p-1 text-slate-400 hover:text-red-500"><TrashIcon /></button>
                                </div>
                            ))}
                        </div>
                        <button onClick={handleAddOtherCost} className="text-sm font-semibold text-indigo-600 hover:underline"><PlusIcon className="inline h-4 w-4"/> Adicionar Outro Gasto</button>
                    </div>
                </div>

                {/* Resumo do Preço */}
                <div className="lg:col-span-1 sticky top-6">
                     <div className="bg-indigo-600 text-white p-6 rounded-lg shadow-lg shadow-indigo-500/30 space-y-4">
                        <h2 className="text-2xl font-bold text-center">Preço Final de Venda</h2>
                        <p className="text-5xl font-extrabold text-center tracking-tight">{formatCurrency(calculations.finalPrice)}</p>
                        
                        <div className="border-t border-indigo-500 pt-4 space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-indigo-200">Custos com Materiais</span> <span>{formatCurrency(calculations.materialsCost)}</span></div>
                            <div className="flex justify-between"><span className="text-indigo-200">Custo Mão de Obra</span> <span>{formatCurrency(calculations.laborCost)}</span></div>
                            <div className="flex justify-between"><span className="text-indigo-200">Custo Fixo (proporcional)</span> <span>{formatCurrency(calculations.fixedCostForProduct)}</span></div>
                            <div className="flex justify-between"><span className="text-indigo-200">Outros Gastos</span> <span>{formatCurrency(calculations.otherCostsTotal)}</span></div>
                            <div className="flex justify-between font-bold border-t border-indigo-500 pt-2 mt-2"><span className="text-indigo-100">Custo Total</span> <span>{formatCurrency(calculations.totalCost)}</span></div>
                            <div className="flex justify-between font-bold"><span className="text-indigo-100">Lucro ({product.profit_margin_percentage}%)</span> <span>{formatCurrency(calculations.profitAmount)}</span></div>
                        </div>
                    </div>
                    <button onClick={handleDeleteProduct} className="w-full mt-4 text-sm text-red-600 hover:underline">Apagar Produto</button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
