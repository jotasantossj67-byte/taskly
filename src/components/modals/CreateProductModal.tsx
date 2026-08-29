import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, DollarSign, Tag, Image as ImageIcon, Sparkles, Package, Link2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.tsx';
import { ProductCategory } from '../../types.ts';

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductCreated: () => void;
}

const CATEGORIES: ProductCategory[] = [
  'Templates',
  'Serviços',
  'Consultoria',
  'Cursos',
  'Ferramentas',
  'Planilhas',
  'Outros',
];

export const CreateProductModal: React.FC<CreateProductModalProps> = ({
  isOpen,
  onClose,
  onProductCreated,
}) => {
  const { user, getAuthHeaders } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceReal, setPriceReal] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Templates');
  const [imageUrl, setImageUrl] = useState('');
  const [stock, setStock] = useState('10');
  const [deliveryDetails, setDeliveryDetails] = useState('');
  const [featured, setFeatured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Informe o título do produto ou serviço.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Informe uma descrição clara para o comprador.');
      return;
    }
    const numPrice = parseFloat(priceReal.replace(',', '.'));
    if (isNaN(numPrice) || numPrice <= 0) {
      setErrorMsg('Informe um valor válido em Reais (ex: 49.90).');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      const priceCents = Math.round(numPrice * 100);

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          price: priceCents,
          category,
          imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
          stock: parseInt(stock, 10) || 10,
          deliveryDetails: deliveryDetails.trim() || 'O vendedor entrará em contato ou disponibilizará o link de acesso imediatamente.',
          featured,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao publicar item');
      }

      onProductCreated();
      onClose();
      // Reset form
      setTitle('');
      setDescription('');
      setPriceReal('');
      setImageUrl('');
      setDeliveryDetails('');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Falha ao publicar produto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 relative max-h-[90vh] flex flex-col"
          id="modal-create-product"
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">Postar Produto ou Serviço</h3>
                <p className="text-xs text-slate-400">Anuncie para venda direta com recebimento via PIX e saldo na carteira</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
              id="btn-close-product-modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="overflow-y-auto pt-4 space-y-4 pr-1">
            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Título do Anúncio *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Template Notion de Gestão de Projetos Pro"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-all"
                required
                id="input-product-title"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Preço de Venda (R$) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    R$
                  </span>
                  <input
                    type="text"
                    value={priceReal}
                    onChange={(e) => setPriceReal(e.target.value)}
                    placeholder="49,90"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-all"
                    required
                    id="input-product-price"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Categoria *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProductCategory)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl text-sm text-slate-100 outline-none transition-all"
                  id="select-product-category"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Descrição Detalhada do Produto *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o que o comprador irá receber, os benefícios e como funciona..."
                rows={3}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-all resize-none"
                required
                id="textarea-product-description"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  URL da Imagem de Capa (Opcional)
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://exemplo.com/foto.jpg"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-all"
                  id="input-product-image"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Quantidade em Estoque
                </label>
                <input
                  type="number"
                  min="1"
                  max="999"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl text-sm text-slate-100 outline-none transition-all"
                  id="input-product-stock"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Instruções de Entrega / Link de Acesso pós-compra
              </label>
              <input
                type="text"
                value={deliveryDetails}
                onChange={(e) => setDeliveryDetails(e.target.value)}
                placeholder="Ex: Link do Google Drive ou instruções para receber o arquivo"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-all"
                id="input-product-delivery"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="checkbox-featured"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 text-amber-400 focus:ring-amber-400 bg-slate-950"
              />
              <label htmlFor="checkbox-featured" className="text-xs text-slate-300 select-none cursor-pointer">
                Destacar anúncio no topo da loja
              </label>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-all"
                id="btn-cancel-product"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-sm font-bold rounded-xl transition-all shadow-md shadow-amber-400/20 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                id="btn-submit-product"
              >
                <Sparkles className="w-4 h-4" />
                {loading ? 'Publicando...' : 'Publicar Anúncio'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
