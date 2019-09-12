const assert = require('assert');
const { get } = require('lodash');

// 获取服务器配置
module.exports = (enable = false, options = {}) => async(ufo) => {
  if (!enable) return;
  const {
    url,
    token,
    key_path,
  } = options;

  // 获取线上配置
  const [consulCfg, err] = await ufo.curl(url, {
    action: 'ConfigurationDiscovery',
    token,
    key_path,
    dc: 'gd01',
    recurse: false,
  });
  if (err) process.exit(0);
  ufo.config = get(consulCfg, `configuration[${key_path}]`, {});
  assert(ufo.config.name && ufo.config.version, 'ufo: setup config error, name、version must be exists! ');
};
