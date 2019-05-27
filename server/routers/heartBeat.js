const logger = require('../utils/logger')();

const heartBeat = async (ctx) => {
  const { config, consul } = ctx.app;
  const newConfig = await consul.ConfigurationDiscovery();
  if (config.version !== newConfig.version) {
    ctx.status = 506;
    logger.info({
      older: config,
      newer: newConfig,
    });
  }
  ctx.body = {
    api_name: config.api_name,
    api_type: config.type,
    api_version: config.version,
    api_env: config.api_env,
    api_id: config.api_id,
    api_ip: config.api_ip,
    api_port: config.port,
    api_up_time: config.api_up_time,
    api_path: config.base_dir,
  };
};

module.exports = heartBeat;
