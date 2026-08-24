# Nylvex — Final Security Audit & Hardening

The Nylvex website is approaching production deployment.

Before deploying to Vercel, perform a **thorough security audit and hardening pass across the entire repository**.

This is a real production security review.

Do not assume the application is secure because it is a portfolio website.

Inspect the actual implementation and identify vulnerabilities, insecure configurations, exposed secrets, unsafe dependencies, API weaknesses, injection risks, authentication/authorization issues, and deployment/security problems.

Your objective is:

> **Find real vulnerabilities, fix them safely, verify the fixes, and leave the repository production-ready.**

Do NOT merely generate a security checklist.

Actually inspect the codebase and remediate confirmed issues.

---

# 1. SECURITY PRINCIPLES

Follow these principles throughout the audit:

- Never expose secrets to the browser.
- Never trust client-side validation.
- Validate all untrusted input server-side.
- Sanitize data where appropriate.
- Use least privilege.
- Minimize exposed attack surface.
- Keep dependencies patched.
- Do not add unnecessary security complexity.
- Do not disable security controls simply to make something work.
- Do not hide vulnerabilities by suppressing warnings.
- Do not fabricate security claims.

---

# 2. FIRST: AUDIT THE APPLICATION

Before changing anything, inspect:

```bash
git status
git remote -v
```

Then understand the entire project structure.

Inspect:

- package.json
- lockfile
- Next.js configuration
- TypeScript configuration
- environment configuration
- API routes
- server actions
- middleware
- frontend components
- backend/FastAPI code if present
- database access
- authentication
- contact forms
- AI integrations
- external API integrations
- analytics
- image/file handling
- deployment configuration
- Docker configuration
- GitHub Actions
- public assets
- `.gitignore`

Do not assume a vulnerability exists simply because a feature exists.

Determine how the actual implementation works.

---

# 3. SECRET & CREDENTIAL AUDIT

Search the entire repository for accidentally committed secrets.

Look for:

```text
API keys
tokens
passwords
database credentials
OAuth secrets
private keys
JWT secrets
webhook secrets
cloud credentials
LLM API keys
GitHub tokens
Vercel tokens
```

Inspect:

```text
.env
.env.local
.env.production
.env.example
```

Ensure sensitive files are ignored.

Verify:

```text
.env
.env.local
.env.production
```

are not committed.

Only safe placeholders should exist in:

```text
.env.example
```

Example:

```text
OPENAI_API_KEY=
DATABASE_URL=
ANTHROPIC_API_KEY=
```

Never put private secrets in variables beginning with:

```text
NEXT_PUBLIC_
```

unless the value is genuinely intended to be public.

---

# 4. GIT HISTORY SECRET CHECK

Do not only inspect the current working tree.

Check Git history for accidentally committed secrets.

Inspect commits and diffs where appropriate.

If secrets are discovered in Git history:

1. Determine whether they are real.
2. Recommend immediate rotation/revocation.
3. Do not assume deleting the file removes the secret from history.
4. Do not rewrite Git history automatically.
5. Do not force push.

If a real credential was committed, clearly report that it must be revoked/rotated.

---

# 5. DEPENDENCY SECURITY

Inspect all dependencies.

Run the appropriate package-manager security audit.

For npm:

```bash
npm audit
```

Also inspect outdated/high-risk packages where relevant.

Do not blindly upgrade everything.

For every high/critical vulnerability:

1. Determine whether the vulnerable package is actually used.
2. Determine whether the vulnerability affects this application.
3. Upgrade to a compatible secure version if possible.
4. Test the application.
5. Re-run the audit.

Avoid unnecessary dependency additions.

Remove unused dependencies if safe.

---

# 6. NEXT.JS SECURITY

Inspect the Next.js implementation for:

- unsafe server/client boundaries
- exposed environment variables
- unsafe server actions
- insecure API routes
- unsafe redirects
- untrusted URL handling
- dynamic route handling
- insecure middleware
- accidental server data exposure
- sensitive data passed into client components
- insecure caching behavior

Pay particular attention to data that crosses:

```text
Server → Client
Client → Server
```

Never expose secrets or privileged data through client components.

---

# 7. API SECURITY

Audit every API endpoint.

For each endpoint determine:

- What data does it accept?
- Who can call it?
- What validation exists?
- What can an attacker control?
- Is rate limiting required?
- Can it be abused for spam?
- Can it trigger expensive operations?
- Can it expose sensitive information?
- Can it be used to access another user's data?

