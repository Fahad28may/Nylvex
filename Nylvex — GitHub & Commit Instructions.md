# 32. GITHUB REPOSITORY & AUTOMATIC COMMITS

The Nylvex project must be maintained in this GitHub repository:

```text
https://github.com/Fahad28may/Nylvex.git
```

GitHub username:

```text
Fahad28may
```

Repository:

```text
Nylvex
```

## Initial Git setup

If the repository does not already have the correct remote configured, use:

```bash
git remote add origin https://github.com/Fahad28may/Nylvex.git
git branch -M main
```

Then push the project:

```bash
git push -u origin main
```

If `origin` already exists, DO NOT add it again.

Instead inspect it with:

```bash
git remote -v
```

and update it only if it points to the wrong repository.

---

# Git Workflow

GitHub is part of the development workflow, not something to do only after the entire project is finished.

After every meaningful development milestone:

1. Check the current Git status.
2. Review the changes.
3. Run linting.
4. Run type checking.
5. Run the production build.
6. Fix any errors.
7. Stage the relevant files.
8. Create a meaningful commit.
9. Push the commit to GitHub.

Use meaningful conventional-style commit messages such as:

```text
feat: initialize Nylvex project
feat: build homepage hero
feat: add selected work section
feat: add project case study system
feat: add capabilities page
feat: add Nylvex lab
feat: add contact form
feat: add responsive navigation
feat: add SEO metadata
style: refine typography and spacing
style: improve mobile layout
refactor: improve project architecture
fix: resolve mobile navigation issue
fix: resolve production build errors
```

Avoid meaningless commits such as:

```text
update
changes
stuff
fix
work
final
final-final
```

---

# Commit Discipline

Create commits at logical milestones rather than making one enormous commit at the end.

For example:

```text
Initial project
    ↓
Homepage foundation
    ↓
Selected work
    ↓
Case studies
    ↓
Capabilities
    ↓
Lab
    ↓
About + Contact
    ↓
SEO + Analytics
    ↓
Responsive polish
    ↓
Final QA
```

Each milestone should be independently understandable from the Git history.

---

# Before Every Push

Run the appropriate project checks.

At minimum:

```bash
npm run lint
npm run build
```

If the project contains tests:

```bash
npm test
```

Also inspect:

```bash
git status
```

Do not push code that knowingly contains:

- build errors
- TypeScript errors
- lint errors
- exposed secrets
- API keys
- `.env` files containing credentials
- obviously broken functionality

Make sure `.gitignore` protects sensitive/local files.

---

# IMPORTANT: NEVER EXPOSE SECRETS

Never commit:

```text
.env
.env.local
.env.production
API keys
database credentials
private tokens
OAuth secrets
```

Create:

```text
.env.example
```

containing placeholder variable names only.

For example:

```text
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
DATABASE_URL=
NEXT_PUBLIC_POSTHOG_KEY=
```

---

# Push Rules

After a successful milestone commit, push it:

```bash
git push origin main
```

For the first push, if the repository has not been initialized/configured:

```bash
git remote add origin https://github.com/Fahad28may/Nylvex.git
git branch -M main
git push -u origin main
```

If authentication is required, use the GitHub authentication already configured in the development environment.

Do NOT ask me to manually copy commands that you can safely execute yourself.

---

# IMPORTANT GIT SAFETY RULES

Never:

```bash
git push --force
```

unless I explicitly request it.

Never delete or overwrite unrelated repositories.

Never reset or rewrite existing Git history without explicit approval.

Never commit secrets.

Never use `git add .` blindly if doing so could include sensitive files.

Before committing, inspect the staged changes when appropriate:

```bash
git diff --staged
```

---

# FINAL REQUIREMENT

The Nylvex repository should contain the complete working project and a clean development history.

At the end of the implementation, verify:

```bash
git status
```

Then confirm:

1. The project builds successfully.
2. No secrets are committed.
3. The correct GitHub remote is configured.
4. The latest changes have been committed.
5. The latest commit has been pushed to:

```text
https://github.com/Fahad28may/Nylvex.git
```

Do not merely tell me how to push the code.

**Actually execute the Git commands and push the project when the environment allows it.**