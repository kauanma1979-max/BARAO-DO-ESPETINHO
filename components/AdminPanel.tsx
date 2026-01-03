
import React, { useState, useMemo, useRef } from 'react';
import { Product, Order, OrderStatus, Category } from '../types';
import { CATEGORY_LABELS } from '../constants';

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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'inventory' | 'store'>('dashboard');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const restoreInputRef = useRef<HTMLInputElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);

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

  const categoryEmojis: Record<string, string> = {
    [Category.TRADITIONAL]: '🥩',
    [Category.SPECIAL]: '👑',
    [Category.DRINK]: '🥤',
    [Category.SIDE]: '🥣',
    [Category.COAL]: '🔥',
  };

  const stats = useMemo(() => {
    const validOrders = orders.filter(o => o.status !== OrderStatus.CANCELLED);
    const revenue = validOrders.reduce((acc, o) => acc + o.total, 0);
    const cost = validOrders.reduce((acc, o) => {
      const orderCost = o.items.reduce((sum, item) => sum + (item.cost * item.quantity), 0);
      return acc + orderCost;
    }, 0);
    const profit = revenue - cost;
    
    const salesMap = new Map<string, number>();
    validOrders.forEach(order => {
      order.items.forEach(item => {
        salesMap.set(item.id, (salesMap.get(item.id) || 0) + item.quantity);
      });
    });

    const categoryGroups = Object.values(Category)
      .filter(cat => cat !== Category.TIPS)
      .map(cat => {
        const items = products
          .filter(p => p.category === cat)
          .map(p => ({
            name: p.name,
            qty: salesMap.get(p.id) || 0,
            emoji: categoryEmojis[cat] || '🍢'
          }))
          .sort((a, b) => b.qty - a.qty)
          .slice(0, 5);

        const maxQtyInCat = Math.max(...items.map(i => i.qty), 1);

        return {
          cat,
          label: CATEGORY_LABELS[cat],
          emoji: categoryEmojis[cat] || '🍢',
          items,
          maxQtyInCat
        };
      })
      .filter(group => group.items.length > 0);

    return { revenue, cost, profit, totalOrders: orders.length, categoryGroups };
  }, [orders, products]);

  const groupedProducts = useMemo(() => {
    return products.reduce((acc, product) => {
      const cat = product.category;
      if (!acc[cat]) {
        acc[cat] = [];
      }
      acc[cat].push(product);
      return acc;
    }, {} as Record<string, Product[]>);
  }, [products]);

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProductId) {
      setProducts(prev => prev.map(p => p.id === editingProductId ? { ...p, ...newProduct as Product } : p));
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
    setNewProduct({ category: Category.TRADITIONAL, name: '', stock: 0, cost: 0, price: 0, weight: '', image: 'https://picsum.photos/seed/espeto/400/300' });
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const handleBackup = () => {
    const backupData = { products, orders, logo, timestamp: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_barao_${new Date().toLocaleDateString().replace(/\//g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = JSON.parse(event.target?.result as string);
          if (content.products) setProducts(content.products);
          if (content.orders) setOrders(content.orders);
          if (content.logo) setLogo(content.logo);
          alert('Dados restaurados com sucesso!');
        } catch (err) {
          alert('Erro ao restaurar backup.');
        }
      };
      reader.readAsText(file);
    }
    e.target.value = '';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const textClass = "text-black text-shadow-gray font-black uppercase tracking-tighter";

  return (
    <div className="py-8 animate-fade-in px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex items-center gap-8">
          <div className="w-24 h-24 bg-ferrari rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-ferrari/30">
             <i className="fas fa-sliders-h text-4xl"></i>
          </div>
          <div>
            <h2 className="text-5xl font-black font-heading text-onyx uppercase tracking-tighter italic leading-none">Gestão <span className="text-ferrari">Barão</span></h2>
            <p className="text-gray-400 font-bold uppercase text-xs tracking-[0.5em] mt-3">Painel Administrativo Premium</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={handleBackup} className="px-8 py-5 bg-white text-onyx rounded-2xl font-black uppercase text-xs tracking-widest hover:text-ferrari transition-all flex items-center gap-3 shadow-sm border border-gray-100">
            <i className="fas fa-download"></i> BACKUP
          </button>
          <button onClick={() => restoreInputRef.current?.click()} className="px-8 py-5 bg-white text-onyx rounded-2xl font-black uppercase text-xs tracking-widest hover:text-ferrari transition-all flex items-center gap-3 shadow-sm border border-gray-100">
            <i className="fas fa-upload"></i> RESTAURAR
            <input type="file" ref={restoreInputRef} onChange={handleRestore} accept=".json" className="hidden" />
          </button>
          <button onClick={onLogout} className="px-8 py-5 bg-onyx text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-ferrari transition-all flex items-center gap-3 shadow-sm">
            <i className="fas fa-power-off"></i> SAIR
          </button>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar mb-12 -mx-4 px-4">
        {[
          { id: 'dashboard', label: 'Resumo Geral', icon: 'fa-chart-line' },
          { id: 'orders', label: 'Pedidos', icon: 'fa-receipt' },
          { id: 'inventory', label: 'Estoque', icon: 'fa-boxes-stacked' },
          { id: 'store', label: 'Marca', icon: 'fa-palette' },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-6 px-10 py-7 rounded-[2rem] font-black uppercase text-base tracking-[0.1em] transition-all whitespace-nowrap border-2 ${activeTab === tab.id ? 'bg-onyx text-white border-onyx shadow-2xl shadow-onyx/30 scale-105' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'}`}
          >
            <i className={`fas ${tab.icon} text-2xl ${activeTab === tab.id ? 'text-ferrari' : 'text-gray-300'}`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-16">
        {activeTab === 'dashboard' && (
          <div className="space-y-16 animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {[
                 { label: 'FATURAMENTO', val: `R$ ${stats.revenue.toFixed(2)}`, icon: 'fa-sack-dollar' },
                 { label: 'LUCRO BRUTO', val: `R$ ${stats.profit.toFixed(2)}`, icon: 'fa-chart-simple' },
                 { label: 'TOTAL PEDIDOS', val: stats.totalOrders, icon: 'fa-clipboard-list' }
               ].map((stat, i) => (
                 <div key={i} className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 relative overflow-hidden group">
                   <div className="absolute -right-8 -bottom-8 opacity-5 group-hover:scale-125 transition-transform duration-1000">
                     <i className={`fas ${stat.icon} text-[12rem]`}></i>
                   </div>
                   <span className="text-xs font-black uppercase text-gray-400 tracking-[0.4em] block mb-3">{stat.label}</span>
                   <span className="text-3xl font-black text-onyx tracking-tighter block">{stat.val}</span>
                 </div>
               ))}
            </div>

            <div className="space-y-12">
              <h3 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-4">
                <i className="fas fa-chart-column text-ferrari"></i> Volume de Vendas por Categoria
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {stats.categoryGroups.map(group => (
                  <div key={group.cat} className="bg-white p-10 rounded-[4rem] shadow-sm border border-gray-100 flex flex-col h-[450px]">
                    <div className="flex items-center justify-between mb-10">
                      <div className="flex items-center gap-4">
                        <span className="text-4xl">{group.emoji}</span>
                        <h4 className="font-black text-onyx uppercase tracking-widest text-lg">{group.label}</h4>
                      </div>
                      <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Top Performance</span>
                    </div>

                    <div className="flex-grow flex items-end justify-around gap-4 pb-8 border-b border-gray-50">
                      {group.items.map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-4 group/bar w-full max-w-[60px]">
                          <div className="relative w-full flex flex-col justify-end h-48">
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-onyx text-white text-[10px] font-black px-2 py-1 rounded-lg z-10">
                              {item.qty}un
                            </div>
                            <div 
                              className="w-full bg-slate-50 rounded-2xl overflow-hidden border border-gray-100 group-hover/bar:border-ferrari/30 transition-all flex flex-col justify-end"
                              style={{ height: '100%' }}
                            >
                              <div 
                                className="w-full bg-onyx group-hover/bar:bg-ferrari transition-all duration-1000 ease-out relative"
                                style={{ height: `${(item.qty / group.maxQtyInCat) * 100}%` }}
                              >
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                              </div>
                            </div>
                          </div>
                          <span className="text-[9px] font-black text-onyx uppercase tracking-tighter text-center line-clamp-2 h-6 overflow-hidden leading-none">
                            {item.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-[4rem] shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="p-12 text-sm font-black uppercase tracking-widest text-gray-400 border-b">IDENTIFICAÇÃO</th>
                    <th className="p-12 text-sm font-black uppercase tracking-widest text-gray-400 border-b">CLIENTE</th>
                    <th className="p-12 text-sm font-black uppercase tracking-widest text-gray-400 border-b">ITENS</th>
                    <th className="p-12 text-sm font-black uppercase tracking-widest text-gray-400 border-b text-center">ENTREGA</th>
                    <th className="p-12 text-sm font-black uppercase tracking-widest text-gray-400 border-b text-center">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice().reverse().map(order => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-12 border-b">
                        <span className="font-black text-ferrari tracking-tight text-3xl">#{order.id}</span>
                        <p className="text-[10px] font-black text-gray-400 mt-1">{formatDate(order.date)} - {formatTime(order.date)}</p>
                      </td>
                      <td className="p-12 border-b">
                        <p className="font-black text-onyx text-xl uppercase">{order.customer.name}</p>
                        <a href={`https://wa.me/55${order.customer.phone.replace(/\D/g,'')}`} target="_blank" className="text-xs text-green-600 font-black flex items-center gap-2 mt-2">
                          <i className="fab fa-whatsapp"></i> {order.customer.phone}
                        </a>
                      </td>
                      <td className="p-12 border-b">
                        <div className="text-xs font-bold text-gray-600">
                          {order.items.map(i => <div key={i.id}>{i.quantity}x {i.name}</div>)}
                        </div>
                      </td>
                      <td className="p-12 border-b text-center">
                        {order.mapsUrl ? (
                          <a 
                            href={order.mapsUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 rounded-2xl font-black text-[10px] uppercase text-onyx hover:bg-ferrari hover:text-white transition-all shadow-sm border border-gray-100"
                          >
                            <i className="fas fa-location-dot"></i> VER NO MAPA
                          </a>
                        ) : (
                          <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Retirada</span>
                        )}
                      </td>
                      <td className="p-12 border-b text-center">
                        <select 
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                          className="px-6 py-3 rounded-2xl font-black uppercase text-xs border-2 bg-slate-50 outline-none shadow-sm"
                        >
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
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-12 animate-fade-in-up">
            <div className="flex justify-between items-center bg-white p-12 rounded-[3.5rem] shadow-sm border border-gray-100">
              <div>
                <h3 className="text-4xl font-black uppercase tracking-tighter text-onyx">Gestão de Estoque</h3>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2">Controle de produtos do cardápio</p>
              </div>
              <button 
                onClick={() => { setEditingProductId(null); setIsProductModalOpen(true); }}
                className="bg-ferrari text-white px-12 py-7 rounded-[2rem] font-black uppercase text-base tracking-[0.1em] shadow-xl hover:scale-105 transition-all flex items-center gap-5"
              >
                <i className="fas fa-plus"></i> NOVO ITEM
              </button>
            </div>

            {Object.entries(groupedProducts).map(([category, productsInCategory]) => (productsInCategory as Product[]).length > 0 && (
              <div key={category} className="space-y-10">
                <div className="flex items-center gap-6 pl-8">
                  <div className="w-4 h-12 bg-ferrari rounded-full"></div>
                  <h4 className="text-3xl font-black text-onyx uppercase tracking-tighter">{CATEGORY_LABELS[category as Category]}</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {(productsInCategory as Product[]).map(product => (
                    <div key={product.id} className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 flex items-center gap-8 group hover:border-ferrari transition-all relative">
                      <img src={product.image} className="w-28 h-28 rounded-3xl object-cover shadow-xl group-hover:scale-110 transition-transform" />
                      <div className="flex-grow">
                        <h4 className="font-black text-onyx uppercase tracking-tighter text-2xl leading-none mb-2">{product.name}</h4>
                        <div className="flex items-center gap-8 pt-4 border-t">
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-gray-300 uppercase">Quant.</span>
                            <span className={`text-xl font-black ${product.stock < 10 ? 'text-ferrari' : 'text-onyx'}`}>{product.stock} un</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-gray-300 uppercase">Preço</span>
                            <span className="text-xl font-black text-onyx">R$ {product.price.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => openEditModal(product)}
                        className="absolute top-6 right-6 w-14 h-14 bg-onyx text-white rounded-2xl flex items-center justify-center hover:bg-ferrari transition-all shadow-xl shadow-black/10 z-10"
                      >
                        <i className="fas fa-edit text-lg"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'store' && (
          <div className="bg-white rounded-[4rem] p-16 shadow-sm border border-gray-100 animate-fade-in-up max-w-4xl">
            <h3 className="text-4xl font-black uppercase tracking-tighter text-onyx mb-12 flex items-center gap-8">
              <i className="fas fa-image text-ferrari text-5xl"></i> Identidade Visual
            </h3>
            <div className="flex flex-col items-center gap-12 p-16 border-4 border-dashed border-slate-100 rounded-[3.5rem] bg-slate-50/50">
              {logo ? (
                <div className="relative group">
                  <img src={logo} alt="Store Logo" className="w-72 h-72 rounded-[3rem] object-cover shadow-2xl border-[10px] border-white group-hover:scale-105 transition-transform" />
                  <button onClick={() => setLogo('')} className="absolute -top-6 -right-6 w-16 h-16 bg-ferrari text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all"><i className="fas fa-trash-alt text-2xl"></i></button>
                </div>
              ) : (
                <div className="w-56 h-56 bg-slate-200 rounded-[3rem] flex items-center justify-center text-slate-400 text-7xl shadow-inner"><i className="fas fa-camera"></i></div>
              )}
              <input type="file" ref={fileInputRef} onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => setLogo(reader.result as string);
                  reader.readAsDataURL(file);
                }
              }} accept="image/*" className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="px-16 py-8 bg-onyx text-white rounded-[2.5rem] font-black uppercase text-base tracking-[0.2em] hover:bg-ferrari transition-all flex items-center gap-6 shadow-2xl">
                <i className="fas fa-upload text-2xl"></i> ATUALIZAR LOGO
              </button>
            </div>
          </div>
        )}
      </div>

      {isProductModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white w-full max-w-4xl rounded-[4rem] shadow-2xl overflow-hidden animate-fade-in-up border border-white/20">
            <div className="h-4 header-animated"></div>
            <form onSubmit={handleSaveProduct} className="p-12 space-y-10">
              <div className="flex justify-between items-center">
                <h3 className={`text-4xl ${textClass}`}>{editingProductId ? 'Editar Item' : 'Novo Item'}</h3>
                <button type="button" onClick={closeModal} className="text-gray-300 hover:text-ferrari transition-all hover:rotate-90"><i className="fas fa-times text-4xl"></i></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className={`text-xs pl-4 ${textClass}`}>Nome do Item</label>
                  <input type="text" required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-6 font-black uppercase outline-none shadow-inner" />
                </div>
                <div className="space-y-3">
                  <label className={`text-xs pl-4 ${textClass}`}>Categoria</label>
                  <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value as Category})} className="w-full bg-slate-50 border-none rounded-2xl p-6 font-black uppercase outline-none shadow-inner">
                    {Object.entries(CATEGORY_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <label className={`text-xs pl-4 ${textClass}`}>Preço Venda</label>
                  <input type="number" step="0.01" required value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})} className="w-full bg-slate-50 border-none rounded-2xl p-6 font-black outline-none shadow-inner" />
                </div>
                <div className="space-y-3">
                  <label className={`text-xs pl-4 ${textClass}`}>Estoque</label>
                  <input type="number" required value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value)})} className="w-full bg-slate-50 border-none rounded-2xl p-6 font-black outline-none shadow-inner" />
                </div>
                <div className="space-y-3">
                   <label className={`text-xs pl-4 ${textClass}`}>Custo Unit.</label>
                   <input type="number" step="0.01" required value={newProduct.cost} onChange={e => setNewProduct({...newProduct, cost: parseFloat(e.target.value)})} className="w-full bg-slate-50 border-none rounded-2xl p-6 font-black outline-none shadow-inner" />
                </div>
              </div>

              <div className="flex items-center gap-10">
                <img src={newProduct.image} className="w-32 h-32 rounded-3xl object-cover shadow-xl border-4 border-white" />
                <button type="button" onClick={() => modalFileInputRef.current?.click()} className="px-10 py-5 bg-slate-100 text-gray-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200">MUDAR FOTO</button>
                <input type="file" ref={modalFileInputRef} onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setNewProduct(prev => ({ ...prev, image: reader.result as string }));
                    reader.readAsDataURL(file);
                  }
                }} className="hidden" />
              </div>

              <button type="submit" className="w-full bg-onyx text-white py-8 rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-sm hover:bg-ferrari transition-all shadow-2xl">
                {editingProductId ? 'SALVAR ALTERAÇÕES' : 'ADICIONAR AO CARDÁPIO'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