Do not rely exclusively on frontend validation.

All important validation must happen server-side.

---

# 8. CONTACT FORM SECURITY

The Nylvex contact form is an important attack surface.

Audit:

- input validation
- email validation
- message length
- field length limits
- malicious HTML
- header injection
- spam
- automated submissions
- rate limiting
- abuse of email-sending APIs

Never directly interpolate untrusted user input into:

- HTML
- email headers
- SQL
- shell commands
- executable code

Implement appropriate server-side validation.

Add reasonable rate limiting.

Add spam protection if appropriate.

Do not make the form unusable for legitimate clients.

---

# 9. XSS / INJECTION AUDIT

Search for potential:

### XSS

Look for:

```text
dangerouslySetInnerHTML
innerHTML
unsafe HTML rendering
raw Markdown rendering
HTML injection
```

If raw HTML is rendered, determine whether it is trusted.

For Markdown/MDX:

- sanitize untrusted content
- avoid executing arbitrary user-controlled code
- do not allow arbitrary HTML unless explicitly controlled

---

# 10. SQL / DATABASE SECURITY

If PostgreSQL or another database is used:

Inspect all database queries.

Ensure parameterized queries or safe ORM/query-builder mechanisms are used.

Never construct SQL by string concatenation with user input.

Check:

- authorization
- row ownership
- data isolation
- connection security
- credentials
- error handling

Do not expose database errors to users.

---

# 11. SSRF AUDIT

Search for any functionality where users can provide URLs.

Examples:

```text
URL fetching
image fetching
web scraping
document importing
webhooks
external API proxies
```

If server-side code fetches user-controlled URLs, assess SSRF risk.

Prevent access to:

- localhost
- private IP ranges
- cloud metadata endpoints
- internal services
- unintended protocols

Use an allowlist where appropriate.

Do not introduce URL-fetching functionality unless necessary.

---

# 12. FILE UPLOAD SECURITY

If the application supports uploads:

Audit:

- file type validation
- file size limits
- filename handling
- storage location
- executable file risks
- path traversal
- malicious documents
- decompression bombs
- image processing vulnerabilities

Never trust the extension alone.

If file uploads are not currently required, do not implement them during this audit.

---

# 13. AUTHENTICATION

If authentication exists:

Audit:

- password handling
- session management
- cookie configuration
- token storage
- expiration
- logout
- CSRF considerations
- brute-force protection
- account enumeration
- password reset functionality

Never store passwords in plaintext.

Cookies containing authentication state should use appropriate:

```text
HttpOnly
Secure
SameSite
```

settings.

Do not invent an authentication system if the current application does not require one.

---

# 14. AUTHORIZATION

Authentication is not authorization.

For every protected resource verify:

> Can User A access User B's data?

Check for IDOR/BOLA vulnerabilities.

Example:

```text
/api/projects/123
```

must not automatically mean:

> anyone who knows 123 can access it.

Authorization must be enforced server-side.

---

# 15. CSRF

For state-changing requests, evaluate CSRF exposure.

Pay particular attention to:

- POST
- PUT
- PATCH
- DELETE
- server actions
- authenticated browser requests

Implement appropriate CSRF protection where necessary based on the authentication architecture.

Do not add meaningless CSRF tokens to completely public, stateless endpoints where they provide no security benefit.

---

# 16. SECURITY HEADERS

Inspect the application's HTTP security headers.

Implement appropriate headers such as:

```text
Content-Security-Policy
Strict-Transport-Security
X-Content-Type-Options
Referrer-Policy
Permissions-Policy
```

Evaluate whether:

```text
X-Frame-Options
```

or an appropriate CSP `frame-ancestors` policy is needed.

Do not blindly copy a CSP from a tutorial.

Build a CSP compatible with the actual application.

If external resources are used, explicitly account for them.

Avoid:

```text
unsafe-eval
```

unless genuinely required.

Avoid:

```text
unsafe-inline
```

where the framework/application allows a safer configuration.

Test the website after adding the policy.

---

# 17. CONTENT SECURITY POLICY

Create a practical CSP.

Identify:

- scripts
- styles
- fonts
- images
- analytics
- API endpoints
- AI providers
- external assets

Do not create a CSP so restrictive that it breaks the application.

Do not create a CSP so permissive that it provides little protection.

Test it thoroughly.

---

# 18. CORS

If FastAPI or another backend exists:

Audit CORS.

