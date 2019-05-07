/**
 * 检查ownData
 */
const checkOwnData = options => async (ctx, next) => {
  const { enable } = Object.assign({ enable: false }, options);
  if (enable && !ctx.app.proxy && !ctx.mergeParams.ownData) throw new Error('必须由api-gateway跳转');
  await next();
};

module.exports = checkOwnData;
