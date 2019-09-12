exports.Ufo = require('./ufo');

exports.compose = require('koa-compose');

exports.Controller = require('./controller');

exports.curl = require('./curl');

exports.ufoCurl = require('./ufoCurl');

exports.lodash = require('lodash');
exports._ = require('lodash');

exports.moment = require('moment');

exports.Joi = require('./joi');

exports.helper = require('./server/utils/helper');

exports.humps = require('humps');

exports.plugins = {
  logger: require('./server/plugins/logger'),
  online_config: require('./server/plugins/online_config'),
  registry_service: require('./server/plugins/registry_service'),
};
