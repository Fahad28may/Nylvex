# Nylvex — Master Prompt for Claude Code

You are the lead product designer, UX designer, frontend engineer, backend engineer, and technical architect responsible for building **Nylvex**, a premium AI & software engineering studio website.

Your job is not merely to create a portfolio.

Your job is to create a **high-end, technically credible, client-converting digital presence** for Nylvex that communicates:

> **Nylvex builds intelligent software for complex problems.**

The site must feel like it was designed and engineered by an excellent software/product team — NOT like a generic AI template, NOT like a "vibecoded" website, and NOT like a junior developer portfolio.

---

# 1. PRIMARY OBJECTIVE

Nylvex needs to accomplish four things:

1. Demonstrate technical competence.
2. Showcase impressive AI/software projects.
3. Establish trust with potential clients.
4. Convert qualified visitors into project inquiries.

The website should make a potential client think:

> "These people can actually architect and build serious AI/software systems."

It should NOT make them think:

> "This is another developer portfolio made with an AI website generator."

The website should prioritize:

**Clarity → Credibility → Proof → Conversion**

over visual gimmicks.

---

# 2. BRAND

Brand:

**Nylvex**

Positioning:

**AI & Software Engineering Studio**

Core statement:

> Intelligent software for complex problems.

Supporting statement:

> AI systems, intelligent applications, and software engineered around real-world problems.

Nylvex should feel like a company/studio rather than a personal resume site.

However, the site must clearly establish the human behind the work.

Use:

> Built by Fahad

in the About section rather than making the entire website "Fahad's Portfolio."

This allows Nylvex to grow into a larger engineering studio in the future.

---

# 3. DESIGN PHILOSOPHY

This is extremely important.

DO NOT create a typical "AI website."

Avoid:

- excessive purple gradients
- neon gradients
- glowing blobs
- glowing borders everywhere
- animated neural networks
- floating 3D objects
- excessive glassmorphism
- giant meaningless gradient text
- generic AI illustrations
- stock imagery
- random abstract shapes
- excessive rounded cards
- excessive shadows
- excessive animations
- fake terminal interfaces
- fake code scrolling
- "The Future of AI"
- "Revolutionizing the future"
- meaningless marketing buzzwords
- template-like sections
- over-designed dashboards
- decorative UI that doesn't communicate anything

The design should be:

- restrained
- sophisticated
- technical
- editorial
- minimal
- highly intentional
- modern
- premium
- trustworthy
- slightly futuristic without being gimmicky

Think:

**high-end engineering studio + modern product company + technical publication**

rather than:

**AI startup landing page template**

---

# 4. VISUAL DIRECTION

Use a strong typographic hierarchy.

Prioritize:

- typography
- spacing
- layout
- grid
- contrast
- subtle motion
- excellent interaction design

over decorative effects.

Use a restrained color palette.

Primary appearance should be dark, but support a polished light theme if it can be implemented without compromising the design.

Use one subtle accent color for interactive elements.

Do not use gradients as the primary visual identity.

The Nylvex logo should be primarily typographic.

Use:

NYLVEX

with a clean custom-feeling wordmark.

Do not create a generic "AI spark" logo.

---

# 5. TECHNICAL STACK

Use:

### Frontend

- Next.js
- TypeScript
- App Router
- Tailwind CSS
- Framer Motion where appropriate

### Backend

Use FastAPI only where backend functionality actually provides value.

Do NOT create unnecessary backend infrastructure.

### Data

PostgreSQL if persistence is required.

### AI

Structure the application so an AI assistant can be added cleanly.

Potential AI stack:

- OpenAI
- Anthropic
- structured outputs
- tool calling
- RAG where appropriate

### Infrastructure

- Docker
- Git
- GitHub
- GitHub Actions where useful

### Analytics

PostHog or another privacy-conscious analytics system.

### Deployment

Optimize the frontend for Vercel deployment.

The backend should remain deployable independently.

---

# 6. CODE QUALITY

This is a professional engineering project.

Do NOT generate a giant monolithic component.

Use a clean architecture.

Suggested structure:

```text
app/
components/
  ui/
  layout/
  sections/
  projects/
  animations/
lib/
data/
public/
styles/
```

Use reusable components.

Use strong TypeScript types.

Avoid:

- any
- duplicated components
- hardcoded repeated values
- giant page components
- unnecessary dependencies
- dead code
- console errors
- accessibility violations

Components should have clear responsibilities.

---

# 7. RESPONSIVENESS

The website must be excellent at:

- desktop
- laptop
- tablet
- mobile

Do not simply shrink the desktop layout.

Design responsive behavior intentionally.

Mobile should feel like a first-class experience.

