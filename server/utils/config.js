const { v4 } = require('uuid');
const path = require('path');
const fs = require('fs-extra');
const moment = require('moment');
const assert = require('assert');

require('dotenv').config();

module.exports = async (options) => {
  const {
    baseDir, configDir, consul, env, ip, name,
  } = options;
  const mainConfig = {
    base_dir: baseDir,
    api_env: env,
    api_id: v4().split('-')[0],
    api_ip: ip,
    api_up_time: moment().format('YYYY-MM-DD HH:mm:ss'),
    api_name: `${name}-${consul.consul_version}`,
  };

  // 获取本地配置或线上配置
  let resConfig;
  if (mainConfig.api_env !== 'production') {
    resConfig = fs.readJsonSync(path.join(mainConfig.base_dir, configDir), { throws: false }) || {};
  } else {
    resConfig = await consul.ConfigurationDiscovery();
  }
  assert(
    resConfig.name
    && resConfig.version, 'ufo: setup config error, name、version must be exists! ',
  );

  Object.assign(mainConfig, resConfig);

  return mainConfig;
};
