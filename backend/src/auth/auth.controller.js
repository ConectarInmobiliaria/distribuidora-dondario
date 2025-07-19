// backend/src/auth/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.register = async (req, res) => {
  const { name, email, password, role = 'seller' } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        modelHasRoles: {
          create: { role: { connect: { name: role } } }
        }
      },
      include: { modelHasRoles: { include: { role: true } } }
    });
    res.status(201).json({ message: 'Usuario creado', user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { modelHasRoles: { include: { role: true } } }
    });
    if (!user) return res.status(404).json({ error: 'Email no registrado' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Contraseña incorrecta' });

    const payload = { sub: user.id, roles: user.modelHasRoles.map(m => m.role.name) };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
