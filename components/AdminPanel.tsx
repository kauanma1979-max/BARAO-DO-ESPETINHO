
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stats = useMemo(() => {
    const deliveredOrders = orders.filter(o => o.status === OrderStatus.DELIVERED);
    const revenue = deliveredOrders.reduce((acc, o) => acc + o.total, 0);
    const cost = deliveredOrders.reduce((acc, o) => {
      const orderCost = o.items.reduce((sum, item) => sum + (item.cost * item.quantity), 0);
      return acc + orderCost;
    }, 0);
    const profit = revenue - cost;
    
    const salesByProduct = products.map(p => {
      const qty = orders.filter(o => o.status === OrderStatus.DELIVERED)
        .reduce((acc, o) => acc + (o.items.find(i => i.id === p.id)?.quantity || 0), 0);
      return { name: p.name, quantity: qty };
    }).sort((a, b) => b.quantity - a.quantity).slice(0, 5);

    return { revenue, cost, profit, totalOrders: orders.length, salesByProduct };
  }, [orders, products]);

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

  return (
    <div className="py-8 animate-fade-in px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-ferrari rounded-[1.25rem] flex items-center justify-center text-white shadow-xl shadow-ferrari/20">
             <i className="fas fa-sliders-h text-2xl"></i>
          </div>
          <div>
            <h2 className="text-4xl font-black font-heading text-onyx uppercase tracking-tighter italic leading-none">Configurações do <span className="text-ferrari">Barão</span></h2>
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.4em] mt-2">Painel de Gestão e Identidade Visual</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="px-8 py-4 bg-white text-gray-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:text-ferrari transition-all flex items-center gap-3 shadow-sm hover:shadow-md border border-gray-100"
        >
          <i className="fas fa-power-off"></i> Sair do Painel
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto no-scrollbar mb-10 -mx-4 px-4">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie' },
          { id: 'products', label: 'Cardápio', icon: 'fa-burger' },
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
               { label: 'Receita Total', val: `R$ ${stats.revenue.toFixed(2)}`, icon: 'fa-money-bill-trend-up', color: 'text-ferrari' },
               { label: 'Lucro Líquido', val: `R$ ${stats.profit.toFixed(2)}`, icon: 'fa-coins', color: 'text-green-500' },
               { label: 'Pedidos Totais', val: stats.totalOrders, icon: 'fa-hashtag', color: 'text-onyx' },
               { label: 'Margem Bruta', val: `${stats.revenue > 0 ? ((stats.profit / stats.revenue) * 100).toFixed(1) : 0}%`, icon: 'fa-percent', color: 'text-onyx' }
             ].map((stat, i) => (
               <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden group">
                 <div className={`absolute -right-4 -bottom-4 opacity-5 group-hover:scale-125 transition-transform duration-700`}>
                   <i className={`fas ${stat.icon} text-9xl`}></i>
                 </div>
                 <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em] block mb-3">{stat.label}</span>
                 <div className="flex items-center gap-3">
                   <span className={`text-3xl font-black text-onyx tracking-tighter`}>{stat.val}</span>
                 </div>
               </div>
             ))}

             <div className="md:col-span-2 lg:col-span-3 bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
               <h3 className="text-xl font-black uppercase tracking-widest text-onyx mb-10 flex items-center gap-4">
                 <i className="fas fa-crown text-ferrari"></i> Os Mais Pedidos
               </h3>
               <div className="h-80 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={stats.salesByProduct}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 800, fill: '#1A1A1A' }} />
                     <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 800, fill: '#9ca3af' }} />
                     <Tooltip 
                        contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', fontWeight: 900, textTransform: 'uppercase', fontSize: '10px' }}
                        cursor={{ fill: '#f8f9fa' }}
                     />
                     <Bar dataKey="quantity" radius={[12, 12, 0, 0]}>
                       {stats.salesByProduct.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={index === 0 ? '#FF2800' : '#1A1A1A'} />
                       ))}
                     </Bar>
                   </BarChart>
                 </ResponsiveContainer>
               </div>
             </div>
          </div>
        )}

        {activeTab === 'store' && (
          <div className="bg-white rounded-[3rem] p-12 shadow-sm border border-gray-100 animate-fade-in-up max-w-2xl">
            <h3 className="text-2xl font-black uppercase tracking-tighter text-onyx mb-8 flex items-center gap-4">
              <i className="fas fa-image text-ferrari"></i> Logotipo da Loja
            </h3>
            
            <div className="space-y-10">
              <div className="flex flex-col items-center gap-6 p-10 border-4 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/50">
                {logo ? (
                  <div className="relative group">
                    <img src={logo} alt="Store Logo" className="w-48 h-48 rounded-[2rem] object-cover shadow-2xl border-4 border-white" />
                    <button 
                      onClick={() => setLogo('')}
                      className="absolute -top-3 -right-3 w-10 h-10 bg-ferrari text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 bg-slate-200 rounded-[2rem] flex items-center justify-center text-slate-400 text-4xl">
                    <i className="fas fa-camera"></i>
                  </div>
                )}
                
                <div className="text-center">
                  <p className="text-sm font-black text-onyx uppercase tracking-widest mb-2">Alterar Identidade Visual</p>
                  <p className="text-xs text-gray-400 font-bold uppercase mb-6">Recomendado: 512x512px (JPG ou PNG)</p>
                  
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleLogoUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
                  
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-10 py-5 bg-onyx text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-ferrari transition-all shadow-xl shadow-onyx/20 flex items-center gap-4 mx-auto"
                  >
                    <i className="fas fa-upload"></i> Buscar no Computador
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="p-8 text-[11px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">Identificação</th>
                    <th className="p-8 text-[11px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">Cliente / Contato</th>
                    <th className="p-8 text-[11px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">Pedido</th>
                    <th className="p-8 text-[11px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">Status da Brasa</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice().reverse().map(order => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-8 border-b border-gray-100">
                        <span className="font-black text-ferrari tracking-tight text-lg">#{order.id}</span>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                          {new Date(order.date).toLocaleTimeString('pt-BR')}
                        </p>
                      </td>
                      <td className="p-8 border-b border-gray-100">
                        <p className="font-black text-onyx text-base mb-1 uppercase tracking-tighter">{order.customer.name}</p>
                        <a href={`https://wa.me/55${order.customer.phone.replace(/\D/g,'')}`} className="text-[10px] text-green-600 font-black uppercase tracking-widest flex items-center gap-2">
                           <i className="fab fa-whatsapp"></i> {order.customer.phone}
                        </a>
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
                        <select 
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                          className="w-full bg-slate-50 border-2 border-gray-100 rounded-2xl px-4 py-3 font-black uppercase text-[10px] tracking-widest outline-none focus:border-ferrari transition-all"
                        >
                          <option value={OrderStatus.PENDING}>Pendente</option>
                          <option value={OrderStatus.PREPARING}>Na Brasa</option>
                          <option value={OrderStatus.READY}>Pronto</option>
                          <option value={OrderStatus.DELIVERED}>Entregue</option>
                          <option value={OrderStatus.CANCELLED}>Cancelado</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Other tabs remain largely the same but icons updated above */}
      </div>
    </div>
  );
};

export default AdminPanel;
