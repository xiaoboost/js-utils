/* eslint-disable @typescript-eslint/no-var-requires */

const { join } = require('path');

const resolve = (...paths) => join(__dirname, '..', ...paths);

module.exports = {
    rootDir: resolve(''),
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/src/$1',
    },
    transform: {
        '^.+\\.(j|t)sx?$': '<rootDir>/node_modules/ts-jest',
    },
    testURL: 'http://localhost/',
    testRegex: '(/test/.*spec)\\.ts$',
    coverageDirectory: '<rootDir>/test/coverage',
    setupFilesAfterEnv: ['<rootDir>/test/setups/env.ts'],
    collectCoverageFrom: [
        // 测试文件
        'src/**/*.ts',

        // 忽略文件
        '!**/*.d.ts',
        '!src/**/index.ts',
    ],
    globals: {
        'ts-jest': {
            tsConfig: resolve('tsconfig.test.json'),
        },
    },
};
