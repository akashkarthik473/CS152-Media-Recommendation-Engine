import { tokenStorage } from "../lib/storage";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type Body = Record<string, unknown> | URLSearchParams;

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: Body;
  auth?: boolean;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = false } = options;

  const headers: Record<string, string> = {};
  let payload: BodyInit | undefined;

  if (body instanceof URLSearchParams) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    payload = body;
  } else if (body) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  if (auth) {
    const token = tokenStorage.get();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: payload,
  });

  if (!response.ok) {
    const message = await extractError(response);
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

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

export const api = {
  get: <T>(path: string, opts?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...opts, method: "GET" }),
  post: <T>(path: string, body?: Body, opts?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...opts, method: "POST", body }),
};
