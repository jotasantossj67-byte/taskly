import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { requireAuth, optionalAuth, AuthRequest } from './src/middleware/auth.ts';
import { getUserTasks, createUserTask, updateUserTask, deleteUserTask } from './src/db/tasks.ts';
import {
  getAllProducts,
  getProductsBySeller,
  createProduct,
  updateProduct,
  deleteProduct,
  purchaseProduct,
  getBuyerPurchases,
  getSellerSales,
} from './src/db/marketplace.ts';
import { getUserByUid } from './src/db/users.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Lazy initialize Gemini client on server-side
  let aiClient: GoogleGenAI | null = null;
  function getAI(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    if (!aiClient) {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return aiClient;
  }

  // Model fallback list in case of 503 or transient unavailability
  const MODEL_CANDIDATES = ['gemini-2.5-flash', 'gemini-3.7-flash', 'gemini-2.5-pro'];

  // Smart Heuristic Subtask Generator
  function generateFallbackSubtasks(title: string, description?: string) {
    const lower = ((title || '') + ' ' + (description || '')).toLowerCase();
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
    } else if (lower.includes('venda') || lower.includes('produto') || lower.includes('post') || lower.includes('loja')) {
      return [
        { title: 'Definir título atrativo e precificação do produto', estimatedMinutes: 15 },
        { title: 'Criar descrição detalhada e benefícios da entrega', estimatedMinutes: 25 },
        { title: 'Publicar anúncio no catálogo para os compradores', estimatedMinutes: 10 },
        { title: 'Acompanhar pedidos e saldo das vendas na carteira', estimatedMinutes: 15 },
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
      { title: `Planejar escopo e requisitos de "${(title || 'Entrega').slice(0, 24)}"`, estimatedMinutes: 20 },
      { title: 'Executar primeira etapa prioritária', estimatedMinutes: 45 },
      { title: 'Validar qualidade e critérios de aceite', estimatedMinutes: 20 },
      { title: 'Concluir entrega e notificar interessados', estimatedMinutes: 15 },
    ];
  }

  // --- API Routes ---

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      hasSqlHost: Boolean(process.env.SQL_HOST),
      timestamp: new Date().toISOString(),
    });
  });

  // User Profile
  app.get('/api/me', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.dbUser) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }
      const user = await getUserByUid(req.dbUser.uid);
      res.json({ user: user || req.dbUser });
    } catch (err: any) {
      console.error('Error in /api/me:', err);
      res.status(500).json({ error: 'Falha ao buscar perfil' });
    }
  });

  // --- Tasks API (PostgreSQL + Auth) ---
  app.get('/api/tasks', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.dbUser) {
        return res.status(401).json({ error: 'Não autorizado' });
      }
      const list = await getUserTasks(req.dbUser.id);
      res.json({ tasks: list });
    } catch (err: any) {
      console.error('Error in GET /api/tasks:', err);
      res.status(500).json({ error: err.message || 'Erro ao buscar tarefas' });
    }
  });

  app.post('/api/tasks', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.dbUser) {
        return res.status(401).json({ error: 'Não autorizado' });
      }
      const { title, description, category, priority, status, dueDate, dueTime, tags, notifyBeforeMinutes } = req.body;
      if (!title) {
        return res.status(400).json({ error: 'O título da tarefa é obrigatório' });
      }
      const task = await createUserTask({
        userId: req.dbUser.id,
        title,
        description,
        category,
        priority,
        status,
        dueDate,
        dueTime,
        tags,
        notifyBeforeMinutes,
      });
      res.status(201).json({ task });
    } catch (err: any) {
      console.error('Error in POST /api/tasks:', err);
      res.status(500).json({ error: err.message || 'Erro ao criar tarefa' });
    }
  });

  app.put('/api/tasks/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.dbUser) {
        return res.status(401).json({ error: 'Não autorizado' });
      }
      const taskId = parseInt(req.params.id, 10);
      if (isNaN(taskId)) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      const updates = req.body;
      const updated = await updateUserTask(taskId, req.dbUser.id, updates);
      if (!updated) {
        return res.status(404).json({ error: 'Tarefa não encontrada ou acesso negado' });
      }
      res.json({ task: updated });
    } catch (err: any) {
      console.error('Error in PUT /api/tasks/:id:', err);
      res.status(500).json({ error: err.message || 'Erro ao atualizar tarefa' });
    }
  });

  app.delete('/api/tasks/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.dbUser) {
        return res.status(401).json({ error: 'Não autorizado' });
      }
      const taskId = parseInt(req.params.id, 10);
      if (isNaN(taskId)) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      const deleted = await deleteUserTask(taskId, req.dbUser.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Tarefa não encontrada' });
      }
      res.json({ success: true, message: 'Tarefa removida com sucesso' });
    } catch (err: any) {
      console.error('Error in DELETE /api/tasks/:id:', err);
      res.status(500).json({ error: err.message || 'Erro ao excluir tarefa' });
    }
  });

  // --- Marketplace & Sales API (Postar e Vender) ---
  // List all products for sale
  app.get('/api/products', optionalAuth, async (_req, res) => {
    try {
      const productsList = await getAllProducts();
      res.json({ products: productsList });
    } catch (err: any) {
      console.error('Error in GET /api/products:', err);
      res.status(500).json({ error: 'Falha ao buscar catálogo de produtos' });
    }
  });

  // List my posted products (seller)
  app.get('/api/products/my', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.dbUser) return res.status(401).json({ error: 'Não autorizado' });
      const myProducts = await getProductsBySeller(req.dbUser.id);
      res.json({ products: myProducts });
    } catch (err: any) {
      console.error('Error in GET /api/products/my:', err);
      res.status(500).json({ error: 'Falha ao buscar seus produtos' });
    }
  });

  // Create a new product to sell
  app.post('/api/products', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.dbUser) return res.status(401).json({ error: 'Não autorizado' });
      const { title, description, price, category, imageUrl, stock, deliveryDetails, featured } = req.body;
      if (!title || !description || price === undefined || !category) {
        return res.status(400).json({ error: 'Campos obrigatórios: título, descrição, preço e categoria' });
      }
      const created = await createProduct({
        sellerId: req.dbUser.id,
        title,
        description,
        price: Math.round(Number(price)),
        category,
        imageUrl,
        stock: stock ? Number(stock) : 10,
        deliveryDetails,
        featured: Boolean(featured),
      });
      res.status(201).json({ product: created });
    } catch (err: any) {
      console.error('Error in POST /api/products:', err);
      res.status(500).json({ error: err.message || 'Falha ao postar produto para venda' });
    }
  });

  // Update product
  app.put('/api/products/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.dbUser) return res.status(401).json({ error: 'Não autorizado' });
      const id = parseInt(req.params.id, 10);
      const updated = await updateProduct(id, req.dbUser.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Produto não encontrado ou acesso negado' });
      }
      res.json({ product: updated });
    } catch (err: any) {
      console.error('Error in PUT /api/products/:id:', err);
      res.status(500).json({ error: err.message || 'Falha ao atualizar anúncio' });
    }
  });

  // Delete product
  app.delete('/api/products/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.dbUser) return res.status(401).json({ error: 'Não autorizado' });
      const id = parseInt(req.params.id, 10);
      const deleted = await deleteProduct(id, req.dbUser.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }
      res.json({ success: true, message: 'Anúncio removido' });
    } catch (err: any) {
      console.error('Error in DELETE /api/products/:id:', err);
      res.status(500).json({ error: err.message || 'Falha ao excluir anúncio' });
    }
  });

  // Buy a product (creates order, credits seller balance, registers sale)
  app.post('/api/products/:id/buy', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.dbUser) return res.status(401).json({ error: 'Não autorizado' });
      const productId = parseInt(req.params.id, 10);
      const { paymentMethod } = req.body;
      const buyerName = req.dbUser.displayName || req.user?.name || 'Comprador';
      const buyerEmail = req.dbUser.email || req.user?.email || 'comprador@taskly.app';

      const result = await purchaseProduct(
        productId,
        req.dbUser.id,
        buyerName,
        buyerEmail,
        paymentMethod || 'PIX'
      );

      res.json({
        success: true,
        order: result.order,
        product: result.product,
        deliveryDetails: result.deliveryDetails,
        message: 'Compra realizada com sucesso!',
      });
    } catch (err: any) {
      console.error('Error in POST /api/products/:id/buy:', err);
      res.status(400).json({ error: err.message || 'Falha ao processar compra' });
    }
  });

  // Get orders where I am the buyer
  app.get('/api/orders/my-purchases', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.dbUser) return res.status(401).json({ error: 'Não autorizado' });
      const purchases = await getBuyerPurchases(req.dbUser.id);
      res.json({ purchases });
    } catch (err: any) {
      console.error('Error in GET /api/orders/my-purchases:', err);
      res.status(500).json({ error: 'Falha ao buscar compras' });
    }
  });

  // Get sales where I am the seller
  app.get('/api/orders/my-sales', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.dbUser) return res.status(401).json({ error: 'Não autorizado' });
      const sales = await getSellerSales(req.dbUser.id);
      res.json({ sales });
    } catch (err: any) {
      console.error('Error in GET /api/orders/my-sales:', err);
      res.status(500).json({ error: 'Falha ao buscar vendas' });
    }
  });

  // --- Gemini AI Endpoints ---
  app.post('/api/gemini/subtasks', async (req, res) => {
    const { title, description } = req.body;
    const ai = getAI();

    if (!ai) {
      const fallbackSubtasks = generateFallbackSubtasks(title, description);
      return res.json({
        success: true,
        subtasks: fallbackSubtasks,
        fallback: true,
        message: 'Modo heurístico ativo.',
      });
    }

    const prompt = `Como assistente especialista em produtividade e vendas do Taskly, divida a seguinte tarefa ou entrega em 3 a 5 subtarefas práticas, acionáveis e objetivas com estimativa de minutos:
Título da Tarefa: "${title || ''}"
Descrição adicional: "${description || 'Sem descrição'}"`;

    for (const model of MODEL_CANDIDATES) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: 'Título claro da subtarefa' },
                  estimatedMinutes: { type: Type.INTEGER, description: 'Estimativa de tempo em minutos' },
                },
                required: ['title', 'estimatedMinutes'],
              },
            },
          },
        });

        const text = response.text || '[]';
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return res.json({ success: true, subtasks: parsed, modelUsed: model });
        }
      } catch (err: any) {
        console.warn(`Tentativa com ${model} indisponível. Tentando próximo modelo...`);
      }
    }

    const fallbackSubtasks = generateFallbackSubtasks(title, description);
    return res.json({
      success: true,
      subtasks: fallbackSubtasks,
      fallback: true,
    });
  });

  app.post('/api/gemini/digest', async (req, res) => {
    const { completed, pending, urgent, salesCount, revenue } = req.body;
    const ai = getAI();

    const fallbackDigest = `📊 **Diagnóstico Taskly**: Você tem **${completed} entregas finalizadas**, **${pending} tarefas em andamento** e **${urgent} itens de urgência alta**. ${salesCount ? `No seu painel de vendas, já foram realizadas **${salesCount} transações** gerando **R$ ${(Number(revenue || 0) / 100).toFixed(2)}** em faturamento.` : 'Publique seus templates e serviços para começar a faturar diretamente pelo Taskly.'}`;

    if (!ai) {
      return res.json({
        success: true,
        digest: fallbackDigest,
        fallback: true,
      });
    }

    const prompt = `Você é o assistente inteligente do Taskly SaaS. Gere um resumo executivo breve (2 a 3 parágrafos curtos) em português do Brasil, encorajador e analítico, com base nestes dados:
- Entregas concluídas: ${completed}
- Tarefas pendentes em andamento: ${pending}
- Tarefas urgentes: ${urgent}
- Total de vendas realizadas: ${salesCount || 0}
- Receita total faturada: R$ ${(Number(revenue || 0) / 100).toFixed(2)}
Inclua recomendações práticas para alta performance, foco diário e aumento nas vendas dos produtos/serviços publicados.`;

    for (const model of MODEL_CANDIDATES) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
        });

        if (response.text) {
          return res.json({ success: true, digest: response.text, modelUsed: model });
        }
      } catch (err: any) {
        console.warn(`Digest com ${model} indisponível.`);
      }
    }

    return res.json({
      success: true,
      digest: fallbackDigest,
      fallback: true,
    });
  });

  // --- Vite / Static Middleware ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Taskly server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
