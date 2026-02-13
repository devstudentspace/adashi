# Adashi Dashboard

A modern dashboard application built with Next.js and Supabase.

## Features

- User authentication and authorization
- Personalized dashboard with user profile management
- Secure password management
- Email verification and password reset functionality
- Responsive design with Tailwind CSS
- Modern UI components with shadcn/ui

## Getting Started

1. First, create a Supabase project at [supabase.com](https://supabase.com)

2. Clone this repository:

   ```bash
   git clone [your-repo-url]
   cd adashi
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Copy `.env.example` to `.env.local` and update the following:

  ```env
  NEXT_PUBLIC_SUPABASE_URL=[INSERT SUPABASE PROJECT URL]
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=[INSERT SUPABASE PROJECT API PUBLISHABLE OR ANON KEY]
  GMAIL_APP_PASSWORD=[YOUR GMAIL APP PASSWORD]
  ```

  Both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` can be found in [your Supabase project's API settings](https://supabase.com/dashboard/project/_?showConnect=true)

5. Run the development server:

   ```bash
   npm run dev
   ```

   The application should now be running on [localhost:3000](http://localhost:3000/).

## Deployment

This application can be deployed to any platform that supports Next.js applications, such as Vercel, Netlify, or your own server.