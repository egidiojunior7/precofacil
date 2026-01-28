
import React, { ReactNode } from 'react';

interface CardProps {
    title: string;
    icon: ReactNode;
    children: ReactNode;
    className?: string;
}

export const Card: React.FC<CardProps> = ({ title, icon, children, className = '' }) => {
    const isSpecialCard = className.includes('bg-indigo-600');
    
    return (
        <div className={`bg-white rounded-lg shadow-sm border border-slate-200 ${className}`}>
            <div className="p-6">
                <div className="flex items-center mb-4">
                    <div className={`flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg mr-4 ${isSpecialCard ? 'bg-white/20 text-white' : 'text-indigo-600 bg-indigo-100'}`}>
                        {icon}
                    </div>
                    <h2 className={`text-lg font-semibold ${isSpecialCard ? 'text-white' : 'text-slate-900'}`}>{title}</h2>
                </div>
                <div className="space-y-4">
                    {children}
                </div>
            </div>
        </div>
    );
};
