import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, 
  Coins, 
  QrCode, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  ArrowRight, 
  FileCheck, 
  Lock,
  Flame,
  HelpCircle,
  Star,
  CheckCheck
} from 'lucide-react';
import { PlanTier, CryptoCurrency, PaymentMethodType } from '../../types';
import { planTiers } from '../../services/mockData';
import { sounds } from '../../services/soundEffects';
import nanoBananaImg from '../../assets/images/nano_banana_mascot_1787956938612.jpg';
import confetti from 'canvas-confetti';

interface CheckoutViewProps {
  onPlanUpgraded: (planName: string) => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({ onPlanUpgraded }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [currency, setCurrency] = useState<'BRL' | 'USD' | 'EUR'>('BRL');
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>(planTiers[1]); // Default to Pro R$ 49.90
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('pix');
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoCurrency>('USDT');
  const [selectedNetwork, setSelectedNetwork] = useState<string>('Polygon (Taxa Baixa & Rápida)');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Currency multipliers
  const currencySymbol = currency === 'BRL' ? 'R$' : currency === 'USD' ? '$' : '€';
  const currencyRate = currency === 'BRL' ? 1 : currency === 'USD' ? 0.20 : 0.18;

  const cryptoAddresses: Record<CryptoCurrency, { address: string; qrPlaceholder: string }> = {
    USDT: { 
      address: '0x71C8924bB4c259832645F10e401BTasklyPolygon', 
      qrPlaceholder: 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=ethereum:0x71C8924bB4c259832645F10e401BTasklyPolygon' 
    },
    BTC: { 
      address: 'bc1q9taskly7f8x02zlm83wepq6a4d7v99s2nanobanana', 
      qrPlaceholder: 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=bitcoin:bc1q9taskly7f8x02zlm83wepq6a4d7v99s2nanobanana' 
    },
    ETH: { 
      address: '0x948Taskly49b20755aF984E07B43eF09NanoBanana', 
      qrPlaceholder: 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=ethereum:0x948Taskly49b20755aF984E07B43eF09NanoBanana' 
    },
    SOL: { 
      address: 'TasklySoL8912xN7894129bvf91238914asNanoBanana', 
      qrPlaceholder: 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=solana:TasklySoL8912xN7894129bvf91238914asNanoBanana' 
    },
  };

  const getPlanPrice = (plan: PlanTier) => {
    if (plan.monthlyPrice === 0) return '0,00';
    const raw = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
    let converted = raw * currencyRate;
    if (paymentMethod === 'crypto' && plan.cryptoDiscountPercent > 0) {
      converted = converted * (1 - plan.cryptoDiscountPercent / 100);
    }
    return converted.toFixed(2).replace('.', ',');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    sounds.playComplete();
  };

  const handleProcessPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      onPlanUpgraded(selectedPlan.name);
      sounds.playComplete();
      confetti({
        particleCount: 90,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f59e0b', '#6366f1', '#06b6d4', '#10b981']
      });
    }, 1400);
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
      
      {/* Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-3xl mx-auto space-y-3.5"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-4 py-1 text-xs font-semibold text-amber-300">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span>Planos Transparentes • Teste Sem Risco ou Plano Pro Ilimitado com 100% dos Recursos</span>
        </div>

        <h2 className="font-['Outfit',sans-serif] text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Eleve sua Produtividade ao Próximo Nível
        </h2>

        <p className="text-sm sm:text-base text-slate-300">
          Escolha entre nosso <strong className="text-slate-100">Teste Gratuito</strong> de 14 dias ou desbloqueie o <strong className="text-amber-300">Plano Pro Ilimitado</strong> com o Copiloto Nano Banana, alertas inteligentes e integrações.
        </p>

        {/* Billing cycle & currency switchers */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          
          <div className="flex items-center rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => {
                setBillingCycle('monthly');
                sounds.playComplete();
              }}
              className={`rounded-lg px-3.5 py-1.5 transition-all ${
                billingCycle === 'monthly' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Faturamento Mensal
            </button>
            <button
              onClick={() => {
                setBillingCycle('yearly');
                sounds.playComplete();
              }}
              className={`rounded-lg px-3.5 py-1.5 transition-all flex items-center gap-1.5 ${
                billingCycle === 'yearly' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Faturamento Anual</span>
              <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-300">
                -20% OFF
              </span>
            </button>
          </div>

          <div className="flex items-center rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs font-semibold">
            {(['BRL', 'USD', 'EUR'] as const).map(c => (
              <button
                key={c}
                onClick={() => {
                  setCurrency(c);
                  sounds.playComplete();
                }}
                className={`rounded-lg px-3 py-1.5 transition-all ${
                  currency === c ? 'bg-slate-800 text-amber-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

        </div>
      </motion.div>

      {/* 2 Main Plans Side-by-Side Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {planTiers.map((plan) => {
          const isSelected = selectedPlan.id === plan.id;
          const isPro = plan.id === 'pro_unlimited';
          const priceFormatted = getPlanPrice(plan);

          return (
            <motion.div
              key={plan.id}
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              onClick={() => {
                setSelectedPlan(plan);
                sounds.playComplete();
              }}
              className={`relative flex flex-col justify-between rounded-3xl border p-6 sm:p-8 transition-all cursor-pointer ${
                isSelected
                  ? isPro 
                    ? 'border-amber-400/80 bg-gradient-to-b from-amber-950/30 via-slate-900 to-slate-950 shadow-2xl shadow-amber-500/10 ring-2 ring-amber-400/40' 
                    : 'border-indigo-500 bg-slate-900 shadow-xl shadow-indigo-500/15 ring-2 ring-indigo-500/40'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 px-4 py-1 text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg flex items-center gap-1.5">
                  {isPro && <Sparkles className="h-3.5 w-3.5" />}
                  <span>{plan.badge}</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isPro && (
                      <div className="h-8 w-8 rounded-xl overflow-hidden border border-amber-400/60 shrink-0">
                        <img 
                          src={nanoBananaImg} 
                          alt="Nano Banana" 
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <h3 className="font-['Outfit',sans-serif] text-xl font-bold text-white">
                      {plan.name}
                    </h3>
                  </div>

                  <span className="text-xs font-semibold text-slate-400">
                    {isPro ? 'Acesso Total' : 'Gratuito'}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-2 min-h-[36px] leading-relaxed">
                  {plan.tagline}
                </p>

                {/* Price Display */}
                <div className="mt-5 flex items-baseline gap-1.5 pb-4 border-b border-slate-800">
                  <span className="text-base font-semibold text-slate-400">{currencySymbol}</span>
                  <span className="text-4xl font-extrabold text-white font-['Outfit',sans-serif] tracking-tight">
                    {priceFormatted}
                  </span>
                  <span className="text-xs text-slate-400">
                    {plan.monthlyPrice === 0 ? '/14 dias' : '/mês'}
                  </span>
                </div>

                {isPro && paymentMethod === 'crypto' && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
                    <Coins className="h-3.5 w-3.5" />
                    <span>20% de Desconto automático pagando em Criptomoeda!</span>
                  </div>
                )}

                {/* Features list */}
                <div className="mt-6 space-y-3 text-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    O que está incluso:
                  </span>
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-slate-200">
                      <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${isPro ? 'text-amber-400' : 'text-cyan-400'}`} />
                      <span className="leading-snug">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPlan(plan);
                  sounds.playComplete();
                }}
                className={`mt-8 w-full rounded-2xl py-3 text-xs font-bold transition-all shadow-md ${
                  isSelected
                    ? isPro
                      ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-extrabold hover:opacity-95'
                      : 'bg-indigo-600 text-white hover:bg-indigo-500'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {isSelected 
                  ? (isPro ? '✓ Plano Selecionado (Recomendado)' : '✓ Plano Teste Selecionado')
                  : (isPro ? 'Assinar Plano Pro Completo' : 'Começar Teste Grátis')}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Interactive Gateway & Checkout Details */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-amber-500/30 bg-slate-900/90 p-6 sm:p-8 max-w-3xl mx-auto w-full shadow-2xl space-y-6"
      >
        {paymentSuccess ? (
          <div className="text-center py-8 space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCheck className="h-8 w-8 stroke-[3]" />
            </div>
            <h3 className="font-['Outfit',sans-serif] text-2xl font-bold text-white">
              {selectedPlan.isTrial ? 'Teste Gratuito Ativado com Sucesso!' : 'Assinatura Confirmada com Sucesso!'}
            </h3>
            <p className="text-sm text-slate-300 max-w-md mx-auto">
              Seu workspace no Taskly agora conta com o <strong className="text-amber-300 font-semibold">{selectedPlan.name}</strong>. Todas as funcionalidades foram liberadas instantaneamente.
            </p>
            <div className="flex justify-center gap-3 pt-4">
              <button
                onClick={() => setPaymentSuccess(false)}
                className="rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:bg-amber-400 transition-all"
              >
                Ir para o Painel Principal
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-bold text-white text-base">Checkout Seguro Taskly</h3>
                <p className="text-xs text-slate-400">
                  Plano: <strong className="text-amber-300 text-sm">{selectedPlan.name}</strong> — Total: <strong className="text-white text-sm">{currencySymbol} {getPlanPrice(selectedPlan)}</strong>
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                <Lock className="h-3 w-3" />
                <span>SSL 256-bit Encriptado</span>
              </div>
            </div>

            {/* Payment Method Selector (Only needed if price > 0) */}
            {selectedPlan.monthlyPrice > 0 ? (
              <div className="space-y-4">
                <span className="text-xs font-semibold text-slate-300 block">
                  Escolha o método de pagamento:
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'pix', label: 'PIX Instantâneo', icon: QrCode, badge: 'Imediato' },
                    { id: 'crypto', label: 'Criptomoedas', icon: Coins, badge: '-20% OFF' },
                    { id: 'card', label: 'Cartão de Crédito', icon: CreditCard, badge: 'Até 12x' },
                    { id: 'boleto', label: 'Boleto / Fatura', icon: FileCheck },
                  ].map((method) => {
                    const isMethodSelected = paymentMethod === method.id;
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.id}
                        onClick={() => {
                          setPaymentMethod(method.id as PaymentMethodType);
                          sounds.playComplete();
                        }}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-semibold transition-all ${
                          isMethodSelected
                            ? 'border-amber-400 bg-amber-400/15 text-white shadow-md ring-1 ring-amber-400/30'
                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Icon className={`h-5 w-5 mb-1 ${isMethodSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                        <span>{method.label}</span>
                        {method.badge && (
                          <span className="mt-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                            {method.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* PIX DETAILS */}
                {paymentMethod === 'pix' && (
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="shrink-0 p-2 bg-white rounded-xl shadow-md">
                        <img 
                          src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=00020126580014BR.GOV.BCB.PIX0136taskly-pro-4990-pix-br520400005303986540549.905802BR5916Taskly+SaaS+Tech6009Sao+Paulo62070503***6304A1F9" 
                          alt="PIX QR Code" 
                          className="h-28 w-28 object-contain"
                        />
                      </div>
                      <div className="flex-1 space-y-2 text-xs">
                        <span className="text-slate-400 font-semibold">Código PIX Copia e Cola:</span>
                        <div className="flex items-center gap-2 rounded-xl bg-slate-900 p-2.5 border border-slate-700 font-mono text-[11px] text-emerald-300">
                          <span className="truncate">00020126580014BR.GOV.BCB.PIX0136taskly-pro-4990-pix-br520400005303986540549.905802...</span>
                          <button
                            onClick={() => handleCopy('00020126580014BR.GOV.BCB.PIX0136taskly-pro-4990-pix-br520400005303986540549.905802BR5916Taskly+SaaS+Tech6009Sao+Paulo62070503***6304A1F9')}
                            className="shrink-0 text-slate-400 hover:text-white p-1"
                          >
                            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Abra o app do seu banco e escaneie o QR Code ou cole a chave PIX acima. Acesso liberado no mesmo segundo.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* CRYPTO PAYMENT DETAILS */}
                {paymentMethod === 'crypto' && (
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-semibold">Moeda:</span>
                        {(['USDT', 'BTC', 'ETH', 'SOL'] as CryptoCurrency[]).map(coin => (
                          <button
                            key={coin}
                            onClick={() => {
                              setSelectedCrypto(coin);
                              sounds.playComplete();
                            }}
                            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                              selectedCrypto === coin ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {coin}
                          </button>
                        ))}
                      </div>

                      <div className="text-xs text-slate-400 flex items-center gap-1.5">
                        <span>Rede:</span>
                        <select
                          value={selectedNetwork}
                          onChange={(e) => setSelectedNetwork(e.target.value)}
                          className="bg-slate-900 text-slate-200 rounded-md px-2 py-1 border border-slate-700 focus:outline-none"
                        >
                          <option>Polygon (Taxa Baixa & Rápida)</option>
                          <option>Solana Network</option>
                          <option>Ethereum (ERC-20)</option>
                          <option>Tron (TRC-20)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                      <div className="shrink-0 p-2 bg-white rounded-xl shadow-md">
                        <img 
                          src={cryptoAddresses[selectedCrypto].qrPlaceholder} 
                          alt="QR Code Cripto" 
                          className="h-28 w-28 object-contain"
                        />
                      </div>

                      <div className="flex-1 space-y-2 text-xs">
                        <span className="text-slate-400 font-semibold">Endereço de Depósito ({selectedCrypto}):</span>
                        <div className="flex items-center gap-2 rounded-xl bg-slate-900 p-2.5 border border-slate-700 font-mono text-[11px] text-amber-300">
                          <span className="truncate">{cryptoAddresses[selectedCrypto].address}</span>
                          <button
                            onClick={() => handleCopy(cryptoAddresses[selectedCrypto].address)}
                            className="shrink-0 text-slate-400 hover:text-white p-1"
                            title="Copiar Endereço"
                          >
                            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Envie o equivalente a <strong className="text-white">{currencySymbol} {getPlanPrice(selectedPlan)}</strong> na rede <strong className="text-amber-300">{selectedNetwork}</strong>. Confirmação instantânea na blockchain.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* CREDIT CARD */}
                {paymentMethod === 'card' && (
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 space-y-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-slate-400 font-semibold">Número do Cartão:</label>
                      <input
                        type="text"
                        placeholder="•••• •••• •••• 4242"
                        defaultValue="4532 •••• •••• 8891"
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-white font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-slate-400 font-semibold">Validade:</label>
                        <input
                          type="text"
                          placeholder="MM/AA"
                          defaultValue="08/29"
                          className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-white font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400 font-semibold">CVV:</label>
                        <input
                          type="text"
                          placeholder="•••"
                          defaultValue="894"
                          className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* BOLETO */}
                {paymentMethod === 'boleto' && (
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 space-y-3 text-xs">
                    <p className="text-slate-300">
                      Boleto bancário gerado com vencimento em 3 dias úteis. Acesso liberado no sistema Taskly.
                    </p>
                    <div className="rounded-xl bg-slate-900 p-3 font-mono text-center text-cyan-300 text-xs border border-slate-700">
                      34191.79001 01043.510047 91020.150008 8 98250000004990
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-300 space-y-2">
                <p>
                  Você escolheu o <strong className="text-white font-bold">Plano Teste (14 Dias)</strong>. Não é necessário cartão de crédito ou compromisso financeiro.
                </p>
              </div>
            )}

            {/* Action Submit */}
            <button
              onClick={handleProcessPayment}
              disabled={isProcessing}
              id="btn-confirm-checkout"
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 py-3.5 text-sm font-extrabold text-slate-950 shadow-xl shadow-amber-500/20 hover:opacity-95 active:scale-98 transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin text-slate-950" />
                  <span>Validando ativação no Taskly...</span>
                </>
              ) : (
                <>
                  <span>
                    {selectedPlan.monthlyPrice === 0 
                      ? 'Começar Teste Gratuito de 14 Dias Agora' 
                      : `Confirmar Assinatura do ${selectedPlan.name} (${currencySymbol} ${getPlanPrice(selectedPlan)})`}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

          </div>
        )}
      </motion.div>

    </div>
  );
};
