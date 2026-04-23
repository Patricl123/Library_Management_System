# Library Management System

A beginner-friendly full-stack Library Management System built with:

- React + Vite on the frontend
- Node.js + Express on the backend
- MongoDB + Mongoose for the database
- JWT for authentication

## Folder Structure

```text
.
|-- client
|   |-- .env.example
|   |-- package.json
|   |-- vite.config.js
|   |-- index.html
|   `-- src
|       |-- api
|       |-- components
|       |-- context
|       |-- pages
|       `-- styles
|-- server
|   |-- .env.example
|   |-- package.json
|   |-- app.js
|   |-- server.js
|   |-- config
|   |-- controllers
|   |-- middleware
|   |-- models
|   |-- routes
|   |-- seed
|   `-- utils
`-- README.md
```

## Features

- JWT authentication with register and login
- Role-based access for `admin` and `user`
- Book CRUD APIs
- Search and filter books
- Borrow request, approve, reject, and return flows
- Protected frontend routes
- Admin dashboard for books, users, and borrow approvals
- Review system for books
- Responsive UI with clean cards, navbar, and status badges

## Backend Setup

1. Open a terminal in the `server` folder.
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in `server` using the example below:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/library-management-system
JWT_SECRET=replace_this_with_a_long_random_secret
```

4. Start the backend:

```bash
npm run dev
```

The API will run at `http://localhost:5000`.

## Frontend Setup

1. Open a second terminal in the `client` folder.
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in `client` using:

```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the frontend:

```bash
npm run dev
```

The client will usually run at `http://localhost:5173`.

## MongoDB Connection

You can use either a local MongoDB server or MongoDB Atlas.

### Option 1: Local MongoDB

Use this in `server/.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/library-management-system
```

Make sure your local MongoDB service is running before starting the backend.

### Option 2: MongoDB Atlas

Use your Atlas connection string, for example:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/library-management-system?retryWrites=true&w=majority
```

Replace `<username>` and `<password>` with your real Atlas credentials.

## Seed Sample Data

The backend includes a simple seed script that creates:

- 1 admin user
- 1 normal user
- 3 sample books

Run it from the `server` folder:

```bash
npm run seed
```

Seeded login accounts:

- Admin: `admin@example.com` / `admin123`
- User: `user@example.com` / `user123`

## Important Notes

- Public registration always creates a normal `user` account for safety.
- Admin accounts should be created manually or through the seed script.
- The borrow model includes a practical `rejected` status so admins can reject requests cleanly.

## Main API Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Books

- `GET /api/books`
- `GET /api/books/:id`
- `POST /api/books` `admin only`
- `PUT /api/books/:id` `admin only`
- `DELETE /api/books/:id` `admin only`
- `POST /api/books/:id/reviews`

### Users

- `GET /api/users` `admin only`
- `GET /api/users/:id` `admin only`

### Borrow

- `POST /api/borrow`
- `GET /api/borrow/mine`
- `GET /api/borrow` `admin only`
- `PATCH /api/borrow/:id/approve` `admin only`
- `PATCH /api/borrow/:id/reject` `admin only`
- `PATCH /api/borrow/:id/return`

## Suggested Next Improvements

- Add pagination to books and borrow requests
- Add due dates and overdue fines
- Upload book cover images
- Add tests for routes and frontend pages
- Prevent duplicate pending requests globally when a title is already reserved
