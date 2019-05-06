const humpsClient = require('humps');
/**
 * 规范输出字段中间件
 * @param {*} ctx
 * @param {*} next
 */
const checkResponse = (options = {}) => async (ctx, next) => {
  await next();
  const { stdout, humps } = Object.assign({
    stdout: {
      Action: 1, RetCode: 1, Message: 1, Data: 1, TrackSN: 1,
    },
  }, options);

  // match api ctx
  if (Array.isArray(ctx.body)) {
    const [data, err] = ctx.body;
    ctx.body = {
      Action: `${ctx.mergeParams.Action || ''}Response`,
      RetCode: err ? -1 : 0,
      TrackSN: ctx.mergeParams.TrackSN,
      Data: err ? {} : data,
      Message: err ? data : 'Ok!',
    };
    humpsClient[humps] && (ctx.body = humpsClient[humps](ctx.body));
  }

  if (ctx.body) Object.keys(ctx.body).forEach((key) => { if (!stdout[key]) delete ctx.body[key]; });
};

module.exports = checkResponse;
