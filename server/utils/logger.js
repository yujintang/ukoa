module.exports = (ufo = {}) => {
  const logger = {};
  logger.json = (data) => {
    if (Object.prototype.toString.apply(data) === '[object Error]') {
      data = {
        message: data.message,
        stack: data.stack,
      };
    }
    if (typeof data === 'object') data = JSON.stringify(data);
    return data;
  };
  logger.info = data => console.info(logger.json(data));
  logger.error = (data) => {
    if (ufo.tryCatchUrl && ufo.tryCatchToken) {
      const curl = require('../../curl');
      curl(ufo.tryCatchUrl, {
        Action: 'Common.SaveAPPException',
        Token: ufo.tryCatchToken,
        APP: ufo.name,
        IP: ufo.ip,
        Info: data.stack || data,
      });
    } else {
      console.error(logger.json(data));
    }
  };
  return logger;
};
