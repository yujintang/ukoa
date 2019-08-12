/**
 * 检查ownData
 */
const checkOwnData = options => async (ctx, next) => {
  const { enable } = Object.assign({ enable: false }, options);
  if (enable && !ctx.app.proxy && !ctx.mergeParams.ownData) return ctx.body = { RetCode: -1, Message: '必须由api-gateway跳转' };
  await next();
  return true;
};

module.exports = checkOwnData;
