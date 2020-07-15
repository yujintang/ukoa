const { get } = require('lodash');
const curl = require('./curl');

const SymbolError = Symbol('error');
const Joi = require('./joi');
/**
 * 用于动态路由继承
 */
class Controller {
  constructor(ctx = { app: {} }, schema = {}, params = {}) {
    this.ctx = ctx;
    this.schema = schema;
    this.Joi = Joi;
    if (this.checkParams) this.init = this.checkParams; // alias
    if (this.process) this.main = this.process; // alias
    this.helper = ctx.app.helper;
    this.params = params;
    this.ok = {};
    this.error = SymbolError;
  }

  /**
   * 验证参数与重新赋值
   */
  validate(data = this.params, schema = this.schema) {
    const { value, error } = Joi.validate(data, schema, {
      allowUnknown: true,
      stripUnknown: true,
    });
    if (error) return error.message;
    // sql escape
    for(const key of Object.keys(value)){
      if(typeof value[key] === 'string'){
        value[key] = escapeString(value[key])
      }
    }
    this.params = value;
    return false;
  }

  /**
   * 初始化数据
   */
  init() {
    this.cache = false;
    this.docs = {};
  }

  /**
   * 函数体
   */
  async main() {
    this.ok = {};
  }

  /**
   * 缓存函数体
   */
  async cacheMain() {
    const { url, token } = get(this.ctx.app.config, 'cache_api', {});
    if (!url || !token) throw new Error('使用Cache必须配置{cache_api: {url, token}}');
    const nameSpace = this.ctx.app.config.name || this.ctx.app.name;
    const params = Object.assign({
      Action: this.ctx.params.Action,
    }, this.params);
    const [data, err] = await curl(url, {
      Action: 'Common.GetApiCache',
      Token: token,
      Namespace: nameSpace,
      Params: params,
    });
    if (err || data.RetCode !== 0) {
      await this.main(this.ctx);
      if (this.error !== SymbolError) return;
      curl(url, Object.assign({
        Action: 'Common.SetApiCache',
        Token: token,
        Namespace: nameSpace,
        Params: params,
        Values: this.ok,
      }, this.cache));
    } else {
      this.ok = data.Data;
    }
  }

  /**
   * 返回体
   * response {array} [ ok, error, retOpt ] 第一个参数为是具体内容, 第二个参数为是否错误, 第三个为集合参数
   */
  ctxBody() {
    if (this.error !== SymbolError) {
      return [this.error, true, {
        total: this.total || this.count,
        prefix: false,
        retcode: -2,
      }];
    }
    return [this.ok, false, {
      total: this.total || this.count,
      prefix: true,
      retcode: 0,
    }];
  }
}

module.exports = Controller;
