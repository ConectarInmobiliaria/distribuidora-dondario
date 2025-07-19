// backend/src/controllers/sellers.controller.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

// Listar todos los sellers
exports.list = async (req, res) => {
  const sellers = await prisma.seller.findMany({
    include: { zoneSellers: { include: { zone: true } } }
  });
  res.json(sellers);
};

// Obtener uno
exports.get = async (req, res) => {
  const id = Number(req.params.id);
  const seller = await prisma.seller.findUnique({
    where: { id },
    include: { zoneSellers: { include: { zone: true } } }
  });
  res.json(seller);
};

// Crear seller + usuario
exports.create = async (req, res) => {
  const { firstName, lastName, dni, email, phone, commission, zoneIds, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);

  const result = await prisma.$transaction(async tx => {
    // 1) Crear seller
    const seller = await tx.seller.create({
      data: { firstName, lastName, dni, email, phone, commission }
    });

    // 2) Asignar zonas (pivot)
    if (zoneIds && zoneIds.length) {
      for (const zid of zoneIds) {
        await tx.zoneSeller.create({ data: { sellerId: seller.id, zoneId: zid } });
      }
    }

    // 3) Crear usuario con rol 'seller'
    const user = await tx.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email,
        password: hashed,
        modelHasRoles: { create: { role: { connect: { name: 'seller' } } } }
      }
    });

    return { seller, userId: user.id };
  });

  res.status(201).json({ message: 'Seller creado', id: result.seller.id });
};

// Actualizar seller
exports.update = async (req, res) => {
  const id = Number(req.params.id);
  const { firstName, lastName, dni, email, phone, commission, zoneIds } = req.body;

  await prisma.$transaction(async tx => {
    await tx.seller.update({
      where: { id },
      data: { firstName, lastName, dni, email, phone, commission }
    });
    // Reemplazar zonas
    await tx.zoneSeller.deleteMany({ where: { sellerId: id } });
    if (zoneIds && zoneIds.length) {
      for (const zid of zoneIds) {
        await tx.zoneSeller.create({ data: { sellerId: id, zoneId: zid } });
      }
    }
  });

  res.json({ message: 'Seller actualizado' });
};

// Borrar seller y su usuario
exports.remove = async (req, res) => {
  const id = Number(req.params.id);
  // Encontrar email para borrar user
  const seller = await prisma.seller.findUnique({ where: { id } });
  await prisma.$transaction([
    prisma.user.deleteMany({ where: { email: seller.email } }),
    prisma.seller.delete({ where: { id } })
  ]);
  res.status(204).end();
};
