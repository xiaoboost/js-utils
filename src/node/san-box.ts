import vm from "vm";
import path from "path";

import { createRequire } from "module";

interface RunScriptOptions {
  /** 当前脚本所在文件夹路径 */
  dirname: string;
  /**
   * 需要运行的代码所在的虚拟文件名称
   *  - 默认为`virtual-san-box.js`
   */
  filename?: string;
  /**
   * 外部 require 函数
   *  - 沙箱内置了 require 函数，和`dirname`选项关联
   *  - 如果此项不填，或者是在运行中失败，会回退到内置的 require 函数
   */
  require?: NodeRequire;
  /** 全局参数 */
  globalParams?: Record<string, any>;
}

/** 拟造模块接口 */
interface FakeModule {
  exports: {
    default: any;
  };
}

/** 运行结果 */
interface RunResult<T> {
  output: T;
  error?: RunError;
}

interface RunError {
  /** 发生错误的文件路径 */
  filePath: string;
  /**
   * 错误发生在第几行
   *  - 首行为`1`
   *  - 没有判断出错误则显示为`0`
   */
  lineNumber: number;
  /** 原始错误信息 */
  message: string;
  /** 原始错误堆栈信息 */
  stack: string;
}

/** 解析错误信息 */
function getErrorMessage(e: Error): RunError {
  const err: RunError = {
    message: e.message,
    stack: e.stack ?? '',
    filePath: '',
    lineNumber: -1,
  };

  const firstLine = err.stack.split('\n')[0];

  if (!firstLine) {
    return err;
  }

  const lineNumberMatch = firstLine.match(/:\d+$/);

  if (lineNumberMatch) {
    err.filePath = firstLine.substring(0, lineNumberMatch.index);
    err.lineNumber = Number.parseInt(lineNumberMatch[0].substring(1));
  }

  return err;
}

/** 运行代码 */
export function runScript<T = any>(code: string, options: RunScriptOptions): RunResult<T> {
  const {
    dirname,
    filename = "virtual-san-box.js",
    require: requireOut,
    globalParams = {},
  } = options;

  const filePath = path.join(dirname, filename);
  const requireIn = createRequire(filePath);
  const baseScriptOptions = {
    displayErrors: true,
    lineOffset: 0,
    columnOffset: 0,
    filename: filePath,
  };

  const fake: FakeModule = {
    exports: {},
  } as any;

  const requireCb = !requireOut
    ? requireIn
    : (id: string) => {
      let result: any;

      try {
        result = requireOut(id);
      }
      catch (e) {
        // ..
      }

      if (!result) {
        result = require(id);
      }

      return result;
    };

  /** 运行代码的全局上下文 */
  const context = {
    ...globalParams,
    module: fake,
    exports: fake.exports,
    require: requireCb,
    __dirname: dirname,
    __filename: filePath,
  };

  /** 运行错误 */
  let err: RunError | undefined = void 0;

  try {
    new vm.Script(code, baseScriptOptions)
      .runInNewContext(context, baseScriptOptions);
  }
  catch (e: any) {
    err = getErrorMessage(e);
  }

  return {
    output: fake.exports.default ?? fake.exports,
    error: err,
  };
}
