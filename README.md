# Wedding Journal

A static wedding planning reference site maintained for personal use.

## Hosting

The site is published from the root of the `main` branch using GitHub Pages. The `.nojekyll` file disables Jekyll processing. No build step or deployment workflow is required.

For local use:

```bash
python3 -m http.server 8100
```

Then open `http://localhost:8100`.

## Search-engine settings and privacy

The HTML page includes `noindex`, `nofollow`, `noarchive`, `nosnippet`, and `noimageindex` directives for compliant search crawlers, plus `max-image-preview:none`. It also requests `no-referrer` and omits canonical/social-sharing metadata.

**This is not an access restriction.** GitHub Pages and this public repository, including photographs and data files, remain accessible to anyone with a link and could appear through other sites, caches or noncompliant crawlers. For genuinely restricted access, move the site to a host offering authentication and make the repository private.

A `robots.txt` file under the project's `/wedding/` path would not be the host-root robots file, and disallowing crawlers can prevent them from seeing `noindex`. We therefore use page-level indexing directives instead. GitHub Pages does not let this project set HTTP `X-Robots-Tag` headers for assets.

## Features

Venue discovery, photo galleries, comparisons, map, pricing estimates, a photographer directory and personal planning notes. Notes, quotations and saved selections are stored in the browser's `localStorage` only; they do not synchronize across devices or upload to this repository. Export your notes to keep a separate backup.

## Images

Venue and photographer photos and other referenced material are retained for planning research. Rights remain with their respective creators; public redistribution may require permission.
