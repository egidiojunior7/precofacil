
import { createClient } from '@supabase/supabase-js';

// -----------------------------------------------------------------------------
// IMPORTANTE: Substitua os valores abaixo pela sua URL e Chave "anon" do Supabase.
// Você pode encontrar esses valores no painel do seu projeto no Supabase,
// em "Project Settings" > "API".
// -----------------------------------------------------------------------------
const supabaseUrl = 'https://nbbavwsfesidygmvdqwa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5iYmF2d3NmZXNpZHlnbXZkcXdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MzMyNDAsImV4cCI6MjA4NTAwOTI0MH0.UC4WK_uM_I1z-f2raUgF5lXF7PgSiq1iKDj6GXDdIxU';


// Verifica se os valores de placeholder foram substituídos.
// Uma URL válida do Supabase sempre começará com 'http'.
const isConfigured = supabaseUrl.startsWith('http');

// Exporta o cliente Supabase apenas se as credenciais estiverem configuradas.
// Caso contrário, exporta null para que a UI possa mostrar um aviso na tela.
export const supabase = isConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;
