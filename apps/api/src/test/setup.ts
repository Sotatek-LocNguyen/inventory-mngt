import { execSync } from 'node:child_process';
import { homedir } from 'node:os';
import { join } from 'node:path';

const BUN = join(homedir(), '.bun', 'bin', 'bun');

export async function setup() {
  const TEST_DB_URL = 'postgresql://inventory:inventory@localhost:5432/inventory_test';

  // Run migrations against the test DB
  execSync(`${BUN}x prisma migrate deploy`, {
    env: { ...process.env, DATABASE_URL: TEST_DB_URL },
    cwd: process.cwd(),
    stdio: 'pipe',
  });
}
