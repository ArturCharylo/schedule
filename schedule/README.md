# Schedule

A professional, multi-tenant scheduling application built with a modern web stack. It provides a sleek "iOS Native" Glassmorphism UI, allowing users to manage recurring lessons, one-time events, holidays, and exceptions. The application is designed to be fully multi-tenant, utilizing Supabase Row Level Security (RLS) for data isolation.

## Features

- **Multi-tenant Architecture:** Secure data isolation per user with Supabase Authentication and Row Level Security (RLS).
- **Recurring Lessons:** Schedule weekly recurring lessons tied to specific days of the week.
- **One-time Events:** Add specific, non-recurring events to the calendar.
- **Holidays & Exceptions:** Define global holidays and specific exceptions (e.g., cancelling a single instance of a recurring lesson).
- **Interactive Timeline View:** A visual timeline spanning from 07:00 to 22:00 with absolute positioning and overlap calculation logic.
- **Modern UI/UX:** An elegant "iOS Native" and Glassmorphism design aesthetic featuring transparency, backdrop blurs, and rounded corners.
- **Notifications:** Built-in notification system.

## Tech Stack

- **Frontend Framework:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS v4 (configured via Vite plugin), `clsx`, `tailwind-merge`
- **Icons:** `lucide-react`
- **Data Fetching & Caching:** `@tanstack/react-query` (with robust cache management for multi-tenant isolation)
- **Date Manipulation:** `date-fns`
- **Backend & Authentication:** Supabase (Database, Auth, RLS)

## Prerequisites

Before running the project locally, make sure you have:

- **Node.js** (v18 or higher recommended)
- **npm** or another package manager
- **Supabase Account** and a Supabase project set up.

## Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd <repository-directory>/schedule
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the `schedule` directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
   *Note: Ensure your Supabase project is configured with the correct tables (`lessons`, `events`, `holidays`, `lesson_exceptions`) and RLS policies mapped to `auth.users(id)`.*

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

## How It Works

### Architecture & Data Flow

- **Database Schema:**
  - `lessons`: Recurring items linked by `day_of_week`.
  - `events`: One-time items linked by a specific `date`.
  - `holidays`: Date-specific global exceptions.
  - `lesson_exceptions`: Tracks specifically cancelled instances of recurring lessons.
- **Security:** RLS policies on the Supabase backend ensure that records are only accessible to the authenticated user. A `user_id` column references `auth.users(id)`.
- **Data Fetching:** The app retrieves all relevant records from Supabase via `src/lib/api.ts`. Client-side filtering and scheduling logic is executed in a custom hook (`useSchedule.ts`).
- **Scheduling Logic:** The logic prioritizes filtering out `holidays` and `lesson_exceptions` (suppressing specific recurring instances), and then merges the remaining recurring `lessons` with one-time `events`.
- **State Management & Caching:** `@tanstack/react-query` is used to cache data. On user logout, the query client cache is cleared (e.g., `queryClient.clear()`) to maintain multi-tenant data isolation.
- **Rendering:** Core components render conditionally based on frontend session state (e.g., showing `<Auth />` vs `<App />`). The layout uses absolute positioning and custom overlap calculations defined in `src/lib/layout.ts` to display the vertical timeline view.

## Scripts

- `npm run dev`: Starts the Vite development server.
- `npm run build`: Compiles TypeScript and builds the app for production.
- `npm run lint`: Runs ESLint to check for code quality and style issues.
- `npm run preview`: Previews the production build locally.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