Pay particular attention to:

- navigation
- project layouts
- typography
- CTA buttons
- case-study diagrams
- animations
- horizontal overflow
- touch targets

No horizontal scrolling.

---

# 8. PERFORMANCE

The site should be extremely fast.

Prioritize:

- Server Components where appropriate
- optimized images
- lazy loading
- minimal JavaScript
- minimal dependencies
- font optimization
- good Core Web Vitals
- semantic HTML

Do not introduce JavaScript just for visual effects.

Every animation must have a reason.

---

# 9. ACCESSIBILITY

Implement:

- semantic HTML
- keyboard navigation
- visible focus states
- accessible buttons
- proper labels
- appropriate contrast
- reduced-motion support
- alt text
- proper heading hierarchy

Respect:

```css
prefers-reduced-motion
```

Animations must never prevent the site from being usable.

---

# 10. WEBSITE INFORMATION ARCHITECTURE

Create these primary routes:

```text
/
 /work
 /work/[slug]
 /capabilities
 /about
 /contact
 /lab
```

Potential future:

```text
/blog
```

Do not implement unnecessary pages just for the sake of having more pages.

---

# 11. HOMEPAGE

The homepage should follow this approximate structure:

## HERO

Small eyebrow:

> NYLVEX — AI & SOFTWARE ENGINEERING STUDIO

Main headline:

> Intelligent software for complex problems.

Supporting copy:

> AI systems, intelligent applications, and software engineered around real-world problems.

Primary CTA:

> Explore the work

Secondary CTA:

> Start a project

The hero should be visually strong through typography, spacing, composition and subtle motion.

Do NOT add a giant AI illustration.

---

# 12. SELECTED WORK

This is one of the most important sections.

Heading:

> Selected work

Supporting text:

> Systems and products built across AI, software engineering, and intelligent applications.

Show 4–6 flagship projects.

Initial projects:

### AI CRM Agent

Categories:

AI / SaaS / Agents

Description:

> An intelligent CRM system that analyzes sales activity, identifies opportunities, and recommends actions.

### AI Personal Agent

Categories:

AI / Agents / Python

Description:

> A personal AI system capable of interacting with files, applications, and external tools.

### Knowledge Intelligence

Categories:

RAG / LLM / Search

Description:

> A knowledge system that turns large document collections into an intelligent, searchable interface.

### AI Voice Agent

Categories:

AI / Voice / Realtime

Description:

> A conversational voice system capable of understanding requests and executing actions through external tools.

### Computer Vision System

Categories:

Computer Vision / Python / Realtime

Description:

> A real-time visual detection and event-processing system.

Projects should be data-driven.

Create a project data model rather than hardcoding project markup repeatedly.

Each project should support:

- title
- slug
- description
- category
- technologies
- thumbnail
- hero image
- problem
- solution
- architecture
- technical decisions
- challenges
- results
- GitHub URL
- demo URL
- status

Do not invent fake metrics or fake clients.

Use placeholder content clearly marked for later replacement where real information isn't available.

---

# 13. PROJECT DETAIL PAGES

Every major project gets a premium case-study page.

Structure:

## Hero

Project name

Short description

Technology/category tags

Hero visual

CTA:

> View live demo

or

> View source

if applicable.

---

## Problem

Clearly explain:

- what problem exists
- who experiences it
- why existing solutions are insufficient

---

## Solution

Explain what was built.

---

## Architecture

Create a clean technical architecture diagram.

Example:

```text
User
 ↓
Next.js
 ↓
FastAPI
 ↓
AI Agent
 ├── PostgreSQL
 ├── Redis
 └── External APIs
```

Do not make diagrams unnecessarily decorative.

They should communicate architecture.

---

## Engineering

Explain important technical decisions.

For example:

- why FastAPI
- why PostgreSQL
- why async processing
- why RAG
- why tool calling
- how authentication works
- how errors are handled
- how the system scales

This section is extremely important because it demonstrates engineering ability.

---

## Challenges

Explain genuine technical challenges.

---

## Results

Only show real results.

Never fabricate:

- revenue
- users
- performance
- percentages
- customers
- testimonials

If results are unavailable, say:

> Prototype / experimental project

or omit the section.

---

## Stack

Display technologies cleanly.

Example:

Python · FastAPI · PostgreSQL · Docker · LLM APIs

---

# 14. CAPABILITIES PAGE

Do not create a generic skills page.

Organize capabilities around problems and systems.

## AI Engineering

- LLM applications
- AI agents
- RAG systems
- tool calling
- structured outputs
- AI evaluation
- AI integrations

## Software Engineering

- Python
- FastAPI
- REST APIs
- asynchronous systems
- databases
- background processing
- authentication
- system architecture

