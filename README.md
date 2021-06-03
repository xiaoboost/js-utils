# JavaScript Utils

自己用的 JavaScript 工具函数集合

## 安装

```bash
npm install @xiao-ai/utils -S
```

## 使用

### 基本使用

```ts
import * as utils from '@xiao-ai/utils';

utils.isString('123');
```

### `use`、`web`

如果是`nodejs`平台，可以直接使用：

```js
const web = require('@xiao-ai/utils/web');
const use = require('@xiao-ai/utils/use');

web.addClassName('test-1');
use.useForceUpdate();
```

`typescript`的语言服务需要配置别名才能正常识别类型：

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@xiao-ai/utils/*": ["./node_modules/@xiao-ai/utils/types/*"]
    }
  }
}
```

同样，对于`webpack`等打包工具都需要配置对应的别名，以`webpack`为例：

```js
module.exports = {
  resolve: {
    alias: {
      '@xiao-ai/utils/web': './node_modules/@xiao-ai/utils/dist/esm/web/index.js',
      '@xiao-ai/utils/use': './node_modules/@xiao-ai/utils/dist/esm/use/index.js',
    },
  },
}
```

以上只是举个例子，真实路径需要根据自己的项目进行调整。
