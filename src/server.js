require("dotenv").config();

const Koa = require("koa");
const app = new Koa();
const { setTimeout } = require("node:timers/promises");
const axios = require("axios");
const { Keycloak } = require("./lib/keycloak");

let keycloak;

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    ctx.status = err.statusCode || err.status || 500;

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
    await setTimeout(parseInt(ctx.query.sleep, 10));
  }

  if (ctx.query.keycloak) {
    if (!keycloak) {
      keycloak = new Keycloak();
    }

    return (ctx.body = {
      request: ctx.request,
      keycloak: await keycloak.obtainFromClientCredentials(),
    });
  }

  if (ctx.query.service) {
    const response = await axios.request(ctx.query.service, {
      method: ctx.query.method ?? "GET",
    });

    return (ctx.body = {
      request: ctx.request,
      service: {
        response: {
          data: response.data,
        },
      },
    });
  }

  ctx.body = {
    request: ctx.request,
  };
});

app.listen(3000, () => {
  console.log("Listening...");
});
