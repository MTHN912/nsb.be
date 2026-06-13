const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding global packages...');

  const globalPackagesData = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'data-json', 'global-packages.json'), 'utf-8')
  );

  for (const globalPackage of globalPackagesData) {
    const existingGlobalPackage = await prisma.globalPackage.findUnique({
      where: { code: globalPackage.code },
    });

    if (!existingGlobalPackage) {
      await prisma.globalPackage.create({
        data: globalPackage,
      });
      console.log(`Created global package: ${globalPackage.name} (${globalPackage.code})`);
    } else {
      console.log(`Global package already exists: ${globalPackage.name} (${globalPackage.code})`);
    }
  }

  console.log('Global packages seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
