export type Priority = 'baixa' | 'media' | 'alta' | 'urgente';
export type TaskStatus = 'pendente' | 'em_progresso' | 'revisao' | 'concluida';
export type TaskCategory = 'Trabalho' | 'Pessoal' | 'Entregas' | 'Estudos' | 'Saúde' | 'Projetos' | 'Finanças' | 'Vendas' | 'Geral';
export type Recurrence = 'none' | 'daily' | 'weekly' | 'monthly';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  estimatedMinutes?: number;
}

export interface TaskAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url: string;
  provider: 'local' | 'gdrive';
  uploadedAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: 'Super Admin' | 'Gerente TI' | 'Líder de Projeto' | 'Colaborador' | 'Auditor' | 'Convidado';
  avatar: string;
  email: string;
  department: string;
  status: 'online' | 'busy' | 'away' | 'offline';
  permissions: {
    canManageTasks: boolean;
    canViewAnalytics: boolean;
    canManageIntegrations: boolean;
    canAccessAuditLogs: boolean;
    canManageBilling: boolean;
  };
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  priority: Priority;
  status: TaskStatus;
  dueDate: string; // YYYY-MM-DD
  dueTime: string; // HH:MM
  estimatedMinutes: number;
  spentMinutes: number;
  tags: string[];
  subtasks: SubTask[];
  assignee: TeamMember;
  attachments: TaskAttachment[];
  recurrence: Recurrence;
  smartAlertScheduled: boolean;
  slackSynced: boolean;
  gcalSynced: boolean;
  gdriveLinked: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  progressPercent: number;
  urgencyScore?: number;
}

export type AlertType = 'deadline' | 'risk' | 'smart_suggestion' | 'slack' | 'calendar' | 'security' | 'billing' | 'sale';
export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface SmartAlert {
  id: string;
  title: string;
  message: string;
  type: AlertType;
  severity: AlertSeverity;
  timestamp: string;
  read: boolean;
  taskId?: string;
  actionLabel?: string;
}

export type AnalyticsPeriod = 'diario' | 'semanal' | 'mensal' | 'trimestral' | 'anual';

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  resource: string;
  ipAddress: string;
  location: string;
  status: 'sucesso' | 'aviso' | 'bloqueado';
  encryption: 'AES-256-GCM' | 'End-to-End';
  device: string;
}

export interface IntegrationConfig {
  googleCalendar: {
    connected: boolean;
    syncEnabled: boolean;
    selectedCalendar: string;
    autoRemind15Min: boolean;
    lastSyncTimestamp?: string;
  };
  slack: {
    connected: boolean;
    channelName: string;
    webhookActive: boolean;
    notifyOnDueSoon: boolean;
    notifyOnAssigned: boolean;
    notifyOnCompletion: boolean;
  };
  googleDrive: {
    connected: boolean;
    backupFolder: string;
    autoAttachDriveFiles: boolean;
    usedStorageGB: number;
    totalStorageGB: number;
  };
  geminiAI: {
    enabled: boolean;
    smartBreakdown: boolean;
    predictiveRisks: boolean;
    weeklyDigest: boolean;
  };
  enterpriseSSO: {
    enabled: boolean;
    protocol: 'SAML 2.0' | 'LDAP' | 'OAuth 2.0 / OIDC';
    domain: string;
    certExpires: string;
    enforce2FA: boolean;
    sessionTimeoutMinutes: number;
  };
}

export type CryptoCurrency = 'BTC' | 'ETH' | 'USDT' | 'SOL';
export type PaymentMethodType = 'card' | 'pix' | 'boleto' | 'crypto';

export interface PlanTier {
  id: string;
  name: string;
  tagline: string;
  monthlyPrice: number;
  yearlyPrice: number;
  popular?: boolean;
  isTrial?: boolean;
  trialDays?: number;
  badge?: string;
  features: string[];
  maxTeamMembers: number | 'Ilimitado';
  storageGB: number | 'Ilimitado';
  cryptoDiscountPercent: number;
}

// User Profile (Authenticated via Firebase + Stored in Cloud SQL)
export interface UserProfile {
  id: number;
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: 'user' | 'seller' | 'admin' | string;
  bio?: string | null;
  balance: number; // in cents
  createdAt?: string;
}

// Marketplace & Store Item (Postar e Vender)
export type ProductCategory = 'Templates' | 'Serviços' | 'Consultoria' | 'Cursos' | 'Ferramentas' | 'Planilhas' | 'Outros';

export interface MarketplaceProduct {
  id: number;
  sellerId: number;
  title: string;
  description: string;
  price: number; // in cents (e.g. 4990 = R$ 49,90)
  category: ProductCategory | string;
  imageUrl?: string | null;
  status: 'active' | 'paused' | 'sold_out';
  stock: number;
  salesCount: number;
  deliveryDetails?: string | null;
  featured?: boolean;
  createdAt: string;
  sellerName?: string | null;
  sellerEmail?: string | null;
  sellerPhoto?: string | null;
}

// Order & Sale Transaction
export interface ProductOrder {
  id: number;
  productId: number;
  buyerId?: number;
  sellerId?: number;
  amount: number; // in cents
  paymentMethod: string;
  status: 'completed' | 'pending' | 'cancelled';
  buyerName?: string | null;
  buyerEmail?: string | null;
  createdAt: string;
  productTitle?: string;
  productDescription?: string;
  productCategory?: string;
  productImageUrl?: string | null;
  deliveryDetails?: string | null;
  sellerName?: string | null;
  sellerEmail?: string | null;
}

export type ViewType = 'tasks' | 'store' | 'my-sales' | 'analytics' | 'integrations' | 'security' | 'pricing';
