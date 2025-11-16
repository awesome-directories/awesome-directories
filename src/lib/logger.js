import log from "loglevel";

const isProd = import.meta.env.PROD;
const logLevel = import.meta.env.PUBLIC_LOG_LEVEL || "error";

log.setLevel(isProd ? logLevel : "debug");

export default log;
