export async function safeFetchJson<T = any>(
  url: string,
  options?: RequestInit
): Promise<{ ok: boolean; status: number; data?: T; error?: string }> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    const bodyText = await res.text();

    let data: any = null;
    if (contentType.includes('application/json') || bodyText.trim().startsWith('{') || bodyText.trim().startsWith('[')) {
      try {
        data = JSON.parse(bodyText);
      } catch (parseErr) {
        data = null;
      }
    }

    if (res.ok && data !== null) {
      return { ok: true, status: res.status, data };
    }

    if (data && data.error) {
      return { ok: false, status: res.status, error: String(data.error) };
    }

    // Check for Vercel 404 or HTML response ("The page could not be found...")
    if (
      bodyText.includes('<!DOCTYPE') ||
      bodyText.toLowerCase().includes('the page could not be found') ||
      bodyText.toLowerCase().includes('the page c') ||
      bodyText.toLowerCase().includes('not found')
    ) {
      return {
        ok: false,
        status: res.status,
        error: `The API endpoint '${url}' returned an HTML page (${res.status}). If deployed on Vercel, ensure Vercel backend serverless function rewrites are configured or use direct Supabase auth.`,
      };
    }

    return {
      ok: false,
      status: res.status,
      error: (data && (data.message || data.error)) || res.statusText || `Request failed with status ${res.status}`,
    };
  } catch (err: any) {
    return {
      ok: false,
      status: 0,
      error: err.message || 'Network request failed. Please check your internet connection.',
    };
  }
}
