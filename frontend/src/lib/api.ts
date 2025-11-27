const DEFAULT_API_URL = "http://localhost:8000/api";

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? DEFAULT_API_URL;

type ApiFetchOptions = RequestInit & { signal?: AbortSignal };

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");

  if (!response.ok) {
    
    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }

    if (isJson) {
      const errorBody = await response.json().catch(() => ({}));
      const message = errorBody?.message ?? response.statusText;
      throw new Error(message);
    }

    throw new Error(response.statusText || "Erro desconhecido na API");
  }

  if (!isJson) {
    
    return null;
  }

  return (await response.json()) as T;
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const trimmedPath = path.replace(/^\//, "");
  const url = `${API_URL}/${trimmedPath}`;

  
  const token = localStorage.getItem('auth_token');

  const { headers: optionHeaders, ...fetchOptions } = options;

  const headers = new Headers({
    "Content-Type": "application/json",
  });

  if (optionHeaders instanceof Headers) {
    optionHeaders.forEach((value, key) => {
      headers.set(key, value);
    });
  } else if (Array.isArray(optionHeaders)) {
    optionHeaders.forEach(([key, value]) => {
      headers.set(key, value);
    });
  } else if (optionHeaders) {
    Object.entries(optionHeaders).forEach(([key, value]) => {
      headers.set(key, String(value));
    });
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  return handleResponse<T>(response);
}

export { API_URL };
