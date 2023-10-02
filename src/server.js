require("dotenv").config();

const Koa = require("koa");
const app = new Koa();
const { setTimeout } = require("node:timers/promises");

const TIMEOUT_MS = process.env.TIMEOUT_MS
  ? parseInt(process.env.TIMEOUT_MS, 10)
  : 120 * 1000;

app.use(async (ctx, next) => {
  console.log('url', ctx.url, ctx.request.headers);

  try {
    await next();
  } catch (error) {
    console.error(error);
    ctx.status = error.statusCode || error.status || 500;

    ctx.body = {
      error,
    };
  }
});

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
    const sleepTime = parseInt(ctx.query.sleep, 10);
  
    if (ctx.query.randsleep) {
      if (Math.random() < 0.5) {
        await setTimeout(sleepTime);
      }
    } else {
      await setTimeout(sleepTime);
    }
  }

  ctx.body = {
    request: ctx.request,
    responseHeaders: ctx.response.headers,
  };
});

const server = app.listen(3000, () => {
  console.log("Listening...");
});

server.timeout = TIMEOUT_MS;
