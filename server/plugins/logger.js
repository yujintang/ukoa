// 错误在线上传
const curl = require('../../curl');

module.exports = (enable = false, options = {}) => async(ufo) => {
  if (!enable) return;
  const { url, token } = options;
  if (!url || !token) return;

  const logger = {};
  logger.json = (data) => {
    if (Object.prototype.toString.apply(data) === '[object Error]') {
      data = {
        message: data.message,
        stack: data.stack,
      };
    }
    if (typeof data === 'object') data = JSON.stringify(data);
    return data;
  };
  logger.info = data => console.info(logger.json(data));
  logger.error = (data) => {
    curl(url, {
      Action: 'Common.SaveAPPException',
      Token: token,
      APP: ufo.config.name || ufo.name,
      IP: ufo.config.svc_url || ufo.ip,
      Info: data.stack || data,
    });
  };
  ufo.logger = logger;
};
