const { get } = require('lodash');
const curl = require('./curl');

const ufoCurl = async (url, entity, config = {}, options = {}) => {
  const [data, err] = await curl(url, entity, config, options);
  if (err) return [data, err];
  if (data.RetCode === 0 || data.retCode === 0 || data.ret_code === 0) {
    const key = config.key || 'Data';
    return [get(data, key), false, get(data, 'Total')];
  }
  if (config.throw) throw new Error(data.Message);
  return [data.Message, true];
};

module.exports = ufoCurl;
