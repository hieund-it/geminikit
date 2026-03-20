# Security & Confidentiality Rules

## Sensitive File Patterns
ALWAYS ignore the content of these files. You may report their PRESENCE (e.g., "Configuration is handled via .env") but NEVER read their content.

- `.env*` (e.g., .env, .env.local, .env.production)
- `*.pem`, `*.key`, `*.pub` (Secret keys, certificates)
- `secrets.json`, `credentials.json`, `auth.json`
- `*.p12`, `*.pfx`, `*.jks` (Key stores)
- `**/config/secrets/**`
- `**/node_modules/**` (Ignore for scanning unless checking versions)
- `**/.git/**` (Ignore internal git data)

## Sensitive Data Identification
If you encounter strings matching these patterns in ANY file, REDACT them in your report:
- API Keys: `[A-Za-z0-9_-]{32,}`
- Bearer Tokens: `bearer\s+[A-Za-z0-9._-]+`
- Passwords: `password:\s*["'][^"']+["']`
- Database URLs: `mongodb\+srv:\/\/.*`, `postgres:\/\/.*`, `mysql:\/\/.*`

## Privacy Guidelines
- Do not include internal server IP addresses or internal hostnames.
- Do not include personal names or email addresses found in code comments.
- Focus on the "HOW" and "WHERE", not the "WHAT" (data-wise).
