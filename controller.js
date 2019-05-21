const Joi = require('joi');

const SymbolError = Symbol('error');
/**
 * 用于动态路由继承
 */
class Controller {
  constructor(ctx = { app: {} }, schema) {
    this.ctx = ctx;
    this.Joi = Joi;
    this.helper = ctx.app.helper;
    this.params = ctx.mergeParams;
    schema ? (this.schema = schema) : this.checkParams();
    this.ok = {};
    this.error = SymbolError;
  }

  /**
   * 验证参数与重新赋值
   */
  validate(data = this.params, schema = this.schema, throwErr = true) {
    const { value, error } = Joi.validate(data, schema, {
      allowUnknown: true,
      stripUnknown: true,
    });
    if (error && throwErr) throw error;
    this.params = value;
  }

  /**
   * Joi 结构体
   */
  checkParams() {
    this.schema = {};
  }

  /**
   * 函数体
   */
  async process() {
    this.ok = {};
  }

  /**
   * 设置mock数据
   */
  setMocks() {
    this.mock = {};
  }

  /**
   * 设置DOC
   */
  setDocs() {
    this.docs = {};
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
