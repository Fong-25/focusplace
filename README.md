# FocusPlace

[**Preview or test it out now → **](https://letslearntogether.onrender.com/)

A full-stack, real-time productivity app for collaborative focus sessions, inspired by the Pomodoro technique. Users can create or join rooms, chat, and synchronize timers for focused work and breaks.

## Features

- **Authentication**: Sign up, log in, and log out securely (JWT, cookies).
- **Lobby**: Join or create rooms with unique IDs.
- **Room Settings** (scalable, allow custom setting now in v1.1):
  - Strict Mode (host controls timer)
  - Auto Phase Change
  - Focus/Break durations
  - Custom phase names
- **Real-time Collaboration**: Chat, timer sync, and user presence via Socket.IO.
- **Theming**: Customizable UI themes.
- **Responsive UI**: Modern, mobile-friendly React + Tailwind CSS frontend.

## Tech Stack

- **Frontend**: React, Vite, Zustand, Tailwind CSS, React Router, Socket.IO-client
- **Backend**: Node.js, Express, Socket.IO, PostgreSQL, JWT, bcrypt
- **Database**: PostgreSQL (users, sessions)

## Room Settings (Current Version)

- All settings are customizable
- Default values:
  - Focus: 25 min, Break: 5 min
  - Strict Mode: true, Auto Phase Change: true
  - Phase Names: "Focus" / "Break"

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm
- PostgreSQL database

### Installation

1. **Clone the repo:**
   ```sh
   git clone https://github.com/Fong-25/focusplace.git
   cd focusplace
   ```
2. **Install dependencies:**
   ```sh
   npm run install:all
   ```
3. **Configure environment variables:**
   - Create `.env` in `backend/` and set:
     - `DB_STRING` (PostgreSQL connection string)
     - `JWT_SECRET`
     - `NODE_ENV`
   - Create `.env` in `frontend/` and set:
     - `VITE_API_URL=http://localhost:3000`

4. **Database setup:**
   - Create a `users` table (see backend/services/user.service.js for schema)

5. **Run the app:**
   - **Development:**
     ```sh
     # In one terminal (backend)
     cd backend && node index.js
     # In another terminal (frontend)
     cd frontend && npm run dev
     ```
   - **Production build:**
     ```sh
     npm run build
     npm start
     ```

## Scripts

- `npm run install:all` – Install frontend & backend dependencies
- `npm run build` – Build frontend for production
- `npm start` – Start backend server (serves frontend in production)

## API Endpoints

### Auth
- `POST /api/auth/signup` – Register
- `POST /api/auth/login` – Login
- `POST /api/auth/logout` – Logout
- `GET /api/auth/verify` – Verify session

### Rooms
- `GET /api/rooms/default-settings` – Get default room settings

### WebSocket Events
- `createRoom`, `joinRoom`, `sendMessage`, `startTimer`, `pauseTimer`, `resetTimer`, etc.

## Folder Structure

- `frontend/` – React app (see `src/` for main code)
- `backend/` – Express API, Socket.IO, DB models/services

## License

ISC. See [LICENSE](LICENSE).

---
