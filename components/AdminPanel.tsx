
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
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [newArticle, setNewArticle] = useState<Partial<Article>>({
    title: '', excerpt: '', content: '', author: 'Mestre Barão', tags: ['Churrasco'],
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'
  });

  const stats = useMemo(() => {
    const totalSales = orders.filter(o => o.status !== OrderStatus.CANCELLED).reduce((acc, o) => acc + o.total, 0);
    const profit = orders.filter(o => o.status !== OrderStatus.CANCELLED).reduce((acc, o) => {
        const cost = o.items.reduce((c, item) => c + (item.cost * item.quantity), 0);
        return acc + (o.subtotal - cost);
    }, 0);
    return { totalSales, profit, ordersCount: orders.length };
  }, [orders]);

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
            contents: `Artigo SEO 800 palavras sobre: "${newArticle.title}" para um blog de churrasco premium. Use H2, dicas práticas e tom de autoridade.`
        });
        const text = response.text || '';
        setNewArticle(prev => ({ ...prev, content: text, excerpt: text.slice(0, 150) + "..." }));
    } catch (error) { alert("Erro ao gerar artigo."); } finally { setIsGenerating(false); }
  };

  const textClass = "text-black text-shadow-gray font-black uppercase tracking-tighter";

  return (
    <div className="py-8 animate-fade-in px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-ferrari rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl">
             <i className="fas fa-sliders-h text-3xl"></i>
          </div>
          <div>
            <h2 className="text-4xl font-black font-heading text-onyx uppercase tracking-tighter italic leading-none">Gestão <span className="text-ferrari">Barão</span></h2>
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.4em] mt-2">PDV & Conteúdo Premium</p>
          </div>
        </div>
        <button onClick={onLogout} className="px-6 py-4 bg-onyx text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-ferrari transition-all flex items-center gap-3">
            SAIR DO PAINEL
        </button>
      </div>

      {/* Tabs Menu */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-10 -mx-4 px-4">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie' },
          { id: 'orders', label: 'Pedidos', icon: 'fa-receipt' },
          { id: 'inventory', label: 'Estoque', icon: 'fa-boxes-stacked' },
          { id: 'articles', label: 'Dicas/Blog', icon: 'fa-newspaper' },
          { id: 'store', label: 'Marca', icon: 'fa-paint-brush' },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-4 px-8 py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-[0.1em] transition-all border-2 ${activeTab === tab.id ? 'bg-onyx text-white border-onyx shadow-xl' : 'bg-white text-gray-400 border-gray-100'}`}
          >
            <i className={`fas ${tab.icon} ${activeTab === tab.id ? 'text-ferrari' : 'text-gray-300'}`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
            <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Vendas Totais</p>
                <h4 className="text-4xl font-black text-onyx">R$ {stats.totalSales.toFixed(2)}</h4>
            </div>
            <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Lucro Bruto</p>
                <h4 className="text-4xl font-black text-ferrari">R$ {stats.profit.toFixed(2)}</h4>
            </div>
            <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Pedidos</p>
                <h4 className="text-4xl font-black text-onyx">{stats.ordersCount}</h4>
            </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-black uppercase text-onyx">Controle de Estoque</h3>
                <button className="bg-onyx text-white px-6 py-3 rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-ferrari transition-all">Exportar CSV</button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-gray-100">
                        <tr>
                            <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Produto</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Categoria</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Custo</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Preço Venda</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Estoque</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(p => (
                            <tr key={p.id} className="border-b border-gray-50 hover:bg-slate-50 transition-colors">
                                <td className="px-8 py-5">
                                    <input type="text" value={p.name} onChange={e => handleUpdateProduct(p.id, 'name', e.target.value)} className="bg-transparent border-none font-black text-onyx uppercase focus:ring-0 w-full" />
                                </td>
                                <td className="px-8 py-5">
                                    <select value={p.category} onChange={e => handleUpdateProduct(p.id, 'category', e.target.value)} className="bg-transparent border-none font-bold text-gray-400 text-xs uppercase focus:ring-0">
                                        {Object.entries(CATEGORY_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                                    </select>
                                </td>
                                <td className="px-8 py-5">
                                    <input type="number" value={p.cost} onChange={e => handleUpdateProduct(p.id, 'cost', parseFloat(e.target.value))} className="bg-transparent border-none font-black text-gray-400 focus:ring-0 w-24" />
                                </td>
                                <td className="px-8 py-5">
                                    <input type="number" value={p.price} onChange={e => handleUpdateProduct(p.id, 'price', parseFloat(e.target.value))} className="bg-transparent border-none font-black text-ferrari focus:ring-0 w-24" />
                                </td>
                                <td className="px-8 py-5">
                                    <input type="number" value={p.stock} onChange={e => handleUpdateProduct(p.id, 'stock', parseInt(e.target.value))} className="bg-transparent border-none font-black text-onyx focus:ring-0 w-16" />
                                </td>
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
                <h3 className="text-2xl font-black uppercase text-onyx">Blog / Dicas do Barão</h3>
                <button onClick={() => { setEditingArticleId(null); setNewArticle({ title: '', excerpt: '', content: '', author: 'Mestre Barão', tags: ['Churrasco'] }); setIsArticleModalOpen(true); }} className="bg-ferrari text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:scale-105 transition-all">Novo Artigo</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map(art => (
                    <div key={art.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-4">
                        <img src={art.image} className="w-16 h-16 rounded-xl object-cover" />
                        <div className="flex-grow">
                            <h4 className="font-black text-onyx uppercase text-sm leading-tight line-clamp-1">{art.title}</h4>
                            <span className="text-[10px] font-bold text-gray-300">{new Date(art.date).toLocaleDateString()}</span>
                        </div>
                        <button onClick={() => { setEditingArticleId(art.id); setNewArticle(art); setIsArticleModalOpen(true); }} className="text-gray-400 hover:text-ferrari"><i className="fas fa-edit"></i></button>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* Reutilizar modal de artigos com IA */}
      {isArticleModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <div className="bg-white w-full max-w-4xl rounded-[3.5rem] p-10 space-y-8 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center">
                    <h3 className={textClass + " text-3xl"}>Redator Barão IA</h3>
                    <button onClick={() => setIsArticleModalOpen(false)}><i className="fas fa-times text-2xl"></i></button>
                </div>
                <div className="space-y-4">
                    <input type="text" placeholder="TÍTULO DO ARTIGO..." value={newArticle.title} onChange={e => setNewArticle({...newArticle, title: e.target.value})} className="w-full bg-slate-50 p-6 rounded-2xl font-black uppercase focus:ring-2 focus:ring-ferrari outline-none" />
                    <button onClick={generateSEOArticle} disabled={isGenerating} className="bg-onyx text-white w-full py-5 rounded-2xl font-black uppercase flex items-center justify-center gap-3">
                        {isGenerating ? <i className="fas fa-spinner animate-spin"></i> : <i className="fas fa-robot"></i>}
                        {isGenerating ? 'GERANDO CONTEÚDO...' : 'GERAR ARTIGO SEO 800 PALAVRAS'}
                    </button>
                    <textarea value={newArticle.content} onChange={e => setNewArticle({...newArticle, content: e.target.value})} className="w-full bg-slate-50 p-6 rounded-2xl font-medium text-lg h-64 outline-none resize-none" placeholder="O CONTEÚDO SERÁ EXIBIDO AQUI..." />
                </div>
                <button onClick={() => {
                    if (editingArticleId) setArticles(prev => prev.map(a => a.id === editingArticleId ? {...a, ...newArticle as Article} : a));
                    else setArticles(prev => [{...newArticle as Article, id: 'art-'+Date.now(), date: new Date().toISOString()}, ...prev]);
                    setIsArticleModalOpen(false);
                }} className="bg-ferrari text-white w-full py-6 rounded-2xl font-black uppercase shadow-xl">Salvar Artigo</button>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
