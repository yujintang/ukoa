module.exports = () => {
  const logger = {};
  logger.json = (data) => {
    if (typeof data === 'object') data = JSON.stringify(data);
    return data.replace(/\n/g, ';  ');
  };
  logger.info = data => console.info(logger.json(data));
  logger.error = data => console.error(logger.json(data));
  return logger;
};
