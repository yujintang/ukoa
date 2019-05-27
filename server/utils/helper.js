const crypto = require('crypto');
const qs = require('querystring');
const fs = require('fs-extra');
const path = require('path');
const { v4 } = require('uuid');
const logger = require('../utils/logger');

const sortObj = (obj) => {
  const res = {};
  Object.keys(obj).sort().forEach((k) => { res[k] = obj[k]; });
  return res;
};

const normalize = (input, sep, eq, options) => {
  if (typeof input === 'string') {
    return input;
  }
  return qs.stringify(sortObj(input), sep, eq, options);
};

/**
 * hash生成
 * @param {*} algorithm // md5，sha1 ...
 */
const generateHash = (algorithm, options) => (payload, sep, eq, opt) => {
  const hmac = crypto.createHash(algorithm, options);
  return hmac.update(normalize(payload, sep, eq, opt), 'utf8').digest('hex');
};

/**
 * hmac 生成
 * @param {*} algorithm
 */
const generateHmac = (algorithm, secret, options) => (payload, sep, eq, opt) => {
  const hmac = crypto.createHmac(algorithm, secret, options);
  return hmac.update(normalize(payload, sep, eq, opt), 'utf8').digest('hex');
};

// 批量加载文件
const requireFileMulti = (actionPath, splitChar = '_', preArr = []) => {
  let fileMap = new Map();
  const files = fs.readdirSync(actionPath);
  files.forEach((v) => {
    const tempActionPath = path.join(actionPath, v);
    const stats = fs.statSync(tempActionPath);
    if (stats.isFile() && path.extname(v) === '.js') {
      try {
        const apiClass = require(tempActionPath);
        fileMap.set(path.basename([].concat(preArr, v).join(splitChar), '.js'), apiClass);
      } catch (err) {
        logger.error(err);
      }
    }
    if (stats.isDirectory()) {
      const tempMap = requireFileMulti(tempActionPath, splitChar, preArr.concat(v));
      fileMap = new Map([...fileMap, ...tempMap]);
    }
  });
  return fileMap;
};

const uuidV4 = (replace = true, char = '') => {
  if (replace) return v4().replace(/-/g, char);
  return v4();
};

module.exports = {
  normalize,
  generateHash,
  generateHmac,
  requireFileMulti,
  uuidV4,
};
