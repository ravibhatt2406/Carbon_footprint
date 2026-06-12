# EcoLens AI — Security Measures

This document outlines the security controls and hardening implemented across the EcoLens AI platform.

## Backend Hardening

1. **Helmet HTTP Headers:** Uses Express `helmet()` to secure applications by setting various HTTP headers (Content Security Policy, X-XSS-Protection, Strict-Transport-Security, X-Frame-Options, etc.).
2. **API Rate Limiting:**
   - **General Rate Limit:** 100 requests per 15-minute window per IP.
   - **Authentication Rate Limit:** 20 requests per 15-minute window for `/api/auth` endpoints to mitigate brute force credential attacks.
3. **CORS Restrictions:** Whitelists specific origins (configured via `CORS_ORIGINS` env variable) and restricts allowed methods to `GET, POST, PUT, DELETE`.
4. **Parameter Pollution:** Uses HTTP Parameter Pollution (HPP) protection to avoid parameter arrays injection attacks.
5. **Body Size Limits:** Limits incoming payload sizes to `1mb` to defend against buffer overflow and denial of service (DoS) attacks.

## Authentication & Authorization

- **JWT Secrets:** Removed fallback keys. Production environment variables require a cryptographically secure `JWT_SECRET`.
- **Bearer Tokens:** Clients pass JWT tokens using the `Authorization: Bearer <token>` header schema. The backend authenticates each request via `middleware/auth.js`.

## Input Validation & Sanitization

All incoming requests are validated against schemas in `middleware/validators.js` before executing controller logic:
- **Registration:** Requires non-empty fields, correct email syntax, and a password of at least 6 characters.
- **Calculator:** Validates positive numeric commuting distances and electricity units. Sanitizes food/shopping options.
- **Goals:** Ensures reduction targets are positive numbers and end dates match valid ISO 8601 dates.

## Upload Security

- **File Whitelist:** Multer storage restricts uploaded receipt files to allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, and `application/pdf`.
- **File Size Cap:** Blocks any uploads exceeding `5MB`.

## Error Sanitization

A centralized error handling middleware (`middleware/errorHandler.js`) captures all system crashes. It logs detailed stack traces on the server but returns a generic, sanitized `{ error: "Internal server error" }` response to the client to avoid information leakage.
