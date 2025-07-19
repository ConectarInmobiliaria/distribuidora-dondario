const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.list = async (req, res) => {
  const zones = await prisma.zone.findMany({ include: { clients: true } });
  res.json(zones);
};

exports.get = async (req, res) => {
  const id = Number(req.params.id);
  const zone = await prisma.zone.findUnique({ where: { id } });
  res.json(zone);
};

exports.create = async (req, res) => {
  const { name, daysToVisit } = req.body;
  const zone = await prisma.zone.create({ data: { name, daysToVisit } });
  res.status(201).json(zone);
};

exports.update = async (req, res) => {
  const id = Number(req.params.id);
  const { name, daysToVisit } = req.body;
  const zone = await prisma.zone.update({
    where: { id },
    data: { name, daysToVisit },
  });
  res.json(zone);
};

exports.remove = async (req, res) => {
  const id = Number(req.params.id);
  await prisma.zone.delete({ where: { id } });
  res.status(204).end();
};
