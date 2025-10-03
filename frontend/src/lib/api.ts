const DEFAULT_API_URL = "http://localhost:8000/api";

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? DEFAULT_API_URL;

type ApiFetchOptions = RequestInit & { signal?: AbortSignal };

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");

  if (!response.ok) {
    if (isJson) {
      const errorBody = await response.json().catch(() => ({}));
      const message = errorBody?.message ?? response.statusText;
      throw new Error(message);
    }

    throw new Error(response.statusText || "Erro desconhecido na API");
  }

  if (!isJson) {
    // @ts-expect-error -- allow returning empty payloads
    return null;
  }

  return (await response.json()) as T;
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const trimmedPath = path.replace(/^\//, "");
  const url = `${API_URL}/${trimmedPath}`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });

  return handleResponse<T>(response);
}

export { API_URL };
