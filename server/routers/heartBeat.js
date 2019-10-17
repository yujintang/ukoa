const heartBeat = async (ctx) => {
  const {
    config, ip, env, baseDir, startTime, consul, apiId,
  } = ctx.app;
  // const newConfig = await consul.ConfigurationDiscovery();
  // if (config.version !== newConfig.version) {
  //   ctx.status = 506;
  //   logger.info({
  //     older: config,
  //     newer: newConfig,
  //   });
  // }
  ctx.body = {
    api_name: config.name,
    api_type: config.type,
    api_version: config.version,
    api_env: env,
    api_id: apiId,
    api_ip: config.svc_url || ip,
    api_port: config.svc_port || config.port,
    api_up_time: startTime,
    api_path: baseDir,
    consul_path: consul && consul.key_path,
  };
};

module.exports = heartBeat;
