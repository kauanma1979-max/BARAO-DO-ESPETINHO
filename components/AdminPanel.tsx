
import React, { useState, useMemo, useRef } from 'react';
import { Product, Order, OrderStatus, Category } from '../types';
import { CATEGORY_LABELS } from '../constants';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Sector, Legend
} from 'recharts';

interface AdminPanelProps {
  products: Product[];
  orders: Order[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  logo: string;
  setLogo: (url: string) => void;
  onLogout: () => void;
  onSync: () => void;
}

const resizeImage = (base64Str: string, maxWidth = 400, maxHeight = 400): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      if (width > height) { if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; } }
      else { if (height > maxHeight) { width *= maxHeight / height; height = maxHeight; } }
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.onerror = () => resolve(base64Str);
  });
};

const AdminPanel: React.FC<AdminPanelProps> = ({ products, orders, setProducts, setOrders, logo, setLogo, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'inventory' | 'store'>('dashboard');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);
  const restoreInputRef = useRef<HTMLInputElement>(null);

  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    category: Category.TRADITIONAL,
    name: '',
    stock: 0,
    cost: 0,
    price: 0,
    description: '',
    image: 'https://picsum.photos/seed/espeto/400/300'
  });

  // --- Lógica de Backup e Restore ---
  const handleBackup = () => {
    const data = { products, orders, logo, timestamp: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_barao_${new Date().toLocaleDateString().replace(/\//g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.products && data.orders) {
          if (confirm('Deseja restaurar este backup? Os dados atuais serão substituídos.')) {
            setProducts(data.products);
            setOrders(data.orders);
            if (data.logo) setLogo(data.logo);
            alert('Backup restaurado com sucesso! 🥩');
          }
        }
      } catch (err) { alert('Erro ao processar o arquivo.'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // --- Formatação de Data e Hora ---
  const formatOrderDate = (dateIso: string) => {
    const date = new Date(dateIso);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  // --- Lógica Analítica Moderna ---
  const dashboardData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    const productSales: Record<string, number> = {};

    orders.forEach(order => {
      order.items.forEach(item => {
        const cat = item.category || Category.TRADITIONAL;
        if (cat === Category.TIPS) return;
        
        categoryTotals[cat] = (categoryTotals[cat] || 0) + (item.price * item.quantity);
        productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
      });
    });

    const pieData = Object.entries(categoryTotals).map(([cat, value]) => ({
      name: CATEGORY_LABELS[cat as Category] || cat,
      value
    })).sort((a, b) => b.value - a.value);

    const barData = Object.entries(productSales).map(([name, value]) => ({
      name: name.toUpperCase(),
      vendas: value
    })).sort((a, b) => b.vendas - a.vendas).slice(0, 10);

    return { pieData, barData };
  }, [orders]);

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProductId) {
      setProducts(prev => prev.map(p => p.id === editingProductId ? { ...p, ...newProduct as Product } : p));
    } else {
      const productToAdd = { ...newProduct as Product, id: Math.random().toString(36).substr(2, 9) };
      setProducts(prev => [...prev, productToAdd]);
    }
    closeModal();
  };

  const openEditModal = (product: Product) => {
    setEditingProductId(product.id);
    setNewProduct(product);
    setIsProductModalOpen(true);
  };

  const closeModal = () => {
    setIsProductModalOpen(false);
    setEditingProductId(null);
    setNewProduct({ category: Category.TRADITIONAL, name: '', stock: 0, cost: 0, price: 0, description: '', image: 'https://picsum.photos/seed/espeto/400/300' });
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const groupedProducts = useMemo(() => {
    return products.reduce((acc: Record<string, Product[]>, product) => {
      const cat = product.category || Category.TRADITIONAL;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(product);
      return acc;
    }, {} as Record<string, Product[]>);
  }, [products]);

  const COLORS = ['#FF2800', '#1A1A1A', '#4A4A4A', '#8B0000', '#333333'];

  const textClass = "text-black text-shadow-gray font-black uppercase tracking-tighter";

  return (
    <div className="py-8 animate-fade-in px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex items-center gap-8">
          <div className="w-20 h-20 bg-ferrari rounded-3xl flex items-center justify-center text-white shadow-xl">
             <i className="fas fa-sliders-h text-3xl"></i>
          </div>
          <div>
            <h2 className="text-4xl font-black font-heading text-onyx uppercase tracking-tighter">Gestão <span className="text-ferrari">Barão</span></h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 italic">Painel Administrativo Local</p>
          </div>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <button onClick={handleBackup} className="flex-1 md:flex-none px-6 py-4 bg-white border border-gray-200 text-onyx rounded-2xl font-black uppercase text-[9px] tracking-widest hover:border-ferrari transition-all flex items-center justify-center gap-2">
            <i className="fas fa-download text-ferrari"></i> BACKUP
          </button>
          <button onClick={() => restoreInputRef.current?.click()} className="flex-1 md:flex-none px-6 py-4 bg-white border border-gray-200 text-onyx rounded-2xl font-black uppercase text-[9px] tracking-widest hover:border-ferrari transition-all flex items-center justify-center gap-2">
            <i className="fas fa-upload text-ferrari"></i> RESTAURAR
          </button>
          <input type="file" ref={restoreInputRef} className="hidden" accept=".json" onChange={handleRestore} />
          <button onClick={onLogout} className="px-8 py-4 bg-onyx text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-ferrari transition-all shadow-lg">SAIR</button>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto no-scrollbar mb-12">
        {[
          { id: 'dashboard', icon: 'fa-chart-pie', label: 'Dashboard' },
          { id: 'orders', icon: 'fa-receipt', label: 'Pedidos' },
          { id: 'inventory', icon: 'fa-boxes-stacked', label: 'Estoque' },
          { id: 'store', icon: 'fa-store', label: 'Loja' }
        ].map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id as any)} 
            className={`px-8 py-6 rounded-[2rem] font-black uppercase text-xs transition-all border-2 flex items-center gap-3 whitespace-nowrap ${activeTab === tab.id ? 'bg-onyx text-white border-onyx shadow-xl scale-105' : 'bg-white text-gray-400 border-gray-50 hover:border-gray-200'}`}
          >
            <i className={`fas ${tab.icon} ${activeTab === tab.id ? 'text-ferrari' : 'text-gray-200'}`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-12 animate-fade-in-up">
          {/* Métricas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-50 hover:border-ferrari transition-all group">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Faturamento Bruto</span>
                <p className="text-5xl font-black text-onyx italic tracking-tighter">R$ {orders.reduce((acc, o) => acc + o.total, 0).toLocaleString('pt-BR')}</p>
                <div className="mt-4 flex items-center gap-2">
                   <div className="w-8 h-1 bg-ferrari rounded-full"></div>
                   <span className="text-[9px] font-bold text-gray-300 uppercase">Performance Total</span>
                </div>
            </div>
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-50 hover:border-ferrari transition-all">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Total de Pedidos</span>
                <p className="text-5xl font-black text-onyx italic tracking-tighter">{orders.length}</p>
                <div className="mt-4 flex items-center gap-2 text-green-500">
                   <i className="fas fa-arrow-up text-[10px]"></i>
                   <span className="text-[9px] font-bold uppercase tracking-widest">Base de Clientes</span>
                </div>
            </div>
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-50 hover:border-ferrari transition-all">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Ticket Médio</span>
                <p className="text-5xl font-black text-onyx italic tracking-tighter">
                  R$ {orders.length > 0 ? (orders.reduce((acc, o) => acc + o.total, 0) / orders.length).toFixed(0) : '0'}
                </p>
                <div className="mt-4 flex items-center gap-2 text-blue-500">
                   <i className="fas fa-bolt text-[10px]"></i>
                   <span className="text-[9px] font-bold uppercase tracking-widest">Valor por Venda</span>
                </div>
            </div>
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-50 hover:border-ferrari transition-all">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Lucro Estimado</span>
                <p className="text-5xl font-black text-ferrari italic tracking-tighter">
                  R$ {orders.reduce((acc, o) => {
                    const cost = o.items.reduce((sum, item) => sum + (item.cost * item.quantity), 0);
                    return acc + (o.total - cost);
                  }, 0).toLocaleString('pt-BR')}
                </p>
                <div className="mt-4 flex items-center gap-2">
                   <div className="w-8 h-1 bg-onyx rounded-full"></div>
                   <span className="text-[9px] font-bold text-gray-300 uppercase">Líquido Projetado</span>
                </div>
            </div>
          </div>

          {/* Novos Gráficos Modernos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Gráfico Donut de Composição */}
            <div className="bg-white p-12 rounded-[4rem] shadow-sm border border-gray-50 flex flex-col h-[550px]">
              <div className="mb-10 text-center md:text-left">
                <h3 className="text-2xl font-black text-onyx uppercase tracking-tighter">Composição de Receita</h3>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Participação por categoria de espetinho</p>
              </div>
              <div className="flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboardData.pieData}
                      cx="50%"
                      cy="45%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {dashboardData.pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)', fontWeight: 900, textTransform: 'uppercase', fontSize: '10px' }}
                      formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Faturamento']}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      align="center"
                      iconType="circle"
                      formatter={(value) => <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Ranking de Top Produtos - Barras Horizontais */}
            <div className="bg-white p-12 rounded-[4rem] shadow-sm border border-gray-100 flex flex-col h-[550px]">
              <div className="mb-10 text-center md:text-left">
                <h3 className="text-2xl font-black text-onyx uppercase tracking-tighter">Ranking de Preferência</h3>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Os 10 itens mais pedidos do braseiro</p>
              </div>
              <div className="flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    layout="vertical" 
                    data={dashboardData.barData} 
                    margin={{ left: 40, right: 40, top: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false}
                      width={100}
                      tick={{ fill: '#1A1A1A', fontSize: 9, fontWeight: 900 }}
                    />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)', fontWeight: 900, textTransform: 'uppercase', fontSize: '10px' }}
                    />
                    <Bar dataKey="vendas" radius={[0, 20, 20, 0]} barSize={25}>
                      {dashboardData.barData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#FF2800' : '#1A1A1A'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-gray-50 overflow-hidden animate-fade-in-up">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">PEDIDO & DATA</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">CLIENTE</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">LOCALIZAÇÃO</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">TOTAL</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice().reverse().map(order => (
                  <tr key={order.id} className="border-b border-gray-50 hover:bg-slate-50 transition-colors">
                    <td className="p-6">
                      <p className="font-black text-ferrari text-lg leading-none mb-1">#{order.id}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formatOrderDate(order.date)}</p>
                    </td>
                    <td className="p-6">
                      <p className="font-black text-onyx uppercase mb-1">{order.customer.name}</p>
                      <a href={`https://wa.me/55${order.customer.phone.replace(/\D/g, '')}`} target="_blank" className="text-[10px] font-black text-green-500 hover:text-green-600 flex items-center gap-1">
                        <i className="fab fa-whatsapp"></i> {order.customer.phone}
                      </a>
                    </td>
                    <td className="p-6">
                       {order.mapsUrl && (
                          <a href={order.mapsUrl} target="_blank" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-black uppercase text-[9px] tracking-widest border border-blue-100 hover:bg-blue-100 transition-all shadow-sm">
                            <i className="fas fa-map-location-dot"></i> Ver no Mapa
                          </a>
                        )}
                    </td>
                    <td className="p-6">
                      <p className="font-black text-onyx">R$ {order.total.toFixed(2)}</p>
                      <p className="text-[10px] font-bold text-gray-300 uppercase italic">{order.paymentMethod}</p>
                    </td>
                    <td className="p-6">
                      <select 
                        value={order.status} 
                        onChange={e => updateOrderStatus(order.id, e.target.value as OrderStatus)} 
                        className="w-full p-4 bg-slate-100 border-none rounded-xl font-black uppercase text-[10px] outline-none cursor-pointer focus:ring-2 focus:ring-ferrari/20 transition-all"
                      >
                        <option value={OrderStatus.PENDING}>AGUARDANDO</option>
                        <option value={OrderStatus.PREPARING}>PREPARANDO</option>
                        <option value={OrderStatus.SHIPPED}>ENVIADO</option>
                        <option value={OrderStatus.CANCELLED}>CANCELADO</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={5} className="p-20 text-center text-gray-300 font-black uppercase tracking-widest text-sm">Nenhum pedido realizado ainda.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="space-y-12 animate-fade-in-up">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 gap-6">
            <div>
              <h3 className="text-3xl font-black uppercase text-onyx">Cardápio Digital</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Controle total de itens, preços e estoque</p>
            </div>
            <button onClick={() => { setEditingProductId(null); setIsProductModalOpen(true); }} className="bg-ferrari text-white px-10 py-5 rounded-2xl font-black uppercase text-xs shadow-lg hover:scale-105 transition-all flex items-center gap-3 w-full md:w-auto justify-center">
              <i className="fas fa-plus"></i> NOVO PRODUTO
            </button>
          </div>

          {(Object.entries(groupedProducts) as [string, Product[]][]).map(([category, productsInCategory]) => (
            <div key={category} className="space-y-6">
              <div className="flex items-center gap-4 pl-6">
                <div className="w-2 h-8 bg-ferrari rounded-full"></div>
                <h4 className="text-2xl font-black text-onyx uppercase tracking-tighter">{CATEGORY_LABELS[category as Category]}</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {productsInCategory.map(product => (
                  <div key={product.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center gap-6 relative group hover:border-ferrari transition-all">
                    <img src={product.image} className="w-20 h-20 rounded-2xl object-cover shadow-md group-hover:scale-110 transition-transform" />
                    <div className="flex-grow">
                      <h4 className="font-black text-onyx uppercase text-lg leading-tight mb-1">{product.name}</h4>
                      <p className="text-ferrari font-black text-sm">R$ {product.price.toFixed(2)}</p>
                      <div className="mt-2 flex items-center gap-2">
                         <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${product.stock < 5 ? 'bg-red-50 text-red-500 animate-pulse' : 'bg-slate-50 text-gray-400'}`}>Estoque: {product.stock}</span>
                      </div>
                    </div>
                    <button onClick={() => openEditModal(product)} className="absolute top-4 right-4 w-10 h-10 bg-onyx text-white rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-ferrari shadow-lg">
                      <i className="fas fa-edit"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'store' && (
        <div className="bg-white p-12 rounded-[3rem] shadow-sm border border-gray-100 max-w-2xl animate-fade-in-up">
           <h3 className={`text-2xl mb-10 ${textClass}`}>Configurações da Loja</h3>
           <div className="space-y-10">
              <div className="flex items-center gap-10">
                <img src={logo} className="w-32 h-32 rounded-[2rem] object-cover shadow-xl border-4 border-white" />
                <div className="space-y-4">
                   <button onClick={() => modalFileInputRef.current?.click()} className="px-10 py-5 bg-onyx text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-ferrari transition-all flex items-center gap-3">
                      <i className="fas fa-camera"></i> ALTERAR LOGO
                   </button>
                   <input type="file" ref={modalFileInputRef} className="hidden" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = async () => {
                          const resized = await resizeImage(reader.result as string, 400, 400);
                          setLogo(resized);
                        };
                        reader.readAsDataURL(file);
                      }
                   }} />
                   <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Recomendado: 400x400px (JPG/PNG)</p>
                </div>
              </div>
           </div>
        </div>
      )}

      {isProductModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white w-full max-w-4xl rounded-[4rem] p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-3 header-animated"></div>
            <form onSubmit={handleSaveProduct} className="space-y-10 pt-4">
              <div className="flex justify-between items-center">
                <h3 className={`text-3xl ${textClass}`}>{editingProductId ? 'Editar Produto' : 'Novo Produto'}</h3>
                <button type="button" onClick={closeModal} className="text-gray-300 hover:text-ferrari transition-all hover:rotate-90"><i className="fas fa-times text-4xl"></i></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">Nome do Produto</label>
                  <input type="text" placeholder="EX: ESPETO DE PICANHA" required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-5 font-black uppercase outline-none shadow-inner border-2 border-transparent focus:border-ferrari transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">Categoria</label>
                  <select 
                    value={newProduct.category} 
                    onChange={e => setNewProduct({...newProduct, category: e.target.value as Category})} 
                    className="w-full bg-slate-50 rounded-2xl p-5 font-black uppercase outline-none shadow-inner"
                  >
                    {Object.entries(CATEGORY_LABELS).filter(([v]) => v !== Category.TIPS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">Preço de Venda</label>
                  <input type="number" step="0.01" required value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})} className="w-full bg-slate-50 rounded-2xl p-5 font-black outline-none shadow-inner" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">Custo de Compra</label>
                  <input type="number" step="0.01" required value={newProduct.cost} onChange={e => setNewProduct({...newProduct, cost: parseFloat(e.target.value)})} className="w-full bg-slate-50 rounded-2xl p-5 font-black outline-none shadow-inner" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">Estoque Atual</label>
                  <input type="number" required value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value)})} className="w-full bg-slate-50 rounded-2xl p-5 font-black outline-none shadow-inner" />
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-10 bg-slate-50 p-6 rounded-3xl">
                <img src={newProduct.image} className="w-32 h-32 rounded-3xl object-cover shadow-xl border-4 border-white" />
                <div className="space-y-4 text-center md:text-left">
                   <p className={`text-[10px] ${textClass} text-gray-400`}>A imagem ajuda seu cliente a decidir o pedido.</p>
                   <button type="button" onClick={() => modalFileInputRef.current?.click()} className="px-8 py-4 bg-white text-onyx border border-gray-200 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:border-ferrari hover:text-ferrari transition-all">Trocar Foto</button>
                </div>
              </div>

              <button type="submit" className="w-full bg-onyx text-white py-8 rounded-[2.5rem] font-black uppercase text-sm tracking-widest hover:bg-ferrari transition-all flex items-center justify-center gap-4 shadow-2xl">
                <i className="fas fa-save"></i>
                {editingProductId ? 'Atualizar Produto' : 'Adicionar ao Cardápio'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
