
import React, { useState, useMemo, useRef } from 'react';
import { Product, Order, OrderStatus, Category, Article } from '../types';
import { CATEGORY_LABELS } from '../constants';

interface AdminPanelProps {
  products: Product[];
  orders: Order[];
  articles: Article[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  setArticles: React.Dispatch<React.SetStateAction<Article[]>>;
  logo: string;
  setLogo: (url: string) => void;
  onLogout: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ products, orders, articles, setProducts, setOrders, setArticles, logo, setLogo, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'inventory' | 'store' | 'blog'>('dashboard');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const restoreInputRef = useRef<HTMLInputElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);
  const blogFileInputRef = useRef<HTMLInputElement>(null);

  // Estados para o novo artigo do blog
  const [newArticle, setNewArticle] = useState<Partial<Article>>({
    title: '',
    content: '',
    image: 'https://images.unsplash.com/photo-1529193591184-b1d58fab356c?auto=format&fit=crop&w=400&h=300&q=80'
  });

  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    category: Category.TRADITIONAL,
    name: '',
    stock: 0,
    cost: 0,
    price: 0,
    weight: '',
    description: '',
    image: 'https://picsum.photos/seed/espeto/400/300'
  });

  const categoryEmojis: Record<string, string> = {
    [Category.TRADITIONAL]: '🥩',
    [Category.SPECIAL]: '👑',
    [Category.DRINK]: '🥤',
    [Category.SIDE]: '🥣',
    [Category.COAL]: '🔥',
  };

  const stats = useMemo(() => {
    const validOrders = orders.filter(o => o.status !== OrderStatus.CANCELLED);
    const revenue = validOrders.reduce((acc, o) => acc + o.total, 0);
    const cost = validOrders.reduce((acc, o) => {
      const orderCost = o.items.reduce((sum, item) => sum + (item.cost * item.quantity), 0);
      return acc + orderCost;
    }, 0);
    const profit = revenue - cost;
    
    const salesMap = new Map<string, number>();
    validOrders.forEach(order => {
      order.items.forEach(item => {
        salesMap.set(item.id, (salesMap.get(item.id) || 0) + item.quantity);
      });
    });

    const categoryGroups = Object.values(Category)
      .filter(cat => cat !== Category.TIPS)
      .map(cat => {
        const items = products
          .filter(p => p.category === cat)
          .map(p => ({
            name: p.name,
            qty: salesMap.get(p.id) || 0,
            emoji: categoryEmojis[cat] || '🍢'
          }))
          .sort((a, b) => b.qty - a.qty)
          .slice(0, 5);

        const maxQtyInCat = Math.max(...items.map(i => i.qty), 1);

        return {
          cat,
          label: CATEGORY_LABELS[cat],
          emoji: categoryEmojis[cat] || '🍢',
          items,
          maxQtyInCat
        };
      })
      .filter(group => group.items.length > 0);

    return { revenue, cost, profit, totalOrders: orders.length, categoryGroups };
  }, [orders, products]);

  const groupedProducts = useMemo(() => {
    return products.reduce((acc, product) => {
      const cat = product.category;
      if (!acc[cat]) {
        acc[cat] = [];
      }
      acc[cat].push(product);
      return acc;
    }, {} as Record<string, Product[]>);
  }, [products]);

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProductId) {
      setProducts(prev => prev.map(p => p.id === editingProductId ? { ...p, ...newProduct as Product } : p));
    } else {
      const productToAdd: Product = {
        ...newProduct as Product,
        id: Date.now().toString(),
        description: newProduct.description || `${newProduct.name} de qualidade superior.`
      };
      setProducts(prev => [...prev, productToAdd]);
    }
    closeModal();
  };

  const handleSaveArticle = (e: React.FormEvent) => {
    e.preventDefault();
    const articleToAdd: Article = {
      id: Date.now().toString(),
      title: newArticle.title || 'Sem Título',
      content: newArticle.content || '',
      image: newArticle.image || 'https://images.unsplash.com/photo-1529193591184-b1d58fab356c?auto=format&fit=crop&w=400&h=300&q=80',
      date: new Date().toLocaleDateString('pt-BR')
    };
    setArticles(prev => [articleToAdd, ...prev]);
    setIsBlogModalOpen(false);
    setNewArticle({
      title: '',
      content: '',
      image: 'https://images.unsplash.com/photo-1529193591184-b1d58fab356c?auto=format&fit=crop&w=400&h=300&q=80'
    });
  };

  const openEditModal = (product: Product) => {
    setEditingProductId(product.id);
    setNewProduct(product);
    setIsProductModalOpen(true);
  };

  const closeModal = () => {
    setIsProductModalOpen(false);
    setEditingProductId(null);
    setNewProduct({ category: Category.TRADITIONAL, name: '', stock: 0, cost: 0, price: 0, weight: '', image: 'https://picsum.photos/seed/espeto/400/300' });
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleArticleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewArticle(prev => ({ ...prev, image: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const textClass = "text-black text-shadow-gray font-black uppercase tracking-tighter";

  return (
    <div className="py-8 animate-fade-in px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex items-center gap-8">
          <div className="w-24 h-24 bg-ferrari rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-ferrari/30">
             <i className="fas fa-sliders-h text-4xl"></i>
          </div>
          <div>
            <h2 className="text-5xl font-black font-heading text-onyx uppercase tracking-tighter italic leading-none">Gestão <span className="text-ferrari">Barão</span></h2>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onLogout} className="px-8 py-5 bg-onyx text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-ferrari transition-all shadow-sm">
            SAIR
          </button>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar mb-12 -mx-4 px-4">
        {[
          { id: 'dashboard', label: 'Resumo', icon: 'fa-chart-line' },
          { id: 'orders', label: 'Pedidos', icon: 'fa-receipt' },
          { id: 'inventory', label: 'Estoque', icon: 'fa-boxes-stacked' },
          { id: 'blog', label: 'Blog', icon: 'fa-newspaper' },
          { id: 'store', label: 'Marca', icon: 'fa-palette' },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-6 px-10 py-7 rounded-[2rem] font-black uppercase text-base tracking-[0.1em] transition-all whitespace-nowrap border-2 ${activeTab === tab.id ? 'bg-onyx text-white border-onyx shadow-2xl shadow-onyx/30' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'}`}
          >
            <i className={`fas ${tab.icon} text-2xl ${activeTab === tab.id ? 'text-ferrari' : 'text-gray-300'}`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-16">
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
            {[
              { label: 'FATURAMENTO', val: `R$ ${stats.revenue.toFixed(2)}`, icon: 'fa-sack-dollar' },
              { label: 'LUCRO BRUTO', val: `R$ ${stats.profit.toFixed(2)}`, icon: 'fa-chart-simple' },
              { label: 'TOTAL PEDIDOS', val: stats.totalOrders, icon: 'fa-clipboard-list' }
            ].map((stat, i) => (
              <div key={i} className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
                <span className="text-xs font-black uppercase text-gray-400 tracking-[0.4em] block mb-3">{stat.label}</span>
                <span className="text-3xl font-black text-onyx tracking-tighter block">{stat.val}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'blog' && (
          <div className="space-y-12 animate-fade-in-up">
            <div className="flex justify-between items-center bg-white p-12 rounded-[3.5rem] shadow-sm border border-gray-100">
              <div>
                <h3 className="text-4xl font-black uppercase tracking-tighter text-onyx">Dicas do Barão</h3>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2">Gerencie as publicações do blog</p>
              </div>
              <button 
                onClick={() => setIsBlogModalOpen(true)}
                className="bg-ferrari text-white px-12 py-7 rounded-[2rem] font-black uppercase shadow-xl hover:scale-105 transition-all flex items-center gap-5"
              >
                <i className="fas fa-pen-nib"></i> NOVO ARTIGO
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map(article => (
                <div key={article.id} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col gap-6">
                  <img src={article.image} className="w-full h-40 object-cover rounded-2xl shadow-md" />
                  <div>
                    <h4 className="font-black text-onyx uppercase tracking-tighter text-xl mb-1 line-clamp-1">{article.title}</h4>
                    <p className="text-xs font-bold text-gray-400 uppercase">{article.date}</p>
                  </div>
                  <button 
                    onClick={() => setArticles(prev => prev.filter(a => a.id !== article.id))}
                    className="mt-auto text-red-500 font-black uppercase text-[10px] tracking-widest flex items-center gap-2"
                  >
                    <i className="fas fa-trash"></i> EXCLUIR
                  </button>
                </div>
              ))}
              {articles.length === 0 && (
                <div className="col-span-full py-20 text-center bg-slate-50 rounded-[4rem] border-4 border-dashed border-slate-200">
                  <p className="font-black text-slate-300 uppercase tracking-widest">Nenhum artigo publicado.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ... (orders, inventory tabs) */}
        
        {activeTab === 'store' && (
          <div className="bg-white rounded-[4rem] p-16 shadow-sm border border-gray-100 animate-fade-in-up max-w-4xl">
            <h3 className="text-4xl font-black uppercase tracking-tighter text-onyx mb-12">Identidade Visual</h3>
            <div className="flex flex-col items-center gap-12 p-16 border-4 border-dashed border-slate-100 rounded-[3.5rem] bg-slate-50/50">
              <img src={logo} className="w-72 h-72 rounded-[3rem] object-cover shadow-2xl border-[10px] border-white" />
              <input type="file" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="px-16 py-8 bg-onyx text-white rounded-[2.5rem] font-black uppercase hover:bg-ferrari transition-all flex items-center gap-6 shadow-2xl">
                <i className="fas fa-upload text-2xl"></i> ATUALIZAR LOGO
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Blog */}
      {isBlogModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-white w-full max-w-4xl rounded-[4rem] shadow-2xl overflow-hidden animate-fade-in-up border border-white/20">
            <div className="h-4 header-animated"></div>
            <form onSubmit={handleSaveArticle} className="p-12 space-y-10">
              <div className="flex justify-between items-center">
                <h3 className={`text-4xl ${textClass}`}>Nova Dica do Barão</h3>
                <button type="button" onClick={() => setIsBlogModalOpen(false)} className="text-gray-300 hover:text-ferrari transition-all"><i className="fas fa-times text-4xl"></i></button>
              </div>

              <div className="space-y-3">
                <label className={`text-xs pl-4 ${textClass}`}>Título do Artigo</label>
                <input 
                  type="text" 
                  required 
                  value={newArticle.title} 
                  onChange={e => setNewArticle({...newArticle, title: e.target.value})} 
                  className="w-full bg-slate-50 border-none rounded-2xl p-6 font-black uppercase outline-none shadow-inner" 
                />
              </div>

              <div className="space-y-3">
                <label className={`text-xs pl-4 ${textClass}`}>Conteúdo</label>
                <textarea 
                  required 
                  value={newArticle.content} 
                  onChange={e => setNewArticle({...newArticle, content: e.target.value})} 
                  rows={6}
                  className="w-full bg-slate-50 border-none rounded-2xl p-6 font-black uppercase outline-none shadow-inner resize-none" 
                />
              </div>

              <div className="flex items-center gap-10">
                <img src={newArticle.image} className="w-32 h-32 rounded-3xl object-cover shadow-xl border-4 border-white" />
                <button type="button" onClick={() => blogFileInputRef.current?.click()} className="px-10 py-5 bg-slate-100 text-gray-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200">BUSCAR IMAGEM</button>
                <input type="file" ref={blogFileInputRef} onChange={handleArticleImageUpload} className="hidden" />
              </div>

              <button type="submit" className="w-full bg-onyx text-white py-8 rounded-[2.5rem] font-black uppercase tracking-[0.3em] hover:bg-ferrari transition-all shadow-2xl">
                PUBLICAR NO BLOG
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Produto */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-white w-full max-w-4xl rounded-[4rem] shadow-2xl overflow-hidden animate-fade-in-up border border-white/20">
            <div className="h-4 header-animated"></div>
            <form onSubmit={handleSaveProduct} className="p-12 space-y-10">
              <div className="flex justify-between items-center">
                <h3 className={`text-4xl ${textClass}`}>{editingProductId ? 'Editar Item' : 'Novo Item'}</h3>
                <button type="button" onClick={closeModal} className="text-gray-300 hover:text-ferrari transition-all"><i className="fas fa-times text-4xl"></i></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className={`text-xs pl-4 ${textClass}`}>Nome do Item</label>
                  <input type="text" required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-6 font-black uppercase outline-none shadow-inner" />
                </div>
                <div className="space-y-3">
                  <label className={`text-xs pl-4 ${textClass}`}>Categoria</label>
                  <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value as Category})} className="w-full bg-slate-50 border-none rounded-2xl p-6 font-black uppercase outline-none shadow-inner">
                    {Object.entries(CATEGORY_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <label className={`text-xs pl-4 ${textClass}`}>Preço Venda</label>
                  <input type="number" step="0.01" required value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})} className="w-full bg-slate-50 border-none rounded-2xl p-6 font-black outline-none shadow-inner" />
                </div>
                <div className="space-y-3">
                  <label className={`text-xs pl-4 ${textClass}`}>Estoque</label>
                  <input type="number" required value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value)})} className="w-full bg-slate-50 border-none rounded-2xl p-6 font-black outline-none shadow-inner" />
                </div>
                <div className="space-y-3">
                   <label className={`text-xs pl-4 ${textClass}`}>Custo Unit.</label>
                   <input type="number" step="0.01" required value={newProduct.cost} onChange={e => setNewProduct({...newProduct, cost: parseFloat(e.target.value)})} className="w-full bg-slate-50 border-none rounded-2xl p-6 font-black outline-none shadow-inner" />
                </div>
              </div>

              <div className="flex items-center gap-10">
                <img src={newProduct.image} className="w-32 h-32 rounded-3xl object-cover shadow-xl border-4 border-white" />
                <button type="button" onClick={() => modalFileInputRef.current?.click()} className="px-10 py-5 bg-slate-100 text-gray-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200">MUDAR FOTO</button>
                <input type="file" ref={modalFileInputRef} onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setNewProduct(prev => ({ ...prev, image: reader.result as string }));
                    reader.readAsDataURL(file);
                  }
                }} className="hidden" />
              </div>

              <button type="submit" className="w-full bg-onyx text-white py-8 rounded-[2.5rem] font-black uppercase tracking-[0.3em] hover:bg-ferrari transition-all shadow-2xl">
                SALVAR ITEM
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
