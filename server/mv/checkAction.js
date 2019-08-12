module.exports = options => async (ctx, next) => {
  const { enable } = Object.assign({ enable: true }, options);
  const { Action } = ctx.params;
  const Api = ctx.app.apiMap.get(Action);
  if (enable && !Api) return ctx.body = { RetCode: -1, Message: `System not support ${Action} Action, please check your code!` };
  await next();
  return true;
};
