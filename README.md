# Sydney Events Aggregator (MERN)

A MERN platform that scrapes Sydney event listings, stores them in MongoDB, and provides a public listing UI plus an admin dashboard with Google OAuth.

## Features
- Scrapes Eventbrite, Meetup, and TimeOut (public pages only).
- Normalizes event data and auto-tags **new / updated / inactive / imported**.
- Public events UI with ticket modal (email + consent capture, then redirect).
- Admin dashboard with filters, table view, preview panel, and import action.
- Google OAuth login to access admin routes.

## Project Structure
```
full-stack assignment/
  backend/
  frontend/
```

## Environment Setup
Create a `backend/.env` file (do **not** commit it) based on `backend/.env.example`:
```
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
SESSION_SECRET=your_session_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
CLIENT_URL=http://localhost:5173
```

Frontend environment:
```
VITE_API_URL=http://localhost:5000
```

## Run Locally
Backend:
```
cd backend
npm install
npm run dev
```

Frontend:
```
cd frontend
npm install
npm run dev
```

## API Endpoints
Public:
- `GET /api/events`
- `POST /api/tickets`

Admin:
- `GET /api/admin/events`
- `POST /api/admin/events/:id/import`

Auth:
- `GET /auth/google`
- `GET /auth/google/callback`
- `GET /auth/logout`

## Notes
- The backend will not start without `MONGODB_URI`.
- Ensure your Google OAuth app has the callback URL set to `http://localhost:5000/auth/google/callback`.
