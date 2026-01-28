
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// -----------------------------------------------------------------------------
// INSTRUÇÕES IMPORTANTES:
// 1. Vá para o painel do seu projeto no Supabase.
// 2. Encontre sua URL e sua chave "anon" em "Project Settings" > "API".
// 3. Substitua os textos 'COLOQUE_SUA_URL_AQUI' e 'COLOQUE_SUA_CHAVE_ANON_AQUI' abaixo.
// -----------------------------------------------------------------------------
const supabaseUrl = 'COLOQUE_SUA_URL_AQUI';
const supabaseAnonKey = 'COLOQUE_SUA_CHAVE_ANON_AQUI';

let supabase: SupabaseClient | null = null;

// Esta verificação garante que a aplicação não quebre se as credenciais
// não forem inseridas. Em vez disso, a tela principal mostrará um aviso.
if (supabaseUrl !== 'COLOQUE_SUA_URL_AQUI' && supabaseAnonKey !== 'COLOQUE_SUA_CHAVE_ANON_AQUI') {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };
