const restart = async (ctx) => {
  ctx.app.logger.info('ufo: restart api makes service closed!');
  process.exit();
};

module.exports = restart;
