const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

// Listar todos los sellers
exports.list = async (req, res, next) => {
  try {
    const sellers = await prisma.seller.findMany({
      include: { zoneSellers: { include: { zone: true } } }
    });
    res.json(sellers);
  } catch (err) {
    next(err);
  }
};

// Obtener uno
exports.get = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const seller = await prisma.seller.findUnique({
      where: { id },
      include: { zoneSellers: { include: { zone: true } } }
    });
    res.json(seller);
  } catch (err) {
    next(err);
  }
};

// Crear seller + usuario
exports.create = async (req, res, next) => {
  try {
    const { firstName, lastName, dni, email, phone, commission, zoneIds, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    
    const result = await prisma.$transaction(async tx => {
      // 1) Crear seller (aseguramos comisión numérica)
      const seller = await tx.seller.create({
        data: {
          firstName,
          lastName,
          dni,
          email,
          phone,
          commission: parseFloat(commission)
        }
      });

      // 2) Asignar zonas (pivot)
      if (Array.isArray(zoneIds) && zoneIds.length) {
        for (const zid of zoneIds) {
          await tx.zoneSeller.create({ data: { sellerId: seller.id, zoneId: Number(zid) } });
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
  } catch (err) {
    next(err);
  }
};

// Actualizar seller
exports.update = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { firstName, lastName, dni, email, phone, commission, zoneIds } = req.body;

    await prisma.$transaction(async tx => {
      await tx.seller.update({
        where: { id },
        data: {
          firstName,
          lastName,
          dni,
          email,
          phone,
          commission: parseFloat(commission)
        }
      });

      // Reemplazar zonas
      await tx.zoneSeller.deleteMany({ where: { sellerId: id } });
      if (Array.isArray(zoneIds) && zoneIds.length) {
        for (const zid of zoneIds) {
          await tx.zoneSeller.create({ data: { sellerId: id, zoneId: Number(zid) } });
        }
      }
    });

    res.json({ message: 'Seller actualizado' });
  } catch (err) {
    next(err);
  }
};

// Borrar seller y su usuario
exports.remove = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const seller = await prisma.seller.findUnique({ where: { id } });
    await prisma.$transaction([
      prisma.user.deleteMany({ where: { email: seller.email } }),
      prisma.seller.delete({ where: { id } })
    ]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};