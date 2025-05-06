const { setupOpentelemetry } = require("./opentelemetry");
const { tracer } = setupOpentelemetry("example-koa-client");

const api = require("@opentelemetry/api");
const axios = require("axios");
const { PORT } = require("./config");

function makeRequest() {
  const span = tracer.startSpan("client.makeRequest()", {
    kind: api.SpanKind.CLIENT,
  });

  api.context.with(api.trace.setSpan(api.ROOT_CONTEXT, span), async () => {
    try {
      //const res = await axios.get(`http://localhost:${PORT}/run_test`);
      const res = await axios.get(process.env.URL);
      span.setStatus({ code: api.SpanStatusCode.OK });
      console.log(res.statusText);
    } catch (e) {
      if (e instanceof Error) {
        span.setStatus({ code: api.SpanStatusCode.ERROR, message: e.message });
      }
    }
    span.end();
    console.log(
      "Sleeping 5 seconds before shutdown to ensure all records are flushed."
    );
    setTimeout(() => {
      console.log("Completed.");
    }, 5000);
  });
}

makeRequest();
