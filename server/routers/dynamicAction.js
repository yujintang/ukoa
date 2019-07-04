// eslint-disable-next-line consistent-return
const dynamicAction = async (ctx) => {
  // proxy 功能则不需要路过动态路由
  const { Action } = ctx.params;
  const Api = ctx.app.apiMap.get(Action);
  if (!Api) return ctx.body = [`No ${Action} Action, please check your code!`, true];
  try {
    const api = new Api(ctx);
    // 验证参数
    const validErr = api.validate();
    if (validErr) return ctx.body = [validErr, true];
    // 执行函数体
    if (api.cache) {
      await api.cacheMain(api.ctx);
    } else {
      await api.main(api.ctx);
    }
    api.ctxBody();
  } catch (err) {
    ctx.app.logger.error(err);
    ctx.body = [err.message, true];
  }
};

module.exports = dynamicAction;
