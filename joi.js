const Joi = require('joi');

// sql escape extend
module.exports = Joi.extend(require('./server/utils/joi-sql-escape'));
