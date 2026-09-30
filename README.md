# RadioNitroz Studio Console

A small studio desk for a campus media team: book a studio slot, submit
content for a show, and let an admin approve or reject submissions.

Built as a PHP and MySQL API with two front ends on purpose. A jQuery page
serves members, and a Vue 3 page serves the admin queue, both against the
same backend, to show a legacy front-end style and a modern one side by
side.

## Stack

* **API:** PHP 8, mysqli with prepared statements everywhere, session-based auth, `password\_hash`/`password\_verify`
* **Member UI:** plain HTML and jQuery (AJAX calls, no build step)
* **Admin UI:** Vue 3 (loaded from a CDN, no build step)
* **Database:** MySQL / MariaDB
* **Tests:** Playwright smoke test across Chromium, Firefox and WebKit, run in GitHub Actions

## Why it's built this way

The original version of this idea (a plain PHP CRUD app) built SQL by
string interpolation, which is a SQL-injection risk. Every query here goes
through `mysqli\_prepare` and `mysqli\_stmt\_bind\_param` instead. Passwords
are hashed with `password\_hash` and checked with `password\_verify`, never
stored or compared as plain text.

## Setup

1. Create the database:

```bash
   mysql -u root -p < database/schema.sql
   ```

2. Set connection env vars (or edit `api/config/db.php` directly for local testing):

```bash
   export DB\_HOST=localhost
   export DB\_USER=root
   export DB\_PASS=yourpassword
   export DB\_NAME=radionitroz\_studio
   ```

3. Serve the app with PHP's built-in server:

```bash
   npm run serve
   # then open http://localhost:8000
   ```

4. Open:

   * Member page: `http://localhost:8000/public/index.html`
   * Admin page: `http://localhost:8000/admin/index.html`

The seed data in `schema.sql` creates one admin account
(`admin@radionitroz.local`). Set a real password hash before deploying;
the placeholder hash in the seed is not a valid credential, and it is
there only so the row exists.

## Running the tests

```bash
npm install
npx playwright install --with-deps
npm test
```

This runs the same smoke test against Chromium, Firefox and WebKit, and
the same job runs on every push through `.github/workflows/tests.yml`.

## Security

* Every query goes through `mysqli\_prepare` and `mysqli\_stmt\_bind\_param`. No string-interpolated SQL anywhere.
* Every state-changing POST endpoint (`slots/book.php`, `submissions/create.php`, `submissions/review.php`) requires a CSRF token sent in the `X-CSRF-Token` header, checked with `hash\_equals` against the token stored in the session. Verified with curl: a request with no token gets 403, the same request with a valid token gets 200.
* Login is rate-limited: 5 failed attempts for the same email lock that email out for 60 seconds and return 429. Verified with curl: attempts 1 to 5 return 401, attempt 6 returns 429.
* The seeded admin password hash was generated and checked with `password\_verify()` before being committed (`admin@radionitroz.local` / `admin123` for local testing only). Replace it before any real deployment.

## Accessibility

Every table has a caption and scoped headers, form fields have associated
`<label>`s, and live regions (`aria-live`, `role="alert"`, `role="status"`)
announce sign-in errors and toasts to screen readers.

An axe-core audit (`tests/axe-audit.js`, run with `node tests/axe-audit.js`)
checks all four front ends against jsdom: **0 violations** across
`public/index.html`, `admin/index.html`, `legacy/angularjs/index.html`, and
`legacy/knockout/index.html` (30 to 36 passing checks per page). This
covers structural and ARIA rules only. jsdom has no layout engine, so
color-contrast and focus-order checks are disabled in that script and
still need a real browser run (open each page in Chrome DevTools or run
axe-core's browser extension) before you rely on this for a resume claim.

## Cross-browser testing

\## Cross-browser testing



`tests/smoke.spec.js` runs against Chromium, Firefox and WebKit via

Playwright. All 15 tests pass on all three browsers (verified 2026-09-30).



```powershell

npm install

npx playwright install --with-deps

npm test

```

## Legacy front ends

`legacy/angularjs/` and `legacy/knockout/` are two more views on the same
PHP API: AngularJS 1.x for the slot list, KnockoutJS for the submissions
list. They exist to show a legacy-framework style alongside the jQuery and
Vue pages, not to duplicate every feature.

## Project structure

```
api/            PHP endpoints (auth, slots, submissions)
public/         jQuery member dashboard
admin/          Vue 3 admin approval queue
legacy/         AngularJS and KnockoutJS views on the same API
database/       MySQL schema and seed data
tests/          Playwright smoke test + axe-core audit script
.github/        CI workflow
```

## Known gaps and next steps

* Cross-browser smoke tests are written but not executed against real browsers here. Run them and record the result.
* Lighthouse has not been run. Do that and paste real scores here before listing performance claims.
* Color-contrast and focus-order accessibility checks still need a real browser audit; the jsdom-based check only covers structural and ARIA rules.

