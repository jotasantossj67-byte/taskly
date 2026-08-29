import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core';

// Users table (linked to Firebase Auth UID)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  photoURL: text('photo_url'),
  role: text('role').default('user'), // 'user', 'seller', 'admin'
  bio: text('bio'),
  balance: integer('balance').default(0), // in cents (R$)
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tasks table (belonging to a specific user)
export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category').default('Geral'),
  priority: text('priority').default('media'), // 'baixa', 'media', 'alta', 'urgente'
  status: text('status').default('pendente'), // 'pendente', 'em_progresso', 'concluida'
  dueDate: text('due_date'),
  dueTime: text('due_time'),
  tags: text('tags'),
  notifyBeforeMinutes: integer('notify_before_minutes').default(30),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Products / Services table for Posting and Selling
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  sellerId: integer('seller_id')
    .references(() => users.id)
    .notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  price: integer('price').notNull(), // in cents (e.g. 4990 = R$ 49,90)
  category: text('category').notNull(), // 'Templates', 'Serviços', 'Consultoria', 'Cursos', 'Ferramentas', 'Outros'
  imageUrl: text('image_url'),
  status: text('status').default('active'), // 'active', 'paused', 'sold_out'
  stock: integer('stock').default(10),
  salesCount: integer('sales_count').default(0),
  deliveryDetails: text('delivery_details'), // Instructions or downloadable link
  featured: boolean('featured').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Orders / Transactions table (Purchases made by users)
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  productId: integer('product_id')
    .references(() => products.id)
    .notNull(),
  buyerId: integer('buyer_id')
    .references(() => users.id)
    .notNull(),
  sellerId: integer('seller_id')
    .references(() => users.id)
    .notNull(),
  amount: integer('amount').notNull(), // in cents
  paymentMethod: text('payment_method').default('PIX'), // 'PIX', 'Cartão', 'Saldo'
  status: text('status').default('completed'), // 'completed', 'pending', 'cancelled'
  buyerName: text('buyer_name'),
  buyerEmail: text('buyer_email'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  tasks: many(tasks),
  products: many(products),
  purchases: many(orders, { relationName: 'buyerOrders' }),
  sales: many(orders, { relationName: 'sellerOrders' }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  seller: one(users, {
    fields: [products.sellerId],
    references: [users.id],
  }),
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  product: one(products, {
    fields: [orders.productId],
    references: [products.id],
  }),
  buyer: one(users, {
    fields: [orders.buyerId],
    references: [users.id],
    relationName: 'buyerOrders',
  }),
  seller: one(users, {
    fields: [orders.sellerId],
    references: [users.id],
    relationName: 'sellerOrders',
  }),
}));
