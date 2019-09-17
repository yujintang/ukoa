// 注册服务
const moment = require('moment');
const api_id = require('shortid').generate();

module.exports = (enable = false, options = {}) => async(ufo) => {
  if (!enable) return;
  const {
    url,
    token,
  } = options;

  ufo.registry = async () => {
    // 注册服务
    const [, err] = await ufo.curl(url, {
      action: 'ServiceRegistry',
      token,
      id: api_id,
      name: ufo.config.name,
      tags: [
        ufo.config.name,
        ufo.env,
        ufo.config.version,
        moment().format('YYYY-MM-DD HH:mm:ss'),
      ],
      ip: ufo.ip,
      port: ufo.config.port,
      check_rules: {
        id: api_id,
        name: ufo.config.name,
        http: `http://${ufo.ip}:${
          ufo.config.port
        }/HeartBeat`,
        interval: '30s',
        timeout: '8s',
      },
    });
    if (err) process.exit(0);
  };
};
