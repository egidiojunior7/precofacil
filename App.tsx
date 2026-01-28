
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Auth from './components/Auth';
import PricingCalculator from './components/PricingCalculator';
import type { Session } from '@supabase/supabase-js';

const App: React.FC = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Se o cliente Supabase não estiver configurado, evitamos chamadas de API
        // e a tela de autenticação falhará de forma controlada ao ser usada.
        if (!supabase) {
            console.error("Configuração do Supabase não encontrada. Verifique o arquivo supabaseClient.ts");
            setLoading(false);
            return;
        }

        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setLoading(false);
        };

        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen bg-slate-50"><p className="text-lg text-slate-600">Carregando...</p></div>;
    }

    return (
        <div className="bg-slate-50 min-h-screen">
            {!session ? <Auth /> : <PricingCalculator key={session.user.id} session={session} />}
        </div>
    );
};

export default App;
