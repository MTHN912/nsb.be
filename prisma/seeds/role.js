const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding roles...');

  const rolesData = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'data-json', 'roles.json'), 'utf-8')
  );

  for (const role of rolesData) {
    const existingRole = await prisma.role.findUnique({
      where: { name: role.name },
    });

    if (!existingRole) {
      await prisma.role.create({
        data: role,
      });
      console.log(`Created role: ${role.name} (${role.code})`);
    } else {
      console.log(`Role already exists: ${role.name} (${role.code})`);
    }
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
