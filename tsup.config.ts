import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'orchestration/index': 'src/orchestration-facade.ts',
    'agents/index': 'src/agents/index.ts',
    'providers/index': 'src/providers/index.ts',
    'wiring/index': 'src/wiring/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  external: [
    '@anthropic-ai/sdk',
    '@google/generative-ai',
    'openai',
    'zod',
  ],
  esbuildOptions(options) {
    options.banner = {
      js: '"use strict";',
    };
  },
});
