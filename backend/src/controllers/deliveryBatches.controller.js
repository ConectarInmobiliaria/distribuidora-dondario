// backend/src/controllers/deliveryBatches.controller.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.list = async (req, res) => {
  const batches = await prisma.deliveryBatch.findMany({
    include: {
      deliverer: true,
      items: { include: { sale: { include: { client: true, items: { include: { product: true } } } } } }
    },
    orderBy: { date: 'desc' }
  });
  res.json(batches);
};

exports.get = async (req, res) => {
  const id = Number(req.params.id);
  const batch = await prisma.deliveryBatch.findUnique({
    where: { id },
    include: {
      deliverer: true,
      items: { include: { sale: { include: { client: true, items: { include: { product: true } } } } } }
    }
  });
  if (!batch) return res.status(404).json({ error: 'No existe' });
  res.json(batch);
};

exports.create = async (req, res) => {
  const { delivererId, date, description, saleIds } = req.body;
  const result = await prisma.$transaction(async tx => {
    const batch = await tx.deliveryBatch.create({
      data: { delivererId, date: new Date(date), description }
    });
    for (const saleId of saleIds) {
      await tx.deliveryBatchItem.create({
        data: { batchId: batch.id, saleId }
      });
    }
    return batch;
  });
  res.status(201).json(result);
};

exports.update = async (req, res) => {
  const id = Number(req.params.id);
  const { delivererId, date, description, saleIds } = req.body;
  const result = await prisma.$transaction(async tx => {
    await tx.deliveryBatch.update({
      where: { id },
      data: { delivererId, date: new Date(date), description }
    });
    // reemplazamos items
    await tx.deliveryBatchItem.deleteMany({ where: { batchId: id } });
    for (const saleId of saleIds) {
      await tx.deliveryBatchItem.create({
        data: { batchId: id, saleId }
      });
    }
    return tx.deliveryBatch.findUnique({ where: { id } });
  });
  res.json(result);
};

exports.remove = async (req, res) => {
  const id = Number(req.params.id);
  await prisma.$transaction([
    prisma.deliveryBatchItem.deleteMany({ where: { batchId: id } }),
    prisma.deliveryBatch.delete({ where: { id } })
  ]);
  res.status(204).end();
};
