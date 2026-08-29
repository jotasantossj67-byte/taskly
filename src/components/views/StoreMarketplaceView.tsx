import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ShoppingBag,
  Plus,
  Search,
  Filter,
  Star,
  CheckCircle2,
  Package,
  TrendingUp,
  DollarSign,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Tag,
  User,
} from 'lucide-react';
import { MarketplaceProduct, ProductCategory } from '../../types.ts';
import { useAuth } from '../../hooks/useAuth.tsx';
import { CreateProductModal } from '../modals/CreateProductModal.tsx';
import { BuyProductModal } from '../modals/BuyProductModal.tsx';
import { AuthModal } from '../modals/AuthModal.tsx';

interface StoreMarketplaceViewProps {
  onGoToSales: () => void;
}

const CATEGORIES: ('Todos' | ProductCategory)[] = [
  'Todos',
  'Templates',
  'Serviços',
  'Consultoria',
  'Cursos',
  'Ferramentas',
  'Planilhas',
  'Outros',
];

export const StoreMarketplaceView: React.FC<StoreMarketplaceViewProps> = ({ onGoToSales }) => {
  const { user, dbUser } = useAuth();
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedProductToBuy, setSelectedProductToBuy] = useState<MarketplaceProduct | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenCreateModal = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsCreateModalOpen(true);
  };

  const handleBuyClick = (product: MarketplaceProduct) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setSelectedProductToBuy(product);
  };

  const filteredProducts = products.filter((item) => {
    const matchesCategory =
      selectedCategory === 'Todos' || item.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.sellerName && item.sellerName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto" id="store-marketplace-view">
      {/* Hero Banner for Marketplace */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-amber-950/20 border border-slate-800 p-6 sm:p-8">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Mercado & Loja Integrada do Taskly</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Poste seus Produtos & Serviços e Venda em Minutos
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Monetize templates, rotinas de produtividade, consultorias e serviços. Pagamento instantâneo via PIX com registro seguro no PostgreSQL para cada usuário.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {user && dbUser && (
              <button
                onClick={onGoToSales}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl border border-slate-700 transition-all flex items-center gap-2"
                id="btn-view-sales-dashboard"
              >
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Minhas Vendas (R$ {((dbUser.balance || 0) / 100).toFixed(2).replace('.', ',')})</span>
              </button>
            )}

            <button
              onClick={handleOpenCreateModal}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-sm font-bold rounded-xl transition-all shadow-lg shadow-amber-400/20 flex items-center gap-2 active:scale-95"
              id="btn-open-create-product"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Postar Produto para Vender</span>
            </button>
          </div>
        </div>

        {/* Subtle decorative glow */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/10'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por produto, template ou vendedor..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 outline-none transition-all"
            id="input-search-store"
          />
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 py-8">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-72 rounded-2xl bg-slate-900/60 border border-slate-800/80 animate-pulse" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30">
          <Package className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-slate-200">Nenhum produto encontrado nesta categoria</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Seja o primeiro a publicar um template, consultoria ou serviço e comece a vender para todos os usuários do Taskly.
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="mt-4 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Publicar Primeiro Anúncio</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="group bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden flex flex-col justify-between transition-all hover:shadow-xl hover:shadow-black/40 relative"
              id={`product-card-${product.id}`}
            >
              {/* Product Cover */}
              <div className="relative h-44 w-full bg-slate-950 overflow-hidden shrink-0">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-950 text-slate-700">
                    <ShoppingBag className="w-12 h-12 stroke-1" />
                  </div>
                )}

                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 bg-slate-950/80 backdrop-blur-md border border-slate-800 text-amber-400 text-[11px] font-semibold rounded-lg">
                    {product.category}
                  </span>
                  {product.featured && (
                    <span className="px-2 py-1 bg-amber-400 text-slate-950 text-[10px] font-bold rounded-lg flex items-center gap-1">
                      <Star className="w-3 h-3 fill-slate-950" />
                      Destaque
                    </span>
                  )}
                </div>

                <div className="absolute bottom-3 right-3 px-3 py-1 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-xl text-emerald-400 font-extrabold text-sm shadow-md">
                  R$ {(product.price / 100).toFixed(2).replace('.', ',')}
                </div>
              </div>

              {/* Product Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-100 line-clamp-1 group-hover:text-amber-400 transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Seller & Metrics info */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    {product.sellerPhoto ? (
                      <img
                        src={product.sellerPhoto}
                        alt="Seller"
                        referrerPolicy="no-referrer"
                        className="w-6 h-6 rounded-full border border-slate-700 object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 text-[10px] shrink-0 font-bold">
                        {product.sellerName ? product.sellerName.slice(0, 2).toUpperCase() : 'US'}
                      </div>
                    )}
                    <span className="text-xs text-slate-300 truncate font-medium">
                      {product.sellerName || 'Vendedor Verificado'}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 font-medium shrink-0">
                    {product.salesCount > 0 ? `${product.salesCount} vendas` : 'Novo'}
                  </div>
                </div>

                {/* Buy Button */}
                <button
                  type="button"
                  onClick={() => handleBuyClick(product)}
                  className="w-full py-2.5 px-4 bg-slate-800 hover:bg-amber-400 text-slate-200 hover:text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98] shadow-sm group/btn"
                  id={`btn-buy-product-${product.id}`}
                >
                  <ShoppingBag className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
                  <span>Comprar Agora (PIX)</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover/btn:opacity-100 -ml-1 group-hover/btn:ml-0 transition-all" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateProductModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProductCreated={fetchProducts}
      />

      <BuyProductModal
        product={selectedProductToBuy}
        isOpen={Boolean(selectedProductToBuy)}
        onClose={() => setSelectedProductToBuy(null)}
        onPurchaseSuccess={fetchProducts}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        title="Entre na sua conta para postar e comprar"
        subtitle="Conecte-se para autenticar seu perfil, publicar seus produtos e registrar suas vendas."
      />
    </div>
  );
};
