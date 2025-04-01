const api = require("@opentelemetry/api");
const {
  OTLPTraceExporter,
} = require("@opentelemetry/exporter-trace-otlp-grpc");
const { NodeSDK } = require("@opentelemetry/sdk-node");
const {
  AggregationType,
  InstrumentType,
  PeriodicExportingMetricReader,
} = require("@opentelemetry/sdk-metrics");
const {
  getNodeAutoInstrumentations,
} = require("@opentelemetry/auto-instrumentations-node");
const {
  OTLPMetricExporter,
} = require("@opentelemetry/exporter-metrics-otlp-grpc");

function setupOpentelemetry(serviceName) {
  const sdk = new NodeSDK({
    serviceName,
    metricReader:
      process.env.OTEL_EXPORTER_OTLP_METRICS_DISABLED === "true"
        ? null
        : new PeriodicExportingMetricReader({
            exportIntervalMillis:
              parseInt(process.env.OTEL_METRIC_EXPORT_INTERVAL || "", 10) ||
              10000,
            exporter: new OTLPMetricExporter({
              aggregationPreference: (instrumentType) => {
                if (
                  instrumentType === InstrumentType.HISTOGRAM &&
                  process.env
                    .OTEL_EXPORTER_OTLP_METRICS_DEFAULT_HISTOGRAM_AGGREGATION ===
                    "base2_exponential_bucket_histogram"
                ) {
                  return {
                    type: AggregationType.EXPONENTIAL_HISTOGRAM,
                  };
                }

                return {
                  type: AggregationType.DEFAULT,
                };
              },
            }),
          }),
    traceExporter: new OTLPTraceExporter(),
    instrumentations: [getNodeAutoInstrumentations()],
  });

  sdk.start();

  return {
    sdk,
    tracer: api.trace.getTracer(serviceName),
  };
}

module.exports = { setupOpentelemetry };
