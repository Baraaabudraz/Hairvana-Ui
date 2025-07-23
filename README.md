# Hairvana Admin Dashboard

A modern admin dashboard for managing the Hairvana platform, built with React, TypeScript, and Vite.

## Features

- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **TypeScript**: Full type safety throughout the application
- **React Router**: Client-side routing for smooth navigation
- **State Management**: Zustand for global state management
- **API Integration**: RESTful API with proper error handling
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Tailwind CSS
- **Routing**: React Router v6
- **State Management**: Zustand
- **Backend**: Node.js, Express, Sequelize
- **Database**: PostgreSQL

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Hairvana-Ui
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit ..env with your configuration
   ```

4. **Set up the database**

   ```bash
   cd backend
   npm run migrate
   npm run seed
   ```

5. **Start the development server**

   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── pages/                    # Route components
│   ├── dashboard/           # Dashboard pages
│   └── auth/               # Authentication pages
├── components/              # Reusable components
│   └── ui/                 # shadcn/ui components
├── api/                     # API functions
├── lib/                     # Utilities and helpers
├── stores/                  # Zustand stores
├── hooks/                   # Custom React hooks
└── index.css               # Global styles
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
