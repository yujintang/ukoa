/* eslint-disable guard-for-in */
/* eslint-disable no-use-before-define */
const { Joi2md, Joi } = require('joi2md');
const { get } = require('lodash');
const url = require('url');
const path = require('path');
const fs = require('fs-extra');

const docs = async (ctx) => {
  // proxy 功能则不需要路过动态路由
  const { Action } = ctx.params;
  const Api = ctx.app.apiMap.get(Action);
  const actionObj = requireFileMulti(path.join(process.cwd(), ctx.app.apiDir));
  const summary = {};
  if (!Api) {
    const {
      protocol = 'http', hostname = 'example.com', pathname = '', query = {},
    } = get(ctx, 'app.config.docs', {});
    for (const i in actionObj) {
      const api = actionObj[i];
      summary[`${api.action}`] = {
        desc: api.desc,
        url: url.format({
          protocol,
          hostname,
          pathname,
          query: Object.assign({}, query, {
            Action: query.Action + api.action,
          }),
        }),
      };
    }
    return ctx.body = summary;
  }
  try {
    const api = new Api(ctx);
    const joi2md = new Joi2md({ Action: Joi.string().default(Action).required() });
    joi2md.concatSchema(api.schema);
    console.log(joi2md.printMd());
    return ctx.body = {
      API名称: Action,
      功能概述: actionObj[Action].desc,
      请求参数: joi2md.printMd().split('\n'),
      请求json: joi2md.printJson(),
    };
  } catch (err) {
    ctx.app.logger.error(err);
    return ctx.body = [err.message, true];
  }
};

const requireFileMulti = (actionPath, splitChar = '_', preArr = []) => {
  let result = {};
  const files = fs.readdirSync(actionPath);
  files.forEach((v) => {
    const tempActionPath = path.join(actionPath, v);
    const stats = fs.statSync(tempActionPath);
    if (stats.isFile() && path.extname(v) === '.js') {
      try {
        const action = path.basename([].concat(preArr, v).join(splitChar), '.js');
        const data = fs.readFileSync(path.join(actionPath, v), 'utf8');
        const notes = /(?:\/\*\*([\s\S]*)\*\/\s*class)/img.exec(data)[1];
        const notesName = /(?:\*([^@]*))/img.exec(notes)[1];
        const desc = notesName.replace(/\*/g, '').trim();
        result[action] = {
          action,
          url,
          desc,
        };
      } catch (err) {
        console.error(`ufo: ${tempActionPath} require error !\t${err.message}\n${err.stack}`);
      }
    }
    if (stats.isDirectory()) {
      const tempResult = requireFileMulti(tempActionPath, splitChar, preArr.concat(v));
      result = Object.assign(result, tempResult);
    }
  });
  return result;
};

module.exports = docs;
