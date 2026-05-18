# Create, Not Learn

> A prototype reimagining the WordPress Site Editor around what users want to do — not how WordPress is built.

<!-- Screenshot: replace the line below with an actual screenshot once one is available -->
<!-- ![Prototype screenshot showing the simplified Site Editor](./docs/screenshot.png) -->

---

## The problem

WordPress is one of the most powerful website building tools on the planet. But somewhere along the way, the Site Editor started teaching users how WordPress works rather than helping them build their website.

Classic WordPress handled this well. System-level concepts — templates, reading settings, theme structure — lived in the code layer, the concern of developers and theme authors rather than website owners. For everyone else, the Customizer provided a deliberately bounded interface: site name and logo, colours and typography, menus, header and footer. Users never needed to understand how WordPress worked to use it effectively.

The Site Editor changed that. Far more capable than anything before it, it nonetheless dismantled that insulation without replacing it:

- The Customizer gave way to an interface that exposes the full system model by default
- Purpose-built interfaces like the Menus screen were replaced by block-based equivalents like the Navigation block, exposing complexity rather than hiding it
- Developer-level concepts — templates, template parts, patterns, query loops — became primary navigation items presented directly to beginners

The problem isn't the power of the Site Editor — it's that **system-level concepts have been made first-class user concerns**. This prototype explores how to keep those concepts out of the user's way — not by limiting what the Site Editor can do, but by reimagining how it presents itself.

---

## What this is

An interactive prototype testing what the Site Editor could look and feel like if it were organised around what users want to do — not how WordPress is structured under the hood.

Rather than working inside the Gutenberg plugin codebase, this is built as a simulated editor: clickable, interactive, and designed to feel like the real thing, but running on mock data rather than a live WordPress install. That was a deliberate choice.

Working directly in Gutenberg means contending with API design, plugin architecture, code review, and merge timelines — the right constraints for production code, but the wrong ones for rapid exploration of UI concepts. Here, a new interface idea can go from thought to working prototype in hours. AI-assisted development accelerates this further. The goal is to move fast, try things, discard what doesn't work, and arrive at validated ideas worth the investment of real implementation.

Because the prototype is built using real WordPress packages — the same components, design system, and UI primitives used in Gutenberg itself — everything it demonstrates is grounded in what the real editor can actually do. There is no translation gap between what you see here and what is achievable in the real codebase.

## What this is not

**Not a pull request to WordPress Core.** This is a prototype for learning and discussion. The goal is validated signal, not shipped code.

**Not a redesign of WordPress architecture.** Templates, template parts, patterns, and the block system stay entirely intact. This prototype tests changes to entry points, language, and what is visible by default — all within the WordPress architecture that already exists. Nothing breaks; things are reframed.

**Not removing power-user features.** Progressive disclosure means complexity is available — it is just not the first thing every user encounters. Anything simplified for beginners must remain reachable for advanced users.

---

## Who this is for

Two primary personas, equally weighted.

**The first-time beginner.** Their first website, on any platform. Has no mental model for how a site is built — no concept of templates, template parts, patterns, or blocks. Confidence is fragile: a few minutes of confusion is enough to cause abandonment. Success means reaching a believable first draft without hitting a wall.

**The beginner migrator.** Has built a site before on Wix, Squarespace, or similar. Understands the basics — header, footer, pages, menus, colours, fonts — but nothing WordPress-specific. Will actively try to map familiar mental models onto the editor and be frustrated when nothing aligns.

**Advanced users are a boundary condition, not a primary audience.** Developers, theme authors, and experienced WordPress users are not the target of this prototype — but they define a hard constraint. Anything simplified or hidden for beginners must remain reachable for this group. The goal is progressive disclosure, not removal.

---

## The journey this prototype is optimised for

Every decision — what is shown, what is hidden, what happens automatically — is grounded in research into how beginners actually build a site. That research spans public educator evidence, internal studies across Automattic's WordPress products, and direct user testing of the prototype itself.

**1 — Orientation.** The user arrives and immediately needs to know: this is my site, and here is what I can do. They don't read before acting — orientation and the first action happen together.

**2 — Site identity.** Before building anything, users want the site to feel like theirs. Site name and logo — nothing else. Every other setting can wait.

