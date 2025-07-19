// backend/src/controllers/sales.controller.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function calculatePrices(items) {
  // Devuelve array con pricePerBundle, pricePerUnit y subtotal, y suma total
  let total = 0;
  const detailed = [];
  for (const it of items) {
    const prod = await prisma.product.findUnique({ where: { id: it.productId } });
    const pricePerUnit = prod.unitPrice;
    const bundlePrice =
      prod.bundleSize * prod.unitPrice * (1 - prod.bundleDiscountPct / 100);
    const subtotal = it.bundleQty * bundlePrice + it.unitQty * pricePerUnit;
    total += subtotal;
    detailed.push({
      ...it,
      pricePerBundle: bundlePrice,
      pricePerUnit,
      subtotal
    });
  }
  return { detailed, total };
}

exports.list = async (req, res) => {
  const isAdmin = req.user.modelHasRoles.some(m => m.role.name === 'admin');
  const where = isAdmin ? {} : { sellerId: req.user.id };
  const sales = await prisma.sale.findMany({
    where,
    include: {
      client: true,
      seller: true,
      items: { include: { product: true } }
    },
    orderBy: { date: 'desc' }
  });
  res.json(sales);
};

exports.get = async (req, res) => {
  const id = Number(req.params.id);
  const sale = await prisma.sale.findUnique({
    where: { id },
    include: { client: true, seller: true, items: { include: { product: true } } }
  });
  if (!sale) return res.status(404).json({ error: 'No existe' });
  const isAdmin = req.user.modelHasRoles.some(m => m.role.name === 'admin');
  if (!isAdmin && sale.sellerId !== req.user.id)
    return res.status(403).json({ error: 'No autorizado' });
  res.json(sale);
};

exports.create = async (req, res) => {
  const { clientId, items } = req.body;
  const sellerId = req.user.id;
  // Calcular precios y total
  const { detailed, total } = await calculatePrices(items);

  const result = await prisma.$transaction(async tx => {
    const sale = await tx.sale.create({
      data: { clientId, sellerId, total }
    });
    for (const it of detailed) {
      await tx.saleItem.create({
        data: {
          saleId: sale.id,
          productId: it.productId,
          bundleQty: it.bundleQty,
          unitQty: it.unitQty,
          pricePerBundle: it.pricePerBundle,
          pricePerUnit: it.pricePerUnit,
          subtotal: it.subtotal
        }
      });
    }
    return sale;
  });

  res.status(201).json(result);
};

exports.remove = async (req, res) => {
  const id = Number(req.params.id);
  await prisma.$transaction([
    prisma.saleItem.deleteMany({ where: { saleId: id } }),
    prisma.sale.delete({ where: { id } })
  ]);
  res.status(204).end();
};

// registrar devolución de un item
exports.returnItem = async (req, res) => {
  const itemId = Number(req.params.itemId);
  const { returnedQty } = req.body; // cantidad devuelta
  const item = await prisma.saleItem.findUnique({ where: { id: itemId }, include: { sale: true } });
  if (!item) return res.status(404).json({ error: 'Item no encontrado' });

  // solo seller dueño de la venta o admin
  const isAdmin = req.user.modelHasRoles.some(m => m.role.name === 'admin');
  if (!isAdmin && item.sale.sellerId !== req.user.id) {
    return res.status(403).json({ error: 'No autorizado' });
  }

  // actualiza returnedQty y recalcula subtotal y total de la venta
  const newReturned = Number(returnedQty);
  const updatedItem = await prisma.saleItem.update({
    where: { id: itemId },
    data: {
      returnedQty: newReturned,
      subtotal: (item.bundleQty * item.pricePerBundle + item.unitQty * item.pricePerUnit)
                - newReturned * item.pricePerUnit  // asumimos devoluciones por unidad
    }
  });

  // recalcular total de la venta
  const items = await prisma.saleItem.findMany({ where: { saleId: item.saleId } });
  const newTotal = items.reduce((sum, it) => sum + it.subtotal, 0);
  await prisma.sale.update({ where: { id: item.saleId }, data: { total: newTotal } });

  res.json({ updatedItem, newTotal });
};
