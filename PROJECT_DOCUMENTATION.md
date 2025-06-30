# 📚 Complete Todo App Documentation

## 🎯 Project Overview

This is a full-stack Todo application built with modern web technologies. It demonstrates a complete CRUD (Create, Read, Update, Delete) application with user authentication, database integration, and a modern user interface.

### 🛠️ Tech Stack

- **Frontend**: Next.js 15 (React framework)
- **Authentication**: Clerk (user management)
- **Database**: MongoDB with Mongoose ODM
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Deployment**: Vercel-ready

---

## 📁 Project Structure & File Explanations

### 🔧 Configuration Files

#### `package.json`

```json
{
  "name": "todo_app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack", // Development server with Turbopack
    "build": "next build", // Production build
    "start": "next start", // Production server
    "lint": "next lint" // Code linting
  },
  "dependencies": {
    "@clerk/nextjs": "^6.23.1", // Authentication
    "@clerk/themes": "^2.2.52", // Clerk UI themes
    "mongodb": "^6.17.0", // MongoDB driver
    "mongoose": "^8.16.1", // MongoDB ODM
    "next": "15.3.4", // React framework
    "react": "^19.0.0", // React library
    "react-dom": "^19.0.0" // React DOM
  }
}
```

**Why these dependencies?**

- **Next.js 15**: Latest version with App Router, Server Components, and Server Actions
- **Clerk**: Provides complete authentication solution (sign-up, sign-in, user management)
- **MongoDB + Mongoose**: NoSQL database with object modeling for easier data handling
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development

#### `next.config.ts`

```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js configuration options
};

export default nextConfig;
```

**Purpose**: Configures Next.js behavior, build settings, and optimizations.

#### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "ES6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"] // Path alias for cleaner imports
    }
  }
}
```

**Purpose**: TypeScript configuration with path aliases (`@/` points to `src/`).

---

## 🎨 Styling & UI

#### `src/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Purpose**: Imports Tailwind CSS utility classes for styling the entire application.

#### `tailwindcss.config.js` & `postcss.config.mjs`

These files configure Tailwind CSS processing and optimization.

---

## 🗄️ Database Layer

### `src/lib/db.ts`

```typescript
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

let cached = (global as any).mongoose || { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: 'todoApp',
      bufferCommands: false
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;
```

**What this does:**

1. **Environment Check**: Ensures MongoDB URI exists
2. **Connection Caching**: Reuses existing database connections (important for serverless)
3. **Error Handling**: Throws descriptive errors if connection fails
4. **Configuration**: Sets database name and disables command buffering

**Why caching?** In serverless environments (like Vercel), functions are stateless. Caching prevents creating new database connections on every request.

### `src/models/Todo.ts`

```typescript
import mongoose, { Schema, Document, models } from 'mongoose';

export interface ITodo extends Document {
  title: string;
  userId: string;
  completed: boolean;
  createdAt: Date;
}

const TodoSchema = new Schema<ITodo>(
  {
    title: { type: String, required: true },
    userId: { type: String, required: true },
    completed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  },
  {
    timestamps: true // Automatically adds createdAt and updatedAt
  }
);

export const Todo = models.Todo || mongoose.model<ITodo>('Todo', TodoSchema);
```

**What this does:**

1. **TypeScript Interface**: Defines the shape of a Todo object
2. **Schema Definition**: Mongoose schema with validation rules
3. **Data Types**: String, Boolean, Date types with defaults
4. **Model Creation**: Creates or reuses existing Todo model

**Why `models.Todo ||`?** Prevents re-compilation errors in development by reusing existing models.

---

## 🔐 Authentication & Middleware

### `src/middleware.ts`

```typescript
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)'
  ]
};
```

**What this does:**

1. **Route Protection**: Clerk middleware runs on all routes
2. **File Exclusions**: Skips middleware for static files
3. **API Protection**: Ensures API routes are also protected

**How it works:** Every request passes through this middleware, which handles authentication state.

---

## ⚡ Server Actions

### `src/lib/actions.ts`

```typescript
'use server';

import { auth } from '@clerk/nextjs/server';
import connectDB from './db';
import { Todo } from '@/models/Todo';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function addTodo(formdata: FormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const title = formdata.get('title') as string;
  if (!title) {
    throw new Error('Title is required');
  }

  await connectDB();

  await Todo.create({
    title,
    userId,
    completed: false
  });

  revalidatePath('/dashboard/todos');
}

export async function toggleTodo(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  await connectDB();
  const todo = await Todo.findOne({ _id: id, userId });
  if (!todo) return;

  todo.completed = !todo.completed;
  await todo.save();

  revalidatePath('/dashboard/todos');
}

export async function deleteTodo(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  await connectDB();
  await Todo.deleteOne({ _id: id, userId });

  revalidatePath('/dashboard/todos');
}

export async function updateTodo(id: string, formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const title = formData.get('title')?.toString().trim();
  if (!title) return;

  await connectDB();
  await Todo.findOneAndUpdate({ _id: id, userId }, { title }, { new: true });

  revalidatePath('/dashboard/todos');
  redirect('/dashboard/todos');
}
```

