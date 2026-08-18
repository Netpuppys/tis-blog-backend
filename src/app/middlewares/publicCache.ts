import type { NextFunction, Request, Response } from 'express';

/**
 * Adds CDN cache headers to PUBLIC, read-only GET endpoints.
 *
 * Why: every blog page view was invoking a serverless function, booting
 * Express and opening a Prisma connection to return content that changes
 * maybe weekly. With these headers Vercel's CDN serves repeat requests
 * without invoking the function at all.
 *
 * SAFETY RULES -- read before applying this to a new route:
 *
 *  1. Only ever attach this to endpoints whose response is IDENTICAL for
 *     every visitor. A shared CDN cache will serve one user's response to
 *     the next user. Never put it on anything that reads a session, a
 *     cookie, or an Authorization header.
 *  2. It is applied per-route on purpose, not globally, so adding a new
 *     authenticated endpoint can never accidentally inherit caching.
 *  3. It refuses to act on anything that is not a GET.
 *  4. It refuses to act when an Authorization header is present.
 *  5. Only successful (2xx/3xx) responses are cached. Errors and 404s are
 *     explicitly marked no-store so a transient failure cannot be pinned
 *     in the CDN.
 *
 * @param sMaxAge seconds the CDN may serve the response as fresh
 * @param staleWhileRevalidate seconds it may serve stale content while it
 *        refetches in the background
 */
export const publicCache =
  (sMaxAge = 60, staleWhileRevalidate = 300) =>
  (req: Request, res: Response, next: NextFunction): void => {
    // Rule 3 + 4: never cache non-GET or credentialed requests.
    if (req.method !== 'GET' || req.headers.authorization) {
      res.setHeader('Cache-Control', 'no-store');
      return next();
    }

    // Rule 5: decide at send time, once the status code is known.
    const originalJson = res.json.bind(res);
    res.json = (body: unknown) => {
      if (res.statusCode >= 200 && res.statusCode < 400) {
        res.setHeader(
          'Cache-Control',
          `public, s-maxage=${sMaxAge}, stale-while-revalidate=${staleWhileRevalidate}`
        );
      } else {
        res.setHeader('Cache-Control', 'no-store');
      }
      return originalJson(body);
    };

    next();
  };

export default publicCache;
