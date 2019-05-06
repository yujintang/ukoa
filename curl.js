const axios = require('axios');
const debug = require('debug')('ufo:curl');

const curl = async (url, data, config = {}) => {
  try {
    if (typeof url !== 'string') throw new Error('url must string');
    const entity = Object.assign({
      timeout: 20000,
      method: 'post',
      url,
      data,
    }, config);
    debug(`Req: ${JSON.stringify(entity, null, '    ')}`);
    const res = await axios(entity);
    debug(`Res: ${res.data, null, '    '}`);
    return [res.data, false];
  } catch (err) {
    console.error(`ufo: curl Error, \t${err.message}\n${err.stack}`);
    return [`ufo: curl Request Error ${err.message}`, true];
  }
};

module.exports = curl;
