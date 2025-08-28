# Overview

This is a full-stack web application built with React on the frontend and Express.js on the backend. The project uses modern web technologies including TypeScript, Vite for bundling, and shadcn/ui for the component library. The application appears to be structured as a contact form/page application with a clean, modern dark-themed design.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Routing**: Wouter for client-side routing (lightweight alternative to React Router)
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Forms**: React Hook Form with Zod for validation
- **Animations**: Framer Motion for smooth animations and transitions
- **Build Tool**: Vite for fast development and optimized builds

The frontend follows a component-based architecture with reusable UI components in the `client/src/components/ui` directory. The main application logic is contained in pages, with the current implementation featuring a contact page as the primary interface.

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Session Management**: Express sessions with PostgreSQL session store (connect-pg-simple)
- **Storage Layer**: Abstracted storage interface with in-memory implementation for development
- **API Structure**: RESTful API design with `/api` prefix for all endpoints
- **Development Tools**: Hot reloading and error handling middleware

The backend uses a layered architecture with separate concerns for routing, storage, and business logic. The storage layer is abstracted through an interface, making it easy to switch between different storage implementations.

## Database Design
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: Shared schema definitions in `/shared/schema.ts`
- **Migrations**: Drizzle Kit for database migrations in `/migrations` directory
- **Current Schema**: User management with username/password authentication

The database schema is co-located with TypeScript types, ensuring type safety across the full stack.

## Development Workflow
- **Monorepo Structure**: Single repository with shared types between frontend and backend
- **Hot Reloading**: Vite middleware integrated with Express for seamless development
- **Type Safety**: Shared TypeScript types between client and server
- **Path Aliases**: Configured for clean imports (`@/`, `@shared/`)

# External Dependencies

## Database
- **PostgreSQL**: Primary database with Neon Database serverless driver
- **Connection**: Environment-based DATABASE_URL configuration
- **Session Store**: PostgreSQL-backed session storage for user sessions

## UI and Styling
- **Radix UI**: Headless UI primitives for accessibility and behavior
- **Tailwind CSS**: Utility-first CSS framework with custom theming
- **Lucide Icons**: Icon library for consistent iconography
- **Google Fonts**: Inter font family for typography

## Development and Build Tools
- **Vite**: Build tool and dev server with React plugin
- **TypeScript**: Static type checking across the entire stack
- **ESBuild**: Fast bundling for production builds
- **PostCSS**: CSS processing with Autoprefixer

## Form and Validation
- **React Hook Form**: Performance-focused form library
- **Zod**: TypeScript-first schema validation
- **Hookform Resolvers**: Integration between React Hook Form and Zod

## Animation and Interaction
- **Framer Motion**: Production-ready motion library for animations
- **Embla Carousel**: Touch-friendly carousel component
- **Date-fns**: Modern JavaScript date utility library

The application is designed to be deployed on Replit with integrated development tools and error handling for the Replit environment.