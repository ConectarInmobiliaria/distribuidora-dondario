// backend/src/controllers/clients.controller.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 🔹 Helper: determinar si es admin
const isAdminUser = (user) =>
  user?.modelHasRoles?.some(m => m.role.name === 'admin');

// 🔹 Helper: determinar si es vendedor
const isSellerUser = (user) =>
  user?.modelHasRoles?.some(m => m.role.name === 'seller');

// Listar clientes
exports.list = async (req, res, next) => {
  try {
    let where = {};

    if (!isAdminUser(req.user)) {
      // Obtener vendedor por email
      const seller = await prisma.seller.findUnique({
        where: { email: req.user.email },
        select: { id: true }
      });

      if (!seller) {
        return res.status(403).json({ error: 'No eres vendedor válido' });
      }

      // Zonas asignadas a ese vendedor
      const zonas = await prisma.zoneSeller.findMany({
        where: { sellerId: seller.id },
        select: { zoneId: true }
      });

      where.zoneId = { in: zonas.map(z => z.zoneId) };
    }

    const clients = await prisma.client.findMany({
      where,
      include: { zone: true, seller: true },
      orderBy: { id: 'desc' }
    });

    res.json(clients);
  } catch (err) {
    next(err);
  }
};

// Obtener cliente
exports.get = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    const client = await prisma.client.findUnique({
      where: { id },
      include: { zone: true, seller: true }
    });

    if (!client) return res.status(404).json({ error: 'Cliente no encontrado' });

    if (!isAdminUser(req.user) && client.sellerId !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    res.json(client);
  } catch (err) {
    next(err);
  }
};

// Crear cliente
exports.create = async (req, res, next) => {
  try {
    const {
      firstName, lastName, companyName, cuit,
      address, phone, wantsInvoice, zoneId, sellerId: bodySellerId
    } = req.body;

    if (!firstName || !lastName || !zoneId) {
      return res.status(400).json({ error: 'Datos obligatorios faltantes' });
    }

    let sellerId = Number(bodySellerId);

    if (isSellerUser(req.user)) {
      // Forzar que el sellerId sea el del usuario logueado
      const seller = await prisma.seller.findUnique({
        where: { email: req.user.email },
        select: { id: true }
      });
      if (!seller) return res.status(403).json({ error: 'Vendedor inválido' });
      sellerId = seller.id;
    }

    const client = await prisma.client.create({
      data: {
        firstName,
        lastName,
        companyName,
        cuit,
        address,
        phone,
        wantsInvoice: Boolean(wantsInvoice),
        zoneId: Number(zoneId),
        sellerId
      }
    });

    res.status(201).json(client);
  } catch (err) {
    next(err);
  }
};

// Actualizar cliente
exports.update = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    const existing = await prisma.client.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Cliente no existe' });

    if (!isAdminUser(req.user) && existing.sellerId !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const {
      firstName, lastName, companyName, cuit,
      address, phone, wantsInvoice, zoneId, sellerId: bodySellerId
    } = req.body;

    const data = {
      firstName,
      lastName,
      companyName,
      cuit,
      address,
      phone,
      wantsInvoice: Boolean(wantsInvoice),
      zoneId: Number(zoneId)
    };

    // Solo admin puede cambiar vendedor
    if (isAdminUser(req.user) && bodySellerId) {
      data.sellerId = Number(bodySellerId);
    }

    const client = await prisma.client.update({
      where: { id },
      data
    });

    res.json(client);
  } catch (err) {
    next(err);
  }
};

// Eliminar cliente
exports.remove = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    const existing = await prisma.client.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Cliente no existe' });

    if (!isAdminUser(req.user) && existing.sellerId !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    await prisma.client.delete({ where: { id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
