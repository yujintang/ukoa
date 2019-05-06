/**
 * 全局捕获错误中间件
 * @param {*} ctx
 * @param {*} next
 */
const systemCatch = () => async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.app.logger.error(err);
    ctx.body = {
      RetCode: 500,
      Message: err.message,
    };
  }
};
module.exports = systemCatch;
