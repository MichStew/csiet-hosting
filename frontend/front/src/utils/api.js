const DEFAULT_LOCAL_API = 'http://localhost:4000';

function stripTrailingSlash(url) {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

export function getApiBaseUrl() {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim();
  if (configured) {
    return stripTrailingSlash(configured);
  }

  if (import.meta.env.DEV) {
    return DEFAULT_LOCAL_API;
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  return DEFAULT_LOCAL_API;
}
