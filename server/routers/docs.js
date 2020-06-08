/* eslint-disable guard-for-in */
/* eslint-disable no-use-before-define */
const { Joi2md, Joi } = require('joi2md');
const { get, omit } = require('lodash');
const path = require('path');
const fs = require('fs-extra');
const curl = require('../../curl');

const logger = console;

const docs = async (ctx) => {
  const { Action } = ctx.params;
  const Api = ctx.app.apiMap.get(Action);
  const actionObj = requireFileMulti(path.join(process.cwd(), ctx.app.apiDir));
  const summary = {};
  if (!Api) {
    const doc_url = get(ctx, 'app.config.doc_url', 'https://docs.example.com/?Action=xx.');
    for (const i in actionObj) {
      const TempApi = ctx.app.apiMap.get(i);
      const tempApi = new TempApi(ctx);
      tempApi.init(tempApi.ctx, tempApi.Joi);
      summary[`[${showDeprecated(tempApi.docs)}] ${actionObj[i].action} [${actionObj[i].desc}]`] = `${doc_url}${actionObj[i].action}`;
    }
    return ctx.body = summary;
  }
  try {
    const api = new Api(ctx);
    api.init(api.ctx, api.Joi);
    const joi2md = new Joi2md({ Action: Joi.string().default(Action).required() });
    joi2md.concatSchema(api.schema);
    let mockFile = {};

    const { url, token } = get(ctx.app.config, 'cache_api', {});
    if (!url || !token) throw new Error('使用Cache必须配置{cache_api: {url, token}}');
    const nameSpace = ctx.app.config.name || ctx.app.name;
    const [data, err] = await curl(url, {
      Action: 'Common.GetApiDocDemo',
      ApiName: `${nameSpace}.${ctx.params.Action}`,
      Token: token,
    });
    if (err || data.RetCode !== 0) {
      mockFile = {};
    } else {
      mockFile = data.Data;
    }

    return ctx.body = Object.assign({
      API名称: Action,
      是否维护: showDeprecated(api.docs),
      缓存机制: get(api.docs, 'cache') ? '✅' : '❌',
      功能概述: actionObj[Action].desc,
      ...omit(api.docs || {}, ['cache', 'deprecated']),
      请求参数: joi2md.printMd().split('\n'),
      请求示例: omit(mockFile.input, ['__ip', '__method', '__view_docs', '__save_docs', 'TrackSN', 'ChainSN', 'Token']),
      返回示例: omit(mockFile.output, ['TrackSN', 'ChainSN']),
    });
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
        const notes = /(?:\/\*\*([\s\S]*)\*\/\s*(class|module\.exports))/img.exec(data)[1];
        const notesName = /(?:\*([^@]*))/img.exec(notes)[1];
        const desc = notesName.replace(/\*/g, '').trim();
        result[action] = {
          action,
          desc,
        };
      } catch (err) {
        logger.error(err);
      }
    }
    if (stats.isDirectory()) {
      const tempResult = requireFileMulti(tempActionPath, splitChar, preArr.concat(v));
      result = Object.assign(result, tempResult);
    }
  });
  return result;
};

const showDeprecated = (temoDocs = {}) => {
  const deprecated = get(temoDocs, 'deprecated', false);
  let showCode = '✅';
  if ([true, 'true', '是', 'yes'].includes(deprecated)) {
    showCode = '❌';
  }
  return showCode;
};

module.exports = docs;
