import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { env, loadEnvFile } from 'node:process';

const envFile = resolve(__dirname, '../.env');
if (existsSync(envFile)) {
  loadEnvFile(envFile);
}

function readInteger(name: string, min: number, max = Number.MAX_SAFE_INTEGER) {
  const raw = env[name];
  if (raw === undefined || raw === '') return undefined;

  const value = Number(raw);
  if (!/^\d+$/.test(raw) || !Number.isSafeInteger(value) || value < min || value > max) {
    throw new Error(`${name} must be an integer between ${min} and ${max}`);
  }
  return value;
}

export const isCI = Boolean(env.CI);
export const port = readInteger('PW_PORT', 1, 65535) ?? 4173;
export const localURL = `http://127.0.0.1:${port}`;
export const externalURL = env.PW_BASE_URL?.trim() || undefined;
export const workers = readInteger('PW_WORKERS', 1) ?? (isCI ? 2 : undefined);
export const retries = readInteger('PW_RETRIES', 0) ?? (isCI ? 2 : 0);
export const slowMo = readInteger('PW_SLOW_MO', 0);
export const userAgent = env.PW_USER_AGENT?.trim() || undefined;