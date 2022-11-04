const Koa = require("koa");
const app = new Koa();
const { setTimeout } = require("node:timers/promises");

app.use(async (ctx) => {
  if (ctx.query.status) {
    ctx.status = parseInt(ctx.query.status, 10);
  } else if (ctx.query.randstatus !== undefined) {
    const rand = Math.random();

    if (rand < 0.3) {
      ctx.status = 503;
    } else if (rand < 0.6) {
      ctx.status = 429;
    } else {
      ctx.status = 200;
    }
  }

  if (ctx.query.sleep) {
    await setTimeout(parseInt(ctx.query.sleep, 10));
  }

  ctx.body = ctx.request;
});

app.listen(3000, () => {
  console.log("Listening...");
});
