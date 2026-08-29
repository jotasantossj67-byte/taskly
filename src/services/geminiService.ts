import { Task } from '../types';

export interface SmartSubtaskItem {
  title: string;
  estimatedMinutes: number;
}

export async function generateSmartSubtasks(
  taskTitle: string,
  taskDescription: string
): Promise<SmartSubtaskItem[]> {
  try {
    const response = await fetch('/api/gemini/subtasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: taskTitle,
        description: taskDescription,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && Array.isArray(data.subtasks) && data.subtasks.length > 0) {
        return data.subtasks;
      }
    }
  } catch (err) {
    console.warn('API call failed, engaging smart heuristic decomposition:', err);
  }

  // Smart Heuristic Fallback
  const lower = (taskTitle + ' ' + (taskDescription || '')).toLowerCase();
  if (lower.includes('relat') || lower.includes('apresenta') || lower.includes('document') || lower.includes('financeir')) {
    return [
      { title: 'Coletar e estruturar dados brutos', estimatedMinutes: 20 },
      { title: 'Redigir rascunho dos tópicos principais', estimatedMinutes: 35 },
      { title: 'Formatar gráficos e diagramas visuais', estimatedMinutes: 25 },
      { title: 'Revisão ortográfica e aprovação final', estimatedMinutes: 15 },
    ];
  } else if (lower.includes('reuni') || lower.includes('cliente') || lower.includes('call') || lower.includes('meet') || lower.includes('sprint')) {
    return [
      { title: 'Definir pauta e enviar convites no Google Calendar', estimatedMinutes: 10 },
      { title: 'Preparar pontos de discussão e metas da sessão', estimatedMinutes: 20 },
      { title: 'Realizar alinhamento e registrar atas', estimatedMinutes: 45 },
      { title: 'Disparar resumo e próximos passos no Slack', estimatedMinutes: 15 },
    ];
  } else if (lower.includes('deploy') || lower.includes('bug') || lower.includes('código') || lower.includes('sistema') || lower.includes('api')) {
    return [
      { title: 'Diagnosticar logs e reproduzir cenário', estimatedMinutes: 25 },
      { title: 'Implementar correção no branch de desenvolvimento', estimatedMinutes: 45 },
      { title: 'Executar testes unitários e de regressão', estimatedMinutes: 20 },
      { title: 'Validar em homologação e realizar deploy seguro', estimatedMinutes: 30 },
    ];
  }

  return [
    { title: `Planejar escopo e requisitos de "${taskTitle.slice(0, 24)}"`, estimatedMinutes: 20 },
    { title: 'Executar primeira etapa prioritária', estimatedMinutes: 45 },
    { title: 'Validar qualidade e critérios de aceite', estimatedMinutes: 20 },
    { title: 'Concluir entrega e notificar interessados', estimatedMinutes: 15 },
  ];
}

export async function generateProductivityDigest(tasks: Task[]): Promise<string> {
  const completed = tasks.filter(t => t.status === 'concluida').length;
  const pending = tasks.filter(t => t.status !== 'concluida').length;
  const urgent = tasks.filter(t => t.priority === 'urgente' && t.status !== 'concluida').length;

  try {
    const response = await fetch('/api/gemini/digest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        completed,
        pending,
        urgent,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.digest) {
        return data.digest;
      }
    }
  } catch (err) {
    console.warn('API call failed for digest:', err);
  }

  return `📊 **Diagnóstico Taskly AI**: Você mantém um excelente ritmo com **${completed} entregas finalizadas** e **${pending} tarefas em andamento**. Identificamos **${urgent} itens de urgência alta** que demandam atenção hoje para evitar gargalos nos prazos acordados. Recomendamos bloquear um bloco Pomodoro de 50 minutos para as entregas estratégicas da tarde.`;
}

