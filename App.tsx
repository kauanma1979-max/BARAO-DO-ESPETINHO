
import React, { useState, useEffect, useMemo } from 'react';
import { Product, Order, CartItem, OrderStatus, Article } from './types';
import { INITIAL_PRODUCTS, INITIAL_ARTICLES } from './constants';
import Header from './components/Header';
import Catalog from './components/Catalog';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import AdminPanel from './components/AdminPanel';
import About from './components/About';
import Footer from './components/Footer';
import ArticleView from './components/ArticleView';
import { GoogleGenAI } from "@google/genai";

const DEFAULT_LOGO = 'https://raw.githubusercontent.com/ai-code-gen/assets/main/barao_logo.png';

const App: React.FC = () => {
  const [view, setView] = useState<'catalog' | 'cart' | 'checkout' | 'admin' | 'success' | 'about' | 'article'>('catalog');
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });
  const [articles, setArticles] = useState<Article[]>(() => {
    const saved = localStorage.getItem('articles');
    return saved ? JSON.parse(saved) : INITIAL_ARTICLES;
  });
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [logo, setLogo] = useState<string>(() => {
    return localStorage.getItem('storeLogo') || DEFAULT_LOGO;
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('orders');
    return saved ? JSON.parse(saved) : [];
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [isGeneratingMap, setIsGeneratingMap] = useState(false);

  useEffect(() => { localStorage.setItem('products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('articles', JSON.stringify(articles)); }, [articles]);
  useEffect(() => { localStorage.setItem('orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('storeLogo', logo); }, [logo]);

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

  const removeFromCart = (id: string) => { setCart(prev => prev.filter(i => i.id !== id)); };

  const handleCreateOrder = async (order: Order) => {
    setIsGeneratingMap(true);
    let mapsUrl = '';
    if (order.customer.deliveryType === 'delivery') {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Link do Google Maps para o endereço: ${order.customer.address}`,
          config: { tools: [{ googleMaps: {} }] },
        });
        mapsUrl = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.find(c => c.maps?.uri)?.maps?.uri || '';
      } catch (error) { mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.customer.address)}`; }
    }
    const enrichedOrder = { ...order, mapsUrl };
    setOrders(prev => [...prev, enrichedOrder]);
    setProducts(prev => prev.map(p => {
      const cartItem = order.items.find(i => i.id === p.id);
      return cartItem ? { ...p, stock: p.stock - cartItem.quantity } : p;
    }));
    setCart([]);
    setLastOrder(enrichedOrder);
    setIsGeneratingMap(false);
    setView('success');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header cartCount={cartTotalItems} onCartClick={() => setView('cart')} onLogoClick={() => setView('catalog')} onAboutClick={() => setView('about')} onAdminClick={() => { setIsAdmin(true); setView('admin'); }} isAdmin={isAdmin} logo={logo} />
      <main className="flex-grow pb-20 pt-4 px-2 sm:px-4 md:px-0">
        <div className="max-w-7xl mx-auto">
          {view === 'catalog' && <Catalog products={products} articles={articles} addToCart={addToCart} cart={cart} updateCartQuantity={updateCartQuantity} onArticleClick={(a) => { setSelectedArticle(a); setView('article'); window.scrollTo(0,0); }} />}
          {view === 'article' && selectedArticle && <ArticleView article={selectedArticle} onBack={() => setView('catalog')} />}
          {view === 'admin' && isAdmin && <AdminPanel products={products} orders={orders} articles={articles} setProducts={setProducts} setOrders={setOrders} setArticles={setArticles} logo={logo} setLogo={setLogo} onLogout={() => { setIsAdmin(false); setView('catalog'); }} />}
          {view === 'cart' && <Cart items={cart} onUpdateQuantity={updateCartQuantity} onRemove={removeFromCart} onCheckout={() => setView('checkout')} subtotal={cartSubtotal} />}
          {view === 'checkout' && <Checkout items={cart} subtotal={cartSubtotal} onSubmit={handleCreateOrder} onBack={() => setView('cart')} />}
          {view === 'about' && <About onBack={() => setView('catalog')} />}
          {view === 'success' && lastOrder && (
            <div className="text-center py-20 px-4 bg-white rounded-3xl shadow-xl max-w-2xl mx-auto mt-10 border-t-8 border-ferrari">
               <h1 className="text-4xl font-black mb-4 font-heading text-onyx uppercase">Pedido Confirmado!</h1>
               <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
                 <div className="bg-slate-50 p-6 rounded-2xl flex-1"><p className="text-gray-500 uppercase text-xs font-bold mb-1">PEDIDO</p><p className="text-3xl font-black text-ferrari">#{lastOrder.id}</p></div>
                 {lastOrder.mapsUrl && <a href={lastOrder.mapsUrl} target="_blank" rel="noreferrer" className="bg-slate-50 p-6 rounded-2xl flex-1 flex flex-col items-center justify-center"><p className="text-gray-500 uppercase text-xs font-bold mb-1">LOCALIZAÇÃO</p><span className="text-onyx font-black flex items-center gap-2"><i className="fas fa-location-dot text-ferrari"></i> VER MAPA</span></a>}
               </div>
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
