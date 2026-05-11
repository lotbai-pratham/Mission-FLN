import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';

// We need to re-evaluate the env.ts file in isolation or test the schema directly
// since env.ts calls parseEnv() on module load and throws if missing.

describe('Environment Variable Validation', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('throws an error if AUTH_SECRET is missing', async () => {
    // Mock process.env to be empty
    vi.stubEnv('AUTH_SECRET', '');
    
    // Attempting to import env should throw
    await expect(async () => {
      await import('@/lib/env');
    }).rejects.toThrow('Invalid environment variables');
  });

  it('parses successfully with valid variables', async () => {
    vi.stubEnv('DATABASE_URL', 'postgresql://test:test@localhost:5432/test');
    vi.stubEnv('AUTH_SECRET', 'supersecret');

    const { env } = await import('@/lib/env');
    expect(env.AUTH_SECRET).toBe('supersecret');
    expect(env.DATABASE_URL).toBe('postgresql://test:test@localhost:5432/test');
  });
});
