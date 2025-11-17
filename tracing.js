const { resourceFromAttributes } = require('@opentelemetry/resources');
const { ATTR_SERVICE_NAME } = require('@opentelemetry/semantic-conventions');

const { NodeSDK } = require('@opentelemetry/sdk-node');

const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');

const {
  ConsoleMetricExporter,
  PeriodicExportingMetricReader,
} = require('@opentelemetry/sdk-metrics');

// Instrumentations
const { ExpressInstrumentation } =
  require("opentelemetry-instrumentation-express");
const { MongoDBInstrumentation } =
  require("@opentelemetry/instrumentation-mongodb");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");

const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');

const traceExporter = new OTLPTraceExporter({
  url: "http://localhost:4318/v1/traces",   // Jaeger OTLP HTTP endpoint
});

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: "todo-service"
  }),

  traceExporter,

  metricReader: new PeriodicExportingMetricReader({
    exporter: new ConsoleMetricExporter(),
  }),

  instrumentations: [
    getNodeAutoInstrumentations(),
    new ExpressInstrumentation(),
    new MongoDBInstrumentation(),
    new HttpInstrumentation()
  ],
});

try {
  sdk.start();
  console.log("✔ OpenTelemetry tracing initialized with OTLP → Jaeger");
} catch (err) {
  console.error("Error starting OpenTelemetry SDK", err);
}

