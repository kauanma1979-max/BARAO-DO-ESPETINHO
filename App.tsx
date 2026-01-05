
import React, { useState, useEffect, useMemo } from 'react';
import { Product, Order, CartItem, OrderStatus, Category } from './types';
import { INITIAL_PRODUCTS } from './constants';
import Header from './components/Header';
import Catalog from './components/Catalog';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import AdminPanel from './components/AdminPanel';
import About from './components/About';
import Footer from './components/Footer';
import { GoogleGenAI } from "@google/genai";
import { supabase } from './supabaseClient';

const DEFAULT_LOGO = 'https://raw.githubusercontent.com/ai-code-gen/assets/main/barao_logo.png';

const App: React.FC = () => {
  const [view, setView] = useState<'catalog' | 'cart' | 'checkout' | 'admin' | 'success' | 'about'>('catalog');
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [logo, setLogo] = useState<string>(() => localStorage.getItem('storeLogo') || DEFAULT_LOGO);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [isGeneratingMap, setIsGeneratingMap] = useState(false);

  // 1. Verificar Conexão e Carregar Dados do Supabase
  useEffect(() => {
    const initData = async () => {
      try {
        // Testa conexão na tabela 'produtos' (nome em português como na sua foto)
        const { data: dbProducts, error: pError } = await supabase
          .from('produtos')
          .select('*');

        if (pError) throw pError;

        if (dbProducts && dbProducts.length > 0) {
          // Mapeia do banco (Português) para o App (Inglês)
          const mappedProducts: Product[] = dbProducts.map(p => ({
            id: p.id,
            name: p.nome,
            category: p.categoria as Category,
            price: p.preco,
            cost: p.custo,
            description: p.descricao,
            stock: p.estoque,
            image: p.imagem
          }));
          setProducts(mappedProducts);
        }
        
        // Carrega pedidos da tabela 'pedidos'
        const { data: dbOrders } = await supabase.from('pedidos').select('*');
        if (dbOrders) {
           const mappedOrders: Order[] = dbOrders.map(o => ({
             id: o.id,
             date: o.created_at,
             customer: { 
               name: o.customer_name, 
               phone: o.customer_phone, 
               address: o.customer_address,
               deliveryType: o.customer_address ? 'delivery' : 'pickup'
             },
             items: o.items,
             total: o.total,
             status: o.status as OrderStatus,
             subtotal: o.total, // Simplificado
             deliveryFee: 0,
             paymentMethod: o.payment_method || 'pix'
           }));
           setOrders(mappedOrders);
        }

        setDbConnected(true);
      } catch (err: any) {
        console.error("Erro Supabase:", err?.message || err);
        setDbConnected(false);
        // Fallback para localStorage se falhar
        const savedProducts = localStorage.getItem('products');
        if (savedProducts) setProducts(JSON.parse(savedProducts));
      }
    };
    initData();
  }, []);

  // Persistência local apenas como backup de segurança
  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  const cartTotalItems = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);
  const cartSubtotal = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) return { ...item, quantity: Math.max(0, item.quantity + delta) };
      return item;
    }).filter(item => item.quantity > 0));
  };

  const handleCreateOrder = async (order: Order) => {
    setIsGeneratingMap(true);
    let mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.customer.address)}`;

    const enrichedOrder = { ...order, mapsUrl };
    
    if (dbConnected) {
      try {
        await supabase.from('pedidos').insert([{
          id: enrichedOrder.id,
          customer_name: enrichedOrder.customer.name,
          customer_phone: enrichedOrder.customer.phone,
          customer_address: enrichedOrder.customer.address,
          total: enrichedOrder.total,
          status: enrichedOrder.status,
          items: enrichedOrder.items,
          payment_method: enrichedOrder.paymentMethod
        }]);
        
        // Atualiza estoque no banco para cada item
        for (const item of order.items) {
           const product = products.find(p => p.id === item.id);
           if (product) {
             await supabase.from('produtos')
               .update({ estoque: product.stock - item.quantity })
               .eq('id', item.id);
           }
        }
      } catch (err) {
        console.error("Erro ao salvar pedido no Supabase:", err);
      }
    }

    setOrders(prev => [...prev, enrichedOrder]);
    setProducts(prev => prev.map(p => {
      const cartItem = order.items.find(i => i.id === p.id);
      if (cartItem) return { ...p, stock: p.stock - cartItem.quantity };
      return p;
    }));
    setCart([]);
    setLastOrder(enrichedOrder);
    setIsGeneratingMap(false);
    setView('success');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header 
        cartCount={cartTotalItems} 
        onCartClick={() => setView('cart')}
        onLogoClick={() => setView('catalog')}
        onAboutClick={() => setView('about')}
        onAdminClick={() => { setIsAdmin(true); setView('admin'); }}
        isAdmin={isAdmin}
        logo={logo}
        dbConnected={dbConnected}
      />
      <main className="flex-grow pb-20 pt-4 px-2 sm:px-4 md:px-0">
        <div className="max-w-7xl mx-auto">
          {view === 'catalog' && <Catalog products={products} addToCart={addToCart} cart={cart} updateCartQuantity={updateCartQuantity} />}
          {view === 'about' && <About onBack={() => setView('catalog')} />}
          {view === 'cart' && <Cart items={cart} onUpdateQuantity={updateCartQuantity} onRemove={id => setCart(c => c.filter(i => i.id !== id))} onCheckout={() => setView('checkout')} subtotal={cartSubtotal} />}
          {view === 'checkout' && <Checkout items={cart} subtotal={cartSubtotal} onSubmit={handleCreateOrder} onBack={() => setView('cart')} />}
          {view === 'admin' && isAdmin && <AdminPanel products={products} orders={orders} setProducts={setProducts} setOrders={setOrders} logo={logo} setLogo={setLogo} onLogout={() => { setIsAdmin(false); setView('catalog'); }} />}
          {view === 'success' && lastOrder && (
            <div className="text-center py-20 px-4 bg-white rounded-3xl shadow-xl max-w-2xl mx-auto mt-10 border-t-8 border-ferrari animate-fade-in">
               <h1 className="text-4xl font-black mb-4 font-heading text-onyx uppercase">Pedido Confirmado!</h1>
               <p className="text-xl text-gray-600 mb-8">Nº #{lastOrder.id}</p>
               <button onClick={() => setView('catalog')} className="bg-onyx text-white px-10 py-4 rounded-xl font-bold uppercase">Voltar ao Início</button>
            </div>
          )}
        </div>
      </main>
      <Footer logo={logo} />
    </div>
  );
};

export default App;
