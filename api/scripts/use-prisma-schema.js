const fs = require('fs');
const path = require('path');

const target = process.argv[2];

if (!target || !['sqlite', 'postgres', 'postgresql'].includes(target)) {
  console.error('Usage: node scripts/use-prisma-schema.js <sqlite|postgres>');
  process.exit(1);
}

const normalizedTarget = target === 'postgresql' ? 'postgres' : target;
const prismaDir = path.join(__dirname, '..', 'prisma');
const source = path.join(prismaDir, `schema.${normalizedTarget}.prisma`);
const destination = path.join(prismaDir, 'schema.prisma');

fs.copyFileSync(source, destination);
console.log(`Activated Prisma schema: ${normalizedTarget}`);
