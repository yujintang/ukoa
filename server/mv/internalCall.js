/**
 * 内部调用
 */
const internalCall = () => async (ctx, next) => {
  /**
   * return calss
   */
  ctx.internalApi = (Action, params) => {
    const Api = ctx.app.apiMap.get(Action);
    if (!Api) throw new Error(`InternalCall Action Error, No ${Action} Action`);
    return new Api(ctx, {}, params);
  };
  /**
   * return result
   */
  ctx.internalCall = async (Action, params) => {
    const api = ctx.internalApi(Action, params);
    await api.main(api.ctx);
    return api.ctxBody();
  };
  await next();
};

module.exports = internalCall;
