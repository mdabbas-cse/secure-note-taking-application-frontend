# Secure Notes (frontend)

A minimal React single-page app for the Secure Notes API: log in, register, manage
private notes, and (for admins) manage users and view users grouped by interest.
Styling is intentionally plain, with no UI library. All permissions are enforced by the
API, and the UI only hides what a user cannot use.

|                    |                                                                         |
| ------------------ | ----------------------------------------------------------------------- |
| Live app           | `https://<your-frontend-project>.vercel.app` (fill in after deployment) |
| API                | `https://<your-backend-project>.vercel.app/api`                         |
| Backend repository | `https://github.com/<your-account>/secure-notes-backend`                |

## Stack

React 19, TypeScript 6, Vite 8, React Router 7 (`BrowserRouter`), Axios, plain CSS.
Node.js 24.x.

## Screens

| Route              | Screen                                                   | Access    |
| ------------------ | -------------------------------------------------------- | --------- |
| `/login`           | Log in                                                   | guests    |
| `/register`        | Register                                                 | guests    |
| `/notes`           | Notes list (paginated, `?page=` in the URL)              | signed in |
| `/notes/new`       | Create note                                              | signed in |
| `/notes/:id/edit`  | Edit note                                                | owner     |
| `/admin/users`     | User management (create, change role, delete; paginated) | admin     |
| `/admin/interests` | Users grouped by interest (filter, paginated)            | admin     |

## Project structure

```
src/
├── api/          client.ts (axios instance, error messages), endpoints.ts, types.ts, useRemote.ts
├── auth/         AuthContext (current user kept in memory only), useAuth
├── components/   Layout + navigation, route guards, pagination controls
├── pages/        one component per screen
├── main.tsx, App.tsx (routes), styles.css
vercel.json       SPA fallback + security headers
vite.config.ts    dev proxy; production build requires VITE_API_BASE_URL
```

## How authentication works in the browser

- The API sets the JWT as an **HttpOnly cookie**. JavaScript never sees the token, and
  nothing is stored in `localStorage` or `sessionStorage`.
- Axios runs with `withCredentials: true`, so the browser sends the cookie to the API,
  including cross-origin to the API's own domain.
- Every request carries `X-Requested-With: XMLHttpRequest`. The API's CSRF guard requires
  this header on cookie-authenticated writes.
- On load, the app asks `GET /api/auth/me` who the user is. A `401` on any later request
  clears the session and redirects to `/login`.
- Admin navigation is hidden for normal users. The API enforces admin rights regardless.

## Local development

```bash
npm install
npm run dev        # http://localhost:5173
```

Run the backend locally on `http://localhost:4000` (see its README). The Vite dev server
proxies `/api` there, so the browser sees one origin and no extra configuration is needed.
To use another backend in development, set `VITE_API_PROXY_TARGET`.

Checks:

```bash
npm run typecheck
npm run lint
npm run format:check
VITE_API_BASE_URL=https://<your-backend-project>.vercel.app/api npm run build
```

## Environment variables

| Name                | Required          | Example                                         | Notes                                                                                                                                                                                                                          |
| ------------------- | ----------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `VITE_API_BASE_URL` | production builds | `https://<your-backend-project>.vercel.app/api` | API base URL including `/api`, no trailing slash. Must be `https://` or a same-origin path such as `/api`. The build **fails** if it is missing or points to localhost. In development it defaults to `/api` (the Vite proxy). |

Everything prefixed `VITE_` is compiled into the public JavaScript bundle. **Never put
secrets in frontend variables.** The JWT secret and database URI belong only to the backend.

`VITE_API_BASE_URL` is read at **build time**. After changing it in Vercel, redeploy.

## Deploying on Vercel

Deploy the backend first: its URL is needed here, and its `FRONTEND_URL` must contain
this app's origin.

1. Push this repository to GitHub as `secure-notes-frontend`.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Settings:
   - **Framework Preset:** Vite. It is detected automatically.
   - **Root Directory:** `./`
   - **Build Command:** `npm run build` (the default). It type-checks and then runs `vite build`.
   - **Output Directory:** `dist` (the default).
4. **Environment Variables** (Production; also Preview if you use previews):
   `VITE_API_BASE_URL = https://<your-backend-project>.vercel.app/api`
5. Click **Deploy**.
6. If the final frontend URL differs from the backend's `FRONTEND_URL`, update
   `FRONTEND_URL` in the **backend** project and redeploy the backend.

`vercel.json` adds the SPA fallback (`/(.*)` → `/index.html`). Vercel serves real files
first, so assets load normally, and every other path, such as a refresh on
`/notes/123/edit`, returns the app instead of a 404. It also sets `X-Content-Type-Options`,
`X-Frame-Options: DENY` (no clickjacking of the login form) and `Referrer-Policy`.

This was verified locally with Vercel CLI 65.14.0. `vercel build` detected the Vite
preset and emitted static output with filesystem-first routing, then the `index.html`
fallback and the headers above. The API URL was compiled into the bundle.

## Verifying a deployment

1. Open `https://<your-frontend-project>.vercel.app/login`, register, and confirm you
   land on `/notes`.
2. DevTools → Network: requests go to the backend URL, and the responses carry
   `Access-Control-Allow-Origin: https://<your-frontend-project>.vercel.app` and
   `Access-Control-Allow-Credentials: true`.
3. DevTools → Application → Cookies: `access_token` belongs to the **API** domain and is
   marked HttpOnly, Secure, SameSite=None and Partitioned.
4. Refresh on `/notes/new` and `/admin/users`. The page reloads instead of returning 404.
5. Log out, then open `/notes`. You are redirected to `/login`.

## Troubleshooting

| Symptom                                                            | Fix                                                                                                                                                                                            |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Build fails: `VITE_API_BASE_URL is required for production builds` | Add the variable in Vercel Project Settings → Environment Variables, then redeploy.                                                                                                            |
| "Cannot reach the server" on every action                          | Wrong `VITE_API_BASE_URL`, the backend is down (check `/api/health`), or CORS rejected the request: the backend's `FRONTEND_URL` must be exactly this origin.                                  |
| Login succeeds, then you are sent back to `/login`                 | The browser dropped the API's cross-site cookie. That happens in older Safari (before 26.2) and with some privacy settings. See the backend README, "Browsers that block third-party cookies". |
| 404 when refreshing a deep link                                    | `vercel.json` is missing from the deployed commit.                                                                                                                                             |
| Changed `VITE_API_BASE_URL` but nothing changed                    | It is compiled in at build time. Redeploy.                                                                                                                                                     |
