import * as path from 'path';
import { build, BuildOptions } from 'esbuild';

export const isDevelopment = process.argv.includes('--development');
export const resolve = (...names: string[]) => path.resolve(__dirname, '..', ...names);
export const baseOptions: BuildOptions = {
  bundle: true,
  logLevel: 'warning',
  minify: false,
  sourcemap: isDevelopment,
  legalComments: 'none',
};

export function buildSeveral(options: BuildOptions[]) {
  return Promise.all(options.map((option) => {
    return build(option);
  }));
}

export function typeCheck() {
  // ..
}
