import { Task, TeamMember, SmartAlert, AuditLog, IntegrationConfig, PlanTier } from '../types';

export const initialTeamMembers: TeamMember[] = [
  {
    id: 'user-1',
    name: 'Natanael Araújo',
    role: 'Super Admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    email: 'nrgjaraujo@gmail.com',
    department: 'Gestão Executiva',
    status: 'online',
    permissions: {
      canManageTasks: true,
      canViewAnalytics: true,
      canManageIntegrations: true,
      canAccessAuditLogs: true,
      canManageBilling: true,
    }
  },
  {
    id: 'user-2',
    name: 'Beatriz Vasconcelos',
    role: 'Gerente TI',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    email: 'beatriz.v@taskly.io',
    department: 'Infraestrutura & Cloud',
    status: 'online',
    permissions: {
      canManageTasks: true,
      canViewAnalytics: true,
      canManageIntegrations: true,
      canAccessAuditLogs: true,
      canManageBilling: false,
    }
  },
  {
    id: 'user-3',
    name: 'Carlos Eduardo Mendes',
    role: 'Líder de Projeto',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    email: 'carlos.m@taskly.io',
    department: 'Engenharia de Software',
    status: 'busy',
    permissions: {
      canManageTasks: true,
      canViewAnalytics: true,
      canManageIntegrations: true,
      canAccessAuditLogs: false,
      canManageBilling: false,
    }
  },
  {
    id: 'user-4',
    name: 'Juliana Castro',
    role: 'Colaborador',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    email: 'juliana.c@taskly.io',
    department: 'Design & UX',
    status: 'online',
    permissions: {
      canManageTasks: true,
      canViewAnalytics: true,
      canManageIntegrations: false,
      canAccessAuditLogs: false,
      canManageBilling: false,
    }
  },
  {
    id: 'user-5',
    name: 'Lucas Ferreira',
    role: 'Auditor',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    email: 'lucas.audit@taskly.io',
    department: 'Compliance & Segurança',
    status: 'away',
    permissions: {
      canManageTasks: false,
      canViewAnalytics: true,
      canManageIntegrations: false,
      canAccessAuditLogs: true,
      canManageBilling: false,
    }
  }
];

