# Just Pick 3 – Agile Planning Poker

Just Pick 3 is a minimalist agile planning poker app for quick, consensus-driven estimation. It features real-time collaboration, moderator controls, and supports both numeric and symbolic votes (e.g., `?`, ☕).

---

![alt text](https://github.com/LaurenCoker512/point-poker/raw/master/images/landing.png "Landing Page")

![alt text](https://github.com/LaurenCoker512/point-poker/raw/master/images/voting.png "Voting")

---

## Features

- Create or join estimation boards
- Real-time participant updates and voting (via WebSockets)
- Moderator controls: reveal/reset votes, manage session
- Supports numeric and symbolic votes (e.g., `?`, ☕)
- Dark mode support
- Persistent user sessions via localStorage

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [PostgreSQL](https://www.postgresql.org/) (for backend database)

---

## Setup Instructions

### 1. Clone the repository

```sh
git clone https://github.com/LaurenCoker512/point-poker.git
cd point-poker
```

---

### 2. Backend Setup

#### a. Install dependencies

```sh
cd backend
npm install
```

#### b. Configure environment variables

Copy `.env.example` to `.env` and update the values as needed (especially `DATABASE_URL` for your PostgreSQL instance):

```sh
cp .env.example .env
```

#### c. Set up the database

Run Prisma migrations to set up your database schema:

```sh
npx prisma migrate dev
```

#### d. Start the backend server

```sh
npm run start:dev
```

The backend will start on [http://localhost:3005](http://localhost:3005) by default.

---

### 3. Frontend Setup

#### a. Install dependencies

```sh
cd ../frontend
npm install
```

#### b. Configure environment variables

Copy `.env` or `.env.example` to `.env.local` and ensure the backend URL is correct:

```sh
cp .env.example .env.local
```

Example contents for `.env.local`:

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:3005
```

#### c. Start the frontend server

```sh
npm run dev
```

The frontend will start on [http://localhost:3000](http://localhost:3000) by default.

---

## Usage

- **Create a board:** Enter your name and click "Create Board". You will become the moderator.
- **Invite teammates:** Share the board URL.
- **Join a board:** Enter your name to join as a participant.
- **Vote:** Select a point value or symbol. Moderator can reveal/reset votes.

---

## Project Structure

```
.
├── backend/   # NestJS backend (API, WebSocket, Prisma)
├── frontend/  # Next.js frontend (UI, Socket.IO client)
├── .gitignore
├── .README.md
└── ...
```

- `backend/prisma/` – Prisma schema and migrations
- `backend/src/` – NestJS source code
- `frontend/src/app/` – Next.js app directory
- `frontend/src/app/components/` – React components
- `frontend/src/app/board/[id]/` – Board page and logic

---

## Development Notes

- The app uses Socket.IO for real-time updates.
- User and moderator status are persisted in localStorage per board.
- Votes can be numbers or symbols (e.g., `"?"`, `"☕"`).
- Make sure both frontend and backend servers are running for full functionality.

---

## Troubleshooting

- Ensure the backend is running and accessible at the URL specified in `frontend/.env.local`.
- If you see WebSocket connection errors, check backend port and CORS settings.
- For database issues, verify your PostgreSQL connection and run migrations.

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)

---

© 2025 Just Pick 3. All rights reserved.
