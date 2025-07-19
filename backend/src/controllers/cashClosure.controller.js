// backend/src/controllers/cashClosure.controller.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.create = async (req, res) => {
  const { scope } = req.body; // 'global' o 'seller'
  const dateFrom = new Date(new Date().setHours(0,0,0,0));
  const dateTo   = new Date(new Date().setHours(23,59,59,999));

  // Filtrar ventas de hoy
  const whereSales = {
    date: { gte: dateFrom, lte: dateTo }
  };
  if (scope === 'seller') whereSales.sellerId = req.user.id;

  const sales = await prisma.sale.findMany({
    where: whereSales,
    include: { items: true }
  });

  let totalSales = 0, totalReturns = 0;
  sales.forEach(s => {
    totalSales += s.total;
    s.items.forEach(it => totalReturns += it.returnedQty * it.pricePerUnit);
  });

  const net = totalSales - totalReturns;

  // calcular comisión: para cada venta, porcentaje del seller
  let totalCommission = 0;
  if (scope === 'seller') {
    const seller = await prisma.seller.findUnique({
      where: { id: req.user.id }
    });
    totalCommission = net * (seller.commission / 100);
  } else {
    // global: sumamos comisión de cada vendedor
    const sellers = await prisma.seller.findMany();
    sellers.forEach(seller => {
      // calcular solo ventas de hoy de ese seller
      const sumSeller = sales
        .filter(s => s.sellerId === seller.id)
        .reduce((sum, s) => sum + s.total, 0);
      totalCommission += sumSeller * (seller.commission / 100);
    });
  }

  const closure = await prisma.cashClosure.create({
    data: {
      userId: req.user.id,
      totalSales,
      totalReturns,
      totalAmount: net,
      totalCommission
    }
  });
  res.status(201).json(closure);
};

exports.list = async (req, res) => {
  const closures = await prisma.cashClosure.findMany({
    include: { user: true },
    orderBy: { date: 'desc' }
  });
  res.json(closures);
};
