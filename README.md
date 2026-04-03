# Schedule

A professional, multi-tenant scheduling application built with a modern web stack. Featuring a sleek "iOS Native" Glassmorphism UI, this application allows users to manage recurring lessons, one-time events, holidays, and exceptions intuitively.

The project is hosted and deployed on [Vercel](https://oliwia-calendar.vercel.app), providing a seamless, highly available experience out of the box.

## Functionality

- **Multi-tenant Architecture:** Secure data isolation per user. Every user gets their own private calendar and schedule via Supabase Authentication and Row Level Security (RLS).
- **Recurring Schedules:** Easily manage weekly recurring commitments like classes or meetings tied to specific days of the week.
- **One-time Events:** Add specific, non-recurring events seamlessly into the calendar.
- **Holidays & Exceptions:** Global holiday definitions and granular exception handling (e.g., cancelling a single instance of a recurring event without deleting the entire series).
- **Interactive Timeline View:** A beautifully crafted visual timeline spanning from 07:00 to 22:00, with absolute positioning and custom overlap calculation to visualize conflicts or adjacent events.
- **Modern UI/UX:** An elegant design aesthetic featuring transparency, backdrop blurs, and rounded corners for a premium feel.
- **Notifications:** Built-in system to alert users of upcoming events or changes.

## Use Cases

- **Tutors and Educators:** Manage weekly student lessons, handle sudden cancellations, and schedule one-off makeup classes.
- **Freelancers & Consultants:** Track client meetings, block out public holidays, and visualize daily availability.
- **Fitness Instructors:** Schedule weekly classes, one-on-one sessions, and manage gym/studio operational hours.
- **Small Business Teams:** A lightweight, multi-user scheduling tool to visualize daily tasks or shifts with strict data privacy for each employee.

## Technologies Used

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS v4, `clsx`, `tailwind-merge`
- **UI Icons:** `lucide-react`
- **State Management & Caching:** `@tanstack/react-query` ensures efficient data fetching and multi-tenant cache isolation.
- **Date Manipulation:** `date-fns` for accurate, timezone-aware scheduling logic.
- **Backend & Database:** Supabase (PostgreSQL, Authentication, Row Level Security).
- **Hosting:** Vercel

## Contributing

Contributions are always welcome! If you'd like to improve the application:

1. **Fork the repository** on GitHub.
2. **Clone your fork** locally: `git clone <your-fork-url>`
3. **Install dependencies:** Navigate to the `schedule` directory and run `npm install`.
4. **Create a branch:** `git checkout -b feature/your-feature-name`
5. **Make your changes:** Add features, fix bugs, or improve documentation.
6. **Test your code:** Ensure there are no linting or build errors by running `npm run lint` and `npm run build`.
7. **Commit & Push:** Commit your changes and push them to your fork.
8. **Submit a Pull Request:** Open a PR against the main repository branch.

Please ensure any new code comments are written in English and follow the existing code styles (e.g., using Tailwind CSS for all styling, maintaining the Glassmorphism aesthetic).

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
