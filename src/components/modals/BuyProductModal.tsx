import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, QrCode, CheckCircle2, Copy, ShieldCheck, ArrowRight, Sparkles, CreditCard } from 'lucide-react';
import confetti from 'canvas-confetti';
import { MarketplaceProduct } from '../../types.ts';
import { useAuth } from '../../hooks/useAuth.tsx';

interface BuyProductModalProps {
  product: MarketplaceProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onPurchaseSuccess: () => void;
}

export const BuyProductModal: React.FC<BuyProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onPurchaseSuccess,
}) => {
  const { getAuthHeaders, refreshProfile } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'Cartão'>('PIX');
  const [loading, setLoading] = useState(false);
  const [purchasedData, setPurchasedData] = useState<{
    order: any;
    deliveryDetails: string;
  } | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const pixKey = product
    ? `00020126580014br.gov.bcb.pix0136${product.id}-taskly-order-520400005303986540${(product.price / 100).toFixed(2)}5802BR5915TasklyVendas6009SaoPaulo62070503***6304`
    : '';

  const handleCopyPix = () => {
    if (!pixKey) return;
    navigator.clipboard.writeText(pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  const handleConfirmPurchase = async () => {
    if (!product) return;
    try {
      setLoading(true);
      setErrorMsg(null);

      const res = await fetch(`/api/products/${product.id}/buy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Falha ao processar pagamento');
      }

      setPurchasedData({
        order: data.order,
        deliveryDetails: data.deliveryDetails,
      });

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      await refreshProfile();
      onPurchaseSuccess();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Erro ao processar compra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && product && (
        <motion.div
          key="buy-product-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            key="buy-product-dialog"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 relative"
            id="modal-buy-product"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
              id="btn-close-buy-modal"
            >
              <X className="w-5 h-5" />
            </button>

            {purchasedData ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 mx-auto bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/10">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-100">Compra Concluída com Sucesso!</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Seu pedido <span className="text-amber-400 font-mono font-bold">#{purchasedData.order?.id}</span> foi aprovado e o vendedor notificado.
                  </p>
                </div>

                {/* Delivery details box */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-left space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                    <Sparkles className="w-4 h-4" />
                    <span>Instruções de Acesso / Entrega</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">
                    {purchasedData.deliveryDetails}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md active:scale-95"
                  >
                    Fechar e Acessar Produtos
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-14 h-14 rounded-xl object-cover border border-slate-800 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-amber-400/10 text-amber-400 text-[10px] font-bold border border-amber-400/20 mb-1">
                      {product.category}
                    </span>
                    <h3 className="text-sm font-bold text-slate-100 truncate">{product.title}</h3>
                    <p className="text-xs text-slate-400">Vendido por: {product.seller?.displayName || 'Vendedor Verificado'}</p>
                  </div>
                </div>

                {/* Method selector */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('PIX')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      paymentMethod === 'PIX'
                        ? 'border-amber-400 bg-amber-400/10 text-amber-400'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    <span>PIX Instantâneo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Cartão')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      paymentMethod === 'Cartão'
                        ? 'border-amber-400 bg-amber-400/10 text-amber-400'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Cartão de Crédito</span>
                  </button>
                </div>

                {/* PIX Details */}
                {paymentMethod === 'PIX' ? (
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center space-y-3 mb-4">
                    <div className="w-32 h-32 mx-auto bg-white p-2 rounded-xl border border-slate-700 flex items-center justify-center">
                      {/* Stylized QR placeholder */}
                      <div className="w-full h-full border-2 border-dashed border-slate-800 rounded flex flex-col items-center justify-center text-slate-800 p-2">
                        <QrCode className="w-16 h-16 text-slate-900" />
                        <span className="text-[9px] font-bold text-slate-900 uppercase mt-1">PIX Copia e Cola</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400">Total a pagar:</span>
                      <p className="text-2xl font-extrabold text-emerald-400">
                        R$ {(product.price / 100).toFixed(2).replace('.', ',')}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={pixKey}
                        className="flex-1 bg-slate-900 border border-slate-800 text-[11px] text-slate-400 px-2.5 py-2 rounded-lg truncate font-mono outline-none select-all"
                      />
                      <button
                        onClick={handleCopyPix}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedPix ? 'Copiado!' : 'Copiar'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 mb-4 text-xs">
                    <p className="text-slate-300 font-semibold">Simulação de Pagamento por Cartão</p>
                    <p className="text-[11px] text-slate-400">
                      O valor de <strong className="text-emerald-400">R$ {(product.price / 100).toFixed(2).replace('.', ',')}</strong> será processado em ambiente de demonstração com liberação instantânea.
                    </p>
                  </div>
                )}

                {errorMsg && (
                  <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs">
                    {errorMsg}
                  </div>
                )}

                <button
                  onClick={handleConfirmPurchase}
                  disabled={loading}
                  className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                  id="btn-confirm-payment"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{loading ? 'Confirmando Pagamento...' : 'Simular Confirmação do Pagamento'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-[11px] text-slate-500 text-center mt-3">
                  Transação segura com repasse automático para a carteira do vendedor no PostgreSQL.
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
