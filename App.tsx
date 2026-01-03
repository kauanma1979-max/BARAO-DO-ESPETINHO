
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

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('articles', JSON.stringify(articles));
  }, [articles]);

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

  const openArticle = (article: Article) => {
    setSelectedArticle(article);
    setView('article');
    window.scrollTo(0, 0);
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
              articles={articles}
              addToCart={addToCart} 
              cart={cart} 
              updateCartQuantity={updateCartQuantity} 
              onArticleClick={openArticle}
            />
          )}
          {view === 'article' && selectedArticle && (
            <ArticleView 
              article={selectedArticle} 
              onBack={() => setView('catalog')} 
            />
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
          {/* ... Outras views (cart, checkout, etc) continuam iguais ... */}
          {view === 'cart' && <Cart items={cart} onUpdateQuantity={updateCartQuantity} onRemove={removeFromCart} onCheckout={() => setView('checkout')} subtotal={cartSubtotal} />}
          {view === 'checkout' && <Checkout items={cart} subtotal={cartSubtotal} onSubmit={() => setView('success')} onBack={() => setView('cart')} />}
          {view === 'about' && <About onBack={() => setView('catalog')} />}
        </div>
      </main>
      <Footer logo={logo} />
    </div>
  );
};

export default App;
