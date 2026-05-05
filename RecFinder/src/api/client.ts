import { tokenStorage } from "../lib/storage";

// base url of the backend api, falls back to local FastAPI server if no env var is set
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

// custom error type thrown when the backend responds with a non-ok status, used so
// callers can read both the message and the http status code
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// the two body shapes the api helper accepts: a plain JSON-ish object or a form payload
type Body = Record<string, unknown> | URLSearchParams;

// options accepted by the request helper to control http method, body, and whether the
// JWT bearer token should be attached
type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: Body;
  auth?: boolean;
};

// internal generic fetch wrapper that builds the request, attaches headers and auth,
// fires the call, and parses or throws based on the response
// Input: api path string, RequestOptions object
// Output: parsed response body of type T
async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = false } = options;

  const headers: Record<string, string> = {};
  let payload: BodyInit | undefined;

  // picks the right Content-Type and serialization based on whether the body is a form
  // (used for the /token login) or a regular JSON object
  if (body instanceof URLSearchParams) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    payload = body;
  } else if (body) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  // attaches the stored JWT as a bearer token when the caller requested an auth'd request
  if (auth) {
    const token = tokenStorage.get();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  // actually fires the request to the backend with the prepared headers and body
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: payload,
  });

  // if the backend signaled an error pull a useful message out of it and surface as ApiError
  if (!response.ok) {
    const message = await extractError(response);
    throw new ApiError(message, response.status);
  }

  // 204 means no content so we just return undefined, otherwise parse and return the JSON body
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

// pulls a human readable error message out of a failed response, handling FastAPI's two
// detail shapes (string or list of validation errors) and falling back to status text
// Input: fetch Response object
// Output: error message string
async function extractError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (typeof data?.detail === "string") return data.detail;
    if (Array.isArray(data?.detail)) return data.detail.map((d: { msg: string }) => d.msg).join(", ");
  } catch {
    /* fallthrough */
  }
  return response.statusText || "Request failed";
}

// public api object that exposes thin verb-specific helpers on top of the request wrapper
// so callers can write api.get(...), api.post(...), etc. without touching method strings
export const api = {
  get: <T>(path: string, opts?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...opts, method: "GET" }),
  post: <T>(path: string, body?: Body, opts?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...opts, method: "POST", body }),
  delete: <T>(path: string, body?: Body, opts?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, {...opts, method: "DELETE", body}),
};
