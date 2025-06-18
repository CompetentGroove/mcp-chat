import useSWR, { SWRConfiguration, SWRResponse } from 'swr';

async function fetcher<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

export function useAuthenticatedSWR<Data = any, Error = any>(
  url: string | null,
  options?: SWRConfiguration
): SWRResponse<Data, Error> {
  return useSWR<Data, Error>(url, (u) => fetcher(u), options);
}

export function useApi() {
  const fetchWithAuth = fetcher;
  return {
    get: <T = any>(url: string) => fetchWithAuth<T>(url),
    post: <T = any>(url: string, data: any) =>
      fetchWithAuth<T>(url, { method: 'POST', body: JSON.stringify(data) }),
    put: <T = any>(url: string, data: any) =>
      fetchWithAuth<T>(url, { method: 'PUT', body: JSON.stringify(data) }),
    delete: <T = any>(url: string) =>
      fetchWithAuth<T>(url, { method: 'DELETE' }),
  };
}
