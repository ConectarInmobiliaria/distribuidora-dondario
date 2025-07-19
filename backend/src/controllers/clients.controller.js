// backend/src/controllers/clients.controller.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Lista clientes: admin ve todos, seller sólo los suyos
exports.list = async (req, res) => {
  const isAdmin = req.user.modelHasRoles.some(m => m.role.name === 'admin');
  const where = isAdmin
    ? {}
    : { sellerId: req.user.id };
  const clients = await prisma.client.findMany({
    where,
    include: { zone: true, seller: true }
  });
  res.json(clients);
};

// Obtener un cliente (verifica permiso)
exports.get = async (req, res) => {
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
};

// Crear cliente (sellerId se toma del token para seller)
exports.create = async (req, res) => {
  const { firstName, lastName, companyName, cuit, address, phone, wantsInvoice, zoneId, sellerId } = req.body;
  // si es seller, ignora sellerId del body y usa el suyo
  const isSeller = req.user.modelHasRoles.some(m => m.role.name === 'seller');
  const data = {
    firstName, lastName, companyName, cuit, address, phone,
    wantsInvoice, zoneId,
    sellerId: isSeller ? req.user.id : sellerId
  };
  try {
    const client = await prisma.client.create({ data });
    res.status(201).json(client);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Actualizar cliente
exports.update = async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.client.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'No existe' });
  const isAdmin = req.user.modelHasRoles.some(m => m.role.name === 'admin');
  if (!isAdmin && existing.sellerId !== req.user.id) {
    return res.status(403).json({ error: 'No autorizado' });
  }
  const { firstName, lastName, companyName, cuit, address, phone, wantsInvoice, zoneId } = req.body;
  const client = await prisma.client.update({
    where: { id },
    data: { firstName, lastName, companyName, cuit, address, phone, wantsInvoice, zoneId }
  });
  res.json(client);
};

// Borrar cliente
exports.remove = async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.client.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'No existe' });
  const isAdmin = req.user.modelHasRoles.some(m => m.role.name === 'admin');
  if (!isAdmin && existing.sellerId !== req.user.id) {
    return res.status(403).json({ error: 'No autorizado' });
  }
  await prisma.client.delete({ where: { id } });
  res.status(204).end();
};
