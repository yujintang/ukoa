const { get } = require('lodash');
const curl = require('./curl');

const ufoCurl = async (url, entity, config = {}) => {
  const [data, err] = await curl(url, entity, config);
  if (err) return [data, err];
  if (data.RetCode === 0 || data.retCode === 0 || data.ret_code === 0) {
    return [get(data, `${config.key} || 'Data'`), false];
  }
  if (config.throw) throw new Error(data.Message);
  return [data.Message, true];
};

module.exports = ufoCurl;