**What are Server Actions?**
Server Actions are Next.js 15's way to run server-side code directly from client components without creating API routes.

**Key Features:**

1. **'use server'**: Marks functions to run on the server
2. **Authentication**: Each action verifies user identity
3. **Database Operations**: Direct database manipulation
4. **Revalidation**: `revalidatePath()` updates cached data
5. **Security**: User can only access their own todos

**Why Server Actions over API routes?**

- Less boilerplate code
- Type-safe
- Automatic serialization
- Better performance

---

## 🎯 API Routes (Alternative approach)

### `src/app/api/todos/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import { Todo } from '@/models/Todo';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const todos = await Todo.find({ userId }).sort({ createdAt: -1 });
    return NextResponse.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title } = await request.json();
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    await connectDB();
    const todo = await Todo.create({
      title,
      userId,
      completed: false
    });

    return NextResponse.json(todo, { status: 201 });
  } catch (error) {
    console.error('Error creating todo:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
```

**When to use API Routes vs Server Actions?**

- **API Routes**: For external API consumption, webhooks, complex logic
- **Server Actions**: For form submissions, simple CRUD operations

---

## 🎨 React Components

### `src/app/layout.tsx` (Root Layout)

```typescript
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import Header from '@/components/Header';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
});

export const metadata: Metadata = {
  title: 'Todo App',
  description: 'Full Stack Todo App with Next.js 15, MongoDB, and Clerk'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
        >
          <div className="min-h-screen">
            <div className="container mx-auto px-4">
              <Header />
            </div>
            <main>{children}</main>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
```

**What this does:**

1. **Font Loading**: Optimized Google Fonts with CSS variables
2. **Metadata**: SEO-friendly title and description
3. **Authentication**: Wraps app in ClerkProvider
4. **Layout Structure**: Consistent header and main content area
5. **Styling**: Global background and responsive container

### `src/components/Header.tsx`

```typescript
'use client';

import Link from 'next/link';
import { UserButton, SignedIn, SignedOut } from '@clerk/nextjs';

export default function Header() {
  return (
    <header className="bg-white shadow-md border-b border-gray-200 px-6 py-4 flex justify-between items-center">
      <Link
        href="/"
        className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
      >
        Todo App
      </Link>

      <div className="flex items-center gap-6">
        <SignedIn>
          <Link
            href="/dashboard/todos"
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Dashboard
          </Link>
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: 'w-8 h-8'
              }
            }}
          />
        </SignedIn>
        <SignedOut>
          <Link
            href="/sign-in"
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Sign Up
          </Link>
        </SignedOut>
      </div>
    </header>
  );
}
```

**Key Features:**

1. **Conditional Rendering**: Different UI for authenticated/unauthenticated users
2. **Clerk Components**: `SignedIn`, `SignedOut`, `UserButton` handle auth state
3. **Navigation**: Links to different app sections
4. **Responsive Design**: Tailwind classes for mobile-friendly layout

### `src/components/TodoForm.tsx`

```typescript
'use client';

import { useFormStatus } from 'react-dom';
import { addTodo } from '@/lib/actions';
import { useRef } from 'react';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? 'Adding...' : 'Add Todo'}
    </button>
  );
}

export default function TodoForm() {
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    await addTodo(formData);
    formRef.current?.reset();
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="flex gap-3 mt-4 p-4 bg-gray-50 rounded-lg"
    >
      <input
        name="title"
        placeholder="Enter a new todo..."
        className="border border-gray-300 px-4 py-2 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        required
      />
      <SubmitButton />
    </form>
  );
}
```

**Advanced Concepts:**

1. **useFormStatus**: React hook that provides form submission state
2. **useRef**: Direct DOM access for form reset
3. **Server Action Integration**: Form directly calls server function
4. **Loading States**: Disabled button and loading text during submission
5. **Accessibility**: Focus states and disabled states for better UX

### `src/components/TodoItem.tsx`

```typescript
'use client';

import { toggleTodo, deleteTodo } from '@/lib/actions';
import { useTransition } from 'react';

interface TodoItemProps {
  todo: {
    _id: string;
    title: string;
    completed: boolean;
    userId: string;
    createdAt: Date;
  };
}

