import { resolve, baseOptions, buildSeveral } from './utils';

async function buildMain() {
  const entry = [resolve('src/index.ts')];

  await buildSeveral([
    {
      ...baseOptions,
      entryPoints: entry,
      outfile: resolve('./dist/esm/index.js'),
      format: 'esm',
      platform: 'browser',
    },
    {
      ...baseOptions,
      entryPoints: entry,
      outfile: resolve('./dist/cjs/index.js'),
      format: 'cjs',
      platform: 'node',
    },
  ]);
}

async function buildWeb() {
  // ..
}

async function main() {
  await buildMain();
  await buildWeb();
}

main();
