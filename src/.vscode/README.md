# typescript 在 vsc 中调试的配置

## `tasks.json`
这里是任务的说明文件，这里描述了 ts 的编译任务。  
此任务的完整指令为：
```shell
node ./node_modules/typescript/lib/tsc.js -p . -m CommonJS --sourceMap true --outDir ./out/
```

这里是运行本地的`./node_modules/typescript/lib/tsc.js`文件来替代全局的`tsc`指令，效果是一样的。
具体的编译配置，请参考[说明文档](https://www.typescriptlang.org/docs/handbook/compiler-options.html)。

这里会使用项目根目录的`tsconfig.json`文件，然后强制指定模块类型是`CommonJS`，打开`sourceMap`功能，再设置书出目录为`./out/`。

## `launch.json`
这里是调试器的说明文件。主要注意这几个点就好：

1. `preLaunchTask`字段指定为上面任务说明文件的预编译任务。在这里预编译任务的`label`选项为`compile`，所以在这里文件里也就填`compile`。  
2. `program`字段为入口文件，预编译之后将会把所有项目的`ts`文件（如果你设置了`allowJs`为`true`的话，还会有`js`文件）编译然后按照原本的路径照搬到你设置的输出文件夹内（这里是`./out/`），比如说原本你的文件路径是`./src/init/index.ts`，这里的入口文件就要写作`./out/src/init/index.js`。
3. `env`字段表示调试的时候注入的环境变。

## 特别说明
在项目根目录的`tsconfig.json`文件中请务必排除掉你预编译设置的输出路径，不然每次编译都会报错说会覆盖文件无法继续操作。
