/**
 * 检查dynamic Action
 */
const checkAction = () => async (ctx, next) => {
  const { Action } = ctx.params;
  if (!ctx.app.apiMap.has(Action)) throw new Error(`ufo: No ${Action} Action, please check your code！`);
  await next();
};

module.exports = checkAction;
