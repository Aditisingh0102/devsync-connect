# DevSync

DevSync is a frontend-first student collaboration platform for discovering projects, forming teams, sharing progress, and building a stronger portfolio for internships and real-world work.

The current codebase is designed to feel production-ready on the UI side while staying easy to connect to a backend later. It includes a polished responsive interface, theme support, profile onboarding, team and project views, notifications, and several collaboration flows.

## Key Features

- Modern landing page with animated hero and 3D visual surface
- Dark and light theme support with persistent user preference
- Onboarding flow for profile setup
- Project discovery, team pages, profile pages, and dashboard views
- Feed, follow, requests, reviews, and notifications flows
- Responsive UI built with reusable design tokens and components
- Frontend state management ready for future API integration

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui style components
- React Router
- TanStack Query
- next-themes
- Three.js
- Recharts

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm or another compatible package manager

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Preview the production build

```bash
npm run preview
```

## Available Scripts

- `npm run dev` - start the Vite development server
- `npm run build` - create a production build
- `npm run build:dev` - build using the development mode configuration
- `npm run preview` - preview the production build locally
- `npm run lint` - run ESLint across the project
- `npm run test` - run the test suite once
- `npm run test:watch` - run tests in watch mode

## Project Structure

```text
src/
	components/     reusable UI components and layout pieces
	data/           mock content and seed data used by the frontend
	hooks/          shared React hooks
	lib/            app utilities, state, and helpers
	pages/          routed screens for the app
	test/           test setup and example tests
```

## Notes

- The app currently runs as a frontend-only product and is structured so a backend can be connected later without redesigning the UI.
- Theme state is handled globally, so dark mode applies consistently across the app.
- Some data is still mocked locally to support the current demo flows.

## Build Status

The project builds successfully with `npm run build`.

## License

No license has been specified yet.
