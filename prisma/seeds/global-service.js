const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding global services...');

  const globalServicesData = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'data-json', 'global-services.json'), 'utf-8')
  );

  for (const globalService of globalServicesData) {
    const existingGlobalService = await prisma.globalService.findUnique({
      where: { code: globalService.code },
    });

    if (!existingGlobalService) {
      await prisma.globalService.create({
        data: globalService,
      });
      console.log(`Created global service: ${globalService.name} (${globalService.code})`);
    } else {
      console.log(`Global service already exists: ${globalService.name} (${globalService.code})`);
    }
  }

  console.log('Global services seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
