const BASE_URL = 'https://api.figma.com/v1';

interface FigmaResponse<T> {
  data: T;
  status: number;
}

async function fetchWrapper<T>(url: string, token: string, options: RequestInit): Promise<FigmaResponse<T>> {
  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      'X-Figma-Token': token,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json() as T;
  return { data, status: response.status };
}

export function figmaClientRequest(token: string) {
  return {
    get: <T>(url: string) => fetchWrapper<T>(url, token, { method: 'GET' }),
  };
}
