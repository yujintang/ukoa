const { v4 } = require('uuid');
const { pick } = require('lodash');
const debug = require('debug')('ufo:mergeParams');
const shortid = require('shortid');

/**
 * 聚合参数中间件
 * @param {*} ctx
 * @param {*} next
 */
const mergeParams = (options = {}) => async (ctx, next) => {
  debug(`Req: ${JSON.stringify(pick(ctx.request, ['body', 'query']), null, '    ')}`);
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
  if (!ctx.mergeParams.ChainSN) ctx.mergeParams.ChainSN = shortid.generate();

  // 添加其他信息
  const additional = {
    ip: ctx.header['x-forwarded-for'] || ctx.header.host,
    method: ctx.method,
    token: ctx.cookies.get('token') || ctx.cookies.get('INNER_AUTH_TOKEN') || ctx.mergeParams.Token,
  };

  if (ctx.app.proxy) Object.assign(ctx.mergeParams, additional);
  debug(`Res: ${JSON.stringify(ctx.mergeParams, null, '     ')}`);
  await next();
};

module.exports = mergeParams;
