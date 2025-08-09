// backend/src/controllers/cashClosure.controller.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.create = async (req, res) => {
  try {
    const { scope } = req.body; // 'global' o 'seller'
    const dateFrom = new Date(new Date().setHours(0, 0, 0, 0));
    const dateTo = new Date(new Date().setHours(23, 59, 59, 999));

    // Filtro de ventas de hoy
    const whereSales = {
      date: { gte: dateFrom, lte: dateTo }
    };
    if (scope === 'seller') {
      whereSales.sellerId = req.user.id; // Asegúrate que req.user.id sea el sellerId
    }

    const sales = await prisma.sale.findMany({
      where: whereSales,
      include: { items: true }
    });

    let totalSales = 0;
    let totalReturns = 0;

    sales.forEach(sale => {
      totalSales += sale.total;
      sale.items.forEach(item => {
        totalReturns += item.returnedQty * item.pricePerUnit;
      });
    });

    const net = totalSales - totalReturns;

    // Calcular comisión
    let totalCommission = 0;
    if (scope === 'seller') {
      const seller = await prisma.seller.findUnique({
        where: { id: req.user.id }
      });
      if (seller?.commission) {
        totalCommission = net * (seller.commission / 100);
      }
    } else {
      const sellers = await prisma.seller.findMany();
      sellers.forEach(seller => {
        const sumSeller = sales
          .filter(s => s.sellerId === seller.id)
          .reduce((sum, s) => sum + s.total, 0);
        if (seller?.commission) {
          totalCommission += sumSeller * (seller.commission / 100);
        }
      });
    }

    const closure = await prisma.cashClosure.create({
      data: {
        userId: req.user.id,
        totalSales,
        totalReturns,
        totalAmount: net,
        totalCommission,
        date: new Date()
      }
    });

    res.status(201).json(closure);
  } catch (error) {
    console.error("Error en cierre de caja:", error);
    res.status(500).json({ error: "Error al generar cierre de caja" });
  }
};

exports.list = async (req, res) => {
  try {
    const closures = await prisma.cashClosure.findMany({
      include: { user: true },
      orderBy: { date: 'desc' }
    });
    res.json(closures);
  } catch (error) {
    console.error("Error al listar cierres de caja:", error);
    res.status(500).json({ error: "Error al obtener cierres de caja" });
  }
};
