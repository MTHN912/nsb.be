const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding packages...');

  const packagesData = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'data-json', 'packages.json'), 'utf-8')
  );

  for (const pkg of packagesData) {
    const existingPackage = await prisma.package.findUnique({
      where: { code: pkg.code },
    });

    if (!existingPackage) {
      await prisma.package.create({
        data: pkg,
      });
      console.log(`Created package: ${pkg.name} (${pkg.code})`);
    } else {
      console.log(`Package already exists: ${pkg.name} (${pkg.code})`);
    }
  }

  console.log('Packages seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