## Intelligent Applications

- AI SaaS
- knowledge systems
- computer vision
- voice AI
- recommendation systems
- intelligent interfaces

## Automation

- API integrations
- event-driven workflows
- workflow automation
- webhooks
- business process automation

## Product Engineering

- architecture
- prototyping
- MVP development
- deployment
- iteration

Include a technology section:

```text
Python
FastAPI
PostgreSQL
Redis
Docker
Next.js
TypeScript
PyTorch
Hugging Face
OpenAI
Anthropic
MCP
n8n
```

Do not make technology logos dominate the page.

---

# 15. LAB PAGE

Create a "Nylvex Lab."

Purpose:

Show experiments, prototypes, research and interesting technical work.

Potential experiments:

- AI agents
- RAG
- computer vision
- voice AI
- MCP
- realtime systems
- LLM experiments

The Lab should feel experimental and technical.

Each experiment can contain:

- title
- short description
- technology
- demo
- GitHub
- status

Use labels such as:

```text
EXPERIMENT
PROTOTYPE
RESEARCH
BUILDING
```

This page gives Nylvex room to demonstrate things that aren't complete commercial products.

---

# 16. ABOUT PAGE

The About page should establish the person behind Nylvex.

Structure:

### Nylvex

> Nylvex is an AI and software engineering studio focused on building intelligent systems and practical software.

Then:

### Built by Fahad

Introduce Fahad naturally.

Do not write exaggerated claims.

Focus on:

- Python
- AI
- software engineering
- systems
- experimentation
- building products

Include GitHub and relevant professional links.

Keep it concise.

---

# 17. CONTACT / CLIENT CONVERSION

This is a business website.

The contact experience must be excellent.

Heading:

> Have a problem worth solving?

Supporting copy:

> Tell me what you're trying to build. I'll help determine the right technical approach.

Create a project inquiry form.

Fields:

- Name
- Email
- Company
- What are you trying to build?
- What problem are you trying to solve?
- Existing system
- Required integrations
- Budget range
- Timeline

Do not make the form unnecessarily long.

Provide an alternative:

> Prefer email?

with the configured contact email.

Validate inputs.

Provide excellent success/error states.

Do not expose API keys.

---

# 18. AI PORTFOLIO ASSISTANT

Create the architecture for a future feature called:

> Ask Nylvex

This should eventually allow visitors to ask questions about:

- Nylvex capabilities
- projects
- technologies
- services
- relevant case studies

Example:

User:

> I need an AI support system for my SaaS.

Assistant:

> Based on your requirements, a RAG-based support assistant with tool access would be a strong fit. You can explore the Knowledge Intelligence project for a similar architecture.

Then:

> View project →

IMPORTANT:

Do not build a fake AI chatbot that simply returns hardcoded responses.

If the AI functionality is not configured yet, create a clean architecture and a disabled/demo state.

Never expose LLM API keys in the browser.

---

# 19. NAVIGATION

Desktop navigation:

```text
NYLVEX

Work
Capabilities
Lab
About
Contact

[ Start a project ]
```

Mobile navigation should be simple and accessible.

The navigation should remain unobtrusive.

Do not create an oversized navigation bar.

---

# 20. MICROINTERACTIONS

Use animation sparingly.

Good examples:

- subtle page transitions
- project image reveal
- text reveal
- hover states
- subtle navigation transitions
- smooth scrolling
- architecture diagram animations
- button interaction

Avoid:

- constant floating elements
- parallax everywhere
- infinite animations
- excessive spring physics
- animated backgrounds
- cursor-following gimmicks

The site should still look excellent if all animation is disabled.

---

# 21. TYPOGRAPHY

Typography should be one of the primary design elements.

Use a modern professional sans-serif.

Possible choices:

- Geist
- Inter
- IBM Plex Sans
- Manrope

Choose ONE primary font family.

Do not use five different fonts.

Create a strong hierarchy:

- display
- heading
- body
- metadata
- labels

Large headlines should feel confident but not absurdly oversized.

---

# 22. PROJECT VISUALS

Do not use stock images.

Where possible, create project visuals from:

- real screenshots
- architecture diagrams
- product UI
- terminal output
- charts
- system diagrams
- real demos

If assets aren't available yet, create tasteful placeholders clearly marked as placeholders.

Never create fake product screenshots that could be mistaken for actual functionality.

---

# 23. SEO

Implement proper SEO from the beginning.

Include:

- title metadata
- descriptions
- Open Graph metadata
- Twitter/X metadata
- canonical URLs
- sitemap
- robots.txt
- structured data where appropriate

The homepage title should communicate the positioning.

Example:

