const api = require("@opentelemetry/api");
const {
  getNodeAutoInstrumentations,
} = require("@opentelemetry/auto-instrumentations-node");
const {
  NodeTracerProvider,
  SimpleSpanProcessor,
} = require("@opentelemetry/sdk-trace-node");
const { ATTR_SERVICE_NAME } = require("@opentelemetry/semantic-conventions");
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
        new OTLPTraceExporter()
      ),
    ],
  });

  registerInstrumentations({
    instrumentations: [getNodeAutoInstrumentations()],
    tracerProvider: provider,
  });

  provider.register();

  return api.trace.getTracer(serviceName);
}

module.exports = { setupTracing };
