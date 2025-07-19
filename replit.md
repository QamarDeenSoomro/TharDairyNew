# Thar Dairy - Milk Supply Management System

## Overview

Thar Dairy's comprehensive milk supply management system for efficient dairy operations. The system handles milk receiving from vendors, distribution to customers, payments, and reporting. Built with modern tech stack including React frontend, Firebase backend, and real-time data synchronization.

## User Preferences

- Preferred communication style: Simple, everyday language
- Remove Fat% and SNF% fields from milk forms (completed)
- Make application mobile responsive (completed)
- Add ledger functionality with WhatsApp sharing for vendors and customers (completed)
- Convert to Progressive Web App (PWA) for offline functionality (completed)
- Rebrand application to "Thar Dairy" (completed)
- SMS notifications with Pakistan (+92) country code that open native messaging app (completed)
- Daily expenses tracking system integrated with profit calculations (completed)

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
- **PWA Features**: Service workers for offline functionality, IndexedDB for offline storage

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
- **UI Components**: Complete shadcn/ui component library with mobile responsiveness
- **Mobile Design**: Responsive card layouts for tables, adaptive form grids, flexible navigation
- **Ledger System**: Individual ledgers for vendors/customers with date filtering and WhatsApp sharing
- **PWA Components**: Install prompt, offline indicator, background sync, service worker integration

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
- Backend: No server required - pure static hosting
- Database: Firebase Realtime Database (cloud-hosted)

### Environment Configuration
- Firebase configuration via `VITE_FIREBASE_*` environment variables
- Development vs production modes handled via `NODE_ENV`
- Vercel deployment ready with `vercel.json` configuration

### Vercel Deployment
- **Status**: Ready for deployment as PWA (Build Fixed)

### Android APK Generation
- **Status**: ✅ Successfully building APKs - Java version compatibility issues resolved
- **App ID**: com.thardairy.app
- **App Name**: Thar Dairy
- **Build Tools**: Capacitor 7.4.2 with Android platform support
- **Requirements**: Java 17+ (LTS recommended) and Android SDK for local building
- **Java Issue Fix**: ✅ Fixed - Triple-layer Java 17 override system implemented to resolve Capacitor's Java 21 compatibility issues
- **Build Success**: APK generation confirmed working on Windows with Java 17
- **Scripts**: build-apk.sh automation script and comprehensive APK_BUILD_GUIDE.md
- **Features**: Native Android app with all PWA features, seamless online/offline operation, SMS integration
- **Important**: Use `npx cap sync android` not `npm exec cap sync android`
- **Build Commands**: `npm run build` → `npx cap sync android` → `cd android` → Windows: `gradlew.bat assembleDebug` | macOS/Linux: `./gradlew assembleDebug`
- **Build Command**: `vite build`
- **Output Directory**: `dist/public`
- **Architecture**: JAMstack PWA (JavaScript, APIs, Markup)
- **Database**: Firebase Realtime Database with offline sync
- **Environment Variables**: Firebase configuration keys required
- **PWA Features**: Service workers, web manifest, offline storage, installable app, seamless online/offline operation
- **Recent Fix**: Database backup/restore now preserves original IDs to maintain vendor-customer-transaction relationships
- **SMS Integration**: Native messaging app integration opens device SMS app with pre-filled messages for milk transactions and payments
- **Multilingual SMS**: SMS messages are fully translated based on user's selected language (English/Sindhi)
- **Daily Expenses**: Complete expense tracking system with categories that automatically deduct from profit calculations
- **Country Code**: Updated from India (+91) to Pakistan (+92) for all SMS and WhatsApp communications
- **Current Balance Display**: Payment form now shows real-time current balance of selected party (vendor/customer) with color-coded status indicators
- **Internationalization**: Complete English/Sindhi language support with RTL layout and MB Sindhi font integration
- **Language Selector**: Located in sidebar bottom with Material Icons, avoids mobile navigation overlap
- **Stats Cards**: Improved layout with title row and data/icon columns for better content fitting
- **Firebase Hosting Fix**: Added SPA rewrites to firebase.json to fix 404 errors on direct URL access (January 2025)
- **Vendor Update Fix**: Fixed Firebase database update function naming conflict and added proper vendor editing functionality (January 2025)
- **SMS Debug System**: Added comprehensive debugging system to troubleshoot SMS integration issues across all forms (January 2025)
- **Enhanced Ledger System**: Added previous balance display in messages before date ranges and settlement date tracking to know when accounts were last settled (January 2025)
- **Settlement Detection**: Automatic detection of last settlement date when balance was close to zero, with days since settlement counter
- **Previous Balance Integration**: WhatsApp/SMS messages now show previous balance before filtered date range with final balance calculations
- **Milk Weight Summary**: Added milk weight tracking to ledger summary cards and message generation with period/total calculations (January 2025)
- **Message Confirmation**: Added confirmation dialogs for WhatsApp and SMS sending to prevent accidental message dispatch (January 2025)
- **Form Confirmation Dialogs**: Added confirmation dialogs to all milk transaction and payment forms to prevent accidental submissions with SMS notification previews (January 2025)
- **Enhanced Dashboard Stats**: Updated dashboard service and display to show detailed milk statistics including quantity, amount, and average rates for received/sent milk without icons (January 2025)
- **Dashboard Date Filtering**: Added comprehensive date filtering (today, this week, this month, custom range) with real-time statistics calculation and reorganized milk statistics into single column layout (January 2025)

### File Structure
- `client/`: React frontend application
- `server/`: Express backend application  
- `shared/`: Common TypeScript definitions and schemas
- `migrations/`: Database migration files
- Root level: Configuration files and package management

The application follows a monorepo structure with clear separation between frontend, backend, and shared code. The architecture supports both development and production deployments with proper error handling and type safety throughout the stack.