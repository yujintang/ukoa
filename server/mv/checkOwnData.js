/**
 * 检查参数
 */
const checkOwnData = options => async (ctx, next) => {
  const { enable, key } = Object.assign({ enable: true }, options);
  if (enable && !ctx.app.proxy && !ctx.mergeParams[key]) return ctx.body = { RetCode: -1, Message: `缺少${key}参数, 请检查数据来源是否正确。` };
  await next();
  return true;
};

module.exports = checkOwnData;
