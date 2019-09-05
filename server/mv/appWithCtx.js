module.exports = options => async (ctx, next) => {
  const { enable } = Object.assign({ enable: true }, options);
  if (!enable) { await next(); return; }

  ctx.app.ctx = ctx;
  await next();
};
