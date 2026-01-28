
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Auth from './components/Auth';
import PricingCalculator from './components/PricingCalculator';
import { ConfigurationWarning } from './components/ConfigurationWarning';
import type { Session } from '@supabase/supabase-js';

const App: React.FC = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    // Esta verificação é o ponto central de segurança.
    // Se o cliente Supabase não pôde ser inicializado, a aplicação para aqui.
    if (!supabase) {
        return <ConfigurationWarning />;
    }

    useEffect(() => {
        // Este efeito só roda se a verificação acima passar, garantindo que 'supabase' não é nulo.
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

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
