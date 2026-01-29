
import React from 'react';

export const ConfigurationWarning: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
            <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-lg border-2 border-red-200 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Configuração Incompleta</h1>
                <p className="mt-2 text-slate-600">
                    A aplicação não se conectou ao banco de dados porque as credenciais do Supabase não foram configuradas.
                </p>
                <div className="mt-6 text-left bg-slate-50 p-4 rounded-md border border-slate-200">
                    <h2 className="font-semibold text-slate-800">Ação Necessária:</h2>
                    <ol className="list-decimal list-inside mt-2 text-sm text-slate-700 space-y-2">
                        <li>Abra o arquivo <code className="bg-slate-200 text-slate-800 px-1 py-0.5 rounded font-mono text-xs">supabaseClient.ts</code>.</li>
                        <li>Substitua os valores de <code className="bg-slate-200 text-slate-800 px-1 py-0.5 rounded font-mono text-xs">supabaseUrl</code> e <code className="bg-slate-200 text-slate-800 px-1 py-0.5 rounded font-mono text-xs">supabaseAnonKey</code> pelas suas credenciais reais do Supabase.</li>
                        <li>Execute o script de SQL do arquivo <code className="bg-slate-200 text-slate-800 px-1 py-0.5 rounded font-mono text-xs">database.sql</code> no SQL Editor do seu projeto Supabase.</li>
                    </ol>
                </div>
                 <div className="mt-4 text-sm text-slate-500">
                    Após salvar a alteração no código, a página será recarregada.
                 </div>
            </div>
        </div>
    );
};
