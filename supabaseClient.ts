
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// -----------------------------------------------------------------------------
// INSTRUÇÕES IMPORTANTES:
// 1. Vá para o painel do seu projeto no Supabase.
// 2. Encontre sua URL e sua chave "anon" em "Project Settings" > "API".
// 3. Substitua os textos 'COLOQUE_SUA_URL_AQUI' e 'COLOQUE_SUA_CHAVE_ANON_AQUI' abaixo.
// -----------------------------------------------------------------------------
const supabaseUrl = 'COLOQUE_SUA_URL_AQUI';
const supabaseAnonKey = 'COLOQUE_SUA_CHAVE_ANON_AQUI';

/**
 * Cria e retorna uma instância do cliente Supabase, ou null se não configurado.
 * Esta abordagem garante que a inicialização seja explícita e segura.
 */
const createSupabaseClient = (): SupabaseClient | null => {
  // Verifica se as credenciais foram realmente alteradas dos valores padrão.
  const isConfigured = 
    supabaseUrl && supabaseUrl !== 'COLOQUE_SUA_URL_AQUI' &&
    supabaseAnonKey && supabaseAnonKey !== 'COLOQUE_SUA_CHAVE_ANON_AQUI';

  if (!isConfigured) {
    // Se não estiver configurado, a aplicação mostrará um aviso em vez de quebrar.
    return null;
  }

  try {
    // Se configurado, cria e retorna o cliente.
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error("Erro ao inicializar o cliente Supabase:", error);
    // Em caso de erro na criação (ex: URL mal formada), retorna null.
    return null;
  }
};

// Exporta a instância única do cliente, que será ou o cliente funcional ou null.
export const supabase = createSupabaseClient();
