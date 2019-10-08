const axios = require('axios');
const createDebug = require('debug');

const curl = async (url, data, config = {}, options = {}) => {
  const logger = options.logger || console;
  try {
    if (typeof url !== 'string') throw new Error('url must string');
    const entity = Object.assign({
      timeout: 60000,
      method: 'post',
      url,
      data,
    }, config);
    const debug = createDebug(`ufo:curl:${data.Action}`);
    debug(`Req: ${JSON.stringify(entity, null, '    ')}`);
    const res = await axios(entity);
    debug(`Res: ${JSON.stringify(res.data, null, '    ')}`);
    return [res.data, false];
  } catch (err) {
    const errMessage = `ufo: curl Request Error ${err.message}`;
    if (config.throw) throw new Error(errMessage);
    logger.error(err);
    return [errMessage, true];
  }
};

module.exports = curl;
