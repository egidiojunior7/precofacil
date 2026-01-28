
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { PriceIcon } from './Icons';

const Auth: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleAuth = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                setMessage('Cadastro realizado! Por favor, verifique seu e-mail para confirmar a conta.');
            }
        } catch (error: any) {
            setError(error.error_description || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
            <div className="w-full max-w-md">
                 <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center bg-indigo-600 p-3 rounded-full mb-4">
                      <PriceIcon />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">Calculadora de Preços</h1>
                    <p className="mt-2 text-slate-600">Acesse sua conta para começar.</p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-semibold text-center text-slate-800 mb-6">{isLogin ? 'Login' : 'Cadastro'}</h2>
                    <form onSubmit={handleAuth} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">E-mail</label>
                            <input
                                id="email"
                                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="password"className="block text-sm font-medium text-slate-700">Senha</label>
                            <input
                                id="password"
                                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                type="password"
                                placeholder="Sua senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Cadastrar')}
                            </button>
                        </div>
                        {error && <p className="text-sm text-red-600 text-center bg-red-50 p-3 rounded-md">{error}</p>}
                        {message && <p className="text-sm text-green-600 text-center bg-green-50 p-3 rounded-md">{message}</p>}
                    </form>
                    <p className="mt-6 text-center text-sm text-slate-500">
                        {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError(null);
                                setMessage(null);
                            }}
                            className="ml-1 font-semibold text-indigo-600 hover:text-indigo-500"
                        >
                            {isLogin ? 'Cadastre-se' : 'Faça login'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Auth;
