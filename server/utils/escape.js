/* eslint-disable no-unused-vars */
/* eslint-disable no-useless-escape */
/* eslint-disable no-control-regex */
/* eslint-disable no-cond-assign */
/* eslint-disable no-multi-assign */
const CHARS_GLOBAL_REGEXP = /[\0\b\t\n\r\x1a\"\'\\]/g;
const CHARS_ESCAPE_MAP = {
  '\0': '\\0',
  '\b': '\\b',
  '\t': '\\t',
  '\n': '\\n',
  '\r': '\\r',
  '\x1a': '\\Z',
  '"': '\\"',
  '\'': '\\\'',
  '\\': '\\\\',
};

const result = (val, single_quota) => {
  if (single_quota) return `'${val}'`;
  return val;
};
function escapeString(val, single_quota) {
  let chunkIndex = CHARS_GLOBAL_REGEXP.lastIndex = 0;
  let escapedVal = '';
  let match;

  while ((match = CHARS_GLOBAL_REGEXP.exec(val))) {
    escapedVal += val.slice(chunkIndex, match.index) + CHARS_ESCAPE_MAP[match[0]];
    chunkIndex = CHARS_GLOBAL_REGEXP.lastIndex;
  }
  if (chunkIndex === 0) {
    return result(val, single_quota);
  }

  if (chunkIndex < val.length) {
    return result(escapedVal + val.slice(chunkIndex), single_quota);
  }
  return result(escapedVal, single_quota);
}

module.exports = escapeString;