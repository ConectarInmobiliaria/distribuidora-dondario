// backend/src/controllers/products.controller.js
const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const prisma = new PrismaClient();

// Listar todos los productos
exports.list = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (err) {
    next(err);
  }
};

// Obtener uno
exports.get = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ error: 'No existe' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

// Crear producto
exports.create = async (req, res, next) => {
  try {
    const { name, unitPrice = 0, bundleSize = 1, bundleDiscountPct = 0 } = req.body;

    const prefix = (name || 'PRD').replace(/\s+/g, '').slice(0, 3).toUpperCase() || 'PRD';
    const shortId = uuidv4().split('-')[0].toUpperCase();
    const sku = `${prefix}-${shortId}`;

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        unitPrice: Number(unitPrice),
        bundleSize: Number(bundleSize),
        bundleDiscountPct: Number(bundleDiscountPct)
      }
    });

    res.status(201).json(product);
  } catch (err) {
    // si falla por unique sku u otra razón, pasa al handler de errores
    next(err);
  }
};

// Actualizar producto
exports.update = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { name, unitPrice, bundleSize, bundleDiscountPct } = req.body;
    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        unitPrice: unitPrice !== undefined ? Number(unitPrice) : undefined,
        bundleSize: bundleSize !== undefined ? Number(bundleSize) : undefined,
        bundleDiscountPct: bundleDiscountPct !== undefined ? Number(bundleDiscountPct) : undefined
      }
    });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

// Borrar producto
exports.remove = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.product.delete({ where: { id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
