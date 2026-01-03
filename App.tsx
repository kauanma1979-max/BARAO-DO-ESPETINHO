
import React, { useState, useEffect, useMemo } from 'react';
import { Product, Order, CartItem, OrderStatus, Article } from './types';
import { INITIAL_PRODUCTS } from './constants';
import Header from './components/Header';
import Catalog from './components/Catalog';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import AdminPanel from './components/AdminPanel';
import About from './components/About';
import Footer from './components/Footer';
import { GoogleGenAI } from "@google/genai";

const DEFAULT_LOGO = 'https://raw.githubusercontent.com/ai-code-gen/assets/main/barao_logo.png';

const App: React.FC = () => {
  const [view, setView] = useState<'catalog' | 'cart' | 'checkout' | 'admin' | 'success' | 'about'>('catalog');
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });
  const [logo, setLogo] = useState<string>(() => {
    return localStorage.getItem('storeLogo') || DEFAULT_LOGO;
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('orders');
    return saved ? JSON.parse(saved) : [];
  });
  const [articles, setArticles] = useState<Article[]>(() => {
    const saved = localStorage.getItem('articles');
    return saved ? JSON.parse(saved) : [];
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [isGeneratingMap, setIsGeneratingMap] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('products', JSON.stringify(products));
    } catch (e) {
      console.warn('LocalStorage limit reached for products');
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('orders', JSON.stringify(orders));
    } catch (e) {
      console.warn('LocalStorage limit reached for orders');
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('articles', JSON.stringify(articles));
    } catch (e) {
      console.warn('LocalStorage limit reached for articles');
    }
  }, [articles]);

  useEffect(() => {
    try {
      localStorage.setItem('storeLogo', logo);
    } catch (e) {
      console.error('Falha ao salvar logo.');
    }
  }, [logo]);

  const cartTotalItems = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);
  const cartSubtotal = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const handleCreateOrder = async (order: Order) => {
    setIsGeneratingMap(true);
    let mapsUrl = '';

    if (order.customer.deliveryType === 'delivery') {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `Localize o endereço no Google Maps e retorne o link de compartilhamento para: ${order.customer.address}`,
          config: { tools: [{ googleMaps: {} }] },
        });

        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks && chunks.length > 0) {
          mapsUrl = chunks.find(chunk => chunk.maps?.uri)?.maps?.uri || '';
        }

        if (!mapsUrl) {
          mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.customer.address)}`;
        }
      } catch (error) {
        mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.customer.address)}`;
      }
    }

    const enrichedOrder = { ...order, mapsUrl };
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

  const handleEnterAdmin = () => {
    setIsAdmin(true);
    setView('admin');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header 
        cartCount={cartTotalItems} 
        onCartClick={() => setView('cart')}
        onLogoClick={() => setView('catalog')}
        onAboutClick={() => setView('about')}
        onAdminClick={handleEnterAdmin}
        isAdmin={isAdmin}
        logo={logo}
      />

      <main className="flex-grow pb-20 pt-4 px-2 sm:px-4 md:px-0">
        <div className="max-w-7xl mx-auto">
          {view === 'catalog' && (
            <Catalog 
              products={products} 
              articles={articles}
              addToCart={addToCart} 
              cart={cart} 
              updateCartQuantity={updateCartQuantity} 
            />
          )}
          {view === 'about' && (
            <About onBack={() => setView('catalog')} />
          )}
          {view === 'cart' && (
            <Cart items={cart} onUpdateQuantity={updateCartQuantity} onRemove={removeFromCart} onCheckout={() => setView('checkout')} subtotal={cartSubtotal} />
          )}
          {view === 'checkout' && (
            <Checkout items={cart} subtotal={cartSubtotal} onSubmit={handleCreateOrder} onBack={() => setView('cart')} />
          )}
          {view === 'admin' && isAdmin && (
            <AdminPanel 
              products={products} 
              orders={orders} 
              articles={articles}
              setProducts={setProducts}
              setOrders={setOrders}
              setArticles={setArticles}
              logo={logo}
              setLogo={setLogo}
              onLogout={() => { setIsAdmin(false); setView('catalog'); }}
            />
          )}
          {view === 'success' && lastOrder && (
            <div className="text-center py-20 px-4 bg-white rounded-3xl shadow-xl max-w-2xl mx-auto mt-10 border-t-8 border-ferrari animate-fade-in">
               <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                 <i className="fas fa-check text-4xl"></i>
               </div>
               <h1 className="text-4xl font-black mb-4 font-heading text-onyx uppercase tracking-tight">Pedido Confirmado!</h1>
               <p className="text-xl text-gray-600 mb-8">Obrigado pela preferência, {lastOrder.customer.name.split(' ')[0]}!</p>
               <button onClick={() => setView('catalog')} className="bg-onyx text-white px-10 py-4 rounded-xl font-bold uppercase tracking-wider hover:bg-ferrari transition-all">Voltar ao Início</button>
            </div>
          )}
        </div>
      </main>

      <Footer logo={logo} />
      {isGeneratingMap && (
        <div className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 border-4 border-slate-100 border-t-ferrari rounded-full animate-spin mx-auto mb-6"></div>
            <p className="font-black text-onyx uppercase tracking-widest text-sm">Gerando Rota...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
