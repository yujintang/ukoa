const { get, pick } = require('lodash');
const curl = require('./curl');

const ufoCurl = async (url, entity, config = {}, options = {}) => {
  const [data, err] = await curl(url, entity, config, options);
  if (err) return [data, err];
  if (data.RetCode === 0 || data.retCode === 0 || data.ret_code === 0) {
    const key = config.key || 'Data';
    const total = config.total || 'Total';
    if (config.pick) {
      return [pick(data, config.pick), false, total];
    }
    return [get(data, key), false, get(data, total)];
  }
  return [data.Message, true];
};

module.exports = ufoCurl;
