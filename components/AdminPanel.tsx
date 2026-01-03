
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'inventory' | 'blog' | 'store'>('dashboard');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const restoreInputRef = useRef<HTMLInputElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);
  const blogFileInputRef = useRef<HTMLInputElement>(null);

  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    category: Category.TRADITIONAL,
    name: '', stock: 0, cost: 0, price: 0, weight: '', description: '', image: 'https://picsum.photos/seed/espeto/400/300'
  });

  const [newArticle, setNewArticle] = useState<Partial<Article>>({
    title: '', content: '', image: 'https://images.unsplash.com/photo-1529193591184-b1d58fab356c?auto=format&fit=crop&w=800&q=80'
  });

  const categoryEmojis: Record<string, string> = {
    [Category.TRADITIONAL]: '🥩', [Category.SPECIAL]: '👑', [Category.DRINK]: '🥤', [Category.SIDE]: '🥣', [Category.COAL]: '🔥',
  };

  const stats = useMemo(() => {
    const validOrders = orders.filter(o => o.status !== OrderStatus.CANCELLED);
    const revenue = validOrders.reduce((acc, o) => acc + o.total, 0);
    const cost = validOrders.reduce((acc, o) => acc + o.items.reduce((sum, item) => sum + (item.cost * item.quantity), 0), 0);
    const profit = revenue - cost;
    const salesMap = new Map<string, number>();
    validOrders.forEach(o => o.items.forEach(i => salesMap.set(i.id, (salesMap.get(i.id) || 0) + i.quantity)));

    const categoryGroups = Object.values(Category)
      .filter(cat => cat !== Category.TIPS)
      .map(cat => {
        const items = products.filter(p => p.category === cat).map(p => ({
          name: p.name, qty: salesMap.get(p.id) || 0, emoji: categoryEmojis[cat] || '🍢'
        })).sort((a, b) => b.qty - a.qty).slice(0, 5);
        const maxQtyInCat = Math.max(...items.map(i => i.qty), 1);
        return { cat, label: CATEGORY_LABELS[cat], emoji: categoryEmojis[cat] || '🍢', items, maxQtyInCat };
      }).filter(group => group.items.length > 0);

    return { revenue, cost, profit, totalOrders: orders.length, categoryGroups };
  }, [orders, products]);

  const groupedProducts = useMemo(() => products.reduce((acc, p) => {
    const cat = p.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {} as Record<string, Product[]>), [products]);

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProductId) {
      setProducts(prev => prev.map(p => p.id === editingProductId ? { ...p, ...newProduct as Product } : p));
    } else {
      setProducts(prev => [...prev, { ...newProduct as Product, id: Date.now().toString() }]);
    }
    closeModal();
  };

  const handleSaveArticle = (e: React.FormEvent) => {
    e.preventDefault();
    const article: Article = {
      ...newArticle as Article,
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('pt-BR'),
      author: 'Barão',
      excerpt: newArticle.content?.substring(0, 100) + '...',
      tags: ['Dicas']
    };
    setArticles(prev => [article, ...prev]);
    setIsBlogModalOpen(false);
    setNewArticle({ title: '', content: '', image: 'https://images.unsplash.com/photo-1529193591184-b1d58fab356c?auto=format&fit=crop&w=800&q=80' });
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

  const textClass = "text-black text-shadow-gray font-black uppercase tracking-tighter";

  return (
    <div className="py-8 animate-fade-in px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex items-center gap-8">
          <div className="w-24 h-24 bg-ferrari rounded-[2rem] flex items-center justify-center text-white shadow-2xl">
             <i className="fas fa-sliders-h text-4xl"></i>
          </div>
          <div>
            <h2 className="text-5xl font-black font-heading text-onyx uppercase tracking-tighter italic leading-none">Gestão <span className="text-ferrari">Barão</span></h2>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onLogout} className="px-8 py-5 bg-onyx text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-ferrari transition-all">SAIR</button>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar mb-12 -mx-4 px-4">
        {[
          { id: 'dashboard', label: 'Resumo', icon: 'fa-chart-line' },
          { id: 'orders', label: 'Pedidos', icon: 'fa-receipt' },
          { id: 'inventory', label: 'Estoque', icon: 'fa-boxes-stacked' },
          { id: 'blog', label: 'Blog', icon: 'fa-pen-nib' },
          { id: 'store', label: 'Marca', icon: 'fa-palette' },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-6 px-10 py-7 rounded-[2rem] font-black uppercase text-base transition-all whitespace-nowrap border-2 ${activeTab === tab.id ? 'bg-onyx text-white border-onyx shadow-2xl' : 'bg-white text-gray-400 border-gray-100'}`}
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
              { label: 'PEDIDOS', val: stats.totalOrders, icon: 'fa-clipboard-list' }
            ].map((stat, i) => (
              <div key={i} className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
                <span className="text-xs font-black uppercase text-gray-400 tracking-[0.4em] block mb-3">{stat.label}</span>
                <span className="text-3xl font-black text-onyx block">{stat.val}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-[4rem] shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead><tr className="bg-slate-50"><th className="p-12 text-sm font-black uppercase text-gray-400">PEDIDO</th><th className="p-12 text-sm font-black uppercase text-gray-400">CLIENTE</th><th className="p-12 text-sm font-black uppercase text-gray-400">LOCAL</th><th className="p-12 text-sm font-black uppercase text-gray-400">STATUS</th></tr></thead>
              <tbody>
                {orders.slice().reverse().map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/50">
                    <td className="p-12 border-b"><span className="font-black text-ferrari text-3xl">#{order.id}</span></td>
                    <td className="p-12 border-b"><p className="font-black text-onyx uppercase">{order.customer.name}</p></td>
                    <td className="p-12 border-b">{order.mapsUrl ? <a href={order.mapsUrl} target="_blank" className="bg-slate-100 px-4 py-2 rounded-xl text-[10px] font-black uppercase">Ver Mapa</a> : 'Retirada'}</td>
                    <td className="p-12 border-b">
                      <select value={order.status} onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)} className="bg-slate-50 p-2 rounded-xl font-black uppercase text-xs">
                        <option value={OrderStatus.PENDING}>AGUARDANDO</option>
                        <option value={OrderStatus.PREPARING}>PREPARANDO</option>
                        <option value={OrderStatus.SHIPPED}>ENVIADO</option>
                        <option value={OrderStatus.CANCELLED}>CANCELADO</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'blog' && (
          <div className="space-y-12 animate-fade-in-up">
            <div className="flex justify-between items-center bg-white p-12 rounded-[3.5rem] shadow-sm border border-gray-100">
              <div><h3 className="text-4xl font-black uppercase text-onyx">Dicas do Barão (Blog)</h3></div>
              <button onClick={() => setIsBlogModalOpen(true)} className="bg-ferrari text-white px-12 py-7 rounded-[2rem] font-black uppercase shadow-xl flex items-center gap-5">
                <i className="fas fa-pen"></i> NOVO ARTIGO
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map(article => (
                <div key={article.id} className="bg-white p-10 rounded-[3rem] border border-gray-100 flex flex-col gap-6">
                  <img src={article.image} className="w-full aspect-video object-cover rounded-2xl" />
                  <h4 className="font-black text-onyx uppercase text-xl leading-none">{article.title}</h4>
                  <button onClick={() => setArticles(prev => prev.filter(a => a.id !== article.id))} className="text-red-500 font-black uppercase text-[10px] self-end">Excluir</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Blog */}
        {isBlogModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <div className="bg-white w-full max-w-4xl rounded-[4rem] shadow-2xl overflow-hidden animate-fade-in-up">
              <form onSubmit={handleSaveArticle} className="p-12 space-y-10">
                <div className="flex justify-between items-center">
                  <h3 className={`text-4xl ${textClass}`}>Novo Artigo do Blog</h3>
                  <button type="button" onClick={() => setIsBlogModalOpen(false)} className="text-gray-300 hover:text-ferrari transition-all"><i className="fas fa-times text-4xl"></i></button>
                </div>
                <div className="space-y-3">
                  <label className={`text-xs pl-4 ${textClass}`}>Título do Artigo</label>
                  <input type="text" required value={newArticle.title} onChange={e => setNewArticle({...newArticle, title: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-6 font-black uppercase outline-none shadow-inner" />
                </div>
                <div className="space-y-3">
                  <label className={`text-xs pl-4 ${textClass}`}>Conteúdo</label>
                  <textarea required value={newArticle.content} onChange={e => setNewArticle({...newArticle, content: e.target.value})} rows={6} className="w-full bg-slate-50 border-none rounded-2xl p-6 font-black uppercase outline-none shadow-inner resize-none" />
                </div>
                <div className="flex items-center gap-10">
                  <img src={newArticle.image} className="w-32 h-32 rounded-3xl object-cover shadow-xl border-4 border-white" />
                  <button type="button" onClick={() => blogFileInputRef.current?.click()} className="px-10 py-5 bg-slate-100 text-gray-500 rounded-2xl font-black uppercase text-[10px]">BUSCAR IMAGEM</button>
                  <input type="file" ref={blogFileInputRef} onChange={handleArticleImageUpload} className="hidden" />
                </div>
                <button type="submit" className="w-full bg-onyx text-white py-8 rounded-[2.5rem] font-black uppercase tracking-[0.3em] hover:bg-ferrari transition-all shadow-2xl">PUBLICAR DICA</button>
              </form>
            </div>
          </div>
        )}

        {/* Aba de Marca/Logo */}
        {activeTab === 'store' && (
          <div className="bg-white rounded-[4rem] p-16 shadow-sm border border-gray-100 animate-fade-in-up max-w-4xl">
            <h3 className="text-4xl font-black uppercase text-onyx mb-12">Identidade Visual</h3>
            <div className="flex flex-col items-center gap-12 p-16 border-4 border-dashed border-slate-100 rounded-[3.5rem] bg-slate-50/50">
              <img src={logo} className="w-72 h-72 rounded-[3rem] object-cover shadow-2xl border-[10px] border-white" />
              <input type="file" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="px-16 py-8 bg-onyx text-white rounded-[2.5rem] font-black uppercase hover:bg-ferrari transition-all">ATUALIZAR LOGO</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