export const initialTasks: Task[] = [
  {
    id: 'task-101',
    title: 'Apresentar relatório trimestral de desempenho para a diretoria',
    description: 'Consolidar gráficos de entrega, ROI das integrações (Slack/Calendar) e evolução das metas trimestrais.',
    category: 'Trabalho',
    priority: 'urgente',
    status: 'em_progresso',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    dueTime: '14:30',
    estimatedMinutes: 90,
    spentMinutes: 45,
    tags: ['Estratégico', 'Diretoria', 'Q3'],
    progressPercent: 60,
    urgencyScore: 92,
    subtasks: [
      { id: 'st-1', title: 'Exportar dados analíticos do Taskly em PDF/CSV', completed: true },
      { id: 'st-2', title: 'Montar slides no Google Drive integrado', completed: true },
      { id: 'st-3', title: 'Validar métricas com o time financeiro', completed: false },
      { id: 'st-4', title: 'Sincronizar convite no Google Calendar', completed: false }
    ],
    assignee: initialTeamMembers[0],
    attachments: [
      {
        id: 'att-1',
        name: 'Relatorio_Desempenho_Q3.pdf',
        size: '2.4 MB',
        type: 'application/pdf',
        url: '#',
        provider: 'gdrive',
        uploadedAt: 'Hoje às 10:15'
      }
    ],
    recurrence: 'none',
    smartAlertScheduled: true,
    slackSynced: true,
    gcalSynced: true,
    gdriveLinked: true,
    createdAt: '2026-08-25T09:00:00Z',
    updatedAt: '2026-08-28T14:20:00Z'
  },
  {
    id: 'task-102',
    title: 'Deploy da v2.4 com suporte a Webhooks Slack e Criptografia E2E',
    description: 'Subir ambiente de homologação, validar logs de auditoria e confirmar sincronização em tempo real das mensagens.',
    category: 'Projetos',
    priority: 'alta',
    status: 'revisao',
    dueDate: new Date(Date.now() + 172800000).toISOString().split('T')[0], // in 2 days
    dueTime: '18:00',
    estimatedMinutes: 120,
    spentMinutes: 100,
    tags: ['DevOps', 'Segurança', 'Slack'],
    progressPercent: 85,
    urgencyScore: 78,
    subtasks: [
      { id: 'st-5', title: 'Rodar testes de estresse em contêineres Cloud', completed: true },
      { id: 'st-6', title: 'Verificar certificados SSL e LDAP/SAML SSO', completed: true },
      { id: 'st-7', title: 'Aprovação final do Gerente de TI', completed: false }
    ],
    assignee: initialTeamMembers[1],
    attachments: [
      {
        id: 'att-2',
        name: 'Security_Audit_Checklist.docx',
        size: '840 KB',
        type: 'docx',
        url: '#',
        provider: 'gdrive',
        uploadedAt: 'Ontem às 16:40'
      }
    ],
    recurrence: 'none',
    smartAlertScheduled: true,
    slackSynced: true,
    gcalSynced: false,
    gdriveLinked: true,
    createdAt: '2026-08-26T11:30:00Z',
    updatedAt: '2026-08-28T12:00:00Z'
  },
  {
    id: 'task-103',
    title: 'Entregar redesign da interface Mobile & Desktop do Taskly',
    description: 'Ajustar hierarquia visual de tipografia, paleta com alto contraste e responsividade dos gráficos de produtividade.',
    category: 'Entregas',
    priority: 'alta',
    status: 'pendente',
    dueDate: new Date(Date.now() + 259200000).toISOString().split('T')[0], // in 3 days
    dueTime: '17:00',
    estimatedMinutes: 180,
    spentMinutes: 20,
    tags: ['UI/UX', 'Design', 'Mobile'],
    progressPercent: 20,
    urgencyScore: 65,
    subtasks: [
      { id: 'st-8', title: 'Desenhar componentes do Dashboard em Dark/Light mode', completed: true },
      { id: 'st-9', title: 'Criar protótipo interativo de checkout e criptomoedas', completed: false },
      { id: 'st-10', title: 'Revisar paleta de acessibilidade WCAG AA', completed: false }
    ],
    assignee: initialTeamMembers[3],
    attachments: [],
    recurrence: 'none',
    smartAlertScheduled: true,
    slackSynced: false,
    gcalSynced: true,
    gdriveLinked: false,
    createdAt: '2026-08-27T08:00:00Z',
    updatedAt: '2026-08-28T09:10:00Z'
  },
  {
    id: 'task-104',
    title: 'Revisar conformidade de dados e Logs de Auditoria LGPD/SOC2',
    description: 'Auditar acessos corporativos, verificar rastreabilidade de IPs e preparar exportação do relatório mensal.',
    category: 'Trabalho',
    priority: 'media',
    status: 'concluida',
    dueDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
    dueTime: '11:00',
    estimatedMinutes: 60,
    spentMinutes: 55,
    tags: ['Auditoria', 'Compliance', 'TI'],
    progressPercent: 100,
    urgencyScore: 10,
    subtasks: [
      { id: 'st-11', title: 'Coletar logs de autenticação SAML/SSO', completed: true },
      { id: 'st-12', title: 'Verificar integridade do hash AES-256', completed: true },
      { id: 'st-13', title: 'Assinar termo de conformidade de TI', completed: true }
    ],
    assignee: initialTeamMembers[4],
    attachments: [
      {
        id: 'att-3',
        name: 'Audit_Report_Signed.pdf',
        size: '1.8 MB',
        type: 'pdf',
        url: '#',
        provider: 'local',
        uploadedAt: 'Ontem às 17:30'
      }
    ],
    recurrence: 'monthly',
    smartAlertScheduled: false,
    slackSynced: true,
    gcalSynced: true,
    gdriveLinked: true,
    createdAt: '2026-08-20T10:00:00Z',
    updatedAt: '2026-08-27T17:30:00Z',
    completedAt: '2026-08-27T17:30:00Z'
  },
  {
    id: 'task-105',
    title: 'Configurar gateway de pagamentos com suporte a Criptomoedas (BTC, ETH, USDT)',
    description: 'Integrar checkout transparente com cartões de crédito globais, PIX instantâneo e carteiras digitais cripto.',
    category: 'Finanças',
    priority: 'urgente',
    status: 'em_progresso',
    dueDate: new Date().toISOString().split('T')[0], // Today
    dueTime: '20:00',
    estimatedMinutes: 150,
    spentMinutes: 110,
    tags: ['Gateway', 'Crypto', 'Checkout'],
    progressPercent: 75,
    urgencyScore: 96,
    subtasks: [
      { id: 'st-14', title: 'Validar webhooks do gateway de pagamentos', completed: true },
      { id: 'st-15', title: 'Testar conversão de taxas em tempo real (USDT/BRL)', completed: true },
      { id: 'st-16', title: 'Implementar comprovantes e notas automáticas', completed: false }
    ],
    assignee: initialTeamMembers[0],
    attachments: [],
    recurrence: 'none',
    smartAlertScheduled: true,
    slackSynced: true,
    gcalSynced: true,
    gdriveLinked: false,
    createdAt: '2026-08-28T07:30:00Z',
    updatedAt: '2026-08-28T15:00:00Z'
  },
  {
    id: 'task-106',
    title: 'Sessão de treino e mindfulness diário',
    description: 'Pausa para recarregar a bateria mental: 30 minutos de caminhada e exercícios de respiração para manter o foco.',
    category: 'Saúde',
    priority: 'baixa',
    status: 'pendente',
    dueDate: new Date().toISOString().split('T')[0], // Today
    dueTime: '19:00',
    estimatedMinutes: 30,
    spentMinutes: 0,
    tags: ['Bem-Estar', 'Saúde'],
    progressPercent: 0,
    urgencyScore: 40,
    subtasks: [
      { id: 'st-17', title: 'Alongamento muscular 10 min', completed: false },
      { id: 'st-18', title: 'Caminhada ao ar livre', completed: false }
    ],
    assignee: initialTeamMembers[0],
    attachments: [],
    recurrence: 'daily',
    smartAlertScheduled: true,
    slackSynced: false,
    gcalSynced: true,
    gdriveLinked: false,
    createdAt: '2026-08-28T06:00:00Z',
    updatedAt: '2026-08-28T06:00:00Z'
  }
];

