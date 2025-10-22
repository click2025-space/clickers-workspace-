# Clickers Workspace

A modern team management and productivity platform built with React, TypeScript, and Supabase.

## Features

- 🔐 **Authentication** - Secure user authentication with Supabase Auth
- 💬 **Team Chat** - Real-time messaging and team communication
- 📋 **Task Management** - Kanban-style task board with drag & drop
- 👥 **Team Management** - Member profiles and role management
- 📊 **Dashboard** - Analytics and project overview
- 🏢 **Workspace** - Personal notes, files, and data management
- ⚙️ **Settings** - Customizable workspace configuration

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build system
- **TanStack Query** for server state management
- **Wouter** for routing
- **shadcn/ui** component library
- **Tailwind CSS** for styling
- **Framer Motion** for animations

### Backend
- **Supabase** for database and authentication
- **Express.js** API server
- **PostgreSQL** database
- **Row Level Security (RLS)** for data protection

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/click2025-space/clickers-workspace-.git
cd clickers-workspace-
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Fill in your Supabase credentials in the `.env` file.

4. Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:8080`

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set up environment variables in Vercel dashboard
4. Deploy!

### Environment Variables

Make sure to set these in your deployment platform:

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `NODE_ENV=production`

## Database Setup

The app uses Supabase with the following main tables:

- `profiles` - User profile information
- `messages` - Chat messages
- `members` - Team member data
- `tasks` - Task management
- `projects` - Project information
- `departments` - Department structure
- `workspace_notes` - Personal notes
- `workspace_files` - File management
- `workspace_data` - Custom data storage

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details
