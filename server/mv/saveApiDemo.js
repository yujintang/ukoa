const { get, omit } = require('lodash');
const curl = require('../../curl');

module.exports = () => async (ctx, next) => {
  await next();

  if ([true, 'true'].includes(ctx.request.body.__save_docs) && ctx.body.RetCode === 0) {
    const { url, token } = get(ctx.app.config, 'cache_api', {});
    if (!url || !token) throw new Error('使用Cache必须配置{cache_api: {url, token}}');
    const nameSpace = ctx.app.config.name || ctx.app.name;
    const { body } = ctx.request;
    curl(url, {
      Action: 'Common.SaveApiDocDemo',
      ApiName: `${nameSpace}.${body.Action}`,
      Token: token,
      Input: omit(ctx.request.body, ['TrackSN', 'ChainSN', 'Token', 'SaveApiDemo', '__save_docs', '_ip', '_method', '_uuid', 'token', 'ownData', 'staff_id', 'staff_channel_id', 'staff_name_en', 'staff_name_cn', 'staff_email', 'staff_department_id', 'staff_department_name', 'staff_character_id', 'staff_character']),
      Output: omit(ctx.body, ['TrackSN', 'ChainSN']),
    });
  }
};