export const initialSmartAlerts: SmartAlert[] = [
  {
    id: 'alert-1',
    title: '⚠️ Prazo Crítico se Aproximando',
    message: 'A entrega "Configurar gateway de pagamentos com suporte a Criptomoedas" vence hoje às 20:00.',
    type: 'deadline',
    severity: 'critical',
    timestamp: 'Há 12 minutos',
    read: false,
    taskId: 'task-105',
    actionLabel: 'Abrir Tarefa'
  },
  {
    id: 'alert-2',
    title: '🤖 Sugestão do Taskly AI',
    message: 'Seu pico de produtividade é às terças e quintas pela manhã. Que tal adiantar as subtarefas do relatório trimestral?',
    type: 'smart_suggestion',
    severity: 'info',
    timestamp: 'Há 45 minutos',
    read: false,
    taskId: 'task-101',
    actionLabel: 'Aplicar Sugestão'
  },
  {
    id: 'alert-3',
    title: '💬 Slack: Alerta de Sincronização',
    message: 'Carlos Eduardo atualizou o status da entrega #DevOps no canal #engenharia-taskly.',
    type: 'slack',
    severity: 'info',
    timestamp: 'Há 2 horas',
    read: true,
    taskId: 'task-102'
  },
  {
    id: 'alert-4',
    title: '🛡️ Auditoria de Segurança Concluída',
    message: 'Relatório mensal de acessos corporativos e conexões SAML gerado com 100% de integridade criptográfica AES-256.',
    type: 'security',
    severity: 'info',
    timestamp: 'Há 5 horas',
    read: true,
    taskId: 'task-104'
  }
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'log-901',
    timestamp: '2026-08-28 15:20:44',
    userId: 'user-1',
    userName: 'Natanael Araújo',
    userRole: 'Super Admin',
    action: 'EXPORT_AUDIT_REPORT',
    resource: '/api/v1/compliance/reports/q3.csv',
    ipAddress: '177.136.241.12',
    location: 'São Paulo, BR',
    status: 'sucesso',
    encryption: 'End-to-End',
    device: 'Chrome 128 (macOS Sonoma)'
  },
  {
    id: 'log-902',
    timestamp: '2026-08-28 14:15:10',
    userId: 'user-2',
    userName: 'Beatriz Vasconcelos',
    userRole: 'Gerente TI',
    action: 'UPDATE_INTEGRATION_CONFIG',
    resource: 'Slack Webhook / #geral-notificacoes',
    ipAddress: '189.40.12.88',
    location: 'Belo Horizonte, BR',
    status: 'sucesso',
    encryption: 'AES-256-GCM',
    device: 'Firefox 130 (Ubuntu Linux)'
  },
  {
    id: 'log-903',
    timestamp: '2026-08-28 12:44:02',
    userId: 'user-3',
    userName: 'Carlos Eduardo Mendes',
    userRole: 'Líder de Projeto',
    action: 'TASK_STATUS_TRANSITION',
    resource: 'Task #102 -> Status: REVISAO',
    ipAddress: '201.86.110.45',
    location: 'Rio de Janeiro, BR',
    status: 'sucesso',
    encryption: 'AES-256-GCM',
    device: 'Safari 18 (iOS 18)'
  },
  {
    id: 'log-904',
    timestamp: '2026-08-28 10:05:19',
    userId: 'unknown-auth',
    userName: 'Tentativa não autorizada',
    userRole: 'Convidado',
    action: 'UNAUTHORIZED_SAML_ACCESS_ATTEMPT',
    resource: '/admin/security-keys',
    ipAddress: '104.28.192.5',
    location: 'Frankfurt, DE (Proxy)',
    status: 'bloqueado',
    encryption: 'AES-256-GCM',
    device: 'Python-requests/2.31'
  },
  {
    id: 'log-905',
    timestamp: '2026-08-28 08:30:00',
    userId: 'user-5',
    userName: 'Lucas Ferreira',
    userRole: 'Auditor',
    action: 'GENERATE_SOC2_EVIDENCE',
    resource: '/compliance/soc2/evidence-pack-2026.zip',
    ipAddress: '179.180.40.91',
    location: 'Curitiba, BR',
    status: 'sucesso',
    encryption: 'End-to-End',
    device: 'Edge 128 (Windows 11)'
  }
];

