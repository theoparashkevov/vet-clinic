import { execSync } from 'child_process';
import { resolve } from 'path';

export default function () {
  const apiDir = resolve(__dirname, '..');
  const dbPath = resolve(apiDir, 'prisma', 'test.db');
  execSync('npx prisma db push --force-reset --skip-generate', {
    cwd: apiDir,
    env: { ...process.env, DATABASE_URL: `file:${dbPath}` },
    stdio: 'pipe',
  });
}