**3 — Pages and navigation.** Users carry a single connected model: *I have pages, and some of them are in my menu.* Pages and navigation are one concern, not two separate admin surfaces. Creating a page, giving it a layout, and adding it to the menu all happen in one flow.

**4 — Content editing.** Users go to the homepage first. They edit sections, adjust text and images, and make the site feel real. At no point should they need to know what a template is, or encounter the word "pattern" as a primary noun.

**5 — Design.** Once structure and content are in place, users turn to the overall look: colour, typography, layout. Research is consistent — strategy first, aesthetics second. The current Site Editor reverses this order. This prototype corrects it.

**6 — Preview and confidence.** Users want to see their site exactly as a visitor would, and trust that what they see matches what gets published. The gap between editor preview and published output is a first-class problem here, not an edge case.

---

## Design principles

These are the principles the editor is being designed around — derived from research, not from the prototype approach.

**Progressive disclosure is the governing principle.**
Complexity is revealed as users need it, based on the tasks they are undertaking. No novice, intermediate, or advanced modes. The editor starts simple and complexity surfaces naturally as actions require it.

**System concepts should power the UI without defining it.**
WordPress's internal architecture — templates, template parts, patterns, query loops — is powerful and must stay accessible. But these are implementation details, not user goals. They should not be the primary navigation or interaction model.

**The editor is the foundation — not the onboarding.**
Users arrive through many routes. All of them end in the editor. If the editor requires onboarding to compensate for its complexity, every onboarding method fails. Onboarding can be added on top; it is not the fix.

**Don't require blocks for site setup tasks.**
Setting a site name, uploading a logo, creating a page, building a menu — none of these should require block manipulation. Where a simpler path exists, it should be the default.

**Everything is a page.**
Users understand pages. They do not understand templates, template parts, or template hierarchy. Content pages (About, Contact, Services) and system pages (Home, 404, Search Results) are presented through a single surface. The underlying implementation is hidden by default.

**Strategy before design.**
Structure first — what pages exist, how they connect, what the homepage is. Design second — colours, fonts, layout. The current editor reverses this. This prototype corrects it.

---

## Contributing

### Getting started

**Prerequisites:** Node.js 18+

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

```bash
# Production build
npm run build && npm run preview
```

### Tech stack

Built with React and real WordPress UI packages — the same components, design system, and primitives used in Gutenberg itself. This means everything demonstrated here is grounded in what the real editor can do, with no translation needed when ideas move to real implementation.

### Project structure

```
src/
├── components/
│   ├── views/        # Main views (PagesView, EditingView, NavigationView, StylesView…)
│   ├── navigation/   # Navigation menu editor
│   ├── modals/       # Modal dialogs
│   └── shared/       # Reusable utility components
├── layouts/          # RootLayout, SplitViewLayout
├── router/           # Route definitions
├── hooks/            # useAppState — global state
├── data/             # mockData.js — pages, menus, sections, site info
└── styles/           # CSS organised by view and component
```

### Workflow

**Branches:** `trunk` is the main branch. Use feature branches per change, merged via PR.

**Commits:** conventional format — `feat:`, `fix:`, `refactor:`, `style:`, `docs:`

**Parallel worktrees:** use git worktrees when you want multiple features or AI agents running at the same time, each with its own checkout and localhost preview.

```bash
npm run worktree:create -- feature/my-change
cd ../rsm-prototyping-feature-my-change
npm run dev
```

The worktree command creates or reuses the branch, installs dependencies with `npm ci`, writes `.env.local`, and assigns a stable local port from `5174-5973`. The main checkout conventionally stays on `5173`.

The dev preview URL stays a normal localhost URL, for example `http://localhost:5174/`. In development, the prototype shows a bottom-right icon. Click it to see the branch, port, and full preview URL.

Optional explicit port:

```bash
npm run worktree:create -- feature/my-change 5180
```

### Principles

Before adding something new, check it against three questions:

- *Can this be reframed rather than replaced?* Work with existing WordPress concepts — templates, template parts, patterns — rather than inventing new ones.
- *Could this ship in real WordPress?* If it requires a ground-up rebuild or breaks existing architecture, it doesn't belong here.
- *Does it stand alone?* Changes should be independently useful, not dependent on the rest of the redesign shipping first.

---

## License

GPL-2.0, consistent with WordPress.
