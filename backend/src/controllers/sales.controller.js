// backend/src/controllers/sales.controller.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function calculatePrices(items) {
  let total = 0;
  const detailed = [];

  for (const it of items) {
    const productId = Number(it.productId);
    const bundleQty  = Number(it.bundleQty);
    const unitQty    = Number(it.unitQty);

    const prod = await prisma.product.findUnique({ where: { id: productId } });
    if (!prod) throw new Error(`Producto ${productId} no existe`);

    const pricePerUnit   = prod.unitPrice;
    const pricePerBundle = prod.bundleSize * prod.unitPrice * (1 - prod.bundleDiscountPct / 100);
    const subtotal       = bundleQty * pricePerBundle + unitQty * pricePerUnit;

    total += subtotal;
    detailed.push({ productId, bundleQty, unitQty, pricePerBundle, pricePerUnit, subtotal });
  }

  return { detailed, total };
}

exports.list = async (req, res, next) => {
  try {
    const isAdmin = req.user.modelHasRoles.some(m => m.role.name === 'admin');
    let where = {};

    if (!isAdmin) {
      // Para vendedores: filtrar por su sellerId real
      const seller = await prisma.seller.findUnique({ where: { email: req.user.email } });
      if (!seller) return res.status(403).json({ error: 'No eres vendedor válido' });
      where.sellerId = seller.id;
    }

    const sales = await prisma.sale.findMany({
      where,
      include: {
        client: true,
        seller: true,
        items:  { include: { product: true } }
      },
      orderBy: { date: 'desc' }
    });
    res.json(sales);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { clientId, items, sellerId: bodySellerId } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Debes enviar al menos un item' });
    }

    const isAdmin = req.user.modelHasRoles.some(m => m.role.name === 'admin');
    let seller;

    if (isAdmin) {
      // Admin: obligatorio enviar sellerId
      if (!bodySellerId) return res.status(400).json({ error: 'Admins deben enviar sellerId' });
      seller = await prisma.seller.findUnique({ where: { id: Number(bodySellerId) } });
      if (!seller) return res.status(404).json({ error: 'Seller no encontrado' });
    } else {
      // Vendedor: detectamos por email
      seller = await prisma.seller.findUnique({ where: { email: req.user.email } });
      if (!seller) return res.status(403).json({ error: 'No eres vendedor válido' });
    }

    // **Control de cliente vs zona**:
    // Si no es admin, asegurar que el cliente pertenezca a una zona del vendedor
    if (!isAdmin) {
      const client = await prisma.client.findUnique({ where: { id: Number(clientId) } });
      const zonasDelSeller = (await prisma.zoneSeller.findMany({
        where: { sellerId: seller.id },
        select: { zoneId: true }
      })).map(z => z.zoneId);
      if (!client || !zonasDelSeller.includes(client.zoneId)) {
        return res.status(403).json({ error: 'No puedes vender a ese cliente' });
      }
    }

    // Calcular precios
    const { detailed, total } = await calculatePrices(items);

    // Crear venta + items en transacción
    const sale = await prisma.$transaction(async tx => {
      const newSale = await tx.sale.create({
        data: { clientId: Number(clientId), sellerId: seller.id, total }
      });
      for (const it of detailed) {
        await tx.saleItem.create({
          data: {
            saleId: newSale.id,
            productId: it.productId,
            bundleQty: it.bundleQty,
            unitQty: it.unitQty,
            pricePerBundle: it.pricePerBundle,
            pricePerUnit: it.pricePerUnit,
            subtotal: it.subtotal
          }
        });
      }
      return newSale;
    });

    res.status(201).json(sale);
  } catch (err) {
    next(err);
  }
};

// Obtener venta por id
exports.get = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        client: true,
        seller: true,
        items: { include: { product: true } }
      }
    });
    if (!sale) return res.status(404).json({ error: 'Venta no encontrada' });
    res.json(sale);
  } catch (err) {
    next(err);
  }
};

// Eliminar venta
exports.remove = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.sale.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// Registrar devolución de un ítem de venta
exports.returnItem = async (req, res, next) => {
  try {
    // Implementación mínima: solo responde OK
    res.json({ success: true, message: 'Devolución registrada (mock)' });
  } catch (err) {
    next(err);
  }
};
