
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Profile, FixedCost } from '../types';
import { PlusIcon, TrashIcon } from '../components/Icons';

const SettingsPage: React.FC = () => {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const profileReq = supabase.from('profiles').select('*').single();
            const fixedCostsReq = supabase.from('fixed_costs').select('*').order('name');
            
            const [{ data: profileData, error: profileError }, { data: fixedCostsData, error: fixedCostsError }] = await Promise.all([profileReq, fixedCostsReq]);

            if (profileError || fixedCostsError) {
                console.error({ profileError, fixedCostsError });
            } else {
                setProfile(profileData);
                setFixedCosts(fixedCostsData || []);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const handleProfileUpdate = async (field: keyof Profile, value: any) => {
        if (!profile) return;
        const updatedProfile = { ...profile, [field]: value };
        setProfile(updatedProfile);
        await supabase.from('profiles').update({ [field]: value }).eq('id', profile.id);
    };

    const handleAddFixedCost = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.error("User not found.");
            return;
        }

        const { data, error } = await supabase
            .from('fixed_costs')
            .insert({ name: 'Novo Custo Fixo', monthly_cost: 0, user_id: user.id })
            .select()
            .single();

        if (error) {
            console.error('Error adding fixed cost:', error);
        } else if (data) {
            setFixedCosts([...fixedCosts, data]);
        }
    };

    const handleUpdateFixedCost = async (id: string, field: keyof FixedCost, value: any) => {
        setFixedCosts(fcs => fcs.map(fc => fc.id === id ? { ...fc, [field]: value } : fc));
        await supabase.from('fixed_costs').update({ [field]: value }).eq('id', id);
    };

    const handleRemoveFixedCost = async (id: string) => {
        setFixedCosts(fcs => fcs.filter(fc => fc.id !== id));
        await supabase.from('fixed_costs').delete().eq('id', id);
    };

    if (loading) return <p>Carregando configurações...</p>;
    if (!profile) return <p>Não foi possível carregar o perfil do usuário.</p>;

    const totalMonthlyFixedCost = fixedCosts.reduce((sum, fc) => sum + Number(fc.monthly_cost), 0);

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Configurações Gerais</h1>
                <p className="mt-1 text-sm text-slate-600">Ajuste seus dados base para que os cálculos de todos os produtos sejam precisos.</p>
            </div>

            {/* Mão de Obra */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <h2 className="text-lg font-semibold text-slate-800">Mão de Obra</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Salário Mensal Desejado (R$)</label>
                        <input
                            type="number"
                            value={profile.desired_salary}
                            onChange={(e) => handleProfileUpdate('desired_salary', Number(e.target.value))}
                            className="mt-1 w-full border-slate-300 rounded-md shadow-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Horas Trabalhadas por Mês</label>
                        <input
                            type="number"
                            value={profile.monthly_hours}
                            onChange={(e) => handleProfileUpdate('monthly_hours', Number(e.target.value))}
                            className="mt-1 w-full border-slate-300 rounded-md shadow-sm"
                        />
                    </div>
                </div>
                <div className="mt-4 p-3 bg-slate-100 rounded-lg text-center">
                    <p className="text-sm font-medium text-slate-500">Valor Calculado da sua Hora</p>
                    <p className="text-2xl font-bold text-indigo-600">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                            profile.monthly_hours > 0 ? profile.desired_salary / profile.monthly_hours : 0
                        )}
                    </p>
                </div>
            </div>

            {/* Custos Fixos */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <h2 className="text-lg font-semibold text-slate-800">Custos Fixos Mensais</h2>
                <div className="space-y-3 mt-4">
                    {fixedCosts.map(cost => (
                        <div key={cost.id} className="flex items-center gap-3">
                            <input
                                type="text"
                                value={cost.name}
                                onChange={e => setFixedCosts(fcs => fcs.map(fc => fc.id === cost.id ? {...fc, name: e.target.value} : fc))}
                                onBlur={(e) => handleUpdateFixedCost(cost.id, 'name', e.target.value)}
                                className="flex-grow border-slate-300 rounded-md shadow-sm text-sm"
                                placeholder="Nome do custo (ex: Aluguel)"
                            />
                            <input
                                type="number"
                                value={cost.monthly_cost}
                                onChange={e => setFixedCosts(fcs => fcs.map(fc => fc.id === cost.id ? {...fc, monthly_cost: Number(e.target.value)} : fc))}
                                onBlur={(e) => handleUpdateFixedCost(cost.id, 'monthly_cost', Number(e.target.value))}
                                className="w-32 text-right border-slate-300 rounded-md shadow-sm text-sm"
                            />
                            <button onClick={() => handleRemoveFixedCost(cost.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-100 rounded-full transition-colors">
                                <TrashIcon />
                            </button>
                        </div>
                    ))}
                </div>
                <button onClick={handleAddFixedCost} className="mt-4 text-sm font-semibold text-indigo-600 hover:underline">
                    <PlusIcon className="inline h-4 w-4 mr-1" /> Adicionar Custo Fixo
                </button>
                <div className="mt-4 p-3 bg-slate-100 rounded-lg flex justify-between items-center">
                    <span className="font-semibold text-slate-700">Total Mensal Fixo:</span>
                    <span className="text-xl font-bold text-indigo-600">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalMonthlyFixedCost)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