export default function TodoItem({ todo }: TodoItemProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      await toggleTodo(todo._id);
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteTodo(todo._id);
    });
  };

  return (
    <li className="border rounded p-4 flex justify-between items-center bg-white shadow-sm">
      <span
        className={`flex-1 ${
          todo.completed ? 'line-through text-gray-500' : 'text-gray-900'
        }`}
      >
        {todo.title}
      </span>

      <div className="flex gap-2 ml-4">
        <button
          onClick={handleToggle}
          disabled={isPending}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            todo.completed
              ? 'bg-yellow-500 text-white hover:bg-yellow-600'
              : 'bg-green-500 text-white hover:bg-green-600'
          } disabled:opacity-50`}
        >
          {todo.completed ? 'Undo' : 'Done'}
        </button>

        <button
          onClick={handleDelete}
          disabled={isPending}
          className="px-3 py-1 bg-red-500 text-white rounded text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
        >
          Delete
        </button>

        <a
          href={`/dashboard/todos/${todo._id}`}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm font-medium hover:bg-blue-600 transition-colors"
        >
          Edit
        </a>
      </div>
    </li>
  );
}
```

**Advanced Concepts:**

1. **useTransition**: React 18 hook for handling async transitions
2. **TypeScript Props**: Strongly typed component props
3. **Conditional Styling**: Different styles based on todo state
4. **Optimistic Updates**: UI updates immediately, then syncs with server

---

## 📄 Page Components

### `src/app/page.tsx` (Home Page)

```typescript
import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';

export default async function HomePage() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to Todo App
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A modern, full-stack todo application built with Next.js 15,
            MongoDB, and Clerk authentication. Organize your tasks efficiently
            and stay productive.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {userId ? (
              <Link
                href="/dashboard/todos"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-up"
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Get Started
                </Link>
                <Link
                  href="/sign-in"
                  className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-gray-800">
                Create Tasks
              </h3>
              <p className="text-gray-600">
                Easily add new todos with a simple and intuitive interface.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-gray-800">
                Track Progress
              </h3>
              <p className="text-gray-600">
                Mark tasks as complete and track your productivity over time.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-gray-800">
                Stay Organized
              </h3>
              <p className="text-gray-600">
                Edit, delete, and manage your tasks with full CRUD
                functionality.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**What makes this special:**

1. **Server Component**: Runs on server, can access auth directly
2. **Conditional CTAs**: Different buttons for authenticated users
3. **Marketing Page**: Professional landing page design
4. **Feature Highlights**: Shows app capabilities

### `src/app/dashboard/todos/page.tsx` (Main Dashboard)

```typescript
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import { Todo } from '@/models/Todo';
import TodoForm from '@/components/TodoForm';
import TodoItem from '@/components/TodoItem';

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) return <div>Please sign in</div>;

  await connectDB();
  const todos = await Todo.find({ userId }).sort({ createdAt: -1 });

  return (
    <main className="max-w-4xl mx-auto mt-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Your Todos</h1>
      <TodoForm />
      {todos.length === 0 ? (
        <div className="mt-8 text-center py-8 text-gray-500">
          <p>No todos yet. Create your first todo above!</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {todos.map((todo) => (
            <TodoItem
              key={todo._id.toString()}
              todo={{
                _id: todo._id.toString(),
                title: todo.title,
                completed: todo.completed,
                userId: todo.userId,
                createdAt: todo.createdAt
              }}
            />
          ))}
        </ul>
      )}
    </main>
  );
}
```

**Key Concepts:**

1. **Server Component**: Fetches data on server before rendering
2. **Database Query**: Gets user's todos sorted by creation date
3. **Empty State**: Shows helpful message when no todos exist
4. **Data Transformation**: Converts MongoDB objects to plain objects

### Authentication Pages

#### `src/app/sign-in/[[...sign-in]]/page.tsx`

```typescript
import { SignIn } from '@clerk/nextjs';

export default function Page() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <SignIn />
    </div>
  );
}
```

#### `src/app/sign-up/[[...sign-up]]/page.tsx`

```typescript
import { SignUp } from '@clerk/nextjs';

export default function Page() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <SignUp />
    </div>
  );
}
```

**Why the `[[...sign-in]]` folder structure?**
This is Next.js catch-all routing. Clerk needs to handle multiple routes like:

- `/sign-in`
- `/sign-in/factor-one`
- `/sign-in/forgot-password`

---

## 🔧 Environment Configuration

### `.env.example`

```env
# MongoDB
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/todoApp?retryWrites=true&w=majority

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your-publishable-key
CLERK_SECRET_KEY=sk_test_your-secret-key

# URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

**Environment Variable Types:**

- **`NEXT_PUBLIC_`**: Available in browser (client-side)
- **No prefix**: Server-side only (more secure)

---

## 🚀 Application Flow

### 1. **User Journey**

