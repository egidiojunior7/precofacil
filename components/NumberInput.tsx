
import React from 'react';

interface NumberInputProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    prefix?: string;
    suffix?: string;
    min?: number;
    step?: number;
}

export const NumberInput: React.FC<NumberInputProps> = ({ label, value, onChange, prefix, suffix, min = 0, step = 1 }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const numValue = e.target.valueAsNumber;
        if (!isNaN(numValue)) {
            onChange(numValue);
        } else if (e.target.value === '') {
            onChange(0);
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
            <div className="relative rounded-md shadow-sm">
                {prefix && (
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                        {prefix}
                    </span>
                )}
                <input
                    type="number"
                    value={value}
                    onChange={handleChange}
                    min={min}
                    step={step}
                    className={`w-full bg-white border border-slate-300 rounded-md py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${prefix ? 'pl-10' : 'pl-3'} ${suffix ? 'pr-10' : 'pr-3'}`}
                />
                {suffix && (
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500">
                        {suffix}
                    </span>
                )}
            </div>
        </div>
    );
};