export const initialIntegrations: IntegrationConfig = {
  googleCalendar: {
    connected: true,
    syncEnabled: true,
    selectedCalendar: 'Principal (nrgjaraujo@gmail.com)',
    autoRemind15Min: true,
    lastSyncTimestamp: 'Hoje às 15:10'
  },
  slack: {
    connected: true,
    channelName: '#taskly-produtividade',
    webhookActive: true,
    notifyOnDueSoon: true,
    notifyOnAssigned: true,
    notifyOnCompletion: true
  },
  googleDrive: {
    connected: true,
    backupFolder: 'Taskly Cloud Backups / Q3',
    autoAttachDriveFiles: true,
    usedStorageGB: 4.8,
    totalStorageGB: 50.0
  },
  geminiAI: {
    enabled: true,
    smartBreakdown: true,
    predictiveRisks: true,
    weeklyDigest: true
  },
  enterpriseSSO: {
    enabled: true,
    protocol: 'SAML 2.0',
    domain: 'taskly.enterprise.corp',
    certExpires: '2027-12-31',
    enforce2FA: true,
    sessionTimeoutMinutes: 60
  }
};

export const planTiers: PlanTier[] = [
  {
    id: 'trial',
    name: 'Plano Teste (14 Dias)',
    tagline: 'Ideal para experimentar o ecossistema Taskly sem compromisso e sem cartão.',
    monthlyPrice: 0,
    yearlyPrice: 0,
    isTrial: true,
    trialDays: 14,
    badge: '14 Dias Grátis',
    features: [
      'Gestão de até 15 tarefas ativas simultâneas',
      'Alertas básicos de notificação no navegador',
      'Visualização em Quadro Kanban padrão',
      'Sincronização básica com Google Calendar',
      'Nano Banana AI em modo demonstração (3 consultas/dia)',
      '1 GB de armazenamento seguro em nuvem',
      'Sem necessidade de cadastrar cartão de crédito'
    ],
    maxTeamMembers: 1,
    storageGB: 1,
    cryptoDiscountPercent: 0
  },
  {
    id: 'pro_unlimited',
    name: 'Plano Pro Ilimitado',
    tagline: 'Acesso total e irrestrito a 100% das ferramentas do Taskly, Nano Banana Copilot, automações e integrações.',
    monthlyPrice: 49.90,
    yearlyPrice: 39.90,
    popular: true,
    badge: '✨ TODAS AS FUNCIONALIDADES',
    features: [
      '⚡ Tarefas, Deveres, Metas e Projetos 100% ILIMITADOS',
      '🍌 Copiloto & Assistente Nano Banana AI com Otimizador de Dia e Decomposição',
      '🔔 Alertas Preditivos de Risco e Notificações de Vencimento em Tempo Real',
      '📆 Sincronização Bidirecional Google Calendar + Apple Calendar',
      '💬 Integração Nativa Slack & Discord Webhooks com disparos instantâneos',
      '☁️ Google Drive & Cloud Backup Automático com 100 GB',
      '⏱️ Modo Foco & Timer Pomodoro com Ondas Sonoras Binaurais',
      '📊 Dashboard Analítico Completo (Diário, Semanal, Mensal, Trimestral, Anual) com Exportação CSV',
      '👥 Colaboração em Equipe Sem Limites + Matriz de Permissões (RBAC)',
      '🛡️ Logs de Auditoria Criptografados (AES-256) & Segurança SOC2 / LGPD',
      '💳 Pagamento via PIX Instantâneo, Cartão e Criptomoedas Globais com até 20% OFF',
      '🚀 Suporte Prioritário VIP 24/7 com Resposta em menos de 15 minutos'
    ],
    maxTeamMembers: 'Ilimitado',
    storageGB: 100,
    cryptoDiscountPercent: 20
  }
];

