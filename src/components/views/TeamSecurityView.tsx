import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  FileText, 
  Lock, 
  Key, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Globe, 
  Cpu, 
  UserPlus, 
  Search,
  Filter,
  Check
} from 'lucide-react';
import { TeamMember, AuditLog } from '../../types';
import { initialAuditLogs } from '../../services/mockData';
import { sounds } from '../../services/soundEffects';

interface TeamSecurityViewProps {
  teamMembers: TeamMember[];
}

export const TeamSecurityView: React.FC<TeamSecurityViewProps> = ({ teamMembers }) => {
  const [logs, setLogs] = useState<AuditLog[]>(initialAuditLogs);
  const [logFilter, setLogFilter] = useState<'all' | 'sucesso' | 'bloqueado'>('all');
  const [ssoProtocol, setSsoProtocol] = useState<'SAML 2.0' | 'LDAP' | 'OIDC'>('SAML 2.0');
  const [domainName, setDomainName] = useState('taskly.enterprise.corp');
  const [enforce2FA, setEnforce2FA] = useState(true);

  const filteredLogs = logs.filter(l => {
    if (logFilter !== 'all' && l.status !== logFilter) return false;
    return true;
  });

  const handleExportAuditReport = (format: 'csv' | 'json') => {
    let content = '';
    let mimeType = '';
    let filename = `Taskly_Audit_Report_${new Date().toISOString().split('T')[0]}.${format}`;

    if (format === 'csv') {
      content = "data:text/csv;charset=utf-8,"
        + "Timestamp,Usuario,Cargo,Acao,Recurso,IP,Localizacao,Status,Criptografia\n"
        + logs.map(l => `"${l.timestamp}","${l.userName}","${l.userRole}","${l.action}","${l.resource}","${l.ipAddress}","${l.location}","${l.status}","${l.encryption}"`).join("\n");
      mimeType = 'text/csv';
    } else {
      content = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
      mimeType = 'application/json';
    }

    const link = document.createElement("a");
    link.setAttribute("href", format === 'csv' ? encodeURI(content) : content);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    sounds.playComplete();
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-0.5 text-xs font-semibold text-purple-300 mb-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Infraestrutura Segura • SOC2 & LGPD Compliant</span>
          </div>
          <h2 className="font-['Outfit',sans-serif] text-xl sm:text-2xl font-bold text-white">
            Gestão de Equipe, Permissões RBAC & Auditoria
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1">
            Controle granular de acesso, autenticação corporativa unificada (LDAP/SAML), criptografia AES-256 de ponta a ponta e rastreabilidade total de auditoria para gestores de TI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExportAuditReport('csv')}
            id="btn-export-audit-csv"
            className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md hover:bg-purple-500 active:scale-95 transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Exportar Relatório (CSV)</span>
          </button>
        </div>
      </div>

      {/* Security Metrics & Compliance Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400">Criptografia em Repouso e Trânsito</span>
            <h4 className="font-bold text-white text-base">AES-256-GCM + TLS 1.3</h4>
            <span className="text-[11px] text-emerald-400 font-semibold">Chaves gerenciadas em HSM</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Key className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400">Autenticação Corporativa</span>
            <h4 className="font-bold text-white text-base">SAML 2.0 / LDAP / SSO</h4>
            <span className="text-[11px] text-indigo-300 font-semibold">2FA Obrigatório para Admins</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400">Conformidade & Rastreio</span>
            <h4 className="font-bold text-white text-base">SOC2 Tipo II & LGPD</h4>
            <span className="text-[11px] text-purple-300 font-semibold">Logs imutáveis auditáveis</span>
          </div>
        </div>

      </div>

      {/* Team Directory & Granular RBAC Permissions Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-400" />
              <span>Membros da Equipe & Matriz de Permissões (RBAC)</span>
            </h3>
            <p className="text-xs text-slate-400">Controle simplificado sobre recursos críticos do sistema.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold">
              <tr>
                <th className="py-3 px-4">Membro & Email</th>
                <th className="py-3 px-3">Papel / Função</th>
                <th className="py-3 px-3">Departamento</th>
                <th className="py-3 px-3 text-center">Gerenciar Tarefas</th>
                <th className="py-3 px-3 text-center">Métricas</th>
                <th className="py-3 px-3 text-center">Integrações</th>
                <th className="py-3 px-3 text-center">Logs Auditoria</th>
                <th className="py-3 px-3 text-center">Faturamento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {teamMembers.map((member) => (
                <tr key={member.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img src={member.avatar} alt="" className="h-8 w-8 rounded-full object-cover border border-slate-700" />
                      <div>
                        <div className="font-semibold text-slate-100">{member.name}</div>
                        <div className="text-[11px] text-slate-400">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${
                      member.role === 'Super Admin' 
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : member.role === 'Gerente TI'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-400">{member.department}</td>
                  
                  {/* Permissions checks */}
                  <td className="py-3.5 px-3 text-center">
                    {member.permissions.canManageTasks ? <Check className="h-4 w-4 text-emerald-400 mx-auto" /> : <span className="text-slate-600">—</span>}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    {member.permissions.canViewAnalytics ? <Check className="h-4 w-4 text-emerald-400 mx-auto" /> : <span className="text-slate-600">—</span>}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    {member.permissions.canManageIntegrations ? <Check className="h-4 w-4 text-emerald-400 mx-auto" /> : <span className="text-slate-600">—</span>}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    {member.permissions.canAccessAuditLogs ? <Check className="h-4 w-4 text-emerald-400 mx-auto" /> : <span className="text-slate-600">—</span>}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    {member.permissions.canManageBilling ? <Check className="h-4 w-4 text-emerald-400 mx-auto" /> : <span className="text-slate-600">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enterprise SSO / SAML / LDAP Config Box */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Key className="h-5 w-5 text-cyan-400" />
              <span>Configuração de Autenticação Corporativa (LDAP / SAML 2.0)</span>
            </h3>
            <p className="text-xs text-slate-400">Provedores compatíveis: Microsoft Entra ID (Azure AD), Okta, Google Workspace, OpenLDAP.</p>
          </div>
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Conexão Validade
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <label className="text-slate-400 font-semibold">Protocolo de Federação:</label>
            <select
              value={ssoProtocol}
              onChange={(e) => setSsoProtocol(e.target.value as 'SAML 2.0' | 'LDAP' | 'OIDC')}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-slate-200 font-medium focus:border-cyan-400 focus:outline-none"
            >
              <option value="SAML 2.0">SAML 2.0 (Okta, Entra ID)</option>
              <option value="LDAP">LDAP / Active Directory Corporativo</option>
              <option value="OIDC">OpenID Connect (OIDC)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-semibold">Domínio Corporativo Verificado:</label>
            <input
              type="text"
              value={domainName}
              onChange={(e) => setDomainName(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-slate-200 font-medium focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-semibold">Políticas de Acesso:</label>
            <div className="flex items-center gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                <input
                  type="checkbox"
                  checked={enforce2FA}
                  onChange={(e) => setEnforce2FA(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-0"
                />
                <span>Exigir 2FA Obrigatório</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Audit Trail Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-400" />
              <span>Logs de Auditoria em Tempo Real & Rastreabilidade de TI</span>
            </h3>
            <p className="text-xs text-slate-400">Rastreamento contínuo de acessos críticos, ações administrativas e integridade.</p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={logFilter}
              onChange={(e) => setLogFilter(e.target.value as 'all' | 'sucesso' | 'bloqueado')}
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
            >
              <option value="all">Todos os Status</option>
              <option value="sucesso">Apenas Sucesso</option>
              <option value="bloqueado">Tentativas Bloqueadas</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold">
              <tr>
                <th className="py-3 px-3">Data/Hora (UTC)</th>
                <th className="py-3 px-3">Usuário & Cargo</th>
                <th className="py-3 px-3">Ação Executada</th>
                <th className="py-3 px-3">Recurso / Endpoint</th>
                <th className="py-3 px-3">IP & Localização</th>
                <th className="py-3 px-3">Criptografia</th>
                <th className="py-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3 text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                  <td className="py-3 px-3 font-sans font-medium text-slate-200">
                    {log.userName} <span className="text-slate-500 text-[10px]">({log.userRole})</span>
                  </td>
                  <td className="py-3 px-3 text-indigo-300 font-semibold">{log.action}</td>
                  <td className="py-3 px-3 text-slate-400 max-w-[180px] truncate">{log.resource}</td>
                  <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                    {log.ipAddress} <span className="text-[10px] text-slate-500 font-sans">({log.location})</span>
                  </td>
                  <td className="py-3 px-3 text-cyan-400 text-[10px]">{log.encryption}</td>
                  <td className="py-3 px-3 text-right">
                    <span className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold font-sans ${
                      log.status === 'sucesso'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {log.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
