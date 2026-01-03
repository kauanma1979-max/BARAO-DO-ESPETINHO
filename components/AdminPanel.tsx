
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
  const modalFileInputRef = useRef<HTMLInputElement>(null);
  const blogFileInputRef = useRef<HTMLInputElement>(null);

  const [newArticle, setNewArticle] = useState<Partial<Article>>({
    title: '', content: '', image: 'https://images.unsplash.com/photo-1529193591184-b1d58fab356c?auto=format&fit=crop&w=400&h=300&q=80'
  });

  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    category: Category.TRADITIONAL, name: '', stock: 0, cost: 0, price: 0, weight: '', description: '', image: 'https://picsum.photos/seed/espeto/400/300'
  });

  const handleSaveArticle = (e: React.FormEvent) => {
    e.preventDefault();
    const article: Article = {
      id: Date.now().toString(),
      title: newArticle.title || 'Sem Título',
      content: newArticle.content || '',
      image: newArticle.image || '',
      date: new Date().toLocaleDateString('pt-BR')
    };
    setArticles(prev => [article, ...prev]);
    setIsBlogModalOpen(false);
    setNewArticle({ title: '', content: '', image: 'https://images.unsplash.com/photo-1529193591184-b1d58fab356c?auto=format&fit=crop&w=400&h=300&q=80' });
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
      <div className="flex gap-4 overflow-x-auto no-scrollbar mb-12">
        {[
          { id: 'dashboard', label: 'Resumo', icon: 'fa-chart-line' },
          { id: 'orders', label: 'Pedidos', icon: 'fa-receipt' },
          { id: 'inventory', label: 'Estoque', icon: 'fa-boxes-stacked' },
          { id: 'blog', label: 'Blog', icon: 'fa-newspaper' },
          { id: 'store', label: 'Marca', icon: 'fa-palette' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-4 px-8 py-5 rounded-2xl font-black uppercase text-sm border-2 transition-all ${activeTab === tab.id ? 'bg-onyx text-white border-onyx' : 'bg-white text-gray-400 border-gray-100'}`}>
            <i className={`fas ${tab.icon} ${activeTab === tab.id ? 'text-ferrari' : 'text-gray-300'}`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'blog' && (
        <div className="space-y-12">
          <div className="flex justify-between items-center bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h3 className="text-3xl font-black uppercase text-onyx tracking-tighter">Módulo Blog</h3>
            <button onClick={() => setIsBlogModalOpen(true)} className="bg-ferrari text-white px-10 py-5 rounded-2xl font-black uppercase shadow-xl flex items-center gap-4">
              <i className="fas fa-pen-nib"></i> NOVO ARTIGO
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map(art => (
              <div key={art.id} className="bg-white p-6 rounded-3xl border border-gray-100 flex flex-col gap-4">
                <img src={art.image} className="w-full h-32 object-cover rounded-xl" />
                <h4 className="font-black text-onyx uppercase text-lg leading-tight">{art.title}</h4>
                <button onClick={() => setArticles(prev => prev.filter(a => a.id !== art.id))} className="text-red-500 font-black uppercase text-[10px] self-end">Excluir</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Blog */}
      {isBlogModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-white w-full max-w-4xl rounded-[4rem] shadow-2xl overflow-hidden border border-white/20">
            <form onSubmit={handleSaveArticle} className="p-12 space-y-10">
              <div className="flex justify-between items-center">
                <h3 className={`text-4xl ${textClass}`}>Nova Dica do Barão</h3>
                <button type="button" onClick={() => setIsBlogModalOpen(false)} className="text-gray-300 hover:text-ferrari transition-all"><i className="fas fa-times text-4xl"></i></button>
              </div>
              <div className="space-y-3">
                <label className={`text-xs pl-4 ${textClass}`}>Título</label>
                <input type="text" required value={newArticle.title} onChange={e => setNewArticle({...newArticle, title: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-6 font-black uppercase outline-none shadow-inner" />
              </div>
              <div className="space-y-3">
                <label className={`text-xs pl-4 ${textClass}`}>Conteúdo</label>
                <textarea required value={newArticle.content} onChange={e => setNewArticle({...newArticle, content: e.target.value})} rows={6} className="w-full bg-slate-50 border-none rounded-2xl p-6 font-black uppercase outline-none shadow-inner resize-none" />
              </div>
              <div className="flex items-center gap-10">
                <img src={newArticle.image} className="w-32 h-32 rounded-3xl object-cover shadow-xl border-4 border-white" />
                <button type="button" onClick={() => blogFileInputRef.current?.click()} className="px-10 py-5 bg-slate-100 text-gray-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200">BUSCAR IMAGEM</button>
                <input type="file" ref={blogFileInputRef} onChange={handleArticleImageUpload} className="hidden" />
              </div>
              <button type="submit" className="w-full bg-onyx text-white py-8 rounded-[2.5rem] font-black uppercase tracking-[0.3em] hover:bg-ferrari transition-all shadow-2xl">PUBLICAR NO BLOG</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
