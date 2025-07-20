// backend/src/controllers/products.controller.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { v4: uuidv4 } = require('uuid');

// Listar todos los productos
exports.list = async (req, res) => {
  const products = await prisma.product.findMany();
  res.json(products);
};

// Obtener uno
exports.get = async (req, res) => {
  const id = Number(req.params.id);
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return res.status(404).json({ error: 'No existe' });
  res.json(product);
};

// Crear producto
exports.create = async (req, res) => {
  const { name, unitPrice, bundleSize, bundleDiscountPct } = req.body;
  // Generar SKU: prefijo de 3 letras + UUID corto
  const prefix = name.replace(/\s+/g, '').slice(0, 3).toUpperCase();
  const shortId = uuidv4().split('-')[0].toUpperCase();  
  const sku = `${prefix}-${shortId}`;

  const product = await prisma.product.create({
    data: { name, sku, unitPrice, bundleSize, bundleDiscountPct }
  });
  res.status(201).json(product);
};

// Actualizar producto
exports.update = async (req, res) => {
  const id = Number(req.params.id);
  const { name, unitPrice, bundleSize, bundleDiscountPct } = req.body;
  const product = await prisma.product.update({
    where: { id },
    data: { name, unitPrice, bundleSize, bundleDiscountPct }
  });
  res.json(product);
};

// Borrar producto
exports.remove = async (req, res) => {
  const id = Number(req.params.id);
  await prisma.product.delete({ where: { id } });
  res.status(204).end();
};
