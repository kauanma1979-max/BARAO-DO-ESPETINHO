
import React, { useState, useEffect, useMemo } from 'react';
import { Product, Order, CartItem, OrderStatus } from './types';
import { INITIAL_PRODUCTS } from './constants';
import Header from './components/Header';
import Catalog from './components/Catalog';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import AdminPanel from './components/AdminPanel';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';

const App: React.FC = () => {
  const [view, setView] = useState<'catalog' | 'cart' | 'checkout' | 'admin' | 'success'>('catalog');
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });
  const [logo, setLogo] = useState<string>(() => {
    return localStorage.getItem('storeLogo') || '';
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('orders');
    return saved ? JSON.parse(saved) : [];
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);

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

  const handleCreateOrder = (order: Order) => {
    setOrders(prev => [...prev, order]);
    setProducts(prev => prev.map(p => {
      const cartItem = order.items.find(i => i.id === p.id);
      if (cartItem) return { ...p, stock: p.stock - cartItem.quantity };
      return p;
    }));
    setCart([]);
    setLastOrder(order);
    setView('success');
  };

  const handleAdminAuth = (password: string) => {
    if (password === '101210') { 
      setIsAdmin(true);
      setShowLogin(false);
      setView('admin');
    } else {
      alert('Senha incorreta!');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header 
        cartCount={cartTotalItems} 
        onCartClick={() => setView('cart')}
        onLogoClick={() => setView('catalog')}
        onAdminClick={() => isAdmin ? setView('admin') : setShowLogin(true)}
        isAdmin={isAdmin}
        logo={logo}
      />

      <main className="flex-grow pb-20 pt-4 px-2 sm:px-4 md:px-0">
        <div className="max-w-7xl mx-auto">
          {view === 'catalog' && (
            <Catalog products={products} addToCart={addToCart} cart={cart} updateCartQuantity={updateCartQuantity} />
          )}
          {view === 'cart' && (
            <Cart 
              items={cart} 
              onUpdateQuantity={updateCartQuantity} 
              onRemove={removeFromCart}
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
            />
          )}
          {view === 'success' && lastOrder && (
            <div className="text-center py-20 px-4 bg-white rounded-3xl shadow-xl max-w-2xl mx-auto mt-10 border-t-8 border-ferrari animate-fade-in">
               <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                 <i className="fas fa-check text-4xl"></i>
               </div>
               <h1 className="text-4xl font-black mb-4 font-heading text-onyx uppercase tracking-tight">Pedido Confirmado!</h1>
               <p className="text-xl text-gray-600 mb-8">Obrigado pela preferência, {lastOrder.customer.name.split(' ')[0]}!</p>
               <div className="bg-slate-50 p-6 rounded-2xl mb-8 inline-block">
                 <p className="text-gray-500 uppercase text-xs font-bold tracking-widest mb-1">NÚMERO DO PEDIDO</p>
                 <p className="text-3xl font-black text-ferrari">#{lastOrder.id}</p>
               </div>
               <button 
                onClick={() => setView('catalog')}
                className="block w-full sm:w-auto mx-auto bg-onyx text-white px-10 py-4 rounded-xl font-bold uppercase tracking-wider hover:bg-ferrari transition-all shadow-lg hover:shadow-ferrari/40 transform hover:-translate-y-1"
               >
                 Voltar ao Início
               </button>
            </div>
          )}
        </div>
      </main>

      <Footer logo={logo} />

      {showLogin && <LoginModal onLogin={handleAdminAuth} onClose={() => setShowLogin(false)} />}
      
      {/* Quick Access Mobile Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center h-16 px-4 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-40">
        <button onClick={() => setView('catalog')} className={`flex flex-col items-center gap-1 ${view === 'catalog' ? 'text-ferrari' : 'text-gray-400'}`}>
          <i className="fas fa-home text-lg"></i>
          <span className="text-[10px] font-bold uppercase">Menu</span>
        </button>
        <button onClick={() => setView('cart')} className={`flex flex-col items-center gap-1 relative ${view === 'cart' ? 'text-ferrari' : 'text-gray-400'}`}>
          <i className="fas fa-shopping-basket text-lg"></i>
          {cartTotalItems > 0 && <span className="absolute -top-1 -right-1 bg-ferrari text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{cartTotalItems}</span>}
          <span className="text-[10px] font-bold uppercase">Carrinho</span>
        </button>
        <button onClick={() => isAdmin ? setView('admin') : setShowLogin(true)} className={`flex flex-col items-center gap-1 ${view === 'admin' ? 'text-ferrari' : 'text-gray-400'}`}>
          <i className="fas fa-cog text-lg"></i>
          <span className="text-[10px] font-bold uppercase">Ajustes</span>
        </button>
      </div>
    </div>
  );
};

export default App;
