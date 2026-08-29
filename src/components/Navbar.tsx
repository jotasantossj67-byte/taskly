import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Search, 
  Plus, 
  Volume2, 
  VolumeX, 
  Timer, 
  CreditCard,
  CheckCircle2,
  X,
  Menu,
  LogIn,
  LogOut,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  User,
  ChevronDown
} from 'lucide-react';
import { SmartAlert, TeamMember } from '../types.ts';
import { sounds } from '../services/soundEffects.ts';
import { useScrollDirection } from '../hooks/useScrollDirection.ts';
import { useAuth } from '../hooks/useAuth.tsx';
import { AuthModal } from './modals/AuthModal.tsx';

interface NavbarProps {
  currentUser: TeamMember;
  alerts: SmartAlert[];
  onOpenNewTask: () => void;
  onOpenAlerts: () => void;
  onOpenPomodoro: () => void;
  onOpenCheckout: () => void;
  onOpenNanoBanana?: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  alerts,
  onOpenNewTask,
  onOpenAlerts,
  onOpenPomodoro,
  onOpenCheckout,
  onOpenNanoBanana,
  searchQuery,
  onSearchChange,
  activeTab,
  setActiveTab,
}) => {
  const { user, dbUser, signOut, loading } = useAuth();
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { isVisible, scrollY } = useScrollDirection(10);
  const unreadAlertsCount = alerts.filter(a => !a.read).length;

  const toggleSound = () => {
    sounds.soundEnabled = !soundOn;
    setSoundOn(!soundOn);
    if (!soundOn) {
      sounds.playComplete();
    }
  };

  const navLinks = [
    { id: 'tasks', label: 'Tarefas' },
    { id: 'store', label: 'Loja & Marketplace', icon: ShoppingBag, badge: 'Vender' },
    { id: 'my-sales', label: 'Vendas & Carteira', icon: TrendingUp },
    { id: 'analytics', label: 'Métricas' },
    { id: 'integrations', label: 'Integrações' },
    { id: 'checkout', label: 'Planos' },
  ];

  return (
    <>
      <motion.header 
        initial={{ y: -32, opacity: 0 }}
        animate={{ 
          y: isVisible ? 0 : -88,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ 
          type: 'spring',
          stiffness: 260,
          damping: 24,
          mass: 0.75,
        }}
        className="sticky top-0 z-40 w-full pt-3 px-3 sm:px-6 pointer-events-none"
      >
        {/* Black Pill Nav Container */}
        <div 
          className="mx-auto flex h-[54px] max-w-6xl items-center justify-between rounded-full border border-slate-800/90 bg-black/95 px-3 sm:px-5 shadow-2xl backdrop-blur-xl pointer-events-auto transition-all"
          style={{
            boxShadow: scrollY > 20 ? '0 12px 36px -8px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08)' : '0 4px 20px -4px rgba(0,0,0,0.5)'
          }}
        >
          
          {/* Brand Wordmark with Quantum²-style superscript */}
          <div className="flex items-center gap-3">
            <div 
              onClick={() => setActiveTab('tasks')}
              className="flex cursor-pointer items-center gap-2 group select-none"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 border border-slate-700/80 group-hover:border-amber-400/80 transition-colors">
                <CheckCircle2 className="h-4 w-4 text-amber-400 group-hover:rotate-6 transition-transform" />
              </div>
              
              <div className="flex items-baseline font-['Figtree',sans-serif]">
                <span className="text-[17px] font-[783] tracking-[-0.0075em] text-white">
                  Taskly
                </span>
                <sup className="text-[11.4px] font-[783] text-amber-400 relative -top-[4px] left-[1px]">
                  2
                </sup>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 ml-4 pl-4 border-l border-slate-800">
              {navLinks.map((link) => {
                const isActive = activeTab === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => setActiveTab(link.id)}
                    className={`relative flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-[500] tracking-[-0.008em] transition-all ${
                      isActive 
                        ? 'text-white bg-slate-800/90' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                  >
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300">
                        {link.badge}
                      </span>
                    )}
                    {isActive && (
                      <motion.div 
                        layoutId="nav-pill-indicator"
                        className="absolute inset-0 rounded-full border border-slate-700/70 pointer-events-none" 
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Search & Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Quick Search */}
            <div className="hidden xl:flex relative items-center w-36 focus-within:w-48 transition-all duration-200">
              <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar..."
                className="w-full rounded-full border border-slate-800 bg-slate-900/90 py-1 pl-8 pr-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:border-amber-400/80 focus:outline-none focus:ring-1 focus:ring-amber-400/20"
              />
            </div>

            {/* Nano Banana Mascot Companion */}
            {onOpenNanoBanana && (
              <button
                onClick={onOpenNanoBanana}
                title="Nano Banana • Assistente de Foco & IA"
                className="flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-xs font-semibold text-amber-300 hover:bg-amber-400/20 transition-all"
              >
                <span className="text-xs">🍌</span>
                <span className="hidden sm:inline text-[11px]">Nano</span>
              </button>
            )}

            {/* Pomodoro Timer */}
            <button
              onClick={onOpenPomodoro}
              title="Timer Pomodoro & Foco"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-800 bg-slate-900 text-slate-300 hover:text-amber-300 hover:border-slate-700 transition-colors"
            >
              <Timer className="h-3.5 w-3.5" />
            </button>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              title={soundOn ? "Sons ativados" : "Sons silenciados"}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200 transition-colors"
            >
              {soundOn ? <Volume2 className="h-3.5 w-3.5 text-emerald-400" /> : <VolumeX className="h-3.5 w-3.5 text-slate-500" />}
            </button>

            {/* Alerts Bell */}
            <button
              onClick={onOpenAlerts}
              title="Notificações & Prazos"
              className="relative flex h-7 w-7 items-center justify-center rounded-full border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-colors"
            >
              <Bell className="h-3.5 w-3.5" />
              {unreadAlertsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-400 text-[9px] font-bold text-slate-950">
                  {unreadAlertsCount}
                </span>
              )}
            </button>

            {/* Primary CTA: Add Task */}
            <button
              onClick={onOpenNewTask}
              className="hidden sm:flex items-center gap-1 rounded-full bg-white px-3.5 py-1 text-xs font-[577] tracking-[-0.02em] text-black hover:bg-slate-200 transition-all active:scale-95 shadow-sm"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Nova Tarefa</span>
            </button>

            {/* User Auth Profile Button */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/90 py-0.5 pl-1 pr-2.5 hover:border-slate-700 transition-all"
                  id="btn-user-profile-menu"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      referrerPolicy="no-referrer"
                      className="h-6 w-6 rounded-full object-cover border border-amber-400/40"
                    />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center">
                      {(user.displayName || user.email || 'U').slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-[11px] font-bold text-slate-200 max-w-[80px] truncate leading-tight">
                      {user.displayName || 'Usuário'}
                    </span>
                    <span className="text-[9px] font-bold text-emerald-400 leading-none">
                      R$ {((dbUser?.balance || 0) / 100).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </button>

                {/* User Dropdown */}
                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 8 }}
                      className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-800 bg-slate-900 p-2 shadow-2xl z-50 text-xs"
                    >
                      <div className="p-2.5 border-b border-slate-800 mb-1">
                        <p className="font-bold text-slate-200 truncate">{user.displayName || 'Minha Conta'}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                        <div className="mt-2 p-2 bg-slate-950 rounded-lg flex items-center justify-between">
                          <span className="text-slate-400 text-[11px]">Saldo Carteira:</span>
                          <span className="font-extrabold text-emerald-400">
                            R$ {((dbUser?.balance || 0) / 100).toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setActiveTab('my-sales');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-left"
                      >
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        <span>Painel de Vendas & Compras</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('store');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-left"
                      >
                        <ShoppingBag className="w-4 h-4 text-amber-400" />
                        <span>Loja & Catálogo</span>
                      </button>

                      <div className="my-1 border-t border-slate-800" />

                      <button
                        onClick={() => {
                          signOut();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors text-left font-semibold"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Desconectar Conta</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-slate-950 hover:bg-amber-300 transition-all shadow-md active:scale-95"
                id="btn-navbar-login"
              >
                <LogIn className="h-3.5 w-3.5 stroke-[2.5]" />
                <span>Entrar</span>
              </button>
            )}

            {/* Mobile Burger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex h-7 w-7 items-center justify-center rounded-full border border-slate-800 bg-slate-900 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>

          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.97, filter: 'blur(3px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -12, scale: 0.97, filter: 'blur(2px)' }}
              transition={{ 
                type: 'spring',
                stiffness: 300,
                damping: 24,
                mass: 0.8
              }}
              className="mx-auto mt-2 max-w-5xl rounded-2xl border border-slate-800 bg-black/95 p-3 shadow-2xl backdrop-blur-xl pointer-events-auto lg:hidden"
            >
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => {
                      setActiveTab(link.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold ${
                      activeTab === link.id
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-bold">
                        {link.badge}
                      </span>
                    )}
                  </button>
                ))}

                <div className="pt-2 mt-1 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => {
                      onOpenCheckout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold py-1 px-2"
                  >
                    <CreditCard className="h-3.5 w-3.5" />
                    <span>Planos & Cripto (-20%)</span>
                  </button>

                  {user ? (
                    <button
                      onClick={() => {
                        signOut();
                        setMobileMenuOpen(false);
                      }}
                      className="text-xs text-rose-400 font-semibold py-1 px-2"
                    >
                      Sair
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setIsAuthModalOpen(true);
                        setMobileMenuOpen(false);
                      }}
                      className="text-xs text-amber-400 font-bold py-1 px-2"
                    >
                      Fazer Login
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};