Do NOT use:

```text
Access-Control-Allow-Origin: *
```

for authenticated/private APIs.

Use an explicit allowlist of trusted origins.

Separate development and production origins if necessary.

Do not allow arbitrary origins.

---

# 19. RATE LIMITING

Identify endpoints that can be abused.

Especially:

```text
/contact
/AI endpoints
/email endpoints
/authentication
/search
/expensive operations
```

Implement rate limiting where appropriate.

Pay particular attention to AI endpoints because attackers can potentially cause expensive API usage.

Do not create an unnecessarily complicated distributed rate limiter for endpoints that don't need it.

---

# 20. AI SECURITY

Because Nylvex may eventually include "Ask Nylvex", inspect AI-related functionality carefully.

Potential risks:

- prompt injection
- sensitive system prompt leakage
- excessive tool permissions
- unrestricted tool execution
- arbitrary URL fetching
- data exfiltration
- excessive token usage
- denial-of-wallet
- malicious uploaded content

If the AI assistant has tools:

Follow least privilege.

The model must never automatically receive unrestricted access to:

- filesystem
- shell
- database
- credentials
- private APIs

without explicit security controls.

AI output must not automatically become trusted executable instructions.

---

# 21. MCP SECURITY

If MCP is implemented:

Audit:

- available tools
- permissions
- authentication
- tool input validation
- output handling
- external resource access

Never expose privileged MCP tools to anonymous public visitors.

If MCP is only planned but not implemented:

Do not add unnecessary MCP infrastructure during this audit.

---

# 22. OPEN REDIRECTS

Search for redirects based on user-controlled parameters.

Examples:

```text
?redirect=
?next=
?returnTo=
```

Ensure attackers cannot use Nylvex to redirect users to arbitrary malicious domains.

Prefer allowlists or same-origin validation.

---

# 23. PATH TRAVERSAL

Search for user-controlled filesystem paths.

Prevent:

```text
../
..\
absolute paths
encoded traversal
```

Do not allow user input to directly determine filesystem locations.

---

# 24. COMMAND INJECTION

Search for:

```text
subprocess
os.system
exec
eval
shell=True
```

If any exist:

Determine whether user-controlled input can reach them.

Never pass untrusted input into shell commands.

Remove unnecessary shell execution.

---

# 25. ERROR HANDLING

Inspect production error responses.

Do not expose:

- stack traces
- database queries
- file paths
- API keys
- internal architecture
- environment variables
- provider credentials

Production responses should contain useful but safe messages.

Detailed diagnostics should remain server-side.

---

# 26. LOGGING

Audit logs for accidental sensitive information.

Do not log:

- passwords
- API keys
- authentication tokens
- session cookies
- full private user data
- secrets

Logs should be useful for debugging without becoming a data leak.

---

# 27. IMAGE / ASSET SECURITY

Inspect:

- remote image configuration
- image domains
- SVG handling
- uploaded SVGs
- external resources

Be careful with untrusted SVG content because SVG can contain active content.

Do not allow arbitrary remote image domains unless necessary.

---

# 28. WEBHOOK SECURITY

If webhooks exist:

Verify signatures where supported.

Do not trust:

```text
X-Webhook-Source
```

or similar headers without cryptographic verification.

Validate:

- signature
- timestamp
- payload
- replay protection where appropriate

If no webhooks exist, do not add them.

---

# 29. DOCKER SECURITY

If Docker is used:

Inspect:

- base image
- running user
- exposed ports
- secrets
- filesystem permissions
- unnecessary packages
- health checks

Prefer non-root containers where practical.

Do not bake secrets into Docker images.

Do not expose unnecessary services.

---

# 30. GITHUB ACTIONS SECURITY

If GitHub Actions exist:

Inspect workflow files for:

- overly broad permissions
- secret exposure
- untrusted pull request execution
- unsafe shell interpolation
- dependency actions
- pinned versions

Use least privilege.

Avoid:

```yaml
permissions: write-all
```

unless genuinely required.

Be careful with untrusted GitHub event data inside shell commands.

---

# 31. DEPENDENCY SUPPLY CHAIN

Review third-party dependencies.

Pay particular attention to:

- abandoned packages
- suspicious packages
- unnecessary dependencies
- packages with known vulnerabilities

Do not add dependencies unless they provide real value.

Prefer established, maintained packages.

---

# 32. SECURITY SCANNING

Where tools are available, use appropriate scanners.

