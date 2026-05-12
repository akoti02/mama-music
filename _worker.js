// Static asset server with no-cache HTML so users get the latest version
// the moment we push. /lovers and /dj are guest entrypoints — they serve the
// same index.html with a hard guest-lock cookie that survives reloads and
// prevents the device from ever being routed to the owner-facing portal.
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
function applyHtmlHeaders(headers) {
  headers.set('Content-Type', 'text/html; charset=utf-8');
  // `private` forbids ANY shared cache (Cloudflare CDN included) from
  // storing the response — without it, CF edge can HIT a cached copy and
  // skip the worker entirely, breaking cookie-aware redirects.
  headers.set('Cache-Control', 'private, no-store, no-cache, must-revalidate, max-age=0');
  headers.set('Pragma', 'no-cache');
  headers.set('Expires', '0');
  applySecurityHeaders(headers);
}
function readGuestLock(req) {
  const cookie = req.headers.get('Cookie') || '';
  const m = cookie.match(/(?:^|;\s*)mm_guest_lock=([A-Z]+)/);
  if (!m) return null;
  const v = m[1];
  return (v === 'LOVERS' || v === 'DJ') ? v : null;
}
function setGuestLockCookie(headers, portal) {
  // 1-year persistent cookie. SameSite=Lax so the redirect path drives it,
  // not third-party-iframe contexts. Secure because we always run on HTTPS.
  headers.append('Set-Cookie', `mm_guest_lock=${portal}; Path=/; Max-Age=31536000; Secure; SameSite=Lax`);
}
function clearGuestLockCookie(headers) {
  headers.append('Set-Cookie', `mm_guest_lock=; Path=/; Max-Age=0; Secure; SameSite=Lax`);
}
export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const p = url.pathname;
    const lock = readGuestLock(req);

    // Admin override — explicit URL hatch to clear the lock so an owner who
    // accidentally visited /lovers (e.g. while testing) can re-claim the
    // owner view from the same device. Visit /?clear_lock=1.
    if (url.searchParams.get('clear_lock') === '1') {
      const headers = new Headers();
      clearGuestLockCookie(headers);
      applyHtmlHeaders(headers);
      // Tiny HTML that bounces back to / after the cookie is cleared.
      return new Response(
        '<!doctype html><meta charset="utf-8"><script>location.replace("/")</script>Очищено…',
        { status: 200, headers }
      );
    }

    // Guest-entry paths: serve the SPA AND stamp the lock cookie so any
    // subsequent visit to "/" (or akoev.com directly) from this device is
    // routed straight back to the guest portal. The cookie is the strongest
    // barrier because it survives localStorage wipes, Safari ITP, private
    // mode resets, etc.
    if (p === '/lovers' || p === '/lovers.html') {
      const indexReq = new Request(new URL('/', req.url), req);
      const resp = await env.ASSETS.fetch(indexReq);
      const headers = new Headers(resp.headers);
      applyHtmlHeaders(headers);
      setGuestLockCookie(headers, 'LOVERS');
      return new Response(resp.body, { status: resp.status, headers });
    }
    if (p === '/dj' || p === '/dj.html') {
      const indexReq = new Request(new URL('/', req.url), req);
      const resp = await env.ASSETS.fetch(indexReq);
      const headers = new Headers(resp.headers);
      applyHtmlHeaders(headers);
      setGuestLockCookie(headers, 'DJ');
      return new Response(resp.body, { status: resp.status, headers });
    }

    // Any owner-scoped HTML request from a guest-locked device gets bounced
    // back to the guest portal. 302 keeps the URL clean in the address bar.
    // Static assets (CSS / JS / images) pass through unchanged so the SPA
    // boots correctly on the guest path.
    if (lock && (p === '/' || p === '/index.html')) {
      const portal = lock === 'DJ' ? '/dj' : '/lovers';
      const headers = new Headers();
      headers.set('Location', portal);
      headers.set('Cache-Control', 'no-store');
      return new Response(null, { status: 302, headers });
    }

    const resp = await env.ASSETS.fetch(req);
    const ct = resp.headers.get('Content-Type') || '';
    if (ct.includes('text/html')) {
      const headers = new Headers(resp.headers);
      applyHtmlHeaders(headers);
      return new Response(resp.body, { status: resp.status, headers });
    }
    return resp;
  }
};
