# UKOA (Node.js 服务器框架, 里面内容涉及特殊业务逻辑, 请谨慎使用)

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
    try_catch_url: '',
    try_catch_token: ''
  });
  await ufo.init();
  // ufo.useDynamic(require('./server/mv/xxx')()); 引入某个中间件
  await ufo.start();
};

runServer();
```
## Documents
- [consul存储配置文件](#consul存储配置文件)
- [内置常用模块](#内置常用模块)
- [内置中间价](#内置中间价)
- [中间件](#中间件)
- [gateway项目](#gateway项目)
- [路由router](#路由router)
- [配置初始化](#配置初始化)
- [Controller](#Controller)
- [ufoCurl调用http](#ufoCurl调用http)
- [cacheMap内存缓存有效期数据](#cacheMap内存缓存有效期数据)
- [文档](#文档)
- [DEBUG](#DEBUG)


### consul存储配置文件
> consul配置文件以json格式存储,一般格式包括：

```json
{
    "token": "xxx",
    "type": "Web",
    "name": "Web.sss",
    "svc_url": "xxxx.xx.com",
    "svc_port": 80,
    "port": 3000,
    "version": "v1",
    "http" : {

    },
    "mysql":{

    }
}
```

### 内置常用模块
> 避免重复依赖，常用模块请使用ukoa提供的.
```js
const {Ufo, Controller, Joi, lodash, moment, humps, axios, curl, ufoCurl } = require('ukoa');
```

### 内置中间价
> ufo 内置集成以下中间价
```js
systemCatch           // 捕获系统错误
koa2-cors             
koa-json
koa-bodyparser
appWithCtx            // app下挂载ctx app.ctx
changeRoutePath       // 根据Action以及参数改变路由, 暂时支持 doc, dynamicAction 等
mergeParams           // 合并参数 req.mergeParams = _.merge({}, req.query, req.body);
internalCall          // 内部各个Action相互调用 ctx.internalCall(Action, params)
checkResponse         // 返回值检查
checkOwnData          // 检查是否携带应该携带的参数
checkAction           // 检查系统是否允许该Action
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

### gateway项目
> 若是gateway项目,请开启以下配置
```js
ufo.proxy = true
```

### 路由router
> ukoa 提供一下路由文件,可使用 ufo.router 方法添加其他路由文件。
ctx.path === '/'的请求, 会根据请求字段'Action'去智能匹配到以下路由['/proxy/:app/:Action', '/dynamic/:Action'].
```js
ufo.router
  .get('/HeartBeat', mv)
  .get('/Restart', mv)
  .all('/docs/:Action', mv)
  .all('/dynamic/:Action', mv)
```

### 配置初始化
> 初始化配置文件、各种中间件配置操作，可传入参数配置, 默认配置如下：
```js
ufo.init({
  mv: {
    'systemCatch': {enable: true},
    'koa2-cors': { origin: ctx => ctx.headers.origin, credentials: true },
    'koa-json': {},
    'koa-bodyparser': { formLimit: '50mb', jsonLimit: '50mb' },
    'appWithCtx':{enable: true},
    'changeRoutePath':{enable: true},
    'mergeParams':{enable: true},
    'internalCall':{enable: true},
    'checkResponse':{enable: true},
    'checkOwnData': { enable: false, key: 'ownData' },
    'checkAction':{enable: true},
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
    this.total = 0;                   // 数据总量，用于分页显示总量信息
    return this.ok = {};              // 数据内容
    return this.error = 'xxx error';         // 数据错误描述
  }
}

module.exports = Example;

```

### ufoCurl调用http
> ufoCurl 提供http调用，将http结果剥离，形成 [Data, isError, Total] 模式
```
ctx.app.ufoCurl(url, entity, config, options);
config = {
  throw: false    // 是否有错误立马抛出
  key: "Data"     // 结果key字符串为‘Data’,
  total: "Total"  // 数量的字符串为‘Total’,
  pick: []        // 结果为自己pick的内容
}
```

### cacheMap内存缓存有效期数据
> 对于一些需要缓存在内存中、按时刷新的内容，可以使用cacheMap, 默认 60 * 1000 ms
```js
module.exports = options => async (ctx, next) => {
  if (!ctx.cacheMap) ctx.cacheMap = ctx.app.cacheMap;
  const { cacheMap } = ctx.app;

  if (!cacheMap.has('cacheBody')) {
    cacheMap.set('cacheBody', async ()=>{ return 'hello world' }, 1000 * 20);
  }
  await next();
};

// 使用
await ctx.cacheMap.get('cacheBody') // hello world
```
### 文档
* 在配置文件config中，应该指定doc_url, 文档目录为: http://docs.example.com/?__view_docs=true&Action=*
* 在参数中指定 `__view_docs=true`, 即可获取API操作文档。
* 请求参数添加 `"__save_docs":true`, 即可保存API调用为文档。
```json
{
  "doc_url": "http://docs.example.com/?__view_docs=true&Action="
}
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
DEBUG: ufo:cacheMap
```

### scripts
> 内置执行脚本
```
yarn lint         // eslint --fix ./
yarn cmd 
```