
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import type { Session } from '@supabase/supabase-js';
import { CalculatorIcon, MenuIcon, CloseIcon, PriceIcon, LogoutIcon, CubeIcon, CogIcon } from './Icons';
import ProductsPage from '../pages/ProductsPage';
import MaterialsPage from '../pages/MaterialsPage';
import SettingsPage from '../pages/SettingsPage';

type Page = 'products' | 'materials' | 'settings';

const Layout: React.FC<{ session: Session }> = ({ session }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState<Page>('products');

    const navigation = [
        { name: 'Produtos', page: 'products', icon: CubeIcon },
        { name: 'Materiais', page: 'materials', icon: CalculatorIcon },
        { name: 'Configurações', page: 'settings', icon: CogIcon },
    ];
    
    const renderPage = () => {
        switch (currentPage) {
            case 'products':
                return <ProductsPage />;
            case 'materials':
                return <MaterialsPage />;
            case 'settings':
                return <SettingsPage />;
            default:
                return <ProductsPage />;
        }
    };

    const NavLink: React.FC<{item: typeof navigation[0]}> = ({ item }) => (
        <a
            key={item.name}
            href="#"
            onClick={(e) => {
                e.preventDefault();
                setCurrentPage(item.page as Page);
                setSidebarOpen(false);
            }}
            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                currentPage === item.page
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
            }`}
        >
            <item.icon className={`mr-3 flex-shrink-0 h-6 w-6 ${currentPage === item.page ? 'text-indigo-500' : 'text-slate-400 group-hover:text-slate-500'}`} />
            {item.name}
        </a>
    );

    return (
        <div className="h-screen flex overflow-hidden bg-slate-100">
            {/* Sidebar para mobile */}
            {sidebarOpen && (
                <div className="fixed inset-0 flex z-40 md:hidden" role="dialog" aria-modal="true">
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75" aria-hidden="true" onClick={() => setSidebarOpen(false)}></div>
                    <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
                        <div className="absolute top-0 right-0 -mr-12 pt-2">
                            <button type="button" className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white" onClick={() => setSidebarOpen(false)}>
                                <CloseIcon className="h-6 w-6 text-white" />
                            </button>
                        </div>
                        <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                            <div className="flex-shrink-0 flex items-center px-4">
                                <div className="bg-indigo-600 p-2 rounded-lg"><PriceIcon /></div>
                                <span className="ml-3 text-xl font-bold text-slate-800">Precify</span>
                            </div>
                            <nav className="mt-5 px-2 space-y-1">{navigation.map(item => <NavLink key={item.page} item={item} />)}</nav>
                        </div>
                    </div>
                    <div className="flex-shrink-0 w-14"></div>
                </div>
            )}

            {/* Sidebar para desktop */}
            <div className="hidden md:flex md:flex-shrink-0">
                <div className="flex flex-col w-64">
                    <div className="flex flex-col h-0 flex-1 border-r border-slate-200 bg-white">
                        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                            <div className="flex items-center flex-shrink-0 px-4">
                                <div className="bg-indigo-600 p-2 rounded-lg"><PriceIcon /></div>
                                <span className="ml-3 text-xl font-bold text-slate-800">Precify</span>
                            </div>
                            <nav className="mt-5 flex-1 px-2 bg-white space-y-1">{navigation.map(item => <NavLink key={item.page} item={item} />)}</nav>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="flex flex-col w-0 flex-1 overflow-hidden">
                <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow-sm border-b border-slate-200">
                    <button type="button" className="px-4 border-r border-slate-200 text-slate-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden" onClick={() => setSidebarOpen(true)}>
                        <MenuIcon className="h-6 w-6" />
                    </button>
                    <div className="flex-1 px-4 flex justify-end">
                        <div className="ml-4 flex items-center md:ml-6">
                             <div className="ml-3 relative">
                                <div>
                                    <button type="button" className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" onClick={() => setDropdownOpen(!dropdownOpen)}>
                                        <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                                            <span className="text-xs font-semibold">{session.user.email?.charAt(0).toUpperCase()}</span>
                                        </div>
                                    </button>
                                </div>
                                {dropdownOpen && (
                                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                                        <div className="px-4 py-2 text-xs text-slate-500 border-b">{session.user.email}</div>
                                        <a href="#" onClick={() => supabase.auth.signOut()} className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                                            <LogoutIcon className="mr-2 h-5 w-5 text-slate-500" />
                                            Sair
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <main className="flex-1 relative overflow-y-auto focus:outline-none bg-slate-50">
                    <div className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            {renderPage()}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
