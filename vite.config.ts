import { defineConfig } from 'vite-plus';

export default defineConfig({
  lint: {
    ignorePatterns: ['**/dist/**', '**/.blume/**', '**/.artifacts/**'],
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {
    ignorePatterns: ['prd/**', 'apps/web/src/astryx-themes.ts'],
    singleQuote: true,
    semi: true,
  },
});
