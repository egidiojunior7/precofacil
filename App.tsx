
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Auth from './components/Auth';
import Layout from './components/Layout';
import { ConfigurationWarning } from './components/ConfigurationWarning';
import type { Session } from '@supabase/supabase-js';

const App: React.FC = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    if (!supabase) {
        return <ConfigurationWarning />;
    }

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <p className="text-lg text-slate-600">Carregando...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {!session ? <Auth /> : <Layout session={session} />}
        </div>
    );
};

export default App;
