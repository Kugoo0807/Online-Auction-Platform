# 1. Title & Tech Stack Badges

## Online Auction Platform

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![REST API](https://img.shields.io/badge/REST%20API-02569B?style=for-the-badge&logo=fastapi&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)

# 2. Project Overview

Online Auction Platform is a full-stack web application that implements an online bidding system where users can register accounts, create auction listings, place bids, and manage transactions.  
The platform supports automated bidding logic, category-based product management, secure user authentication, and email notification services. Auction updates are synchronized using client-side polling to periodically fetch the latest bid information.

# 3. Architecture & Design Patterns

The backend follows a **Controller-Service-Repository** architecture:

- **Controllers** handle HTTP input/output and request validation boundaries.
- **Services** encapsulate core domain logic (bidding rules, auction state transitions, user workflows).
- **Repositories** isolate persistence and data access concerns for MongoDB operations.

This layered structure separates HTTP handling, domain logic, and persistence concerns. 

# 4. Core Features

- **Concurrency & Auto-Bidding:** Implements bid progression logic with increment validation, controlled bidder updates, and conflict-safe handling for competing bids on the same auction lot.
- **Scheduled Cron Jobs:** Uses scheduled workers to close auctions and finalize outcomes, with **MongoDB transactions** to guarantee atomic multi-document updates and prevent partial result states.
- **Authentication & Security:** Supports JWT-based Access/Refresh token flows, OTP-based 2-step email registration, and HTML sanitization for XSS mitigation on user-generated content.
- **Media Management:** Integrates Cloudinary for image upload/storage pipelines used in auction product listings.

# 5. Project Structure

```text
Online-Auction-Platform/
├── backend/                     # Node.js + Express API server
│   ├── config/                  # App configuration (Cloudinary, Passport, system settings)
│   ├── controllers/             # HTTP controllers (request/response layer)
│   ├── data/                    # Backend runtime data
│   ├── middleware/              # Auth, validation, logging, sanitization middleware
│   ├── repositories/            # Data access layer (MongoDB queries)
│   ├── routes/                  # API route declarations
│   ├── services/                # Business logic and orchestration layer
│   └── utils/                   # Utility helpers
├── db/                          # Database bootstrap, schema, seed, and migration scripts
│   ├── connect.js               # MongoDB connection setup
│   ├── db.helper.js             # Database helper utilities
│   ├── query.js                 # Query utilities
│   ├── schema.js                # Schema initialization script
│   ├── seed.js                  # Seed data script
│   ├── updates.js               # Data update scripts
│   └── data/seeds/              # Seed resources
├── design/wireframe/            # UI wireframes by role
├── docs/                        # API specification documents
└── frontend/                    # React + Vite client application
    ├── public/                  # Static public assets
    └── src/                     # Frontend source code
```

# 6. Getting Started (Installation & Setup)

## Prerequisites

- Node.js 18+
- npm
- MongoDB 6+

## Important: MongoDB Replica Set Requirement (Local Development)

This project uses Mongoose transactions for auction/result consistency. **MongoDB transactions require a Replica Set**. If you are running MongoDB locally, Replica Set mode is mandatory.

- **MongoDB Atlas:** Supported out of the box.
- **MongoDB Local:** Start MongoDB with Replica Set enabled (for example: `mongod --replSet rs0`).
- Then initialize the Replica Set once (for example via Mongo shell: `rs.initiate()`).

## Installation

1. Clone the repository

```bash
git clone https://github.com/Kugoo0807/Online-Auction-Platform
cd Online-Auction-Platform
```

2. Configure backend

```bash
cd backend
npm install
```

Create `.env` from `sample.env` and populate all required variables.

3. Configure database scripts

```bash
cd ../db
npm install
```

Create `.env` from `sample.env`, then initialize schema and seed data:

```bash
node schema.js
node seed.js
```

4. Configure frontend

```bash
cd ../frontend
npm install
```

Create `.env` from `sample.env` and populate frontend environment variables.

## Run the Application

Terminal 1 (Backend):

```bash
cd backend
npm start
```

Terminal 2 (Frontend):

```bash
cd frontend
npm run dev
```

Default local endpoints:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`
