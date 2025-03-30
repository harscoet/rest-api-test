exports.PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

exports.TIMEOUT_MS = process.env.TIMEOUT_MS
  ? parseInt(process.env.TIMEOUT_MS, 10)
  : 120 * 1000;