const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding services...');

  const servicesData = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'data-json', 'services.json'), 'utf-8')
  );

  for (const service of servicesData) {
    const existingService = await prisma.service.findUnique({
      where: { code: service.code },
    });

    if (!existingService) {
      await prisma.service.create({
        data: service,
      });
      console.log(`Created service: ${service.name} (${service.code})`);
    } else {
      console.log(`Service already exists: ${service.name} (${service.code})`);
    }
  }

  console.log('Services seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
