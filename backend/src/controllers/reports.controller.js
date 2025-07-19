// backend/src/controllers/reports.controller.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function toDateRange(query) {
  const from = query.from ? new Date(query.from) : new Date(0);
  const to   = query.to   ? new Date(query.to)   : new Date();
  to.setHours(23,59,59,999);
  return { gte: from, lte: to };
}

// 1️⃣ Ventas por período
exports.salesByPeriod = async (req, res) => {
  const dateRange = toDateRange(req.query);
  const sales = await prisma.sale.findMany({
    where: { date: dateRange },
    include: { items: true, client: true, seller: true },
    orderBy: { date: 'asc' }
  });
  res.json(sales);
};

// 2️⃣ Productos más vendidos (por cantidad total de unidades + bultos)
exports.topProducts = async (req, res) => {
  const dateRange = toDateRange(req.query);
  const items = await prisma.saleItem.findMany({
    where: { sale: { date: dateRange } },
    include: { product: true }
  });
  // sumar cantidades
  const stats = {};
  items.forEach(it => {
    const p = it.product;
    if (!stats[p.id]) stats[p.id] = { sku: p.sku, name: p.name, totalUnits: 0 };
    stats[p.id].totalUnits += it.bundleQty * p.bundleSize + it.unitQty;
  });
  // orden descendente
  const result = Object.values(stats)
    .sort((a,b) => b.totalUnits - a.totalUnits)
    .slice(0, req.query.top ? Number(req.query.top) : 10);
  res.json(result);
};

// 3️⃣ Comisiones pagadas (por vendedor)
exports.commissions = async (req, res) => {
  const dateRange = toDateRange(req.query);
  // traer ventas y sellers
  const sellers = await prisma.seller.findMany();
  const sales = await prisma.sale.findMany({
    where: { date: dateRange },
    include: { items: true }
  });
  // calcular por seller
  const result = sellers.map(seller => {
    const sellerSales = sales.filter(s => s.sellerId === seller.id);
    const total = sellerSales.reduce((sum, s) => sum + s.total, 0);
    const commission = total * (seller.commission / 100);
    return {
      sellerId: seller.id,
      name: `${seller.firstName} ${seller.lastName}`,
      totalSales: total,
      commission
    };
  });
  res.json(result);
};
