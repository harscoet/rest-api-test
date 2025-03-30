const api = require("@opentelemetry/api");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const { KoaInstrumentation } = require("@opentelemetry/instrumentation-koa");
const {
  NodeTracerProvider,
  SimpleSpanProcessor,
} = require("@opentelemetry/sdk-trace-node");
const { ATTR_SERVICE_NAME } = require("@opentelemetry/semantic-conventions");
const { CompressionAlgorithm } = require("@opentelemetry/otlp-exporter-base");
const {
  OTLPTraceExporter,
} = require("@opentelemetry/exporter-trace-otlp-grpc");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");
const { resourceFromAttributes } = require("@opentelemetry/resources");

function setupTracing(serviceName) {
  const provider = new NodeTracerProvider({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: serviceName,
    }),
    spanProcessors: [
      new SimpleSpanProcessor(
        new OTLPTraceExporter({
          url: "http://localhost:7281",
          compression: CompressionAlgorithm.GZIP,
        })
      ),
    ],
  });

  registerInstrumentations({
    instrumentations: [new KoaInstrumentation(), new HttpInstrumentation()], 
    tracerProvider: provider,
  });

  provider.register();

  return api.trace.getTracer(serviceName);
}

module.exports = { setupTracing };