export const analyticsData = {
  diario: [
    { time: '08:00', concluidas: 1, focoMinutos: 45, score: 70 },
    { time: '10:00', concluidas: 3, focoMinutos: 90, score: 88 },
    { time: '12:00', concluidas: 1, focoMinutos: 30, score: 75 },
    { time: '14:00', concluidas: 4, focoMinutos: 110, score: 95 },
    { time: '16:00', concluidas: 2, focoMinutos: 70, score: 85 },
    { time: '18:00', concluidas: 2, focoMinutos: 40, score: 82 },
    { time: '20:00', concluidas: 1, focoMinutos: 25, score: 78 },
  ],
  semanal: [
    { period: 'Segunda', concluidas: 8, pendentes: 3, taxa: 72, focoHoras: 5.4 },
    { period: 'Terça', concluidas: 12, pendentes: 2, taxa: 85, focoHoras: 7.2 },
    { period: 'Quarta', concluidas: 10, pendentes: 4, taxa: 78, focoHoras: 6.1 },
    { period: 'Quinta', concluidas: 14, pendentes: 1, taxa: 93, focoHoras: 8.0 },
    { period: 'Sexta', concluidas: 11, pendentes: 2, taxa: 84, focoHoras: 6.5 },
    { period: 'Sábado', concluidas: 4, pendentes: 1, taxa: 80, focoHoras: 2.2 },
    { period: 'Domingo', concluidas: 2, pendentes: 0, taxa: 100, focoHoras: 1.0 },
  ],
  mensal: [
    { period: 'Semana 1', concluidas: 42, taxa: 82, entregasNoPrazo: 39, focoHoras: 32 },
    { period: 'Semana 2', concluidas: 51, taxa: 89, entregasNoPrazo: 48, focoHoras: 38 },
    { period: 'Semana 3', concluidas: 48, taxa: 86, entregasNoPrazo: 45, focoHoras: 35 },
    { period: 'Semana 4', concluidas: 58, taxa: 94, entregasNoPrazo: 56, focoHoras: 41 },
  ],
  trimestral: [
    { period: 'Mês 1 (Jul)', concluidas: 180, taxa: 84, score: 82, velocity: 45 },
    { period: 'Mês 2 (Ago)', concluidas: 215, taxa: 91, score: 89, velocity: 54 },
    { period: 'Mês 3 (Set Previsto)', concluidas: 230, taxa: 94, score: 93, velocity: 58 },
  ],
  anual: [
    { period: 'Q1', concluidas: 480, taxa: 81, roi: '+24%' },
    { period: 'Q2', concluidas: 590, taxa: 87, roi: '+38%' },
    { period: 'Q3', concluidas: 645, taxa: 91, roi: '+46%' },
    { period: 'Q4 (Meta)', concluidas: 720, taxa: 95, roi: '+55%' },
  ],
  categoryBreakdown: [
    { name: 'Trabalho', value: 38, color: '#6366f1' },
    { name: 'Projetos', value: 24, color: '#3b82f6' },
    { name: 'Entregas', value: 16, color: '#10b981' },
    { name: 'Finanças', value: 10, color: '#f59e0b' },
    { name: 'Estudos', value: 7, color: '#ec4899' },
    { name: 'Saúde', value: 5, color: '#14b8a6' },
  ],
  skillsRadar: [
    { subject: 'Cumprimento de Prazos', A: 94, fullMark: 100 },
    { subject: 'Velocidade de Execução', A: 88, fullMark: 100 },
    { subject: 'Sincronia com Time', A: 92, fullMark: 100 },
    { subject: 'Foco & Concentração', A: 86, fullMark: 100 },
    { subject: 'Qualidade de Entrega', A: 95, fullMark: 100 },
    { subject: 'Conformidade & TI', A: 98, fullMark: 100 },
  ]
};
