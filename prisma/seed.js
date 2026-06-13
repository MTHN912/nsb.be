const { execSync } = require('child_process');
const path = require('path');

const seedsDir = path.join(__dirname, 'seeds');

const seedFiles = [
  'role.js',
  'dealer.js',
  'global-package.js',
  'global-service.js',
  'package.js',
  'service.js',
];

async function main() {
  console.log('Running all seeds...');

  for (const seedFile of seedFiles) {
    const seedPath = path.join(seedsDir, seedFile);
    console.log(`\nRunning ${seedFile}...`);
    try {
      execSync(`node "${seedPath}"`, { stdio: 'inherit' });
    } catch (error) {
      console.error(`Error running ${seedFile}:`, error.message);
      process.exit(1);
    }
  }

  console.log('\n✅ All seeds completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
