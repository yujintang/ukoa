// 注册服务
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
      id: ufo.config.id,
      name: ufo.config.name,
      tags: [
        ufo.config.name,
        ufo.env,
        ufo.config.version,
        ufo.config.up_time,
      ],
      ip: ufo.ip,
      port: ufo.config.port,
      check_rules: {
        id: ufo.config.id,
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
