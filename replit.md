# Milk Supply Chain Management System

## Overview

This is a full-stack web application for managing milk supply chain operations. The system handles milk receiving from vendors, distribution to customers, payments, and reporting. It uses a modern tech stack with React frontend, Express backend, and PostgreSQL database.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Radix UI components with shadcn/ui styling
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: Firebase Realtime Database with custom hooks
- **Data Fetching**: Firebase SDK with real-time subscriptions
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js (minimal, mainly for development)
- **Language**: TypeScript with ES modules
- **Database**: Firebase Realtime Database
- **Real-time**: Firebase real-time subscriptions for live data updates
- **Authentication**: Firebase Auth (configured but not implemented)

### Database Design
- **Database**: Firebase Realtime Database
- **Schema Location**: `shared/schema.ts` - shared validation schemas
- **Collections**:
  - `vendors`: Milk suppliers with contact info and rates
  - `customers`: Milk buyers with contact info and rates
  - `milk_transactions`: Records of milk received/sent with quantity, fat, SNF
  - `payments`: Financial transactions between parties
- **Real-time Updates**: All data syncs in real-time across all connected clients

## Key Components

### Shared Schema
- Uses Drizzle ORM with PostgreSQL dialect
- Zod validation schemas generated from database schema
- Type-safe data models shared between frontend and backend

### Frontend Components
- **Pages**: Dashboard, Vendors, Customers, MilkReceiving, MilkSending, Payments, Reports
- **Forms**: Reusable form components for CRUD operations
- **Tables**: Data display components with filtering and actions
- **Layout**: Responsive layout with sidebar navigation and mobile support
- **UI Components**: Complete shadcn/ui component library

### Backend Services
- **Storage Layer**: Abstract storage interface with in-memory implementation
- **Routes**: RESTful endpoints for all entities
- **Validation**: Zod schemas for request validation
- **Error Handling**: Centralized error handling middleware

## Data Flow

1. **Client Request**: React components dispatch Redux actions
2. **State Management**: Redux Toolkit manages application state
3. **API Calls**: TanStack Query handles server communication
4. **Backend Processing**: Express routes validate and process requests
5. **Database Operations**: Drizzle ORM executes SQL queries
6. **Response**: Data flows back through the same chain

## External Dependencies

### Core Dependencies
- **Database**: Neon serverless PostgreSQL
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React icons
- **Date Handling**: date-fns for date manipulation
- **Form Validation**: Zod for schema validation
- **State Management**: Redux Toolkit + React Query

### Development Dependencies
- **Build Tools**: Vite, esbuild for production builds
- **Type Checking**: TypeScript with strict mode
- **Database Tools**: Drizzle Kit for migrations
- **Development Server**: tsx for TypeScript execution

## Deployment Strategy

### Build Process
- Frontend: Vite builds optimized static assets to `dist/public`
- Backend: esbuild bundles server code to `dist/index.js`
- Database: Drizzle pushes schema changes to PostgreSQL

### Environment Configuration
- Database connection via `DATABASE_URL` environment variable
- Development vs production modes handled via `NODE_ENV`
- Replit-specific integrations for development environment

### File Structure
- `client/`: React frontend application
- `server/`: Express backend application  
- `shared/`: Common TypeScript definitions and schemas
- `migrations/`: Database migration files
- Root level: Configuration files and package management

The application follows a monorepo structure with clear separation between frontend, backend, and shared code. The architecture supports both development and production deployments with proper error handling and type safety throughout the stack.