# IAM Service

A modern Identity and Access Management (IAM) service built with ElysiaJS, Better Auth, PostgreSQL, and Drizzle ORM.

This service provides centralized authentication, authorization, OAuth account linking, RBAC, OpenID Connect compatibility, and multi-application identity management.

---

# Features

## Authentication
- Email & password authentication
- OAuth login providers
- Refresh token rotation
- Session management
- Password reset flow
- Email verification
- Account linking

---

## Authorization
- Role-Based Access Control (RBAC)
- Permission management
- Scoped application access
- Temporary role assignment with expiration
- Service-to-service authorization

---

## OAuth & OIDC
- OAuth2 authorization flows
- OpenID Connect support
- JWKS endpoint
- PKCE support
- Token introspection
- Token revocation

---

## Multi-Application Support
- Multiple frontend applications
- OAuth clients
- Client credentials flow
- Redirect URI management
- Service accounts

---

## Security
- Argon2 password hashing
- JWT signing with JOSE
- RS256/EdDSA support
- Refresh token rotation
- Audit logging
- Rate limiting
- Secure OAuth flows

---

# Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Bun |
| Framework | ElysiaJS |
| Authentication | Better Auth |
| ORM | Drizzle ORM |
| Database | PostgreSQL |
| Validation | Zod |
| JWT/OIDC | JOSE |
| Queue | BullMQ |
| Cache | Redis |
| Logging | Pino |

---

# Architecture

This project follows a modular monolith architecture.

```text
src/
├── config/
├── core/
├── infrastructure/
├── modules/
├── plugins/
├── routes/
├── jobs/
└── index.ts
```

Each module is self-contained and responsible for a specific domain.

Example:

```text
modules/auth/
├── auth.controller.ts
├── auth.service.ts
├── auth.repository.ts
├── auth.routes.ts
├── auth.schema.ts
└── auth.types.ts
```

---

# Project Structure

```text
src/
├── index.ts
├── app.ts

├── config/
│   ├── env.ts
│   ├── auth.ts
│   ├── database.ts
│   └── oauth.ts

├── core/
│   ├── constants/
│   ├── errors/
│   ├── middleware/
│   ├── security/
│   ├── types/
│   └── utils/

├── infrastructure/
│   ├── cache/
│   ├── database/
│   ├── logger/
│   ├── mail/
│   └── queue/

├── modules/
│   ├── auth/
│   ├── users/
│   ├── oauth/
│   ├── sessions/
│   ├── applications/
│   ├── roles/
│   ├── permissions/
│   ├── tokens/
│   ├── oidc/
│   ├── audit/
│   └── admin/

├── plugins/
├── routes/
├── jobs/
└── tests/
```

---

# Installation

## Prerequisites

- Bun
- PostgreSQL
- Redis (optional but recommended)

---

## Clone Repository

```bash
git clone <repository-url>
cd iam-service
```

---

## Install Dependencies

```bash
bun install
```

---

# Environment Variables

Create a `.env` file in the project root.

```env
NODE_ENV=development
PORT=3000

DATABASE_URL=postgresql://postgres:password@localhost:5432/iam

REDIS_URL=redis://localhost:6379

JWT_PRIVATE_KEY=
JWT_PUBLIC_KEY=

BETTER_AUTH_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

RESEND_API_KEY=
```

---

# Database Setup

## Generate Migrations

```bash
bun drizzle-kit generate
```

---

## Run Migrations

```bash
bun drizzle-kit migrate
```

---

# Development

## Start Development Server

```bash
bun run dev
```

---

## Production

```bash
bun run start
```

---

# Scripts

| Script | Description |
|---|---|
| `bun run dev` | Start development server |
| `bun run start` | Start production server |
| `bun run build` | Build project |
| `bun run test` | Run tests |
| `bun run lint` | Run linter |
| `bun run format` | Format code |
| `bun run db:generate` | Generate Drizzle migrations |
| `bun run db:migrate` | Run database migrations |

---

# Authentication Flows

## Email & Password

```text
Register
→ Verify Email
→ Login
→ Access Token Issued
→ Refresh Token Rotation
```

---

## OAuth Login

```text
User
→ OAuth Provider
→ Callback
→ Account Linking
→ Session Creation
→ JWT Issued
```

---

# Account Linking

Users may:
- Register using OAuth
- Add password later
- Register using email/password
- Link multiple OAuth providers

Supported providers:
- Google
- GitHub
- Discord
- Microsoft
- Apple

---

# RBAC Model

## Structure

```text
User
→ Roles
→ Permissions
```

Example:

```text
admin
├── users.read
├── users.write
├── roles.assign
└── audit.read
```

---

# API Structure

```text
/api/v1/auth/*
/api/v1/users/*
/api/v1/apps/*
/api/v1/roles/*
/api/v1/permissions/*
/api/v1/admin/*
/oauth/*
/.well-known/*
/internal/*
```

---

# Core Endpoints

## Authentication

| Method | Endpoint |
|---|---|
| POST | `/api/v1/auth/register` |
| POST | `/api/v1/auth/login` |
| POST | `/api/v1/auth/logout` |
| POST | `/api/v1/auth/refresh` |
| POST | `/api/v1/auth/forgot-password` |
| POST | `/api/v1/auth/reset-password` |

---

## OAuth

| Method | Endpoint |
|---|---|
| GET | `/api/v1/auth/oauth/:provider` |
| GET | `/api/v1/auth/oauth/:provider/callback` |

---

## User Management

| Method | Endpoint |
|---|---|
| GET | `/api/v1/users/me` |
| PATCH | `/api/v1/users/me` |
| POST | `/api/v1/users/me/change-password` |
| POST | `/api/v1/users/me/add-password` |

---

## Role Management

| Method | Endpoint |
|---|---|
| POST | `/api/v1/roles` |
| GET | `/api/v1/roles` |
| PATCH | `/api/v1/roles/:roleId` |
| DELETE | `/api/v1/roles/:roleId` |

---

# OpenID Connect Endpoints

```text
/.well-known/openid-configuration
/.well-known/jwks.json
/oauth/authorize
/oauth/token
/oauth/userinfo
/oauth/introspect
/oauth/revoke
```

---

# Security Practices

## Password Security
- Argon2id hashing
- Password reset tokens
- Email verification required

---

## JWT Security
- RS256 or EdDSA signing
- Key rotation support
- JWKS endpoint

---

## OAuth Security
- PKCE required
- CSRF protection
- Secure callback validation

---

## API Security
- Rate limiting
- IP throttling
- Audit logs
- Service token scopes

---

# Background Jobs

Workers handle:
- Expired role revocation
- Session cleanup
- Email delivery
- Token cleanup
- Audit archival

---

# Recommended Deployment

## Docker Compose

```text
services:
  iam:
  postgres:
  redis:
  worker:
```

---

# Future Features

Planned:
- MFA / TOTP
- Passkeys / WebAuthn
- Organizations
- Tenant isolation
- SCIM
- SAML
- Device management
- Risk-based authentication

---

# Development Guidelines

## Architecture Rules

- Keep modules isolated
- Avoid cross-module repository access
- Communicate through services
- Keep authorization logic centralized
- Do not hardcode permissions

---

## Security Rules

- Never store plaintext secrets
- Never expose internal endpoints publicly
- Always hash tokens where possible
- Rotate secrets regularly

---

# License

MIT

---

# Notes

This IAM service is designed as:
- a centralized authentication provider
- an authorization service
- an OAuth/OIDC provider
- a scalable modular monolith

Applications should trust this service as the source of truth for:
- identity
- sessions
- permissions
- roles
- token validity
- account linking
- authorization state