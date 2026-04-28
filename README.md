# RSM Wireframe Prototype

A React-based interactive prototype exploring simplified Site Editor workflows for WordPress, focusing on managing pages, content, and site design in a streamlined interface.

## Overview

This prototype reimagines the WordPress Site Editor to address complexity challenges while remaining grounded in practical implementation realities. The goal is to explore interface patterns and workflows that could realistically be adopted in the real WordPress Site Editor without requiring a complete rebuild.

**Core Principles:**
- **Simplify without reinventing** - Build on existing WordPress patterns rather than creating entirely new paradigms
- **Progressive disclosure** - Hide complexity until users need it, but keep it accessible
- **Clear information architecture** - Group related functionality logically to reduce cognitive load
- **Practical applicability** - Every pattern tested here should be implementable in the real Site Editor

This is a working prototype - features and workflows evolve as we test and learn. Rather than documenting specific UI elements here, explore the prototype directly to see current patterns being tested.

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing
- **@wordpress/components** - WordPress UI components (Button, Tooltip, ButtonGroup)
- **@wordpress/icons** - WordPress icon library
- **Plain CSS** - Styling with CSS custom properties

## Quick Start

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The prototype will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
rsm-prototyping/
├── src/
│   ├── components/
│   │   ├── views/           # Main view components
│   │   │   ├── PreviewView.jsx
│   │   │   ├── EditingView.jsx
│   │   │   ├── PagesView.jsx
│   │   │   └── SectionInserter.jsx
│   │   ├── modals/          # Modal dialogs
│   │   │   ├── SiteIdentityModal.jsx
│   │   │   └── PagesFloatingPanel.jsx
│   │   ├── shared/          # Reusable components
│   │   │   ├── UrlBar.jsx
│   │   │   └── LiveBadge.jsx
│   │   ├── Sidebar.jsx      # Main navigation sidebar
│   │   ├── Topbar.jsx       # Top decorative strip
│   │   └── PagesStrip.jsx   # Pages list in sidebar
│   ├── layouts/
│   │   └── RootLayout.jsx   # Root layout with Outlet
│   ├── router/
│   │   └── routes.jsx       # Route definitions
│   ├── hooks/
│   │   └── useAppState.jsx  # Global state management
│   ├── data/
│   │   └── mockData.js      # Mock data (pages, sections, site info)
│   ├── styles/
│   │   └── index.css        # All styles
│   ├── App.jsx
│   └── main.jsx
├── public/
├── index.html
├── vite.config.js
└── package.json
```



## Development Notes

### React Version
The project uses React 18 (not 19) due to peer dependency requirements from `@wordpress/icons` and `@wordpress/components`.

### Vite Configuration
The `vite.config.js` includes:
- React deduplication to prevent multiple React instances
- Aliases to ensure single React instance with WordPress packages

### Styling Approach
- All styles in a single CSS file (`src/styles/index.css`)
- Custom properties for colors and spacing
- No CSS modules or CSS-in-JS
- WordPress component styles imported in `main.jsx`

## Git Workflow

This project uses `trunk` as the main branch. When making changes:

1. Create feature branches from `trunk`
2. Commit frequently with descriptive messages
3. Use conventional commit format: `feat:`, `fix:`, `refactor:`, etc.
4. Merge back to `trunk` when complete

## Future Exploration Areas

Potential areas to test and validate:

**Interface Patterns:**
- Complete placeholder views (Content, Navigation, Design)
- Advanced menu implementations (Templates, Patterns, Template Parts)
- Template hierarchy visualization
- Block pattern browsing and insertion
- Global styles management

**Workflows:**
- Template editing vs. page editing flows
- Navigating between site-level and page-level settings
- Understanding template inheritance
- Managing reusable patterns vs. one-off sections

**Edge Cases:**
- Sites with many pages (100+)
- Complex template hierarchies
- Multiple page templates per post type
- Plugin-generated system pages
- Theme-provided patterns and templates

Remember: Each addition should answer "Could this realistically ship in WordPress?" and "Does this solve a real user problem?"

## Purpose & Design Philosophy

This prototype tackles WordPress Site Editor complexity through iterative exploration of interface patterns. Rather than proposing a complete redesign, it tests specific improvements that could be incrementally adopted:

**Problem Space:**
- WordPress Site Editor's current interface can be overwhelming, especially for managing pages, templates, and site-wide settings
- Users struggle to understand the distinction between pages, templates, patterns, and other building blocks
- Navigation and information architecture don't scale well as sites grow in complexity

**Solution Approach:**
- **Tested patterns over theory** - Every UI decision is validated through working prototypes
- **Incremental improvement** - Focus on changes that can be adopted piece-by-piece in production
- **Familiar foundations** - Leverage existing WordPress concepts (pages, patterns, templates) rather than inventing new mental models
- **Clear hierarchies** - Use visual design, grouping, and progressive disclosure to clarify relationships

**What Makes This Different:**
This isn't a vision mockup or blue-sky redesign. It's a working prototype built with production constraints in mind:
- Uses real WordPress components and design system
- Respects WordPress's extensibility requirements (plugins, themes)
- Considers backward compatibility and migration paths
- Tests ideas that could ship incrementally, not just "all or nothing"

**Outcomes:**
Patterns validated here can inform WordPress core improvements, providing concrete examples of:
- How to organize page management more clearly
- How to surface system vs. user content appropriately
- How to make advanced features accessible without cluttering common workflows
- How to maintain familiar patterns while improving information architecture

## License

Internal prototype - not for public distribution.