For JavaScript/Node:

```bash
npm audit
```

For Python:

Use appropriate dependency/security auditing tools available in the environment.

For Git secrets:

Use an appropriate secret scanner if available.

For static analysis:

Use available tools such as:

- ESLint security rules
- Semgrep
- CodeQL where configured
- Bandit for Python where appropriate

Do not install a large security toolchain unnecessarily.

Use tools that are practical for this repository.

---

# 33. SECURITY FINDINGS CLASSIFICATION

Classify findings as:

```text
CRITICAL
HIGH
MEDIUM
LOW
INFORMATIONAL
```

For each confirmed finding record:

```text
Finding
Severity
Location
Why it matters
Exploit scenario
Fix
Verification
```

Do not inflate severity.

Do not classify theoretical concerns as confirmed vulnerabilities without evidence.

---

# 34. REMEDIATION

For every confirmed vulnerability:

1. Explain it internally.
2. Implement the safest practical fix.
3. Keep the application's intended behavior intact.
4. Run relevant tests.
5. Re-run the security check.
6. Verify the vulnerability is actually mitigated.

Do not merely suppress warnings.

Do not disable scanners to make the report clean.

---

# 35. SECURITY REGRESSION TESTS

Where practical, add tests for important security fixes.

Examples:

- invalid input rejected
- unauthorized request rejected
- oversized request rejected
- malicious payload rejected
- rate limit enforced
- unsafe redirect rejected
- secrets not exposed
- protected endpoint inaccessible anonymously

Security fixes should remain protected against regression.

---

# 36. DO NOT CREATE FALSE SECURITY

Do not add superficial security features simply to make the project look secure.

Examples:

Do NOT:

- add fake authentication
- add unnecessary encryption
- add meaningless security headers
- create fake security logs
- add security packages without understanding them
- hide errors
- disable warnings
- claim compliance that hasn't been verified

Security should be functional, not decorative.

---

# 37. FINAL SECURITY REPORT

After completing the audit, create:

```text
SECURITY_AUDIT.md
```

Include:

## Executive Summary

Overall security status.

## Scope

What was inspected.

## Findings

Table:

```text
Severity | Finding | Status
```

## Remediations

What was fixed.

## Remaining Risks

Anything that could not safely be fixed or requires infrastructure configuration.

## Production Recommendations

Things that should be configured in Vercel/cloud infrastructure.

Do not include actual secrets in this report.

---

# 38. PRODUCTION READINESS CHECK

Before declaring Nylvex secure enough for deployment, verify:

### Secrets

- No secrets committed.
- No secrets exposed to client.
- `.env` files ignored.
- `.env.example` contains placeholders only.

### Dependencies

- No unresolved critical vulnerabilities.
- High-severity issues assessed and fixed where applicable.

### Application

- Input validation exists.
- APIs are protected appropriately.
- No obvious XSS.
- No SQL injection.
- No command injection.
- No path traversal.
- No unsafe redirects.
- No accidental sensitive data exposure.

### Infrastructure

- Security headers configured.
- HTTPS/HSTS appropriate for production.
- CORS correctly configured.
- Rate limiting implemented where needed.
- Production environment variables configured securely.

### AI

- No unrestricted tools.
- No exposed API keys.
- AI endpoints protected against abuse.
- Prompt/tool boundaries considered.

### Code

- TypeScript passes.
- Lint passes.
- Tests pass.
- Production build passes.

---

# 39. GITHUB

After remediation:

```bash
git status
```

Review the changes.

Then:

```bash
git add <relevant-files>
git commit -m "security: harden application before production"
git push origin main
```

Do not force push.

Do not rewrite Git history.

If real secrets were discovered in Git history, report them separately and recommend immediate credential rotation rather than attempting destructive history rewriting automatically.

---

# 40. FINAL VERIFICATION

Run the normal application checks:

```bash
npm run lint
npm run build
```

Run tests if available.

Re-run dependency/security scans.

Inspect the final Git diff.

Confirm:

- no secrets
- no accidental debug code
- no broken functionality
- no security regressions
- no build errors

Only after all of these checks pass should Nylvex be considered ready for Vercel deployment.

---

# FINAL PRINCIPLE

The goal is not to make a security report that looks impressive.

The goal is to make the actual application safer.

**Inspect → Verify → Fix → Test → Re-scan → Document.**

Do not claim that Nylvex is "100% secure."

Report what was actually checked, what was fixed, and what residual risks remain.