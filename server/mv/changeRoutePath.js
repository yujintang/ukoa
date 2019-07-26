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
    const __view_docs = _.get(ctx, 'request.query.__view_docs') || _.get(ctx, 'request.body.__view_docs') || false;
    const actionSplit = Action.split('.');
    if (actionSplit.length === 1) {
      const preFix = __view_docs ? 'docs' : 'dynamic';
      ctx.routerPath = `/${preFix}/${actionSplit[0]}`;
    }
    if (actionSplit.length === 2) {
      if (ctx.app.proxy) {
        ctx.routerPath = `/proxy/${actionSplit[0]}/${actionSplit[1]}`;
      } else {
        throw new Error('非proxy服务, Action请勿携带 “app.” 字段');
      }
    }
  }
  await next();
};

module.exports = changeRoutePath;
