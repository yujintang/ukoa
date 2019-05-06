const { v4 } = require('uuid');
const path = require('path');
const fs = require('fs-extra');
const moment = require('moment');
const os = require('os');
const { get } = require('lodash');
const assert = require('assert');

require('dotenv').config();

module.exports = async (options) => {
  const {
    baseDir, configDir, consul, env,
  } = options;
  const mainConfig = {
    base_dir: baseDir,
    api_env: env,
    api_id: v4().split('-')[0],
    api_ip: get(os.networkInterfaces(), 'eth0[0].address', '127.0.0.1'),
    api_up_time: moment().format('YYYY-MM-DD HH:mm:ss'),
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
    && resConfig.port
    && resConfig.version, 'ufo: setup config error, name、port、version must be exists! ',
  );

  // api_name add
  resConfig.api_name = `${resConfig.name}-${consul.consul_version}`;
  Object.assign(mainConfig, resConfig);

  return mainConfig;
};
