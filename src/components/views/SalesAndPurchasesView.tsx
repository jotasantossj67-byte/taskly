import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Package,
  CheckCircle2,
  Calendar,
  User,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.tsx';
import { MarketplaceProduct, ProductOrder } from '../../types.ts';
import { CreateProductModal } from '../modals/CreateProductModal.tsx';
import { AuthModal } from '../modals/AuthModal.tsx';

export const SalesAndPurchasesView: React.FC = () => {
  const { user, dbUser, getAuthHeaders, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'sales' | 'purchases' | 'my-products'>('sales');
  const [sales, setSales] = useState<ProductOrder[]>([]);
  const [purchases, setPurchases] = useState<ProductOrder[]>([]);
  const [myProducts, setMyProducts] = useState<MarketplaceProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const loadData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      const [salesRes, purchasesRes, myProductsRes] = await Promise.all([
        fetch('/api/orders/my-sales', { headers }),
        fetch('/api/orders/my-purchases', { headers }),
        fetch('/api/products/my', { headers }),
      ]);

      if (salesRes.ok) {
        const d = await salesRes.json();
        setSales(d.sales || []);
      }
      if (purchasesRes.ok) {
        const d = await purchasesRes.json();
        setPurchases(d.purchases || []);
      }
      if (myProductsRes.ok) {
        const d = await myProductsRes.json();
        setMyProducts(d.products || []);
      }
      await refreshProfile();
    } catch (err) {
      console.error('Error loading sales data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Deseja realmente remover este anúncio de produto?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        setMyProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-20 px-4 max-w-lg mx-auto bg-slate-900 border border-slate-800 rounded-2xl">
        <TrendingUp className="w-14 h-14 mx-auto text-amber-400 mb-4" />
        <h2 className="text-xl font-bold text-slate-100">Painel de Vendas e Compras</h2>
        <p className="text-sm text-slate-400 mt-2">
          Faça login para visualizar seu saldo em conta, pedidos recebidos e gerenciar seus produtos cadastrados.
        </p>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="mt-6 px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-amber-400/20"
        >
          Acessar com Conta Google
        </button>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </div>
    );
  }

  const totalSalesAmount = sales.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPurchasesAmount = purchases.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto" id="sales-and-purchases-view">
      {/* Financial Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Wallet Balance */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/90 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>Saldo Disponível na Carteira</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
            R$ {((dbUser?.balance || 0) / 100).toFixed(2).replace('.', ',')}
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Atualizado automaticamente a cada venda via PIX
          </p>
        </div>

        {/* Total Sales */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>Total Faturado em Vendas</span>
            <span className="p-1.5 rounded-lg bg-amber-400/10 text-amber-400">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            R$ {(totalSalesAmount / 100).toFixed(2).replace('.', ',')}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {sales.length} {sales.length === 1 ? 'pedido concluído' : 'pedidos concluídos'}
          </p>
        </div>

        {/* Active Products */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>Produtos Anunciados</span>
            <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
              <Package className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            {myProducts.length}
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">No catálogo ativo</span>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
            >
              <Plus className="w-3 h-3 stroke-[3]" />
              Novo Item
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Control */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'sales'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
            id="tab-my-sales"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Vendas Recebidas ({sales.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('purchases')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'purchases'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
            id="tab-my-purchases"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Minhas Compras ({purchases.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('my-products')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'my-products'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
            id="tab-my-products"
          >
            <Package className="w-4 h-4" />
            <span>Meus Anúncios ({myProducts.length})</span>
          </button>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5"
          id="btn-new-product-sales-view"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Postar Produto</span>
        </button>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="h-64 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse" />
      ) : activeTab === 'sales' ? (
        /* Sales List */
        sales.length === 0 ? (
          <div className="text-center py-16 px-4 bg-slate-900/40 border border-slate-800 rounded-2xl">
            <TrendingUp className="w-12 h-12 mx-auto text-slate-600 mb-3" />
            <h3 className="text-base font-bold text-slate-200">Nenhuma venda registrada ainda</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Publique novos produtos ou divulgue os links do catálogo para começar a receber pedidos e pagamentos.
            </p>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Pedido / Data</th>
                    <th className="py-3.5 px-4">Produto</th>
                    <th className="py-3.5 px-4">Comprador</th>
                    <th className="py-3.5 px-4">Pagamento</th>
                    <th className="py-3.5 px-4 text-right">Valor Líquido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-200">
                  {sales.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-100">#ORD-{item.id}</div>
                        <div className="text-[11px] text-slate-400">
                          {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-100">{item.productTitle}</div>
                        <div className="text-[11px] text-amber-400">{item.productCategory}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-200">{item.buyerName || 'Comprador'}</div>
                        <div className="text-[11px] text-slate-400">{item.buyerEmail}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                          {item.paymentMethod || 'PIX'} • Aprovado
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-emerald-400 text-sm">
                        + R$ {(item.amount / 100).toFixed(2).replace('.', ',')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : activeTab === 'purchases' ? (
        /* Purchases List */
        purchases.length === 0 ? (
          <div className="text-center py-16 px-4 bg-slate-900/40 border border-slate-800 rounded-2xl">
            <ShoppingBag className="w-12 h-12 mx-auto text-slate-600 mb-3" />
            <h3 className="text-base font-bold text-slate-200">Você ainda não realizou compras</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Explore o catálogo da loja e adquira templates, rotinas e serviços com liberação imediata.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {purchases.map((item) => (
              <div
                key={item.id}
                className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  {item.productImageUrl ? (
                    <img
                      src={item.productImageUrl}
                      alt={item.productTitle}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-xl object-cover border border-slate-800 shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-400 shrink-0">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-slate-800 text-amber-400 rounded text-[10px] font-semibold uppercase">
                        {item.productCategory}
                      </span>
                      <span className="text-xs text-slate-400">
                        Comprado em {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-100 mt-1">{item.productTitle}</h4>
                    <p className="text-xs text-slate-400">Vendido por {item.sellerName || item.sellerEmail}</p>

                    {item.deliveryDetails && (
                      <div className="mt-2 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300">
                        <strong className="text-emerald-400 block mb-0.5">Acesso Liberado:</strong>
                        {item.deliveryDetails}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <span className="text-sm font-extrabold text-slate-100 block">
                    R$ {(item.amount / 100).toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full mt-1 inline-block">
                    Pagamento PIX Aprovado
                  </span>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* My Products List */
        myProducts.length === 0 ? (
          <div className="text-center py-16 px-4 bg-slate-900/40 border border-slate-800 rounded-2xl">
            <Package className="w-12 h-12 mx-auto text-slate-600 mb-3" />
            <h3 className="text-base font-bold text-slate-200">Você ainda não postou produtos para vender</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Comece agora mesmo postando um template, serviço ou consultoria com preço em Reais e receba diretamente.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Postar Primeiro Produto</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myProducts.map((p) => (
              <div
                key={p.id}
                className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="px-2 py-0.5 bg-slate-800 text-amber-400 rounded text-[10px] font-semibold">
                      {p.category}
                    </span>
                    <span className="text-emerald-400 font-bold">
                      R$ {(p.price / 100).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-100 line-clamp-1">{p.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">{p.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    <strong>{p.salesCount}</strong> vendas realizadas
                  </span>
                  <button
                    onClick={() => handleDeleteProduct(p.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="Excluir anúncio"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Create Product Modal */}
      <CreateProductModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProductCreated={loadData}
      />
    </div>
  );
};
