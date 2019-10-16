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
      id: ufo.apiId,
      name: ufo.config.name,
      tags: [
        ufo.config.name,
        ufo.env,
        ufo.config.version,
        ufo.startTime,
      ],
      ip: ufo.config.svc_url || ufo.ip,
      port: ufo.config.svc_port || ufo.config.port,
      check_rules: {
        id: ufo.apiId,
        name: ufo.config.name,
        http: `http://${ufo.config.svc_url || ufo.ip}:${
          ufo.config.svc_port || ufo.config.port
        }/HeartBeat`,
        interval: '30s',
        timeout: '8s',
      },
    });
    if (err) process.exit(0);
  };
};
