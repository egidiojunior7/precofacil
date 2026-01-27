
import React from 'react';
import { VariableCost } from '../types';
import { TrashIcon } from './Icons';

interface CostItemRowProps {
    cost: VariableCost;
    onChange: (id: string, field: keyof Omit<VariableCost, 'id'>, value: string | number) => void;
    onRemove: (id: string) => void;
}

export const CostItemRow: React.FC<CostItemRowProps> = ({ cost, onChange, onRemove }) => {
    
    const unitCost = (cost.itemCost > 0 && cost.yield > 0) ? cost.itemCost / cost.yield : 0;
    const totalCost = unitCost * cost.quantity;

    const formatCurrency = (value: number) => {
        if (isNaN(value) || !isFinite(value)) return "R$ 0,00";
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 4 }).format(value);
    };

    return (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex justify-between items-start">
                <input
                    type="text"
                    value={cost.name}
                    onChange={(e) => onChange(cost.id, 'name', e.target.value)}
                    className="font-semibold text-slate-800 bg-transparent focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 rounded px-1 -ml-1 w-full"
                    placeholder="Nome do Material"
                />
                 <button onClick={() => onRemove(cost.id)} className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-100 rounded-full transition-colors ml-2 flex-shrink-0">
                    <TrashIcon />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 text-sm">
                <div>
                    <label className="block text-xs font-medium text-slate-500">Custo Pacote/Kit</label>
                    <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2 text-slate-400">R$</span>
                        <input
                            type="number"
                            value={cost.itemCost}
                            onChange={(e) => onChange(cost.id, 'itemCost', Number(e.target.value))}
                            className="w-full bg-white border border-slate-300 rounded-md py-1 pl-7 pr-2 text-right text-sm"
                        />
                    </div>
                </div>
                 <div>
                    <label className="block text-xs font-medium text-slate-500">Rendimento</label>
                    <input
                        type="number"
                        value={cost.yield}
                        onChange={(e) => onChange(cost.id, 'yield', Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-md py-1 px-2 text-right text-sm"
                    />
                </div>
                 <div>
                    <label className="block text-xs font-medium text-slate-500">Qtd. Usada</label>
                    <input
                        type="number"
                        value={cost.quantity}
                        onChange={(e) => onChange(cost.id, 'quantity', Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-md py-1 px-2 text-right text-sm"
                    />
                </div>
                 <div>
                    <label className="block text-xs font-medium text-slate-500">Unidade</label>
                    <input
                        type="text"
                        value={cost.unitName}
                        onChange={(e) => onChange(cost.id, 'unitName', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-md py-1 px-2 text-sm"
                        placeholder="Ex: folhas"
                    />
                </div>
            </div>
            <div className="mt-2 text-xs text-slate-500 text-right">
                Custo/Unid: {formatCurrency(unitCost)}
            </div>
        </div>
    );
};
