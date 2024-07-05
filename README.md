# ClockIt Clone Next.js

## Overview

ClockIt Clone Next.js is an employee time logging application built using Next.js 14. This application supports two types of roles: admin and user. Employees can log in with their company email address, punch in when they enter the office, and punch out when they leave. Multiple punch ins and outs are supported within the same day. Additionally, employees can request corrections for their punch times.

## Features

- **User Authentication**: Employees can log in using their company email addresses.
- **Punch In/Out**: Employees can punch in and out multiple times a day.
- **Correction Requests**: Employees can request corrections for their punch times.
- **Admin Role**: Admins can approve/reject correction requests.

## Tech Stack

- **Framework**: Next.js 14
- **UI Library**: Shadcn UI
- **Database**: PostgreSQL (with Drizzle ORM)
- **Authentication**: NextAuth.js
- **Forms**: React Hook Form with Zod for validation
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- **Node.js**: >= 18.17.0
- **Yarn**: >= 1.22.17

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/clockit-clone-nextjs.git
   cd clockit-clone-nextjs
   ```

2. Install dependencies:

   ```bash
   yarn install
   ```

3. Set up environment variables:

   Create a `.env` file in the root directory and add the required environment variables mentioned in `.env.example` file.

4. Run database migrations and seed the database:

   ```bash
   yarn db:generate
   yarn db:migrate
   yarn db:seed
   ```

### Running the Application

- Development mode:

  ```bash
  yarn dev
  ```

- Production mode:

  ```bash
  yarn build
  yarn start
  ```

### Linting and Formatting

- Lint the code:

  ```bash
  yarn lint
  ```

- Format the code:

  ```bash
  yarn format
  ```

## Scripts

- **`dev`**: Starts the development server.
- **`build`**: Builds the application for production.
- **`start`**: Starts the production server.
- **`lint`**: Lints the code using ESLint.
- **`format`**: Formats the code using Prettier.
- **`prepare`**: Sets up Husky for Git hooks.
- **`db:generate`**: Generates database migrations.
- **`db:migrate`**: Applies database migrations.
- **`db:seed`**: Seeds the database with initial data.
- **`test:e2e:dev`**: Runs end-to-end tests using Playwright in development mode.

## Dependencies

- `@hookform/resolvers`
- `@radix-ui/react-*`
- `class-variance-authority`
- `clsx`
- `date-fns`
- `drizzle-orm`
- `google-auth-library`
- `lucide-react`
- `next`
- `next-auth`
- `postgres`
- `react`
- `react-day-picker`
- `react-dom`
- `react-hook-form`
- `react-time-picker`
- `tailwind-merge`
- `tailwindcss-animate`
- `zod`

## Dev Dependencies

- `@commitlint/cli`
- `@commitlint/config-conventional`
- `@next/eslint-plugin-next`
- `@playwright/test`
- `@types/node`
- `@types/pg`
- `@types/react`
- `@types/react-dom`
- `@types/uuid`
- `@typescript-eslint/eslint-plugin`
- `dotenv`
- `drizzle-kit`
- `eslint`
- `eslint-config-next`
- `eslint-config-prettier`
- `husky`
- `lint-staged`
- `pg`
- `postcss`
- `prettier`
- `prettier-plugin-tailwindcss`
- `tailwindcss`
- `typescript`
- `uuid`

## Contact

For any inquiries, please reach out to Arun Kundu at arunkundu45837@gmail.com.