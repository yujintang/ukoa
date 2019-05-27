const logger = require('../utils/logger')();

const restart = async () => {
  logger.info('ufo: restart api makes service closed!');
  process.exit();
};

module.exports = restart;
