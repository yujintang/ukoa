const { v4 } = require('uuid');
/**
 * 聚合参数中间件
 * @param {*} ctx
 * @param {*} next
 */
const mergeParams = (options = {}) => async (ctx, next) => {
  ctx.mergeParams = Object.assign(
    options.mergeParams || {},
    ctx.request.body,
    ctx.request.query,
  );
  // 大小写action问题
  const { action, Action } = ctx.mergeParams;
  ctx.mergeParams.Action = Action || action;
  delete ctx.mergeParams.action;
  if (!ctx.mergeParams.TrackSN) ctx.mergeParams.TrackSN = v4();

  // 添加其他信息
  const additional = {
    ip: ctx.header['x-forwarded-for'] || ctx.header.host,
    method: ctx.method,
    token: ctx.cookies.get('token') || ctx.cookies.get('INNER_AUTH_TOKEN') || ctx.mergeParams.auth_token,
  };

  if (ctx.app.proxy) Object.assign(ctx.mergeParams, additional);
  await next();
};

module.exports = mergeParams;
