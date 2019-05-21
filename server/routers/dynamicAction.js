const dynamicAction = async (ctx) => {
  // proxy 功能则不需要路过动态路由
  const { Action } = ctx.params;
  const Api = ctx.app.apiMap.get(Action);
  if (!Api) throw new Error(`ufo: No ${Action} Action, please check your code！`);
  try {
    const api = new Api(ctx);
    // 验证参数
    api.validate();
    // 执行函数体
    if (api.cache) {
      await api.cacheProcess(api.ctx);
    } else {
      await api.process(api.ctx);
    }
    api.ctxBody();
  } catch (err) {
    ctx.app.logger.error(err);
    ctx.body = [err.message, true];
  }
};

module.exports = dynamicAction;
