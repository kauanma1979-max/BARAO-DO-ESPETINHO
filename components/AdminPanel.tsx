
import React, { useState, useMemo, useRef } from 'react';
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
  const [isGenerating, setIsGenerating] = useState(false);

  const [newArticle, setNewArticle] = useState<Partial<Article>>({
    title: '',
    excerpt: '',
    content: '',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    author: 'Mestre Barão',
    tags: ['Churrasco']
  });

  const generateSEOArticle = async () => {
    if (!newArticle.title) {
        alert("Digite um título para guiar a IA!");
        return;
    }
    setIsGenerating(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Escreva um artigo de blog profissional e otimizado para SEO com aproximadamente 800 palavras sobre: "${newArticle.title}". 
        O tom deve ser de autoridade em churrasco, premium e apetitoso. 
        Inclua introdução, subtítulos informativos e uma conclusão. 
        Retorne apenas o texto do corpo do artigo com parágrafos separados por duas quebras de linha.`;
        
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: prompt
        });
        
        const text = response.text || '';
        setNewArticle(prev => ({ 
            ...prev, 
            content: text,
            excerpt: text.slice(0, 150) + "..."
        }));
    } catch (error) {
        console.error("Erro na geração:", error);
        alert("Falha ao gerar conteúdo via IA.");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleSaveArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingArticleId) {
        setArticles(prev => prev.map(a => a.id === editingArticleId ? { ...a, ...newArticle as Article } : a));
    } else {
        const art: Article = {
            ...newArticle as Article,
            id: 'art-' + Date.now(),
            date: new Date().toISOString()
        };
        setArticles(prev => [art, ...prev]);
    }
    setIsArticleModalOpen(false);
    setEditingArticleId(null);
  };

  // ... (Estatísticas e outras funções existentes) ...
  const stats = useMemo(() => {
    const shippedOrders = orders.filter(o => o.status === OrderStatus.SHIPPED);
    const revenue = shippedOrders.reduce((acc, o) => acc + o.total, 0);
    return { revenue, totalOrders: orders.length };
  }, [orders]);

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
        <button onClick={onLogout} className="px-8 py-5 bg-onyx text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-ferrari transition-all flex items-center gap-3 shadow-sm">
            <i className="fas fa-power-off"></i> SAIR
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar mb-12 -mx-4 px-4">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-line' },
          { id: 'orders', label: 'Pedidos', icon: 'fa-receipt' },
          { id: 'inventory', label: 'Estoque', icon: 'fa-boxes-stacked' },
          { id: 'articles', label: 'Dicas/Blog', icon: 'fa-newspaper' },
          { id: 'store', label: 'Marca', icon: 'fa-palette' },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-6 px-10 py-7 rounded-[2rem] font-black uppercase text-base tracking-[0.1em] transition-all border-2 ${activeTab === tab.id ? 'bg-onyx text-white border-onyx shadow-2xl scale-105' : 'bg-white text-gray-400 border-gray-100'}`}
          >
            <i className={`fas ${tab.icon} text-2xl ${activeTab === tab.id ? 'text-ferrari' : 'text-gray-300'}`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'articles' && (
        <div className="space-y-12 animate-fade-in-up">
            <div className="flex justify-between items-center bg-white p-12 rounded-[3.5rem] shadow-sm border border-gray-100">
              <div>
                <h3 className="text-4xl font-black uppercase tracking-tighter text-onyx">Dicas do Barão (CMS)</h3>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2">Crie conteúdo épico para SEO</p>
              </div>
              <button 
                onClick={() => { setEditingArticleId(null); setNewArticle({ title: '', excerpt: '', content: '', author: 'Mestre Barão', tags: ['Churrasco'], image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80' }); setIsArticleModalOpen(true); }}
                className="bg-ferrari text-white px-12 py-7 rounded-[2rem] font-black uppercase text-base tracking-[0.1em] shadow-xl hover:scale-105 transition-all flex items-center gap-5"
              >
                <i className="fas fa-plus"></i> NOVO ARTIGO
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map(art => (
                    <div key={art.id} className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 flex items-center gap-6 relative group">
                        <img src={art.image} className="w-24 h-24 rounded-2xl object-cover" />
                        <div className="flex-grow">
                            <h4 className="font-black text-onyx uppercase tracking-tighter text-lg leading-tight line-clamp-2">{art.title}</h4>
                            <span className="text-[10px] font-black text-gray-300 uppercase">{new Date(art.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <button onClick={() => { setEditingArticleId(art.id); setNewArticle(art); setIsArticleModalOpen(true); }} className="w-10 h-10 bg-onyx text-white rounded-xl flex items-center justify-center hover:bg-ferrari transition-all"><i className="fas fa-edit"></i></button>
                            <button onClick={() => setArticles(prev => prev.filter(a => a.id !== art.id))} className="w-10 h-10 bg-slate-100 text-gray-400 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><i className="fas fa-trash"></i></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {isArticleModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <div className="bg-white w-full max-w-5xl rounded-[4rem] shadow-2xl overflow-y-auto max-h-[90vh] p-12 space-y-10 border border-white/20">
                <div className="flex justify-between items-center">
                    <h3 className={`text-4xl ${textClass}`}>{editingArticleId ? 'Editar Artigo' : 'Novo Artigo SEO'}</h3>
                    <button onClick={() => setIsArticleModalOpen(false)} className="text-gray-300 hover:text-ferrari transition-all"><i className="fas fa-times text-4xl"></i></button>
                </div>
                
                <form onSubmit={handleSaveArticle} className="space-y-8">
                    <div className="space-y-3">
                        <label className={`text-xs pl-4 ${textClass}`}>Título do Artigo (H1)</label>
                        <div className="flex gap-4">
                            <input type="text" required value={newArticle.title} onChange={e => setNewArticle({...newArticle, title: e.target.value})} className="flex-grow bg-slate-50 border-none rounded-2xl p-6 font-black uppercase outline-none shadow-inner" placeholder="EX: OS 5 SEGREDOS DA PICANHA PERFEITA" />
                            <button type="button" onClick={generateSEOArticle} disabled={isGenerating} className="bg-onyx text-white px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-ferrari transition-all flex items-center gap-3">
                                {isGenerating ? <i className="fas fa-spinner animate-spin"></i> : <i className="fas fa-robot"></i>}
                                {isGenerating ? 'GERANDO...' : 'GERAR IA SEO'}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className={`text-xs pl-4 ${textClass}`}>Conteúdo Completo (Aprox. 800 palavras)</label>
                        <textarea value={newArticle.content} onChange={e => setNewArticle({...newArticle, content: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-8 font-medium text-lg h-96 outline-none shadow-inner resize-none" placeholder="O CONTEÚDO SERÁ EXIBIDO AQUI..." />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className={`text-xs pl-4 ${textClass}`}>Resumo (Meta-Description)</label>
                            <input type="text" value={newArticle.excerpt} onChange={e => setNewArticle({...newArticle, excerpt: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-6 font-black uppercase outline-none shadow-inner" />
                        </div>
                        <div className="space-y-3">
                            <label className={`text-xs pl-4 ${textClass}`}>URL da Imagem</label>
                            <input type="text" value={newArticle.image} onChange={e => setNewArticle({...newArticle, image: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-6 font-black outline-none shadow-inner" />
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-onyx text-white py-8 rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-sm hover:bg-ferrari transition-all shadow-2xl">
                        SALVAR ARTIGO NO BLOG
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* ... Outras abas (dashboard, inventory, etc) permanecem ... */}
    </div>
  );
};

export default AdminPanel;
