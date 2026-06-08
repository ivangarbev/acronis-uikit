const FIGMA_API_BASE = 'https://api.figma.com/v1';

async function fetchWrapper<T>(url: string, token: string, options: RequestInit): Promise<{ data: T }> {
  const headers = {
    'Content-Type': 'application/json',
    'X-Figma-Token': token,
  };
  const response = await fetch(`${FIGMA_API_BASE}${url}`, { ...options, headers });
  const data = (await response.json()) as T;
  return { data };
}

export function figmaClientRequest(token: string) {
  return {
    get: <T>(url: string) => fetchWrapper<T>(url, token, { method: 'GET' }),
    post: <T>(url: string, body: unknown) => fetchWrapper<T>(url, token, { method: 'POST', body: JSON.stringify(body) }),
    put: <T>(url: string, body: unknown) => fetchWrapper<T>(url, token, { method: 'PUT', body: JSON.stringify(body) }),
    delete: <T>(url: string) => fetchWrapper<T>(url, token, { method: 'DELETE' }),
  };
}
