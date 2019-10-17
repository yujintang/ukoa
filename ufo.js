const assert = require('assert');
const path = require('path');
const KoaApplication = require('koa');
const Router = require('koa-router');
const compose = require('koa-compose');
const os = require('os');
const moment = require('moment');
const { get } = require('lodash');

const apiId = require('uuid').v4().split('-')[4].toUpperCase();

const helper = require('./server/utils/helper');
const CacheMap = require('./server/utils/cacheMap');

const pkg = require(path.join(process.cwd(), './package.json'));
require('dotenv').config();

class Ufo extends KoaApplication {
  constructor({
    name,
    baseDir, apiDir, configDir, routerPrefix,
    consul_url, consul_token, consul_type, consul_category,
    try_catch_url, try_catch_token,
  } = {}) {
    super();
    this.baseDir = baseDir || process.cwd(); // 系统根目录
    this.apiId = apiId;
    this.startTime = moment().format('YYYY-MM-DD HH:mm:ss');

    assert(typeof this.baseDir === 'string', 'ufo: baseDir must be a string!');

    this.apiDir = apiDir || './server/api'; // API存放目录
    this.configDir = configDir || './server/config/.env.json'; // 配置文件存放目录
    this.name = name || pkg.name,
    this.ip = get(os.networkInterfaces(), 'eth0[0].address', '127.0.0.1'),

    this.tryCatchUrl = process.env.TRY_CATCH_URL || try_catch_url,
    this.tryCatchToken = process.env.TRY_CATCH_TOKEN || try_catch_token,

    this.helper = helper;
    this.plugins = [];
    this.dynamicMv = [];
    this.router = new Router({ prefix: process.env.ROUTER_PREFIX || routerPrefix });
    this.logger = console;
    this.curl = async (url, data, config) => require('./curl')(url, data, config, { logger: this.logger });
    this.ufoCurl = async (url, data, config) => require('./ufoCurl')(url, data, config, { logger: this.logger });
    this.cacheMap = new CacheMap(this, 60 * 1000);

    // 服务发现注册
    this.consul = {
      url: consul_url,
      token: consul_token,
      key_path: `${consul_type}/${consul_category}/${process.env.CONSUL_VERSION}`,
    };
  }

  // loadApi
  loadApi(actionPath = path.join(this.baseDir, this.apiDir), splitChar = '_', preArr) {
    this.apiMap = this.helper.requireFileMulti(actionPath, splitChar, preArr);
    return this;
  }

  // 中间件
  loadDefaultMv(options = {}) {
    this.use(require('./server/mv/systemCatch')(options.systemCatch));
    this.use(require('koa2-cors')(options['koa2-cors'] || { origin: ctx => ctx.headers.origin, credentials: true }));
    this.use(require('koa-json')(options['koa-json']));
    this.use(require('koa-bodyparser')(options['koa-bodyparser'] || { formLimit: '50mb', jsonLimit: '50mb' }));
    this.use(require('./server/mv/appWithCtx')(options.appWithCtx)); // ctx.app.ctx 将每次ctx带入app中
    this.use(require('./server/mv/changeRoutePath')(options.changeRoutePath)); // 根据action改变路由
    this.use(require('./server/mv/mergeParams')(options.mergeParams)); // 合并参数
    this.use(require('./server/mv/internalCall')(options.internalCall)); // 内部调用
    this.use(require('./server/mv/checkResponse')(options.checkResponse)); // 检查参数

    this.dynamicMv.push(
      require('./server/mv/checkOwnData')(options.checkOwnData || { enable: false, key: 'ownData' }),
      require('./server/mv/checkAction')(options.checkAction),
    );
    return this;
  }

  // 配置文件
  async init({ mv } = {}) {
    this.plugin(require('./server/plugins/online_config')(this.env === 'production', this.consul));
    this.plugin(require('./server/plugins/registry_service')(this.env === 'production', this.consul));
    this.plugin(require('./server/plugins/logger')(this.env === 'production', { url: this.tryCatchUrl, token: this.tryCatchToken }));

    // loadPlugins
    while (this.plugins.length) await this.plugins.shift()(this);

    await this.loadApi();
    this.loadDefaultMv(mv);
    return this;
  }

  // 增加插件
  async plugin(fn) {
    if (typeof fn !== 'function') throw new TypeError('plugin must be a function!');
    this.plugins.push(fn);
    return this;
  }

  // 新增动态路由中间价
  useDynamic(fn) {
    if (typeof fn !== 'function') throw new TypeError('useDynamic must be a function!');
    this.dynamicMv.push(fn);
    return this;
  }

  // start app
  async start() {
    // load plugins
    while (this.plugins.length) await this.plugins.shift()(this);

    // 路由
    this.router
      .get('/HeartBeat', require('./server/routers/heartBeat'))
      .get('/Restart', require('./server/routers/restart'))
      .all('/docs/:Action', require('./server/routers/docs'))
      .all('/dynamic/:Action', compose([].concat(
        this.dynamicMv,
        require('./server/routers/dynamicAction'),
      )));

    this
      .use(this.router.routes())
      .use(this.router.allowedMethods());

    // start app
    this.listen(this.config.port || 3000, async () => {
      // 服务注册
      if (this.env === 'production') await this.registry(this.config);
      this.logger.info({
        api_env: `${this.env}`,
        api_url: `${this.ip}:${this.config.port}`,
        api_name: `${this.config.name}`,
      });
      this.logger.info('service start successful!');
    });
  }
}
process.on('uncaughtException', (e) => {
  console.error(e);
});

process.on('unhandledRejection', (e) => {
  console.error(e);
});

process.on('rejectionHandled', (e) => {
  console.error(e);
});

module.exports = Ufo;
