import ky from "ky";

var httpClient = ky.create({
  timeout: 10000,
  retry: {
    limit: 2,
    methods: ["get", "post", "put", "delete", "patch", "head", "options"],
    statusCodes: [408, 500, 502, 503, 504],
    maxRetryAfter: 60000,
  },
});

export default httpClient;