> Nylvex — AI & Software Engineering Studio

Do not keyword-stuff.

---

# 24. ANALYTICS

Prepare the site for privacy-conscious analytics.

Track useful events such as:

```text
project_view
project_demo_click
github_click
contact_started
contact_submitted
capability_view
lab_demo_click
```

Do not collect unnecessary personal information.

---

# 25. SECURITY

Follow production security practices.

Never expose:

- API keys
- database credentials
- secrets
- environment variables

Use:

```text
.env.local
.env.example
```

Keep secrets server-side.

Sanitize and validate user input.

If the contact form has an API endpoint, implement appropriate spam protection and rate limiting.

---

# 26. GITHUB / DEVELOPMENT WORKFLOW

The project must be Git-friendly.

Before making major changes:

1. Inspect the existing repository.
2. Understand its current state.
3. Do not overwrite existing work unnecessarily.
4. Make changes incrementally.
5. Run tests/build/lint.
6. Fix errors.
7. Commit meaningful changes.

Use conventional commit-style messages where practical:

```text
feat: build homepage
feat: add project case studies
feat: add contact workflow
refactor: improve project architecture
fix: resolve mobile navigation issue
style: refine typography
```

After completing meaningful milestones, commit the work.

If a GitHub remote is already configured, push changes when appropriate.

Do NOT force push.

Do NOT rewrite Git history.

Do NOT delete unrelated repositories/files.

---

# 27. DEVELOPMENT PROCESS

Follow this workflow.

## Phase 1 — Audit

Before writing code:

- inspect repository
- inspect package.json
- inspect existing files
- inspect Git configuration
- determine whether a project already exists
- identify available assets

Do not blindly initialize a new project if one already exists.

---

## Phase 2 — Architecture

Plan:

- routes
- component structure
- design tokens
- data models
- project schema
- responsive behavior

Then implement.

---

## Phase 3 — Foundation

Build:

- typography
- colors
- spacing
- navigation
- buttons
- layout
- container system
- responsive breakpoints

---

## Phase 4 — Homepage

Build:

1. Hero
2. Selected Work
3. Capabilities
4. Lab preview
5. Process
6. About preview
7. CTA
8. Footer

---

## Phase 5 — Project System

Build reusable project data and dynamic case-study pages.

---

## Phase 6 — Supporting Pages

Build:

- Capabilities
- Lab
- About
- Contact

---

## Phase 7 — Polish

Audit:

- desktop
- tablet
- mobile
- accessibility
- performance
- SEO
- animations
- spacing
- typography
- forms

---

# 28. QUALITY BAR

Before considering the project finished, ask:

### Design

Does this look like a premium engineering studio?

Would a serious SaaS founder trust this company with an important project?

Does it avoid the generic AI-template aesthetic?

### Content

Can a visitor understand what Nylvex does within 10 seconds?

Can they understand what can actually be built?

Are projects concrete?

Are claims honest?

### Engineering

Is the code maintainable?

Is the site responsive?

Are there console errors?

Does the production build succeed?

Are components reusable?

Are there accessibility issues?

### Conversion

Can someone easily contact Nylvex?

Is the CTA clear?

Does the site establish credibility before asking for contact?

---

# 29. IMPORTANT: DO NOT OVERBUILD

Do not build unnecessary functionality.

Do not create:

- unnecessary authentication
- unnecessary database tables
- unnecessary APIs
- unnecessary admin panels
- unnecessary CMS
- unnecessary AI features
- unnecessary animations

The portfolio should be **simple underneath and sophisticated on top**.

---

# 30. FINAL DESIGN TEST

Before finishing, compare the result mentally against:

- generic developer portfolios
- AI-generated websites
- SaaS landing-page templates
- agency templates

If it looks like something that could have been generated from a generic prompt:

**REDESIGN IT.**

The goal is not to maximize visual effects.

The goal is to create something that feels:

> **Designed.**

Every section should have a reason to exist.

Every animation should have a purpose.

Every visual should communicate something.

Every technology shown should be backed by actual capability.

Every project should tell a story.

Every CTA should move the visitor toward becoming a client.

---

# 31. THE CORE PRINCIPLE

Nylvex should communicate:

> **We don't just use AI. We engineer systems around it.**

That distinction should be visible throughout the website.

Build the website accordingly.

Start by auditing the repository and then implement the foundation and homepage.

Do not stop after creating a visual mockup.

Build the actual production-quality application.

At the end of each major milestone:

1. Run lint.
2. Run type checking.
3. Run the production build.
4. Fix all errors.
5. Review the UI responsively.
6. Commit the milestone to Git.
7. Continue to the next milestone.

Do not claim a feature is complete unless it actually works.