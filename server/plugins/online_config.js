const assert = require('assert');
const { get } = require('lodash');
const path = require('path');
const fs = require('fs-extra');
const shortid = require('shortid');
const moment = require('moment');

// 获取服务器配置
module.exports = (enable = false, options = {}) => async(ufo) => {
  let config = {};
  // local config
  if (!enable) {
    config = fs.readJsonSync(path.join(ufo.baseDir, ufo.configDir), { throws: false }) || {};
  } else {
    const { url, token, key_path } = options;

    // 获取线上配置
    const [consulCfg, err] = await ufo.curl(url, {
      action: 'ConfigurationDiscovery',
      token,
      key_path,
      dc: 'gd01',
      recurse: false,
    });
    if (err) process.exit(0);
    config = get(consulCfg, `configuration[${key_path}]`, {});
  }
  ufo.config = Object.assign(config, {
    ip: ufo.ip,
    env: ufo.env,
    version: process.env.CONSUL_VERSION,
    name: ufo.name,
    id: shortid.generate(),
    up_time: moment().format('YYYY-MM-DD HH:mm:ss'),
    path: ufo.baseDir,
  });
  assert(ufo.config.port, 'ufo: setup config error, port must be exists! ');
  return ufo.config;
};
