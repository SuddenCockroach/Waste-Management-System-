# Waste Management Backend

Node.js + Express backend for waste management system with role-based auth.

## Features
- User authentication with JWT
- Role-based access (user, driver, admin)
- MySQL integration
- Driver collection status endpoints

## Tech Stack
- Node.js
- Express
- MySQL2
- Bcrypt
- JSONWebToken
- Dotenv
- Cors

## Setup
1. Clone repo
2. npm install
3. Copy .env.example to .env and fill values
4. Run database.sql in MySQL
5. npm start

## API Endpoints
- GET / : "Waste Management API is running!"
- POST /api/auth/login : {email, password} → token & user
- PATCH /collections/:id : Update status (driver only)
- GET /collections : Get statuses (driver only)

