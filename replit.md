# Clickers Workspace

## Overview

Clickers Workspace is a modern, professional digital workspace application designed for managing teams, organizing tasks, and facilitating collaborative work in a virtual office environment. The application emphasizes a clean, minimalist design with purple and blue brand accents, drawing inspiration from Linear's modern minimalism, Notion's information architecture, and Asana's task management patterns.

The system is built as a full-stack web application featuring a React-based frontend with TypeScript, an Express backend, and PostgreSQL database integration through Drizzle ORM. The application provides comprehensive project management, department organization, task tracking, team collaboration, and real-time communication capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build Tools:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server, providing fast HMR (Hot Module Replacement)
- Wouter for lightweight client-side routing instead of React Router

**UI Component System:**
- Shadcn/ui components built on Radix UI primitives for accessible, headless component architecture
- TailwindCSS for utility-first styling with custom design tokens
- Design system follows "new-york" style variant with customized purple-blue brand theming
- Dark mode as primary theme with light mode support through ThemeProvider context

**State Management:**
- TanStack Query (React Query) for server state management, data fetching, and caching
- Local React state and context for UI state (theme, sidebar, etc.)
- No global state management library (Redux, Zustand) - relies on React Query's caching

**Styling Approach:**
- CSS custom properties for theming (HSL color values in index.css)
- Utility classes with semantic color tokens (primary, secondary, muted, accent, destructive)
- Responsive design with mobile-first breakpoints
- Custom elevation effects (hover-elevate, active-elevate-2) for interactive elements

**Key Design Decisions:**
- Professional productivity-focused interface over decorative elements
- Consistent spacing and border radius (9px/6px/3px system)
- Typography using Inter for headings/UI and IBM Plex Sans for body text
- Purple-blue gradient brand colors (HSL 270 70% 60% to 220 75% 55%)

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript for RESTful API
- Native ES modules (type: "module" in package.json)
- Middleware for JSON parsing, URL encoding, and request/response logging

**API Structure:**
- RESTful endpoints following resource-based conventions
- Route organization in `/api/*` namespace
- CRUD operations for: projects, departments, tasks, members, messages, settings
- Zod schema validation on all POST/PATCH endpoints using drizzle-zod integration

**Data Layer:**
- Storage abstraction interface (IStorage) for potential multiple implementations
- Currently using in-memory storage, but designed for easy database integration
- UUID-based identifiers for all entities
- Array fields for relationships (e.g., teamMembers in projects/departments)

**Development Workflow:**
- Separate dev/build/start scripts for development and production
- TypeScript compilation checking without emit (bundled by esbuild for production)
- Vite middleware integration in development for SSR-like experience
- Custom logging with formatted timestamps

**Key Design Decisions:**
- Monorepo structure with shared schema definitions between client and server
- Path aliases (@/, @shared/, @assets/) for clean imports
- Environment-based configuration (NODE_ENV, DATABASE_URL)
- API responses captured and logged for debugging

### Database Architecture

**ORM & Schema:**
- Drizzle ORM with PostgreSQL dialect
- Type-safe schema definitions in shared/schema.ts using drizzle-orm/pg-core
- Zod schemas generated from Drizzle schemas for runtime validation
- Migration support through drizzle-kit

**Data Models:**
1. **Projects** - name, description, progress, department, teamMembers array
2. **Departments** - name, icon, description, teamMembers array
3. **Tasks** - title, description, status, assignedTo, dueDate, projectId
4. **Members** - name, email, role, department, avatar, status
5. **Messages** - senderId, content, timestamp
6. **Settings** - workspace configuration (workspaceName, etc.)

**Database Connection:**
- Neon serverless PostgreSQL driver for edge/serverless compatibility
- Connection via DATABASE_URL environment variable
- UUID generation using SQL gen_random_uuid()
- Array types for many-to-many relationships (stored as PostgreSQL arrays)

**Key Design Decisions:**
- Schema-first approach with single source of truth in shared/schema.ts
- Text/varchar types for flexibility over strict enums
- Timestamps stored as text for simplicity (could be enhanced to proper timestamp types)
- Default values defined at database level (e.g., empty arrays, default statuses)

### Application Features

**Core Pages:**
1. **Dashboard** - Overview with project cards, statistics, and progress visualization
2. **Virtual Offices** - Department browsing with detail views showing team and tasks
3. **Tasks Board** - Kanban-style drag-and-drop interface (todo/in-progress/done columns)
4. **Team Chat** - Member list and message interface (frontend-only for now)
5. **Members** - Team directory with CRUD operations and search
6. **Settings** - Workspace configuration and theme management

**Component Architecture:**
- Reusable UI components in client/src/components/ui/
- App-level components (AppSidebar, Header, Footer) for layout
- Page components in client/src/pages/
- Form handling with react-hook-form and Zod validation

## External Dependencies

### Database & ORM
- **@neondatabase/serverless** - Serverless PostgreSQL driver optimized for edge deployments
- **drizzle-orm** - TypeScript ORM with SQL-like syntax and type inference
- **drizzle-zod** - Automatic Zod schema generation from Drizzle schemas

### UI & Component Libraries
- **@radix-ui/react-*** - 20+ headless accessible UI primitives (dialog, dropdown, accordion, etc.)
- **shadcn/ui** - Pre-built component system configured via components.json
- **TailwindCSS** - Utility-first CSS framework with custom configuration
- **class-variance-authority** - Variant-driven component styling API
- **cmdk** - Command menu component for keyboard-driven interfaces
- **embla-carousel-react** - Touch-enabled carousel component

### Data Fetching & Forms
- **@tanstack/react-query** - Async state management and data synchronization
- **react-hook-form** - Performant form state management with minimal re-renders
- **@hookform/resolvers** - Resolver integration for Zod schema validation
- **zod** - TypeScript-first schema validation library

### Utilities & Tooling
- **wouter** - Minimalist routing library (~1.5KB)
- **date-fns** - Modern date utility library
- **clsx** & **tailwind-merge** - Utility for conditional class name construction
- **lucide-react** - Icon library with tree-shaking support

### Development Tools
- **vite** - Next-generation frontend build tool
- **@vitejs/plugin-react** - React Fast Refresh plugin for Vite
- **typescript** - Static type checking
- **tsx** - TypeScript execution environment for Node.js
- **esbuild** - JavaScript/TypeScript bundler for production builds
- **@replit/vite-plugin-*** - Replit-specific development plugins (cartographer, error modal, dev banner)

### Backend & Session Management
- **express** - Web application framework
- **connect-pg-simple** - PostgreSQL session store for Express (configured but storage is currently in-memory)

### Type Safety & Validation
All external API interactions validated through Zod schemas derived from Drizzle ORM definitions, ensuring end-to-end type safety from database to UI forms.