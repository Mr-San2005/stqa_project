# Examspace frontend

React and Vite frontend for the Online Examination System.

## Run locally

1. Configure MongoDB and the backend environment in `backend/.env` (`MONGO_URI`,
   `JWT_SECRET`, and optionally `PORT`). Keep that file private.
2. In one terminal, start the API:

   ```powershell
   cd E:\STQA\backend
   npm install
   npm run dev
   ```

3. In another terminal, start the frontend:

   ```powershell
   cd E:\STQA\frontend
   npm install
   npm run dev
   ```

4. Open the local address printed by Vite (normally
   `http://localhost:5173`). The frontend expects the API at
   `http://localhost:5000/api` by default. To use another API URL, set
   `VITE_API_URL` before starting Vite, for example:

   ```powershell
   $env:VITE_API_URL = 'http://localhost:5000/api'
   npm run dev
   ```

New accounts are registered as students and signed in automatically. Admin
accounts must be provisioned by a trusted project administrator; do not expose
an admin-role choice in public registration. For a local lab demo without an
existing admin, register a normal account, update that account's `role` field
to `admin` in the MongoDB `users` collection using MongoDB Compass, then sign
out and sign in again so the new session receives the admin role.

Students can browse available exams, answer multiple-choice questions, submit
their answers, see their answer progress, and view a result after submission.
Submitted exams are marked complete and cannot be started again. Admins can
create exams, add four-option questions, and review student scores from the
dashboard. Protected API requests use the signed-in user's bearer token.

## Demo data and tests

After creating an admin account as described above, load two sample exams and
their questions:

```powershell
cd E:\STQA\backend
npm run seed:demo
```

The backend test suite creates and removes its own test records. Set
`MONGO_URI` and `JWT_SECRET` in `backend/.env`, then run:

```powershell
cd E:\STQA\backend
npm run test:all
```

GitHub Actions runs the backend tests and frontend checks on each push and pull
request. The Jest JSON report is uploaded as the `backend-test-report` workflow
artifact, including when tests fail.

## Checks

```powershell
npm run lint
npm run build
```
