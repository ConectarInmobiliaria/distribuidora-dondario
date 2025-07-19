// backend/prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  // 1. Roles
  const roles = ['admin', 'seller'];
  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log('Roles creados/asegurados:', roles);

  // 2. Usuario admin de ejemplo
  const email = 'admin@dondario.com.ar';
  const exists = await prisma.user.findUnique({ where: { email } });
  if (!exists) {
    const passwordHash = await bcrypt.hash('Admin123!', 10);
    const user = await prisma.user.create({
      data: {
        name: 'Administrador',
        email,
        password: passwordHash,
        modelHasRoles: {
          create: { role: { connect: { name: 'admin' } } }
        }
      },
      include: { modelHasRoles: { include: { role: true } } }
    });
    console.log('Usuario admin creado:', user.email);
  } else {
    console.log('Usuario admin ya existe:', email);
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
