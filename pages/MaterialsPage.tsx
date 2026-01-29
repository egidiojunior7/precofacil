
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Material } from '../types';
import { PlusIcon, TrashIcon } from '../components/Icons';

const MaterialsPage: React.FC = () => {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState<string | null>(null);

    useEffect(() => {
        const fetchMaterials = async () => {
            setLoading(true);
            const { data, error } = await supabase.from('materials').select('*').order('name');
            if (error) {
                console.error('Error fetching materials:', error);
            } else if (data) {
                setMaterials(data);
            }
            setLoading(false);
        };
        fetchMaterials();
    }, []);

    const handleAddMaterial = async () => {
        const { data, error } = await supabase
            .from('materials')
            .insert({ name: 'Novo Material', unit_price: 0, yield: 1 })
            .select()
            .single();

        if (error) {
            console.error('Error adding material:', error);
        } else if (data) {
            setMaterials([...materials, data]);
        }
    };

    const handleRemoveMaterial = async (id: string) => {
        const { error } = await supabase.from('materials').delete().eq('id', id);
        if (error) {
            console.error('Error removing material:', error);
        } else {
            setMaterials(materials.filter((m) => m.id !== id));
        }
    };

    const handleUpdateMaterial = async (id: string, field: keyof Material, value: any) => {
        const optimisticMaterials = materials.map((m) => (m.id === id ? { ...m, [field]: value } : m));
        setMaterials(optimisticMaterials);
        
        setIsSaving(id);
        const { error } = await supabase.from('materials').update({ [field]: value }).eq('id', id);
        if (error) {
            console.error('Error updating material:', error);
            // Revert optimistic update on error
            // (for simplicity, we'll just refetch or ignore for now)
        }
        setIsSaving(null);
    };

    if (loading) return <p>Carregando materiais...</p>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Seu Inventário de Materiais</h1>
                    <p className="mt-1 text-sm text-slate-600">Cadastre aqui todos os materiais que você utiliza em seus produtos.</p>
                </div>
                <button
                    onClick={handleAddMaterial}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
                >
                    <PlusIcon /> Adicionar Material
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Nome do Material</th>
                            <th scope="col" className="px-6 py-3">Valor Unitário (R$)</th>
                            <th scope="col" className="px-6 py-3">Rendimento (em peças)</th>
                            <th scope="col" className="px-6 py-3 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {materials.map((material) => (
                            <tr key={material.id} className="bg-white border-b hover:bg-slate-50">
                                <td className="px-6 py-4">
                                    <input
                                        type="text"
                                        value={material.name}
                                        onChange={(e) => handleUpdateMaterial(material.id, 'name', e.target.value)}
                                        className="w-full bg-transparent focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded px-1 -mx-1"
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={material.unit_price}
                                        onChange={(e) => handleUpdateMaterial(material.id, 'unit_price', Number(e.target.value))}
                                        className="w-28 text-right bg-transparent focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded px-1"
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <input
                                        type="number"
                                        step="1"
                                        min="1"
                                        value={material.yield}
                                        onChange={(e) => handleUpdateMaterial(material.id, 'yield', Number(e.target.value))}
                                        className="w-24 text-right bg-transparent focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded px-1"
                                    />
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleRemoveMaterial(material.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-100 rounded-full transition-colors">
                                        <TrashIcon />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {materials.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-slate-500">Nenhum material cadastrado ainda.</p>
                        <p className="text-sm text-slate-400 mt-1">Clique em "Adicionar Material" para começar.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MaterialsPage;
