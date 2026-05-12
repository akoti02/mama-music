// Static asset server with no-cache HTML so users get the latest version
// the moment we push. /lovers and /dj are guest entrypoints — they serve the
// same index.html, and the client detects the path to apply guest identity.
function applySecurityHeaders(headers) {
  // No-sniff blocks browsers from guessing content type. X-Frame-Options
  // SAMEORIGIN stops someone embedding akoev.com in an iframe to clickjack
  // mom's taps. Referrer-Policy keeps URLs with user state out of third-party
  // referer headers. HSTS is best-effort (Cloudflare already enforces TLS).
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'SAMEORIGIN');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
}
export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const p = url.pathname;
    if (p === '/lovers' || p === '/lovers.html' || p === '/dj' || p === '/dj.html') {
      const indexReq = new Request(new URL('/', req.url), req);
      const resp = await env.ASSETS.fetch(indexReq);
      const headers = new Headers(resp.headers);
      // Force charset=utf-8 in the header. iOS Safari sometimes refuses to
      // parse a Cyrillic-bearing HTML doc if the response header only says
      // "text/html" with no charset — leaving the user with a blank page.
      // The <meta charset> inside the doc is a fallback but the header wins.
      headers.set('Content-Type', 'text/html; charset=utf-8');
      headers.set('Cache-Control', 'no-store, must-revalidate');
      headers.set('Pragma', 'no-cache');
      headers.set('Expires', '0');
      applySecurityHeaders(headers);
      return new Response(resp.body, { status: resp.status, headers });
    }
    const resp = await env.ASSETS.fetch(req);
    const ct = resp.headers.get('Content-Type') || '';
    if (ct.includes('text/html')) {
      const headers = new Headers(resp.headers);
      headers.set('Content-Type', 'text/html; charset=utf-8');
      headers.set('Cache-Control', 'no-store, must-revalidate');
      headers.set('Pragma', 'no-cache');
      headers.set('Expires', '0');
      applySecurityHeaders(headers);
      return new Response(resp.body, { status: resp.status, headers });
    }
    return resp;
  }
};
