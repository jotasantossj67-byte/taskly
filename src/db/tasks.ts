import { db } from './index.ts';
import { tasks } from './schema.ts';
import { eq, and, desc } from 'drizzle-orm';

export interface CreateTaskInput {
  userId: number;
  title: string;
  description?: string;
  category?: string;
  priority?: string;
  status?: string;
  dueDate?: string;
  dueTime?: string;
  tags?: string;
  notifyBeforeMinutes?: number;
}

export async function getUserTasks(userId: number) {
  try {
    const list = await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId))
      .orderBy(desc(tasks.createdAt));

    return list;
  } catch (error) {
    console.error('Error fetching user tasks:', error);
    throw new Error('Falha ao listar tarefas do banco de dados', { cause: error });
  }
}

export async function createUserTask(input: CreateTaskInput) {
  try {
    const [created] = await db
      .insert(tasks)
      .values({
        userId: input.userId,
        title: input.title,
        description: input.description || '',
        category: input.category || 'Geral',
        priority: input.priority || 'media',
        status: input.status || 'pendente',
        dueDate: input.dueDate || null,
        dueTime: input.dueTime || null,
        tags: input.tags || '',
        notifyBeforeMinutes: input.notifyBeforeMinutes ?? 30,
      })
      .returning();

    return created;
  } catch (error) {
    console.error('Error creating user task:', error);
    throw new Error('Falha ao gravar tarefa', { cause: error });
  }
}

export async function updateUserTask(
  id: number,
  userId: number,
  updates: Partial<Omit<CreateTaskInput, 'userId'>> & { completedAt?: Date | null }
) {
  try {
    const [updated] = await db
      .update(tasks)
      .set(updates)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning();

    return updated || null;
  } catch (error) {
    console.error('Error updating user task:', error);
    throw new Error('Falha ao atualizar tarefa', { cause: error });
  }
}

export async function deleteUserTask(id: number, userId: number) {
  try {
    const [deleted] = await db
      .delete(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning();

    return deleted || null;
  } catch (error) {
    console.error('Error deleting user task:', error);
    throw new Error('Falha ao excluir tarefa', { cause: error });
  }
}
