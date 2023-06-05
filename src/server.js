require("dotenv").config();

const Koa = require("koa");
const app = new Koa();
const { setTimeout } = require("node:timers/promises");
const axios = require("axios");
const grpc = require("@grpc/grpc-js");
const { io } = require("@early-birds/protobuf-js");
const { Keycloak } = require("./lib/keycloak");

let keycloak;

app.use(async (ctx, next) => {
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
    await setTimeout(parseInt(ctx.query.sleep, 10));
  }

  if (ctx.query.keycloak) {
    if (!keycloak) {
      keycloak = new Keycloak();
    }

    const credentials = await keycloak.obtainFromClientCredentials();

    if (ctx.query.grpc) {
      const kinds = await listKinds(
        ctx.query.address,
        ctx.query.tenant,
        credentials.access_token.token,
      );

      return (ctx.body = {
        request: ctx.request,
        response,
      });
    }

    return (ctx.body = {
      request: ctx.request,
      response: credentials,
    });
  }

  if (ctx.query.service) {
    const response = await axios.request(ctx.query.service, {
      method: ctx.query.method ?? "GET",
    });

    return (ctx.body = {
      request: ctx.request,
      response: {
        data: response.data,
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

async function listKinds(address, tenantId, bearerToken) {
  const client = new grpc.Client(
    address,
    grpc.credentials.createInsecure()
  );

  const metadata = new grpc.Metadata();
  metadata.set("Authorization", `Bearer ${bearerToken}`);

  const serialize = (x) => {
    return Buffer.from(
      io.earlybirds.protobuf.services.items.ListKindsRequest.encode(x).finish()
    );
  };

  const deserialize = (x) => {
    return io.earlybirds.protobuf.services.items.ListKindsResponse.decode(x);
  };

  const request = new io.earlybirds.protobuf.services.items.ListKindsRequest({
    tenantId,
    pagination: { first: -1 },
  });

  const listKindsResponse = await new Promise((resolve, reject) =>
    client.makeUnaryRequest(
      "/io.earlybirds.protobuf.services.items.ItemKindsService/ListKinds",
      serialize,
      deserialize,
      request,
      metadata,
      {},
      (err, res) => {
        if (err) {
          return reject(err);
        }

        resolve(res);
      }
    )
  );

  return listKindsResponse;
}
