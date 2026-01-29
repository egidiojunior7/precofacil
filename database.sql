-- -----------------------------------------------------------------------------
-- SCRIPT DE CONFIGURAÇÃO DO BANCO DE DADOS (V3) - PRECIFY MULTIUSUÁRIO
-- -----------------------------------------------------------------------------
-- Instruções:
-- 1. APAGUE AS TABELAS ANTIGAS NO "Table Editor" DO SUPABASE ANTES DE EXECUTAR.
-- 2. Vá para o seu projeto no Supabase > "SQL Editor".
-- 3. Clique em "+ New query".
-- 4. Copie TODO o conteúdo deste arquivo e cole no editor.
-- 5. Clique em "RUN".
-- -----------------------------------------------------------------------------

-- Tabela de Perfil do Usuário: Armazena configurações globais como salário.
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  desired_salary NUMERIC NOT NULL DEFAULT 1500,
  monthly_hours INTEGER NOT NULL DEFAULT 160
);
-- Habilita RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- Política: Usuários podem ver e editar apenas o seu próprio perfil.
CREATE POLICY "Users can manage their own profile"
ON public.profiles FOR ALL
USING (auth.uid() = id);
-- Função para criar um perfil automaticamente quando um novo usuário se cadastra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, desired_salary, monthly_hours)
  VALUES (new.id, 1500, 160);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Trigger que chama a função acima no cadastro de um novo usuário.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Tabela de Custos Fixos
CREATE TABLE public.fixed_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  monthly_cost NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Habilita RLS
ALTER TABLE public.fixed_costs ENABLE ROW LEVEL SECURITY;
-- Política: Usuários podem gerenciar apenas os seus custos fixos.
CREATE POLICY "Users can manage their own fixed costs"
ON public.fixed_costs FOR ALL
USING (auth.uid() = user_id);

-- Tabela de Materiais (Custos Variáveis)
CREATE TABLE public.materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  unit_price NUMERIC NOT NULL, -- Valor do material (ex: R$ 10,00 por folha)
  yield NUMERIC NOT NULL DEFAULT 1, -- Quantas peças este material rende (ex: 1 folha faz 4 caixas)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Habilita RLS
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
-- Política: Usuários podem gerenciar apenas os seus materiais.
CREATE POLICY "Users can manage their own materials"
ON public.materials FOR ALL
USING (auth.uid() = user_id);

-- Tabela de Produtos
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  production_time_minutes INTEGER NOT NULL,
  profit_margin_percentage NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Habilita RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
-- Política: Usuários podem gerenciar apenas os seus produtos.
CREATE POLICY "Users can manage their own products"
ON public.products FOR ALL
USING (auth.uid() = user_id);

-- Tabela de Junção: Materiais usados em um Produto
CREATE TABLE public.product_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  quantity_used NUMERIC NOT NULL -- Quantidade do material usada neste produto específico
);
-- Habilita RLS
ALTER TABLE public.product_materials ENABLE ROW LEVEL SECURITY;
-- Política: Usuários podem gerenciar os materiais dos seus próprios produtos.
CREATE POLICY "Users can manage materials on their own products"
ON public.product_materials FOR ALL
USING (auth.uid() = (SELECT user_id FROM products WHERE id = product_id));

-- Tabela de Outros Custos por Produto
CREATE TABLE public.other_product_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL
);
-- Habilita RLS
ALTER TABLE public.other_product_costs ENABLE ROW LEVEL SECURITY;
-- Política: Usuários podem gerenciar outros custos dos seus próprios produtos.
CREATE POLICY "Users can manage other costs on their own products"
ON public.other_product_costs FOR ALL
USING (auth.uid() = (SELECT user_id FROM products WHERE id = product_id));
