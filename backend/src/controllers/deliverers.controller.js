const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.list = async (req, res) => {
  const d = await prisma.deliverer.findMany();
  res.json(d);
};
exports.get = async (req, res) => {
  const id = Number(req.params.id);
  const d = await prisma.deliverer.findUnique({ where: { id } });
  res.json(d);
};
exports.create = async (req, res) => {
  const { firstName, lastName, phone, vehicle } = req.body;
  const d = await prisma.deliverer.create({ data: { firstName, lastName, phone, vehicle } });
  res.status(201).json(d);
};
exports.update = async (req, res) => {
  const id = Number(req.params.id);
  const { firstName, lastName, phone, vehicle } = req.body;
  const d = await prisma.deliverer.update({ where: { id }, data: { firstName, lastName, phone, vehicle } });
  res.json(d);
};
exports.remove = async (req, res) => {
  const id = Number(req.params.id);
  await prisma.deliverer.delete({ where: { id } });
  res.status(204).end();
};
