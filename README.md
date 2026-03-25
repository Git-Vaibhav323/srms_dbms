# SRMS (Server Resource Management System)

A simple full-stack **Server Resource Management System** built with:

- **Frontend:** single-page UI in `index.html` (HTML/CSS/Vanilla JS)
- **Backend:** Node.js + Express (`server.js`)
- **Database:** MySQL (`setup.sql`)

The backend serves the frontend as static files and exposes REST APIs under `/api/*`.

---

## Project Structure

- `index.html` — frontend UI
- `server.js` — Express backend + API routes
- `setup.sql` — MySQL database schema (and sample data if included)
- `package.json` — backend dependencies and scripts

---

## Prerequisites

- **Node.js (LTS)**
- **MySQL Server 8.0.x**
- **MySQL Workbench 8.0.x** (to run `setup.sql` easily)

---

## 1) Database Setup (MySQL Workbench)

1. Install and start **MySQL Server**.
2. Open **MySQL Workbench** and connect to your local instance.
3. Open `setup.sql` from this project folder.
4. Execute the script.

This creates the database:

- `srms_db`

And tables:

- `USER`
- `USER_PHONE`
- `SERVER`
- `RESOURCE_ALLOCATION`
- `MAINTENANCE`

---

## 2) Backend Configuration

Open `server.js` and ensure your MySQL connection details are correct:

- `host`: `localhost`
- `user`: `root`
- `password`: your MySQL root password
- `database`: `srms_db`

---

## 3) Install Dependencies

Run these commands in the folder that contains `package.json`:

```bat
npm install
```

---

## 4) Run the Application

### Start backend (also serves frontend)

```bat
npm start
```

Then open:

- **App UI:** `http://localhost:3000/`
- **API test:** `http://localhost:3000/api/stats`

### Dev mode (auto-reload)

```bat
npm run dev
```

If `npm run dev` fails because `nodemon` is missing:

```bat
npm i -D nodemon
npm run dev
```

---

## Frontend ↔ Backend Connection

The frontend calls the backend using:

- `const API = 'http://localhost:3000/api';`

in `index.html`.

If you change the backend port, update this constant too.

---

## API Endpoints (Summary)

Base URL:

- `http://localhost:3000/api`

### Users

- `GET /users`
- `GET /users/:id`
- `POST /users`
- `PUT /users/:id`
- `DELETE /users/:id`

### Servers

- `GET /servers`
- `POST /servers`
- `PUT /servers/:id`
- `DELETE /servers/:id`

### Resource Allocations

- `GET /allocations`
- `POST /allocations`
- `PUT /allocations/:id`
- `DELETE /allocations/:id`

### Maintenance

- `GET /maintenance`
- `POST /maintenance`
- `PUT /maintenance/:id`
- `DELETE /maintenance/:id`

### Dashboard

- `GET /stats`

### SQL Query Runner (demo utility)

- `POST /query` with JSON body: `{ "sql": "..." }`

---

## Troubleshooting

### MySQL connection failed

- Ensure MySQL Server is running
- Verify the MySQL root password in `server.js`
- Confirm `setup.sql` ran successfully and `srms_db` exists

### Port 3000 already in use

- Stop the process using port 3000, or
- Change `PORT` in `server.js` and update the `API` constant in `index.html`

### UI opens but data doesn’t load

- Ensure backend is running (`npm start`)
- Test API in browser: `http://localhost:3000/api/stats`

---

## License

ISC (as per `package.json`).
