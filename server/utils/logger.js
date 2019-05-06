const path = require('path');
const { createLogger, format, transports } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

module.exports = (options) => {
  const logConfig = Object.assign({
    filename: '%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    dirname: path.join(process.cwd(), 'logs'),
    maxSize: '20m',
    format: format.json(),
  }, options);
  const console = new transports.Console({});

  const rotateFile = new DailyRotateFile(logConfig);

  const logger = createLogger({
    format: format.combine(format.splat(), format.simple(), format.timestamp()),
    transports: [console],
  });

  // only use file log in production
  if (process.env.NODE_ENV === 'production') {
    logger.add(rotateFile);
  }

  return logger;
};
