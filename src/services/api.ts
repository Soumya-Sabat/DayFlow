export const API_BASE_URL = '/api';

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('dayflow_access_token');
  const storedUserRaw = localStorage.getItem('dayflow_user');
  let requesterRole = 'Employee';

  if (storedUserRaw) {
    try {
      const u = JSON.parse(storedUserRaw);
      if (u?.role) {
        requesterRole = u.role.charAt(0).toUpperCase() + u.role.slice(1);
      }
    } catch {
      // ignore
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'requester-role': requesterRole,
    'requesterrole': requesterRole,
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  let data: any;

  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMsg = typeof data === 'object' && data?.error ? data.error : response.statusText;
    throw new Error(errorMsg || `Request failed with status ${response.status}`);
  }

  return data as T;
}
