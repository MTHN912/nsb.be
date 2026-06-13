const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding dealers...');

  const dealersData = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'data-json', 'dealers.json'), 'utf-8')
  );

  for (const dealer of dealersData) {
    const existingDealer = await prisma.dealer.findUnique({
      where: { email: dealer.email },
    });

    if (!existingDealer) {
      await prisma.dealer.create({
        data: dealer,
      });
      console.log(`Created dealer: ${dealer.name} (${dealer.email})`);
    } else {
      console.log(`Dealer already exists: ${dealer.name} (${dealer.email})`);
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
