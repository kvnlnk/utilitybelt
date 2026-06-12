import { Result, ok } from './types';

// ---------------------------------------------------------------------------
// HTTP Status Code Reference — comprehensive list
// ---------------------------------------------------------------------------

export interface HttpStatusCode {
  code: number;
  title: string;
  description: string;
  category: string;
}

/**
 * Complete list of HTTP status codes with category, title, and description.
 */
export function getAllStatusCodes(): Result<HttpStatusCode[]> {
  return ok(STATUS_CODES);
}

/**
 * Filter status codes by category (e.g. "2xx", "4xx").
 */
export function getStatusCodesByCategory(category: string): Result<HttpStatusCode[]> {
  const filtered = STATUS_CODES.filter((s) => s.category === category);
  return ok(filtered);
}

/**
 * Search status codes by code number or title (case-insensitive).
 */
export function searchStatusCodes(query: string): Result<HttpStatusCode[]> {
  const q = query.toLowerCase().trim();
  if (!q) return ok(STATUS_CODES);
  const filtered = STATUS_CODES.filter(
    (s) =>
      s.code.toString().includes(q) ||
      s.title.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q)
  );
  return ok(filtered);
}

const STATUS_CODES: HttpStatusCode[] = [
  // ── 1xx Informational ──────────────────────────────────────────────
  { code: 100, title: 'Continue', description: 'The server has received the request headers and the client should proceed to send the request body.', category: '1xx' },
  { code: 101, title: 'Switching Protocols', description: 'The server is switching protocols as requested by the client (e.g., upgrading to WebSocket).', category: '1xx' },
  { code: 102, title: 'Processing', description: 'The server has received and is processing the request, but no response is available yet (WebDAV).', category: '1xx' },
  { code: 103, title: 'Early Hints', description: 'The server is sending some response headers before the final response, allowing the client to begin preloading resources.', category: '1xx' },

  // ── 2xx Success ────────────────────────────────────────────────────
  { code: 200, title: 'OK', description: 'The request has succeeded. The meaning of the response depends on the HTTP method used.', category: '2xx' },
  { code: 201, title: 'Created', description: 'The request has been fulfilled and resulted in a new resource being created.', category: '2xx' },
  { code: 202, title: 'Accepted', description: 'The request has been accepted for processing, but the processing has not been completed.', category: '2xx' },
  { code: 204, title: 'No Content', description: 'The server successfully processed the request but is not returning any content.', category: '2xx' },
  { code: 206, title: 'Partial Content', description: 'The server is delivering only part of the resource due to a Range header sent by the client.', category: '2xx' },

  // ── 3xx Redirection ────────────────────────────────────────────────
  { code: 301, title: 'Moved Permanently', description: 'The requested resource has been permanently moved to a new URL. Future requests should use the new URL.', category: '3xx' },
  { code: 302, title: 'Found', description: 'The requested resource resides temporarily under a different URL. The client should use the new URL for this request.', category: '3xx' },
  { code: 303, title: 'See Other', description: 'The response to the request can be found under a different URL and should be retrieved using a GET method.', category: '3xx' },
  { code: 304, title: 'Not Modified', description: 'The resource has not been modified since the last request. The client can use its cached version.', category: '3xx' },
  { code: 307, title: 'Temporary Redirect', description: 'The request should be repeated with another URI, but future requests should still use the original URI.', category: '3xx' },
  { code: 308, title: 'Permanent Redirect', description: 'The request and all future requests should be repeated using another URI (method and body are preserved).', category: '3xx' },

  // ── 4xx Client Error ───────────────────────────────────────────────
  { code: 400, title: 'Bad Request', description: 'The server cannot process the request due to a client error (malformed syntax, invalid framing, etc.).', category: '4xx' },
  { code: 401, title: 'Unauthorized', description: 'Authentication is required and has failed or has not been provided.', category: '4xx' },
  { code: 402, title: 'Payment Required', description: 'Reserved for future use. Originally intended for digital payment systems.', category: '4xx' },
  { code: 403, title: 'Forbidden', description: 'The server understood the request but refuses to authorize it. Authentication will not help.', category: '4xx' },
  { code: 404, title: 'Not Found', description: 'The requested resource could not be found on the server.', category: '4xx' },
  { code: 405, title: 'Method Not Allowed', description: 'The request method is not supported for the requested resource.', category: '4xx' },
  { code: 406, title: 'Not Acceptable', description: 'The server cannot produce a response matching the Accept headers sent by the client.', category: '4xx' },
  { code: 408, title: 'Request Timeout', description: 'The server timed out waiting for the request from the client.', category: '4xx' },
  { code: 409, title: 'Conflict', description: 'The request conflicts with the current state of the server (e.g., duplicate resource).', category: '4xx' },
  { code: 410, title: 'Gone', description: 'The requested resource is no longer available and no forwarding address is known.', category: '4xx' },
  { code: 411, title: 'Length Required', description: 'The request did not specify the length of its content, which is required by the server.', category: '4xx' },
  { code: 413, title: 'Payload Too Large', description: 'The request entity is larger than the server is willing or able to process.', category: '4xx' },
  { code: 415, title: 'Unsupported Media Type', description: 'The media format of the requested data is not supported by the server.', category: '4xx' },
  { code: 418, title: "I'm a Teapot", description: 'RFC 2324 April Fools\' joke — the server refuses to brew coffee because it is, permanently, a teapot.', category: '4xx' },
  { code: 422, title: 'Unprocessable Entity', description: 'The request was well-formed but was unable to be followed due to semantic errors (WebDAV).', category: '4xx' },
  { code: 429, title: 'Too Many Requests', description: 'The user has sent too many requests in a given amount of time (rate limiting).', category: '4xx' },
  { code: 451, title: 'Unavailable For Legal Reasons', description: 'The server is denying access to the resource as a result of a legal demand.', category: '4xx' },

  // ── 5xx Server Error ───────────────────────────────────────────────
  { code: 500, title: 'Internal Server Error', description: 'A generic error message returned when an unexpected condition was encountered on the server.', category: '5xx' },
  { code: 501, title: 'Not Implemented', description: 'The server does not support the functionality required to fulfill the request.', category: '5xx' },
  { code: 502, title: 'Bad Gateway', description: 'The server, while acting as a gateway or proxy, received an invalid response from the upstream server.', category: '5xx' },
  { code: 503, title: 'Service Unavailable', description: 'The server is currently unable to handle the request due to temporary overloading or maintenance.', category: '5xx' },
  { code: 504, title: 'Gateway Timeout', description: 'The server, while acting as a gateway or proxy, did not receive a timely response from the upstream server.', category: '5xx' },
  { code: 505, title: 'HTTP Version Not Supported', description: 'The server does not support the HTTP protocol version used in the request.', category: '5xx' },
  { code: 511, title: 'Network Authentication Required', description: 'The client needs to authenticate to gain network access (e.g., captive portal).', category: '5xx' },
];
