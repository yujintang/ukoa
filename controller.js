const Joi = require('joi');
const { get } = require('lodash');
const curl = require('./curl');

const SymbolError = Symbol('error');
/**
 * 用于动态路由继承
 */
class Controller {
  constructor(ctx = { app: {} }, schema = {}) {
    this.ctx = ctx;
    this.baseSchema = schema;
    this.Joi = Joi;
    if (this.checkParams) this.init = this.checkParams;
    if (this.process) this.main = this.process;
    this.init(this.ctx, this.joi);
    this.helper = ctx.app.helper;
    this.params = ctx.mergeParams;
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
    this.params = value;
    return false;
  }

  /**
   * 初始化数据
   */
  init() {
    this.schema = this.baseSchema;
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
    const nameSpace = get(this.ctx.app.consul, 'consul_category', '');
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
      this.ok = data;
    }
  }

  /**
   * 返回体
   * response {array} [data, err ] 第一个参数为是具体内容, 第二个参数为是否错误
   */
  ctxBody() {
    if (this.error !== SymbolError) {
      this.ctx.body = [this.error, true];
    } else {
      this.ctx.body = [this.ok, false];
    }
  }
}

module.exports = Controller;
