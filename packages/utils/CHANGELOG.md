# @xiao-ai/utils

## 1.6.6

fix:

- 修复`src/node/san-box.ts`模块中的`RunError`类初始化错误

## 1.6.5

fix:

- `src/node/san-box.ts`模块中的`RunError`类型改为`Error`的扩展类

## 1.6.4

fix:

- `src/node/san-box.ts`模块导出若干类型

## 1.6.3

fix:

- 修复版本号错误

## 1.6.2

fix:

- 替换内置配置

## 1.6.1

fix:

- 修复 tslib 的依赖问题

## 1.6.0

feat:

- Subject 类更名为 Subscriber
- 订阅器参数的“名称”可以用数字类型

## 1.5.2

fix:

- 修正 stringifyClass 输入数据类型
- 修复 useFollow 会无限触发的 effect 的错误

## 1.5.1

fix:

- 变更 runScript 输出接口，错误数据添加行列号

## 1.5.0

feat:

- 新增 runScript 函数，其隶属于 node 部分