```
1. User visits home page (/)
   ↓
2. Sees welcome message + auth buttons
   ↓
3. Clicks "Sign Up" or "Sign In"
   ↓
4. Clerk handles authentication
   ↓
5. Redirected to /dashboard/todos
   ↓
6. Can create, edit, delete, toggle todos
```

### 2. **Data Flow**

```
Client Component (TodoForm)
   ↓
Server Action (addTodo)
   ↓
Database (MongoDB)
   ↓
Revalidation (revalidatePath)
   ↓
UI Updates Automatically
```

### 3. **Authentication Flow**

```
User requests protected page
   ↓
Middleware checks auth status
   ↓
If not authenticated → redirect to sign-in
   ↓
If authenticated → continue to page
   ↓
Page checks userId on server
   ↓
Renders user-specific content
```

---

## 🎓 Key Learning Concepts

### 1. **Next.js 15 Features**

- **App Router**: File-based routing in `app/` directory
- **Server Components**: Components that run on server
- **Server Actions**: Server-side functions callable from client
- **Route Handlers**: API endpoints in `route.ts` files

### 2. **React 18+ Concepts**

- **useTransition**: Handle async operations with loading states
- **useFormStatus**: Monitor form submission status
- **Suspense**: Handle loading states declaratively

### 3. **Database Patterns**

- **Connection Pooling**: Reuse database connections
- **Schema Validation**: Mongoose ensures data integrity
- **User Isolation**: Each user only sees their data

### 4. **Authentication Patterns**

- **JWT Tokens**: Clerk manages token lifecycle
- **Route Protection**: Middleware ensures auth requirements
- **Conditional Rendering**: Different UI for auth states

### 5. **TypeScript Benefits**

- **Type Safety**: Catch errors at compile time
- **IntelliSense**: Better IDE support
- **Refactoring**: Safer code changes

---

## 🏗️ Building Similar Projects

### Project Ideas Using This Stack:

1. **Blog Platform**

   - Posts instead of todos
   - Categories and tags
   - Rich text editor

2. **Expense Tracker**

   - Expenses instead of todos
   - Categories and budgets
   - Charts and analytics

3. **Recipe Manager**

   - Recipes with ingredients
   - Categories and ratings
   - Image uploads

4. **Note Taking App**
   - Rich text notes
   - Folders and tags
   - Search functionality

### Key Patterns to Reuse:

1. **Authentication Setup** (Clerk + middleware)
2. **Database Connection** (MongoDB + Mongoose)
3. **CRUD Operations** (Server Actions)
4. **Component Structure** (Forms, items, layouts)
5. **Styling Patterns** (Tailwind classes)

---

## 🚀 Deployment Guide

### 1. **Vercel Deployment**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts to:
# - Link to GitHub repo
# - Set environment variables
# - Deploy
```

### 2. **Environment Variables in Production**

Add these in Vercel dashboard:

- `MONGODB_URI`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

### 3. **MongoDB Atlas Setup**

1. Create cluster
2. Create database user
3. Whitelist IP addresses
4. Get connection string

---

## 🐛 Common Issues & Solutions

### 1. **MongoDB Connection Error**

```typescript
// Problem: Authentication failed
// Solution: Check username/password in connection string
MONGODB_URI=mongodb+srv://username:password@cluster...
```

### 2. **Clerk Authentication Issues**

```typescript
// Problem: Clerk keys not found
// Solution: Check environment variables are set correctly
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### 3. **TypeScript Errors**

```typescript
// Problem: Module not found
// Solution: Check import paths use @ alias
import { Todo } from '@/models/Todo'; // ✅
import { Todo } from '../../../models/Todo'; // ❌
```

### 4. **Hydration Errors**

```typescript
// Problem: Server/client mismatch
// Solution: Use 'use client' for interactive components
'use client';
import { useState } from 'react';
```

---

## 📚 Further Learning Resources

### Next.js

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js Learn Course](https://nextjs.org/learn)

### React

- [React Documentation](https://react.dev)
- [React Patterns](https://reactpatterns.com)

### MongoDB

- [MongoDB University](https://university.mongodb.com)
- [Mongoose Documentation](https://mongoosejs.com/docs)

### TypeScript

- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [TypeScript with React](https://react-typescript-cheatsheet.netlify.app)

---

## 🎯 Next Steps

1. **Add Features**:

   - Todo categories/tags
   - Due dates
   - Priority levels
   - Search functionality

2. **Improve UX**:

   - Drag and drop reordering
   - Bulk operations
   - Keyboard shortcuts
   - Dark mode

3. **Optimize Performance**:

   - Add loading skeletons
   - Implement infinite scroll
   - Add caching strategies

4. **Add Testing**:
   - Unit tests with Jest
   - Integration tests with Cypress
   - API testing with Supertest

This documentation should give you a comprehensive understanding of every aspect of the Todo app and help you build similar projects! 🚀
