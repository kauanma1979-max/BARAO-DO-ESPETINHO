
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

const DEFAULT_LOGO = 'https://raw.githubusercontent.com/ai-code-gen/assets/main/barao_logo.png';

const App: React.FC = () => {
  const [view, setView] = useState<'catalog' | 'cart' | 'checkout' | 'admin' | 'success' | 'about'>('catalog');
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });
  const [logo, setLogo] = useState<string>(() => localStorage.getItem('storeLogo') || DEFAULT_LOGO);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('orders');
    return saved ? JSON.parse(saved) : [];
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);

  // Persistência local automática
  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('storeLogo', logo);
  }, [logo]);

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

  const handleCreateOrder = (order: Order) => {
    // URL do mapa para o admin e para o cliente
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.customer.address)}`;
    const enrichedOrder = { ...order, mapsUrl };

    setOrders(prev => [...prev, enrichedOrder]);
    
    // Atualizar estoque localmente
    setProducts(prev => prev.map(p => {
      const cartItem = order.items.find(i => i.id === p.id);
      if (cartItem) return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
      return p;
    }));

    setCart([]);
    setLastOrder(enrichedOrder);
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
      />
      
      <main className="flex-grow pb-20 pt-4 px-2 sm:px-4 md:px-0">
        <div className="max-w-7xl mx-auto">
          {view === 'catalog' && (
            <Catalog 
              products={products} 
              addToCart={addToCart} 
              cart={cart} 
              updateCartQuantity={updateCartQuantity} 
            />
          )}
          
          {view === 'about' && <About onBack={() => setView('catalog')} />}
          
          {view === 'cart' && (
            <Cart 
              items={cart} 
              onUpdateQuantity={updateCartQuantity} 
              onRemove={id => setCart(c => c.filter(i => i.id !== id))} 
              onCheckout={() => setView('checkout')} 
              subtotal={cartSubtotal} 
            />
          )}
          
          {view === 'checkout' && (
            <Checkout 
              items={cart} 
              subtotal={cartSubtotal} 
              onSubmit={handleCreateOrder} 
              onBack={() => setView('cart')} 
            />
          )}
          
          {view === 'admin' && isAdmin && (
            <AdminPanel 
              products={products} 
              orders={orders} 
              setProducts={setProducts} 
              setOrders={setOrders} 
              logo={logo} 
              setLogo={setLogo} 
              onLogout={() => { setIsAdmin(false); setView('catalog'); }}
              onSync={() => {}} 
            />
          )}

          {view === 'success' && lastOrder && (
            <div className="text-center py-20 px-4 bg-white rounded-[3rem] shadow-xl max-w-2xl mx-auto mt-10 border-t-8 border-ferrari animate-fade-in">
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                <i className="fas fa-check text-5xl"></i>
              </div>
              <h1 className="text-4xl font-black mb-4 font-heading text-onyx uppercase tracking-tighter">Pedido Confirmado!</h1>
              <p className="text-xl text-gray-500 mb-8 font-bold">O Barão já está preparando a brasa para você.</p>
              
              <div className="bg-slate-50 p-6 rounded-2xl mb-8 text-left border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">CÓDIGO DO PEDIDO</p>
                <p className="text-2xl font-black text-onyx italic mb-4">#{lastOrder.id}</p>
                
                {lastOrder.customer.deliveryType === 'delivery' && lastOrder.mapsUrl && (
                  <a 
                    href={lastOrder.mapsUrl} 
                    target="_blank"
                    className="flex items-center justify-center gap-3 p-4 bg-white text-blue-600 rounded-xl font-black uppercase text-[10px] tracking-widest border border-blue-100 hover:bg-blue-50 transition-all shadow-sm"
                  >
                    <i className="fas fa-map-location-dot"></i> Ver Endereço no Mapa
                  </a>
                )}
              </div>

              <div className="flex flex-col gap-4">
                <a 
                  href={`https://wa.me/55${lastOrder.customer.phone.replace(/\D/g, '')}`} 
                  target="_blank"
                  className="bg-green-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-lg hover:bg-green-600 transition-all"
                >
                  <i className="fab fa-whatsapp text-lg"></i> Falar com o Barão
                </a>
                <button 
                  onClick={() => setView('catalog')} 
                  className="bg-onyx text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-ferrari transition-all shadow-lg"
                >
                  Voltar ao Cardápio
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer logo={logo} />
    </div>
  );
};

export default App;
