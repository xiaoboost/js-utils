import test from 'ava';
import path from 'path';
import { runScript, RunError } from 'src/node';

test('no error no result', ({ deepEqual }) => {
  const result = runScript(`const a = 1 + 1;`, {
    dirname: __dirname,
  });

  deepEqual(result, {
    output: {},
    error: undefined,
  });
});

test('use exports', ({ deepEqual }) => {
  const result1 = runScript(`exports.a = 1;`, {
    dirname: __dirname,
  });

  const result2 = runScript(`module.exports = { a: 1 };`, {
    dirname: __dirname,
  });

  deepEqual(result1, {
    output: {
      a: 1,
    },
    error: undefined,
  });

  deepEqual(result2, {
    output: {
      a: 1,
    },
    error: undefined,
  });
});

test('use require', ({ deepEqual }) => {
  const code = `
    const data = require('./lib/sample');
    exports.count = data.count + 1;
  `;
  const result = runScript(code, {
    dirname: __dirname,
  });

  deepEqual(result, {
    output: {
      count: 2,
    },
    error: undefined,
  });
});

test('inject var', ({ deepEqual }) => {
  const code = `
    module.exports = {
      dirname: __dirname,
      filename: __filename,
      getOutVar: outVar,
    }
  `;
  const filename = 'test.js';
  const constant = '123';
  const result = runScript(code, {
    dirname: __dirname,
    filename,
    globalParams: {
      outVar: constant,
    },
  });

  deepEqual(result, {
    error: undefined,
    output: {
      dirname: __dirname,
      filename: path.join(__dirname, filename),
      getOutVar: constant,
    },
  });
});

test('code error', ({ deepEqual }) => {
  const filename = 'test.js';
  const result = runScript('\nconst ab', {
    dirname: __dirname,
    filename,
  });
  const runError = new RunError('Missing initializer in const declaration');

  // 删除 stack 信息
  result.error!.stack = undefined;

  runError.name = 'SyntaxError';
  runError.location = {
    filePath: path.join(__dirname, filename),
    line: 2,
    column: 7,
    length: 2,
    lineText: 'const ab',
  };

  deepEqual(result, {
    output: {},
    error: runError,
  });
});

test('code error in require file', ({ deepEqual }) => {
  const filename = 'test.js';
  const result = runScript(`require('./lib/error')`, {
    dirname: __dirname,
    filename,
  });
  const runError = new RunError("Unexpected token '+'");

  // 删除 stack 信息
  result.error!.stack = undefined;

  runError.name = 'SyntaxError';
  runError.location = {
    filePath: path.join(__dirname, './lib/error.js'),
    line: 1,
    column: 14,
    length: 1,
    lineText: 'let location + 1',
  };

  deepEqual(result, {
    output: {},
    error: runError,
  });
});
