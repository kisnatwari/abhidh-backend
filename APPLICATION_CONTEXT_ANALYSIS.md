# Application Context Analysis

> **Generated**: October 19, 2025  
> **Application**: Abhidh Backend - Laravel + Inertia.js + React Educational Management System

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Database Schema](#database-schema)
5. [API Structure](#api-structure)
6. [Frontend Structure](#frontend-structure)
7. [Authentication & Authorization](#authentication--authorization)
8. [File Storage](#file-storage)
9. [Key Features](#key-features)
10. [Development Workflow](#development-workflow)
11. [Configuration](#configuration)

---

## Overview

This is a **full-stack educational management system** built with Laravel 12 and React 19, using Inertia.js as the bridge between the backend and frontend. The application manages educational content including blogs, trainers, galleries, programs, courses, and student enrollments.

### Application Type
- **Backend**: Laravel 12 (PHP 8.2+)
- **Frontend**: React 19 + TypeScript + Inertia.js
- **Purpose**: Educational content management and course enrollment system
- **Architecture**: Monolithic with dual interfaces (Web Dashboard + REST API)

---

## Technology Stack

### Backend Dependencies (composer.json)

```json
{
  "laravel/framework": "^12.0",
  "laravel/sanctum": "^4.0",          // API authentication
  "laravel/fortify": "^1.30",         // Authentication scaffolding
  "laravel/telescope": "^5.11",       // Debug/monitoring tool
  "laravel/wayfinder": "^0.1.9",      // Type-safe routing
  "inertiajs/inertia-laravel": "^2.0" // SPA adapter
}
```

### Frontend Dependencies (package.json)

```json
{
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "@inertiajs/react": "^2.1.4",
  "typescript": "^5.7.2",
  "vite": "^7.0.4",
  "tailwindcss": "^4.0.0",
  "@tailwindcss/vite": "^4.1.11",
  
  // UI Components
  "@radix-ui/react-*": "various",     // Headless UI primitives
  "@headlessui/react": "^2.2.0",
  "lucide-react": "^0.475.0",         // Icon library
  
  // Rich Text Editor
  "lexical": "^0.35.0",
  "@lexical/react": "^0.35.0",
  
  // Utilities
  "date-fns": "^4.1.0",
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.0.1",
  "class-variance-authority": "^0.7.1"
}
```

### Build Tools
- **Vite 7**: Frontend build tool
- **Laravel Vite Plugin**: Asset bundling
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Type safety

### Testing
- **Pest**: PHP testing framework
- **PHPUnit**: Unit testing (via Pest)

---

## Architecture

### Hybrid Architecture

The application uses a **dual-interface architecture**:

1. **Inertia.js Web Dashboard** (Primary)
   - Full CRUD operations
   - Server-side rendering (SSR) enabled
   - React SPA experience with Laravel backend
   - Authenticated users only

2. **REST API** (Secondary)
   - Read-only public endpoints
   - Token-based authentication (Sanctum)
   - JSON responses
   - External integrations

### Request Flow

```
┌─────────────────────────────────────────────────────────┐
│                    User Request                          │
└────────────┬────────────────────────────┬────────────────┘
             │                            │
             │ Web Routes                 │ API Routes
             ▼                            ▼
    ┌────────────────┐           ┌────────────────┐
    │ Inertia.js     │           │ REST API       │
    │ Controllers    │           │ Controllers    │
    └────────┬───────┘           └────────┬───────┘
             │                            │
             │ Eloquent ORM               │ Eloquent ORM
             ▼                            ▼
    ┌─────────────────────────────────────────┐
    │         Models & Database               │
    │  (SQLite / MySQL / PostgreSQL)          │
    └─────────────────────────────────────────┘
             │                            │
             │ Inertia Response           │ JSON Response
             ▼                            ▼
    ┌────────────────┐           ┌────────────────┐
    │ React Pages    │           │ API Consumer   │
    │ (SSR/CSR)      │           │ (External)     │
    └────────────────┘           └────────────────┘
```

---

## Database Schema

### Tables & Relationships

#### 1. **Users** (Authentication)
```
users
├── id (PK)
├── name
├── email (unique)
├── password (hashed)
├── email_verified_at
├── two_factor_secret (nullable)
├── two_factor_recovery_codes (nullable)
├── two_factor_confirmed_at (nullable)
├── remember_token
└── timestamps
```

#### 2. **Blogs** (Content Management)
```
blogs
├── id (PK)
├── title
├── slug (unique)
├── image_path (nullable)
├── category (nullable)
├── content (longText)
├── is_published (boolean, default: false)
├── published_at (nullable)
└── timestamps

Relationships:
- None (standalone entity)

Accessors:
- image_url: Generates public URL from image_path
```

#### 3. **Trainers** (Personnel)
```
trainers
├── id (PK)
├── name
├── photo_path (nullable)
├── expertise
├── years_of_experience (integer)
└── timestamps

Relationships:
- None (standalone entity)

Accessors:
- photo_url: Generates public URL from photo_path
```

#### 4. **Galleries** (Photo Albums)
```
galleries
├── id (PK)
├── title
├── description (nullable)
└── timestamps

Relationships:
- hasMany(GalleryPhoto) → ordered by sort_order
```

#### 5. **Gallery Photos** (Gallery Items)
```
gallery_photos
├── id (PK)
├── gallery_id (FK → galleries.id, cascade delete)
├── photo_path
├── caption (nullable)
├── sort_order (integer, default: 0)
└── timestamps

Relationships:
- belongsTo(Gallery)

Accessors:
- photo_url: Generates public URL from photo_path
```

#### 6. **Programs** (Educational Programs)
```
programs
├── id (PK)
├── name
├── description (nullable)
├── category (enum: school|college|corporate|it|digital_marketing)
├── color (varchar 50, nullable) - for UI styling
└── timestamps

Relationships:
- hasMany(Course)

Accessors:
- category_label: Human-readable category name
```

#### 7. **Courses** (Educational Courses)
```
courses
├── id (PK)
├── program_id (FK → programs.id, cascade delete)
├── name
├── description (nullable)
├── duration
├── level (enum: beginner|intermediate|advanced|all_levels, default: all_levels)
├── featured (boolean, default: false)
└── timestamps

Relationships:
- belongsTo(Program)
- hasMany(Enrollment)

Accessors:
- level_label: Human-readable level name
```

#### 8. **Enrollments** (Student Registrations)
```
enrollments
├── id (PK)
├── user_id (FK → users.id, cascade delete)
├── course_id (FK → courses.id, cascade delete)
├── enrollment_date (timestamp, default: now())
├── status (enum: active|completed|dropped, default: active)
├── is_paid (boolean, default: false)
└── timestamps

Relationships:
- belongsTo(User)
- belongsTo(Course)

Accessors:
- status_label: Human-readable status name
```

### Entity Relationship Diagram

```
┌──────────┐
│  Users   │──┐
└──────────┘  │
              │ 1:N
              │
         ┌────▼─────────┐
         │ Enrollments  │
         └────┬─────────┘
              │ N:1
              │
         ┌────▼────┐      ┌───────────┐
         │ Courses │◄─────┤ Programs  │
         └─────────┘ N:1  └───────────┘

┌───────────┐
│ Galleries │──┐
└───────────┘  │ 1:N
               │
          ┌────▼──────────────┐
          │ Gallery Photos    │
          └───────────────────┘

┌──────────┐      ┌──────────┐
│  Blogs   │      │ Trainers │
└──────────┘      └──────────┘
(Standalone)      (Standalone)
```

---

## API Structure

### REST API Endpoints (`/api/*`)

#### **Public Endpoints** (No Authentication)

**Authentication**
```
POST   /api/auth/register    - User registration
POST   /api/auth/login       - User login
```

**Blogs** (Read-only)
```
GET    /api/blogs                    - List all blogs (paginated)
GET    /api/blogs/{id}               - Get single blog
Query: ?search=keyword&category=tech&per_page=10
```

**Trainers** (Read-only)
```
GET    /api/trainers                 - List all trainers (paginated)
GET    /api/trainers/{id}            - Get single trainer
Query: ?search=keyword&per_page=10
```

**Galleries** (Read-only)
```
GET    /api/galleries                - List all galleries (paginated)
GET    /api/galleries/{id}           - Get single gallery (with photos)
Query: ?search=keyword&per_page=10
```

**Programs** (Read-only)
```
GET    /api/programs                 - List all programs (paginated)
GET    /api/programs/{id}            - Get single program (with courses)
Query: ?search=keyword&category=school&per_page=10
```

**Courses** (Read-only)
```
GET    /api/courses                  - List all courses (paginated)
GET    /api/courses/{id}             - Get single course
GET    /api/courses/programs/list    - Get programs for dropdown
Query: ?search=keyword&program=1&level=beginner&featured=1&per_page=10
```

**File Upload**
```
POST   /api/upload      - Upload file (multipart/form-data)
DELETE /api/upload      - Delete file
```

#### **Protected Endpoints** (Requires Bearer Token)

**Authentication**
```
POST   /api/auth/logout    - Logout (revoke token)
GET    /api/auth/user      - Get authenticated user
POST   /api/auth/refresh   - Refresh access token
```

**Enrollments** (Read-only)
```
GET    /api/enrollments               - List user enrollments
GET    /api/enrollments/{id}          - Get single enrollment
GET    /api/enrollments/options/list  - Get options for forms
Query: ?search=keyword&status=active&is_paid=1&per_page=10
```

### Web Routes (`/`)

**Public Routes**
```
GET    /                   - Welcome page
GET    /login              - Login page
GET    /register           - Registration page
GET    /forgot-password    - Password reset request
GET    /reset-password     - Password reset form
```

**Authenticated Routes** (Dashboard)
```
GET    /dashboard          - Main dashboard
GET    /verify-email       - Email verification prompt

Resources (Full CRUD):
GET    /blogs              - List blogs
GET    /blogs/{id}/edit    - Edit blog
POST   /blogs              - Create blog
POST   /blogs/{id}         - Update blog (POST with multipart)
DELETE /blogs/{id}         - Delete blog

GET    /trainers           - List trainers
GET    /trainers/{id}/edit - Edit trainer
POST   /trainers           - Create trainer
POST   /trainers/{id}      - Update trainer
DELETE /trainers/{id}      - Delete trainer

GET    /galleries          - List galleries
GET    /galleries/{id}/edit- Edit gallery
POST   /galleries          - Create gallery
POST   /galleries/{id}     - Update gallery
DELETE /galleries/{id}     - Delete gallery

GET    /programs           - List programs
GET    /programs/{id}/edit - Edit program
POST   /programs           - Create program
POST   /programs/{id}      - Update program
DELETE /programs/{id}      - Delete program

GET    /courses            - List courses
GET    /courses/{id}/edit  - Edit course
POST   /courses            - Create course
POST   /courses/{id}       - Update course
DELETE /courses/{id}       - Delete course

GET    /enrollments        - List enrollments
GET    /enrollments/{id}/edit - Edit enrollment
POST   /enrollments        - Create enrollment
POST   /enrollments/{id}   - Update enrollment
DELETE /enrollments/{id}   - Delete enrollment
```

**Settings Routes** (Authenticated)
```
GET    /settings/profile      - Profile settings
PATCH  /settings/profile      - Update profile
DELETE /settings/profile      - Delete account

GET    /settings/password     - Password settings
PUT    /settings/password     - Update password

GET    /settings/appearance   - Appearance settings

GET    /settings/two-factor   - 2FA settings
```

---

## Frontend Structure

### Directory Layout

```
resources/js/
├── app.tsx                    # Inertia app entry point
├── ssr.tsx                    # Server-side rendering entry
│
├── actions/                   # Auto-generated API client functions (Wayfinder)
│   ├── App/Http/Controllers/
│   │   ├── Api/              # API controller actions
│   │   └── Auth/             # Auth controller actions
│   └── Laravel/              # Laravel package actions
│
├── components/               # Reusable React components
│   ├── ui/                   # Shadcn UI components (Radix-based)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── table.tsx
│   │   ├── badge.tsx
│   │   └── ... (30+ components)
│   ├── app-header.tsx        # Application header
│   ├── app-sidebar.tsx       # Sidebar navigation
│   ├── breadcrumbs.tsx       # Breadcrumb navigation
│   ├── rich-text-editor.tsx  # WYSIWYG editor
│   └── ...
│
├── hooks/                    # Custom React hooks
│   ├── use-appearance.tsx    # Dark/light mode
│   └── ...
│
├── layouts/                  # Page layout components
│   ├── app-layout.tsx        # Main app layout (with sidebar)
│   ├── auth-layout.tsx       # Auth pages layout
│   ├── app/
│   │   ├── app-sidebar-layout.tsx
│   │   └── app-header-layout.tsx
│   ├── auth/
│   │   ├── auth-card-layout.tsx
│   │   ├── auth-simple-layout.tsx
│   │   └── auth-split-layout.tsx
│   └── settings/
│       └── layout.tsx
│
├── pages/                    # Inertia page components
│   ├── welcome.tsx           # Landing page
│   ├── dashboard.tsx         # Dashboard page
│   ├── auth/                 # Authentication pages
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── forgot-password.tsx
│   │   └── ...
│   ├── blogs/
│   │   ├── index.tsx         # List blogs
│   │   └── components/
│   │       ├── add.tsx       # Add blog dialog
│   │       ├── edit.tsx      # Edit blog dialog
│   │       ├── delete.tsx    # Delete confirmation
│   │       └── view.tsx      # View blog details
│   ├── trainers/
│   ├── galleries/
│   ├── programs/
│   ├── courses/
│   ├── enrollments/
│   └── settings/
│       ├── profile.tsx
│       ├── password.tsx
│       ├── appearance.tsx
│       └── two-factor.tsx
│
├── routes/                   # Auto-generated type-safe routes (Wayfinder)
│   ├── index.ts              # Main route exports
│   ├── blogs/index.ts
│   ├── trainers/index.ts
│   └── ...
│
├── types/                    # TypeScript type definitions
│   └── index.d.ts            # Shared types (User, Auth, NavItem, etc.)
│
├── lib/                      # Utility functions
│   └── utils.ts              # cn() function (clsx + tailwind-merge)
│
└── wayfinder/
    └── index.ts              # Wayfinder route helpers
```

### Key Frontend Technologies

#### **Inertia.js**
- Bridges Laravel backend with React frontend
- Provides SPA experience without building an API
- Server-side routing with client-side rendering
- Automatic form handling and validation

#### **Laravel Wayfinder**
- Generates type-safe route helpers from Laravel routes
- Provides autocomplete for routes in TypeScript
- Example:
  ```typescript
  import { blogs } from '@/routes'
  
  // Type-safe route with autocomplete
  blogs.index().url           // '/blogs'
  blogs.show(5).url           // '/blogs/5'
  blogs.update(5).method      // 'post'
  ```

#### **Shadcn UI + Radix UI**
- Component library built on Radix UI primitives
- Fully accessible, customizable components
- Tailwind CSS styling
- Copy-paste components (not npm dependency)

#### **State Management**
- Uses Inertia.js shared data for global state
- React hooks for local state
- No Redux/Zustand needed

---

## Authentication & Authorization

### Multi-Layer Authentication System

#### 1. **Laravel Fortify** (Base Authentication)
```php
Features:
- Login / Logout
- Registration
- Email verification
- Password reset
- Two-factor authentication (2FA)
```

#### 2. **Laravel Sanctum** (API Authentication)
```php
Features:
- Token-based API authentication
- SPA authentication (stateful)
- Personal access tokens
- Token abilities (permissions)

Guards:
- web: Session-based (Inertia.js pages)
- sanctum: Token-based (API requests)
```

#### 3. **Session Management**
```php
Driver: cookie (can be redis/database)
Lifetime: 120 minutes
Secure: true (HTTPS only in production)
SameSite: lax
```

### Authentication Flow

**Web (Inertia.js)**
```
1. User visits /login
2. Fortify handles credentials validation
3. Session created with CSRF token
4. Redirect to /dashboard
5. Middleware checks session on each request
```

**API (Sanctum)**
```
1. POST /api/auth/login with credentials
2. Validate credentials
3. Generate personal access token
4. Return token in JSON response
5. Client includes token in Authorization header:
   "Authorization: Bearer {token}"
6. Sanctum middleware validates token
```

### Middleware Stack

**Web Routes**
```php
HandleAppearance::class           // Dark/light mode preference
HandleInertiaRequests::class      // Shared Inertia data
AddLinkHeadersForPreloadedAssets  // Performance optimization
```

**API Routes**
```php
auth:sanctum                      // Token authentication
throttle:api                      // Rate limiting (60 req/min)
```

### Two-Factor Authentication (2FA)

```php
Implementation: Laravel Fortify
Method: TOTP (Time-based One-Time Password)
Features:
- QR code generation
- Recovery codes (8 codes)
- Challenge on login
```

---

## File Storage

### Storage Configuration

```php
Default Disk: local

Disks:
1. local
   - Root: storage/app/private
   - Visibility: private
   - Use: Internal files

2. public
   - Root: storage/app/public
   - URL: /storage
   - Visibility: public
   - Use: User uploads (images, documents)
   - Symbolic link: public/storage → storage/app/public

3. s3 (Optional)
   - Driver: AWS S3
   - Configuration: .env variables
```

### File Upload API

**New Feature**: Standalone file upload endpoint

```php
Endpoint: POST /api/upload
Features:
- Automatic filename slugification
- Unique name generation (appends -1, -2, etc.)
- No database operations
- Local storage in public/uploads/
- Returns file URL

Upload Flow:
1. Receive file
2. Slugify filename: "My Document!.pdf" → "my-document.pdf"
3. Check uniqueness: if exists → "my-document-1.pdf"
4. Store in storage/app/public/uploads/
5. Return URL: http://domain.com/storage/uploads/my-document.pdf
```

### File Handling in Models

All models with file paths include URL accessors:

```php
Blog::image_url          // http://domain.com/storage/blogs/image.jpg
Trainer::photo_url       // http://domain.com/storage/trainers/photo.jpg
GalleryPhoto::photo_url  // http://domain.com/storage/galleries/photo.jpg
```

---

## Key Features

### 1. **Content Management**
- Blogs with categories, images, and rich text
- Trainer profiles with photos and expertise
- Photo galleries with sortable images
- Full CRUD via dashboard
- Public read-only API

### 2. **Educational Programs**
- Hierarchical structure: Programs → Courses
- Multiple program categories
- Course levels and featured courses
- Duration tracking
- Filterable and searchable

### 3. **Student Enrollment**
- User-course relationship tracking
- Enrollment status (active/completed/dropped)
- Payment tracking
- Enrollment date tracking

### 4. **Rich Text Editing**
- Custom WYSIWYG editor
- Formatting options (bold, italic, lists, headings)
- HTML output
- Keyboard shortcuts (Ctrl+B, Ctrl+I, etc.)

### 5. **Appearance System**
- Dark/light mode toggle
- User preference stored in cookies
- Consistent theming across app
- OKLCH color system

### 6. **Search & Filtering**
- Client-side debounced search
- Server-side filtering
- Pagination with query persistence
- Customizable per-page limits

### 7. **Type-Safe Routing**
- Laravel Wayfinder integration
- TypeScript route definitions
- Autocomplete in IDE
- Compile-time route validation

### 8. **Server-Side Rendering (SSR)**
- Inertia.js SSR enabled
- Improved SEO
- Faster initial page load
- Node server on port 13714

---

## Development Workflow

### Setup Commands

```bash
# Backend setup
composer install
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan storage:link

# Frontend setup
npm install
npm run build

# Development
composer dev          # Runs server + queue + vite concurrently
composer dev:ssr      # Runs with SSR (server + queue + pail + ssr)

# Testing
composer test         # Runs Pest tests
npm run types         # TypeScript type checking
npm run lint          # ESLint
npm run format        # Prettier formatting
```

### Git Workflow

```bash
# Project uses Git
# Ignore: vendor/, node_modules/, public/build/, storage/, .env
```

### Database

```
Default: SQLite (database/database.sqlite)
Supports: MySQL, PostgreSQL, SQL Server
Migrations: Located in database/migrations/
Factories: For all models (testing/seeding)
```

### Environment Variables

```env
APP_NAME=Laravel
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=sqlite

SANCTUM_STATEFUL_DOMAINS=localhost,localhost:3000
SESSION_DRIVER=cookie
SESSION_LIFETIME=120

VITE_APP_NAME="${APP_NAME}"
```

---

## Configuration

### Important Config Files

#### **Laravel**
```
config/app.php         - App name, timezone, locale
config/auth.php        - Guards, providers, passwords
config/database.php    - DB connections
config/filesystems.php - Storage disks
config/sanctum.php     - API auth settings
config/fortify.php     - Auth features
config/inertia.php     - SSR settings
```

#### **Frontend**
```
vite.config.ts         - Build configuration
tsconfig.json          - TypeScript settings
eslint.config.js       - Linting rules
components.json        - Shadcn UI config
```

#### **Styling**
```
resources/css/app.css  - Tailwind config, theme variables
- Uses OKLCH color space
- Custom CSS variables
- Dark mode support
```

---

## Project Insights

### Strengths
✅ Modern tech stack (Laravel 12, React 19, TypeScript)  
✅ Type-safe routing with Wayfinder  
✅ Dual interface (Dashboard + API)  
✅ Server-side rendering for performance  
✅ Comprehensive authentication (session + token)  
✅ Accessible UI components (Radix UI)  
✅ Dark mode support  
✅ Mobile-responsive design  
✅ Rich text editing  
✅ File upload handling  
✅ Testing infrastructure (Pest)  
✅ Code quality tools (ESLint, Prettier, Pint)  

### Architecture Decisions
- **Inertia.js over separate SPA**: Reduces complexity, uses server routing
- **Sanctum for API**: Lightweight, Laravel-native solution
- **SQLite default**: Easy development, can scale to MySQL/PostgreSQL
- **Monolithic over microservices**: Simpler deployment, faster development
- **Component-based pages**: Reusable dialogs for CRUD operations
- **Public API read-only**: Content consumption without modification
- **SSR enabled**: Better SEO and initial load performance

### Security Features
- CSRF protection (web routes)
- Token authentication (API routes)
- Password hashing (bcrypt)
- Email verification
- Two-factor authentication
- Rate limiting
- Secure session cookies
- Input validation
- SQL injection protection (Eloquent ORM)
- XSS protection (React escaping)

---

## Future Considerations

### Potential Enhancements
1. **File Upload API**
   - Add virus scanning
   - Implement CDN integration (S3/CloudFront)
   - Add file type restrictions
   - Implement rate limiting

2. **API**
   - Add API versioning (v1, v2)
   - Implement GraphQL endpoint
   - Add webhook support
   - Create API documentation (OpenAPI/Swagger)

3. **Features**
   - Real-time notifications (Laravel Echo + Pusher)
   - Advanced analytics dashboard
   - Course progress tracking
   - Certificate generation
   - Payment gateway integration
   - Email campaigns
   - Quiz/assessment system

4. **Performance**
   - Implement Redis caching
   - Add database query optimization
   - Image optimization pipeline
   - Lazy loading for large lists
   - CDN for static assets

5. **DevOps**
   - Docker containerization
   - CI/CD pipeline (GitHub Actions)
   - Automated testing
   - Performance monitoring (New Relic, Sentry)
   - Backup automation

---

## Version Information

```
Laravel:        12.0
PHP:            8.2+  (Currently 8.1.10 - needs upgrade)
React:          19.0.0
TypeScript:     5.7.2
Node:           Latest LTS
Database:       SQLite (dev), MySQL/PostgreSQL (production)
```

---

## Documentation References

- Laravel: https://laravel.com/docs/12.x
- Inertia.js: https://inertiajs.com
- React: https://react.dev
- Tailwind CSS: https://tailwindcss.com
- Radix UI: https://radix-ui.com
- Laravel Sanctum: https://laravel.com/docs/12.x/sanctum
- Laravel Fortify: https://laravel.com/docs/12.x/fortify
- Wayfinder: https://github.com/laravel/wayfinder

---

*This document provides a comprehensive understanding of the Abhidh Backend application architecture, technologies, and implementation patterns.*






