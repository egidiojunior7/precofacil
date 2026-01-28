
-- -----------------------------------------------------------------------------
-- SCRIPT DE CONFIGURAÇÃO DO BANCO DE DADOS (V2) - CALCULADORA DE PREÇOS
-- -----------------------------------------------------------------------------
-- Instruções:
-- 1. CERTIFIQUE-SE DE TER APAGADO AS TABELAS ANTIGAS NO "TABLE EDITOR" PRIMEIRO.
-- 2. Vá para o seu projeto no Supabase.
-- 3. No menu lateral, clique em "SQL Editor".
-- 4. Clique em "+ New query".
-- 5. Copie TODO o conteúdo deste arquivo e cole no editor.
-- 6. Clique em "RUN".
-- -----------------------------------------------------------------------------

-- Tabela para armazenar dados de Mão de Obra de cada usuário
CREATE TABLE public.labor_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    desired_salary NUMERIC DEFAULT 1500 NOT NULL,
    working_days INTEGER DEFAULT 20 NOT NULL,
    working_hours INTEGER DEFAULT 8 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Habilita Row Level Security para a tabela labor_data
ALTER TABLE public.labor_data ENABLE ROW LEVEL SECURITY;

-- Política de segurança: Permite que usuários gerenciem apenas seus próprios dados de mão de obra
CREATE POLICY "Allow users to manage their own labor data"
ON public.labor_data
FOR ALL
USING (auth.uid() = user_id);


-- Tabela para armazenar dados do Produto sendo calculado por cada usuário
CREATE TABLE public.product_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT DEFAULT 'Meu Produto'::text NOT NULL,
    time_spent NUMERIC DEFAULT 0 NOT NULL,
    print_quantity INTEGER DEFAULT 0 NOT NULL,
    desired_profit_margin NUMERIC DEFAULT 50 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Habilita Row Level Security para a tabela product_data
ALTER TABLE public.product_data ENABLE ROW LEVEL SECURITY;

-- Política de segurança: Permite que usuários gerenciem apenas seus próprios dados de produto
CREATE POLICY "Allow users to manage their own product data"
ON public.product_data
FOR ALL
USING (auth.uid() = user_id);


-- Tabela para armazenar Custos Fixos de cada usuário
CREATE TABLE public.fixed_costs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    monthly_cost NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Habilita Row Level Security para a tabela fixed_costs
ALTER TABLE public.fixed_costs ENABLE ROW LEVEL SECURITY;

-- Política de segurança: Permite que usuários gerenciem apenas seus próprios custos fixos
CREATE POLICY "Allow users to manage their own fixed costs"
ON public.fixed_costs
FOR ALL
USING (auth.uid() = user_id);


-- Tabela para armazenar Custos Variáveis (Materiais) de cada usuário
CREATE TABLE public.variable_costs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    item_cost NUMERIC NOT NULL,
    yield NUMERIC NOT NULL,
    quantity NUMERIC NOT NULL,
    unit_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Habilita Row Level Security para a tabela variable_costs
ALTER TABLE public.variable_costs ENABLE ROW LEVEL SECURITY;

-- Política de segurança: Permite que usuários gerenciem apenas seus próprios custos variáveis
CREATE POLICY "Allow users to manage their own variable costs"
ON public.variable_costs
FOR ALL
USING (auth.uid() = user_id);


-- Tabela para armazenar Custos de Tinta/Impressão de cada usuário
CREATE TABLE public.ink_costs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    cartridge_price NUMERIC NOT NULL,
    cartridge_yield NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Habilita Row Level Security para a tabela ink_costs
ALTER TABLE public.ink_costs ENABLE ROW LEVEL SECURITY;

-- Política de segurança: Permite que usuários gerenciem apenas seus próprios custos de tinta
CREATE POLICY "Allow users to manage their own ink costs"
ON public.ink_costs
FOR ALL
USING (auth.uid() = user_id);
