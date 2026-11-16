import type { E2EConfig } from 'e2e';
import { existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { chatgpt } from 'e2e/oauth/chatgpt';
import { web } from '@e2e-dev/web';

const localEnv = path.resolve(import.meta.dirname, '../../.env.local');
if (existsSync(localEnv)) process.loadEnvFile(localEnv);

export default {
  targets: [
    {
      engine: web(),
      app: {
        url: 'http://127.0.0.1:5173',
        command: {
          executable: 'pnpm',
          args: ['--filter', '@living/web', 'dev'],
          log: '.e2e/logs/web.log',
        },
      },
    },
  ],
  agents: {
    default: {
      model: chatgpt(process.env.E2E_MODEL ?? 'gpt-6-luna'),
      system:
        'Operate TaskFlow using its visible Japanese labels. Perform only the stated task and verify the visible result.',
    },
  },
  output: '.e2e',
} satisfies E2EConfig;
