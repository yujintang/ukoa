const _ = require('lodash');

/**
 * 根据 Action 改变路由
 */
const changeRoutePath = () => async (ctx, next) => {
  const Action = _.get(ctx, 'request.body.action')
  || _.get(ctx, 'request.body.Action')
  || _.get(ctx, 'request.query.action')
  || _.get(ctx, 'request.query.Action') || '';
  if (ctx.path === '/') {
    const actionSplit = Action.split('.');
    if (actionSplit.length === 1) ctx.routerPath = `/dynamic/${actionSplit[0]}`;
    if (actionSplit.length === 2) ctx.routerPath = `/proxy/${actionSplit[0]}/${actionSplit[1]}`;
  }
  await next();
};

module.exports = changeRoutePath;
