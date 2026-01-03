
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'inventory' | 'store' | 'tips'>('dashboard');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isTipsModalOpen, setIsTipsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const restoreInputRef = useRef<HTMLInputElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);
  const tipsFileInputRef = useRef<HTMLInputElement>(null);

  const [newArticle, setNewArticle] = useState<Partial<Article>>({
    title: '', content: '', image: 'https://images.unsplash.com/photo-1529193591184-b1d58fab356c?auto=format&fit=crop&w=400&h=300&q=80'
  });

  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    category: Category.TRADITIONAL, name: '', stock: 0, cost: 0, price: 0, weight: '', description: '', image: 'https://picsum.photos/seed/espeto/400/300'
  });

  const stats = useMemo(() => {
    const validOrders = orders.filter(o => o.status !== OrderStatus.CANCELLED);
    const revenue = validOrders.reduce((acc, o) => acc + o.total, 0);
    const cost = validOrders.reduce((acc, o) => acc + o.items.reduce((sum, item) => sum + (item.cost * item.quantity), 0), 0);
    return { revenue, profit: revenue - cost, totalOrders: orders.length };
  }, [orders]);

  const groupedProducts = useMemo(() => {
    return products.reduce((acc, product) => {
      const cat = product.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(product);
      return acc;
    }, {} as Record<string, Product[]>);
  }, [products]);

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProductId) {
      setProducts(prev => prev.map(p => p.id === editingProductId ? { ...p, ...newProduct as Product } : p));
    } else {
      const productToAdd: Product = { ...newProduct as Product, id: Date.now().toString(), description: newProduct.description || `${newProduct.name} premium.` };
      setProducts(prev => [...prev, productToAdd]);
    }
    setIsProductModalOpen(false);
    setEditingProductId(null);
  };

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
    setIsTipsModalOpen(false);
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

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
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
            <p className="text-gray-400 font-bold uppercase text-xs tracking-[0.5em] mt-3">Painel Administrativo Premium</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onLogout} className="px-8 py-5 bg-onyx text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-ferrari transition-all flex items-center gap-3">
            <i className="fas fa-power-off"></i> SAIR
          </button>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar mb-12">
        {[
          { id: 'dashboard', label: 'Resumo', icon: 'fa-chart-line' },
          { id: 'orders', label: 'Pedidos', icon: 'fa-receipt' },
          { id: 'inventory', label: 'Estoque', icon: 'fa-boxes-stacked' },
          { id: 'tips', label: 'Dicas do Barão', icon: 'fa-lightbulb' },
          { id: 'store', label: 'Marca', icon: 'fa-palette' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-4 px-8 py-5 rounded-2xl font-black uppercase text-sm border-2 transition-all ${activeTab === tab.id ? 'bg-onyx text-white border-onyx shadow-xl' : 'bg-white text-gray-400 border-gray-100'}`}>
            <i className={`fas ${tab.icon} ${activeTab === tab.id ? 'text-ferrari' : 'text-gray-300'}`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-16">
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
               <span className="text-xs font-black uppercase text-gray-400 tracking-[0.4em] block mb-3">FATURAMENTO</span>
               <span className="text-3xl font-black text-onyx">R$ {stats.revenue.toFixed(2)}</span>
            </div>
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
               <span className="text-xs font-black uppercase text-gray-400 tracking-[0.4em] block mb-3">LUCRO BRUTO</span>
               <span className="text-3xl font-black text-onyx">R$ {stats.profit.toFixed(2)}</span>
            </div>
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
               <span className="text-xs font-black uppercase text-gray-400 tracking-[0.4em] block mb-3">PEDIDOS</span>
               <span className="text-3xl font-black text-onyx">{stats.totalOrders}</span>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50">
                  <th className="p-10 font-black uppercase text-gray-400">PEDIDO</th>
                  <th className="p-10 font-black uppercase text-gray-400">CLIENTE</th>
                  <th className="p-10 font-black uppercase text-gray-400">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice().reverse().map(order => (
                  <tr key={order.id} className="border-t">
                    <td className="p-10 font-black text-ferrari text-2xl">#{order.id}</td>
                    <td className="p-10 font-black uppercase text-onyx">{order.customer.name}</td>
                    <td className="p-10">
                      <select value={order.status} onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)} className="p-3 bg-slate-50 rounded-xl font-black uppercase text-xs">
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

        {activeTab === 'inventory' && (
          <div className="space-y-12 animate-fade-in-up">
            <div className="flex justify-between items-center bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
              <h3 className="text-3xl font-black uppercase text-onyx tracking-tighter">Estoque</h3>
              <button onClick={() => { setEditingProductId(null); setIsProductModalOpen(true); }} className="bg-ferrari text-white px-10 py-5 rounded-2xl font-black uppercase shadow-xl flex items-center gap-4">
                <i className="fas fa-plus"></i> NOVO ITEM
              </button>
            </div>
            {/* Cast Object.entries result to fix potential "unknown" inference in some TS environments */}
            {(Object.entries(groupedProducts) as [string, Product[]][]).map(([category, prods]) => (
              <div key={category} className="space-y-6">
                <h4 className="text-2xl font-black text-onyx uppercase tracking-tighter border-l-8 border-ferrari pl-4">{CATEGORY_LABELS[category as Category]}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {prods.map(p => (
                    <div key={p.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 flex items-center gap-4 shadow-sm group">
                      <img src={p.image} className="w-20 h-20 rounded-2xl object-cover shadow-md group-hover:scale-110 transition-transform" />
                      <div className="flex-grow">
                        <h4 className="font-black text-onyx uppercase text-lg leading-tight">{p.name}</h4>
                        <p className="text-xs font-bold text-gray-400 uppercase mt-1">Estoque: {p.stock} un</p>
                      </div>
                      <button onClick={() => { setEditingProductId(p.id); setNewProduct(p); setIsProductModalOpen(true); }} className="w-10 h-10 bg-onyx text-white rounded-xl flex items-center justify-center hover:bg-ferrari transition-all">
                        <i className="fas fa-edit"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'tips' && (
          <div className="space-y-12 animate-fade-in-up">
            <div className="flex justify-between items-center bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
              <div>
                <h3 className="text-3xl font-black uppercase text-onyx tracking-tighter">Dicas do Barão</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Publique conteúdo para seus clientes</p>
              </div>
              <button onClick={() => setIsTipsModalOpen(true)} className="bg-ferrari text-white px-10 py-5 rounded-2xl font-black uppercase shadow-xl flex items-center gap-4 hover:scale-105 transition-all">
                <i className="fas fa-plus"></i> NOVA DICA
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map(art => (
                <div key={art.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 flex flex-col gap-4 shadow-sm group">
                  <img src={art.image} className="w-full h-40 object-cover rounded-2xl shadow-md group-hover:scale-105 transition-transform" />
                  <h4 className="font-black text-onyx uppercase text-lg leading-tight line-clamp-2">{art.title}</h4>
                  <button onClick={() => setArticles(prev => prev.filter(a => a.id !== art.id))} className="text-red-500 font-black uppercase text-[10px] self-end flex items-center gap-2">
                    <i className="fas fa-trash"></i> Excluir
                  </button>
                </div>
              ))}
              {articles.length === 0 && (
                <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-100">
                  <p className="font-black text-slate-300 uppercase tracking-widest">Nenhuma dica publicada.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'store' && (
          <div className="bg-white rounded-[3rem] p-16 shadow-sm border border-gray-100 animate-fade-in-up max-w-4xl">
            <h3 className="text-4xl font-black uppercase tracking-tighter text-onyx mb-12 flex items-center gap-8">
              <i className="fas fa-image text-ferrari text-5xl"></i> Identidade Visual
            </h3>
            <div className="flex flex-col items-center gap-12 p-16 border-4 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/50">
              <img src={logo} alt="Logo" className="w-48 h-48 rounded-[2rem] object-cover shadow-2xl border-4 border-white" />
              <button onClick={() => fileInputRef.current?.click()} className="px-16 py-8 bg-onyx text-white rounded-[2rem] font-black uppercase text-base tracking-[0.2em] hover:bg-ferrari transition-all flex items-center gap-6 shadow-2xl">
                <i className="fas fa-upload text-2xl"></i> ATUALIZAR LOGO
                <input type="file" ref={fileInputRef} onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setLogo(reader.result as string);
                    reader.readAsDataURL(file);
                  }
                }} accept="image/*" className="hidden" />
              </button>
            </div>
          </div>
        )}
      </div>

      {isTipsModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-white w-full max-w-4xl rounded-[4rem] shadow-2xl overflow-hidden border border-white/20 animate-fade-in-up">
            <div className="h-4 header-animated"></div>
            <form onSubmit={handleSaveArticle} className="p-12 space-y-10">
              <div className="flex justify-between items-center">
                <h3 className={`text-4xl ${textClass}`}>Nova Dica do Barão</h3>
                <button type="button" onClick={() => setIsTipsModalOpen(false)} className="text-gray-300 hover:text-ferrari transition-all"><i className="fas fa-times text-4xl"></i></button>
              </div>
              
              <div className="space-y-3">
                <label className={`text-xs pl-4 ${textClass}`}>Campo Um: Título</label>
                <input type="text" required value={newArticle.title} onChange={e => setNewArticle({...newArticle, title: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-6 font-black uppercase outline-none shadow-inner" />
              </div>
              
              <div className="space-y-3">
                <label className={`text-xs pl-4 ${textClass}`}>Campo Dois: Conteúdo</label>
                <textarea required value={newArticle.content} onChange={e => setNewArticle({...newArticle, content: e.target.value})} rows={6} className="w-full bg-slate-50 border-none rounded-2xl p-6 font-black uppercase outline-none shadow-inner resize-none" />
              </div>
              
              <div className="flex items-center gap-10">
                <div className="space-y-3">
                  <label className={`text-xs pl-4 ${textClass}`}>Campo Três: Upload Imagem</label>
                  <div className="flex items-center gap-6">
                    <img src={newArticle.image} className="w-32 h-32 rounded-3xl object-cover shadow-xl border-4 border-white" />
                    <button type="button" onClick={() => tipsFileInputRef.current?.click()} className="px-10 py-5 bg-slate-100 text-gray-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200">SELECIONAR FOTO</button>
                    <input type="file" ref={tipsFileInputRef} onChange={handleArticleImageUpload} className="hidden" accept="image/*" />
                  </div>
                </div>
              </div>
              
              <button type="submit" className="w-full bg-onyx text-white py-8 rounded-[2.5rem] font-black uppercase tracking-[0.3em] hover:bg-ferrari transition-all shadow-2xl">
                SALVAR E PUBLICAR
              </button>
            </form>
          </div>
        </div>
      )}

      {isProductModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-white w-full max-w-4xl rounded-[4rem] shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="h-4 header-animated"></div>
            <form onSubmit={handleSaveProduct} className="p-12 space-y-10">
              <h3 className={`text-4xl ${textClass}`}>{editingProductId ? 'Editar Item' : 'Novo Item'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className={`text-xs pl-4 ${textClass}`}>Nome</label>
                  <input type="text" required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-6 font-black outline-none shadow-inner" />
                </div>
                <div className="space-y-3">
                  <label className={`text-xs pl-4 ${textClass}`}>Categoria</label>
                  <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value as Category})} className="w-full bg-slate-50 rounded-2xl p-6 font-black outline-none shadow-inner">
                    {Object.entries(CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <input type="number" step="0.01" required placeholder="Preço" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})} className="w-full bg-slate-50 rounded-2xl p-6 font-black shadow-inner" />
                <input type="number" required placeholder="Estoque" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value)})} className="w-full bg-slate-50 rounded-2xl p-6 font-black shadow-inner" />
                <input type="number" step="0.01" required placeholder="Custo" value={newProduct.cost} onChange={e => setNewProduct({...newProduct, cost: parseFloat(e.target.value)})} className="w-full bg-slate-50 rounded-2xl p-6 font-black shadow-inner" />
              </div>
              <div className="flex items-center gap-10">
                <img src={newProduct.image} className="w-32 h-32 rounded-3xl object-cover shadow-xl" />
                <button type="button" onClick={() => modalFileInputRef.current?.click()} className="px-10 py-5 bg-slate-100 rounded-2xl font-black uppercase text-[10px]">MUDAR FOTO</button>
                <input type="file" ref={modalFileInputRef} onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setNewProduct(prev => ({ ...prev, image: reader.result as string }));
                    reader.readAsDataURL(file);
                  }
                }} className="hidden" />
              </div>
              <button type="submit" className="w-full bg-onyx text-white py-8 rounded-[2rem] font-black uppercase tracking-[0.3em] hover:bg-ferrari transition-all shadow-2xl">SALVAR ITEM</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
