
import { createClient } from '@supabase/supabase-js';

// -----------------------------------------------------------------------------
// IMPORTANTE: Substitua os valores abaixo pela sua URL e Chave "anon" do Supabase.
// Você pode encontrar esses valores no painel do seu projeto no Supabase,
// em "Project Settings" > "API".
// -----------------------------------------------------------------------------
const supabaseUrl = 'COLOQUE_SUA_SUPABASE_URL_AQUI';
const supabaseAnonKey = 'COLOQUE_SUA_SUPABASE_ANON_KEY_AQUI';


// Verifica se os valores de placeholder foram substituídos.
// Uma URL válida do Supabase sempre começará com 'http'.
const isConfigured = supabaseUrl.startsWith('http');

// Exporta o cliente Supabase apenas se as credenciais estiverem configuradas.
// Caso contrário, exporta null para que a UI possa mostrar um aviso na tela.
export const supabase = isConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;