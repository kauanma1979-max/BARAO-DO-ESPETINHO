
import React, { useState, useMemo } from 'react';
import { Product, Order, OrderStatus, Category, Article } from '../types';
import { CATEGORY_LABELS } from '../constants';
import { GoogleGenAI } from "@google/genai";

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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'inventory' | 'articles' | 'store'>('dashboard');
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [newArticle, setNewArticle] = useState<Partial<Article>>({
    title: '', excerpt: '', content: '', author: 'Mestre Barão', tags: ['Churrasco'],
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'
  });

  const stats = useMemo(() => {
    const validOrders = orders.filter(o => o.status !== OrderStatus.CANCELLED);
    const revenue = validOrders.reduce((acc, o) => acc + o.total, 0);
    
    // Ranking de mais vendidos
    const ranking = products.map(p => {
      const quantity = validOrders.reduce((acc, o) => acc + (o.items.find(i => i.id === p.id)?.quantity || 0), 0);
      return { ...p, quantity };
    }).sort((a, b) => b.quantity - a.quantity);

    return { revenue, totalOrders: orders.length, ranking };
  }, [orders, products]);

  const handleUpdateProduct = (id: string, field: keyof Product, value: any) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const generateSEOArticle = async () => {
    if (!newArticle.title) { alert("Digite um título!"); return; }
    setIsGenerating(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: `Escreva um artigo SEO de blog com 800 palavras sobre: "${newArticle.title}" para um blog de churrasco premium.`
        });
        const text = response.text || '';
        setNewArticle(prev => ({ ...prev, content: text, excerpt: text.slice(0, 150) + "..." }));
    } catch (error) { alert("Erro ao gerar conteúdo."); } finally { setIsGenerating(false); }
  };

  return (
    <div className="py-8 animate-fade-in px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
        <h2 className="text-4xl font-black font-heading text-onyx uppercase tracking-tighter italic">Gestão <span className="text-ferrari">Barão</span></h2>
        <button onClick={onLogout} className="px-6 py-4 bg-onyx text-white rounded-xl font-black uppercase text-[10px] tracking-widest">SAIR</button>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-10">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie' },
          { id: 'orders', label: 'Pedidos', icon: 'fa-receipt' },
          { id: 'inventory', label: 'Estoque', icon: 'fa-boxes-stacked' },
          { id: 'articles', label: 'Dicas/Blog', icon: 'fa-newspaper' },
          { id: 'store', label: 'Marca', icon: 'fa-paint-brush' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-3 px-8 py-5 rounded-2xl font-black uppercase text-xs border-2 ${activeTab === tab.id ? 'bg-onyx text-white border-onyx' : 'bg-white text-gray-400 border-gray-100'}`}>
            <i className={`fas ${tab.icon} ${activeTab === tab.id ? 'text-ferrari' : ''}`}></i> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-10 animate-fade-in-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Faturamento Total</p>
                <h4 className="text-4xl font-black text-onyx">R$ {stats.revenue.toFixed(2)}</h4>
            </div>
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Total Pedidos</p>
                <h4 className="text-4xl font-black text-ferrari">{stats.totalOrders}</h4>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h3 className="text-xl font-black uppercase mb-8">🔥 Ranking de Mais Vendidos</h3>
            <div className="space-y-4">
              {stats.ranking.slice(0, 5).map((p, idx) => (
                <div key={p.id} className="flex items-center gap-6 p-4 bg-slate-50 rounded-2xl">
                  <span className="w-8 h-8 flex items-center justify-center bg-onyx text-white rounded-full font-black">{idx + 1}</span>
                  <img src={p.image} className="w-12 h-12 rounded-xl object-cover" />
                  <div className="flex-grow"><p className="font-black text-onyx uppercase">{p.name}</p></div>
                  <div className="text-right"><p className="font-black text-ferrari">{p.quantity} un</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-8 text-[10px] font-black uppercase text-gray-400 tracking-widest">Pedido</th>
                <th className="p-8 text-[10px] font-black uppercase text-gray-400 tracking-widest">Cliente</th>
                <th className="p-8 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Entrega</th>
                <th className="p-8 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice().reverse().map(order => (
                <tr key={order.id} className="border-b hover:bg-slate-50">
                  <td className="p-8 font-black text-ferrari text-xl">#{order.id}</td>
                  <td className="p-8">
                    <p className="font-black text-onyx uppercase">{order.customer.name}</p>
                    <p className="text-[10px] text-gray-400 uppercase">{order.customer.address}</p>
                  </td>
                  <td className="p-8 text-center">
                    {order.mapsUrl && (
                      <a href={order.mapsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl font-black text-[10px] uppercase text-onyx hover:bg-ferrari hover:text-white transition-all">
                        <i className="fas fa-map-location-dot"></i> VER NO MAPA
                      </a>
                    )}
                  </td>
                  <td className="p-8 text-center">
                    <select value={order.status} onChange={(e) => setOrders(prev => prev.map(o => o.id === order.id ? {...o, status: e.target.value as OrderStatus} : o))} className="bg-slate-50 border-none rounded-xl p-3 font-black text-[10px] uppercase outline-none">
                      <option value={OrderStatus.PENDING}>Pendente</option>
                      <option value={OrderStatus.PREPARING}>Preparando</option>
                      <option value={OrderStatus.SHIPPED}>Enviado</option>
                      <option value={OrderStatus.CANCELLED}>Cancelado</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Produto</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Custo</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Venda</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Estoque</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-b hover:bg-slate-50">
                    <td className="px-8 py-5"><input type="text" value={p.name} onChange={e => handleUpdateProduct(p.id, 'name', e.target.value)} className="bg-transparent border-none font-black text-onyx uppercase w-full" /></td>
                    <td className="px-8 py-5"><input type="number" value={p.cost} onChange={e => handleUpdateProduct(p.id, 'cost', parseFloat(e.target.value))} className="bg-transparent border-none font-black text-gray-400 w-24" /></td>
                    <td className="px-8 py-5"><input type="number" value={p.price} onChange={e => handleUpdateProduct(p.id, 'price', parseFloat(e.target.value))} className="bg-transparent border-none font-black text-ferrari w-24" /></td>
                    <td className="px-8 py-5"><input type="number" value={p.stock} onChange={e => handleUpdateProduct(p.id, 'stock', parseInt(e.target.value))} className="bg-transparent border-none font-black text-onyx w-16" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'articles' && (
        <div className="space-y-8 animate-fade-in-up">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 flex justify-between items-center">
                <h3 className="text-2xl font-black uppercase">Conteúdo do Blog</h3>
                <button onClick={() => { setEditingArticleId(null); setNewArticle({ title: '', excerpt: '', content: '', author: 'Mestre Barão', tags: ['Churrasco'] }); setIsArticleModalOpen(true); }} className="bg-ferrari text-white px-8 py-4 rounded-xl font-black uppercase text-xs">Novo Artigo</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {articles.map(art => (
                    <div key={art.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-4">
                        <img src={art.image} className="w-16 h-16 rounded-xl object-cover" />
                        <div className="flex-grow"><h4 className="font-black text-onyx uppercase text-sm line-clamp-1">{art.title}</h4></div>
                        <button onClick={() => { setEditingArticleId(art.id); setNewArticle(art); setIsArticleModalOpen(true); }} className="text-gray-400 hover:text-ferrari"><i className="fas fa-edit"></i></button>
                    </div>
                ))}
            </div>
        </div>
      )}

      {isArticleModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <div className="bg-white w-full max-w-4xl rounded-[3rem] p-10 space-y-8 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center"><h3 className="text-2xl font-black uppercase">Editor Barão IA</h3><button onClick={() => setIsArticleModalOpen(false)}><i className="fas fa-times text-2xl"></i></button></div>
                <div className="space-y-4">
                    <input type="text" placeholder="TÍTULO..." value={newArticle.title} onChange={e => setNewArticle({...newArticle, title: e.target.value})} className="w-full bg-slate-50 p-6 rounded-2xl font-black uppercase" />
                    <button onClick={generateSEOArticle} disabled={isGenerating} className="bg-onyx text-white w-full py-5 rounded-2xl font-black uppercase flex items-center justify-center gap-3">
                        {isGenerating ? <i className="fas fa-spinner animate-spin"></i> : <i className="fas fa-robot"></i>} {isGenerating ? 'GERANDO...' : 'GERAR ARTIGO SEO 800 PALAVRAS'}
                    </button>
                    <textarea value={newArticle.content} onChange={e => setNewArticle({...newArticle, content: e.target.value})} className="w-full bg-slate-50 p-6 rounded-2xl h-64 outline-none resize-none" />
                </div>
                <button onClick={() => {
                    if (editingArticleId) setArticles(prev => prev.map(a => a.id === editingArticleId ? {...a, ...newArticle as Article} : a));
                    else setArticles(prev => [{...newArticle as Article, id: 'art-'+Date.now(), date: new Date().toISOString()}, ...prev]);
                    setIsArticleModalOpen(false);
                }} className="bg-ferrari text-white w-full py-6 rounded-2xl font-black uppercase">Salvar Artigo</button>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
