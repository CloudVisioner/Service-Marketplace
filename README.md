# Nestar — B2B Service Marketplace for SMEs

A B2B service marketplace platform connecting small and medium-sized enterprises, built as a NestJS monorepo with GraphQL, real-time features, and AI-assisted functionality.

## Features

- GraphQL API (Apollo Server)
- JWT-based authentication
- Real-time communication via WebSockets
- Scheduled background jobs (separate batch service)
- AI-assisted features via Chatbase AI
- MongoDB data layer

## Architecture

This is a monorepo with two NestJS applications:

- **`nestar-api`** — main GraphQL API serving the marketplace
- **`nestar-batch`** — scheduled/background job runner

## Tech stack

- **Backend:** NestJS, GraphQL (Apollo), TypeScript
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT, bcrypt
- **Real-time:** WebSockets (ws, Socket.io)
- **AI:** Chatbase AI
- **Testing:** Jest

## Setup

```bash
npm install

# run API
npm run start:dev

# run batch service
npm run start:dev:batch
```

Requires a `.env` with MongoDB connection string, JWT secret, and Google Generative AI API key.

## Build

```bash
npm run build
```

Builds both `nestar-api` and `nestar-batch`.

## Testing

```bash
npm run test
npm run test:e2e
npm run test:cov
```
