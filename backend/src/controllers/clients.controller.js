// backend/src/controllers/clients.controller.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Lista clientes: admin ve todos, seller sólo los suyos
exports.list = async (req, res, next) => {
  try {
    const isAdmin = req.user.modelHasRoles.some(m => m.role.name === 'admin');

    let where = {};
    if (!isAdmin) {
      // El vendedor solo ve clientes de sus zonas
      const seller = await prisma.seller.findUnique({ where: { email: req.user.email } });
      if (!seller) return res.status(403).json({ error: 'No eres vendedor válido' });

      const zonas = (await prisma.zoneSeller.findMany({
        where: { sellerId: seller.id },
        select: { zoneId: true }
      })).map(z => z.zoneId);

      where.zoneId = { in: zonas };
    }

    const clients = await prisma.client.findMany({
      where,
      include: { zone: true, seller: true }
    });
    res.json(clients);
  } catch (err) {
    next(err);
  }
};

// Obtener un cliente (verifica permiso)
exports.get = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const client = await prisma.client.findUnique({
      where: { id },
      include: { zone: true, seller: true }
    });
    if (!client) return res.status(404).json({ error: 'No existe' });

    const isAdmin = req.user.modelHasRoles.some(m => m.role.name === 'admin');
    if (!isAdmin && client.sellerId !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    res.json(client);
  } catch (err) {
    next(err);
  }
};

// Crear cliente (sellerId se toma del token para seller)
exports.create = async (req, res, next) => {
  try {
    const {
      firstName, lastName, companyName, cuit,
      address, phone, wantsInvoice, zoneId, sellerId: bodySellerId
    } = req.body;

    const isSeller = req.user.modelHasRoles.some(m => m.role.name === 'seller');
    const data = {
      firstName,
      lastName,
      companyName,
      cuit,
      address,
      phone,
      wantsInvoice,
      zoneId: Number(zoneId),
      sellerId: isSeller ? req.user.id : Number(bodySellerId)
    };

    const client = await prisma.client.create({ data });
    res.status(201).json(client);
  } catch (err) {
    next(err);
  }
};

// Actualizar cliente
exports.update = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.client.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'No existe' });

    const isAdmin = req.user.modelHasRoles.some(m => m.role.name === 'admin');
    if (!isAdmin && existing.sellerId !== req.user.id) {
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
      wantsInvoice,
      zoneId: Number(zoneId),
      // solo admin puede cambiar de vendedor
      ...(isAdmin && { sellerId: Number(bodySellerId) })
    };

    const client = await prisma.client.update({
      where: { id },
      data
    });

    res.json(client);
  } catch (err) {
    next(err);
  }
};

// Borrar cliente
exports.remove = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.client.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'No existe' });

    const isAdmin = req.user.modelHasRoles.some(m => m.role.name === 'admin');
    if (!isAdmin && existing.sellerId !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    await prisma.client.delete({ where: { id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
