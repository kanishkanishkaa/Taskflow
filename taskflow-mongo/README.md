# TaskFlow (MongoDB Edition)

This is your TaskFlow project, rebuilt to use **MongoDB** (via MongoDB Atlas)
instead of MySQL. All features are preserved:

- Admin / Team Lead / User roles
- Teams (admin creates teams, assigns a team lead, groups members)
- Admin can only assign tasks to a team lead; team leads can only assign
  tasks to members of their own team
- Task file/document/photo uploads
- Comments, notifications, dashboard stats & reports

## 1. Set up MongoDB Atlas (free, no install needed)

1. Go to https://www.mongodb.com/cloud/atlas and sign up (free)
2. Click **Build a Database** → choose **Free (M0 Shared)** → pick a region close to you → Create
3. Create a database user (**Security → Database Access**) — remember the username/password
4. Allow your IP (**Security → Network Access**) — for simplicity you can choose
   "Allow access from anywhere" (0.0.0.0/0) for a college project
5. Click **Connect → Drivers → Node.js**, copy the connection string
   (looks like `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/`)

## 2. Backend setup

```powershell
cd backend
npm install
copy .env.example .env
```

Open `.env` and fill in:
- `MONGO_URI` — your Atlas connection string from step 1. Add your database
  name right after `.net/`, e.g.:
  `mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/taskflow_db?retryWrites=true&w=majority`
- `JWT_SECRET` — any long random string

Then start it:
```powershell
npm start
```
You should see:
```
✅ MongoDB connected successfully
🚀 TaskFlow API server running on http://localhost:5000
```

**No schema import step is needed** — unlike MySQL, MongoDB creates
collections automatically the first time data is saved to them.

## 3. Frontend setup

```powershell
cd frontend
npm install
copy .env.example .env
npm start
```
This opens `http://localhost:3000` automatically.

## 4. First-time use

1. Register an account at `/register`
2. New accounts start as regular **users**. To make yourself admin, use
   MongoDB Atlas's web UI:
   - Go to your cluster → **Browse Collections** → `taskflow_db` → `users`
   - Find your user document → Edit → change `"role": "user"` to `"role": "admin"`
   - Log out and back in in the app

## What changed from the MySQL version

- `backend/config/db.js` now connects with Mongoose instead of `mysql2`
- Every controller was rewritten to use Mongoose queries instead of SQL
- IDs are MongoDB ObjectIds (strings like `64f1a2b3c4d5e6f7a8b9c0d1`) instead
  of auto-increment integers — the frontend already works with these as
  opaque string values, so no frontend changes were needed for this
- There are no foreign key constraints or JOINs — relationships (e.g. a
  task's assigned user, a team's members) are resolved in the controller
  code instead
- The `frontend/` folder is unchanged in structure — it talks to the same
  REST API endpoints (`/api/auth`, `/api/tasks`, `/api/teams`, etc.), so it
  doesn't know or care which database is behind the API
