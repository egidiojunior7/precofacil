
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Product } from '../types';
import { PlusIcon } from '../components/Icons';
import ProductDetailPage from './ProductDetailPage';

const ProductsPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

    useEffect(() => {
        if (!selectedProductId) {
            fetchProducts();
        }
    }, [selectedProductId]);

    const fetchProducts = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('products').select('*').order('name');
        if (error) {
            console.error('Error fetching products:', error);
        } else if (data) {
            setProducts(data);
        }
        setLoading(false);
    };

    const handleAddNewProduct = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.error("User not found.");
            alert("Sessão de usuário não encontrada. Por favor, faça login novamente.");
            return;
        }

        const { data, error } = await supabase
            .from('products')
            .insert({
                name: 'Novo Produto',
                production_time_minutes: 30,
                profit_margin_percentage: 100,
                user_id: user.id,
            })
            .select()
            .single();

        if (error) {
            console.error('Error adding product:', error);
            alert('Falha ao adicionar produto. Erro: ' + error.message);
        } else if (data) {
            setProducts([...products, data]);
            setSelectedProductId(data.id);
        }
    };
    
    if (selectedProductId) {
        return <ProductDetailPage productId={selectedProductId} onBack={() => {
            setSelectedProductId(null);
        }} />;
    }

    if (loading) return <p>Carregando produtos...</p>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Seus Produtos</h1>
                    <p className="mt-1 text-sm text-slate-600">Gerencie e calcule o preço de cada um dos seus produtos.</p>
                </div>
                <button
                    onClick={handleAddNewProduct}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
                >
                    <PlusIcon /> Adicionar Produto
                </button>
            </div>
            
            {products.length === 0 && !loading ? (
                <div className="text-center py-20 bg-white rounded-lg border border-dashed border-slate-300">
                    <h3 className="text-lg font-semibold text-slate-800">Nenhum produto cadastrado</h3>
                    <p className="mt-1 text-slate-500">Clique em "Adicionar Produto" para começar a precificar.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map(product => (
                        <div key={product.id} onClick={() => setSelectedProductId(product.id)} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 hover:border-indigo-500 hover:shadow-md cursor-pointer transition-all">
                            <h2 className="font-bold text-lg text-slate-800 truncate">{product.name}</h2>
                            <p className="text-sm text-slate-500 mt-2">Lucro: {product.profit_margin_percentage}%</p>
                            <p className="text-sm text-slate-500">Tempo: {product.production_time_minutes} min</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductsPage;
