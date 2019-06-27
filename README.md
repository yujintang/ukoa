# UKOA (Node.js 服务器框架)

## Install

```shell
npm install ukoa
```

## Use

```js
const { Ufo } = require('ukoa');

const runServer = async () => {
  const ufo = new Ufo({
    baseDir: __dirname,
    consul_url: '',
    consul_token: '',
    consul_type: '',
    consul_category: '',
  });
  await ufo.init();
  await ufo.start();
};

runServer();
```
## Documents
### UKOA 提供一下常用模块
> 避免重复依赖，常用模块请使用ukoa提供的.
```js
const {Ufo, Controller, Joi, lodash, moment} = require('ukoa');
```

### UKOA 内置中间价
> ufo 内置集成以下中间价
```js
systemCatch, koa2-cors, koa-json, koa-bodyparser, mergeParams, checkResponse
```

### gateway 项目
> 若是gateway项目,请开启以下配置
```js
ufo.proxy = true
```

### 中间件
> 全局中间件
```
ufo.use(fn);
```
> 本项目动态路由action中间件
```js
ufo.dynamicMv(fn);
```
```

### 路由router
> ukoa 提供一下路由文件,可使用 ufo.router 方法添加其他路由文件。
ctx.path === '/'的请求, 会根据请求字段'Action'去智能匹配到以下路由['/proxy/:app/:Action', '/dynamic/:Action'].
```js
ufo.router
  .get('/HeartBeat', mv)
  .get('/Restart', mv)
  .all('/proxy/:app/:Action', mv)
  .all('/dynamic/:Action', mv)
```

### ufo.init
> 初始化配置文件、挂载action、挂载中间件等操作，可传入参数配置
```js
ufo.init({
  mv: {
    'systemCatch': {},
    'koa2-cors': {},
    'koa-json': {},
    'koa-bodyparser':{},
    'changeRoutePath':{},
    'mergeParams':{},
    'checkResponse':{},
    'checkAction':{},
  }
})
默认配置如下:
ufo.init({
  mv: {
    'koa2-cors': { origin: ctx => ctx.headers.origin, credentials: true },
    'koa-bodyparser': { formLimit: '50mb', jsonLimit: '50mb' }
  }
})
```
### Controller
> Controller 继承ukoa的Controller
```js
const { Controller, Joi } = require('ukoa');


class Example extends Controller {
  init(ctx) {
    this.schema = {}; // 参数校验,Joi模型
    this.cache = true; // 需在config里面配置 cache_api:{url, token} 并且在 controller init() 函数里面，将cache = true, 若要配置cache 参数， cache = {TTL: 3600, Count: 100};
    this.docs = {}; // 文档
  }

  // 执行函数体
  async main(ctx) {
    return this.ok = {};
  }
}

module.exports = Example;

```

### DEBUG
> env 添加DEBNUG,可以打印对应log，方便排查问题，现在支持以下DEBUG
```shell
# 打印所有log
DEBUG: ufo:*
# 打印其他
DEBUG: ufo:curl:*   //打印某个Action的请求
DEBUG: ufo:checkResponse
DEBUG: ufo:mergeParams
DEBUG: ufo:consul
```

### scripts
> 内置执行脚本
```
yarn lint         // eslint --fix ./
yarn cmd 
```