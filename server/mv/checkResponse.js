const humpsClient = require('humps');
const debug = require('debug')('ufo:checkResponse');

/**
 * 规范输出字段中间件
 * @param {*} ctx
 * @param {*} next
 */
const checkResponse = (options = {}) => async (ctx, next) => {
  await next();
  debug(`Req: ${JSON.stringify(ctx.body, null, '    ')}`);
  const { stdout, humps, onlyController } = Object.assign({
    stdout: {
      Action: 1, RetCode: 1, Message: 1, Data: 1, TrackSN: 1, ChainSN: 1, Total: 1,
    },
    onlyController: true,
  }, options);

  // match api ctx
  if (!Array.isArray(ctx.body) && onlyController) {
    return;
  }
  if (Array.isArray(ctx.body)) {
    const [data, err] = ctx.body;
    ctx.body = {
      Action: `${ctx.mergeParams.Action || ''}Response`,
      RetCode: err ? -1 : 0,
      TrackSN: ctx.mergeParams.TrackSN,
      ChainSN: ctx.mergeParams.ChainSN,
      Data: err ? {} : data,
      Message: err ? `${ctx.app.consul.consul_category} -> ${data}` : 'Ok!',
      Total: Object.prototype.toString.apply(data) === '[object Array]' ? data.length : undefined,
    };
  }
  humpsClient[humps] && (ctx.body = humpsClient[humps](ctx.body));
  if (ctx.body) Object.keys(ctx.body).forEach((key) => { if (!stdout[key]) delete ctx.body[key]; });
  debug(`Res: ${JSON.stringify(ctx.body, null, '    ')}`);
};

module.exports = checkResponse;
