# Deploy

This project has a Vite frontend and an Express backend.

## Frontend: GitHub Pages

1. Push this repository to GitHub.
2. In GitHub, open `Settings -> Pages`.
3. Set `Source` to `GitHub Actions`.
4. In `Settings -> Secrets and variables -> Actions`, add:
   - `VITE_API_BASE_URL`: your backend URL ending with `/api`

Example:

```text
https://your-aiyouhua-api.example.com/api
```

After pushing to `main`, `.github/workflows/deploy-frontend.yml` builds `frontend` and deploys it to GitHub Pages.

## Backend: Node host

GitHub Pages cannot run the Express backend. Deploy `backend` to a Node host such as Render, Railway, Fly.io, or a VPS.

Backend environment variables:

```text
SUPABASE_URL=...
SUPABASE_SERVICE_KEY=...
JWT_SECRET=...
JWT_EXPIRES_IN=7d
PORT=3001
CORS_ORIGIN=http://localhost:5174,https://YOUR_GITHUB_USERNAME.github.io
```

If your GitHub Pages URL is `https://YOUR_GITHUB_USERNAME.github.io/AIYOUHUA/`, put this in the backend:

```text
CORS_ORIGIN=https://YOUR_GITHUB_USERNAME.github.io
```

Then set the frontend GitHub secret:

```text
VITE_API_BASE_URL=https://YOUR_BACKEND_DOMAIN/api
```
