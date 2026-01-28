
import React, { ReactNode } from 'react';

interface CardProps {
    title: string;
    icon: ReactNode;
    children: ReactNode;
    className?: string;
}

export const Card: React.FC<CardProps> = ({ title, icon, children, className = '' }) => {
    return (
        <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>
            <div className="flex items-center mb-4">
                <div className={`mr-3 ${className.includes('text-white') ? 'text-white' : 'text-indigo-600'}`}>
                    {icon}
                </div>
                <h2 className={`text-xl font-bold ${className.includes('text-white') ? 'text-white' : 'text-slate-800'}`}>{title}</h2>
            </div>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );
};
