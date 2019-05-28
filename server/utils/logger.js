module.exports = () => {
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
  logger.info = data => console.info(data);
  logger.error = data => console.error(data);
  return logger;
};
