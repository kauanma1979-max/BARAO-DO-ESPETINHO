
import React, { useState, useMemo, useRef } from 'react';
import { Product, Order, OrderStatus, Category } from '../types';
import { CATEGORY_LABELS } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AdminPanelProps {
  products: Product[];
  orders: Order[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  logo: string;
  setLogo: (url: string) => void;
  onLogout: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ products, orders, setProducts, setOrders, logo, setLogo, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'inventory' | 'store'>('dashboard');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);

  // Form State para Novo/Editar Produto
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

  const stats = useMemo(() => {
    const shippedOrders = orders.filter(o => o.status === OrderStatus.SHIPPED);
    const revenue = shippedOrders.reduce((acc, o) => acc + o.total, 0);
    const cost = shippedOrders.reduce((acc, o) => {
      const orderCost = o.items.reduce((sum, item) => sum + (item.cost * item.quantity), 0);
      return acc + orderCost;
    }, 0);
    const profit = revenue - cost;
    
    const salesByProduct = products.map(p => {
      const qty = orders.filter(o => o.status === OrderStatus.SHIPPED || o.status === OrderStatus.PREPARING)
        .reduce((acc, o) => acc + (o.items.find(i => i.id === p.id)?.quantity || 0), 0);
      return { name: p.name.toUpperCase(), quantity: qty };
    }).sort((a, b) => b.quantity - a.quantity).slice(0, 5);

    return { revenue, cost, profit, totalOrders: orders.length, salesByProduct };
  }, [orders, products]);

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingProductId) {
      setProducts(prev => prev.map(p => 
        p.id === editingProductId ? { ...p, ...newProduct as Product } : p
      ));
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

  const openEditModal = (product: Product) => {
    setEditingProductId(product.id);
    setNewProduct(product);
    setIsProductModalOpen(true);
  };

  const closeModal = () => {
    setIsProductModalOpen(false);
    setEditingProductId(null);
    setNewProduct({ 
      category: Category.TRADITIONAL, 
      name: '', 
      stock: 0, 
      cost: 0, 
      price: 0, 
      weight: '', 
      image: 'https://picsum.photos/seed/espeto/400/300' 
    });
  };

  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    const d = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
    const t = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `${d} - ${t}`;
  };

  const textClass = "text-black text-shadow-gray font-black uppercase tracking-tighter";

  return (
    <div className="py-8 animate-fade-in px-4 md:px-0 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-ferrari rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl shadow-ferrari/20">
             <i className="fas fa-sliders-h text-4xl"></i>
          </div>
          <div>
            <h2 className="text-5xl font-black font-heading text-onyx uppercase tracking-tighter italic leading-none">Gestão <span className="text-ferrari">Barão</span></h2>
            <p className="text-gray-400 font-bold uppercase text-xs tracking-[0.4em] mt-3">Painel de Controle Administrativo</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="px-10 py-5 bg-white text-gray-500 rounded-2xl font-black uppercase text-sm tracking-widest hover:text-ferrari transition-all flex items-center gap-4 shadow-sm border border-gray-100"
        >
          <i className="fas fa-power-off text-lg"></i> Sair
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar mb-12 -mx-4 px-4">
        {[
          { id: 'dashboard', label: 'Painel Geral', icon: 'fa-chart-pie' },
          { id: 'orders', label: 'Pedidos Ativos', icon: 'fa-receipt' },
          { id: 'inventory', label: 'Estoque Central', icon: 'fa-boxes-stacked' },
          { id: 'store', label: 'Identidade Visual', icon: 'fa-palette' },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-5 px-10 py-6 rounded-[2rem] font-black uppercase text-sm tracking-[0.2em] transition-all whitespace-nowrap shadow-sm border ${activeTab === tab.id ? 'bg-onyx text-white border-onyx shadow-2xl shadow-onyx/30 scale-105' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200 hover:scale-102'}`}
          >
            <i className={`fas ${tab.icon} text-xl ${activeTab === tab.id ? 'text-ferrari' : 'text-gray-300'}`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-12">
        {activeTab === 'dashboard' && (
          <div className="space-y-12 animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               {[
                 { label: 'Faturamento Total', val: `R$ ${stats.revenue.toFixed(2)}`, icon: 'fa-money-bill-trend-up', color: 'text-ferrari' },
                 { label: 'Lucro Operacional', val: `R$ ${stats.profit.toFixed(2)}`, icon: 'fa-coins', color: 'text-green-500' },
                 { label: 'Pedidos Realizados', val: stats.totalOrders, icon: 'fa-hashtag', color: 'text-onyx' },
                 { label: 'Taxa de Retorno', val: `${stats.revenue > 0 ? ((stats.profit / stats.revenue) * 100).toFixed(1) : 0}%`, icon: 'fa-percent', color: 'text-onyx' }
               ].map((stat, i) => (
                 <div key={i} className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 relative overflow-hidden group">
                   <div className={`absolute -right-6 -bottom-6 opacity-5 group-hover:scale-125 transition-transform duration-700`}>
                     <i className={`fas ${stat.icon} text-[12rem]`}></i>
                   </div>
                   <span className="text-sm font-black uppercase text-gray-400 tracking-[0.3em] block mb-4">{stat.label}</span>
                   <span className={`text-5xl font-black text-onyx tracking-tighter block`}>{stat.val}</span>
                 </div>
               ))}
            </div>

            {/* Gráfico de Mais Pedidos */}
            <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-gray-100">
               <div className="flex items-center justify-between mb-12">
                 <div>
                   <h3 className="text-3xl font-black uppercase tracking-tighter text-onyx">Ranking de Vendas</h3>
                   <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2">Os 5 espetinhos preferidos da galera</p>
                 </div>
                 <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-ferrari shadow-inner">
                   <i className="fas fa-trophy text-3xl"></i>
                 </div>
               </div>
               
               <div className="h-[450px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={stats.salesByProduct} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis 
                       dataKey="name" 
                       axisLine={false} 
                       tickLine={false} 
                       angle={-15}
                       textAnchor="end"
                       tick={{ fill: '#1A1A1A', fontWeight: '900', fontSize: 12, letterSpacing: '0.1em' }} 
                     />
                     <YAxis 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{ fill: '#94a3b8', fontWeight: '900', fontSize: 12 }} 
                     />
                     <Tooltip 
                       cursor={{ fill: '#f8fafc' }}
                       contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px', fontWeight: '900', textTransform: 'uppercase' }}
                     />
                     <Bar dataKey="quantity" radius={[15, 15, 0, 0]} barSize={60}>
                       {stats.salesByProduct.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={index === 0 ? '#FF2800' : index % 2 === 0 ? '#1A1A1A' : '#475569'} />
                       ))}
                     </Bar>
                   </BarChart>
                 </ResponsiveContainer>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-12 animate-fade-in-up">
            <div className="flex justify-between items-center bg-white p-12 rounded-[3.5rem] shadow-sm border border-gray-100">
              <div>
                <h3 className="text-3xl font-black uppercase tracking-tighter text-onyx">Gestão de Insumos</h3>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2">Controle preciso e atualização em tempo real</p>
              </div>
              <button 
                onClick={() => setIsProductModalOpen(true)}
                className="bg-ferrari text-white px-12 py-6 rounded-[2rem] font-black uppercase text-sm tracking-[0.2em] shadow-2xl shadow-ferrari/20 hover:scale-105 transition-all flex items-center gap-4"
              >
                <i className="fas fa-plus text-xl"></i> Novo Espetinho
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map(product => (
                <div key={product.id} className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 flex items-center gap-8 group hover:border-ferrari transition-all relative">
                  <img src={product.image} className="w-28 h-28 rounded-3xl object-cover shadow-xl group-hover:rotate-3 transition-transform" />
                  <div className="flex-grow">
                    <h4 className="font-black text-onyx uppercase tracking-tighter text-2xl leading-none mb-2">{product.name}</h4>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">{CATEGORY_LABELS[product.category]} {product.weight ? `• ${product.weight}` : ''}</p>
                    <div className="flex items-center gap-6 pt-4 border-t border-gray-50">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Estoque</span>
                        <span className={`text-xl font-black ${product.stock < 10 ? 'text-ferrari' : 'text-onyx'}`}>{product.stock} un</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Venda</span>
                        <span className="text-xl font-black text-onyx">R$ {product.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => openEditModal(product)}
                    className="absolute top-6 right-6 w-14 h-14 bg-onyx text-white rounded-2xl flex items-center justify-center hover:bg-ferrari transition-all shadow-xl shadow-black/10 active:scale-90"
                  >
                    <i className="fas fa-edit text-lg"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-[4rem] shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="p-10 text-xs font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">Identificação</th>
                    <th className="p-10 text-xs font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">Cliente & Local</th>
                    <th className="p-10 text-xs font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">Resumo Pedido</th>
                    <th className="p-10 text-xs font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 text-center">Status / Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice().reverse().map(order => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-10 border-b border-gray-100">
                        <span className="font-black text-ferrari tracking-tight text-2xl">#{order.id}</span>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">
                          {formatDateShort(order.date)}
                        </p>
                      </td>
                      <td className="p-10 border-b border-gray-100">
                        <p className="font-black text-onyx text-xl mb-3 uppercase tracking-tighter">{order.customer.name}</p>
                        <div className="flex flex-col gap-3">
                          <a href={`https://wa.me/55${order.customer.phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 font-black uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-transform origin-left">
                             <i className="fab fa-whatsapp text-lg"></i> {order.customer.phone}
                          </a>
                          {order.customer.deliveryType === 'delivery' && (
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-bold text-gray-400 uppercase max-w-[200px] truncate">{order.customer.address}</span>
                              {order.mapsUrl && (
                                <a 
                                  href={order.mapsUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="bg-onyx text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-ferrari transition-all shadow-lg"
                                >
                                  <i className="fas fa-location-dot"></i> MAPA
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-10 border-b border-gray-100">
                        <div className="text-sm font-bold text-gray-600 space-y-2">
                          {order.items.map(i => (
                            <div key={i.id} className="flex gap-3">
                              <span className="text-ferrari font-black">{i.quantity}x</span>
                              <span className="uppercase tracking-tight">{i.name}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-10 border-b border-gray-100">
                        <div className="flex justify-center">
                          <select 
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                            className={`px-8 py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] outline-none border-2 transition-all cursor-pointer shadow-sm ${
                              order.status === OrderStatus.CANCELLED ? 'bg-red-50 border-red-100 text-red-500' : 
                              order.status === OrderStatus.SHIPPED ? 'bg-green-50 border-green-100 text-green-500' :
                              'bg-ferrari/5 border-ferrari/10 text-ferrari'
                            }`}
                          >
                            <option value={OrderStatus.PENDING}>Aguardando</option>
                            <option value={OrderStatus.AWAITING_PAYMENT}>Pgto Pendente</option>
                            <option value={OrderStatus.PREPARING}>Em Preparo</option>
                            <option value={OrderStatus.SHIPPED}>Concluído</option>
                            <option value={OrderStatus.CANCELLED}>Cancelado</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'store' && (
          <div className="bg-white rounded-[4rem] p-16 shadow-sm border border-gray-100 animate-fade-in-up max-w-3xl">
            <h3 className="text-3xl font-black uppercase tracking-tighter text-onyx mb-12 flex items-center gap-6">
              <i className="fas fa-image text-ferrari text-4xl"></i> Logotipo do Estabelecimento
            </h3>
            <div className="flex flex-col items-center gap-10 p-16 border-4 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/50">
              {logo ? (
                <div className="relative group">
                  <img src={logo} alt="Store Logo" className="w-64 h-64 rounded-[2.5rem] object-cover shadow-2xl border-8 border-white group-hover:scale-105 transition-transform" />
                  <button onClick={() => setLogo('')} className="absolute -top-5 -right-5 w-14 h-14 bg-ferrari text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all"><i className="fas fa-trash-alt text-xl"></i></button>
                </div>
              ) : (
                <div className="w-48 h-48 bg-slate-200 rounded-[2.5rem] flex items-center justify-center text-slate-400 text-6xl shadow-inner"><i className="fas fa-camera"></i></div>
              )}
              <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="px-12 py-7 bg-onyx text-white rounded-[2rem] font-black uppercase text-sm tracking-[0.2em] hover:bg-ferrari transition-all flex items-center gap-5 shadow-2xl">
                <i className="fas fa-upload text-xl"></i> Atualizar Identidade
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Novo/Editar Produto - Tamanhos Ajustados */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-3xl rounded-[4rem] shadow-2xl overflow-hidden animate-fade-in-up border border-white/20">
            <div className="h-3 header-animated"></div>
            <form onSubmit={handleSaveProduct} className="p-16 space-y-10">
              <div className="flex justify-between items-center">
                <h3 className={`text-4xl ${textClass}`}>{editingProductId ? 'Editar Cadastro' : 'Novo Espetinho'}</h3>
                <button type="button" onClick={closeModal} className="text-gray-300 hover:text-ferrari transition-all hover:rotate-90"><i className="fas fa-times text-3xl"></i></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className={`text-xs pl-5 ${textClass}`}>Categoria</label>
                  <select 
                    value={newProduct.category} 
                    onChange={e => setNewProduct({...newProduct, category: e.target.value as Category})}
                    className="w-full bg-slate-50 border-none rounded-3xl p-6 font-black uppercase text-sm outline-none shadow-inner h-20"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className={`text-xs pl-5 ${textClass}`}>Nome do Produto</label>
                  <input 
                    type="text" 
                    required 
                    value={newProduct.name}
                    onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                    placeholder="EX: PICANHA PREMIUM"
                    className="w-full bg-slate-50 border-none rounded-3xl p-6 font-black uppercase text-sm outline-none shadow-inner h-20"
                  />
                </div>
                <div className="space-y-3">
                  <label className={`text-xs pl-5 ${textClass}`}>Quantidade em Estoque</label>
                  <input 
                    type="number" 
                    required 
                    value={newProduct.stock}
                    onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value)})}
                    className="w-full bg-slate-50 border-none rounded-3xl p-6 font-black text-sm outline-none shadow-inner h-20"
                  />
                </div>
                <div className="space-y-3">
                  <label className={`text-xs pl-5 ${textClass}`}>Peso Líquido</label>
                  <input 
                    type="text" 
                    value={newProduct.weight}
                    onChange={e => setNewProduct({...newProduct, weight: e.target.value})}
                    placeholder="EX: 120G"
                    className="w-full bg-slate-50 border-none rounded-3xl p-6 font-black uppercase text-sm outline-none shadow-inner h-20"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <label className={`text-xs pl-5 ${textClass}`}>Imagem do Produto</label>
                <div className="flex items-center gap-8">
                  <img src={newProduct.image} className="w-32 h-32 rounded-[2rem] object-cover shadow-2xl border-4 border-white" />
                  <input type="file" ref={modalFileInputRef} onChange={handleProductImageUpload} className="hidden" />
                  <button 
                    type="button" 
                    onClick={() => modalFileInputRef.current?.click()}
                    className="px-8 py-5 bg-slate-100 text-gray-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Mudar Foto
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-onyx text-white py-8 rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-sm hover:bg-ferrari transition-all shadow-2xl shadow-onyx/30"
              >
                {editingProductId ? 'Atualizar Dados' : 'Confirmar e Publicar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
