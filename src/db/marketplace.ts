import { db } from './index.ts';
import { products, orders, users } from './schema.ts';
import { eq, desc, and } from 'drizzle-orm';

export interface CreateProductInput {
  sellerId: number;
  title: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  stock?: number;
  deliveryDetails?: string;
  featured?: boolean;
}

export async function getAllProducts() {
  try {
    const list = await db
      .select({
        id: products.id,
        sellerId: products.sellerId,
        title: products.title,
        description: products.description,
        price: products.price,
        category: products.category,
        imageUrl: products.imageUrl,
        status: products.status,
        stock: products.stock,
        salesCount: products.salesCount,
        deliveryDetails: products.deliveryDetails,
        featured: products.featured,
        createdAt: products.createdAt,
        sellerName: users.displayName,
        sellerEmail: users.email,
        sellerPhoto: users.photoURL,
      })
      .from(products)
      .innerJoin(users, eq(products.sellerId, users.id))
      .where(eq(products.status, 'active'))
      .orderBy(desc(products.featured), desc(products.createdAt));

    return list;
  } catch (error) {
    console.error('Error fetching all products:', error);
    throw new Error('Falha ao listar produtos do marketplace', { cause: error });
  }
}

export async function getProductsBySeller(sellerId: number) {
  try {
    const list = await db
      .select()
      .from(products)
      .where(eq(products.sellerId, sellerId))
      .orderBy(desc(products.createdAt));

    return list;
  } catch (error) {
    console.error('Error fetching seller products:', error);
    throw new Error('Falha ao listar seus produtos', { cause: error });
  }
}

export async function createProduct(input: CreateProductInput) {
  try {
    const [created] = await db
      .insert(products)
      .values({
        sellerId: input.sellerId,
        title: input.title,
        description: input.description,
        price: input.price,
        category: input.category,
        imageUrl: input.imageUrl || null,
        stock: input.stock ?? 10,
        deliveryDetails: input.deliveryDetails || null,
        featured: input.featured ?? false,
      })
      .returning();

    return created;
  } catch (error) {
    console.error('Error creating product:', error);
    throw new Error('Falha ao publicar produto', { cause: error });
  }
}

export async function updateProduct(
  id: number,
  sellerId: number,
  updates: Partial<Omit<CreateProductInput, 'sellerId'>> & { status?: string }
) {
  try {
    const [updated] = await db
      .update(products)
      .set(updates)
      .where(and(eq(products.id, id), eq(products.sellerId, sellerId)))
      .returning();

    return updated || null;
  } catch (error) {
    console.error('Error updating product:', error);
    throw new Error('Falha ao atualizar produto', { cause: error });
  }
}

export async function deleteProduct(id: number, sellerId: number) {
  try {
    const [deleted] = await db
      .delete(products)
      .where(and(eq(products.id, id), eq(products.sellerId, sellerId)))
      .returning();

    return deleted || null;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw new Error('Falha ao excluir produto', { cause: error });
  }
}

export async function purchaseProduct(
  productId: number,
  buyerId: number,
  buyerName: string,
  buyerEmail: string,
  paymentMethod: string = 'PIX'
) {
  try {
    // 1. Get product
    const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
    if (!product) {
      throw new Error('Produto não encontrado');
    }
    if (product.status !== 'active' || (product.stock && product.stock <= 0)) {
      throw new Error('Produto indisponível ou esgotado');
    }
    if (product.sellerId === buyerId) {
      throw new Error('Você não pode comprar seu próprio produto');
    }

    // 2. Create order
    const [order] = await db
      .insert(orders)
      .values({
        productId,
        buyerId,
        sellerId: product.sellerId,
        amount: product.price,
        paymentMethod,
        status: 'completed',
        buyerName,
        buyerEmail,
      })
      .returning();

    // 3. Update product sales and stock
    const newStock = product.stock ? Math.max(0, product.stock - 1) : 0;
    const newSales = (product.salesCount || 0) + 1;
    await db
      .update(products)
      .set({
        salesCount: newSales,
        stock: newStock,
        status: newStock === 0 ? 'sold_out' : 'active',
      })
      .where(eq(products.id, productId));

    // 4. Update seller balance
    const [seller] = await db.select().from(users).where(eq(users.id, product.sellerId)).limit(1);
    if (seller) {
      await db
        .update(users)
        .set({
          balance: (seller.balance || 0) + product.price,
        })
        .where(eq(users.id, product.sellerId));
    }

    return {
      order,
      product,
      deliveryDetails: product.deliveryDetails || 'Entrega confirmada com sucesso pelo vendedor.',
    };
  } catch (error) {
    console.error('Error processing purchase:', error);
    throw new Error('Falha ao processar compra', { cause: error });
  }
}

export async function getBuyerPurchases(buyerId: number) {
  try {
    const list = await db
      .select({
        id: orders.id,
        amount: orders.amount,
        paymentMethod: orders.paymentMethod,
        status: orders.status,
        createdAt: orders.createdAt,
        productId: products.id,
        productTitle: products.title,
        productDescription: products.description,
        productCategory: products.category,
        productImageUrl: products.imageUrl,
        deliveryDetails: products.deliveryDetails,
        sellerName: users.displayName,
        sellerEmail: users.email,
      })
      .from(orders)
      .innerJoin(products, eq(orders.productId, products.id))
      .innerJoin(users, eq(orders.sellerId, users.id))
      .where(eq(orders.buyerId, buyerId))
      .orderBy(desc(orders.createdAt));

    return list;
  } catch (error) {
    console.error('Error fetching buyer purchases:', error);
    throw new Error('Falha ao listar suas compras', { cause: error });
  }
}

export async function getSellerSales(sellerId: number) {
  try {
    const list = await db
      .select({
        id: orders.id,
        amount: orders.amount,
        paymentMethod: orders.paymentMethod,
        status: orders.status,
        buyerName: orders.buyerName,
        buyerEmail: orders.buyerEmail,
        createdAt: orders.createdAt,
        productId: products.id,
        productTitle: products.title,
        productCategory: products.category,
      })
      .from(orders)
      .innerJoin(products, eq(orders.productId, products.id))
      .where(eq(orders.sellerId, sellerId))
      .orderBy(desc(orders.createdAt));

    return list;
  } catch (error) {
    console.error('Error fetching seller sales:', error);
    throw new Error('Falha ao listar suas vendas', { cause: error });
  }
}
