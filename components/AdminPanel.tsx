
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

  const stats = useMemo(() => {
    const shippedOrders = orders.filter(o => o.status === OrderStatus.SHIPPED || o.status === OrderStatus.PREPARING);
    const revenue = shippedOrders.reduce((acc, o) => acc + o.total, 0);
    const cost = shippedOrders.reduce((acc, o) => {
      const orderCost = o.items.reduce((sum, item) => sum + (item.cost * item.quantity), 0);
      return acc + orderCost;
    }, 0);
    const profit = revenue - cost;
    
    const salesData = products.map(p => {
      const quantity = orders.filter(o => o.status !== OrderStatus.CANCELLED)
        .reduce((acc, o) => acc + (o.items.find(i => i.id === p.id)?.quantity || 0), 0);
      return { ...p, salesQty: quantity };
    });

    const maxSales = Math.max(...salesData.map(s => s.salesQty), 1);

    return { revenue, cost, profit, totalOrders: orders.length, salesData, maxSales };
  }, [orders, products]);

  const salesByCategory = useMemo(() => {
    const groups = {} as Record<Category, any[]>;
    Object.values(Category).forEach(cat => {
      groups[cat] = stats.salesData.filter(p => p.category === cat)
        .sort((a, b) => b.salesQty - a.salesQty);
    });
    return groups;
  }, [stats.salesData]);

  const groupedProducts = useMemo(() => {
    const groups = {} as Record<Category, Product[]>;
    Object.values(Category).forEach(cat => {
      groups[cat] = products.filter(p => p.category === cat);
    });
    return groups;
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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
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
        <button onClick={onLogout} className="px-12 py-6 bg-white text-gray-500 rounded-2xl font-black uppercase text-sm tracking-widest hover:text-ferrari transition-all flex items-center gap-4 shadow-sm border border-gray-100">
          <i className="fas fa-power-off text-xl"></i> SAIR
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar mb-12 -mx-4 px-4">
        {[
          { id: 'dashboard', label: 'Resumo Geral', icon: 'fa-chart-line' },
          { id: 'orders', label: 'Pedido', icon: 'fa-receipt' },
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {[
                 { label: 'FATURAMENTO', val: `R$ ${stats.revenue.toFixed(2)}`, icon: 'fa-sack-dollar', color: 'text-ferrari' },
                 { label: 'LUCRO BRUTO', val: `R$ ${stats.profit.toFixed(2)}`, icon: 'fa-chart-simple', color: 'text-green-500' },
                 { label: 'TOTAL PEDIDOS', val: stats.totalOrders, icon: 'fa-clipboard-list', color: 'text-onyx' },
                 { label: 'MARGEM', val: `${stats.revenue > 0 ? ((stats.profit / stats.revenue) * 100).toFixed(1) : 0}%`, icon: 'fa-percent', color: 'text-onyx' }
               ].map((stat, i) => (
                 <div key={i} className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 relative overflow-hidden group">
                   <div className={`absolute -right-8 -bottom-8 opacity-5 group-hover:scale-125 transition-transform duration-1000`}>
                     <i className={`fas ${stat.icon} text-[12rem]`}></i>
                   </div>
                   <span className="text-xs font-black uppercase text-gray-400 tracking-[0.4em] block mb-3">{stat.label}</span>
                   <span className={`text-3xl font-black text-onyx tracking-tighter block`}>{stat.val}</span>
                 </div>
               ))}
            </div>

            <div className="bg-white p-12 rounded-[4rem] shadow-sm border border-gray-100">
               <div className="flex items-center justify-between mb-16">
                 <div>
                   <h3 className="text-4xl font-black uppercase tracking-tighter text-onyx">Ranking de Vendas</h3>
                   <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2">Desempenho por item e categoria</p>
                 </div>
                 <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-ferrari shadow-inner">
                   <i className="fas fa-ranking-star text-4xl"></i>
                 </div>
               </div>
               
               <div className="space-y-16">
                 {Object.entries(salesByCategory).map(([category, items]) => (items as any[]).length > 0 && (
                   <div key={category} className="space-y-8">
                      <div className="flex items-center gap-6">
                        <div className="h-10 w-3 bg-ferrari rounded-full"></div>
                        <h4 className="text-2xl font-black text-onyx uppercase tracking-tighter">{CATEGORY_LABELS[category as Category]}</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-6">
                        {(items as any[]).map((item) => (
                          <div key={item.id} className="group flex items-center gap-8 bg-slate-50/50 p-6 rounded-[2rem] hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-gray-100">
                            <div className="w-20 h-20 shrink-0 relative">
                              <img src={item.image} className="w-full h-full object-cover rounded-2xl shadow-lg group-hover:rotate-3 transition-transform" />
                              {item.salesQty === stats.maxSales && (
                                <div className="absolute -top-3 -right-3 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-white shadow-lg animate-bounce">
                                  <i className="fas fa-crown text-[10px]"></i>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-grow space-y-3">
                              <div className="flex justify-between items-end">
                                <span className="text-xl font-black text-onyx uppercase tracking-tighter leading-none">{item.name}</span>
                                <span className="text-sm font-black text-ferrari uppercase tracking-widest">{item.salesQty} VENDIDOS</span>
                              </div>
                              <div className="relative h-4 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="absolute top-0 left-0 h-full bg-onyx transition-all duration-1000 ease-out group-hover:bg-ferrari" 
                                  style={{ width: `${(item.salesQty / stats.maxSales) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                   </div>
                 ))}
               </div>
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
                onClick={() => setIsProductModalOpen(true)}
                className="bg-ferrari text-white px-12 py-7 rounded-[2rem] font-black uppercase text-base tracking-[0.1em] shadow-2xl shadow-ferrari/20 hover:scale-105 transition-all flex items-center gap-5"
              >
                <i className="fas fa-plus text-2xl"></i> NOVO ITEM
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
                        <div className="flex items-center gap-8 pt-4 border-t border-gray-50">
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-gray-300 uppercase tracking-widest mb-1">Quant.</span>
                            <span className={`text-xl font-black ${product.stock < 10 ? 'text-ferrari' : 'text-onyx'}`}>{product.stock} un</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-gray-300 uppercase tracking-widest mb-1">Preço</span>
                            <span className="text-xl font-black text-onyx">R$ {product.price.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => openEditModal(product)}
                        className="absolute top-6 right-6 w-14 h-14 bg-onyx text-white rounded-2xl flex items-center justify-center hover:bg-ferrari transition-all shadow-xl shadow-black/10"
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

        {activeTab === 'orders' && (
          <div className="bg-white rounded-[4rem] shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="p-12 text-sm font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">IDENTIFICAÇÃO</th>
                    <th className="p-12 text-sm font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">CLIENTE</th>
                    <th className="p-12 text-sm font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">ITENS</th>
                    <th className="p-12 text-sm font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 text-center">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice().reverse().map(order => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-12 border-b border-gray-100">
                        <div className="flex flex-col">
                          <span className="font-black text-ferrari tracking-tight text-3xl">#{order.id}</span>
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">DATA: {formatDate(order.date)}</span>
                        </div>
                      </td>
                      <td className="p-12 border-b border-gray-100">
                        <p className="font-black text-onyx text-xl mb-3 uppercase tracking-tighter">{order.customer.name}</p>
                        <div className="flex flex-col gap-3">
                          <a href={`https://wa.me/55${order.customer.phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 font-black uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-transform origin-left">
                             <i className="fab fa-whatsapp text-2xl"></i> {order.customer.phone}
                          </a>
                          {order.mapsUrl && (
                            <a 
                              href={order.mapsUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="w-fit bg-onyx text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-ferrari transition-all shadow-lg mt-2"
                            >
                              <i className="fas fa-location-dot"></i> VER NO MAPA
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="p-12 border-b border-gray-100">
                        <div className="text-sm font-bold text-gray-600 space-y-2">
                          {order.items.map(i => (
                            <div key={i.id} className="flex gap-4">
                              <span className="text-ferrari font-black">{i.quantity}x</span>
                              <span className="uppercase tracking-tight">{i.name}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-12 border-b border-gray-100">
                        <div className="flex justify-center">
                          <select 
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                            className={`px-10 py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] outline-none border-2 transition-all cursor-pointer shadow-sm ${
                              order.status === OrderStatus.CANCELLED ? 'bg-red-50 border-red-100 text-red-500' : 
                              order.status === OrderStatus.SHIPPED ? 'bg-green-50 border-green-100 text-green-500' :
                              'bg-ferrari/5 border-ferrari/10 text-ferrari'
                            }`}
                          >
                            <option value={OrderStatus.PENDING}>AGUARDANDO</option>
                            <option value={OrderStatus.PREPARING}>PREPARANDO</option>
                            <option value={OrderStatus.SHIPPED}>CONCLUÍDO</option>
                            <option value={OrderStatus.CANCELLED}>CANCELADO</option>
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
              <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="px-16 py-8 bg-onyx text-white rounded-[2.5rem] font-black uppercase text-base tracking-[0.2em] hover:bg-ferrari transition-all flex items-center gap-6 shadow-2xl">
                <i className="fas fa-upload text-2xl"></i> ATUALIZAR LOGO
              </button>
            </div>
          </div>
        )}
      </div>

      {isProductModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white w-full max-w-5xl rounded-[5rem] shadow-2xl overflow-hidden animate-fade-in-up border border-white/20">
            <div className="h-4 header-animated"></div>
            <form onSubmit={handleSaveProduct} className="p-16 space-y-12">
              <div className="flex justify-between items-center">
                <h3 className={`text-4xl ${textClass}`}>{editingProductId ? 'Editar Item' : 'Novo Item'}</h3>
                <button type="button" onClick={closeModal} className="text-gray-300 hover:text-ferrari transition-all hover:rotate-90"><i className="fas fa-times text-4xl"></i></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className={`text-sm pl-6 ${textClass}`}>Categoria</label>
                  <select 
                    value={newProduct.category} 
                    onChange={e => setNewProduct({...newProduct, category: e.target.value as Category})}
                    className="w-full bg-slate-50 border-none rounded-[2rem] p-7 font-black uppercase text-base outline-none shadow-inner h-20"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-4">
                  <label className={`text-sm pl-6 ${textClass}`}>Nome do Item</label>
                  <input 
                    type="text" required value={newProduct.name}
                    onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                    placeholder="EX: PICANHA PREMIUM"
                    className="w-full bg-slate-50 border-none rounded-[2rem] p-7 font-black uppercase text-base outline-none shadow-inner h-20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="space-y-4">
                  <label className={`text-sm pl-6 ${textClass}`}>Preço Venda</label>
                  <input 
                    type="number" step="0.01" required value={newProduct.price}
                    onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
                    className="w-full bg-slate-50 border-none rounded-[2rem] p-7 font-black text-base outline-none shadow-inner h-20"
                  />
                </div>
                <div className="space-y-4">
                  <label className={`text-sm pl-6 ${textClass}`}>Custo Unit.</label>
                  <input 
                    type="number" step="0.01" required value={newProduct.cost}
                    onChange={e => setNewProduct({...newProduct, cost: parseFloat(e.target.value)})}
                    className="w-full bg-slate-50 border-none rounded-[2rem] p-7 font-black text-base outline-none shadow-inner h-20"
                  />
                </div>
                <div className="space-y-4">
                  <label className={`text-sm pl-6 ${textClass}`}>Estoque</label>
                  <input 
                    type="number" required value={newProduct.stock}
                    onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value)})}
                    className="w-full bg-slate-50 border-none rounded-[2rem] p-7 font-black text-base outline-none shadow-inner h-20"
                  />
                </div>
              </div>

              <div className="space-y-8">
                <label className={`text-sm pl-6 ${textClass}`}>Imagem do Produto</label>
                <div className="flex items-center gap-10">
                  <img src={newProduct.image} className="w-40 h-40 rounded-[2.5rem] object-cover shadow-2xl border-4 border-white" />
                  <input type="file" ref={modalFileInputRef} onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setNewProduct(prev => ({ ...prev, image: reader.result as string }));
                      reader.readAsDataURL(file);
                    }
                  }} className="hidden" />
                  <button 
                    type="button" 
                    onClick={() => modalFileInputRef.current?.click()}
                    className="px-10 py-5 bg-slate-100 text-gray-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all"
                  >
                    MUDAR FOTO
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-onyx text-white py-10 rounded-[3rem] font-black uppercase tracking-[0.3em] text-base hover:bg-ferrari transition-all shadow-2xl shadow-onyx/30"
              >
                {editingProductId ? 'SALVAR ALTERAÇÕES' : 'PUBLICAR NO CARDÁPIO'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
