/* eslint-disable @typescript-eslint/no-var-requires */

const { join } = require('path');

const resolve = (input) => join(__dirname, '..', input);

module.exports = {
    rootDir: resolve(''),
    moduleFileExtensions: [
        'ts', 'tsx', 'js', 'jsx', 'json',
    ],
    moduleNameMapper: {
        '^utils/(.*)$': '<rootDir>/src/$1',
    },
    transform: {
        '^.+\\.(j|t)sx?$': '<rootDir>/node_modules/ts-jest',
    },
    testURL: 'http://localhost/',
    testRegex: '(/test/.*spec)\\.ts$',
    coverageDirectory: '<rootDir>/test/coverage',
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
