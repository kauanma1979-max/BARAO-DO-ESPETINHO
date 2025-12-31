
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
      const qty = orders.filter(o => o.status === OrderStatus.SHIPPED)
        .reduce((acc, o) => acc + (o.items.find(i => i.id === p.id)?.quantity || 0), 0);
      return { name: p.name, quantity: qty };
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
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-ferrari rounded-[1.25rem] flex items-center justify-center text-white shadow-xl shadow-ferrari/20">
             <i className="fas fa-sliders-h text-2xl"></i>
          </div>
          <div>
            <h2 className="text-4xl font-black font-heading text-onyx uppercase tracking-tighter italic leading-none">Gestão <span className="text-ferrari">Barão</span></h2>
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.4em] mt-2">PDV e Controle de Insumos</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="px-8 py-4 bg-white text-gray-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:text-ferrari transition-all flex items-center gap-3 shadow-sm border border-gray-100"
        >
          <i className="fas fa-power-off"></i> Sair
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto no-scrollbar mb-10 -mx-4 px-4">
        {[
          { id: 'dashboard', label: 'Painel', icon: 'fa-chart-pie' },
          { id: 'orders', label: 'Pedidos', icon: 'fa-receipt' },
          { id: 'inventory', label: 'Estoque', icon: 'fa-boxes-stacked' },
          { id: 'store', label: 'Marca', icon: 'fa-palette' },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-4 px-8 py-5 rounded-3xl font-black uppercase text-xs tracking-[0.2em] transition-all whitespace-nowrap shadow-sm border ${activeTab === tab.id ? 'bg-onyx text-white border-onyx shadow-xl shadow-onyx/20' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'}`}
          >
            <i className={`fas ${tab.icon} text-sm ${activeTab === tab.id ? 'text-ferrari' : 'text-gray-300'}`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-fade-in-up">
             {[
               { label: 'Faturamento', val: `R$ ${stats.revenue.toFixed(2)}`, icon: 'fa-money-bill-trend-up', color: 'text-ferrari' },
               { label: 'Lucro Bruto', val: `R$ ${stats.profit.toFixed(2)}`, icon: 'fa-coins', color: 'text-green-500' },
               { label: 'Pedidos Ativos', val: stats.totalOrders, icon: 'fa-hashtag', color: 'text-onyx' },
               { label: 'Desempenho', val: `${stats.revenue > 0 ? ((stats.profit / stats.revenue) * 100).toFixed(1) : 0}%`, icon: 'fa-percent', color: 'text-onyx' }
             ].map((stat, i) => (
               <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden group">
                 <div className={`absolute -right-4 -bottom-4 opacity-5 group-hover:scale-125 transition-transform duration-700`}>
                   <i className={`fas ${stat.icon} text-9xl`}></i>
                 </div>
                 <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em] block mb-3">{stat.label}</span>
                 <span className={`text-3xl font-black text-onyx tracking-tighter`}>{stat.val}</span>
               </div>
             ))}
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-8 animate-fade-in-up">
            <div className="flex justify-between items-center bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tighter text-onyx">Controle de Insumos</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Sincronizado com o Cardápio</p>
              </div>
              <button 
                onClick={() => setIsProductModalOpen(true)}
                className="bg-ferrari text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-ferrari/20 hover:scale-105 transition-all flex items-center gap-3"
              >
                <i className="fas fa-plus"></i> Novo Produto
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <div key={product.id} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-6 group hover:border-ferrari transition-colors relative">
                  <img src={product.image} className="w-20 h-20 rounded-2xl object-cover shadow-md group-hover:rotate-3 transition-transform" />
                  <div className="flex-grow">
                    <h4 className="font-black text-onyx uppercase tracking-tighter text-lg leading-none mb-1">{product.name}</h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{CATEGORY_LABELS[product.category]} {product.weight ? `• ${product.weight}` : ''}</p>
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-gray-300 uppercase">Estoque</span>
                        <span className={`text-sm font-black ${product.stock < 10 ? 'text-ferrari' : 'text-onyx'}`}>{product.stock} un</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-gray-300 uppercase">Preço</span>
                        <span className="text-sm font-black text-onyx">R$ {product.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => openEditModal(product)}
                    className="absolute top-4 right-4 w-10 h-10 bg-onyx text-white rounded-xl flex items-center justify-center hover:bg-ferrari transition-colors shadow-lg shadow-black/10"
                  >
                    <i className="fas fa-edit text-xs"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="p-8 text-[11px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">ID / Data</th>
                    <th className="p-8 text-[11px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">Cliente</th>
                    <th className="p-8 text-[11px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">Pedido</th>
                    <th className="p-8 text-[11px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 text-center">Ação / Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice().reverse().map(order => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-8 border-b border-gray-100">
                        <span className="font-black text-ferrari tracking-tight text-lg">#{order.id}</span>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                          {formatDateShort(order.date)}
                        </p>
                      </td>
                      <td className="p-8 border-b border-gray-100">
                        <p className="font-black text-onyx text-base mb-1 uppercase tracking-tighter">{order.customer.name}</p>
                        <div className="flex flex-col gap-2">
                          {/* WhatsApp Link Direto Resturado */}
                          <a href={`https://wa.me/55${order.customer.phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="text-[10px] text-green-600 font-black uppercase tracking-widest flex items-center gap-2">
                             <i className="fab fa-whatsapp text-sm"></i> {order.customer.phone}
                          </a>
                          {order.customer.deliveryType === 'delivery' && (
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-bold text-gray-400 uppercase max-w-[150px] truncate">{order.customer.address}</span>
                              {/* Botão MAPA Resturado conforme solicitado */}
                              {order.mapsUrl && (
                                <a 
                                  href={order.mapsUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="bg-onyx text-white p-2 rounded-lg text-[9px] font-black uppercase flex items-center gap-2 hover:bg-ferrari transition-colors"
                                >
                                  <i className="fas fa-location-dot"></i> MAPA
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-8 border-b border-gray-100">
                        <div className="text-xs font-bold text-gray-600 space-y-1">
                          {order.items.map(i => (
                            <div key={i.id} className="flex gap-2">
                              <span className="text-ferrari">{i.quantity}x</span>
                              <span className="uppercase">{i.name}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-8 border-b border-gray-100">
                        <div className="flex justify-center">
                          <select 
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                            className={`px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] outline-none border-2 transition-all ${
                              order.status === OrderStatus.CANCELLED ? 'bg-red-50 border-red-100 text-red-500' : 
                              order.status === OrderStatus.SHIPPED ? 'bg-green-50 border-green-100 text-green-500' :
                              'bg-ferrari/5 border-ferrari/10 text-ferrari'
                            }`}
                          >
                            <option value={OrderStatus.PENDING}>Pendente</option>
                            <option value={OrderStatus.AWAITING_PAYMENT}>Aguardando Pgto</option>
                            <option value={OrderStatus.PREPARING}>Preparando</option>
                            <option value={OrderStatus.SHIPPED}>Enviado</option>
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
          <div className="bg-white rounded-[3rem] p-12 shadow-sm border border-gray-100 animate-fade-in-up max-w-2xl">
            <h3 className="text-2xl font-black uppercase tracking-tighter text-onyx mb-8 flex items-center gap-4">
              <i className="fas fa-image text-ferrari"></i> Logotipo
            </h3>
            <div className="flex flex-col items-center gap-6 p-10 border-4 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/50">
              {logo ? (
                <div className="relative group">
                  <img src={logo} alt="Store Logo" className="w-48 h-48 rounded-[2rem] object-cover shadow-2xl border-4 border-white" />
                  <button onClick={() => setLogo('')} className="absolute -top-3 -right-3 w-10 h-10 bg-ferrari text-white rounded-full flex items-center justify-center shadow-lg"><i className="fas fa-trash-alt"></i></button>
                </div>
              ) : (
                <div className="w-32 h-32 bg-slate-200 rounded-[2rem] flex items-center justify-center text-slate-400 text-4xl"><i className="fas fa-camera"></i></div>
              )}
              <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="px-10 py-5 bg-onyx text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-ferrari transition-all flex items-center gap-4">
                <i className="fas fa-upload"></i> Alterar Logo
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Novo/Editar Produto */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-fade-in-up border border-white/20">
            <div className="h-2 header-animated"></div>
            <form onSubmit={handleSaveProduct} className="p-10 space-y-8">
              <div className="flex justify-between items-center">
                <h3 className={`text-2xl ${textClass}`}>{editingProductId ? 'Editar Espetinho' : 'Cadastrar Espetinho'}</h3>
                <button type="button" onClick={closeModal} className="text-gray-300 hover:text-ferrari transition-colors"><i className="fas fa-times text-2xl"></i></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className={`text-[10px] pl-4 ${textClass}`}>Categoria</label>
                  <select 
                    value={newProduct.category} 
                    onChange={e => setNewProduct({...newProduct, category: e.target.value as Category})}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 font-black uppercase text-[11px] outline-none shadow-inner"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className={`text-[10px] pl-4 ${textClass}`}>Nome do Espetinho</label>
                  <input 
                    type="text" 
                    required 
                    value={newProduct.name}
                    onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                    placeholder="ALCATRA, PICANHA..."
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 font-black uppercase text-[11px] outline-none shadow-inner"
                  />
                </div>
                <div className="space-y-2">
                  <label className={`text-[10px] pl-4 ${textClass}`}>Quantidade Estoque</label>
                  <input 
                    type="number" 
                    required 
                    value={newProduct.stock}
                    onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value)})}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 font-black text-[11px] outline-none shadow-inner"
                  />
                </div>
                <div className="space-y-2">
                  <label className={`text-[10px] pl-4 ${textClass}`}>Peso (g/kg)</label>
                  <input 
                    type="text" 
                    value={newProduct.weight}
                    onChange={e => setNewProduct({...newProduct, weight: e.target.value})}
                    placeholder="EX: 120G"
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 font-black uppercase text-[11px] outline-none shadow-inner"
                  />
                </div>
                <div className="space-y-2">
                  <label className={`text-[10px] pl-4 ${textClass}`}>Valor de Custo (R$)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    required 
                    value={newProduct.cost}
                    onChange={e => setNewProduct({...newProduct, cost: parseFloat(e.target.value)})}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 font-black text-[11px] outline-none shadow-inner"
                  />
                </div>
                <div className="space-y-2">
                  <label className={`text-[10px] pl-4 ${textClass}`}>Valor de Venda (R$)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    required 
                    value={newProduct.price}
                    onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 font-black text-[11px] outline-none shadow-inner"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className={`text-[10px] pl-4 ${textClass}`}>Foto do Produto</label>
                <div className="flex items-center gap-6">
                  <img src={newProduct.image} className="w-24 h-24 rounded-2xl object-cover shadow-lg border border-gray-100" />
                  <input type="file" ref={modalFileInputRef} onChange={handleProductImageUpload} className="hidden" />
                  <button 
                    type="button" 
                    onClick={() => modalFileInputRef.current?.click()}
                    className="px-6 py-4 bg-slate-100 text-gray-500 rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-slate-200"
                  >
                    Escolher Foto
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-onyx text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs hover:bg-ferrari transition-all shadow-xl shadow-onyx/20"
              >
                {editingProductId ? 'Atualizar Produto' : 'Salvar Produto e Atualizar Cardápio'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
